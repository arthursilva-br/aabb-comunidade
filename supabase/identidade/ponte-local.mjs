import { randomBytes } from 'node:crypto';

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const caixaFicticia = /^[a-z0-9][a-z0-9._+-]*@example\.invalid$/;
const callback = 'http://127.0.0.1:5173/auth/recuperar';

export function urlLocal(valor, protocolos = ['http:']) {
  const url = new URL(valor);
  if (url.hostname !== '127.0.0.1' || !protocolos.includes(url.protocol) || !url.port) {
    throw new Error('Informe um endereço IPv4 de loopback com porta explícita.');
  }
  return url;
}

export function credencialFicticia() {
  return `A1!${randomBytes(24).toString('base64url')}`;
}

function lerClaims(token) {
  const partes = token.split('.');
  if (partes.length !== 3) throw new Error('Identidade indisponível.');
  return JSON.parse(Buffer.from(partes[1], 'base64url'));
}

export function lerSessao(token) {
  const { sub, session_id, role } = lerClaims(token);
  if (role !== 'authenticated' || !uuid.test(sub) || !uuid.test(session_id)) {
    throw new Error('Identidade indisponível.');
  }
  return { conta: sub, sessao: session_id };
}

export function criarPonteLocal({ apiUrl, chavePublica, chaveServico, sql }) {
  const origem = urlLocal(apiUrl).origin;
  if (!chavePublica || !chaveServico || chavePublica === chaveServico) {
    throw new Error('Chaves locais de Auth indisponíveis.');
  }

  async function auth(rota, { method = 'POST', body, token, admin = false } = {}) {
    const chave = admin ? chaveServico : chavePublica;
    const resposta = await fetch(`${origem}/auth/v1${rota}`, {
      method,
      headers: {
        apikey: chave,
        ...(token || admin ? { Authorization: `Bearer ${token ?? chave}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    });
    if (!resposta.ok) throw new Error(`Operação do Auth recusada (HTTP ${resposta.status}).`);
    return resposta.status === 204 ? undefined : resposta.json();
  }

  async function atorVerificado(token) {
    const usuario = await auth('/user', { method: 'GET', token });
    const ator = lerSessao(token);
    if (usuario.id !== ator.conta) throw new Error('Identidade indisponível.');
    return ator;
  }

  async function provisionar(dados, ator) {
    const email = dados.email.toLowerCase();
    if (!caixaFicticia.test(email)) throw new Error('Use uma caixa fictícia.');
    const { pessoa, unidade, papeis, aprovacao } = dados;
    const vinculo = { pessoa, unidade, papeis, aprovacao, auditoria: dados.auditoria === true,
      ator: ator?.conta, sessao: ator?.sessao };
    await sql('autorizarProvisionamento', vinculo);
    const senhaProvisoria = credencialFicticia();
    const usuario = await auth('/admin/users', {
      admin: true,
      body: { email, password: senhaProvisoria, email_confirm: true },
    });
    if (!uuid.test(usuario.id) || usuario.email !== email) throw new Error('Identidade indisponível.');
    await sql('vincular', { ...vinculo, conta: usuario.id });
    return { conta: usuario.id, senhaProvisoria };
  }

  async function autenticar(email, password) {
    email = email.toLowerCase();
    if (!caixaFicticia.test(email)) throw new Error('Identidade indisponível.');
    const anterior = await sql('identidade', { email });
    if (!anterior) throw new Error('Identidade indisponível.');
    const tokens = await auth('/token?grant_type=password', { body: { email, password } });
    const sessao = lerSessao(tokens.access_token);
    if (sessao.conta !== anterior.id || sessao.conta !== tokens.user.id) {
      throw new Error('Identidade indisponível.');
    }
    return { tokens, sessao, anterior };
  }

  const logout = (token, scope = 'local') => auth(`/logout?scope=${scope}`, { token });
  const solicitarRecuperacao = (email) => {
    if (!caixaFicticia.test(email)) throw new Error('Use uma caixa fictícia.');
    return auth(`/recover?redirect_to=${encodeURIComponent(callback)}`, { body: { email } });
  };

  return {
    // Chamada exclusivamente pelo operador local após aprovação da direção.
    bootstrap: (dados) => provisionar({ ...dados, papeis: ['diretora'], auditoria: false }, null),
    async provisionar(dados, token) {
      return provisionar({ ...dados, aprovacao: null }, await atorVerificado(token));
    },
    async login(email, senha) {
      const { tokens, sessao, anterior } = await autenticar(email, senha);
      try {
        await sql('admitir', { ...sessao, versao: anterior.versao });
        return tokens;
      } catch (erro) {
        await logout(tokens.access_token).catch(() => undefined);
        throw erro;
      }
    },
    async primeiraTroca(email, senhaAtual, novaSenha) {
      if (senhaAtual === novaSenha || novaSenha.length < 12) {
        throw new Error('A nova senha precisa ser diferente e conter ao menos 12 caracteres.');
      }
      const { tokens, sessao, anterior } = await autenticar(email, senhaAtual);
      try {
        if (!anterior.troca_pendente) throw new Error('Primeira troca indisponível.');
        await auth('/user', { method: 'PUT', token: tokens.access_token,
          body: { password: novaSenha, current_password: senhaAtual } });
      } finally {
        await logout(tokens.access_token, 'global');
      }
      await sql('concluirTroca', { ...sessao, versao: anterior.versao });
    },
    logout,
    solicitarRecuperacao,
    async recuperarSenha(token, novaSenha) {
      await atorVerificado(token);
      if (!lerClaims(token).amr?.some(({ method }) => method === 'otp')) {
        throw new Error('A redefinição precisa de uma sessão de recuperação.');
      }
      await auth('/user', { method: 'PUT', token, body: { password: novaSenha } });
      await logout(token, 'global');
    },
    async recuperacaoAssistida({ conta, unidade, identidadeVerificada, referencia }, token) {
      if (identidadeVerificada !== true) throw new Error('A identidade precisa ser verificada.');
      const ator = await atorVerificado(token);
      const email = await sql('assistirRecuperacao', { conta, unidade, contaAtor: ator.conta, sessao: ator.sessao, referencia });
      await solicitarRecuperacao(email);
    },
    async revogarFuncao(funcao, token) {
      await sql('revogar', { ...await atorVerificado(token), funcao });
    },
    async desativar(conta, token) {
      if (!uuid.test(conta)) throw new Error('Identidade indisponível.');
      const ator = await atorVerificado(token);
      await sql('desativar', { contaAtor: ator.conta, sessao: ator.sessao, conta });
      // O bloqueio operacional já foi aplicado. Se o provedor falhar, repetir o banimento.
      await auth(`/admin/users/${conta}`, { admin: true, method: 'PUT', body: { ban_duration: '876000h' } });
    },
  };
}

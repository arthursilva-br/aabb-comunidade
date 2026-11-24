import { createHash } from 'node:crypto';

export const projetoDev = 'rpjrvbuxrfvhiqbrsqmj';
export const origemDev = `https://${projetoDev}.supabase.co`;
export const uuid = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
const caixaDev = /^aabb-dev-[a-z0-9]+-[a-z0-9]+@example\.invalid$/;

export function validarAlvoDev(projeto, origem) {
  if (projeto !== projetoDev || origem !== origemDev) throw new Error('Selecione explicitamente o Supabase DEV da AABB.');
  return origemDev;
}

function emailDev(email) {
  if (typeof email !== 'string' || email.length > 200 || !caixaDev.test(email)) {
    throw new Error('Caixa fictícia do DEV inválida.');
  }
  return email;
}

function sessaoJWT(token) {
  if (typeof token !== 'string' || token.length > 16_384) throw new Error('Sessão inválida.');
  const partes = token.split('.');
  if (partes.length !== 3) throw new Error('Sessão inválida.');
  let claims;
  try { claims = JSON.parse(Buffer.from(partes[1], 'base64url')); }
  catch { throw new Error('Sessão inválida.'); }
  if (!claims || claims.role !== 'authenticated' || !uuid.test(claims.sub) || !uuid.test(claims.session_id)
    || claims.iss !== `${origemDev}/auth/v1`) throw new Error('Sessão inválida.');
  return { conta: claims.sub, sessao: claims.session_id };
}

function senhaNova(senha) {
  if (typeof senha !== 'string' || senha.length < 12 || Buffer.byteLength(senha) > 72) {
    throw new Error('Credencial de teste fora dos limites permitidos.');
  }
}

function digestRecuperacao(token) {
  if (typeof token !== 'string' || !/^[\w-]{32,256}$/.test(token)) throw new Error('Prova de recuperação inválida.');
  return createHash('sha256').update(token).digest('hex');
}

export function criarPonteHospedada({ projeto, apiUrl, chavePublicavel, chaveSecreta, sql, requisitar = fetch }) {
  const origem = validarAlvoDev(projeto, apiUrl);
  if (!/^sb_publishable_[\w-]+$/.test(chavePublicavel) || !/^sb_secret_[\w-]+$/.test(chaveSecreta)
    || typeof sql !== 'function') throw new Error('Configuração do servidor de identidade inválida.');

  async function auth(rota, { method = 'POST', body, token, admin = false } = {}) {
    let resposta;
    try {
      resposta = await requisitar(`${origem}/auth/v1${rota}`, {
        method, redirect: 'error', signal: AbortSignal.timeout(10_000),
        headers: { apikey: admin ? chaveSecreta : chavePublicavel,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch { throw new Error('Auth DEV indisponível.'); }
    if (!resposta.ok) throw new Error(`Operação Auth DEV recusada (HTTP ${resposta.status}).`);
    const texto = await resposta.text();
    if (!texto) return;
    try { return JSON.parse(texto); }
    catch { throw new Error('Resposta Auth DEV inválida.'); }
  }

  async function verificarAutor(token) {
    const sessao = sessaoJWT(token);
    const usuario = await auth('/user', { method: 'GET', token });
    if (usuario?.id !== sessao.conta) throw new Error('Sessão inválida.');
    return { ...sessao, email: emailDev(usuario.email) };
  }

  async function autenticar(email, password) {
    const tokens = await auth('/token?grant_type=password', { body: { email: emailDev(email), password } });
    const sessao = sessaoJWT(tokens?.access_token);
    if (tokens.user?.id !== sessao.conta || tokens.user.email !== email) throw new Error('Sessão inválida.');
    return { tokens, ...sessao };
  }

  async function entrar(email, senha) {
    const anterior = await sql('identidade', { email: emailDev(email) });
    if (!anterior) throw new Error('Conta indisponível.');
    const acesso = await autenticar(email, senha);
    if (acesso.conta !== anterior.id) throw new Error('Sessão inválida.');
    return { ...acesso, anterior };
  }

  const logout = (token, scope = 'local') => auth(`/logout?scope=${scope}`, { token });
  const alvo = ({ conta, sessao }, extras = {}) => ({ ...extras, ator: conta, sessao });

  async function retomarTroca(email, novaSenha) {
    senhaNova(novaSenha);
    const { conta, sessao, tokens, anterior } = await entrar(email, novaSenha);
    try {
      if (anterior.troca_pendente) await sql('provarTroca', { conta, sessao, versao: anterior.versao });
    } catch (erro) {
      await logout(tokens.access_token).catch(() => undefined);
      throw erro;
    }
    await logout(tokens.access_token, 'global');
    if (anterior.troca_pendente) await sql('concluirTroca', { conta, sessao, versao: anterior.versao });
  }

  return {
    async provisionar({ id, email, pessoa, unidade, papeis, auditoria, senhaProvisoria }, token) {
      emailDev(email);
      senhaNova(senhaProvisoria);
      if (![id, pessoa, unidade].every((valor) => uuid.test(valor))) throw new Error('Provisão DEV inválida.');
      const autor = await verificarAutor(token);
      const pedido = alvo(autor, { id, email, pessoa, unidade, papeis, auditoria: auditoria === true });
      const novo = await sql('reservar', pedido);
      if (novo) {
        try {
          await auth('/admin/users', { admin: true, body: { email, password: senhaProvisoria,
            email_confirm: true, app_metadata: { aabb_provisao: id } } });
        } catch {
          // O provedor pode ter concluído mesmo sem resposta. O SQL verifica o identificador reservado.
        }
      }
      try { return await sql('finalizar', alvo(autor, { id })); }
      catch { throw new Error('Provisão pendente. Consulte a reserva e o identificador da execução antes de repetir.'); }
    },

    async login(email, senha) {
      const { conta, sessao, tokens, anterior } = await entrar(email, senha);
      try {
        await sql('admitir', { conta, sessao, versao: anterior.versao });
        return tokens;
      } catch (erro) {
        await logout(tokens.access_token).catch(() => undefined);
        throw erro;
      }
    },

    async primeiraTroca(email, senhaAtual, novaSenha) {
      senhaNova(novaSenha);
      if (senhaAtual === novaSenha) throw new Error('A primeira troca exige uma senha diferente.');
      const { conta, sessao, tokens, anterior } = await entrar(email, senhaAtual);
      try {
        if (!anterior.troca_pendente) throw new Error('Primeira troca indisponível.');
        await sql('iniciarTroca', { conta, sessao, versao: anterior.versao });
        await auth('/user', { method: 'PUT', token: tokens.access_token,
          body: { password: novaSenha, current_password: senhaAtual } });
      } finally {
        await logout(tokens.access_token).catch(() => undefined);
      }
      await retomarTroca(email, novaSenha);
    },

    retomarTroca,

    async iniciarConfirmacaoPresenca(token) {
      const { conta, sessao } = await verificarAutor(token);
      return sql('iniciarAtividade', { conta, sessao });
    },

    async confirmarPresenca(token, desafio, senha) {
      if (!uuid.test(desafio)) throw new Error('Confirmação de atividade inválida.');
      const sessao = await verificarAutor(token);
      const prova = await autenticar(sessao.email, senha);
      try {
        if (prova.conta !== sessao.conta) throw new Error('Sessão inválida.');
        await sql('atividade', { conta: sessao.conta, sessao: sessao.sessao, prova: prova.sessao, desafio });
      } finally {
        await logout(prova.tokens.access_token);
      }
    },

    async sair(token) {
      const { conta, sessao } = await verificarAutor(token);
      await sql('sair', { conta, sessao });
      await logout(token);
    },

    async revogarFuncao(funcao, token) {
      await sql('revogar', alvo(await verificarAutor(token), { funcao }));
    },

    async desativar(conta, token) {
      if (!uuid.test(conta)) throw new Error('Conta inválida.');
      await sql('bloquear', alvo(await verificarAutor(token), { conta }));
      // O bloqueio do AABB já é efetivo mesmo se o provedor precisar de retomada.
      await auth(`/admin/users/${conta}`, { method: 'PUT', admin: true, body: { ban_duration: '876000h' } });
    },

    async gerarRecuperacaoAssistida({ conta, unidade, referencia }, token) {
      const dados = alvo(await verificarAutor(token), { conta, unidade, referencia });
      const email = emailDev(await sql('autorizarRecuperacao', dados));
      const link = await auth('/admin/generate_link', { admin: true, body: { type: 'recovery', email } });
      if ((link?.user?.id ?? link?.id) !== conta) throw new Error('Prova de recuperação inválida.');
      const prova = link?.properties?.hashed_token ?? link?.hashed_token;
      await sql('registrarRecuperacao', { ...dados, email, digest: digestRecuperacao(prova) });
      // Capacidade sigilosa. A entrega só ocorre no processo de ensaio autorizado.
      return prova;
    },

    async recuperarSenha({ conta, prova, novaSenha }) {
      senhaNova(novaSenha);
      await sql('consumirRecuperacao', { conta, digest: digestRecuperacao(prova) });
      const tokens = await auth('/verify', { body: { type: 'recovery', token_hash: prova } });
      const sessao = sessaoJWT(tokens?.access_token);
      if (sessao.conta !== conta || tokens.user?.id !== conta) throw new Error('Prova de recuperação inválida.');
      try {
        await auth('/user', { method: 'PUT', token: tokens.access_token, body: { password: novaSenha } });
      } finally {
        await logout(tokens.access_token, 'global');
      }
    },
  };
}

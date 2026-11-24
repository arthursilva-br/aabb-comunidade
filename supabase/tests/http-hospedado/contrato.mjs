import { projetoDev, validarAlvoDev, uuid } from '../../identidade/ponte-hospedada.mjs';

export function configurarEnsaio(env, modo) {
  const origem = validarAlvoDev(env.AABB_DEV_PROJETO, env.AABB_DEV_API);
  if (!['leitura', 'persistente'].includes(modo)) throw new Error('Selecione leitura ou persistente.');
  if (modo === 'persistente' && env.AABB_DEV_CONFIRMAR_ESCRITAS !== projetoDev) {
    throw new Error('Confirme as gravações no projeto DEV explícito.');
  }
  const publicavel = env.AABB_DEV_PUBLICAVEL;
  if (!/^sb_publishable_[\w-]+$/.test(publicavel)) throw new Error('Chave publicável DEV ausente ou inválida.');
  let fixture;
  try { fixture = JSON.parse(env.AABB_DEV_MANIFESTO); }
  catch { throw new Error('Manifesto fictício DEV inválido.'); }
  if (!fixture || !/^[a-z0-9]{8,24}$/.test(fixture.execucao)
    || !['unidade', 'turma', 'outraTurma', 'turmaMesmoTurno', 'aluno', 'pessoa', 'pedido', 'funcaoDupla', 'evento']
      .every((campo) => uuid.test(fixture[campo]))
    || new Set(['unidade', 'turma', 'outraTurma', 'turmaMesmoTurno', 'aluno', 'pessoa', 'pedido', 'funcaoDupla', 'evento']
      .map((campo) => fixture[campo])).size !== 9
    || !/^\d{4}-\d{2}-\d{2}$/.test(fixture.data)) throw new Error('IDs da execução fictícia inválidos.');

  const tokens = { gestora: env.AABB_DEV_JWT_GESTORA, professora: env.AABB_DEV_JWT_PROFESSORA,
    dupla: env.AABB_DEV_JWT_DUPLA, outra: env.AABB_DEV_JWT_OUTRA };
  if (Object.values(tokens).some((token) => typeof token !== 'string' || token.split('.').length !== 3)) {
    throw new Error('JWTs das quatro contas fictícias são obrigatórios.');
  }
  return { origem, publicavel, fixture, tokens,
    escrita: modo === 'persistente', excluir: modo === 'persistente' && env.AABB_DEV_CONFIRMAR_TESTE_DELETE === projetoDev };
}

export function clienteEnsaio({ origem, publicavel, escrita, excluir, fixture }, requisitar = fetch) {
  async function http(rota, { token, method = 'GET', body, schema } = {}) {
    if (!escrita && method !== 'GET') throw new Error('Modo leitura permite somente GET.');
    if (method === 'DELETE' && (!excluir || rota !== `/rest/v1/eventos_auditoria?id=eq.${fixture.evento}`)) {
      throw new Error('DELETE sem confirmação específica para o evento fictício.');
    }
    let resposta;
    try {
      resposta = await requisitar(`${origem}${rota}`, { method, redirect: 'error',
        headers: { apikey: publicavel, ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(schema ? { [method === 'GET' ? 'Accept-Profile' : 'Content-Profile']: schema } : {}),
          ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(10_000) });
    } catch { throw new Error('Falha na requisição ao DEV.'); }
    const texto = await resposta.text();
    const json = resposta.headers.get('content-type')?.includes('json');
    return { status: resposta.status, body: texto && json ? JSON.parse(texto) : null };
  }

  return {
    usuario: (token) => http('/auth/v1/user', { token }),
    rest: (rota, opcoes) => http(`/rest/v1/${rota}`, { schema: 'aabb_api', ...opcoes }),
    rpc: (nome, params, token) => http(`/rest/v1/rpc/${nome}?${new URLSearchParams(params)}`, { schema: 'aabb_api', token }),
    authPorSenha: (email, password) => http('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } }),
  };
}

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { criarPonteHospedada, origemDev, projetoDev } from '../../identidade/ponte-hospedada.mjs';
import { clienteEnsaio, configurarEnsaio } from './contrato.mjs';
import { verificarDataApi } from '../../operacao/verificar-data-api.mjs';

const conta = randomUUID();
const sessao = randomUUID();
const provaId = randomUUID();
const projeto = projetoDev;
const apiUrl = origemDev;
const email = 'aabb-dev-ensaio000-gestora@example.invalid';
const chavePublicavel = 'sb_publishable_fixture';
const chaveSecreta = 'sb_secret_fixture';
const json = (obj) => Response.json(obj);
const vazio = () => new Response(null, { status: 204 });
const senha = 'credencial-ficticia-opaca';
const jwt = (id = sessao, sub = conta) => `simulado.${Buffer.from(JSON.stringify({ sub, session_id: id,
  role: 'authenticated', iss: `${origemDev}/auth/v1` })).toString('base64url')}.simulado`;
const opcoes = { projeto, apiUrl, chavePublicavel, chaveSecreta };

test('bloqueia outros projetos, HTTP, caminhos e chaves incompatíveis', () => {
  for (const alvo of ['http://127.0.0.1', `${origemDev}/`, `${origemDev}@example.invalid`, `${origemDev}/auth/v1`]) {
    assert.throws(() => criarPonteHospedada({ ...opcoes, apiUrl: alvo, sql() {} }), /DEV/);
  }
  assert.throws(() => criarPonteHospedada({ ...opcoes, projeto: 'outro', sql() {} }), /DEV/);
  assert.throws(() => criarPonteHospedada({ ...opcoes, chaveSecreta: chavePublicavel, sql() {} }), /inválida/);
});

test('falha de verificação do usuário impede qualquer chamada SQL administrativa', async () => {
  const ponte = criarPonteHospedada({ ...opcoes,
    requisitar: async () => json({ id: randomUUID(), email }),
    sql: () => assert.fail('SQL nunca deveria ser chamado'),
  });
  await assert.rejects(ponte.revogarFuncao(randomUUID(), jwt()), /Sessão inválida/);
});

test('reserva persistente impede repetir criação quando a resposta do Auth se perde', async () => {
  const chamadas = [];
  const id = randomUUID();
  const ponte = criarPonteHospedada({ ...opcoes,
    requisitar: async (url, req) => {
      if (url.endsWith('/user')) return json({ id: conta, email });
      chamadas.push('auth');
      assert.equal(req.headers.apikey, chaveSecreta);
      assert.equal(req.headers.Authorization, undefined);
      assert.equal(req.redirect, 'error');
      assert.equal(JSON.parse(req.body).app_metadata.aabb_provisao, id);
      throw new Error('resposta perdida');
    },
    sql: async (acao, dados) => {
      assert.equal(dados.ator, conta);
      assert.equal(dados.sessao, sessao);
      assert.equal(dados.senhaProvisoria, undefined);
      chamadas.push(acao);
      if (acao === 'reservar') return chamadas.length === 1;
      if (chamadas.length === 3) throw new Error('vínculo indisponível');
      return conta;
    },
  });
  const pedido = { id, unidade: randomUUID(), pessoa: randomUUID(), email, papeis: ['professor'], senhaProvisoria: senha };
  await assert.rejects(ponte.provisionar(pedido, jwt()), /Provisão pendente/);
  assert.equal(await ponte.provisionar(pedido, jwt()), conta);
  assert.deepEqual(chamadas, ['reservar', 'auth', 'finalizar', 'reservar', 'finalizar']);
});

test('retoma primeira troca com login novo, prova SQL e logout global antes da liberação', async () => {
  const ordem = [];
  const ponte = criarPonteHospedada({ ...opcoes, requisitar: async (url) => {
    if (url.endsWith('grant_type=password')) {
      ordem.push('password');
      return json({ user: { id: conta, email }, access_token: jwt(provaId) });
    }
    assert.ok(url.endsWith('/logout?scope=global'));
    ordem.push('logout');
    return vazio();
  }, sql: async (acao, dados) => {
    ordem.push(acao);
    if (acao === 'identidade') return { id: conta, versao: 2, troca_pendente: true };
    assert.deepEqual(dados, { conta, sessao: provaId, versao: 2 });
  } });
  await ponte.retomarTroca(email, senha);
  assert.deepEqual(ordem, ['identidade', 'password', 'provarTroca', 'logout', 'concluirTroca']);
});

test('presença exige novo grant por senha e encerra a sessão auxiliar', async () => {
  const ordem = [];
  const desafio = randomUUID();
  const ponte = criarPonteHospedada({ ...opcoes, requisitar: async (url, req) => {
    if (url.endsWith('/user')) return json({ id: conta, email });
    if (url.endsWith('grant_type=password')) {
      assert.equal(JSON.parse(req.body).password, senha);
      ordem.push('password');
      return json({ user: { id: conta, email }, access_token: jwt(provaId) });
    }
    assert.equal(req.headers.Authorization, `Bearer ${jwt(provaId)}`);
    assert.ok(url.endsWith('/logout?scope=local'));
    ordem.push('logout auxiliar');
    return vazio();
  }, sql: async (acao, dados) => {
    ordem.push(acao);
    if (acao === 'iniciarAtividade') {
      assert.deepEqual(dados, { conta, sessao });
      return desafio;
    }
    assert.deepEqual(dados, { conta, sessao, prova: provaId, desafio });
  } });
  assert.equal(await ponte.iniciarConfirmacaoPresenca(jwt()), desafio);
  await ponte.confirmarPresenca(jwt(), desafio, senha);
  assert.deepEqual(ordem, ['iniciarAtividade', 'password', 'atividade', 'logout auxiliar']);
});

test('recuperação consome digest antes do Auth e rejeita usuário de outra conta', async () => {
  const prova = 'prova-local-ficticia-sem-valor-000000';
  const ponte = criarPonteHospedada({ ...opcoes, requisitar: async (url, req) => {
    assert.ok(url.endsWith('/verify'));
    assert.deepEqual(JSON.parse(req.body), { type: 'recovery', token_hash: prova });
    const outra = randomUUID();
    return json({ user: { id: outra }, access_token: jwt(provaId, outra) });
  }, sql: async (acao, dados) => {
    assert.equal(acao, 'consumirRecuperacao');
    assert.equal(dados.conta, conta);
    assert.match(dados.digest, /^[a-f0-9]{64}$/);
  } });
  await assert.rejects(ponte.recuperarSenha({ conta, prova, novaSenha: senha }), /Prova de recuperação inválida/);
});

test('modo leitura barra gravações e DELETE exige confirmação separada e ID exato', async () => {
  const fixture = { execucao: 'ensaio000', data: '2026-11-23' };
  for (const campo of ['unidade', 'turma', 'outraTurma', 'turmaMesmoTurno', 'aluno', 'pessoa', 'pedido', 'funcaoDupla', 'evento']) {
    fixture[campo] = randomUUID();
  }
  const env = { AABB_DEV_PROJETO: projeto, AABB_DEV_API: apiUrl, AABB_DEV_PUBLICAVEL: chavePublicavel,
    AABB_DEV_MANIFESTO: JSON.stringify(fixture) };
  for (const perfil of ['GESTORA', 'PROFESSORA', 'DUPLA', 'OUTRA']) env[`AABB_DEV_JWT_${perfil}`] = jwt();
  const requisitar = async () => assert.fail('nenhuma chamada permitida');
  assert.throws(() => configurarEnsaio(env, 'persistente'), /Confirme/);
  const leitura = clienteEnsaio(configurarEnsaio(env, 'leitura'), requisitar);
  await assert.rejects(leitura.authPorSenha(email, senha), /somente GET/);
  env.AABB_DEV_CONFIRMAR_ESCRITAS = projeto;
  const escrita = clienteEnsaio(configurarEnsaio(env, 'persistente'), requisitar);
  await assert.rejects(escrita.rest(`eventos_auditoria?id=eq.${fixture.evento}`, { method: 'DELETE' }), /sem confirmação/);
  env.AABB_DEV_CONFIRMAR_TESTE_DELETE = projeto;
  const confirmada = clienteEnsaio(configurarEnsaio(env, 'persistente'), requisitar);
  await assert.rejects(confirmada.rest(`eventos_auditoria?id=eq.${randomUUID()}`, { method: 'DELETE' }), /sem confirmação/);
});

test('verificação de implantação exige Data API fechada e expõe só a API aprovada no final', async () => {
  const conferir = (fase, db_schema, db_extra_search_path = '') => verificarDataApi({ projeto, apiUrl, fase,
    token: 'token-ficticio', requisitar: async (url, req) => {
      assert.equal(url, `https://api.supabase.com/v1/projects/${projeto}/postgrest`);
      assert.equal(req.method, 'GET');
      return json({ db_schema, db_extra_search_path });
    } });
  await conferir('fechada', '');
  await assert.rejects(conferir('fechada', 'public'));
  await conferir('aberta', 'aabb_api', 'extensions');
  await assert.rejects(conferir('aberta', 'aabb_api,aabb'));
  await assert.rejects(conferir('aberta', 'aabb_api', 'auth'));
});

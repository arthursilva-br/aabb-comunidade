// O runner HTTP passa este arquivo explicitamente ao Node, fora da descoberta do Vitest.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { setTimeout as esperar } from 'node:timers/promises';
import { test } from 'node:test';
import { criarPonteLocal, credencialFicticia, lerSessao, urlLocal } from '../../identidade/ponte-local.mjs';
import { criarBancoLocal } from './banco.mjs';

const { AABB_HTTP_API, AABB_HTTP_DB, AABB_HTTP_MAIL, AABB_HTTP_ANON, AABB_HTTP_SERVICE, AABB_HTTP_PSQL } = process.env;
const api = urlLocal(AABB_HTTP_API).origin;
const mail = urlLocal(AABB_HTTP_MAIL).origin;
const { executar, sql } = criarBancoLocal(AABB_HTTP_DB, AABB_HTTP_PSQL);
const ponte = criarPonteLocal({ apiUrl: api, chavePublica: AABB_HTTP_ANON, chaveServico: AABB_HTTP_SERVICE, sql });
const pessoas = Object.fromEntries(['diretora', 'supervisora', 'administrador', 'titular', 'substituto',
  'expirado', 'dupla', 'outra', 'pendente', 'recuperacaoexpirada', 'bootstrap'].map((perfil) => [perfil, {
  pessoa: randomUUID(), email: `${perfil}@example.invalid`, senha: credencialFicticia(),
}]));
const [unidade, outraUnidade, oficina, outraOficina, turma, outraTurma, turmaVespertina,
  aluno, matricula, responsavel, vinculoSubstituto] = Array.from({ length: 11 }, () => randomUUID());
const ano = 2026;
const dia = `${ano}-01-05`;
const dataHistorica = `${ano}-01-06`;

async function requisitar(url, { method = 'GET', token, body, schema } = {}) {
  const resposta = await fetch(url, {
    method, redirect: 'manual', signal: AbortSignal.timeout(10_000),
    headers: {
      apikey: AABB_HTTP_ANON,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(schema ? { [method === 'GET' ? 'Accept-Profile' : 'Content-Profile']: schema } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const texto = await resposta.text();
  return { status: resposta.status, location: resposta.headers.get('location'),
    body: texto && resposta.headers.get('content-type')?.includes('json') ? JSON.parse(texto) : texto };
}

const auth = (rota, opcoes) => requisitar(`${api}/auth/v1${rota}`, { method: 'POST', ...opcoes });
const rest = (rota, opcoes) => requisitar(`${api}/rest/v1/${rota}`, { schema: 'aabb_api', ...opcoes });
const rpc = (nome, body, token) => rest(`rpc/${nome}`, { method: 'POST', body, token });
const senhaAuth = (email, password) => auth('/token?grant_type=password', { body: { email, password } });
const renovar = (refresh_token) => auth('/token?grant_type=refresh_token', { body: { refresh_token } });
const vagas = (token, id = turma) => rpc('disponibilidade', { p_turma: id }, token);
const turmas = (token) => rpc('minhas_turmas', {}, token);
const auditoria = (token, filtro = '') => rest(`eventos_auditoria?select=*${filtro}`, { token });

function status(resposta, ...esperados) {
  assert.ok(esperados.includes(resposta.status), `HTTP ${resposta.status}, esperado ${esperados.join(' ou ')}`);
}
function vazio(resposta) {
  status(resposta, 200);
  assert.deepEqual(resposta.body, []);
}

function prepararBanco() {
  assert.equal(executar(`select exists(select from aabb.unidades union all select from auth.users);`), 'f',
    'A suíte exige uma instalação local vazia');
  console.info(`PostgreSQL ${executar('show server_version;')}`);
  executar(`begin;
    insert into aabb.unidades(id,nome,fuso) values ('${unidade}','Unidade fictícia A','UTC'),
      ('${outraUnidade}','Unidade fictícia B','UTC');
    insert into aabb.pessoas_funcionais(id,nome) values ${Object.values(pessoas)
      .map(({ pessoa }, i) => `('${pessoa}','Pessoa fictícia ${i + 1}')`).join(',')};
    insert into aabb.oficinas(id,unidade_id,nome) values ('${oficina}','${unidade}','Oficina fictícia A'),
      ('${outraOficina}','${outraUnidade}','Oficina fictícia B');
    insert into aabb.turmas(id,unidade_id,oficina_id,ano,turno,capacidade,estado,inicio_operacional) values
      ('${turma}','${unidade}','${oficina}',${ano},'matutino',10,'ativa','${dia}'),
      ('${turmaVespertina}','${unidade}','${oficina}',${ano},'vespertino',10,'ativa','${dia}'),
      ('${outraTurma}','${outraUnidade}','${outraOficina}',${ano},'matutino',7,'ativa','${dia}');
    insert into aabb.semana_turma(unidade_id,turma_id,dia_iso) values ('${unidade}','${turma}',1),('${unidade}','${turma}',2);
    insert into aabb.alunos(id,unidade_id,nome,nascimento,cpf,rg,observacoes,validado)
      values ('${aluno}','${unidade}','Aluno fictício','2015-01-01','CPF-FICTICIO','RG-FICTICIO','ANOTACAO-FICTICIA',true);
    insert into aabb.responsaveis(id,unidade_id,nome,telefone)
      values ('${responsavel}','${unidade}','Responsável fictício','CONTATO-FICTICIO');
    insert into aabb.aluno_responsavel(unidade_id,aluno_id,responsavel_id) values ('${unidade}','${aluno}','${responsavel}');
    insert into aabb.matriculas(id,unidade_id,ano,aluno_id,turma_id,estado)
      values ('${matricula}','${unidade}',${ano},'${aluno}','${turma}','ativa');
    insert into aabb.vinculos_matricula(unidade_id,ano,aluno_id,matricula_id,turma_id,inicio,aberto)
      values ('${unidade}',${ano},'${aluno}','${matricula}','${turma}','${dia}',true);
    commit;`);
}

async function ativar(perfil, papeis, token, opcoes = {}) {
  const p = pessoas[perfil];
  const dados = { pessoa: p.pessoa, email: p.email, unidade, papeis, auditoria: false, ...opcoes };
  const identidade = token ? await ponte.provisionar(dados, token) : await ponte.bootstrap(dados);
  Object.assign(p, identidade);
  if (perfil !== 'pendente') {
    await ponte.primeiraTroca(p.email, p.senhaProvisoria, p.senha);
    p.tokens = await ponte.login(p.email, p.senha);
    p.jwt = p.tokens.access_token;
  }
  return p;
}

function vincularDocentes() {
  const { titular, substituto, expirado, dupla } = pessoas;
  const vinculos = [randomUUID(), vinculoSubstituto, randomUUID(), randomUUID()];
  executar(`begin;
    insert into aabb.vinculos_docentes(id,unidade_id,turma_id,professor_id,tipo)
      select v.id::uuid,'${unidade}','${turma}',p.id,v.tipo
      from (values ('${vinculos[0]}','${titular.conta}','titular'),('${vinculos[1]}','${substituto.conta}','substituto'),
        ('${vinculos[2]}','${expirado.conta}','substituto'),('${vinculos[3]}','${dupla.conta}','adicional')) v(id,conta,tipo)
      join aabb.professores p on p.conta_id=v.conta::uuid and p.unidade_id='${unidade}';
    insert into aabb.autorizacoes_docentes(unidade_id,vinculo_id,inicio,fim) values
      ('${unidade}','${vinculos[0]}',aabb.hoje('${unidade}')-2,null),
      ('${unidade}','${vinculos[2]}',aabb.hoje('${unidade}')-2,aabb.hoje('${unidade}')-1),
      ('${unidade}','${vinculos[3]}',aabb.hoje('${unidade}')-2,null);
    commit;`);
}

async function capturarLink(email) {
  for (let tentativa = 0; tentativa < 40; tentativa++) {
    const lista = await requisitar(`${mail}/api/v1/messages`);
    status(lista, 200);
    const msg = lista.body.messages.find((m) => m.To.some((destino) => destino.Address === email));
    if (msg) {
      const html = await requisitar(`${mail}/view/${encodeURIComponent(msg.ID)}.html`);
      status(html, 200);
      const links = [...html.body.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replaceAll('&amp;', '&'));
      const link = links.find((href) => href.startsWith(`${api}/auth/v1/verify?`));
      assert.ok(link, 'Mailpit precisa capturar o link de verificação local');
      return link;
    }
    await esperar(250);
  }
  assert.fail('O e-mail de recuperação fictício não apareceu no Mailpit.');
}

async function abrirLink(link) {
  const r = await requisitar(link);
  status(r, 302, 303);
  const destino = new URL(r.location);
  assert.equal(destino.origin + destino.pathname, 'http://127.0.0.1:5173/auth/recuperar');
  return new URLSearchParams(destino.hash.slice(1));
}

test('Auth e Data API do Supabase local com JWTs emitidos pelo provedor', { timeout: 250_000 }, async (t) => {
  status(await auth('/health', { method: 'GET' }), 200);
  prepararBanco();

  await t.test('cadastro exclusivamente administrativo, troca obrigatória e novo login', async () => {
    const d = pessoas.diretora;
    const dados = { email: d.email, pessoa: d.pessoa, unidade, aprovacao: 'FICTICIO-DIRECAO-A' };
    status(await auth('/signup', { body: { email: d.email, password: d.senha } }), 400, 403, 422);
    await assert.rejects(ponte.bootstrap({ ...dados, aprovacao: '' }));
    Object.assign(d, await ponte.bootstrap(dados));
    await assert.rejects(ponte.bootstrap({ ...dados, ...pessoas.bootstrap }));
    const provisoria = await senhaAuth(d.email, d.senhaProvisoria);
    status(provisoria, 200);
    await vazio(await vagas(provisoria.body.access_token));
    await assert.rejects(ponte.login(d.email, d.senhaProvisoria));
    await assert.rejects(ponte.primeiraTroca(d.email, d.senhaProvisoria, d.senhaProvisoria));
    await ponte.primeiraTroca(d.email, d.senhaProvisoria, d.senha);
    status(await renovar(provisoria.body.refresh_token), 400, 401, 403);
    await vazio(await vagas(provisoria.body.access_token));
    status(await senhaAuth(d.email, d.senhaProvisoria), 400, 401, 403);
    const loginDireto = await senhaAuth(d.email, d.senha);
    status(loginDireto, 200);
    await vazio(await vagas(loginDireto.body.access_token));
    d.tokens = await ponte.login(d.email, d.senha);
    d.jwt = d.tokens.access_token;
    assert.deepEqual((await vagas(d.jwt)).body, [{ capacidade: 10, ocupacao: 1, vagas: 9 }]);
  });
  if (!pessoas.diretora.jwt) return;

  const expiravel = (await ponte.login(pessoas.diretora.email, pessoas.diretora.senha)).access_token;
  const { exp, iat } = JSON.parse(Buffer.from(expiravel.split('.')[1], 'base64url'));
  assert.equal(exp - iat, 120);

  await t.test('papéis e unidade são conferidos no servidor, inclusive após troca feita diretamente no Auth', async () => {
    const { diretora: d } = pessoas;
    await ativar('supervisora', ['supervisora'], d.jwt);
    await ativar('administrador', ['administrador'], d.jwt, { auditoria: true });
    await ativar('titular', ['professor'], d.jwt);
    await ativar('substituto', ['professor'], d.jwt);
    await ativar('expirado', ['professor'], d.jwt);
    await ativar('dupla', ['administrador', 'professor'], d.jwt);
    await ativar('outra', ['diretora'], undefined, { unidade: outraUnidade, aprovacao: 'FICTICIO-DIRECAO-B' });
    const pendente = await ativar('pendente', ['administrador'], d.jwt);
    const direto = await senhaAuth(pendente.email, pendente.senhaProvisoria);
    status(direto, 200);
    const novo = credencialFicticia();
    status(await auth('/user', { method: 'PUT', token: direto.body.access_token,
      body: { password: novo, data: { papel: 'diretora' } } }), 200);
    await assert.rejects(ponte.login(pendente.email, novo));
    await vazio(await vagas(direto.body.access_token));
    assert.equal(executar(`select troca_pendente from aabb.contas where id='${pendente.conta}';`), 't');
  });

  await t.test('Data API restringe perfis, projeção, escritas e auditoria', async () => {
    const { diretora: d, titular, substituto, expirado, supervisora, administrador, dupla, outra } = pessoas;
    vincularDocentes();
    const concessao = await rpc('autorizar_docente', { p_vinculo: vinculoSubstituto,
      p_inicio: executar(`select aabb.hoje('${unidade}');`), p_fim: null }, d.jwt);
    status(concessao, 200);
    substituto.concessao = concessao.body;
    status(await turmas(), 401, 403);
    status(await turmas('jwt-invalido'), 401);
    for (const schema of ['aabb', 'public', 'auth']) status(await rest('alunos', { token: titular.jwt, schema }), 406);
    status(await rest('alunos?select=cpf,rg,observacoes', { token: titular.jwt }), 404);
    status(await rest('alunos', { method: 'POST', token: d.jwt, body: { id: randomUUID(), nome: 'Tentativa fictícia' } }), 404);
    status(await rpc('abrir_sessao_verificada', { conta: titular.conta, sessao: lerSessao(titular.jwt).sessao }, titular.jwt), 404);
    status(await rpc('admitir_login', {}, titular.jwt), 404);
    status(await rpc('concluir_primeira_troca', {}, titular.jwt), 404);
    status(await rpc('registrar_atividade', {}, titular.jwt), 403, 404);
    for (const p of [d, supervisora, administrador, dupla]) {
      const r = await vagas(p.jwt);
      status(r, 200);
      assert.equal(r.body[0]?.ocupacao, 1);
      await vazio(await vagas(p.jwt, outraTurma));
    }
    await vazio(await vagas(outra.jwt));
    assert.equal((await vagas(outra.jwt, outraTurma)).body[0]?.capacidade, 7);
    for (const p of [titular, substituto, dupla]) {
      const r = await turmas(p.jwt);
      status(r, 200);
      assert.deepEqual(r.body.map((linha) => linha.turma_id), [turma]);
      const projecao = await rpc('alunos_docentes', { p_turma: turma, p_data: dia }, p.jwt);
      status(projecao, 200);
      assert.equal(projecao.body.length, 1);
      assert.equal(projecao.body[0].aluno_id, aluno);
      assert.deepEqual(Object.keys(projecao.body[0]).sort(),
        ['aluno_id', 'ano_escolar', 'bairro', 'endereco', 'escola', 'matricula_id', 'nascimento', 'nome', 'responsaveis']);
      assert.deepEqual(Object.keys(projecao.body[0].responsaveis[0]).sort(), ['nome', 'telefone']);
      for (const p_turma of [turmaVespertina, outraTurma]) {
        status(await rpc('alunos_docentes', { p_turma, p_data: dia }, p.jwt), 403);
      }
    }
    await vazio(await turmas(expirado.jwt));
    status(await rpc('alunos_docentes', { p_turma: turma, p_data: dia }, expirado.jwt), 403);
    await assert.rejects(ponte.provisionar({ ...pessoas.bootstrap, unidade, papeis: ['diretora'], auditoria: false }, titular.jwt));
    status(await auth('/admin/users', { token: titular.jwt, body: { email: pessoas.bootstrap.email, password: credencialFicticia() } }), 401, 403);
    status(await rpc('alterar_capacidade', { p_turma: turma, p_capacidade: 99 }, titular.jwt), 403);
    status(await auth('/user', { method: 'PUT', token: titular.jwt, body: { data: { papel: 'diretora' } } }), 200);
    const novoJwt = await renovar(titular.tokens.refresh_token);
    status(novoJwt, 200);
    await vazio(await vagas(novoJwt.body.access_token));
    Object.assign(titular, { tokens: novoJwt.body, jwt: novoJwt.body.access_token });
    status(await rpc('alterar_capacidade', { p_turma: outraTurma, p_capacidade: 99 }, d.jwt), 403);
    assert.equal(executar(`select capacidade from aabb.turmas where id='${outraTurma}';`), '7');
    assert.equal(executar(`select capacidade from aabb.turmas where id='${turma}';`), '10');
    status(await rpc('alterar_capacidade', { p_turma: turma, p_capacidade: 11 }, administrador.jwt), 200, 204);
    assert.equal(executar(`select capacidade from aabb.turmas where id='${turma}';`), '11');
    const gravar = await rpc('gravar_chamada', { p_turma: turma, p_data: dataHistorica, p_versao: 0,
      p_itens: [{ matricula_id: matricula, marca: 'presente' }], p_concluir: true, p_chave: randomUUID() }, titular.jwt);
    status(gravar, 200);
    assert.equal(gravar.body, 1);
    const historico = await rpc('historico_chamadas', { p_turma: turma }, substituto.jwt);
    status(historico, 200);
    assert.equal(historico.body[0]?.marca, 'presente');
    const eventos = await auditoria(d.jwt, '&entidade=eq.chamadas');
    status(eventos, 200);
    assert.ok(eventos.body.some((e) => e.autor_id === titular.conta));
    titular.evento = eventos.body.find((e) => e.autor_id === titular.conta).id;
    for (const p of [d, supervisora, administrador]) {
      const r = await auditoria(p.jwt);
      status(r, 200);
      assert.ok(r.body.length > 0 && r.body.every((e) => e.unidade_id === unidade));
      assert.ok(!/CPF-FICTICIO|RG-FICTICIO|ANOTACAO-FICTICIA/.test(JSON.stringify(r.body)));
    }
    await vazio(await auditoria(titular.jwt));
    await vazio(await auditoria(dupla.jwt));
    status(await rest(`eventos_auditoria?id=eq.${titular.evento}`, { method: 'PATCH', body: { motivo: 'alterado' }, token: d.jwt }), 403);
    status(await rest(`eventos_auditoria?id=eq.${titular.evento}`, { method: 'DELETE', token: d.jwt }), 403);
    assert.equal((await auditoria(d.jwt, `&id=eq.${titular.evento}`)).body[0]?.motivo, null);
  });

  await t.test('revogação e desativação afetam o próximo acesso e preservam autoria', async () => {
    const { diretora: d, substituto, dupla, titular } = pessoas;
    status(await rpc('revogar_docente', { p_autorizacao: substituto.concessao }, d.jwt), 200, 204);
    status(await rpc('historico_chamadas', { p_turma: turma }, substituto.jwt), 403);
    const funcao = executar(`select id from aabb.funcoes where conta_id='${dupla.conta}' and papel='administrador';`);
    await ponte.revogarFuncao(funcao, d.jwt);
    await vazio(await vagas(dupla.jwt));
    assert.deepEqual((await turmas(dupla.jwt)).body.map((linha) => linha.turma_id), [turma]);
    await ponte.desativar(titular.conta, d.jwt);
    await vazio(await turmas(titular.jwt));
    status(await renovar(titular.tokens.refresh_token), 400, 401, 403);
    status(await senhaAuth(titular.email, titular.senha), 400, 401, 403);
    assert.equal((await auditoria(d.jwt, `&id=eq.${titular.evento}`)).body[0]?.autor_id, titular.conta);
  });

  await t.test('recuperação local valida link, impede reuso e invalida a sessão antiga', async () => {
    const { diretora, supervisora: s, dupla } = pessoas;
    await assert.rejects(ponte.recuperarSenha(s.jwt, credencialFicticia()), /sessão de recuperação/);
    await assert.rejects(ponte.recuperacaoAssistida({ conta: s.conta, unidade, identidadeVerificada: false }, diretora.jwt));
    await assert.rejects(ponte.recuperacaoAssistida({ conta: s.conta, unidade, identidadeVerificada: true,
      referencia: 'VERIFICACAO-FICTICIA' }, dupla.jwt));
    await ponte.recuperacaoAssistida({ conta: s.conta, unidade, identidadeVerificada: true,
      referencia: 'VERIFICACAO-FICTICIA' }, diretora.jwt);
    const link = await capturarLink(s.email);
    const verificacao = await abrirLink(link);
    assert.equal(verificacao.get('type'), 'recovery');
    const tokenRecuperacao = verificacao.get('access_token');
    assert.ok(tokenRecuperacao);
    await vazio(await vagas(tokenRecuperacao));
    const novaSenha = credencialFicticia();
    await ponte.recuperarSenha(tokenRecuperacao, novaSenha);
    const repetido = await abrirLink(link);
    assert.equal(repetido.has('access_token'), false);
    assert.equal(repetido.get('error_code'), 'otp_expired');
    status(await senhaAuth(s.email, s.senha), 400, 401, 403);
    await vazio(await vagas(s.jwt));
    status(await renovar(s.tokens.refresh_token), 400, 401, 403);
    const atual = await ponte.login(s.email, novaSenha);
    assert.equal((await vagas(atual.access_token)).body[0]?.capacidade, 11);
    const r = await ativar('recuperacaoexpirada', ['professor'], diretora.jwt);
    await ponte.solicitarRecuperacao(r.email);
    const atrasado = await capturarLink(r.email);
    executar(`update auth.users set recovery_sent_at=clock_timestamp()-interval '1 hour' where id='${r.conta}';`);
    const recusado = await abrirLink(atrasado);
    assert.equal(recusado.has('access_token'), false);
    assert.equal(recusado.get('error_code'), 'otp_expired');
  });

  await t.test('limites de 30 minutos e 8 horas, rotação de JWT e logout', async () => {
    const d = pessoas.diretora;
    const login = () => ponte.login(d.email, d.senha);
    const inativo = await login();
    const id = lerSessao(inativo.access_token).sessao;
    const antes = executar(`update aabb.sessoes set ultima_atividade=clock_timestamp()-interval '29 minutes'
      where id='${id}' returning ultima_atividade;`);
    assert.equal((await vagas(inativo.access_token)).body[0]?.capacidade, 11);
    status(await rpc('registrar_atividade', {}, inativo.access_token), 403, 404);
    const atualizado = await renovar(inativo.refresh_token);
    status(atualizado, 200);
    assert.equal(lerSessao(atualizado.body.access_token).sessao, id);
    assert.equal(executar(`select ultima_atividade from aabb.sessoes where id='${id}';`), antes);
    executar(`update aabb.sessoes set ultima_atividade=clock_timestamp()-interval '30 minutes' where id='${id}';`);
    await vazio(await vagas(atualizado.body.access_token));
    const longa = await login();
    const longaId = lerSessao(longa.access_token).sessao;
    executar(`update aabb.contas set login_posterior_a=clock_timestamp()-interval '9 hours' where id='${d.conta}';
      update auth.sessions set created_at=clock_timestamp()-interval '479 minutes' where id='${longaId}';`);
    assert.equal((await vagas(longa.access_token)).body[0]?.capacidade, 11);
    executar(`update auth.sessions set created_at=clock_timestamp()-interval '8 hours' where id='${longaId}';`);
    await vazio(await vagas(longa.access_token));
    status(await renovar(longa.refresh_token), 400, 401, 403);
    const paraSair = await login();
    await ponte.logout(paraSair.access_token);
    await vazio(await vagas(paraSair.access_token));
    status(await renovar(paraSair.refresh_token), 400, 401, 403);
    assert.equal((await vagas((await login()).access_token)).body[0]?.capacidade, 11);
  });

  await t.test('PostgREST rejeita um JWT genuíno após expiração e tolerância de relógio', async () => {
    while (Date.now() / 1_000 < exp + 32) await esperar(Math.min(5_000, (exp + 32) * 1_000 - Date.now()));
    status(await vagas(expiravel), 401);
  });
});

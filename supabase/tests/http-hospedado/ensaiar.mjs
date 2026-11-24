import assert from 'node:assert/strict';
import { credencialFicticia } from '../../identidade/ponte-local.mjs';
import { criarBancoHospedado } from '../../identidade/banco-hospedado.mjs';
import { criarPonteHospedada } from '../../identidade/ponte-hospedada.mjs';
import { clienteEnsaio, configurarEnsaio } from './contrato.mjs';

function status(resposta, ...esperados) {
  assert.ok(esperados.includes(resposta.status), `HTTP ${resposta.status}, esperado ${esperados.join('/')}.`);
}

function vazio(resposta) {
  status(resposta, 200);
  assert.ok(Array.isArray(resposta.body) && resposta.body.length === 0, 'Esperado conjunto vazio.');
}

async function executar() {
  const env = process.env;
  const config = configurarEnsaio(env, process.argv[2]);
  const http = clienteEnsaio(config);
  const { fixture: f, tokens } = config;
  const vagas = (token, turma = f.turma) => http.rpc('disponibilidade', { p_turma: turma }, token);
  const turmas = (token) => http.rpc('minhas_turmas', {}, token);
  const alunos = (token, turma) => http.rpc('alunos_docentes', { p_turma: turma, p_data: f.data }, token);
  const auditoria = (token) => http.rest(`eventos_auditoria?id=eq.${f.evento}`, { token });

  for (const [perfil, token] of Object.entries(tokens)) {
    const r = await http.usuario(token);
    status(r, 200);
    assert.ok(r.body?.email === `aabb-dev-${f.execucao}-${perfil}@example.invalid`, 'Conta fora do manifesto de teste.');
  }

  status(await turmas(), 401, 403);
  for (const schema of ['aabb', 'auth']) status(await http.rest('alunos', { schema, token: tokens.professora }), 406);
  status(await http.rest('rpc/operar_identidade', { token: tokens.gestora }), 404);
  status(await http.rest('rpc/registrar_atividade', { token: tokens.gestora }), 404);
  const vagasGestora = await vagas(tokens.gestora);
  status(vagasGestora, 200);
  assert.ok(vagasGestora.body?.length === 1, 'Controle administrativo positivo ausente.');
  await vazio(await vagas(tokens.gestora, f.outraTurma));
  await vazio(await vagas(tokens.outra));
  const outra = await vagas(tokens.outra, f.outraTurma);
  status(outra, 200);
  assert.ok(outra.body?.length === 1, 'Controle positivo da outra unidade ausente.');
  await vazio(await vagas(tokens.professora));
  const projecao = await alunos(tokens.professora, f.turma);
  status(projecao, 200);
  const registro = projecao.body?.find((linha) => linha.aluno_id === f.aluno);
  const campos = 'aluno_id,ano_escolar,bairro,endereco,escola,matricula_id,nascimento,nome,responsaveis';
  assert.ok(registro && Object.keys(registro).sort().join(',') === campos
    && registro.responsaveis?.length > 0 && registro.responsaveis.every((r) => Object.keys(r).sort().join(',') === 'nome,telefone'),
  'Projeção docente diferente do contrato.');
  status(await alunos(tokens.professora, f.turmaMesmoTurno), 403);
  status(await alunos(tokens.professora, f.outraTurma), 403);
  assert.ok((await vagas(tokens.dupla)).body?.length === 1
    && (await turmas(tokens.dupla)).body?.some(({ turma_id }) => turma_id === f.turma), 'Dupla função não demonstrada.');
  const evento = await auditoria(tokens.gestora);
  status(evento, 200);
  assert.ok(evento.body?.length === 1 && evento.body[0].unidade_id === f.unidade, 'Controle positivo da auditoria ausente.');
  await vazio(await auditoria(tokens.professora));
  await vazio(await auditoria(tokens.outra));
  console.log('DEV: leituras, projeções e isolamento passaram.');
  if (!config.escrita) return;

  const opcoes = { projeto: env.AABB_DEV_PROJETO, apiUrl: config.origem };
  const sql = criarBancoHospedado({ ...opcoes, psql: env.AABB_DEV_PSQL, senha: env.AABB_DEV_SENHA_SQL,
    certificado: env.AABB_DEV_CA });
  const ponte = criarPonteHospedada({ ...opcoes, chavePublicavel: config.publicavel,
    chaveSecreta: env.AABB_DEV_SECRETA, sql });
  const email = `aabb-dev-${f.execucao}-nova@example.invalid`;
  const senhaProvisoria = env.AABB_DEV_SENHA_PROVISORIA;
  const senha = credencialFicticia();
  const senhaRecuperada = credencialFicticia();
  const pedido = { id: f.pedido, pessoa: f.pessoa, unidade: f.unidade, email, papeis: ['administrador'], senhaProvisoria };
  const conta = await ponte.provisionar(pedido, tokens.gestora);
  assert.ok(conta === await ponte.provisionar(pedido, tokens.gestora), 'Retry criou vínculo divergente.');
  const provisoria = await http.authPorSenha(email, senhaProvisoria);
  status(provisoria, 200);
  await vazio(await vagas(provisoria.body.access_token));
  await ponte.primeiraTroca(email, senhaProvisoria, senha);
  await vazio(await vagas(provisoria.body.access_token));
  const acesso = await ponte.login(email, senha);
  assert.ok((await vagas(acesso.access_token)).body?.length === 1, 'Novo login sem acesso administrativo esperado.');
  const desafio = await ponte.iniciarConfirmacaoPresenca(acesso.access_token);
  await ponte.confirmarPresenca(acesso.access_token, desafio, senha);
  await assert.rejects(ponte.confirmarPresenca(acesso.access_token, desafio, senha));

  const negada = await http.rest('rpc/alterar_capacidade', { token: tokens.professora, method: 'POST',
    body: { p_turma: f.turma, p_capacidade: vagasGestora.body[0].capacidade } });
  status(negada, 403);
  const patch = await http.rest(`eventos_auditoria?id=eq.${f.evento}`, { token: tokens.gestora, method: 'PATCH',
    body: { motivo: 'TENTATIVA-FICTICIA' } });
  status(patch, 403);
  if (config.excluir) status(await http.rest(`eventos_auditoria?id=eq.${f.evento}`, { token: tokens.gestora, method: 'DELETE' }), 403);
  const preservado = await auditoria(tokens.gestora);
  assert.ok(preservado.body?.length === 1 && preservado.body[0].motivo === evento.body[0].motivo, 'Auditoria alterada.');

  await ponte.revogarFuncao(f.funcaoDupla, tokens.gestora);
  await vazio(await vagas(tokens.dupla));
  assert.ok((await turmas(tokens.dupla)).body?.some(({ turma_id }) => turma_id === f.turma), 'Papel docente afetado.');

  const prova = await ponte.gerarRecuperacaoAssistida({ conta, unidade: f.unidade,
    referencia: 'ENSAIO-RECUPERACAO' }, tokens.gestora);
  await ponte.recuperarSenha({ conta, prova, novaSenha: senhaRecuperada });
  await assert.rejects(ponte.recuperarSenha({ conta, prova, novaSenha: senha }));
  await vazio(await vagas(acesso.access_token));
  const recuperado = await ponte.login(email, senhaRecuperada);
  assert.ok((await vagas(recuperado.access_token)).body?.length === 1, 'Login após recuperação indisponível.');
  await ponte.sair(recuperado.access_token);
  await vazio(await vagas(recuperado.access_token));
  const ultimo = await ponte.login(email, senhaRecuperada);
  await ponte.desativar(conta, tokens.gestora);
  await vazio(await vagas(ultimo.access_token));
  console.log('DEV: ensaio persistente concluído. A conta criada foi desativada e a trilha foi preservada.');
}

executar().catch((erro) => {
  // Erros de asserção usam mensagens próprias e nunca imprimem corpo, token ou stack.
  console.error(erro instanceof assert.AssertionError ? erro.message : 'Ensaio DEV interrompido. Confira a configuração ou o manifesto antes de repetir.');
  process.exitCode = 1;
});

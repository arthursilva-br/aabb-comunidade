import { spawnSync } from 'node:child_process';
import { urlLocal } from '../../identidade/ponte-local.mjs';

// Apenas dados de fixture. A forma em Base64 mantém os valores fora da sintaxe
// SQL e da linha de comando. Senhas e tokens do Auth não entram neste adaptador.
const commands = {
  identidade: `select to_jsonb(x) from aabb.identidade_por_email(d->>'email') x`,
  autorizarProvisionamento: `select aabb.autorizar_provisionamento((d->>'pessoa')::uuid,(d->>'unidade')::uuid,
    array(select jsonb_array_elements_text(d->'papeis')),(d->>'auditoria')::boolean,
    (d->>'ator')::uuid,(d->>'sessao')::uuid,d->>'aprovacao')`,
  vincular: `select aabb.vincular_identidade((d->>'conta')::uuid,(d->>'pessoa')::uuid,(d->>'unidade')::uuid,
    array(select jsonb_array_elements_text(d->'papeis')),(d->>'auditoria')::boolean,
    (d->>'ator')::uuid,(d->>'sessao')::uuid,d->>'aprovacao')`,
  admitir: `select aabb.admitir_login((d->>'conta')::uuid,(d->>'sessao')::uuid,(d->>'versao')::integer)`,
  concluirTroca: `select aabb.concluir_primeira_troca((d->>'conta')::uuid,(d->>'sessao')::uuid,(d->>'versao')::integer)`,
  revogar: `select aabb.revogar_funcao((d->>'conta')::uuid,(d->>'sessao')::uuid,(d->>'funcao')::uuid)`,
  desativar: `select aabb.desativar_identidade((d->>'contaAtor')::uuid,(d->>'sessao')::uuid,(d->>'conta')::uuid)`,
  assistirRecuperacao: `select to_jsonb(aabb.autorizar_recuperacao_assistida((d->>'contaAtor')::uuid,
    (d->>'sessao')::uuid,(d->>'conta')::uuid,(d->>'unidade')::uuid,d->>'referencia'))`,
};

export function criarBancoLocal(dbUrl, psql) {
  const url = urlLocal(dbUrl, ['postgres:', 'postgresql:']);
  if (!psql || url.pathname !== '/postgres' || url.search || url.hash) throw new Error('Banco descartável indisponível.');
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(PG|AABB_HTTP_)/i.test(k)));
  Object.assign(env, {
    PGHOST: url.hostname, PGPORT: url.port, PGDATABASE: 'postgres',
    PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password),
    PGCLIENTENCODING: 'UTF8', PGCONNECT_TIMEOUT: '5',
  });

  function executar(comando) {
    const r = spawnSync(psql, ['-X', '-w', '-qAt', '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=sqlstate'], {
      input: comando, env, encoding: 'utf8', timeout: 15_000, windowsHide: true,
    });
    if (r.status !== 0) throw new Error(`Comando SQL local rejeitado (${r.stderr?.match(/ERROR:\s+([0-9A-Z]{5})/)?.[1] ?? 'psql'}).`);
    return r.stdout.trim();
  }

  function sql(operacao, dados) {
    const comando = commands[operacao];
    if (!Object.hasOwn(commands, operacao)) throw new Error('Operação SQL desconhecida.');
    const entrada = Buffer.from(JSON.stringify(dados)).toString('base64');
    const resultado = executar(`select (${comando}) from (select convert_from(decode('${entrada}','base64'),'UTF8')::jsonb d) params;`);
    return resultado ? JSON.parse(resultado) : null;
  }

  return { executar, sql };
}

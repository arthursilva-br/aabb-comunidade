import { spawnSync } from 'node:child_process';
import { isAbsolute } from 'node:path';
import { validarAlvoDev } from './ponte-hospedada.mjs';

export function criarBancoHospedado({ projeto, apiUrl, psql, senha, certificado = 'system' }) {
  validarAlvoDev(projeto, apiUrl);
  if (!psql || !isAbsolute(psql) || typeof senha !== 'string' || !senha
    || (certificado !== 'system' && !isAbsolute(certificado))) throw new Error('Conexão SQL DEV incompleta.');

  const env = Object.fromEntries(Object.entries(process.env).filter(([nome]) => !/^(PG|AABB_DEV_)/i.test(nome)));
  Object.assign(env, { PGHOST: `db.${projeto}.supabase.co`, PGPORT: '5432', PGDATABASE: 'postgres',
    PGUSER: 'aabb_identidade_dev', PGPASSWORD: senha, PGSSLMODE: 'verify-full', PGSSLROOTCERT: certificado,
    PGCLIENTENCODING: 'UTF8', PGCONNECT_TIMEOUT: '5', PGOPTIONS: '-c statement_timeout=8000' });

  return (acao, dados) => {
    const parametros = Buffer.from(JSON.stringify({ acao, dados })).toString('base64');
    // \\bind envia um parâmetro no protocolo estendido. A consulta e os argumentos
    // do processo são fixos. O metacomando recebe somente caracteres Base64.
    const consulta = `select aabb.operar_identidade(j->>'acao',j->'dados')
from (select convert_from(decode($1,'base64'),'UTF8')::jsonb j) entrada
\\bind ${parametros}
\\g
`;
    const res = spawnSync(psql, ['-X', '-w', '-qAt', '-v', 'ON_ERROR_STOP=1'], {
      input: consulta, env, encoding: 'utf8', timeout: 12_000, windowsHide: true,
    });
    if (res.status !== 0) throw new Error('Comando privado de identidade DEV rejeitado.');
    try { return res.stdout.trim() ? JSON.parse(res.stdout) : null; }
    catch { throw new Error('Resposta do banco DEV inválida.'); }
  };
}

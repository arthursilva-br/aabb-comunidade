import { pathToFileURL } from 'node:url';
import { validarAlvoDev } from '../identidade/ponte-hospedada.mjs';

export async function verificarDataApi({ projeto, apiUrl, fase, token, requisitar = fetch }) {
  validarAlvoDev(projeto, apiUrl);
  if (!['fechada','aberta'].includes(fase) || typeof token !== 'string' || !token) {
    throw new Error('Informe a fase e uma autorização de leitura de configuração.');
  }
  const resposta = await requisitar(`https://api.supabase.com/v1/projects/${projeto}/postgrest`, {
    method: 'GET', headers: { Authorization: `Bearer ${token}` }, redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  });
  if (!resposta.ok) throw new Error('Configuração efetiva da Data API indisponível.');
  const { db_schema: schemas, db_extra_search_path: caminho } = await resposta.json();
  if (typeof schemas !== 'string' || typeof caminho !== 'string') throw new Error('Configuração efetiva incompleta.');
  const expostos = schemas.split(',').map((nome) => nome.trim()).filter(Boolean);
  const extras = caminho.split(',').map((nome) => nome.trim()).filter(Boolean);
  if (fase === 'fechada' && (expostos.length === 0 || expostos.join(',') === 'pg_pgrst_no_exposed_schemas')) return;
  if (fase === 'aberta' && expostos.join(',') === 'aabb_api' && extras.every((nome) => nome === 'extensions')) return;
  throw new Error('Exposição efetiva da Data API fora do esperado para a fase.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  verificarDataApi({ projeto: process.env.AABB_DEV_PROJETO, apiUrl: process.env.AABB_DEV_API,
    fase: process.argv[2], token: process.env.AABB_DEV_CONFIG_READ }).then(() => {
    console.log('Configuração da Data API compatível com a fase solicitada.');
  }).catch(() => {
    console.error('Não foi possível comprovar a exposição esperada da Data API.');
    process.exitCode = 1;
  });
}

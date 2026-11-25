# Implementação 06.2 — CI e infraestrutura mínima de agentes

Data: 24/11/2026. Status: proposta implementada em branch isolada; depende de verificações do GitHub Actions e revisão antes do merge.

## Objetivo e limites

Estabelecer qualidade reproduzível e regras para execução paralela de agentes na AABB Comunidade, **sem** desenvolver funcionalidades novas, executar migrations no Supabase hospedado, habilitar Data API, criar contas ou usar dados reais.

Referências normativas: `AGENTS.md`, `docs/decisoes-aprovadas.md` (RN-01 a RN-27), `docs/decisoes-administrativas-aprovadas.md` (AD-01 a AD-12), `docs/plano-implementacao-mvp.md` (T01–T27) e `docs/criterios-homologacao-mvp.md` (portões A e B).

## Estado verificado de partida

- `main` no commit `32aab13395a6ab46fa94df3f352c07d96a093669`.
- Seis migrations aplicadas no projeto exclusivamente DEV `rpjrvbuxrfvhiqbrsqmj`; B6 HTTP/JWT ainda pendente; Data API mantida desativada por contenção.
- `aabb_api` tem 13 RPCs; o estado verificado após a sexta migration era 0 EXECUTE para anon, 13 para authenticated. Essa observação não é uma autorização para reativação.
- Frontend demonstrativo e suítes `npm test`, `npm run build`; PostgreSQL e testes SQL locais são independentes da hospedagem.
- A migration `20261124191532_revoga_execute_anon_aabb_api.sql` exige previamente 13 grants a anon. Essa condição pode não existir quando o banco é criado apenas com as migrations, o que caracteriza risco de reprodução.

## CI introduzido

Arquivo: `.github/workflows/ci.yml`. Gatilhos: PR para main, push em main e execução manual. Permissões de workflow: `contents: read`; sem secrets, sem ambiente de implantação e sem acesso remoto ao Supabase.

1. Job **frontend**: checkout, Node 24, `npm ci`, `npm test`, `npm run build`. Falhas bloqueiam a conclusão do job.
2. Job **migrations**: PostgreSQL 17 como serviço descartável, `auth_fixture.sql`, todas as migrations em ordem nominal, verificador de privilégios, `dados_fixture.sql` e suítes `*.test.sql`. Se alguma migration falhar, a execução encerra sem declarar sucesso.
3. O teste concorrente PowerShell `matriculas_concorrencia.test.ps1` e os ensaios JWT reais **não fazem parte desta primeira pipeline**. A inclusão será planejada após o gate de reconstrução do banco passar.
4. O PostgreSQL do job é efêmero e utiliza somente dados fictícios; não está conectado ao DEV hospedado.

### Bloqueio conhecido

A sexta migration contém uma pré-condição dependente da intervenção anterior do Dashboard. O teste do banco vazio pode falhar antes da execução dos testes SQL. Isso é um resultado esperado até a correção **revisada**, não um motivo para remover o job da CI.

A solução deve garantir que bancos novos e o histórico remoto permaneçam semanticamente consistentes. Não reescrever migration já aplicada sem aprovação de estratégia; não mascarar o problema introduzindo permissão indevida a anon na fixture ou desativando o teste.

## Organização dos agentes

| Papel | Autonomia | Entrega |
| --- | --- | --- |
| Coordenador | Leitura e planejamento; distribui escopos com dependências | Plano, status e conflitos |
| Implementador frontend | Alterações somente em módulos/arquivos autorizados | Branch/PR com testes e evidências |
| Implementador backend | Contratos e código autorizados; SQL apenas preparado, nunca aplicado automaticamente no DEV | Branch/PR, testes e riscos |
| Testador | Testes e CI isolados | Resultado de regressão, cobertura de cenários e falhas |
| Auditor | Somente leitura, salvo autorização expressa | Revisão de Auth, RLS, grants e RN/AD |

Iniciar com no máximo duas alterações funcionais paralelas, um testador e um auditor de leitura. Um único agente é responsável por arquivos compartilhados e migrações durante cada rodada. Não compartilhar a mesma worktree entre implementadores.

### Modelo mínimo de tarefa

- Identificador, objetivo, autorização e dependências já cumpridas.
- RN/AD e critérios de aceitação aplicáveis.
- Arquivos/pastas permitidos e alterações proibidas.
- Testes locais e automáticos necessários.
- Branch de origem fixada e branch de trabalho isolada.
- Plano de reversão e condição de parada.
- Evidências sem segredos/dados pessoais.

### Modelo mínimo de Pull Request

- Escopo autorizado / fora do escopo.
- RN/AD aplicáveis e justificativa.
- Resumo do diff e testes executados (não alegar execução sem evidência).
- Impacto em permissões ou migrations (se houver).
- Dependências, pendências e bloqueios para homologação.
- Declaração de uso exclusivo de dados fictícios.

## Portões de integração

1. Testes e build automáticos, incluindo reconstrução do banco, devem passar. Uma verificação falha impede recomendação de merge.
2. Auditor diferente do implementador confere segurança e requisitos.
3. Merge em main é ação separada, sujeita à aprovação humana. Configurar branch protection / rulesets apenas com autorização e acesso administrativo apropriado.
4. Nenhum merge equivale a autorização de deploy, migration hospedada ou uso de dados reais.
5. Para iniciar as próximas integrações funcionais, resolver a B6 e demonstrar Auth/JWT real com escopos definidos.

## Resultado e próxima verificação

Verificar que os dois jobs realmente iniciaram no GitHub Actions, coletar URLs e logs, registrar a falha/passe de cada um e preparar uma resolução reproduzível para a sexta migration antes de liberar merge. Esta alteração não comprova execução bem-sucedida no ambiente remoto.

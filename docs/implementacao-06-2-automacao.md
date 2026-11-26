# Implementação 06.2 — CI e infraestrutura mínima de agentes

O CI de referência da PR #1 foi homologado no commit `a1b27e30582e60eef6cfd925cd7af728096701a6`. A aprovação formal independente está pendente. O merge depende de autorização humana.

## Objetivo e limites

Estabelecer verificações reproduzíveis e regras para execução paralela de agentes na AABB Comunidade. O CI usa dados fictícios, runners hospedados, token com `contents: read` e checkout sem persistência de credenciais. As verificações rodam em ambiente descartável, sem credenciais do Supabase ou ambiente de implantação.

Referências normativas — [orientações para agentes](../AGENTS.md), [RN-01 a RN-27](decisoes-aprovadas.md), [AD-01 a AD-12](decisoes-administrativas-aprovadas.md), [plano do MVP](plano-implementacao-mvp.md) e [portões A e B](criterios-homologacao-mvp.md).

## Estado de partida e limite da homologação

- A base da PR #1 é a `main` no commit `32aab13395a6ab46fa94df3f352c07d96a093669`.
- O histórico do Supabase DEV registra seis migrations aplicadas. A conferência após a sexta registrou 13 RPCs em `aabb_api`, com zero funções executáveis por `anon` e 13 por `authenticated`.
- A Data API do DEV permanece desativada por contenção. A homologação B6 com HTTP e JWT real segue pendente em etapa separada. As suítes SQL do CI usam uma fixture de Auth e exercitam os papéis no PostgreSQL.

## CI da PR #1

O workflow roda em PRs para `main`, em push para `main` e por execução manual.

| Job | Resultado no CI de referência |
| --- | --- |
| Frontend | Node 24, `npm ci`, 102 testes em quatro arquivos, `tsc --noEmit` e build Vite aprovados. [Log](https://github.com/arthursilva-br/aabb-comunidade/actions/runs/45528337529/job/138917129617) |
| PostgreSQL | PostgreSQL 17.12 descartável, reconstrução com seis migrations, verificador de privilégios e cinco suítes SQL aprovados. O teste concorrente observou uma sessão bloqueada enquanto a outra ocupava a última vaga e confirmou a integridade dos registros e da auditoria do concorrente. [Log](https://github.com/arthursilva-br/aabb-comunidade/actions/runs/45528337529/job/138917129967) |

O [CI de referência](https://github.com/arthursilva-br/aabb-comunidade/actions/runs/45528337529) testou o commit temporário `0d31309`, que combina `a1b27e3` com a base `32aab13`.

Na 06.2.5, o workflow publica o PostgreSQL em `127.0.0.1:5432` no runner e falha se faltar qualquer uma das cinco suítes obrigatórias: chamadas, identidade, identidade hospedada, matrículas ou segurança. Mantém a descoberta de suítes adicionais `*.test.sql`. A descrição da [PR #1](https://github.com/arthursilva-br/aabb-comunidade/pull/1) registra a execução correspondente à ponta após esses ajustes.

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
3. O merge em `main` depende de autorização humana. A configuração de proteção da branch e de rulesets requer autorização administrativa.
4. Deploy, migrations hospedadas e uso de dados reais exigem autorizações específicas.
5. Para iniciar as próximas integrações funcionais, resolver a B6 e demonstrar Auth/JWT real com escopos definidos.

## Histórico de execução

| Execução | Resultado e resolução |
| --- | --- |
| [45523122713](https://github.com/arthursilva-br/aabb-comunidade/actions/runs/45523122713) | Frontend aprovado. A primeira reconstrução falhou antes dos testes SQL. A 06.2.1 separou as cinco migrations iniciais da sexta para localizar a etapa que falhava. |
| [45523403399](https://github.com/arthursilva-br/aabb-comunidade/actions/runs/45523403399/job/138900676121) | As cinco iniciais passaram. A sexta falhou com `B6 privilege precondition failed: functions 13, anon 0, authenticated 13`. O verificador e as suítes SQL ficaram sem executar. A correção autorizada da 06.2.2 resolveu a falha. |
| [45526107061](https://github.com/arthursilva-br/aabb-comunidade/actions/runs/45526107061) | Os dois jobs passaram após a correção histórica. O workflow dessa execução ainda estava na versão anterior à inclusão do teste concorrente. |
| [45528020181](https://github.com/arthursilva-br/aabb-comunidade/actions/runs/45528020181/job/138916107685) | A estreia do teste concorrente no CI falhou ao encontrar dois caminhos para `psql`. O commit `a1b27e3` passou a selecionar um único executável e resolveu a falha. |
| [45528337529](https://github.com/arthursilva-br/aabb-comunidade/actions/runs/45528337529) | Os dois jobs passaram em `a1b27e3`, incluindo a disputa real de vaga. |

### Correção histórica autorizada na 06.2.2

Em 24/11/2026 o operador autorizou a correção mínima da migration `20261124191532_revoga_execute_anon_aabb_api.sql`. O original foi preservado no commit `2d8c086020fc67c18b06701f3e189e2274427a37`, blob `974d292d6ca30c72c3ed88261fb5d824e78ca1d5`. O commit `790050194ed8d71fcb4f8b2319aa724abe2cfe5c` contém a correção, blob `fddd1e5f2fdddf321bfa69b3dceff5775076b18c`. [Registro da autorização e publicação](https://github.com/arthursilva-br/aabb-comunidade/pull/1#issuecomment-7149605653)

A mudança removeu apenas a exigência de 13 grants preexistentes para `anon`. A contagem de 13 RPCs, os privilégios de `authenticated`, o `REVOKE` e a pós-condição de zero para `anon` e 13 para `authenticated` foram preservados. O SQL versionado diverge deliberadamente do arquivo aplicado historicamente no DEV. A reconstrução e o verificador de privilégios confirmaram o estado final no PostgreSQL descartável. O arquivo histórico permanece preservado para rastreabilidade. A orientação operacional é preservar o histórico do DEV e evitar reexecução ou reparo da migration aplicada.

## Parecer 06.2.4 e pendências

A revisão técnica em leitura examinou o diff contra `main` e os logs da ponta homologada. O parecer confirmou a reconstrução, os controles de RLS e grants, os testes de auditoria e a disputa de vaga. O diff revisado estava dentro do escopo de infraestrutura e da correção histórica autorizada, com dados fictícios e sem credenciais do DEV. O parecer apontou inconsistências na documentação e ausência de aprovação formal independente. A 06.2.5 corrige a documentação e vincula o parecer à PR. A aprovação formal, por revisor identificável e distinto do implementador, segue pendente.

A [API da branch `main`](https://api.github.com/repos/arthursilva-br/aabb-comunidade/branches/main) retornou `protected: false`, com proteção clássica desativada e nenhum check obrigatório. A leitura direta dos rulesets não estava disponível ao conector. Antes de liberar escrita para agentes na 06.3, verificar as regras efetivas e, com autorização, exigir PR, revisão independente e aprovação dos dois jobs. Provisionar uma worktree e uma branch por implementador, com responsável definido para arquivos compartilhados.

A preparação da PR termina com a confirmação dos dois jobs na ponta atual. A integração aguarda a aprovação formal e a autorização humana de merge. A homologação B6 segue em etapa própria.

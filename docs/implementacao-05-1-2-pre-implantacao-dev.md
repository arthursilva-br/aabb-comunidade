# Implementação 05.1.2 — Versionamento e pré-implantação do DEV

23/11/2026, horário de Brasília. Projeto `aabb-comunidade-dev`, referência `rpjrvbuxrfvhiqbrsqmj`, região `sa-east-1`, organização AABB PARACATU. Esta etapa executou inspeções remotas de leitura e testes descartáveis locais.

## Evidências

| Área | Resultado |
| --- | --- |
| Projeto e histórico | `ACTIVE_HEALTHY`, PostgreSQL 17.12 e histórico de migrations vazio na API de gerenciamento. Consulta de catálogo confirmou ausência de `aabb`, `aabb_api` e `aabb_identidade_runtime`. |
| Executor consultado | `postgres` tem `CREATEROLE`, `BYPASSRLS`, `CREATE` no banco, `USAGE` em `auth`, `REFERENCES` nos IDs de `auth.users` e `auth.sessions`, `SELECT` em ambas, `TRIGGER` em `auth.users` e `DELETE` em `auth.sessions`. `auth.uid()` e `auth.jwt()` existem. O papel da futura conexão da CLI ainda precisa ser confirmado. |
| Auth efetivo | Pendente. A integração desta sessão oferece catálogo SQL, mas não o endpoint de configuração do Auth. Não havia autorização de leitura da Management API configurada no ambiente local. |
| Data API efetiva | Pendente. `pgrst.db_schemas` não apareceu na sessão SQL nem na configuração registrada no catálogo consultado. A ausência do schema da aplicação antes da instalação não demonstra o fechamento do serviço durante o lote. |
| Supabase CLI | Ausente no PATH e em `node_modules/.bin`. Versão, ajuda local, autenticação, conexão e `db push --dry-run` ficaram sem execução. A referência oficial documenta a opção. [CLI](https://supabase.com/docs/reference/cli/supabase-db-push) |
| PostgreSQL local 17.5 | As cinco migrations foram aplicadas em banco descartável. O verificador de privilégios, cinco suítes SQL e a disputa pela última vaga passaram. O aviso do `initdb` sobre token restrito do Windows não impediu a conclusão. |
| Node e frontend | Oito testes Node com respostas simuladas, 102 testes React, TypeScript e build aprovados. O Vite manteve o aviso do chunk principal de 509,98 kB. |
| HTTP com infraestrutura real | O runner local parou na checagem de Docker e Supabase CLI. As suítes hospedadas ficaram reservadas à 05.2. |
| Revisão do pacote | Caminhos e links internos conferidos. Triagem de padrões de segredos e dados pessoais sem ocorrências nos arquivos candidatos. O conjunto contém código, configuração, testes com dados fictícios e documentação. `.env.local`, `dist/`, `output/` e `supabase/.temp/` são ignorados. RN, AD, frontend, dependências e quatro migrations publicadas permanecem sem diferenças em relação ao Git. |

## Confirmação pelo operador

Abra o [painel do projeto DEV](https://supabase.com/dashboard/project/rpjrvbuxrfvhiqbrsqmj) e confira a referência na URL antes de registrar os campos abaixo. A configuração local em `supabase/config.toml` serve de referência para a comparação.

| Tela | Evidência a registrar |
| --- | --- |
| Authentication → Sign In / Providers | Confirmar Email habilitado para o teste, cadastro público e login anônimo desabilitados, provedores ativos, confirmação de e-mail, comprimento mínimo e requisitos de caracteres, troca segura de senha e validade do código de recuperação. Registrar apenas valores e estados, sem configuração secreta. [Checklist do Auth](https://supabase.com/docs/guides/security/production-checklist) |
| Authentication → Sessions e Settings → JWT Keys | Registrar TTL do JWT no campo de expiração, onde exibido, rotação de refresh e limites de inatividade e duração disponíveis. Controles nativos de limite de sessão exigem Pro ou superior. No Free, a autorização de operações protegidas depende também do controle no banco da aplicação. [Sessões](https://supabase.com/docs/guides/auth/sessions) |
| Authentication → URL Configuration e Email | Conferir URL do site, redirects permitidos e se há canal SMTP de ensaio. Se a recuperação for testada apenas por prova gerada via Auth Admin, registrar que a entrega por e-mail segue pendente. |
| Project Settings → Data API | Registrar `Enable Data API`, `Exposed schemas` e `Extra search path`. Após autorização 05.2, manter a API fechada antes do DDL e conferir novamente antes de reabrir. [Configuração da Data API](https://supabase.com/dashboard/project/rpjrvbuxrfvhiqbrsqmj/integrations/data_api/settings) |

Também é possível confirmar a configuração por `GET /v1/projects/{ref}/config/auth` e `GET /v1/projects/{ref}/postgrest` com autorização de leitura limitada ao DEV. Filtrar a resposta Auth aos campos necessários antes de registrar a evidência. O verificador `supabase/operacao/verificar-data-api.mjs` usa o segundo endpoint. [Auth](https://supabase.com/docs/reference/api/v1-get-auth-service-config) · [PostgREST](https://supabase.com/docs/reference/api/v1-get-postgrest-service-config)

## Roteiro para a 05.2

1. Fixar o commit local revisado. Conferir organização, referência, região, banco e ausência de divergências no histórico. Registrar a versão da CLI oficial e consultar `supabase link --help`, `supabase migration list --help` e `supabase db push --help`. Autenticar com autorização institucional e fornecer credenciais pelo mecanismo seguro da CLI. Conferir o alvo associado ao checkout, sem gravar credenciais em arquivo versionado ou histórico de comandos.
2. Confirmar Auth e Data API efetivos. Pelo executor selecionado, confirmar o papel obtido na conexão e seus privilégios. No executor e versão escolhidos, comprovar em ambiente descartável que a prévia não grava histórico nem objetos, inclusive em banco sem tabela de histórico. Confirmar o comportamento de registro de versões com arquivos que declaram `BEGIN` e `COMMIT`. Executar no DEV somente a prévia confirmada como não destrutiva. Comparar sua lista às cinco versões abaixo.
3. Após autorização 05.2, fechar a Data API no painel. Comprovar com `node supabase/operacao/verificar-data-api.mjs fechada` e verificar a indisponibilidade da superfície REST pelo gateway. Um erro de conexão ou uma chave inválida não prova fechamento. Manter um único operador durante a aplicação.
4. Aplicar o lote versionado, sem seed, nesta ordem:
   1. `20261118000100_fundacao.sql`
   2. `20261118000200_matriculas.sql`
   3. `20261118000300_chamadas.sql`
   4. `20261118000400_acesso_auditoria.sql`
   5. `20261123000100_integracao_identidade.sql`
5. Se houver falha, manter a API fechada. Registrar horário, versão com erro e mensagem redigida. Confrontar o histórico com os objetos e seus donos em `pg_namespace`, `pg_class`, `pg_proc`, `pg_policy`, `pg_roles` e `pg_trigger`. O primeiro marcador é a fundação com `aabb.contas`; depois aparecem `aabb.matriculas`, `aabb.chamadas`, a view de auditoria e, por fim, a ponte privada e o gatilho de credenciais. A presença de um marcador orienta o diagnóstico e deve ser comparada com todo o DDL e as ACLs daquela versão. Se o catálogo comprovar rollback completo e as versões anteriores estiverem coerentes, corrigir a causa e repetir apenas o saldo pendente. Se houver divergência entre DDL e histórico, suspender retries e preparar reconciliação explícita. Marcar uma versão só após comprovar equivalência integral e obter autorização para reparar o histórico. Manter autoria e histórico preservados. Evitar reset, remoção em massa e fixtures simuladas de Auth.
6. Com a API fechada, conferir as cinco versões e executar `psql -X -v ON_ERROR_STOP=1 -f supabase/operacao/verificar-privilegios.sql` na conexão do proprietário. Conferir também no catálogo os triggers `trilha` nas tabelas esperadas de `aabb`, ligados a `aabb.auditar()`, além de `aabb_invalidar_por_credencial` em `auth.users`. A falha de qualquer conferência mantém a API fechada. Preparar o login restrito da ponte segundo a [05.1.1](implementacao-05-1-1-bloqueios-supabase.md), conferir sua conexão com TLS e repetir a verificação de privilégios.
7. Liberar somente `aabb_api` e executar `node supabase/operacao/verificar-data-api.mjs aberta`. Homologar com JWTs reais e fixtures próprias do DEV, primeiro em modo leitura. Após a autorização de escrita, testar primeira troca, isolamento por papel/unidade/turma, projeção docente, revogação, logout, recuperação, inatividade, limite absoluto, auditoria e bloqueio de escritas indevidas. Registrar também disputa pela última vaga e retentativas. Usar os modos e critérios da [05.1.1](implementacao-05-1-1-bloqueios-supabase.md). A fixture `auth_fixture.sql` pertence ao cluster local descartável.

Para autorizar a aplicação, ainda é preciso fixar o commit, confirmar os parâmetros efetivos de Auth e Data API e validar a CLI, sua conexão e a prévia. A checagem da API fechada é condição do primeiro DDL. A matriz com Auth real, as fronteiras de sessão e o comportamento de revogação são critérios de aceite após a aplicação. Uso operacional e dados reais permanecem sujeitos aos portões institucionais das AD-09 a AD-12.

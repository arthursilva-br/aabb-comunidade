# Implementação 05 — Supabase Auth e Data API

O texto abaixo registra a entrega inicial. Para a quinta migration revisada, a retirada da RPC de atividade e os fluxos de homologação hospedada, consulte a [Implementação 05.1.1](implementacao-05-1-1-bloqueios-supabase.md).

**Resultado em 23/11/2026 — entrega parcial.** As cinco migrations e os testes SQL passaram no PostgreSQL 17.5, com a estrutura Auth simulada pela fixture da Implementação 04. A suíte integrada está versionável. A execução parou na verificação inicial porque Supabase CLI e Docker estavam indisponíveis. Nenhum teste HTTP com JWT real foi executado.

## Arquitetura e permissões

O stack local previsto reúne PostgreSQL 17, Supabase Auth (GoTrue), PostgREST e Mailpit, atrás do gateway Supabase. A configuração expõe `aabb_api`. O schema `aabb` contém tabelas e operações privadas. Os papéis do sistema são consultados no PostgreSQL a cada operação protegida. Os JWTs estabelecem a identidade e a sessão, enquanto as funções e concessões válidas de cada unidade determinam o acesso. Metadados editáveis pelo usuário ficam fora dessa decisão.

A migration `20261123000100_integracao_identidade.sql` acrescenta o cadastro funcional e os comandos privados de identidade. As quatro migrations publicadas na Implementação 04 permanecem intactas. Uma pessoa funcional pode existir sem conta. Uma conta vincula o UUID de `auth.users` a uma pessoa funcional, que pode ter vários papéis. Um professor histórico pode continuar sem conta. Registros anteriores sem pessoa associada continuam válidos. Não há criação automática de contas históricas.

`supabase/identidade/ponte-local.mjs` é uma biblioteca de servidor de homologação. O runner a chama diretamente e guarda as chaves locais apenas no processo de teste. A ponte aceita apenas loopback e caixas `example.invalid`. A chave de serviço é exclusiva das chamadas administrativas do Auth. As operações de negócio dos testes usam o JWT da diretora, supervisora, administrador ou professor. A ponte recebe um adaptador SQL confiável, que usa `psql` e o acesso do operador no ensaio descartável. A implantação de uma identidade de banco com privilégios mínimos e de um serviço acessível pelo frontend fica para etapa própria.

## Bootstrap, primeiro acesso e recuperação

1. O operador simula a indicação da primeira diretora com uma referência fictícia. O banco trava a unidade e recusa novo bootstrap se já houver algum vínculo administrativo, inclusive inativo. Não há senha ou conta padrão. Para contas seguintes, a ponte consulta `/auth/v1/user` com o JWT do gestor. O banco confere a sessão e a função vigente na unidade antes da criação no Auth e novamente antes de consolidar os vínculos.
2. A Auth Admin API cria a identidade e confirma a caixa fictícia. A ponte gera uma senha provisória individual aleatória. O vínculo funcional, os papéis e a trilha de autorização são escritos na mesma transação SQL. Se o vínculo falhar depois da criação no Auth, a identidade fica sem acesso ao AABB. O operador deve reconciliar a tentativa local antes de reutilizar a mesma caixa. A ponte não apaga automaticamente identidades.
3. A conta nasce com troca pendente. O JWT provisório e o JWT obtido diretamente no Auth ficam sem sessão operacional. A ponte autentica a senha atual, pede a atualização no Auth e encerra globalmente as sessões. O SQL só conclui a primeira troca se houver mudança da versão da credencial e a sessão provisória já tiver sido removida. A liberação exige novo login por senha pela ponte. Ela confere a mesma versão de credencial antes e depois do grant do Auth, além do UUID, do vínculo e do início da sessão. Uma alteração direta de senha no Auth invalida as sessões operacionais, mas mantém pendente a primeira troca até a conclusão do procedimento confiável.
4. Na recuperação por e-mail, o Auth emite um link de uso único com validade configurada de 15 minutos. A aplicação reconhece um novo login por senha após a redefinição. O trigger em `auth.users` invalida o acesso operacional anterior no momento da alteração. A ponte encerra as sessões do Auth após redefinir a senha. A recuperação assistida requer gestor com sessão vigente, unidade autorizada e verificação de identidade pelo operador. A trilha registra a referência da verificação e o responsável. A caixa fica no Mailpit local e a credencial anterior não é revelada.

## Sessões, logout e revogação

O JWT dura cinco minutos na configuração de desenvolvimento. Ele é uma credencial assinada e pode conservar validade criptográfica após o logout. A sessão do Auth mantém a capacidade de renovação. A autorização efetiva do AABB exige também uma sessão operacional vinculada, uma conta ativa com troca concluída e as permissões atuais. O PostgREST aplica tolerância de relógio ao validar JWTs, por isso a suíte aguarda a expiração de um token emitido pelo Auth mais essa tolerância. [Sessões do Supabase](https://supabase.com/docs/guides/auth/sessions) · [JWT no PostgREST](https://docs.postgrest.org/en/stable/references/auth.html)

O Auth declara `30m` de inatividade e `8h` de duração máxima. A verificação do banco aplica os limites de tempo em cada operação. A renovação do JWT e as consultas periódicas não modificam `ultima_atividade`. A Implementação 05 retirou a permissão `EXECUTE` do cliente na RPC `registrar_atividade`. Como a ponte desta etapa não prolonga a sessão com interação da interface, o acesso operacional dura até 30 minutos do login, inclusive se houver interação. A integração do frontend deve definir a atividade verificada pelo servidor antes de permitir prolongamento, preservando a duração absoluta de oito horas.

O logout executado pelo Auth remove a sessão de que o acesso operacional depende. A revogação de turma e de função é aplicada na próxima consulta e deixa intactas as outras permissões vigentes. Desativar bloqueia a conta e remove suas sessões em uma transação SQL, mantendo a autoria. A ponte também solicita o bloqueio da identidade no Auth. Uma falha nesse último passo exige repetir a operação e o bloqueio do AABB já permanece aplicado.

## Reproduzir os testes no Windows

```powershell
pwsh -NoProfile -File supabase/tests/run.ps1
pwsh -NoProfile -File supabase/tests/http/run.ps1
npm.cmd test
npm.cmd run build
```

A suíte HTTP exige Supabase CLI compatível com a seção `[local_smtp]`, Docker local em execução, Node e `psql`. Cria projeto e rede exclusivos com publicação em loopback, copia a configuração e as migrations, valida os parâmetros efetivos dos containers e usa apenas as chaves obtidas desse projeto. Ela reduz o JWT para 120 segundos para testar sua expiração real e aumenta o limite de logins apenas no ambiente descartável. Ao terminar, encerra apenas o projeto criado para o ensaio. As portas locais padrão do stack precisam estar livres. [Desenvolvimento local Supabase](https://supabase.com/docs/guides/local-development) · [Configuração da CLI](https://supabase.com/docs/guides/local-development/cli/config)

| Verificação | Resultado nesta sessão |
| --- | --- |
| PostgreSQL 17.5, quatro arquivos de testes SQL e disputa concorrente de vaga | Aprovados. A fixture simula as estruturas e claims do Auth. |
| Node 24.21.0, npm 11.19.0, PowerShell 7.6.9, Vitest 5.1.0 e Vite 8.3.8 | 102 testes React aprovados. TypeScript e build aprovados. Permanece o aviso preexistente sobre o chunk principal de 509,98 kB. |
| Supabase CLI, imagens do Docker, PostgREST e Mailpit | Indisponíveis nesta sessão. A execução terminou antes de criar o stack. Versões, parâmetros efetivos e compatibilidade do trigger com o Auth real seguem pendentes. |
| Matriz HTTP e JWT real | Suíte escrita. Cobre provisório e login direto no Auth, perfis e unidades, projeção docente, autorização expirada ou revogada, RPCs, tentativas de alterar auditoria, metadados editáveis, troca e recuperação, refresh, logout, desativação e expiração. Aguarda execução. |

Na revisão estática, foram conferidos o uso de `search_path` fixo, os privilégios SQL, o isolamento das chaves, a trilha de autoria, a diferença entre sessão Auth e autorização do AABB e o desligamento da RPC pública de atividade. Referências consultadas no ECC 2.2.3 foram `postgres-patterns` e `security-review`. A compatibilidade dos endpoints, dos grants e dos códigos HTTP depende da execução integrada.

## Próximo portão

Concluir a matriz HTTP no stack local e corrigir divergências antes de iniciar a integração React. A etapa React deve começar por login, primeira troca, recuperação e sessões, seguida de um fluxo de leitura com dados fictícios e de uma operação transacional. Uso de dados reais, carga de 2026, rematrícula de 2027 e implantação continuam sujeitos às autorizações e aos portões institucionais aplicáveis.

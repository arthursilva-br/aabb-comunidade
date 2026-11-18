# Implementação 04 — fundação PostgreSQL e Supabase

## Escopo e fontes

Esta entrega introduz um backend independente do demonstrativo React. A integração deve substituir os comandos em memória por RPCs por operação. Uma gravação de matrícula ocorre integralmente em uma transação do banco. O seletor de perfil, as datas e os registros demonstrativos continuam exclusivos do demonstrativo.

As referências são [RN-01 a RN-27](decisoes-aprovadas.md), [AD-01 a AD-12](decisoes-administrativas-aprovadas.md), [escopo](lancamento-mvp-escopo.md), [plano de implementação](plano-implementacao-mvp.md), [plano de migração](plano-migracao-2026-2027.md) e [critérios de homologação](criterios-homologacao-mvp.md). A fronteira no dia de uma movimentação e a representação da espera expirada continuam sujeitas às ressalvas do documento oficial. Uma movimentação com possível impacto em chamada concluída exige revisão. A RPC recusa essa operação enquanto falta o fluxo administrativo de revisão.

## Modelo e instalação

Aplicar os arquivos SQL de `supabase/migrations/` em ordem crescente, em base isolada que forneça as tabelas e funções de identidade do Supabase. A numeração identifica a ordem de instalação. Mudanças posteriores em versões já distribuídas devem ganhar nova migration.

| Migration | Conteúdo |
| --- | --- |
| 20261118000100_fundacao | Unidade/fuso, cadastro permanente, responsáveis e vínculos, contas, papéis, sessões, professores, controle de fonte/lote/linha e estrutura da auditoria |
| 20261118000200_matriculas | Oficinas, turmas anuais, dias da semana e exceções, matrícula, períodos de vínculo, movimentos e espera |
| 20261118000300_chamadas | Vínculo docente histórico, concessão vigente, chamada versionada, presença, justificativas, histórico de correções, autorização excepcional e controle de repetição |
| 20261118000400_acesso_auditoria | Controle de sessão, captura de eventos, privilégios finais, políticas de leitura e consulta de auditoria |

O ID da matrícula identifica o ingresso anual. A transferência preserva esse ID, encerra um período na origem e abre outro no destino. O reingresso cria outro ID. FKs compostas verificam unidade e ano nos vínculos. Um índice parcial protege a matrícula ativa única. Datas históricas, capacidade e situação desconhecidas admitem nulo onde aplicável. A concessão docente pertence a um vínculo funcional e exige autorização expressa. Um professor histórico pode existir sem conta. Um lote identifica a versão da fonte e cada linha tem identidade própria dentro do lote. A carga, a reconciliação e a aprovação final de lotes aguardam a etapa de importação.

## Autenticação e limites de confiança

A infraestrutura de identidade deve fornecer `auth.users`, `auth.sessions`, `auth.uid()` e `auth.jwt()`. A API autentica o JWT antes de atribuir o papel SQL da requisição. O navegador deve receber apenas a chave pública apropriada. As funções leem a identidade e a sessão verificadas pelo gateway. Conexões SQL com possibilidade de definir claims ou trocar de papel são reservadas ao operador de confiança.

`aabb` contém tabelas privadas. `aabb_api` é o único schema configurado para a Data API local. As escritas são RPCs com argumentos de negócio e `search_path` fixo. Seu proprietário pode ultrapassar RLS, por isso cada comando revalida as permissões no banco. O proprietário das migrations deve ser controlado pelo operador e inacessível ao cliente. A aplicação não recebe escrita direta. Todas as tabelas privadas têm RLS. Tabelas internas sem política permissiva permanecem fechadas. A view de auditoria usa os privilégios do invocador.

| Identidade | Operações e condições |
| --- | --- |
| Anônimo ou conta sem sessão liberada | Sem dados operacionais. As funções protegidas negam o comando ou retornam conjunto vazio |
| Professora ou professor | Função ativa na unidade, conta associada e concessão vigente na turma. A leitura anual de chamadas inclui o histórico anterior ao início da substituição |
| Diretora e supervisora | Administração por unidade e consulta da trilha. A confirmação direta que exige direção na AD-03 está implementada pelo papel diretora |
| Administrador autorizado | Operações administrativas da unidade. A trilha exige também a concessão específica de auditoria |
| Operador de identidade | Provisionamento com Auth, validação de troca de senha, desativação no provedor e ativação do acesso SQL. A ponte de serviço e o fluxo de recuperação precisam ser integrados |

O serviço deverá verificar a pessoa e seu e-mail antes de criar a conta individual. Na primeira implantação, a direção indica formalmente a primeira administradora. O operador autorizado cria uma identidade por meio da API administrativa do Auth, confere o UUID e a unidade e insere conta e função em transação privilegiada. A conta começa com troca pendente. A implantação deve conservar a aprovação e a identidade individual do operador. Nunca usar uma senha fixa de bootstrap ou derivar papel de metadados editáveis pelo usuário.

O serviço confiável deve confirmar a troca no provedor, revogar a sessão provisória, atualizar a conta e exigir novo login. Somente após esse login pode chamar a função privada `abrir_sessao_verificada`. O cliente não pode criar o registro de liberação. Desativação e retorno à troca pendente invalidam os registros locais. A mudança de situação fixa o instante mínimo de novo login. Logout, desativação no Auth, assistência administrativa com verificação de identidade, e-mail, redirects e eventual MFA dependem da integração posterior.

As operações protegidas verificam a conta, o vínculo entre usuário e sessão do Auth, a data original do login (8 h) e a última atividade aceita (30 min). A interface deverá registrar interação real por `registrar_atividade()`; polling e renovação de JWT não devem prolongá-la. A função recusa renovar uma sessão vencida. O serviço deverá revalidar todos os fatores em novo login. Os limites SQL protegem os dados desta aplicação. A configuração de Auth está em `supabase/config.toml` e requer ensaio com o provedor local completo. [Documentação de sessões do Supabase](https://supabase.com/docs/guides/auth/sessions)

## Contratos para a próxima integração

| Operação | Contrato e efeito |
| --- | --- |
| Consultar vagas | `disponibilidade(turma)` informa capacidade, ocupação e vagas. A confirmação reconta sob bloqueio |
| Matricular / rematricular / reingressar | `movimentar_matricula(chave,operacao,aluno,turma,...)`. Usar `matricular` para ingresso anual e `reingressar` após desligamento no mesmo ano. Exige cadastro validado e completo |
| Transferir / desligar | Mesmo comando com a matrícula atual. Para transferir, informar destino e origem esperada. No desligamento, informar a turma de origem. A autoria vem da sessão |
| Espera e capacidade | `solicitar_espera`, `encerrar_espera` e `alterar_capacidade`. A promoção informa a solicitação em `movimentar_matricula`. Seleção fora da ordem exige motivo. Reduzir abaixo da ocupação exige confirmação da direção |
| Autorizar professor | `autorizar_docente` e `revogar_docente` atuam sobre o vínculo funcional. A revogação preserva as assinaturas anteriores |
| Consultar como professor | `minhas_turmas`, `alunos_docentes(turma,data)` e `historico_chamadas(turma)`. A projeção contém IDs de contexto e a lista pessoal aprovada na AD-05. Documentos e anotações administrativas ficam fora da projeção |
| Salvar ou concluir | `gravar_chamada(turma,data,versao,itens,concluir,chave)`. Começar em versão zero. Cada item contém matrícula, marca e justificativa opcional. Enviar a lista nominal completa. A versão retornada acompanha a próxima edição |
| Corrigir frequência | `corrigir_frequencia(chamada,matricula,versao,marca,justificativa,motivo,chave)`. Guarda valores anteriores e posteriores. Após encerramento exige concessão `permitir_correcao` por chamada, professor e validade, consumida em uma correção |

Conservar a chave de requisição nas retentativas de uma mesma intenção. Reuso divergente falha. Transações de matrícula travam o aluno e as turmas afetadas em ordem determinística. A confirmação de chamada compartilha a trava da turma e revalida o conjunto elegível. O isolamento de escrita previsto é READ COMMITTED. Diante de conflito de revisão ou de turma de origem, o cliente deve buscar novamente o estado e pedir nova conferência. Datas de negócio usam o fuso da unidade. Mudanças com fronteira ambígua na mesma data podem bloquear a chamada da turma até revisão. O marco digital é armazenado para a futura apuração de pendências.

## Auditoria

Triggers na mesma transação registram operação, entidade, UUID, instante, ator SQL, usuário autenticado e origem. Para cadastros pessoais guardam os nomes dos campos alterados. Para dados operacionais há uma lista explícita de valores anteriores/posteriores. Motivos devem descrever a decisão operacional sem inserir documentos ou informações pessoais desnecessárias. A tabela de correções guarda o detalhe anterior e posterior da marca e da justificativa. A auditoria de conta e sessão é associada às unidades vinculadas; eventos técnicos anteriores ao primeiro vínculo ficam reservados ao operador. A trilha guarda o ID da conta no lugar do identificador de sessão. Papel de aplicação não tem privilégios de edição, exclusão ou truncamento. O proprietário do banco permanece uma fronteira de confiança. Logs de login malsucedido, recuperação, exportação e retenção dependem dos serviços que produzirão esses eventos.

## Executar em desenvolvimento

No Windows, com PowerShell 7 e os binários do PostgreSQL 17 instalados, executar na raiz:

```powershell
pwsh -File supabase/tests/run.ps1
npm.cmd test
npm.cmd run build
```

O parâmetro `-PgBin` aceita outro diretório dos binários. O runner cria cluster vazio em diretório descartável ignorado pelo Git, exige SCRAM e escuta apenas em loopback. Aplica migrations e fixtures fictícias, executa os arquivos `*.test.sql` e `*.test.ps1` e encerra o servidor. A fixture Auth fornece somente o contrato SQL mínimo para o teste. É exclusiva do runner. A disputa de vaga utiliza dois processos psql e observa a espera pela trava antes de liberar o primeiro commit.

Para homologação do stack completo, utilizar somente uma instância local descartável da CLI e Docker, com as portas locais livres, e `supabase start` na raiz. As migrations ficam no diretório padrão e o seed está desativado. Confirmar o inventário de schemas expostos e ensaiar pela Data API com JWTs emitidos pelo Auth. Não aplicar as fixtures do runner a um projeto Supabase. Não usar link, deploy ou push remoto nesse procedimento.

## Estado e portões seguintes

- **Implementado e testado em 18/11/2026** — PostgreSQL 17.5 aplicou as quatro migrations a um cluster vazio. Passaram `matriculas.test.sql`, `chamadas.test.sql`, `seguranca.test.sql` e `matriculas_concorrencia.test.ps1`. Duas conexões de administradores diferentes disputaram a última vaga. A segunda aguardou uma trava, recebeu “Turma sem vaga” após o primeiro commit e a conferência encontrou uma única ocupação. A regressão passou nos 102 testes existentes e no build com TypeScript. O Vite informou chunk principal de 509,98 kB. Não houve mudança em `src/` nem nas dependências.
- **Preparado para homologação integrada** — configuração Auth/Data API, cadastro exclusivamente administrativo, limites de sessão e projeções. Validar JWT real, chamadas HTTP, logout, recuperação, e-mail e comportamento da CLI com as versões escolhidas.
- **Integração posterior** — adaptadores React, serviço de provisionamento e gestão de contas, CRUD administrativo, encerramento anual, revisão de vigências/retroatividade, importação com aprovação e exportações. A base modela entidades e estados desses fluxos. A conta administrativa não recebe acesso SQL irrestrito ao navegador.
- **Bloqueado institucionalmente** — AD-09, primeira pessoa administradora, infraestrutura e orçamento, política de retenção, cópia independente, restauração com RPO/RTO medidos, homologação conjunta e piloto segundo AD-11/12. A carga 2026 e as rematrículas 2027 dependem de autorização própria.

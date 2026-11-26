# Orientações para agentes

## Escopo atual

Este repositório contém a documentação, o frontend demonstrativo das Implementações 01, 02, 03, 03.1 e 03.2 e a fundação PostgreSQL e Supabase entregue na Implementação 04. Em 24/11/2026 foram aplicadas seis migrations no Supabase DEV `rpjrvbuxrfvhiqbrsqmj`, mas a homologação HTTP/JWT da Implementação 05.2 não foi concluída. A Data API permanece desligada por decisão de contenção, após correção de privilégios de `anon`. Consulte `docs/implementacao-05-1-1-bloqueios-supabase.md` e `docs/implementacao-06-2-automacao.md` para histórico, bloqueios e fluxo de desenvolvimento. Nenhuma API hospedada está liberada para testes com dados reais.
As RN-01 a RN-27 e as AD-01 a AD-12 estão aprovadas. Consulte `docs/decisoes-administrativas-aprovadas.md` para as decisões administrativas e as validações institucionais ainda necessárias.
Utilize exclusivamente dados fictícios. O uso de dados reais continua bloqueado. Novas etapas, integrações além da homologação local autorizada e uso operacional dependem de autorização específica. Consulte `docs/implementacao-02-alunos.md`, `docs/implementacao-03-oficinas-chamadas.md`, `docs/implementacao-04-backend.md` e `docs/implementacao-05-auth-data-api.md` para o estado das entregas e preserve os critérios provisórios como tais.

## Diretrizes de trabalho

- Trabalhe somente dentro deste repositório.
- Preserve as decisões e os arquivos existentes.
- Não utilize dados pessoais reais em exemplos, testes, documentação ou código.
- Quando dados de demonstração forem necessários, use informações claramente
  fictícias e não identificáveis.
- Registre decisões relevantes e requisitos consolidados na pasta `docs/`.
- Evite escolher tecnologias, arquitetura ou padrões visuais sem requisitos.
- Antes de mudanças amplas, confirme o escopo e os critérios de aceitação.

## Qualidade e segurança

- Não inclua segredos, credenciais ou arquivos de configuração sensíveis.
- Mantenha a documentação em português, salvo orientação diferente.
- Ao implementar futuramente, inclua validações e testes proporcionais ao risco.

## Referências e restrições permanentes

- Consulte `docs/decisoes-aprovadas.md` como referência oficial RN-01 a RN-27;
  `docs/requisitos.md` e `docs/regras-negocio.md` resumem a aplicação; consulte
  `docs/decisoes-pendentes.md` antes de assumir detalhes ainda abertos.
- Mantenha os oito módulos aprovados e a interface simples, legível e responsiva,
  com administração voltada a computadores e professores a celulares.
- Não desenvolva rodízio de oficinas, transporte, eventos, controle financeiro
  ou digitalização/armazenamento dos formulários físicos de matrícula.
- Preserve a oficina fixa anual e a chamada sob responsabilidade do professor
  dessa oficina mesmo em dias de distribuição manual para outras atividades.
- A RN-08 corrigida permite no máximo uma chamada por turma e data de atividade,
  independente entre turnos; horários ou aulas individuais não geram chamadas.
- Respeite acesso por turma e dados essenciais para professores, auditoria,
  integridade do histórico e confirmação administrativa de importações.
- Materiais seguem os complementos aprovados A a D de RN-12 a RN-15 em
  `docs/decisoes-aprovadas.md`: kits configuráveis, tamanho por peça, pendências
  vinculadas e adicionais independentes. Pendências não baixam estoque; adicionais
  têm motivo opcional, correções/estornos exigem motivo. Não duplicar saldo de kit
  e componentes. Consulte a proposta técnica em `docs/modelo-dados.md`.


## Desenvolvimento paralelo e automação (Implementação 06.2)

- A tarefa autorizada determina os arquivos, critérios de aceite, testes e fronteiras. Não interpretar uma tarefa de análise como autorização de mudanças.
- Cada agente implementador usa branch `feat/*`, `fix/*` ou `chore/*` e worktree isolada quando disponível; nunca edita a mesma árvore de trabalho simultaneamente com outro agente.
- Contratos, schema e arquivos compartilhados têm responsável único por rodada. Mudança necessária fora da área autorizada deve ser comunicada ao coordenador, não realizada silenciosamente.
- Um agente de testes pode escrever testes em branch própria; auditoria de segurança atua por padrão somente em leitura e não modifica permissões.
- Não fazer push direto em `main`, merge automático, deploy, criação de usuários, alteração de configurações/Auth/Data API, execução de migrations no DEV hospedado ou acesso a dados reais sem autorização explícita, específica e atual.
- CI de PR faz testes/frontend e reconstrução PostgreSQL descartável com `auth_fixture.sql`; nenhum segredo do Supabase nem conectividade com o DEV hospedado é necessário.
- A pré-condição histórica de `supabase/migrations/20261124191532_revoga_execute_anon_aabb_api.sql` dependia de um estado transitório do Dashboard. A correção mínima da Implementação 06.2.2 foi expressamente autorizada e versionada; consulte `docs/implementacao-06-2-automacao.md` para hashes, divergência histórica e evidências. Não reexecutar ou reparar a migration no DEV, suprimir testes, fabricar grants na fixture ou editar outras migrations aplicadas sem autorização específica. A homologação depende dos resultados reais do CI.
- PR deve conter escopo, RN/AD aplicáveis, arquivos alterados, evidências de testes, riscos/pendências e confirmação de que dados fictícios foram utilizados.
- Revisor diferente do implementador valida os resultados. Resultado CI verde não substitui homologação institucional, testes de JWT real ou aprovação de segurança.
- Consulte `docs/implementacao-06-2-automacao.md` antes de iniciar tarefas paralelas.

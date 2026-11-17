# Arquitetura técnica proposta — versão para revisão

## Status e fontes

Proposta **não aprovada** para a primeira versão. Fontes de negócio: `decisoes-aprovadas.md` (RN-01 a RN-27), `requisitos.md`, `regras-negocio.md` e `decisoes-pendentes.md`. Os oito itens aprovados são **módulos**, não oito telas finais. Não há componentes, banco ou credenciais criados nesta etapa.

## Visão geral

- **Cliente:** React + TypeScript e Vite; Tailwind CSS e shadcn/ui para uma interface responsiva, com formulários React Hook Form + Zod. A validação no cliente orienta o usuário; o servidor/banco valida novamente toda operação relevante.
- **Identidade e dados:** Supabase Auth para contas individuais; PostgreSQL para dados; RLS para leitura e escrita segundo perfil, unidade e turma autorizada. Nunca colocar `service_role` no navegador.
- **Operações críticas:** funções transacionais no banco, expostas por uma camada de acesso controlada, para matrícula, transferência, desligamento, promoção da espera, conclusão e correção de chamada, confirmação/estorno de entrega e confirmação de importação. O cliente não executa uma sequência de escritas independentes para simular uma transação.
- **Consulta:** leituras simples usam consultas com RLS; dados docentes devem ser servidos por projeções limitadas aos campos essenciais e contatos aprovados. Painel e relatórios usam consultas/agregações autorizadas, sem copiar registros sensíveis para tabelas públicas.
- **Testes futuros:** Vitest para regras e componentes; Playwright para percursos críticos em computador e celular. Testes de RLS e concorrência devem atingir o banco em ambiente isolado, com dados fictícios.

## Limites e crescimento

Uma aplicação web e um único banco são suficientes como ponto de partida. Manter módulos separados no frontend e contratos explícitos nas operações do banco. Evitar serviços adicionais até existir necessidade demonstrada. A unidade AABB deve constar dos vínculos centrais, mesmo que o uso inicial seja em Paracatu, sem presumir compartilhamento de dados entre unidades.

## Fluxo de dados e proteção

1. Usuário autentica no Supabase Auth; o aplicativo obtém sessão individual.
2. RLS verifica usuário ativo, perfil e vínculo vigente com a turma/unidade para cada consulta ou operação.
3. Operações críticas revalidam autorização e regras de negócio dentro da mesma transação.
4. Eventos relevantes são auditados sem senha, token ou segredo; falhas não deixam atualização parcial.
5. Exportação e importação ficam sob autorização administrativa até que escopo docente, se houver, seja aprovado.

## Operações atômicas propostas

| Operação | Proteções propostas |
| --- | --- |
| Matrícula / rematrícula | Travar turma (e vínculo anual do aluno), validar cadastro não provisório, oficina ativa única e vaga; confirmar matrícula e ocupação na mesma transação. Não criar matrícula a partir de espera sem ação administrativa. |
| Transferência | Travar origem e destino em ordem estável, validar vaga no destino, preservar histórico da origem e alterar ocupação conjuntamente. A semântica de mudança de oficina ainda exige aprovação. |
| Desligamento | Conferir estado e autorização; registrar evento e liberar vaga na mesma transação; repetição da mesma requisição não libera outra vaga. |
| Lista de espera | Inserção não ocupa vaga; promoção manual usa trava de turma e validação de vaga, com confirmação explícita da administração. |
| Chamada | Identificar por turma e data; impor unicidade desse par, independente do turno de outras turmas; abrir apenas em dia de atividade e sem faltas automáticas; concluir somente se todos os alunos matriculados participantes estiverem marcados. Dia sem atividade não gera pendência. |
| Correção de chamada | Professor autorizado informa motivo; atualizar registro e gravar valor anterior, novo valor, autor e momento de forma atômica. Justificativa posterior não transforma ausência em presença. |
| Entrega coletiva | Confirmar cabeçalho, destinatários efetivos e movimentações numa transação; saldo negativo é aceito e gera alerta. Chave de requisição impede duplicação por clique/reenvio. |
| Estorno | Motivo obrigatório e lançamento compensatório vinculado à entrega original, sem apagar movimento; impedir estorno duplicado. |
| Entrada de kits / avulsos | Confirmar lote e variantes efetivamente recebidas; kits expandem a composição versionada em movimentos de componentes. Não creditar estoque independente do kit. Reenvio retorna o resultado original, sem nova entrada. |
| Kit parcial / complementação | Criar vínculo kit-aluno e requisitos; baixar apenas variantes recebidas. Travar requisito na complementação para não quitar duas vezes a mesma pendência; histórico une entrega inicial e posteriores. |
| Adicional / reposição | Nova entrega por aluno, item, variante/tamanho, quantidade, data e administrativo. Motivo opcional; não editar entrega original. Aplicar mesma transação, idempotência e auditoria da entrega coletiva. |
| Importação | Preparar lote e conflitos sem tocar dados conferidos; revisão administrativa explícita; confirmação transacional por lote ou blocos rastreáveis, com proteção contra reprocessamento. Nunca excluir cadastro ausente da planilha. |

Ocupação e saldo podem ser calculados a partir de registros confirmados/movimentações; se houver valores materializados por desempenho, devem ser atualizados atomicamente e reconciliáveis. Índices e travas específicos dependem da modelagem final em `modelo-dados.md`.

### Kits: negócio confirmado e proposta técnica

Os complementos aprovados A a D de RN-12 a RN-15 exigem composição configurável, tamanho por peça, pendências e adicionais. Propõe-se estoque único por componente/variante, lote de entrada que expande kits e disponibilidade calculada (detalhes em `modelo-dados.md`). Pendências não geram saída nem reserva. Saldo negativo permanece permitido e alertado.

A composição de um kit deve ser preservada nas operações históricas; o versionamento é proposta técnica. Reserva e kits fisicamente montados são alternativas não aprovadas, avaliadas no modelo. Exemplos de componentes não fixam catálogo nem autorizam substituição automática. Correção/estorno tem motivo obrigatório; adicional tem motivo opcional. A auditoria registra os vínculos entre lote, entrega, aluno, componente, complemento e compensação.

## Compatibilidade de versões

As tecnologias listadas são **planejadas**, sem versões fixadas nesta proposta. Antes de instalar dependências, conferir nas fontes oficiais as versões estáveis e a compatibilidade entre React, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Hook Form, Zod, Vitest, Playwright e SDK do Supabase; registrar versões exatas e executar uma prova mínima de integração. Conferir também versão e recursos efetivos do PostgreSQL/Auth/backup no plano Supabase contratado. Esta verificação é um portão de implementação, não uma suposição de compatibilidade hoje.

## Ordem recomendada

1. Aprovar pendências bloqueantes de campos, matrícula/transferência, calendário de atividades por turma e campos visíveis ao professor.
2. Validar modelo relacional e matriz de permissões/RLS com exemplos fictícios.
3. Confirmar compatibilidade e fixar versões; preparar ambiente isolado e migrações revisadas.
4. Implementar autenticação, perfis e cadastros; depois turmas, matrículas e vagas.
5. Implementar chamadas e materiais; então painel e relatórios.
6. Implementar importação/exportação com amostras validadas; testar concorrência, RLS, restauração e usabilidade antes da implantação.

As etapas são proposta técnica, sem autorização para programação. Não incluir rodízio, transporte, eventos, finanças ou digitalização dos formulários físicos.

# Requisitos

## 1. Objetivo

Desenvolver um sistema web para apoiar a gestão administrativa e pedagógica da
AABB Comunidade de Paracatu–MG. O sistema deverá facilitar a rotina dos
funcionários, com atenção especial à facilidade de uso pelos usuários
administrativos com mais de 45 anos.

## 2. Perfis de usuário confirmados

### Administração

- Gerencia o sistema.
- Consulta indicadores e relatórios.
- Gerencia alunos, matrículas, oficinas, vagas, usuários, estoque e entregas.
- Confere e confirma importações.
- Acompanha chamadas e pendências.
- Diretora, supervisora e demais administradores autorizados têm acesso
  administrativo completo e podem gerenciar contas de usuários.

### Professores

- Acessam somente as turmas que lhes forem atribuídas.
- Consultam somente os alunos dessas turmas.
- Registram chamadas digitais, prioritariamente pelo celular.
- Podem corrigir chamadas finalizadas das turmas autorizadas, com motivo e
  histórico; substitutos dependem de autorização administrativa.

O acesso docente inclui dados essenciais e contatos dos responsáveis dos alunos
de suas turmas. Outros dados pessoais exigem necessidade e autorização. As
restrições de acesso devem valer nas consultas e no banco de dados.

## 3. Requisitos funcionais por módulo

### RF-01 — Painel administrativo

Exibir indicadores de alunos, vagas, oficinas e frequência.

### RF-02 — Gestão de alunos

Permitir cadastrar alunos e responsáveis; pesquisar e filtrar cadastros;
realizar matrículas e rematrículas; registrar transferências e desligamentos; e
preservar o cadastro e o histórico dos alunos ao longo dos anos.
Permitir cadastros provisórios sinalizados, sem efetivar matrícula enquanto os
campos obrigatórios não forem validados. Cada aluno poderá ter apenas uma oficina
fixa ativa por ano na unidade. Uma lista de espera de turma lotada não ocupará
vaga nem constituirá matrícula; a administração fará seleção e confirmação sem
matrícula automática.

### RF-03 — Oficinas e vagas

Permitir administrar 12 oficinas, turmas matutinas e vespertinas, professores
atribuídos, capacidade definida pela administração e disponibilidade de vagas.
Turmas de turnos diferentes terão alunos e vagas independentes. Cada turma
poderá ter professor titular e outros autorizados; a administração poderá
alterar a capacidade com validações de integridade.

### RF-04 — Chamadas digitais

Permitir que professores, pelo celular, visualizem suas turmas; marquem presença
ou falta; identifiquem registros pendentes; registrem justificativas; e concluam
a chamada somente quando todos os alunos estiverem marcados. Permitir que a
supervisão acompanhe as chamadas e que correções preservem o histórico.
Cada turma terá no máximo uma chamada por data com atividade; turmas matutinas e
vespertinas terão chamadas independentes, apenas com alunos matriculados na
respectiva turma. Horários ou aulas individuais não geram outras chamadas.
Professores autorizados podem
corrigir chamadas finalizadas com motivo, valores anteriores e autoria
preservados. Faltas justificadas continuam ausências; justificativas podem ser
registradas durante ou após a conclusão. Chamadas previstas e não realizadas são sinalizadas
à administração, sem gerar faltas automaticamente; dias sem atividade da turma
não geram pendência. O professor da oficina fixa
continua responsável pela chamada de seus alunos em dias de distribuição manual
para outras atividades, sem módulo de rodízio.

### RF-05 — Uniformes e materiais

Permitir controlar o estoque; registrar entregas individuais e coletivas por
oficina; selecionar inicialmente todos os alunos; desmarcar quem não recebeu; e
atualizar o estoque após a confirmação da entrega.
O catálogo considera tipo, quantidade e tamanho quando aplicável. A entrega
coletiva seleciona oficina e turma. Entregas podem gerar saldo negativo, que
deve ser identificado e alertado à administração. Correções e estornos exigem
motivo, preservam movimentações e ajustam o saldo. A administração pode registrar
distribuições feitas por funcionário fora do sistema.

Complementos aprovados A a D de RN-12 a RN-15:

- Cadastrar itens avulsos, variantes por tamanho e kits com composição configurável.
- Registrar entradas de itens e de kits completos, representar componentes e
  consultar kits disponíveis sem duplicar quantidades de estoque.
- Escolher tamanho por peça na entrega; aceitar itens sem tamanho.
- Entregar kits completos ou parcialmente, registrar apenas itens recebidos e
  consultar pendências por aluno, vinculadas à entrega inicial e às posteriores.
- Registrar adicionais/reposições como novas entregas individuais com aluno,
  item, quantidade, tamanho aplicável, data e usuário administrativo; motivo
  opcional com sugestões, preservando a entrega inicial.
- Consultar histórico de entradas, entregas, reposições, correções e estornos.
- Manter seleção coletiva inicial de todos por oficina e turma, permitindo
  desmarcar alunos e indicar componentes não recebidos antes de confirmar.
- Impedir processamento duplicado da mesma confirmação e não baixar estoque por
  pendências. Correção/estorno exige motivo; saldo negativo gera alerta.

### RF-06 — Relatórios

Disponibilizar relatórios de alunos por oficina, vagas, matrículas,
desligamentos, frequência, chamadas pendentes e materiais entregues.

### RF-07 — Login e usuários

- Permitir acesso autenticado ao sistema.
- Permitir que a administração gerencie o sistema.
- Restringir professores às suas turmas e chamadas.
- Permitir a todos os administradores autorizados criar, alterar e desativar
  contas; exigir contas individuais, senhas protegidas, expiração de sessão e
  recuperação/redefinição segura.

### RF-08 — Importação e exportação

Permitir trabalhar com planilhas Excel, com pré-visualização, validação de
duplicidades, confirmação administrativa e proteção contra sobrescrita
automática de dados locais conferidos. Os dados de 2026 virão inicialmente de
arquivos locais após conferência. A partir de 2027, deverá ser possível importar
alunos exportados do sistema oficial.
Usar documentos de identificação quando disponíveis e comparar nome, data de
nascimento e responsável para sinalizar possíveis duplicidades, sem unificação
automática por semelhança. Exibir diferenças e exigir revisão e confirmação
administrativa antes de substituir dados. A ausência de aluno de 2026 na
importação de 2027 não apaga seu histórico nem gera matrícula automática.

## 4. Requisitos de usabilidade e apresentação

- Interface administrativa otimizada para computador.
- Interface dos professores otimizada para celular.
- Interface responsiva.
- Navegação simples e consistente.
- Textos legíveis e com bom contraste.
- Botões grandes e identificados com nomes claros.
- Adequação à rotina de usuários administrativos com mais de 45 anos.

## 5. Restrições e premissas confirmadas

- O desenvolvimento inicial utilizará somente dados fictícios.
- As matrículas são presenciais.
- Os documentos assinados permanecem arquivados fisicamente.
- Não haverá digitalização ou armazenamento desses formulários no sistema.
- Cada aluno terá uma oficina fixa em cada matrícula.
- Cadastros de alunos são permanentes; matrículas são organizadas por ano.
- Auditar alterações importantes em matrículas, chamadas, materiais, cadastros,
  importações e usuários, sem guardar senhas ou segredos no histórico.
- Prever backups automáticos e testes periódicos de restauração de acordo com a
  infraestrutura efetivamente disponível.
- Em operações comuns, arquivar ou desativar conforme política de retenção;
  tratar solicitações legítimas de exclusão ou correção em procedimento separado.

## 6. Escopo excluído

- Rodízio de oficinas.
- Transporte.
- Eventos.
- Controle financeiro.
- Digitalização ou armazenamento dos formulários físicos de matrícula.

## 7. Pontos pendentes de decisão

- Campos obrigatórios do aluno e do responsável.
- Critérios exatos de pesquisa e filtros.
- Estados detalhados, vigência e fluxos de transferência, matrícula e rematrícula;
  reversão de desligamento e operação da lista de espera.
- Nomes, dias de atividade, composição e capacidade inicial das 12 oficinas;
  horários operacionais, se necessários fora do controle de frequência.
- Prazos e revogação da autorização de substitutos e definição dos dados
  essenciais visíveis aos professores.
- Periodicidade, período de referência e fórmula dos indicadores de frequência.
- Conteúdo, filtros, formato e permissões de cada relatório.
- Catálogo concreto, composição dos kits, unidades e grade de tamanhos; política
  de substituição de componentes, ajustes e devoluções. Reserva ou montagem física
  de kits não foi aprovada como regra de negócio.
- Formato das planilhas de 2026 e do arquivo do sistema oficial a partir de 2027.
- Procedimento detalhado para correspondência sem documentos e resolução de
  conflitos, rejeições e reprocessamento na importação.
- Quais dados e módulos terão exportação e qual será o formato final.
- Parâmetros de autenticação, sessão, recuperação, auditoria, retenção e
  restauração; acessibilidade, desempenho, disponibilidade e implantação.

As regras oficiais RN-01 a RN-27 estão em [decisoes-aprovadas.md](decisoes-aprovadas.md).

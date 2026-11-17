# Decisões pendentes após a consolidação oficial

As decisões RN-01 a RN-27 foram aprovadas em [decisoes-aprovadas.md](decisoes-aprovadas.md). As propostas abaixo continuam **NÃO APROVADAS**. As prioridades indicam impacto na modelagem ou na validação do sistema.

## Pendências resolvidas pela versão 1.0

| Assunto | Decisão aprovada | Situação da proposta anterior |
| --- | --- | --- |
| Oficina anual e lista de espera | RN-01, RN-02 e RN-07 | Definidos limite de oficina ativa, espera sem ocupar vaga e confirmação manual. |
| Turnos e capacidade | RN-04 e RN-05 | Definida independência das vagas por turma e alteração de capacidade com validações. |
| Professores | RN-06, RN-16 a RN-19 | Definidos titular e autorizados, supervisora como administradora, substitutos autorizados e gestão de contas. |
| Unidade da chamada | RN-08 corrigida | Chamada única por turma e data de atividade, independente entre turnos. A proposta anterior de sessões de horário/aula foi revogada. |
| Correção e justificativa | RN-09 e RN-10 | Aprovados correção por professor autorizado com motivo e histórico, e falta justificada ainda como ausência. |
| Estoque | RN-13 e RN-14 | **Rejeitada** a proposta anterior de impedir saldo negativo. Saldo negativo é permitido com alerta; correções e estornos exigem motivo e histórico. |
| Kits e materiais | Complementos aprovados A a D de RN-12 a RN-15 | Resolvidos composição configurável, tamanho por peça, pendências vinculadas, adicionais independentes e motivo opcional de adicional. Correção/estorno mantém motivo obrigatório. |
| Importação | RN-20 a RN-23 | Aprovados critérios de detecção de duplicidade, revisão de conflitos, cadastro provisório e preservação histórica. |
| Segurança | RN-24 a RN-27 | Aprovadas diretrizes de auditoria, backup, arquivamento e acesso seguro; parâmetros concretos permanecem abertos. |

## 1. Cadastros e matrículas

**Confirmado:** RN-01 a RN-03, RN-07, RN-22 e RN-23; matrícula presencial, rematrícula com preservação do cadastro e documentos físicos.

| Prioridade | Ainda pendente | Proposta — NÃO APROVADA | Consequência técnica |
| --- | --- | --- | --- |
| Crítica | Campos obrigatórios, identificação e validação de cadastro provisório. | Definir conjunto mínimo a partir dos formulários, usando apenas exemplos fictícios. | Estrutura de cadastro, validações e efetivação da matrícula. |
| Crítica | Estados da matrícula, vigência, conclusão anual e reversão de desligamento. | Estados ativa, desligada e concluída. | Histórico anual e cálculo de ocupação. |
| Crítica | Transferência entre turma, turno ou oficina e efeito na oficina fixa anual. | Validar vaga antes da transferência. | Vínculos históricos e ocupação das duas turmas. |
| Importante | Ordem, validade e tratamento de interessados na lista de espera. | Definir fluxo de seleção pela administração. | Registro da espera sem convertê-la automaticamente em matrícula. |
| Importante | Pesquisa e filtros. | Validar com a administração. | Consultas e telas. |

## 2. Oficinas, turmas e vagas

**Confirmado:** 12 oficinas, RN-04 a RN-06 e RN-07.

| Prioridade | Ainda pendente | Proposta — NÃO APROVADA | Consequência técnica |
| --- | --- | --- | --- |
| Crítica | Nomes, composição, dias de atividade e capacidades iniciais das turmas. | Registrar configurações por período. | Vínculos anuais, vagas e chamadas previstas. |
| Crítica | Validações ao reduzir capacidade abaixo da ocupação e vigência de alterações. | Exigir revisão administrativa da alteração. | Integridade da ocupação e histórico de capacidade. |
| Importante | Prazo e revogação de autorização dos professores. | Registrar validade quando houver. | Acesso e autoria histórica. |

## 3. Chamadas e frequência

**Confirmado:** RN-08 a RN-11; no máximo uma chamada por turma e data de atividade, independente por turno e só com alunos da turma; presença, ausência e pendência por aluno; chamada não concluída com aluno sem marcação; professor da oficina fixa responde pela chamada em dias de distribuição manual.

| Prioridade | Ainda pendente | Proposta — NÃO APROVADA | Consequência técnica |
| --- | --- | --- | --- |
| Crítica | Como registrar dias de atividade e exceções para determinar chamadas esperadas; momento de inclusão dos alunos após mudança de matrícula. | Validar calendário por turma e critérios de participação. | Distingue dia sem atividade de chamada prevista e pendente, sem gerar faltas automáticas. |
| Importante | Prazo de correção, análise de justificativas, entrada e saída em períodos parciais. | Definir critérios com a supervisão. | Histórico e cálculo de frequência. |
| Importante | Fórmula e período dos indicadores de frequência. | Validar exemplos fictícios. | Consistência entre chamadas, painel e relatórios. |
| Opcional | Uso sem conexão. | Avaliar necessidade em campo. | Sincronização se aprovado. |

## 4. Uniformes, materiais e estoque

**Confirmado:** RN-12 a RN-15 e complementos A a D: kits configuráveis de itens individuais, tamanho por peça ou item sem tamanho, entradas de kits sem duplicar estoque, entrega parcial com pendências vinculadas, adicionais independentes com motivo opcional e autoria administrativa. Entregas coletivas por oficina/turma mantêm alunos inicialmente selecionados e exclusões; somente recebidos baixam estoque, com saldo negativo alertado. Correção/estorno mantém motivo obrigatório e histórico. Esses pontos não estão mais pendentes de decisão de negócio.

| Prioridade | Ainda pendente | Proposta — NÃO APROVADA | Consequência técnica |
| --- | --- | --- | --- |
| Crítica | Catálogo concreto, unidades, tamanhos e quantidades por entrega. | Validar itens e unidades com a administração. | Estrutura de itens, movimentações e saldos. |
| Crítica para entrada de kits | Composição concreta de cada kit e discriminação dos tamanhos efetivamente recebidos em cada lote. | Validar catálogo/grade e informar quantidades por variante na entrada. | Permite expandir lote em componentes sem presumir tamanho único ou duplicar saldo. |
| Importante | Alternativas de componentes (ex.: bermuda ou calça) e eventual mudança de composição para kit já entregue parcialmente. | Versionar composição e preservar requisitos originais; não substituir automaticamente itens. | Mantém referência histórica e evita reescrever pendências antigas. |
| Importante | Estorno total/parcial e eventual cancelamento da obrigação restante do kit. | Recalcular recebido líquido e registrar decisão administrativa sobre obrigação, sem apagar histórico. | Define pendências após correções com entregas posteriores já vinculadas. |
| Importante | Forma final de estimar disponibilidade por grade de tamanhos e composição. | Saldo único por componente/variante, disponibilidade calculada conforme `modelo-dados.md`. | Não confunde estimativa de kits com garantia dos tamanhos por aluno. |
| Importante | Procedimento e autorização para correção e estorno, devoluções e ajustes. | Especificar fluxo de revisão. | Histórico e recomposição do saldo. |
| Opcional | Reserva de itens ou controle de kits fisicamente montados. | Não incluir na base inicial; alternativas avaliadas em `modelo-dados.md`, sem aprovação de negócio. | Exigiria política de reserva/montagem e rastreio sem dupla contagem. |
| Opcional | Estoque mínimo, inventário e perdas. | Avaliar após rotina básica. | Movimentações e alertas adicionais. |

## 5. Perfis e permissões

**Confirmado:** RN-16 a RN-19; supervisora integra administração; professores restritos a turmas autorizadas, dados essenciais e contatos; restrições efetivas em consultas e banco de dados.

| Prioridade | Ainda pendente | Proposta — NÃO APROVADA | Consequência técnica |
| --- | --- | --- | --- |
| Crítica | Definir exatamente dados essenciais e condições para outros dados pessoais. | Aprovar lista de campos e exceções. | Controle de acesso por campo e consulta. |
| Importante | Prazo padrão e revogação de substitutos; tratamento de usuários com funções múltiplas. | Aprovar fluxo administrativo. | Vínculos de autorização. |
| Importante | Escopo de relatórios e exportações para professores. | Definir por finalidade. | Restrições de consulta e saída de dados. |

## 6. Importações e exportações

**Confirmado:** RN-20 a RN-23; pré-visualização e confirmação administrativa; dados locais conferidos sem sobrescrita automática.

| Prioridade | Ainda pendente | Proposta — NÃO APROVADA | Consequência técnica |
| --- | --- | --- | --- |
| Crítica | Layouts das fontes de 2026 e planilhas oficiais de 2027; campos obrigatórios. | Validar amostras fictícias dos formatos. | Mapeamento, validação e cadastros provisórios. |
| Crítica | Critério de correspondência quando documentos faltam e procedimento detalhado para conflitos. | Exigir escolha explícita por conflito. | Prevenção de duplicidade e histórico de substituições. |
| Importante | Registros rejeitados, reprocessamento e saída da importação. | Validar fluxo com administração. | Rastreabilidade do lote. |
| Importante | Dados, filtros, formatos e permissões de exportação. | Definir por finalidade. | Consultas e proteção dos arquivos. |

## 7. Relatórios

**Confirmado:** alunos por oficina, vagas, matrículas, desligamentos, frequência, chamadas pendentes e materiais entregues.

| Prioridade | Ainda pendente | Proposta — NÃO APROVADA | Consequência técnica |
| --- | --- | --- | --- |
| Importante | Campos, filtros, períodos, totais, formatos e permissões. | Validar exemplos fictícios. | Consultas, agregações e controle de acesso. |
| Importante | Definição dos indicadores do painel. | Aprovar fórmulas e períodos. | Coerência entre painel e relatórios. |

## 8. Interface e identidade visual

**Confirmado:** azul institucional, amarelo complementar, fundo claro, cartões arredondados, legibilidade, botões grandes, navegação simples, responsividade, computador para administração e celular para professores; logomarca original sem alteração quando fornecida.

| Prioridade | Ainda pendente | Proposta — NÃO APROVADA | Consequência técnica |
| --- | --- | --- | --- |
| Importante | Inventário de telas dos oito módulos e protótipos aprovados. | Validar fluxos principais com usuários. | Navegação e estados da interface. |
| Importante | Cores exatas, tipografia, marca, critérios de acessibilidade, dispositivos e mensagens. | Aplicar referências oficiais quando disponíveis. | Especificação visual reproduzível. |
| Opcional | Ícones e ferramenta de prototipação. | Escolher conforme necessidade. | Produção dos protótipos. |

## 9. Segurança e infraestrutura

**Confirmado:** RN-24 a RN-27; autenticação individual, auditoria sem segredos, backups e testes de restauração, arquivamento e procedimento separado de exclusão/correção legítima.

| Prioridade | Ainda pendente | Proposta — NÃO APROVADA | Consequência técnica |
| --- | --- | --- | --- |
| Crítica | Política de retenção e procedimento de exclusão/correção legítima. | Definir responsável e critérios. | Preservação histórica e tratamento de solicitações. |
| Crítica | Requisitos concretos de autenticação, sessão, recuperação e auditoria. | Validar parâmetros antes do desenho técnico. | Segurança e rastreabilidade. |
| Importante | Infraestrutura, frequência e retenção dos backups e testes de restauração. | Escolher após avaliar o plano disponível. | Recuperação efetiva sem presumir recursos. |
| Importante | Hospedagem, desempenho, disponibilidade e implantação. | Avaliar opções após validar requisitos. | Arquitetura e operação. |

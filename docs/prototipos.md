# Protótipos

## 1. Estado deste documento

Este documento organiza as telas e os fluxos a prototipar. Não contém protótipos
visuais finais, medidas, cores exatas ou componentes implementados.

## 2. Mapa conceitual de telas

### Acesso

- Login.
- Gestão de usuários pela administração.

### Área administrativa para computador

- Painel com indicadores de alunos, vagas, oficinas e frequência.
- Lista de alunos com pesquisa e filtros.
- Cadastro e consulta do aluno, responsáveis e histórico.
- Matrícula, rematrícula, transferência e desligamento.
- Oficinas, turmas, turnos, professores, capacidade e vagas.
- Acompanhamento de chamadas e pendências.
- Catálogo de itens e kits, composição, variantes de tamanho e estoque.
- Entradas de kits completos e materiais avulsos, disponibilidade de kits e
  alertas de saldo negativo.
- Entregas individuais e coletivas por oficina e turma, completas ou parciais;
  pendências consultáveis e histórico por aluno, adicionais e reposições.
- Histórico de entradas, entregas, complementações, correções e estornos.
- Relatórios.
- Importação com pré-visualização, duplicidades e confirmação.
- Exportação.

### Área do professor para celular

- Lista de turmas atribuídas.
- Seleção da turma e da chamada diária pela data, quando houver atividade.
- Lista de alunos com presença, falta ou pendência.
- Registro de justificativa.
- Revisão e conclusão da chamada.

## 3. Fluxos prioritários para prototipação

### Fluxo A — Matrícula anual

1. Localizar ou cadastrar o aluno.
2. Consultar cadastro e histórico.
3. Iniciar a matrícula do ano.
4. Selecionar oficina fixa e turma com vaga.
5. Revisar e confirmar.

### Fluxo B — Rematrícula

1. Localizar o cadastro permanente.
2. Consultar o histórico.
3. Iniciar nova matrícula anual sem duplicar o cadastro.
4. Revisar e confirmar.

### Fluxo C — Desligamento

1. Localizar a matrícula vigente.
2. Iniciar, revisar e confirmar o desligamento.
3. Atualizar a vaga somente após a confirmação.

### Fluxo D — Chamada pelo celular

1. O professor acessa suas turmas e seleciona a data de atividade; há no máximo
   uma chamada por turma nessa data, independente da turma do outro turno.
2. Marca presença ou falta e registra justificativa quando aplicável.
3. O sistema mostra somente alunos matriculados na turma e mantém como pendentes
   os ainda não marcados. Dia sem atividade não gera chamada pendente.
4. O professor revisa a chamada.
5. A conclusão só é liberada sem pendências.

### Fluxo E — Entrega coletiva

1. A administração seleciona oficina, turma e kit ou item.
2. O sistema apresenta os alunos inicialmente selecionados.
3. A administração desmarca quem não recebeu e informa, por aluno, os componentes
   realmente recebidos, quantidades e tamanho individual de cada peça aplicável.
4. Revisa itens recebidos e pendências; confirma uma única operação.
5. O estoque é atualizado somente pelos itens entregues. Restantes do kit ficam
   pendentes e vinculados à entrega inicial. Saldo negativo gera alerta.

### Fluxo E.1 — Entrada de kit completo ou avulsos

1. Selecionar kit/composição ou itens avulsos e informar quantidades.
2. Discriminar componentes e tamanhos efetivamente recebidos, quando aplicáveis.
3. Revisar e confirmar o lote de entrada; a proposta técnica credita os
   componentes sem criar um saldo independente duplicado do kit.
4. Consultar quantidades por item/tamanho e estimativa de kits disponíveis.

### Fluxo E.2 — Complementação de kit parcial

1. Localizar aluno, entrega inicial e componentes pendentes.
2. Selecionar o que foi recebido agora e o tamanho de cada peça.
3. Confirmar nova entrega vinculada ao kit inicial; somente recebidos baixam
   estoque. Pendências restantes continuam consultáveis pela administração.

### Fluxo E.3 — Entrega individual adicional ou reposição

1. Localizar aluno e informar item, quantidade, tamanho aplicável e data.
2. Informar motivo opcional (troca de tamanho, desgaste, perda, necessidade
   adicional ou outro); o usuário administrativo é registrado como autor.
3. Revisar e confirmar nova movimentação sem alterar o histórico original.

### Fluxo E.4 — Correção ou estorno

1. Localizar a movimentação original e informar motivo obrigatório.
2. Revisar e confirmar a correção/estorno, preservando histórico e ajustando
   saldo e pendências afetadas conforme as regras aprovadas e o procedimento
   operacional ainda a validar.

### Fluxo F — Importação

1. A administração seleciona uma planilha Excel.
2. O sistema apresenta a pré-visualização e os problemas de validação.
3. A administração confere os dados e conflitos.
4. A administração confirma a importação.
5. Dados locais conferidos não são sobrescritos automaticamente.

## 4. Critérios para os futuros protótipos

- Usar somente dados fictícios.
- Representar a administração prioritariamente em computador.
- Representar a chamada prioritariamente em celular.
- Aplicar as diretrizes de `identidade-visual.md`.
- Validar fluxos antes da implementação.

## 5. Pontos pendentes de decisão

- Arquitetura de navegação e agrupamento final do menu.
- Ordem de prioridade das telas e fluxos para validação.
- Campos, filtros, ações e mensagens de cada tela.
- Conteúdo e hierarquia exatos do painel administrativo.
- Comportamento da chamada sem conexão, caso necessário.
- Forma de exibir e resolver conflitos na importação.
- Layout, filtros e opções de saída de cada relatório.
- Fidelidade e ferramenta a utilizar nos protótipos.
- Responsáveis pela revisão e aprovação dos protótipos.

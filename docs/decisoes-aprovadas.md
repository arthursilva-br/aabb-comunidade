# Decisões de negócio aprovadas — versão 1.0

Esta é a referência oficial para as regras RN-01 a RN-27. Detalhes não definidos permanecem em `decisoes-pendentes.md`.

## Matrículas e lista de espera

### RN-01 — Oficina fixa
Cada aluno poderá ter somente uma oficina fixa ativa por ano, na unidade. O cadastro pessoal do aluno é permanente e as matrículas são anuais.

### RN-02 — Lista de espera
Quando uma turma estiver lotada, novos interessados poderão integrar uma lista de espera. A lista de espera não ocupa vagas nem representa matrícula ativa.

### RN-03 — Desligamento
O desligamento deverá ser registrado e confirmado, liberando a vaga da turma e preservando o histórico do aluno.

## Oficinas, turmas e vagas

### RN-04 — Separação por turno
Uma mesma oficina poderá possuir turmas matutinas e vespertinas, cada uma com alunos e vagas independentes.

### RN-05 — Capacidade individual
A administração definirá a capacidade de cada turma e poderá alterá-la mediante validações de integridade.

### RN-06 — Professores autorizados
Cada turma poderá ter um professor titular e outros professores autorizados.

### RN-07 — Lista de espera manual
A seleção e confirmação de alunos da lista de espera serão realizadas pela administração. O sistema não deverá efetuar matrículas automaticamente.

## Chamadas e frequência

### RN-08 — Chamada por turma, turno e data
Desconsiderar horários e aulas individuais para o controle de frequência. Cada oficina terá uma chamada diária para a turma matutina e outra para a turma vespertina, quando ambos os turnos tiverem atividades. Cada turma terá no máximo uma chamada por data, independente da turma do outro turno, contendo somente seus alunos matriculados. Não criar chamadas adicionais para horários ou aulas do mesmo turno. Em dia sem atividade da turma, não haverá chamada pendente; chamadas previstas e não realizadas permanecerão pendentes, com aviso administrativo. Professores autorizados poderão corrigir chamadas finalizadas com motivo e histórico; faltas poderão ser justificadas durante ou após a conclusão. A oficina fixa continua responsável pela frequência dos seus alunos, inclusive em dias de distribuição manual para outras atividades.

### RN-09 — Correções
Professores autorizados poderão corrigir chamadas finalizadas, informando obrigatoriamente o motivo. As alterações deverão preservar o histórico, os valores anteriores e a identificação de quem realizou a correção.

### RN-10 — Justificativas
Faltas poderão receber justificativas durante ou após a conclusão da chamada. Uma falta justificada continuará sendo uma ausência, distinguida da ausência sem justificativa.

### RN-11 — Chamadas pendentes
Chamadas não realizadas permanecerão pendentes e serão sinalizadas à administração. O sistema não registrará faltas automaticamente pela ausência de uma chamada.

## Uniformes e materiais

### RN-12 — Catálogo e quantidades
Controlar materiais por tipo, quantidade e tamanho quando aplicável.

**Complementos aprovados A e B:** permitir kits com composição de itens individuais configurável pela administração, sem composição fixa no código. Itens também existem e são movimentados avulsamente. Entradas de kits completos devem representar os componentes correspondentes e permitir consultar a disponibilidade de kits sem duplicar estoque. O tamanho é escolhido individualmente para cada peça na entrega (por exemplo, camiseta P, bermuda M e tênis 33); não exigir tamanho único para o kit. Itens sem tamanho funcionam normalmente. Exemplos de composição não constituem catálogo obrigatório.

### RN-13 — Estoque negativo
Permitir registrar entregas mesmo quando o estoque disponível for insuficiente. O sistema deverá aceitar saldo negativo, identificá-lo e exibir alerta visível à administração.

### RN-14 — Correções de entregas
Permitir correções ou estornos de entregas com motivo obrigatório, preservando o histórico das movimentações e corrigindo adequadamente o saldo.

### RN-15 — Responsável pelo registro
A distribuição dos materiais poderá ser realizada por funcionário responsável fora do sistema. A administração registrará as informações recebidas.

Mantém-se o fluxo de entrega coletiva: selecionar oficina e turma, marcar todos os alunos, desmarcar quem não recebeu e confirmar a operação.

#### Complementos aprovados C e D — entregas de kits e adicionais

- **C — Entrega parcial:** registrar somente componentes efetivamente entregues. Componentes restantes ficam pendentes, consultáveis pela administração, e podem ser entregues posteriormente com vínculo à entrega inicial. Pendência não é entrega nem baixa de estoque.
- **D — Adicionais e reposições:** permitir entregas individuais posteriores ao kit inicial, registrando aluno, item, quantidade, tamanho quando aplicável, data e usuário administrativo responsável. Cada adicional gera nova movimentação e preserva a entrega original. Motivo é opcional, com sugestões de troca de tamanho, desgaste, perda, necessidade adicional e outro.
- Manter entrega individual e coletiva por oficina e turma, com alunos inicialmente selecionados e possibilidade de desmarcar quem não recebeu. A seleção do aluno não autoriza registrar componentes não recebidos.
- RN-13 permanece permitindo saldo negativo com alerta; RN-14 continua exigindo motivo obrigatório e histórico em correções e estornos. O motivo opcional de um adicional não dispensa o motivo de uma correção.
- RN-15 mantém a administração como responsável pelo lançamento das informações de quem distribuiu os materiais. Os complementos A a D ampliam RN-12 a RN-15 sem renumerar as 27 regras.

## Perfis e permissões

### RN-16 — Administração
Diretora, supervisora e demais administradores autorizados terão acesso administrativo completo.

### RN-17 — Acesso dos professores
Professores visualizarão apenas alunos das próprias turmas autorizadas, incluindo dados essenciais e contatos dos responsáveis. Outros dados pessoais não deverão ser expostos sem necessidade e autorização.

### RN-18 — Professores substitutos
O acesso de substitutos a outras turmas dependerá de autorização administrativa, podendo ter período de validade.

### RN-19 — Gestão de usuários
Todos os administradores autorizados poderão criar, alterar, desativar e gerenciar contas de usuários.

As permissões devem ser efetivas também no banco de dados e nas consultas, não apenas na interface.

## Importação e atualização de alunos

### RN-20 — Identificação de duplicidades
Utilizar documentos de identificação quando disponíveis e comparar nome, data de nascimento e responsável para detectar possíveis duplicidades. Não unificar automaticamente cadastros apenas por semelhança.

### RN-21 — Conflitos
Quando a importação apresentar informações diferentes das existentes, exibir as diferenças e exigir revisão e confirmação administrativa antes de substituir dados.

### RN-22 — Cadastros provisórios
Permitir importar registros incompletos como cadastros provisórios sinalizados. A matrícula somente poderá ser efetivada depois de validados os campos obrigatórios.

### RN-23 — Preservação histórica
Se um aluno de 2026 não aparecer na importação de 2027, preservar seu cadastro e histórico, sem criar automaticamente nova matrícula.

A carga inicial de 2026 dependerá de conferência das fontes locais. A partir de 2027, o sistema deverá aceitar planilhas oficiais validadas.

## Segurança, auditoria e recuperação

### RN-24 — Auditoria
Registrar as alterações importantes em matrículas, chamadas, materiais, cadastros, importações e usuários. Os registros deverão identificar a operação, o responsável, a data e o histórico necessário para investigação, evitando armazenar senhas ou segredos.

### RN-25 — Backups
Prever backups automáticos e testes periódicos de restauração. A frequência, retenção e mecanismos disponíveis dependerão da infraestrutura e do plano efetivamente utilizados. Não presumir recursos inexistentes.

### RN-26 — Arquivamento e preservação
Nas operações comuns, utilizar arquivamento ou desativação para preservar o histórico conforme a política de retenção. Manter procedimento separado para solicitações legítimas de exclusão ou correção de dados, observando a legislação aplicável.

### RN-27 — Acesso seguro
Utilizar contas individuais, senhas protegidas por mecanismo de autenticação apropriado, expiração de sessão e recuperação/redefinição segura.

## Diretrizes permanentes

- Oito módulos aprovados: painel administrativo; gestão de alunos; oficinas, turmas e vagas; chamadas e frequência; uniformes e materiais; relatórios; login e usuários; importação e exportação.
- Preservar facilidade de uso, azul institucional, amarelo complementar, fundos claros, legibilidade, botões grandes, navegação simples e interface responsiva. Professores usam principalmente celular; administração, computador.
- Não desenvolver rodízio de oficinas, transporte, eventos, controle financeiro ou digitalização de documentos de matrícula.
- O professor da oficina fixa continua responsável pela chamada de seus alunos nos dias de distribuição manual para outras atividades. Isso não cria um módulo de rodízio.
- Durante o desenvolvimento, usar apenas dados fictícios.

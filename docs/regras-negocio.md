# Regras de negócio

As regras oficiais RN-01 a RN-27 estão em [decisoes-aprovadas.md](decisoes-aprovadas.md). A numeração antiga deste arquivo foi substituída para evitar referências ambíguas. Este resumo preserva regras anteriores não revogadas.

## Matrículas, oficinas e vagas

- Matrículas são presenciais; documentos assinados permanecem fisicamente arquivados, sem digitalização ou armazenamento no sistema.
- Cadastro pessoal permanente, matrícula anual e no máximo uma oficina fixa ativa por aluno e ano na unidade (RN-01). Rematrícula preserva cadastro e histórico.
- Turmas matutinas e vespertinas da mesma oficina têm alunos e vagas independentes (RN-04). A administração define e altera capacidade com validações de integridade (RN-05).
- Lista de espera não ocupa vaga nem é matrícula ativa (RN-02). Seleção e confirmação são manuais pela administração (RN-07).
- Desligamento registrado e confirmado libera vaga e preserva histórico (RN-03).

## Professores e chamadas

- Turma pode ter titular e outros professores autorizados (RN-06); substitutos dependem de autorização administrativa, eventualmente com prazo (RN-18).
- Professores acessam apenas alunos das turmas autorizadas, dados essenciais e contatos dos responsáveis, sem exposição desnecessária de outros dados (RN-17).
- Cada turma tem no máximo uma chamada por data, quando houver atividade. Turmas matutina e vespertina têm chamadas independentes; cada chamada inclui somente alunos matriculados na turma. Horários ou aulas individuais não geram chamadas adicionais (RN-08).
- Cada aluno é marcado como presente ou ausente; registros sem marcação ficam pendentes. Chamada com aluno sem marcação não pode ser concluída.
- Falta justificada continua ausência, distinta da não justificada; justificativa pode ser lançada antes ou após a conclusão (RN-10).
- Professores autorizados podem corrigir chamadas finalizadas com motivo obrigatório e preservação dos valores anteriores, autoria e histórico (RN-09).
- Chamadas previstas e não realizadas são pendentes e sinalizadas à administração, sem geração automática de faltas; dias sem atividade da turma não geram pendência (RN-08 e RN-11).
- O professor da oficina fixa continua responsável pela chamada de seus alunos em dias de distribuição manual para outras atividades; isso não cria rodízio no sistema.

## Materiais

- Catálogo por tipo, quantidade e tamanho quando aplicável (RN-12). Há entregas individuais e coletivas; na coletiva, selecionar oficina e turma, marcar todos, desmarcar quem não recebeu e confirmar.
- Administração registra informações de distribuição eventualmente feita por funcionário fora do sistema (RN-15). Entrega confirmada atualiza o estoque.
- Entrega pode gerar saldo negativo, que deve ser identificado e alertado à administração (RN-13).
- Correção ou estorno de entrega exige motivo e preserva histórico das movimentações, com ajuste do saldo (RN-14).

### Complementos aprovados de RN-12 a RN-15

- Kits são composições configuráveis de itens individuais. Materiais avulsos continuam disponíveis. Entradas de kits representam componentes, sem contar kit e componentes como saldos independentes duplicados.
- Cada peça recebe tamanho próprio no momento da entrega; itens sem tamanho não exigem esse campo. A composição exemplificada pelo responsável não fixa o catálogo.
- Em entregas parciais, somente itens recebidos geram registro de entrega e baixa. Restantes ficam pendentes para consulta administrativa e conclusão posterior, mantendo vínculo com o kit e a entrega inicial.
- Adicionais e reposições são novas entregas com aluno, item, quantidade, tamanho aplicável, data e autor administrativo. Não substituem o histórico original; motivo é opcional (troca de tamanho, desgaste, perda, necessidade adicional ou outro).
- Correções e estornos continuam com motivo obrigatório; saldo negativo continua permitido e sinalizado. Administração continua lançando as informações recebidas do distribuidor.
- Entregas individuais e coletivas usam as mesmas regras de saldo e auditoria. Confirmação não pode ser aplicada duas vezes por reenvio; pendências não movimentam estoque.

## Administração, importação e segurança

- Diretora, supervisora e outros administradores autorizados têm acesso administrativo completo (RN-16), inclusive gestão de contas (RN-19). Restrições dos professores valem em consultas e banco de dados, além da interface.
- Carga de 2026 depende da conferência das fontes locais; a partir de 2027, aceitar planilhas oficiais validadas. Importação Excel tem pré-visualização, duplicidades e confirmação administrativa.
- Duplicidades são detectadas com documentos, quando disponíveis, e comparação de nome, nascimento e responsável, sem união automática por semelhança (RN-20).
- Diferenças são exibidas e exigem revisão e confirmação administrativa antes de substituir dados (RN-21). Dados locais conferidos não são sobrescritos automaticamente.
- Cadastros incompletos podem entrar como provisórios sinalizados, mas matrícula exige validação de campos obrigatórios (RN-22). Ausência na importação de 2027 não apaga aluno de 2026 nem cria matrícula automática (RN-23).
- Auditar alterações importantes com operação, responsável, data e histórico necessário, sem senhas ou segredos (RN-24). Prever backups automáticos e restaurações testadas conforme infraestrutura disponível (RN-25).
- Operações comuns usam arquivamento ou desativação conforme política de retenção; pedidos legítimos de exclusão ou correção seguem procedimento separado (RN-26).
- Contas individuais, senhas protegidas, expiração de sessão e recuperação segura (RN-27).

## Restrições permanentes

Usar dados fictícios no desenvolvimento. Não desenvolver rodízio, transporte, eventos, controle financeiro ou digitalização de formulários físicos de matrícula.

Detalhes ainda abertos estão em [decisoes-pendentes.md](decisoes-pendentes.md).

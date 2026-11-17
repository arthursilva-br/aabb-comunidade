# Implementação 02 — Gestão de alunos demonstrativa

Entrega de 12/11/2026, autorizada exclusivamente para demonstração local de alunos
e integrações mínimas. As RN-01 a RN-27 e os complementos de materiais permanecem
inalterados. Não é um sistema operacional nem uma entrega pronta para produção.

## Funcionalidades e navegação

| Rota | Uso |
| --- | --- |
| `/admin/alunos` | Pesquisa normalizada por nome; filtros de ano, oficina, turno e situação; tabela sem documentos pessoais; estados de carregamento, vazio, erro e acesso negado. |
| `/admin/alunos/novo` | Cadastro fictício provisório ou validado pelo critério temporário, com vários responsáveis. |
| `/admin/alunos/:alunoId` | Ficha pessoal, responsáveis, matrícula do ano, todas as matrículas e eventos; edição, nova matrícula e desligamento confirmado. |
| `/admin/alunos/:alunoId/editar` | Atualização do cadastro permanente sem apagar vínculos e eventos. |
| `/admin/alunos/:alunoId/matricula` | Ano → oficina → turno → turma → revisão → confirmação. Turma lotada oferece interesse sem matrícula. |
| `/admin/alunos/espera` | Interessados por ano/turma, vagas atuais e seleção administrativa manual com confirmação. |

O parâmetro `ano` conserva o contexto entre as telas. Alterar o ano consulta o
histórico, sem apagar matrícula nem criar rematrícula automática. Na listagem,
todos os cadastros permanentes continuam disponíveis; o filtro de ano determina
os vínculos mostrados, e “Sem matrícula no ano” pode ser filtrado explicitamente.
Busca e filtros são preservados na URL e aceitam alterações rápidas combinadas.

## Critérios temporários, sem aprovação definitiva de negócio

- Para demonstrar validação: nome preenchido, nascimento com data existente e
  não futura e pelo menos um responsável com nome, vínculo e telefone preenchidos.
  Não há exigência de documento, formato documental real, idade ou telefone real.
- Cadastro provisório pode ser salvo sem nome, nascimento ou responsável. Um
  nascimento informado precisa ser válido. A administração marca a validação
  explicitamente; não ocorre validação automática por preencher o formulário.
- Limites de comprimento e de 20 responsáveis no formulário são proteções técnicas
  da demonstração, não parâmetros institucionais aprovados.
- Estados mínimos: cadastro provisório/validado; matrícula ativa/desligada;
  interesse aguardando/promovido. Não foram criados estados de conclusão anual,
  vigência, reversão ou transferência. O desligamento não muda o cadastro pessoal.
- Não é permitido tornar provisório um cadastro com matrícula ativa: isso
  produziria uma combinação incompatível com a validação exigida nesta demonstração.
- Semelhança documental normalizada, de nome (igualdade ou contenção), ou de
  responsável sinaliza conferência; nascimento também é comparado. Nascimento
  isolado não comprova duplicidade. O algoritmo é demonstrativo, sem equivalência
  fonética, política definitiva de identificação ou fusão automática.
- Possíveis correspondências são conferidas dentro do formulário, sem abrir uma
  nova aba que perderia os cadastros criados apenas na memória da aba original.
  A administração pode salvar alunos distintos após reconhecer o alerta.
- Não foi adicionado campo livre de observações administrativas, pois sua previsão
  como campo de cadastro não consta dos documentos consultados.
- Interesse em turma lotada pode ser registrado para provisório. A promoção exige
  nova verificação de cadastro validado, vaga e matrícula anual única. Espera nunca
  ocupa vaga. A apresentação dos interessados não representa prioridade aprovada.

## Dados, integridade e compatibilidade futura

O repositório possui alunos, responsáveis vinculados, oficinas, turmas, matrículas,
espera e eventos tipados. A base inicial contém 85 cadastros fictícios, 79 matrículas
ativas em 2026, duas matrículas desligadas (uma de 2025) e dois interessados. São
duas oficinas exemplificativas, quatro turmas por ano (2025–2027), com capacidades
fictícias de 25 alunos. Isso não define o catálogo das 12 oficinas institucionais.
A turma matutina 03 começa lotada para exercitar a lista de espera.

Os casos de uso centralizam as regras e revalidam tudo na confirmação. As operações
de memória são indivisíveis, sem espera entre validação e atualização; uma falha
não confirma alterações parciais. O estado publicado é congelado recursivamente.
Matrícula única é verificada por aluno, unidade e ano; capacidade deriva somente
de matrículas ativas da turma. Cliques repetidos não promovem duas vezes nem
liberam outra vaga no mesmo desligamento. Isso não substitui transações reais.

`StudentCommands` define a fronteira dos casos de uso assíncronos; a interface
`StudentsRepository` encapsula o adaptador local e suas notificações. O futuro
adaptador Supabase deverá implementar operações transacionais autorizadas no
servidor e atualizar o estado de leitura. O callback de transação local não deve
ser traduzido em várias escritas independentes no navegador.

Identificadores permanentes do aluno e da matrícula são preservados, inclusive no
desligamento. As futuras entregas e pendências podem referenciar esses vínculos;
nenhum contrato, código ou documento do módulo de materiais foi alterado.

Painel e oficinas mantêm apresentação e escopo de 2026, obtendo ocupação e vagas
da mesma fonte da Gestão de Alunos. As listas de turmas de chamadas usam esse
resumo para evitar contagens divergentes. A chamada concluída da Implementação 01
continua sendo uma consulta estática ilustrativa, não uma chamada recalculada ao
editar matrículas. RN-08 permanece intacta, sem chamadas por horário/aula.

Cada operação relevante registra tipo, data real da ação, autor explicitamente
fictício, vínculos e descrição. Edições registram os nomes dos campos alterados,
sem replicar documentos e contatos em eventos. Essa trilha local não equivale
à auditoria protegida do sistema futuro.

## Segurança e limites

Não há banco, Supabase, migrations, autenticação, RLS, armazenamento local, upload,
digitalização de formulários ou recebimento de documentos/fotos. Não existe
sincronização entre abas ou persistência após recarga. Os perfis e estados de
acesso negado são somente demonstrações de interface e não fornecem autorização.
Os campos são renderizados como texto React, sem interpretação de HTML ou execução
de conteúdo fornecido. Nenhuma credencial é exigida ou incorporada ao cliente.

Não usar dados reais, publicar como serviço operacional ou interpretar a validação
temporária como aprovação dos campos obrigatórios. Transferência fica desabilitada.
Materiais, chamadas operacionais e importação permanecem fora desta implementação.

## Verificação

- `npm test`: 24 testes Vitest aprovados, cobrindo os 13 cenários solicitados e
  confirmações, repetição de operações, integridade entre anos, data inválida,
  promoção bloqueada e disputa pela última vaga na memória.
- `npm run build`: TypeScript estrito e Vite concluídos sem erros. Novas páginas
  são carregadas sob demanda, preservando as rotas e o layout existentes.
- Vitest 5.1.0 foi fixado após conferir seus requisitos com Node 24.21.0 e Vite
  8.3.8 ([guia oficial](https://vitest.dev/guide/)); o lockfile registra a resolução.
- Playwright CLI: cadastro incompleto/validado, edição com dois responsáveis,
  alerta e conferência de duplicidade, matrícula com cancelamento/confirmação,
  bloqueio de segunda matrícula, bloqueio de provisório, consulta de outro ano,
  espera em turma lotada, promoção recusada por lotação e por cadastro provisório,
  desligamento e promoção manual de interessado escolhido pela administração.
- Conferida coerência após as operações: 80 matriculados/20 vagas no painel,
  21 alunos no matutino 01 e 18 no vespertino 02, sem alteração indevida de turno.
- Filtros combinados e estados de carregamento, vazio, erro e acesso negado
  exercitados no navegador; listagem e formulário verificados em computador e
  celular, com capturas e verificações de transbordamento horizontal. Formulário
  conferido em 320, 390, 768 e 1440 pixels; confirmação também conferida no celular.
- Rotas dos oito módulos preservadas e verificadas, assim como a consulta docente,
  o acesso negado a turma docente inexistente e a ficha de aluno inexistente.
  A verificação final do console retornou zero erros e zero avisos.

As capturas e roteiros de execução ficam em `output/playwright/`, ignorado pelo
controle de versão. Os testes permanentes das regras estão junto aos serviços.
O registro acima descreve o ambiente demonstrativo, não comprova segurança de
banco, comportamento multiusuário, políticas de retenção ou testes de produção.

## Inventário de arquivos

Criados:

- `src/modules/students/types.ts`
- `src/modules/students/data/seed.ts`
- `src/modules/students/data/repository.ts`
- `src/modules/students/data/store.ts`
- `src/modules/students/services/selectors.ts`
- `src/modules/students/services/studentService.ts`
- `src/modules/students/services/studentService.test.ts`
- `src/modules/students/forms/studentSchema.ts`
- `src/modules/students/forms/StudentForm.tsx`
- `src/modules/students/components/StudentUI.tsx`
- `src/modules/students/pages/StudentFormPage.tsx`
- `src/modules/students/pages/StudentDetailPage.tsx`
- `src/modules/students/pages/EnrollmentPage.tsx`
- `src/modules/students/pages/WaitlistPage.tsx`
- `docs/implementacao-02-alunos.md`

Modificados:

- `src/modules/students/pages/StudentsPage.tsx`
- `src/app/App.tsx` e `src/app/styles.css`
- `src/shared/data/demo.ts`
- `src/modules/dashboard/pages/DashboardPage.tsx`
- `src/modules/workshops/pages/WorkshopsPage.tsx`
- `src/modules/attendance/pages/AttendancePage.tsx` (somente resumo de turmas)
- `package.json`, `package-lock.json`, `README.md` e `docs/README.md`

## Dependências antes de integrar com Supabase

1. Aprovar campos obrigatórios, procedimento de validação e critérios de
   correspondência de cadastros sem documentos.
2. Aprovar estados, vigência, encerramento anual e eventual reversão de desligamento.
3. Definir semântica de transferência entre turmas, turnos e oficinas, incluindo
   efeito sobre oficina fixa anual e histórico. Ação atual permanece informativa.
4. Definir identificação, ordenação, validade e tratamento definitivo da espera.
5. Revisar modelo, operações transacionais, restrições por unidade, permissões
   e projeções mínimas docentes; implementar e testar Auth/RLS em etapa própria.
6. Aprovar retenção, auditoria, recuperação e backups; validar infraestrutura e
   catálogo/configurações reais das turmas sem usar dados reais no desenvolvimento.

Próxima etapa recomendada: revisão desta demonstração com a administração e
consolidação das pendências de alunos/matrículas. Somente após aprovação, planejar
a integração transacional com Supabase, testes de autorização/concorrência e
migração revisada. A implementação de materiais requer uma etapa própria.

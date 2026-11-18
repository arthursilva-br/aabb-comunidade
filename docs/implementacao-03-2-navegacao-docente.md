# Implementação 03.2 — Navegação docente

Entrega autorizada em 17/11/2026, demonstrativa, com dados fictícios em memória.
Preserva RN-01 a RN-27 e as funcionalidades da 03.1. Sem Supabase, migrations,
autenticação real ou alterações em materiais e nas regras de matrícula.

## Rotas e uso

- `/professor` redireciona para `/professor/turmas`.
- `/professor/turmas`: data atual de Brasília por padrão, seletor de data e
  botão Voltar para hoje; cartões autorizados ordenados por turno, oficina e
  turma. Quantidades usam participantes fixados, se chamada já aberta, ou
  matrículas elegíveis na data. Não contém calendário mensal.
- `/professor/calendario`: calendário independente com sete colunas fixas de
  domingo a sábado, mês/ano, filtros de oficina e turma, resumo e legenda.
  Células contêm apenas dia e indicadores; nomes, turno, totais e ações ficam
  abaixo da grade após selecionar a data. Os indicadores têm descrições
  acessíveis completas; não há conclusão global do dia que esconda turno pendente.
- `/professor/turmas/:turmaId/chamadas/:chamadaId`: mantém abertura explícita,
  rascunho automático, justificativas, marcação coletiva com confirmação de
  substituição, conferência nominal e confirmação final. Concluída fica em
  consulta, com correção por motivo e histórico.

Estados: Pendente/Fazer chamada; Rascunho/Continuar chamada; Concluída/Ver chamada;
Sem atividade sem ação de abertura; Prevista futura sem registro antecipado.
Serviços de abertura, marcação e conclusão também bloqueiam datas futuras.

## Contexto de navegação

`data`, `mes`, `oficina`, `turma` e `atrasadas` ficam na URL. Links de chamada
levam a origem codificada em `origem`, restrita a caminhos docentes internos.
Retorno mantém mês, data e filtros; URL direta ou inválida recebe retorno seguro
para Minhas turmas. Trocar turma preserva data/origem, lista somente autorizadas
do ano e não abre uma chamada automaticamente. O perfil fictício é compartilhado
entre as duas páginas durante a sessão; recarga restaura o perfil demonstrativo
padrão e os dados iniciais, preservando somente os parâmetros da URL.

Troca rápida aguarda as filas de salvamento. Links internos também são
interceptados enquanto há rascunho não salvo: aguardam sucesso ou informam falha
com opção de tentar salvar novamente, sem descartar marcações. Recarregar/fechar
com escrita pendente usa o aviso nativo de saída. O histórico nativo do navegador
não é bloqueado por esse interceptador; os controladores permanecem na sessão,
permitindo retomar eventual falha ao voltar. Não é garantia de persistência.

Após concluir, há mensagem de sucesso, retorno às turmas na mesma data e acesso
ao calendário com contexto. Somente concluir mediante conferência e confirmação.

## Celular

Duas opções: Minhas turmas e Calendário, com ícone, texto e estado ativo. Até
760 px, a barra inferior substitui o menu lateral; acima disso usa o menu lateral.
Há 88 px de espaço mais safe-area inferior, superior aos 71 px medidos da barra.
Ao focar campos editáveis no celular, a barra se oculta para liberar espaço ao
teclado. Não há terceiro menu. A grade permanece com sete colunas em todas as
larguras e tem altura reduzida por dia, sem cartões grandes dentro das células.

## Investigação e correção dos 456 atrasos

A configuração anterior aplicava dias úteis desde janeiro, sem início operacional.
Duas turmas do professor fictício 1 produziam 228 dias úteis cada até 16/11/2026:
456 chamadas previstas indevidamente para a demonstração.

`ActivityCalendar` passa a aceitar `operationalFrom` e `operationalUntil`. O ano
letivo continua delimitando a vigência; dentro dele, início/fim operacional e
calendário semanal/exceções delimitam as atividades. Sem início configurado,
não se projetam atividades nem pendências. Início e fim são inclusivos. Exceções
não ultrapassam o período operacional. Chamadas já registradas preservam o
histórico; a configuração administrativa não pode retirar atividade dessas datas.

As quatro turmas iniciais recebem **01/11/2026 a 31/12/2026**, explicitamente
fictício, sem definir o início real da instituição. A administração pode configurar
as datas no formulário de calendário existente. Demais turmas só projetam
chamadas após configuração. Sem um período real confirmado, não se inventa uma
regra institucional definitiva.

No estado inicial, em 17/11/2026, professor 1 tem 24 previstas até hoje e 22
atrasadas (11 dias anteriores × 2 turnos). Pendentes, rascunhos e concluídas são
categorias distintas; atrasadas é subconjunto de pendentes/rascunhos anterior a
hoje. Futuro, finais de semana sem atividade e turmas sem autorização atual ficam
fora dos atrasos. O resumo mensal e o aviso usam a mesma fonte de calendário.
Os números mudam com data, configuração e conclusões, sem limite artificial.

## Verificações reais

- Vitest: **102 testes aprovados**, 74 anteriores preservados e 28 novos.
- Novos testes: hoje/data anterior/data inválida, grade em semanas de sete,
  virada de mês/ano, URLs diretas, origem segura, retorno com filtros, seleção
  sem mutação, ações por estado, participantes históricos, autorização,
  espera da fila de salvamento, falha/retry, período inicial/final, ausência
  de período, exceções, resumo, turnos independentes, rascunho e futuro bloqueado.
- Build: TypeScript estrito e Vite aprovados; permanece aviso de pacote inicial
  maior que 500 kB, sem erro de compilação.
- Playwright por navegador integrado: foi possível executar nesta etapa, sem
  alterar proteções do sistema. As falhas históricas do Chrome/Edge via CLI não
  impediram o teste pelo navegador integrado.
- Executados: carregamento em hoje; seleção anterior e Voltar para hoje; calendário
  separado; navegação entre meses; seleção de dia e filtro de turma; rascunho
  retomado com marcação preservada; troca rápida sem criação automática; retorno
  ao calendário com mês/data/filtro; conferência nominal; confirmação explícita;
  matutino concluído e vespertino pendente; período anterior sem atividade;
  professor sem autorização sem ações de chamada; seleção de dia por teclado.
- Calendário e conferência final verificados em **320, 375, 430, 768 e 1440 px**:
  zero transbordamento horizontal; sete colunas no calendário; barra inferior
  apenas no celular e menu lateral apenas em larguras maiores. Conferido espaço
  inferior reservado; screenshot inspecionado do calendário compacto em celular.
- Console do navegador: **zero erros e zero avisos** nos fluxos conferidos.
- Falhas de salvamento e atrasos usam testes automatizados de serviço/controlador;
  não foi injetada falha artificial pelo navegador. Não equivale a auditoria de
  acessibilidade, dispositivo físico, teclado virtual real ou teste de produção.

## Arquivos desta etapa

Criados:

- `src/modules/attendance/pages/TeacherClassesPage.tsx`
- `src/modules/attendance/pages/TeacherCalendarPage.tsx`
- `src/modules/attendance/components/TeacherProfile.tsx`
- `src/modules/attendance/components/TeacherClassCards.tsx`
- `src/modules/attendance/components/DraftNavigationGuard.tsx`
- `src/modules/attendance/services/teacherIdentity.ts`
- `src/modules/attendance/services/teacherNavigation.ts`
- `src/modules/attendance/services/navigationGuard.ts`
- `src/modules/attendance/services/teacherNavigation.test.ts`
- `docs/implementacao-03-2-navegacao-docente.md`

Modificados:

- `src/app/App.tsx` e `src/app/styles.css`
- `src/modules/attendance/pages/AttendancePage.tsx`
- `src/modules/attendance/types.ts`
- `src/modules/attendance/services/seed.ts`
- `src/modules/attendance/services/selectors.ts`
- `src/modules/attendance/services/calendar.ts`
- `src/modules/attendance/services/attendanceService.ts`
- `src/modules/attendance/services/draftService.ts`
- `src/modules/attendance/services/draftStore.ts`
- `src/modules/workshops/pages/WorkshopsPage.tsx` (datas operacionais no calendário)
- `src/modules/workshops/services/workshopService.ts` (validação dessas datas)
- `README.md` e `docs/README.md`

## Limitações e próxima validação

Dados e rascunhos continuam somente em memória. Calendário operacional é uma
configuração fictícia a validar. Autorização demonstrativa não protege dados de
produção; banco, Auth/RLS, concorrência remota e persistência dependem de etapa
própria. Validar o fluxo em celulares reais, inclusive teclado e área segura,
e confirmar início/fim operacional com a administração antes de integrar dados
reais. As funcionalidades da 03.1 e todos os testes anteriores foram preservados.

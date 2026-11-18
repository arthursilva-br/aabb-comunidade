# Implementação 03 — Oficinas, turmas e chamadas

Entrega demonstrativa de 17/11/2026, autorizada pelo pedido de Implementação 03.
As 27 regras aprovadas permanecem inalteradas. Dados exclusivamente fictícios,
em memória, sem Supabase, autenticação, migrations ou persistência.

## Fluxos disponíveis

- `/admin/oficinas`: criar/renomear oficinas, criar turmas por ano/turno,
  editar nome/capacidade, consultar matriculados e espera, autorizar/revogar
  titulares, adicionais e substitutos com vigência opcional e configurar calendário.
- `/admin/chamadas`: data, oficina, turno e situação; totais de finalizadas e
  pendentes na data; consulta dos participantes, justificativas e correções.
- `/professor/turmas`: seletor explicitamente fictício de professor e data;
  somente turmas com autorização vigente; acesso à chamada diária.
- `/professor/turmas/:turmaId/chamadas/:chamadaId`: abrir, marcar presença ou
  ausência, salvar justificativa, conferir totais e concluir após todas as marcações.
  Chamada finalizada admite correção ou justificativa posterior com motivo,
  antes/depois, autor fictício e horário preservados.

## Dados e integridade

O mesmo `StudentsRepository` armazena oficinas, turmas, matrículas, espera,
professores, autorizações, calendários, chamadas e auditoria. Não há outra fonte
para ocupação, participantes ou vagas. O painel mantém seu contexto de 2026 e
12/11/2026, agora com indicadores calculados da fonte compartilhada. Os registros
estáticos de frequência da Implementação 01 foram substituídos pelo fluxo desta
etapa; nenhuma matrícula ou teste da Implementação 02 foi removido.

Capacidade é inteira, não negativa e nunca inferior à ocupação ativa. Espera não
ocupa vaga. Editar turma não muda oficina/ano/turno: isso contornaria a política
pendente de transferência. Autorizações são verificadas novamente nas operações,
com datas inclusivas e vigência na data atual de Brasília, inclusive ao corrigir
chamada antiga. Revogação é imediata e fica registrada na auditoria demonstrativa.
A demonstração impede titulares com períodos sobrepostos na mesma turma.

Calendário semanal e exceções são configuráveis, sem pressupor funcionamento
institucional real. Datas excepcionais devem pertencer ao ano da turma e não
podem constar simultaneamente como inclusão e exclusão. Turma nova começa sem
calendário e sem pendências. Não se permite remover atividade de data com chamada
registrada: preserva-se a integridade enquanto cancelamento não tem regra final.

A chave da chamada é turma/data, sem horário ou sessão. Abertura fixa IDs de
matrícula/aluno e nomes fictícios; registros posteriores não alteram participantes.
Não há faltas automáticas. Justificativa só é aceita em ausência e não muda a marca.
Mudar ausência para presença limpa a justificativa atual, mas preserva a ausência
e sua justificativa no histórico de correções.

## Critérios provisórios e limites

- Elegibilidade demonstrativa por dia: início menor ou igual à data e fim
  posterior à data; matrícula encerrada antes da data não participa. Entrada/saída
  no mesmo dia gera aviso de ambiguidade na abertura, sem regra definitiva.
- Calendário, restrição de titular sobreposto, limites técnicos de campos,
  critérios de data e preservação do calendário histórico são escolhas desta
  demonstração, sem alterar as regras aprovadas.
- Perfil, autorização e auditoria local podem ser manipulados no navegador.
  Não fornecem segurança de produção; o conjunto fictício está em memória.
- Não há sincronização entre abas, uso offline, conta real, retenção ou backup.
- Telas incluem carregamento, falha de carga com repetição, vazio, acesso negado
  docente e feedback de validação/operação. O adaptador local não faz requisições.
- Botões de marcação têm texto e estado pressionado; formulários têm rótulos,
  alvos de toque de 48 px e adaptação para telas pequenas. Validação visual real
  nas larguras solicitadas permanece pendente pelo bloqueio descrito abaixo.

## Verificações

- `npm test`: **47 testes aprovados**, 24 anteriores e 23 desta implementação.
  Cobrem os 20 cenários pedidos, incluindo ambos os turnos, autorização expirada,
  revogação, calendário/exceções, unicidade, ausência justificada, conclusão,
  correções e preservação após desligamento.
- `npm run build`: TypeScript estrito e Vite aprovados. Há aviso de pacote inicial
  maior que 500 kB; módulos novos usam carregamento sob demanda.
- Playwright CLI instalado foi localizado e a execução foi tentada. A primeira
  tentativa encontrou EPERM nos diretórios globais; arquivos de sessão foram
  redirecionados para `output/playwright/`. Chrome então encerrou com falha de GPU
  e permissões. A tentativa headless também não completou a inicialização.
  **Não há fluxos visuais aprovados nem capturas válidas desta etapa.**
  Conferir professor em 320/375/430 px e administração em computador é pendência.

## Inventário

Criados:

- `src/modules/attendance/types.ts`
- `src/modules/attendance/components/DemoUI.tsx`
- `src/modules/attendance/components/CallDetails.tsx`
- `src/modules/attendance/forms/EntryForm.tsx`
- `src/modules/attendance/services/seed.ts`
- `src/modules/attendance/services/selectors.ts`
- `src/modules/attendance/services/attendanceService.ts`
- `src/modules/attendance/services/attendanceService.test.ts`
- `src/modules/attendance/services/commands.ts`
- `src/modules/workshops/forms/ClassForm.tsx`
- `src/modules/workshops/forms/workshopSchema.ts`
- `src/modules/workshops/services/workshopService.ts`
- `docs/implementacao-03-oficinas-chamadas.md`

Modificados:

- `src/app/App.tsx` e `src/app/styles.css`
- `src/modules/attendance/pages/AttendancePage.tsx`
- `src/modules/workshops/pages/WorkshopsPage.tsx`
- `src/modules/dashboard/pages/DashboardPage.tsx`
- `src/modules/students/types.ts` e `src/modules/students/data/seed.ts`
- `src/shared/data/demo.ts`
- `README.md`, `docs/README.md` e `AGENTS.md` (estado autorizado da entrega)

## Antes do Supabase e próxima etapa

Concluir testes visuais e revisão prática com administração/professores. Aprovar
calendário real, participantes diante de movimentos no mesmo dia, encerramento
anual, cancelamento de atividade já registrada, prazos de correção, vigência e
revogação de professores, campos essenciais/contatos docentes e indicadores.

Depois, revisar contratos remotos e transações com unicidade turma/data,
autorização no instante de cada leitura/escrita, projeções mínimas, Auth/RLS,
concorrência, auditoria protegida, retenção e recuperação testada. Nada disso é
substituído pela demonstração. Materiais exige autorização de etapa própria.

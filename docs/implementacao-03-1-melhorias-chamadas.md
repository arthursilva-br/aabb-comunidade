# Implementação 03.1 — Melhorias no módulo de chamadas

Entrega demonstrativa autorizada em 17/11/2026. Preserva RN-01 a RN-27, dados
fictícios e fonte compartilhada. Não cria banco, migrations ou autenticação.

## Fluxo docente

1. Consultar calendário mensal e selecionar turma/data autorizada.
2. Abrir a chamada, mantendo participantes fixados na abertura.
3. Marcar diretamente presença/ausência; justificativa é salva ao digitar.
4. Acompanhar “Salvando...”, “Rascunho salvo” ou “Não foi possível salvar”.
5. Usar “Marcar todos presentes”, se desejado. Quando há marcações anteriores,
   confirmar a substituição em massa, incluindo justificativas do rascunho.
6. Selecionar “Conferir e concluir”, consultar nomes, quantidades, oficina,
   turno, data e justificativas; voltar para corrigir ou confirmar conclusão.
7. Após conclusão, consultar registros; “Corrigir chamada” abre o fluxo existente
   com motivo obrigatório, valor anterior/novo, autor e horário preservados.

## Rascunho e integridade

`draftController.ts` mantém estado e fila serial por chamada/perfil. Alterações
rápidas preservam a última intenção; revisões intermediárias ainda não enviadas
podem ser agrupadas. Alterações idênticas não disparam nova escrita. O indicador
só confirma salvamento após a promessa do repositório ser aceita. Falha mantém
as marcações locais, oferece nova tentativa e bloqueia a revisão/conclusão.

`draftStore.ts` preserva o controlador na sessão mesmo após navegação. Ao retornar,
um controlador salvo é reconciliado com a fonte compartilhada, inclusive se outro
perfil fictício alterou a chamada. A fila pode terminar depois de sair da tela.
Não há persistência após recarga/fechamento, sincronização entre abas ou garantia
de concorrência remota. O adaptador local opera indivisivelmente em memória.

`draftService.ts` revalida autorização atual, estado aberto e composição dos
participantes em cada gravação. A conclusão exige confirmação explícita, todos
marcados e igualdade entre os registros conferidos e os salvos. Isso bloqueia
uma revisão antiga. Não é possível usar o salvamento comum após a conclusão.
Justificativa nunca converte ausência em presença.

## Calendário, turnos e administração

`MonthlyCalendar.tsx` oferece mês/ano, navegação entre meses e filtro de oficina.
Cada dia exibe separadamente cada turma e seu turno, sem resumir os dois como
concluídos quando apenas um terminou. Professor vê somente vínculos atualmente
autorizados; a administração consulta todas as turmas da unidade demonstrativa.
Dias sem atividade não geram chamada nem pendência. Navegar não cria registros.

Situações: Concluída, Rascunho, Pendente, Prevista (futura) e Sem atividade.
O resumo considera somente atividades até hoje, inclusive, e mostra previstas,
concluídas, pendentes sem abertura, rascunhos e percentual concluído.

O aviso de atrasos considera datas estritamente anteriores a hoje e todos os
meses/anos das turmas autorizadas, separando pendentes e rascunhos; cada item
permite acessar a data correspondente. Atualiza ao concluir. Não se limita ao
mês mostrado e não inclui futuro ou dias sem atividade. Datas usam Brasília.

A área administrativa mantém os filtros diários e ganha calendário/resumo e
aviso de atrasos. Links mensais usam `?data=AAAA-MM-DD`, preservando o contexto
diário sem recarregar a aplicação. As consultas antigas preservam correções.

## Verificação realizada

- `npm test`: **74 testes aprovados**, sendo 47 anteriores e 27 desta etapa.
- Novos testes: presença/ausência direta, recuperação, estado de salvamento,
  falha/retry, todos presentes, confirmação de substituição, conclusão incompleta
  ou não salva bloqueada, nomes/totais da revisão, confirmação explícita,
  fila de alterações rápidas, repetição sem escrita, participantes inválidos,
  correção com histórico, permissões, calendário, turnos independentes,
  resumo mensal e atrasos sem datas futuras ou sem atividade.
- `npm run build`: checagem TypeScript estrita e Vite aprovados. Permanece aviso
  de pacote inicial maior que 500 kB; sem dependências novas.
- `git diff --check`: sem erros de espaços em branco.
- Playwright CLI: nova tentativa com Edge instalado, headless e timeout de
  inicialização, arquivos de sessão limitados a `output/playwright/`. A sessão
  encerrou antes da navegação. Não foram alteradas configurações globais nem
  desabilitadas proteções do sistema. A etapa anterior já registrava falha de GPU
  e permissões no Chrome. **Nenhum fluxo visual ou largura está aprovado.**
- CSS preparado para 320, 375, 430, 768 e 1440 px: grade do mês se adapta a
  uma, duas ou quatro colunas; campos fluidos e botões com texto. Verificação
  efetiva no navegador dessas larguras e com teclado permanece pendente.

## Arquivos

Criados:

- `src/modules/attendance/components/DraftCall.tsx`
- `src/modules/attendance/components/MonthlyCalendar.tsx`
- `src/modules/attendance/services/draftController.ts`
- `src/modules/attendance/services/draftService.ts`
- `src/modules/attendance/services/draftStore.ts`
- `src/modules/attendance/services/calendar.ts`
- `src/modules/attendance/services/draftService.test.ts`
- `docs/implementacao-03-1-melhorias-chamadas.md`

Modificados nesta etapa:

- `src/modules/attendance/pages/AttendancePage.tsx`
- `src/app/styles.css`
- `docs/README.md` e `README.md`

Nenhum código, teste, cadastro ou regra dos módulos de alunos/matrículas/materiais
foi modificado nesta atualização. Testes anteriores continuam aprovados; a
regressão visual desses módulos não foi executada por indisponibilidade do navegador.

## Limitações e pendências

Dados e rascunhos duram somente na sessão da aplicação. Autorização e auditoria
são simulações locais. Antes do Supabase: aprovar os critérios operacionais já
listados na Implementação 03, implementar persistência autorizada no servidor,
controle de concorrência e transações com RLS/Auth; testar recuperação, revogação,
edição simultânea e auditoria protegida. Validar visualmente o calendário e a
conferência com professores antes do uso operacional. Não há pesquisa de alunos
na chamada, relatório individual de frequência ou outras funcionalidades extras.

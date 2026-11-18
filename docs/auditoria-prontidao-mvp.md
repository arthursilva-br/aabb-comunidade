# Auditoria de prontidão do MVP

## Consolidação oficial de 18/11/2026

As [AD-01 a AD-12 estão aprovadas](decisoes-administrativas-aprovadas.md), integralmente descritas na referência central. Menções abaixo a AD ainda não aprovada ou parâmetro dependente de aprovação são registro do planejamento de 17/11/2026, substituído por essa consolidação. Permanecem pendentes a execução técnica e as validações institucionais expressamente enumeradas na AD-09. Aprovação não comprova funcionalidade implementada. RN-01 a RN-27 e materiais permanecem preservados.


Data: 17/11/2026. Parecer técnico para aprovação; nenhuma implementação operacional executada.

## Parecer executivo

**Não apto a receber dados reais ou operar em produção.** Existe um frontend
demonstrativo consistente para alunos, matrículas, vagas, oficinas e chamadas,
com fonte compartilhada em memória e 102 testes locais aprovados nesta auditoria.
Auth, banco, RLS, auditoria protegida, importação, relatórios operacionais e
recuperação ainda precisam ser implementados/verificados.

É possível preservar a experiência aprovada e boa parte dos componentes, mas não
substituir a memória por um cliente Supabase carregando a base inteira. Os
contratos de leitura precisam de recortes por usuário e os comandos precisam de
transações autorizadas no servidor. Não há comprovação de segurança multiusuário.

O [escopo do lançamento](lancamento-mvp-escopo.md) adia materiais e kits sem apagar
suas decisões. O [plano de execução](plano-implementacao-mvp.md) organiza a solução.

## Método, evidências e limites

Leitura integral de `AGENTS.md`, índice de documentação, decisões aprovadas e
pendentes, regras, requisitos, arquitetura, modelo, segurança, estrutura de
frontend, protótipos, identidade visual e relatórios 02, 03, 03.1 e 03.2.
Inspecionados roteamento, páginas, formulários, tipos, seeds, store, repositório,
seletores, serviços, controladores de rascunho e os quatro arquivos de testes.
Não foi localizado relatório independente da Implementação 01; seu estado foi
avaliado pelo código atual, README e relatos posteriores, sem atribuir a ela
uma versão de código isolada.

Foram consideradas as alterações já presentes na árvore de trabalho, inclusive
arquivos ainda não versionados. O `git status` inicial já continha alterações
em React e documentação das etapas anteriores. Nada disso foi revertido,
commitado ou tomado como alteração desta auditoria. Este parecer avalia a árvore
local, não garante que o repositório remoto contenha as mesmas entregas.

Não se abriram fontes com registros de crianças, não se extraíram listas reais,
não se acessaram contas/serviços do projeto e não se instalaram dependências.
A skill solicitada `security-best-practices` não consta dos catálogos de skills
disponíveis consultados (executor e cloud); não foi instalada. A análise usa as
regras locais e referências oficiais indicadas ao final.

### Vocabulário de prontidão

| Estado | Significado nesta auditoria |
| --- | --- |
| Implementado e verificado | Evidência direta de código e verificação local do item descrito; não implica prontidão operacional |
| Implementado somente como demonstração | Fluxo existe, mas depende de memória, perfil fictício ou dados de seed |
| Parcialmente implementado | Existe parte do fluxo/estrutura, faltando comportamento essencial |
| Não implementado | Código inspecionado não oferece a capacidade operacional |
| Não verificado | Não há execução/evidência suficiente para afirmar funcionamento no ambiente indicado |

Um fluxo pode estar implementado e verificado **na demonstração** e continuar
“somente demonstração” na matriz de prontidão operacional.

### Verificações executadas em 17/11/2026

| Verificação | Resultado | Alcance |
| --- | --- | --- |
| `npm test` | 102 testes, quatro arquivos, aprovados | Serviços/controladores/seletores com dados fictícios; 24 alunos, 23 oficinas/chamadas, 27 melhorias 03.1 e 28 navegação 03.2 |
| `npm run build -- --outDir output/auditoria-mvp-build` | TypeScript estrito e Vite concluídos | Build local; saída isolada em pasta ignorada, preservando `dist/` existente |
| Aviso do build | Pacote inicial de 509,98 kB minificado, 161,46 kB gzip; limite de aviso de 500 kB excedido | Risco a medir no celular/rede real; não foi tratado como erro ou vulnerabilidade comprovada |
| Runtime | Node 24.21.0; npm 11.19.0 | Dependências já instaladas; nenhuma instalação/atualização |
| Inventário local | Nenhum PDF/Excel/CSV ou outra fonte histórica candidata encontrada | Busca incluiu pastas ignoradas, exceto dependências e metadados Git; ver plano de migração |

Os testes visuais da 03.2 em 320/375/430/768/1440 px e os da 02 são **evidência
registrada nos relatórios anteriores**, não repetidos nesta auditoria. Os relatos
03 e 03.1 registram tentativas visuais sem sucesso; a 03.2 registra execução posterior
por navegador integrado. Não confundir essas tentativas nem estender os resultados
a celulares físicos, teclado virtual, acessibilidade integral ou produção.

Não executados: testes de banco/RLS, concorrência entre processos, Auth, restauração,
rede instável real, vulnerabilidades de dependências, pentest ou operação institucional.
Não há certificação de conformidade LGPD por esta análise.

## Rotas e pontos de entrada

Fonte: `src/app/App.tsx`. Rotas administrativas e docentes não têm guarda de
autenticação; acessar `/admin` diretamente é permitido na demonstração.

| Rotas | Implementação observada | Lacuna para lançamento |
| --- | --- | --- |
| `/`, `/admin` | Redirecionamento e painel | Sessão, função, unidade e contexto real de ano/data |
| `/entrar`, `/recuperar-acesso` | Escolha livre de área; recuperação é estado vazio | Login, logout, recuperação e sessão reais |
| `/admin/alunos`, `/novo`, `/:alunoId`, `/:alunoId/editar`, `/:alunoId/matricula`, `/espera` (sob `/admin/alunos`) | Fluxos completos na memória, formulário, revisão e confirmação | Persistência, autorização administrativa e ciclo anual aprovado |
| `/admin/oficinas` | Oficinas, turmas, capacidade, calendário, vínculos docentes | CRUD autorizado, vigência e histórico no banco |
| `/admin/chamadas` | Acompanhamento diário, calendário mensal, detalhes/correções | Consultas autorizadas; data padrão real e indicadores coerentes |
| `/professor`, `/professor/turmas`, `/professor/calendario` | Redirecionamento e navegação separada | Identidade real e leitura mínima por turma |
| `/professor/turmas/:turmaId/chamadas/:chamadaId` | Parâmetro `chamadaId` representa a data; serviço gera ID interno | Manter chave turma/data e contrato explícito de rota, sem horários/sessões |
| `/admin/usuarios`, `/admin/relatorios`, `/admin/importacao` | Conteúdo informativo | Operações reais ainda ausentes |
| `/admin/materiais` | Estoque estático fictício | Adiado; não publicar como saldo operacional |

## Matriz objetiva de prontidão

As referências de caminho abaixo são relativas à raiz. `students/`, `workshops/`
e `attendance/` abreviam `src/modules/<módulo>/`. Todas as fontes de execução
listadas nesta matriz são fictícias; não há persistência remota.

| Funcionalidade | Estado atual | Evidência / validação | Testes existentes | Adaptação e autorização necessárias |
| --- | --- | --- | --- | --- |
| Cadastro permanente e pesquisa | Somente demonstração, verificada localmente | `students/pages/StudentsPage.tsx`, `StudentFormPage.tsx`, `StudentForm.tsx`, `studentService.saveStudent`; IDs mantidos na edição | `studentService.test.ts`: cadastro, edição, filtros registrados na 02 | PostgreSQL, busca paginada e cadastro autorizado por unidade; AD-01 |
| Responsáveis e contatos | Parcial para modelo operacional | `Student.guardians[]`; formulário administrativo com múltiplos responsáveis; IDs reutilizados por posição. A chamada docente exibe nomes/marcações, sem consulta operacional de contatos | Cadastro/edição com responsáveis; não prova integridade relacional nem consulta docente de contatos | Relação N:M proposta em `modelo-dados.md`, identidades estáveis e consulta docente mínima de contatos autorizados; AD-01/05 |
| Validação cadastral | Somente demonstração | `studentSchema.ts`, `registrationIssues`: nome/nascimento e responsável com vínculo/telefone; documento opcional | Datas inválidas/futuras, incompleto, provisório | Revalidar no servidor; não elevar critério provisório a norma; AD-01 |
| Cadastros provisórios | Somente demonstração | Pode salvar incompleto; bloqueia matrícula/promoção e retorno a provisório com matrícula ativa | Casos específicos em `studentService.test.ts` | Estados e validação reais; pendências de importação vinculadas |
| Duplicidades | Parcial | `students/services/selectors.ts::possibleDuplicates`; documento normalizado, nome igual/contenção, nascimento e responsável; revisão sem fusão | Correspondências e manutenção separada | Busca restrita no servidor; revisão por campo/lote e política de correspondência; AD-07 |
| Matrícula anual única | Somente demonstração | `studentService.enroll/checkEnrollment`: ativa por aluno/ano/unidade, confirmação e vaga | Matrícula, segunda ativa, última vaga em memória | Restrição única parcial, FKs e transação; idempotência remota; AD-02 |
| Histórico cadastral/anual | Parcial | Ficha e `HistoryEvent`; conserva matrículas, campos alterados e desligamentos | Identidade e histórico preservados | Auditoria protegida com ator real, origem/datas incertas e política de retenção |
| Rematrícula | Parcial | `EnrollmentPage` permite outro ano com mesmo ID; 2027 existe no seed | Nova matrícula em outro ano preserva anteriores | Conferência explícita de contatos, ciclo anual/datas reais e transação; AD-01/02/04 |
| Lista de espera e promoção manual | Somente demonstração | `WaitlistPage`, `joinWaitlist/promote`; sem ocupação; confirmação manual | Lotação, duplicação, provisório, promoção e falha | Estados/validade e transação concorrente; AD-03 |
| Desligamento | Somente demonstração | `withdraw` marca desligada/fim e cria evento; repetição rejeitada | Vaga liberada uma vez e histórico preservado | Data operacional, ator autenticado e transação; AD-02 |
| Transferência, reingresso e encerramento anual | Não implementados | Transferência desabilitada na ficha; matrícula só ativa/desligada | Não há cobertura do ciclo definitivo | Aprovar AD-02/03; nunca editar ano/oficina da turma para simular transferência |
| Arquivamento cadastral | Não implementado | `Student` não tem estado de arquivo nem comando correspondente | Não há teste | Política e comando protegido; RN-26 e AD-09 |
| Cadastro de oficinas/turmas | Somente demonstração | `WorkshopsPage`, `ClassForm`, `classSchema`, `workshopService` | Casos no arquivo `attendanceService.test.ts` | Adaptador real, validação por unidade e catálogo; criar turma não deve copiar calendário/permissão automaticamente |
| Turnos, capacidade e ocupação | Somente demonstração | `SchoolClass.shift`, `occupancy/vacancies`; capacidade inteira e não inferior à ocupação na demo | Independência e redução bloqueada | Transação/travas concorrentes; confirmar política de redução em AD-03 |
| Cadastro funcional docente | Parcial | `Teacher` só ID/nome; três professores de seed, sem criação funcional na tela | Vínculos testados; não cadastro funcional real | Separar identidade, conta e autorização; AD-06 |
| Titular/adicional/substituto | Somente demonstração | `authorize`, `revoke`, `authorized`; datas inclusivas, autorização vigente hoje | Sem vínculo, validade, sobreposição de titular e revogação | Acesso no servidor e registro de revogação sem apagar vínculo histórico; AD-05/06 |
| Calendário e período operacional | Somente demonstração | `ActivityCalendar`, `hasActivity`, `workshopService.calendar`; semanal/exceções/início/fim | Exceções, vigência, ausência de período e preservação de chamada | Aprovar calendário real e início da cobrança; AD-04 |
| Uma chamada por turma/data | Somente demonstração | `attendanceService.open` rejeita duplicata e futuro; participantes da turma na abertura | Dois turnos, duplicata e futuro | UNIQUE turma/data, transação e elegibilidade no servidor |
| Rascunho automático | Somente demonstração | `DraftCall`, `draftController`, `draftStore` e `draftService.save`; fila por chamada/perfil | Fila, última intenção, falha/retry, repetição e participantes inválidos | Persistência confirmada, versão otimista e conflito entre usuários/dispositivos; sem estado global de todas as pessoas |
| Presença, ausência e conferência | Somente demonstração | `DraftCall` e `draftService.confirm`; todos marcados, confirmação explícita e igualdade com versão conferida | Incompleto/não salvo/revisão antiga bloqueados, totais e conclusão | Operação atômica com versão do banco; preservar interface |
| Justificativa e correção auditável | Somente demonstração | `EntryForm`, `mark`, `Correction`: antes/depois, motivo, nome e instante; ausência mantida | Motivo, justificativa posterior e troca para presença | Ator obtido da sessão no servidor, trilha imutável e controle de versão/prazos; AD-05 |
| Participantes históricos | Parcial | `eligibleEnrollments` por datas, snapshot fixado na abertura e ambiguidades no mesmo dia | Snapshot após desligamento e entrada no mesmo dia | Datas civis de Brasília, ciclo definitivo, lista congelada e conferência de casos ambíguos; AD-02/04 |
| Calendário docente e atrasos | Somente demonstração | `TeacherCalendarPage`, `TeacherClassCards`, `calendar.ts`, `teacherNavigation.ts` | 03.1/03.2: mês/ano, estados, hoje, retornos, independência e atraso | Consulta por escopo, projeção eficiente e marco de início para não gerar pendências de 2026 |
| Frequência individual por período | Não implementada como relatório | Existem contagens da chamada; percentual mensal é de chamadas concluídas, não presenças do aluno | Não há fórmula de frequência institucional testada | Denominador, elegibilidade e período em AD-08; incluir ausências justificadas no total de ausências |
| Painel | Parcial | `DashboardPage` e `shared/data/demo.ts`; ocupação derivada, ano 2026/data 12/11/2026 e 12 oficinas fixos | Coerência de ocupação nos serviços; UI anterior registrada | Ano/data reais, consultas agregadas autorizadas, indicadores aprovados |
| Relatórios essenciais | Não implementados | `ReportsPage` só cartões “Em preparação” | Nenhum teste de relatório | Consultas/filtros/exportação mínima; AD-08 |
| Importação assistida | Não implementada | `InterchangePage` só instruções; sem upload/parser/lote | Nenhum teste de arquivo, conflito ou reprocessamento | Receber layout, implementar staging/revisão/commit protegido; AD-07/09 |
| Exportação essencial | Não implementada | Nenhum comando de geração de arquivo no módulo | Nenhum teste | Projeções mínimas administrativas, escape de fórmulas, rastreio; AD-08 |
| Login, recuperação e usuários | Não implementados | `DemoEntryPage`, `UsersPage`, `teacherIdentity`; escolha livre de área/perfil | Seleção fictícia não testa Auth | Auth e gerenciamento por servidor confiável, sem credencial privilegiada no cliente; AD-06/10 |
| RLS e isolamento por unidade/campo | Não implementados | Sem SDK/banco/migrations; UI lê snapshot integral | Nenhum teste de API/RLS | Políticas, grants, projeções mínimas e testes adversariais de banco |
| Auditoria protegida | Não implementada | `events` e `audit` mutáveis na memória; nomes fictícios como autores | Histórico demonstrativo testado | Trilha protegida e transacional, retenção/acesso definidos; AD-09/10 |
| Backups, restauração e monitoramento | Não implementados no repositório; infraestrutura não verificada | Nenhum procedimento executável/configuração operacional observado | Nenhum teste de restauração | Plano contratado, automação comprovada e ensaio de recuperação; AD-11 |
| Celulares físicos e acessibilidade completa | Não verificados | CSS e relato visual 03.2; rótulos/estados textuais e navegação inferior | Testes de serviço; execução visual anterior documentada | Homologação com pessoas e aparelhos reais; AD-12 |

## Dados, regras e contratos atuais

`students/data/seed.ts` cria 85 alunos fictícios, responsáveis aninhados, duas
oficinas, 12 turmas distribuídas em 2025/2026/2027, 79 matrículas ativas em 2026,
duas desligadas (uma em 2025) e dois interessados. `attendance/services/seed.ts`
acrescenta três professores, quatro autorizações titulares e calendários de
01/11 a 31/12/2026 para as quatro turmas iniciais. Chamadas/auditoria começam vazias.
Nada disso define capacidade, calendário ou identidade institucional reais.

`StudentsRepository` contém `getSnapshot`, `subscribe`, `load` e
`transaction(callback)`. A implementação clona, altera e congela recursivamente
o estado numa operação síncrona, sem `await` entre validação e publicação.
`useStudentsData` publica esse snapshot por `useSyncExternalStore`; `load` não faz
rede. Uma recarga recria o seed. Rascunhos ficam num `Map` de controladores da
sessão JavaScript; o aviso de saída não os torna duráveis.

`StudentCommands` já separa comandos assíncronos da apresentação, mas
`EnrollmentInput` não tem chave de requisição/versão. Serviços de oficinas e
chamadas são factories com o repositório injetado; `commands.ts` fixa o singleton
de memória. `DemoRepository.listClasses()` em `shared/data/contracts.ts` é um
contrato pequeno de resumo e não cobre os casos de uso operacionais.

Zod/React Hook Form validam alunos/matrícula e `classSchema` valida turmas.
Vigência, calendário, marcações, correções e confirmação usam verificações
imperativas nos serviços. São regras úteis para testes de regressão e feedback,
mas não representam uma fronteira de confiança. O navegador fornece IDs,
confirmações, autoria fictícia e todo o conteúdo a alterar.

## Achados que exigem tratamento

| ID / gravidade | Evidência e consequência | Tratamento recomendado |
| --- | --- | --- |
| A-01 — bloqueante | Rotas abertas e perfis escolhidos pelo usuário em `App`, `DemoEntryPage` e `TeacherProfile` | Auth e autorização de servidor antes de qualquer dado real; guarda visual é complementar |
| A-02 — bloqueante | Snapshot global contém cadastros completos de todas as turmas, inclusive responsáveis/documentos | Separar consultas administrativas paginadas e projeções docentes; nunca carregar tudo e filtrar só no React |
| A-03 — bloqueante | Memória e fila local não sobrevivem a recarga e não controlam dois clientes | Banco, confirmação de gravação, versões e idempotência; testar conflito/conclusão concorrente |
| A-04 — bloqueante de migração | `class_teachers` proposto usa FK de `auth.users`, impedindo vínculo histórico sem conta | Introduzir cadastro funcional independente e separar vínculo histórico de concessão de acesso; ver plano de migração |
| A-05 — bloqueante de integridade | Estados só ativa/desligada; `startedAt` ao matricular é o instante da operação, mesmo para outro ano | Distinguir instante de registro de vigência efetiva; aprovar encerramento e histórico com datas desconhecidas; não importar 2026 pelo comando atual |
| A-06 — bloqueante de operação | Copiar calendário antigo pode projetar pendências sobre todo 2026 sem evidência diária | Separar calendário histórico do início aprovado de acompanhamento digital; frequência ausente permanece desconhecida |
| A-07 — alto | `saveStudent` reutiliza IDs dos responsáveis pelo índice do array; remover/reordenar pode trocar identidade | Usar IDs estáveis de responsáveis/vínculos no contrato remoto; atualizar dentro da transação |
| A-08 — alto | `revoke` remove autorização do array; auditoria de oficina serializa tabelas inteiras antes/depois | Preservar concessão/revogação com autor/instante; registrar mudanças mínimas por entidade, evitando cópias integrais de pessoas |
| A-09 — alto | `eligibleEnrollments` usa `.slice(0,10)` de instantes UTC, enquanto `today` usa Brasília | Datas de atividade/vigência civis explícitas e instantes UTC separados; testar borda da meia-noite em Brasília |
| A-10 — alto | `close` legado conclui com todos marcados, mas não recebe conferência/versão/confirmado; UI nova usa `draftService.confirm` | Expor uma única operação remota de conclusão com conferência e versão; não publicar bypass legado |
| A-11 — alto | `authorized` testa apenas professor e autorização local; comandos administrativos não autenticam ator; unidade é fixa | Perfil ativo/unidade/vigência verificados no banco em toda ação; autoria imutável pelo cliente |
| A-12 — médio | `DashboardPage`, resumo compartilhado e acompanhamento diário administrativo usam data/ano demonstrativos | Contexto operacional explícito e relógio confiável; total de oficinas configuradas distinto de “12 previstas” |
| A-13 — médio | `MonthlyCalendar` administrativo filtra linhas por oficina, mas calcula resumo com `all` | Indicar total global ou aplicar mesmo filtro às linhas/resumo; testar reconciliação com relatórios |
| A-14 — médio | `overdueRows` percorre todos os meses/anos autorizados e o cliente recebe toda a memória | Consultar atividades pendentes por período com índices/paginação; medir em rede móvel |
| A-15 — controle de entrega | Arquivos 03/03.1/03.2 e alterações existentes ainda não estão todos versionados | Revisar diff e versionar somente código/documentação autorizados em etapa própria; não fazer commit automático nesta auditoria |

Os achados apontam inadequações para produção, não alegam que haja vazamento real
na demonstração fictícia. Não se fez varredura de segredos no histórico Git nem
auditoria de vulnerabilidades do lockfile; esses controles permanecem no plano.

## Preservação e substituição gradual

Preservar layouts, componentes shadcn/ui, rótulos e feedback, filtros/contexto de
URL, página independente de calendário, navegação docente, ficha anual, revisão
nominal e confirmações. Preservar também a semântica das RN exercitada nos testes,
separando critérios provisórios dos parâmetros aprovados.

Adaptar `store.ts` para leitura carregada por escopo/sessão e invalidação após
comandos. As páginas podem manter sua apresentação, recebendo modelos de leitura
equivalentes, em vez de serem reescritas. Será necessária adaptação das ligações
de dados e alguns estados de erro/conflito; não se promete troca transparente de
um único arquivo.

Os callbacks de `transaction` **não** podem ser enviados ao Supabase nem convertidos
em várias escritas do navegador. Implementar contratos de caso de uso explícitos
e mapeá-los a operações atômicas. Os testes de memória continuam regressões;
criar testes de contrato/banco com usuários distintos para provar a implementação real.

## Preparação técnica de Supabase — recomendação, não execução

| Camada | Preparação necessária |
| --- | --- |
| PostgreSQL | Esquema mínimo sem materiais, FKs coerentes por unidade/ano, NOT NULL/CHECK aplicáveis, matrícula ativa única e chamada única turma/data; consultar versão efetiva do projeto futuro |
| Operações críticas | Cadastro/responsáveis, matrícula/rematrícula, promoção, desligamento, alteração de capacidade, abertura/conclusão/correção e confirmação de importação em transações; travar recursos em ordem estável, registrar auditoria e aceitar chave de idempotência |
| Concorrência | Índices únicos não bastam para capacidade; serializar disputa pela turma e matrícula anual; rascunho/correção com versão esperada e rejeição de revisão obsoleta |
| Supabase Auth | Contas individuais, convite/recuperação, perfil ativo e vínculo funcional opcional; administração de contas em servidor confiável que autentique e autorize o administrador |
| RLS e grants | Negar anônimo/perfil inativo; admin só sua unidade; professor só concessão vigente e turma; restringir escrita direta; projeções mínimas sem SELECT integral de aluno/responsável |
| Funções/views | Revalidar IDs e unidade; não confiar no papel enviado pelo cliente; funções elevadas com `search_path` fixo, grants mínimos e revisão; views não devem contornar RLS |
| Auditoria | Ator da sessão no servidor, instante, entidade, operação, antes/depois necessário e motivo; escrita protegida; sem senha/token nem payload integral de importação em logs |
| Migrations | Versionadas e revisadas, aplicação reproduzível em banco vazio; dados de seed exclusivamente fictícios; evolução aditiva para materiais depois |
| Ambientes | Desenvolvimento e homologação com dados fictícios; produção isolada com acesso institucional restrito; nenhuma chave privilegiada em `VITE_*` ou no bundle |
| Recuperação | Backup automático comprovado no plano escolhido, acesso restrito e restauração ensaiada; incluir dependências de Auth/configuração e procedimento de contingência |

As políticas precisam consultar a situação atual de perfil e concessão, não apenas
claims antigas, para impedir acesso de conta desativada ou substituto revogado
com token ainda válido. Dados já exibidos não podem ser “desvistos”; limpar caches
na saída/revogação e minimizar a leitura desde o início.

As recomendações de integridade/concorrência aplicam as RN ao modelo proposto;
não definem estados de matrícula, calendário ou acesso histórico ainda pendentes.

## Segurança e proteção de dados

Recomenda-se à instituição documentar finalidade, base legal, necessidade dos
campos, transparência, responsáveis e retenção antes da carga. A LGPD exige
medidas de segurança e prevê direitos dos titulares [S1]. O entendimento da ANPD
admite diferentes hipóteses legais, com prevalência do melhor interesse de crianças
e adolescentes [S2]. A instituição deve validar a hipótese aplicável; esta
auditoria não presume consentimento como solução universal.

Aplicação ao projeto: aprovar projeção docente mínima, limitar texto livre de
justificativas, evitar informação de saúde desnecessária, proteger importação,
exportação, auditoria e backups, e manter procedimento de direitos e incidentes.
Arquivamento não autoriza retenção ilimitada. Definir também responsabilidades
e condições dos fornecedores, localização/trânsito de dados e eventual avaliação
de impacto, com apoio institucional/jurídico. Não declarar conformidade só por usar RLS.

Para Auth administrativo, a documentação do provedor exige ambiente confiável e
segredo fora do navegador [S3]. RLS deve ser combinada com grants e consultas
seguras [S4]; restrição de linha não substitui proteção de colunas [S5]. O plano
efetivo de backup precisa ser confirmado; a documentação distingue recursos por
plano e não inclui conteúdo de objetos Storage nos backups de banco [S6]. Não
há necessidade aprovada de armazenar formulários físicos ou arquivos de alunos.

### Referências externas consultadas em 17/11/2026

- [S1 — LGPD, texto atualizado disponibilizado pela Câmara](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.pdf), em especial arts. 6º, 14, 18 e 46 a 48. O endereço do Planalto consultado apresentou desafio de acesso automatizado.
- [S2 — ANPD: tratamento de dados de crianças e adolescentes](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-divulga-enunciado-sobre-o-tratamento-de-dados-pessoais-de-criancas-e-adolescentes).
- [S3 — Supabase: Auth Admin API](https://supabase.com/docs/reference/javascript/admin-api).
- [S4 — Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
- [S5 — Supabase: Column Level Security](https://supabase.com/docs/guides/database/postgres/column-level-security).
- [S6 — Supabase: backups](https://supabase.com/docs/guides/platform/backups).
- [S7 — PostgreSQL: constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) e [locks](https://www.postgresql.org/docs/current/explicit-locking.html), para revisão do esquema/transações na versão efetivamente utilizada.

As fontes fundamentam recomendações, não comprovam configuração de infraestrutura
inexistente. Revalidar requisitos legais e recursos do plano no momento da implantação.

## Conclusão para aprovação

Há base reutilizável de interface e regras demonstrativas. Os bloqueantes são
persistência/autorização, ciclo anual, projeção docente, histórico de professores,
fontes de migração, auditoria e recuperação. Decisões AD-01 a AD-12 estão
centralizadas no [escopo](lancamento-mvp-escopo.md). A próxima execução recomendada
é a fundação segura e testável do backend em ambiente fictício, conforme o
[plano](plano-implementacao-mvp.md), após aprovação e autorização próprias.

## Atualização aplicável ao planejamento

Este adendo não repete os testes de 17/11 nem altera suas evidências. Propostas anteriores substituídas: AD pendentes, adiamento de transferência, CSV indefinido, campos/ciclo/sessão/backup por decidir. As decisões agora aprovadas permanecem requisitos de implementação, não capacidades comprovadas. As lacunas operacionais e bloqueantes de dados reais continuam vigentes.

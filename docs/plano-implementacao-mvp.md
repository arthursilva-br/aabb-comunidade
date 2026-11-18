# Plano de implementação do MVP

## Consolidação oficial de 18/11/2026

As [AD-01 a AD-12 estão aprovadas](decisoes-administrativas-aprovadas.md), integralmente descritas na referência central. Menções abaixo a AD ainda não aprovada ou parâmetro dependente de aprovação são registro do planejamento de 17/11/2026, substituído por essa consolidação. Permanecem pendentes a execução técnica e as validações institucionais expressamente enumeradas na AD-09. Aprovação não comprova funcionalidade implementada. RN-01 a RN-27 e materiais permanecem preservados.


Data: 17/11/2026. Proposta para aprovação, sem execução da próxima implementação.

Objetivo: transformar a demonstração em operação segura, preservando interfaces,
regras e histórico. [Escopo e decisões AD](lancamento-mvp-escopo.md),
[auditoria](auditoria-prontidao-mvp.md), [migração](plano-migracao-2026-2027.md) e
[homologação](criterios-homologacao-mvp.md) são as referências desta sequência.

## Prioridades e portões

- **P0 — bloqueante:** fundação de integridade, acesso, proteção dos dados e
  recuperação. Nenhum dado real no ambiente novo antes do portão de segurança.
- **P1 — operação inicial:** fluxos que completam o uso diário durante a preparação.
  P1 também precisa estar concluído para o lançamento; não significa opcional.
- **P2 — posterior:** melhora que pode esperar sem impedir o recorte aprovado.

Não existe estimativa de prazo suficientemente fundamentada. Faltam fontes,
decisões e ensaios de backend/infraestrutura. Prioridade e dependência, não data
arbitrária, orientam a ordem. Desenvolvimento/homologação usam dados fictícios;
recebimento/migração real ocorrerão em ambiente institucional controlado e autorizado.

## Sequência recomendada

1. Aprovar escopo e resolver decisões necessárias ao núcleo; receber informação
   estrutural dos layouts sem trazer pessoas para desenvolvimento.
2. Revisar modelo mínimo, contratos, permissões e histórico funcional dos professores.
3. Autorizar uma etapa técnica de fundação: migrations versionadas, Auth/RLS,
   auditoria e testes de contrato/banco num ambiente isolado fictício.
4. Integrar alunos/responsáveis, turmas, matrículas, vagas, espera e rematrícula;
   consolidar provisionamento administrativo/docente.
5. Integrar calendário, rascunhos, chamadas/correções; concluir relatórios e saídas essenciais.
6. Implementar importação assistida a partir do layout confirmado e ensaiar com
   arquivos sintéticos. Em paralelo à preparação funcional, comprovar recuperação
   e concluir os procedimentos institucionais.
7. Homologar com usuários/dispositivos e testar segurança/concorrência. Somente
   após portão de dados reais, realizar carga controlada de 2026 e reconciliação.
8. Preparar turmas/contas/concessões de 2027, homologar rematrícula e liberar
   operação formalmente. Implantação, contas e carga exigem autorização posterior.

Etapas dependentes não devem avançar sobre uma decisão ausente fingindo que o
critério provisório da demonstração foi aprovado.

## Backlog verificável

Cada linha informa objetivo, implementação recomendada, dependência, risco e
critério de conclusão. IDs T são tarefas deste plano, não regras RN.

| ID / prioridade | Objetivo e implementação recomendada | Dependências | Risco a tratar | Critério de conclusão |
| --- | --- | --- | --- | --- |
| T01 — P0 | Consolidar AD-01/02/03/05 e decisões de segurança; registrar ata de campos, ciclo anual, operações habilitadas e projeção docente | Aprovação do pacote e participação administrativa | Cristalizar estados ou obrigatórios provisórios | Decisões registradas, exemplos fictícios aprovados e bloqueios restantes explícitos por funcionalidade |
| T02 — P0 | Revisar modelo mínimo: unidade/pessoas/responsáveis, professores independentes de Auth, vínculos/concessões, turmas, matrícula, espera, calendário/chamada, auditoria e preparação de importação | T01; AD-06/07 para partes específicas | Perder história, forçar contas de 2026 ou inventar datas | Modelo revisado com integridade, vigência, incertezas históricas, matriz de acesso e migrações futuras de materiais possíveis |
| T03 — P0 | Definir contratos de leitura/comandos e estratégia de adaptação; separar catálogo administrativo de projeções docentes e RPCs | T02 | Adapter remoto carregar snapshot de toda a unidade para professor | Contratos restritos, erros/versão/idempotência definidos e plano de migração por módulo, sem reescrever apresentação |
| T04 — P0 | Preparar ambiente técnico isolado e migrations revisadas; conferir versões efetivas e dependências, sem credenciais no cliente | Autorização técnica posterior, T02/03 e parâmetros de AD-11 | Misturar desenvolvimento e produção; migrations irreproduzíveis | Banco fictício reconstruído do zero, migrações/testes versionados, lockfile revisado e ambientes identificados |
| T05 — P0 | Implementar Auth/sessão/saída/recuperação e perfil ativo; provisionamento administrativo inicial por procedimento seguro | T04, AD-06/10 | Cadastro público indevido, escalada de papel ou conta compartilhada | Login individual e recuperação testados; nenhum usuário escolhe privilégio; segredo privilegiado só no servidor confiável |
| T06 — P0 | Implementar RLS, grants, projeções docentes e autorização por unidade/turma/vigência, incluindo RPCs e views | T02/04/05, AD-05 | ID alterado, leitura direta ou token antigo contornar restrição | Testes de API/banco negam outra turma/unidade, campos excessivos, inativo e concessão revogada/expirada; admin limitado à unidade |
| T07 — P0 | Implementar integridade e operações atômicas de matrícula/rematrícula/promoção/desligamento/capacidade | T02/04/06, AD-02/03 | Duas últimas vagas ocupadas, duplicação em retry e atualização parcial | UNIQUE da ativa anual, FKs e travas; disputa concorrente real aceita só operação possível; falha não deixa efeito parcial |
| T08 — P0 | Implementar auditoria protegida no servidor, com ator/instante e mudanças mínimas por entidade | T04/05/06, AD-09/10 | Cliente forjar/apagar autor ou replicar dados desnecessários | Toda operação relevante gera evento na transação; usuário não edita/apaga trilha; tokens/senhas/payloads integrais ausentes dos logs |
| T09 — P0 | Definir política institucional de dados: finalidade/base legal, retenção, responsáveis, direitos, fornecedores e incidentes | AD-09 e apoio institucional | Operar sem responsabilidade ou guardar dados indefinidamente | Procedimentos aprovados e responsáveis designados; acesso/eliminação/arquivamento e comunicação de incidente tratáveis |
| T10 — P0 | Preparar infraestrutura e recuperação: HTTPS, ambiente de produção separado, backup automático protegido, restauração, monitoramento e contingência | AD-10/11, T04 e autorização de preparação posterior | Presumir backup do plano; restauração incompleta | Plano/recursos comprovados, ensaio fictício recupera dados/configuração necessária e mede RPO/RTO aprovados; alertas/contingência testados |
| T11 — P1 | Integrar cadastro/responsáveis e ficha/histórico; paginação/busca e arquivamento; IDs estáveis em formulários | T03/05/06/08, AD-01/09 | Responsável trocar de identidade por posição; salvar base inteira | Cadastro/edição persistem em nova sessão, vínculos preservados, provisório bloqueado para matrícula e arquivamento sem apagar história |
| T12 — P1 | Integrar oficinas/turmas/turnos/capacidades e vínculos docentes históricos | T02/03/06/07/08, AD-04/06 | Misturar anos, copiar capacidade demonstrativa e remover vínculos revogados | Turmas anuais configuráveis, vagas reconciliadas e histórico docente sem depender de conta |
| T13 — P1 | Integrar matrícula/espera/desligamento e fluxo simplificado de rematrícula 2027 nas páginas existentes | T07/11/12, AD-01/02/03 | Ano errado, retorno duplicado ou rematrícula automática | Fluxos persistentes, revisão explícita de dados/ano, matrícula 2026 intacta, espera manual e contagens corretas |
| T14 — P1 | Implementar gestão de contas/concessões pela administração, contatos docentes mínimos e vigências/revogações | T05/06/08/12, AD-05/06/10 | Professor receber administração ou acesso histórico automático | Criar/convidar/alterar/desativar autorizadamente; professor sem conta pode constar no histórico; concessão atual necessária em cada acesso |
| T15 — P1 | Integrar calendário real e marco de acompanhamento, elegibilidade e exceções, mantendo separação entre turnos | T02/06/12/13, AD-02/04/05 | Gerar atrasos retroativos em 2026 e participantes errados na mudança diária | Início aprovado, histórico desconhecido sem frequência fabricada, datas de Brasília e casos de entrada/saída homologados |
| T16 — P0 | Implementar persistência/concorrência de chamadas: abertura única, rascunho versionado, conclusão conferida e correção transacional | T04/06/08 e decisões do calendário/participantes | Fila local sobrescrever outro usuário; bypass de conclusão | Banco garante turma/data, retentativa e versão; revisão antiga rejeitada; correção guarda antes/depois/motivo e autoria |
| T17 — P1 | Adaptar UI docente ao backend e cenários de falha, retomada, contatos essenciais e calendário independente | T14/15/16 | Mostrar “salvo” sem persistência ou perder rascunho ao recarregar | Recupera servidor após recarga/outro dispositivo; falha e conflito visíveis; Minhas turmas/Calendário e revisão nominal preservados |
| T18 — P1 | Substituir contexto fixo do painel e implementar relatórios/CSV essenciais com campos/filtros aprovados | T11–17, AD-08 | Percentual de chamadas ser exibido como frequência; exportar campos excessivos | Relatórios reconciliam por ano/oficina/turno/período; ausência justificada continua falta; desconhecido não vira zero; CSV seguro |
| T19 — P0 | Confirmar layout/fonte e implementar segurança da importação: staging privado, revisão de conflito, confirmação idempotente e rastreabilidade | T02/06/07/08/09, AD-07 | Sobrescrita, duplicidade, arquivo com macro/fórmula ou aplicação parcial | Ensaios sintéticos cobrem conflitos, provisórios, reprocessamento, falha/retomada e versão alterada entre prévia/commit |
| T20 — P1 | Construir interface assistida, mapeamentos e ensaio completo da migração 2026/rematrícula 2027 | T11–19 e layout validado | Linhas desaparecem na carga; correspondência de professor errada | Ensaio com totais reconciliados, histórico preservado e zero matrículas/contas/concessões automáticas de 2027 |
| T21 — P0 | Executar bateria integrada de autorização, concorrência, restauração e revisão de configuração/dependências | Núcleo P0 e funcionalidades afetadas | Unidade passar, API ou infraestrutura falhar | Evidências de banco/API com identidades distintas; zero falha bloqueante de acesso/integridade; pendências registradas |
| T22 — P1 | Homologar com diretora/supervisora e professores em dispositivos físicos; treinar fluxos e contingência | T11–21 e AD-12 | Interface aprovada por captura não funcionar na rotina/rede real | Percursos críticos completados sem apoio técnico; teclado/área segura/foco/contraste/erros verificados e aceite registrado |
| T23 — P0 | Autorizar carga real, executar migração controlada de 2026 e reconciliação institucional | Portão A aprovado, T19/20, fontes disponíveis, AD-07/09 | Dado real em desenvolvimento ou histórico sem conferência | Migração no ambiente autorizado, todos os candidatos classificados, contagens reconciliadas e conflitos bloqueantes resolvidos |
| T24 — P1 | Preparar 2027 e liberação assistida: turmas, contas, concessões, relatórios, treinamento e decisão de entrada em operação | T10/22/23, AD-04/06/11/12; portão B | Abrir sistema com usuário ou turma errada e sem suporte | Configuração institucional conferida, homologação assinada, recuperação disponível e responsável pela operação designado |
| T25 — P2 | Medir e otimizar pacote inicial, consultas e navegação conforme rede/dispositivos | Medidas de T17/18/22 | Otimização desnecessária ou lentidão que inviabilize o celular | Metas de uso acordadas atendidas; se impedir fluxo básico, reclassificar correção como P1 antes de lançar |
| T26 — P2 | Gráficos, exportações adicionais e eventual offline com sincronização | Operação inicial estável e autorização específica | Ampliar superfície de dados/complexidade | Benefício e requisitos aprovados, testes próprios e sem regressão do núcleo |
| T27 — P2 | Uniformes/materiais/kits em migrations aditivas, preservando RN-12 a RN-15 e complementos | Lançamento estabilizado e autorização específica | Criar estoque antes da prioridade ou recadastrar alunos | Módulo futuro vincula aluno permanente, sem duplicar saldo de kits/componentes; regras existentes preservadas |

T16 é P0 quanto à integridade/persistência; a interface de uso T17 é P1. T19 é P0
quanto à segurança da carga; a experiência assistida/ensaio T20 é P1. Todos os
itens aplicáveis são necessários ao lançamento; essa separação indica risco e
ordem de preparação, não permite operar chamadas/importação incompletas.

## Adaptação dos contratos sem reescrever interfaces

| Contrato atual | Evolução recomendada | Preservar |
| --- | --- | --- |
| `StudentsRepository.getSnapshot/subscribe/load` e `useStudentsData` | Store/cache por sessão e escopo; consultas administrativas paginadas e consultas docentes limitadas. Limpar dados ao sair/trocar contexto | Modelos de apresentação, carregamento/vazio/erro e notificação de mudança |
| `transaction(callback)` | Manter só no adaptador de memória; backend oferece comandos atômicos explícitos. Não enviar callback ou várias escritas soltas | Casos de teste de invariantes como regressão |
| `StudentCommands` | Adapter de comandos com sessão no servidor, `request_id`, versão quando necessário e erros de domínio | Intenção de cadastrar, matricular, esperar, promover e desligar |
| Factories de oficina/chamada + `commands.ts` | Interfaces explícitas e injeção do adaptador por ambiente; remover dependência operacional do singleton de seed | Formulários, cartões, confirmações e navegação |
| `draftController` + `draftService` | Confirmar gravação remota, enviar versão esperada, receber nova versão e detectar conflito. Uma fila por cliente não resolve dois clientes | Última intenção local, status de salvamento, retry e conferência nominal |
| `DemoRepository.listClasses` e resumos locais | Consultas agregadas por unidade/ano/data e escopo com filtros coerentes | Cartões de painel e relação de vagas |
| `Teacher`/`Authorization` | Cadastro funcional e vínculo histórico separados de conta/concessão vigente | IDs estáveis e experiência docente por turma |

Revisar mensagens/validações provisórias quando as decisões forem aprovadas.
Manter adaptador de memória e seeds apenas no modo de desenvolvimento/demonstração;
o bundle/configuração operacional não deve reativar seletores fictícios ou fallback
para seed ao falhar a conexão. Erro real deve aparecer como erro, sem dados inventados.

## Primeira implementação técnica recomendada

**Fundação segura do MVP — esquema mínimo, Auth/RLS e contratos verificáveis**, após
aprovar as decisões de núcleo. Entrega proposta em ambiente isolado com dados fictícios:

1. Registrar decisão de modelo com cadastro permanente, responsáveis e professor
   independente de conta; definir as fronteiras de leitura/comando e regras temporais.
2. Criar migrations iniciais do núcleo necessário e políticas de acesso, sem
   tabelas operacionais de materiais. Preparar testes que reconstruam banco vazio.
3. Implementar login/perfil ativo, matriz administrativa/docente e operação segura
   de provisionamento; testar negação por turma/unidade/coluna e revogação.
4. Fazer uma prova vertical limitada de cadastro/aluno/responsável e matrícula
   transacional com auditoria, incluindo disputa de vaga e repetição de requisição.
5. Demonstrar o contrato remoto preservando a apresentação existente, sem abrir
   uso real. Documentar o que falta antes de ampliar a integração.

Critério da primeira entrega: base reproduzível, identidade/autorização efetivas
e prova de integridade com testes de banco, além das regressões demonstrativas.
Não é uma entrega de produção e não inclui importação real ou deploy automático.
Esta recomendação **não foi executada** nesta auditoria.

## Implantação e continuidade — planejamento

Antes da carga, aplicar o portão A da homologação. A instituição define quem pode
acessar originais/backups, aprova região/fornecedor e nomeia responsáveis por
contas, importação, incidente e recuperação. O ambiente operacional usa HTTPS,
fallback das rotas SPA, segredos fora do código e logs sem conteúdo pessoal.

Depois do ensaio e da configuração, carga real deve ter ponto de recuperação,
janela/procedimento de suspensão de escritas, controle de versão de fontes,
reconciliação e plano de retorno. Após novas operações, um restore não pode
descartar registros silenciosamente; preservar evidências e planejar reconciliação.

Contingência inicial proposta: se indisponível, administração/supervisão aciona
responsável, professor registra a chamada em procedimento institucional protegido
aprovado e o lançamento posterior mantém data da atividade, origem e autor real.
Não compartilhar contas nem inventar presenças para completar lacuna. Não se
promete funcionamento offline da aplicação.

Liberação depende do portão B, aceite institucional e autorização própria. Em
operação, monitorar erros/disponibilidade e execução dos backups sem registrar
cadastros, contatos ou justificativas nos alertas. Revalidar permissões e ensaiar
recuperação na periodicidade aprovada, sem presumir serviços ainda não contratados.

## Atualização aplicável ao planejamento

T01 passa a consolidação documental concluída; validações institucionais seguem abertas. P0: revisar modelo/contratos, identidade, RLS por linha e campo, sessão 30 minutos/8 horas efetiva no servidor, revogação, auditoria, transações de transferência e vagas, importação idempotente e recuperação (AD-01–11). P1 depende de P0 e inclui todos os fluxos aprovados, seis relatórios/CSV e indicadores AD-08, treinamento e piloto AD-12. Transferência integra T07/T13; calendário e encerramento seguem AD-04; T22/T24 exigem piloto de duas semanas. P2: materiais, PDF, gráficos avançados, nativo, offline e MFA; avaliação de risco do MFA antes de produção é P0. Primeira etapa recomendada: fundação segura do backend em ambiente fictício, somente mediante autorização posterior.

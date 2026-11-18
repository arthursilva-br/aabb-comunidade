# Critérios de homologação do MVP

## Consolidação oficial de 18/11/2026

As [AD-01 a AD-12 estão aprovadas](decisoes-administrativas-aprovadas.md), integralmente descritas na referência central. Menções abaixo a AD ainda não aprovada ou parâmetro dependente de aprovação são registro do planejamento de 17/11/2026, substituído por essa consolidação. Permanecem pendentes a execução técnica e as validações institucionais expressamente enumeradas na AD-09. Aprovação não comprova funcionalidade implementada. RN-01 a RN-27 e materiais permanecem preservados.


Data: 17/11/2026. Checklist para execução futura e aprovação institucional.
**Nenhum item operacional abaixo está aprovado por esta auditoria.** Os 102 testes
demonstrativos e o build aprovados são a linha de base, não o aceite do lançamento.

Referências: [escopo e decisões AD](lancamento-mvp-escopo.md),
[auditoria](auditoria-prontidao-mvp.md), [migração](plano-migracao-2026-2027.md)
e [tarefas T01–T27](plano-implementacao-mvp.md).

## Como registrar o aceite

Para cada ID, registrar resultado (não executado/aprovado/reprovado/bloqueado),
versão de código/migrations, ambiente, responsável, data, evidência e pendência.
Começar com dados fictícios e identidades de teste distintas. Evidência técnica
versionável não contém nomes, documentos, contatos ou capturas de pessoas reais.
Evidências institucionais com dados pessoais ficam em área restrita, fora do Git.

- **Portão A — antes de receber dados reais no sistema novo:** exige decisões
  aplicáveis de dados/segurança, ambiente protegido, integridade dos caminhos de
  carga, Auth/RLS, auditoria, recuperação e ensaio sintético da importação.
- **Portão B — antes de liberar a rotina:** exige A mais migração reconciliada,
  fluxos diários completos, configurações/contas conferidas, usabilidade física,
  treinamento, contingência e aceite administrativo.

Uma falha de acesso, perda/corrupção de dados, duplicação de matrícula/chamada ou
restauração inviável bloqueia A e B. P1 do plano também deve estar concluído em B.
Uma aprovação unitária não substitui teste com API/banco, duas sessões e dispositivos.

## A. Condições para dados reais

| ID | Verificação objetiva | Resultado exigido / evidência |
| --- | --- | --- |
| A01 | Conferir escopo, obrigatórios e ciclo anual | AD-01/02 e operações habilitadas em AD-03 registradas; critérios provisórios não tratados como aprovados; nenhum vínculo incompleto efetivado contra RN-22 |
| A02 | Conferir responsabilidades institucionais | AD-09/10/11 aprovadas: finalidade/base legal, responsáveis, retenção/direitos/incidentes, contas, fornecedor/plano e recuperação |
| A03 | Reconstruir banco de homologação vazio a partir de migrations | Esquema, restrições, políticas, grants e funções reproduzíveis; nenhuma dependência de alteração manual não documentada |
| A04 | Conferir separação de ambientes e credenciais | Desenvolvimento/homologação com dados fictícios; produção isolada e identificada; segredos fora do repositório/bundle; chaves privilegiadas ausentes de `VITE_*` e do navegador |
| A05 | Inspecionar código/artefatos/configuração para publicação | Sem dados pessoais, seeds operacionais, segredos ou seletores de privilégio fictício no modo real; falha de conexão não mostra dados de seed como se fossem reais |
| A06 | Executar cadastro, recuperação, expiração e saída com contas distintas | Conta individual, recuperação segura e destinos permitidos; não há senha compartilhada nem usuário escolhendo papel administrativo; parâmetros aprovados em AD-10 |
| A07 | Anônimo e professor tentam acessar rotas/API administrativa, usuários e importação | Consulta/escrita negadas no servidor; guarda React não é a única defesa; nenhuma enumeração de cadastro completo |
| A08 | Professor tenta IDs de outra turma e unidade, por leitura direta, join, view, RPC e saída de dados | Nenhum dado ou escrita fora do escopo; testes positivos da própria turma também passam; não basta resposta vazia causada por configuração quebrada |
| A09 | Conferir campos retornados ao professor, incluindo responsáveis | Apenas AD-05 e contatos necessários da turma; documento e campos administrativos não vazam por tabela base, `select=*`, view ou RPC; não basta ocultar na tela |
| A10 | Revogar autorização, expirar substituição e desativar conta com token ainda válido | Novas leituras/escritas negadas sem aguardar novo login; critérios inclusivos de vigência aprovados; histórico preservado; cache limpo na saída/revogação observada |
| A11 | Tentar alterar próprio perfil, papel, unidade, vínculo e autor | Escalada negada; operações administrativas revalidam administrador ativo/unidade no servidor; conta docente nunca ganha administração por nome encontrado na fonte |
| A12 | Tentar escrever diretamente em matrícula/chamada/auditoria e contornar comandos | Grants/RLS negam bypass; funções elevadas revisadas com escopo mínimo e `search_path` seguro; autoria/instante vêm do servidor |
| A13 | Repetir comandos e provocar falha entre validação e gravação | Nenhuma atualização parcial; chave de requisição retorna resultado anterior ou conflito explícito se payload mudar; auditoria consistente na mesma transação |
| A14 | Duas sessões disputam a última vaga e a matrícula anual do mesmo aluno | Só uma operação incompatível confirma; capacidade nunca excedida; não existem duas ativas por aluno/ano/unidade; erro informa nova situação |
| A15 | Duas sessões abrem a mesma chamada turma/data; outro turno abre na mesma data | Uma chamada na turma; outro turno independente; restrição real no banco, sem sessão/horário na chave |
| A16 | Tentar editar/apagar evento de auditoria e omitir motivo | Operação negada; correção preserva antes/depois/motivo/autor/instante; trilha consultável só por administração autorizada; logs sem senha/token/payload integral |
| A17 | Rodar ensaio sintético de importação com duplicidades, conflitos, incompletos, falha e retry | Prévia não altera cadastro; divergências só aplicadas após revisão; provisório não recebe matrícula; reprocessamento não duplica pessoas/vínculos; carga de 2026 não cria 2027 |
| A18 | Alterar cadastro depois da prévia e antes de confirmar importação | Conflito/versão revalidado; alteração recente não é sobrescrita silenciosamente |
| A19 | Conferir proteção de originais/preparação/exportação/logs | Fontes reais fora de desenvolvimento/Git e sem envio a conversores externos; preparação restrita, retenção definida; arquivos sem execução de macros/fórmulas externas |
| A20 | Conferir HTTPS, rotas diretas e recuperação de acesso | HTTPS ativo, rotas SPA com fallback correto, sessão respeitada em link direto e redirecionamentos Auth permitidos; nenhum segredo no bundle |
| A21 | Executar e acompanhar backup automático | Execuções automáticas comprovadas no plano/configuração efetivos, destino/acesso protegidos e alerta de falha testado; agenda e retenção documentadas |
| A22 | Restaurar backup fictício em ambiente isolado | Cadastro, responsáveis, matrícula, chamada/rascunho, correção, auditoria e concessões recuperados; dependências de Auth/configuração verificadas; contagens e permissões rechecadas; RPO/RTO medidos e aceitos |
| A23 | Simular indisponibilidade/incidente e retomada | Responsáveis/canal/procedimentos conhecidos; suspensão/recuperação e contingência testadas sem compartilhar contas ou inventar frequência |
| A24 | Revisar dependências, grants, superfície exposta e configuração final | Revisão documentada; risco bloqueante corrigido; ausência de auditoria de dependências nesta etapa não interpretada como ausência de vulnerabilidades |

Portão A é aprovação formal específica para tratar dados reais no ambiente
institucional definido. Não autoriza enviar originais a serviços externos,
replicá-los para desenvolvimento ou liberar a rotina automaticamente.

## B. Funcionalidades da operação inicial

| ID | Cenário | Resultado exigido / evidência |
| --- | --- | --- |
| F01 | Cadastrar/editar aluno e responsáveis, encerrar sessão e abrir em outro navegador | Dados persistem, ID permanente mantido e responsáveis corretos após adicionar/remover/reordenar; histórico não perde identidade |
| F02 | Salvar provisório e tentar matrícula/promoção | Provisório fica sinalizado; matrícula ativa bloqueada até validar obrigatórios aprovados no servidor |
| F03 | Pesquisar homônimos, nomes com acento e documento quando disponível | Possíveis duplicidades explicadas; decisão administrativa explícita; sem fusão por semelhança ou nascimento isolado |
| F04 | Matricular aluno, repetir clique/requisição e tentar outra oficina/turno no mesmo ano/unidade | Uma ativa e uma ocupação; confirmação necessária; integridade sustentada no banco |
| F05 | Rematricular em 2027 aluno com histórico de 2026 | Conferência de responsáveis/contatos e seleção explícita de ano/oficina/turno/turma; nova matrícula sem novo aluno; vínculo de 2026 intacto |
| F06 | Matricular em turma cheia ou perder última vaga durante confirmação | Nenhuma matrícula indevida; oferecer espera para confirmação; não incluir/promover automaticamente nem mudar turma |
| F07 | Incluir/selecionar interessado e liberar vaga por desligamento | Espera não ocupa vaga; liberação não promove; seleção manual revalida cadastro/vaga/única ativa e registra decisão |
| F08 | Confirmar desligamento e repetir operação | Vaga liberada uma vez; cadastro, matrícula e chamadas antigas preservados; sem exclusão física |
| F09 | Configurar turmas de turnos e anos diferentes, mudar capacidade e testar limites | Capacidade/ocupação independentes, redução conforme decisão aprovada e nenhum atalho de transferência por edição de ano/oficina/turno |
| F10 | Registrar professor histórico sem conta e depois cadastrar professor operacional | Vínculo funcional não exige Auth; conta individual confirmada e concessão atual separada; histórico de 2026 não gera acesso |
| F11 | Professor autorizado consulta contatos essenciais | Dados mínimos corretos da própria turma; sem responsável de turma alheia nem cadastro administrativo completo |
| F12 | Configurar período semanal/exceções e marco de acompanhamento digital | Dia sem atividade e período anterior ao marco sem pendências; data de atividade válida tem no máximo uma chamada por turma; período fictício não é reutilizado |
| F13 | Inserir/desligar/transferir quando habilitado na data de atividade | Participantes seguem AD-02/04, sem adivinhação por UTC; turma/ano corretos; snapshot histórico não muda após conclusão |
| F14 | Marcar presença/ausência/justificativa e recarregar após indicação de salvo | Servidor conserva exatamente a versão confirmada; justificativa mantém ausência; nenhuma falta automática por chamada ausente |
| F15 | Interromper rede, navegar, voltar, tentar novamente e usar outro dispositivo | Falha explícita, “salvo” apenas após aceite remoto; rascunho confirmado recuperável; sem descarte silencioso da intenção local ainda não salva |
| F16 | Dois professores autorizados editam o mesmo rascunho e um conclui | Conflito de versão explicitado; sem sobrescrita silenciosa; edição comum após conclusão rejeitada; revisão antiga não conclui |
| F17 | Usar todos presentes com e sem marcações e concluir com participante sem marca | Substituição de marcações existentes exige confirmação; incompleto não conclui; conferência nominal/totais precede confirmação final |
| F18 | Corrigir chamada concluída e justificar posteriormente | Motivo conforme política, valores anterior/novo, autor e instante preservados; justificativa não vira presença; professor sem autorização atual não corrige |
| F19 | Consultar Minhas turmas/Calendário, trocar mês/ano/turma e retornar de chamada | Contexto mantido; seleção não cria chamada; turno concluído não esconde outro pendente; futuro sem registro antecipado e sem atraso |
| F20 | Comparar pendências, rascunhos, concluídas e atrasadas entre diário/mês/painel | Totais reconciliam com mesmo ano/data/filtros; atrasadas anteriores a hoje; sem atividade e futuro fora dos atrasos; resumo não confunde filtros globais/locais |
| F21 | Conferir painel após matrícula, promoção, desligamento e conclusão | Dados do banco e período atual selecionado, sem data fixa 12/11/2026; oficinas configuradas distintas de meta de 12 previstas |
| F22 | Gerar relatórios de alunos, vagas, matrículas, desligamentos, frequência e pendências | Filtros mínimos de ano/oficina/turma/turno/período aprovados; totais batem com origem; ausências justificadas entram como ausência; desconhecido não vira zero |
| F23 | Validar fórmula individual de frequência em período parcial com faltas justificadas | Numerador/denominador/elegibilidade aprovados em AD-08; relatório não usa percentual de chamadas concluídas como percentual de presença |
| F24 | Gerar exportação essencial como administrador e tentar como professor sem permissão | Apenas campos/filtros aprovados; proteção contra fórmula em células textuais, delimitador/acentos corretos; acesso negado fora do escopo |
| F25 | Arquivar cadastro e consultar histórico; executar procedimento de correção/eliminação legítima | Operação comum preserva vínculos; retenção/direitos seguem política institucional; ausência em 2027 não arquiva/exclui por conta própria |
| F26 | Validar o recorte de lançamento na navegação | Materiais/kits sem operação ou saldo fictício apresentado como real; documentação preservada; funcionalidades não habilitadas indicadas claramente |

## C. Validação da carga de 2026 e preparação de 2027

| ID | Verificação | Resultado exigido / evidência |
| --- | --- | --- |
| D01 | Receber fontes originais e conferir inventário | Arquivos/versões/anos/abrangência/responsáveis identificados; layouts reais aprovados; nenhuma fonte ausente presumida disponível |
| D02 | Reconciliação por linha/pessoa/vínculo | Linhas candidatas classificadas em aceitas/pendentes/rejeitadas; pessoas únicas separadas de linhas e matrículas; nenhuma perda silenciosa |
| D03 | Conferir correspondências e divergências | Todas as duplicidades/conflitos relevantes revisados, decisão rastreável por campo; sem fusão automática ou substituição por arquivo mais recente |
| D04 | Conferir oficinas, turnos, turmas e quantidades | Contagens por oficina/turma/turno aprovadas pela administração; diferenças justificadas; sem capacidades ou datas históricas inventadas |
| D05 | Conferir professores | Identificações/vínculos históricos confirmados, homônimos resolvidos; sem e-mail inventado, conta/concessão ou papel administrativo automático |
| D06 | Conferir histórico de 2026 e registros incompletos | Situações e vigências conforme AD-02, origem rastreável e provisórios identificados; vínculos ainda sem solução não tratados como migração completa |
| D07 | Conferir frequência e calendário histórico | Nenhuma frequência diária derivada de “FREQUENTE”; nenhuma chamada retroativa fabricada; marco de cobrança confirmado antes das pendências digitais |
| D08 | Conferir separação dos anos | Carga de 2026 criou zero matrículas de 2027; quem não retorna continua no cadastro com história; cadastro não foi duplicado para 2027 |
| D09 | Reexecutar lote sintético e testar falha/retomada; conferir carga real autorizada | Sem duplicação; blocos confirmados rastreados; backup/ponto de recuperação e plano de compensação disponíveis |
| D10 | Configurar operação de 2027 | Turmas/capacidades/calendários e responsáveis confirmados; contas/concessões vigentes conferidas; rematrícula administrativa homologada |

Pendência que afete identidade, matrícula, permissão, segurança ou contagem não
pode ser aceita como detalhe oculto. Registros incompletos podem permanecer
provisórios/na preparação com destino explicitado, mas não entrar indevidamente
em matrícula efetiva. Aceitação do escopo migrado precisa ser registrada.

## D. Usabilidade, treinamento e liberação

| ID | Verificação | Resultado exigido / evidência |
| --- | --- | --- |
| U01 | Diretora e supervisora executam cadastro, rematrícula, espera, desligamento e relatório em computador | Tarefas completas com textos compreensíveis, confirmações e legibilidade; dificuldades registradas/corrigidas |
| U02 | Professores executam chamada, justificativa, revisão, retorno e correção em celulares físicos | Aparelhos/navegadores definidos em AD-12, teclado virtual e área segura sem esconder ação; alvos de toque legíveis; nenhuma conta compartilhada |
| U03 | Conferir responsividade e acessibilidade dos percursos | 320/375/430/768/1440 px como referência de regressão da 03.2, dispositivos reais e teclado/foco/rótulos/contraste; sem rolagem horizontal impeditiva ou dependência só de cor |
| U04 | Testar carregamento/vazio/erro/negado, rede lenta e salvamento em falha | Mensagens reais e ações de recuperação claras; não confundir rascunho local pendente com persistido; sem erros bloqueantes no console |
| U05 | Medir uso com volume plausível e rede móvel institucional | Fluxos dentro de limites acordados; aviso de bundle analisado com evidência, sem supor falha nem ignorar lentidão impeditiva |
| U06 | Treinar contas, contingência, pendências, importação e suporte | Responsáveis sabem acionar recuperação e registrar operação posterior com data/origem; orientação institucional disponível |
| U07 | Fazer reunião de liberação e registrar decisão | Responsável técnico apresenta resultados; diretora/supervisora aprovam dados/fluxos; instituição aprova proteção/infraestrutura e designa responsável pela operação |

## Termo de decisão — preencher na homologação

| Registro | Situação inicial |
| --- | --- |
| Versão de código/migrations/ambiente homologados | Não definido |
| Decisões administrativas aplicáveis | Pendentes, conforme AD-01 a AD-12 |
| Portão A: responsável, data e evidências | Não executado / não autorizado por este documento |
| Carga 2026: fontes, lote e aceite das contagens | Não recebida / não executada |
| Portão B: responsável, data e evidências | Não executado |
| Incidentes/defeitos bloqueantes | A avaliar na execução; lacunas atuais na auditoria |
| Procedimento de retorno/contingência e responsáveis | A aprovar |
| Decisão final | **Não liberar produção neste estado** |

Não assinar aceite genérico “testes passaram”. A liberação deve identificar os
resultados de autorização, integridade, dados, infraestrutura e usabilidade.
P2 fica registrado como posterior, sem apagar requisitos futuros nem usar o
adiamento de materiais como justificativa para reduzir segurança do núcleo.

## Atualização aplicável ao planejamento

Exigir evidências de cada AD, incluindo transferência atômica concorrente, redução de capacidade, espera fora da ordem com motivo, reingresso e encerramento anual. Testar lista docente permitida e campos negados diretamente no banco, histórico anual do substituto, revogação e correção pós-encerramento autorizada. Testar troca inicial, inatividade 30 minutos, limite 8 horas, desativação e auditoria protegida. Reconciliar seis relatórios/indicadores, fórmula ponderada, ausência justificada, sem dados e erro distintos. Portão de dados reais exige todas as condições AD-09 e recuperação AD-11: diário, semanal independente, restauração antes da produção e trimestral, RPO/RTO até 24 horas, responsáveis e custos aprovados. Treinamento por função e homologação conjunta diretora/supervisora; falhas críticas bloqueiam. Diretora autoriza piloto de duas semanas; contingência física autorizada e regularização auditável. Após avaliação conjunta, diretora autoriza expansão. Nenhum desses ensaios foi executado nesta tarefa.

# Decisões administrativas aprovadas — AD-01 a AD-12

Consolidação oficial: 18/11/2026. Aprovadas pelo solicitante; complementam as [RN-01 a RN-27](decisoes-aprovadas.md), sem substituir, alterar ou renumerar. Aprovação não significa implementação nem autorização de dados reais, contratação ou deploy.

## AD-01 — Cadastro de alunos e responsáveis

### Regras aprovadas

Cadastro permanente. Obrigatórios operacionais: nome completo, nascimento, nome de ao menos um responsável e telefone de ao menos um responsável. CPF, RG, endereço, bairro, escola e ano escolar opcionais. Oficina e turno obrigatórios na matrícula, não no cadastro pessoal. Incompletos permanecem provisórios; novas matrículas exigem validação. Preservar provisórios históricos de 2026 e vínculos comprovados na fonte. Não inventar informações, frequência ou datas. Detectar duplicidades e encaminhar conflitos à revisão administrativa.

### Dependências e critérios de implementação

Implementação futura sujeita a autorização específica, controles de integridade, acesso e auditoria e evidências na [homologação](criterios-homologacao-mvp.md). Configurações e identidades concretas devem ser confirmadas institucionalmente; não preencher lacunas com dados inventados.

## AD-02 — Matrículas, rematrículas e ciclo anual

### Regras aprovadas

Estados: ativa, desligada e concluída. Ativa ocupa vaga; desligamento libera vaga e preserva histórico. Conclusão é encerramento anual confirmado; encerramento em lote somente após conferência e aprovação administrativa. Nenhuma matrícula de 2027 automática. Rematrícula reutiliza cadastro permanente. Reingresso no mesmo ano cria nova matrícula preservando a anterior. No máximo uma matrícula fixa ativa por aluno, ano e unidade. Datas desconhecidas permanecem desconhecidas; não modificar 2026 para simular matrícula ativa em 2027.

### Dependências e critérios de implementação

Implementação futura sujeita a autorização específica, controles de integridade, acesso e auditoria e evidências na [homologação](criterios-homologacao-mvp.md). Configurações e identidades concretas devem ser confirmadas institucionalmente; não preencher lacunas com dados inventados.

## AD-03 — Transferências, vagas e lista de espera

### Regras aprovadas

Transferência durante o ano exige aprovação da direção e vaga. Aluno permanece na origem até confirmação. Liberar origem e ocupar destino atomicamente, preservando matrícula, oficina e frequência anteriores. Redução de capacidade abaixo da ocupação exige alerta e confirmação da direção: preservar alunos e bloquear novas admissões até existir vaga. Espera por turma inclui candidatos e transferências; cronologia orienta, seleção fora da ordem exige justificativa. Promoção manual sem reserva ou matrícula automática; revalidar vagas na confirmação. Estados: aguardando, atendida, retirada e cancelada pela administração. Cancelamento exige motivo. Nova solicitação após retirada/cancelamento vai ao final; pendências expiram no encerramento anual.

### Dependências e critérios de implementação

Implementação futura sujeita a autorização específica, controles de integridade, acesso e auditoria e evidências na [homologação](criterios-homologacao-mvp.md). Configurações e identidades concretas devem ser confirmadas institucionalmente; não preencher lacunas com dados inventados.

## AD-04 — Oficinas, turmas e calendário

### Regras aprovadas

Catálogo institucional reutilizável; turmas independentes por ano e turno, capacidade administrativa, titular e substitutos autorizados. Calendário semanal com exceções datadas para feriados, suspensões e atividades extraordinárias. Separar início operacional e marco de obrigatoriedade digital. Estados: preparação, ativa, encerrada; ativação por confirmação administrativa. Copiar configurações anuais somente como rascunho, sem matrículas ou autorizações docentes. Retroatividade controlada exige justificativa e revisão; não excluir automaticamente chamadas. Elegibilidade considera vigência da matrícula, transferências e desligamentos. Mudanças em chamadas abertas exigem reconferência; concluídas exigem revisão auditável. Uma chamada por turma/data de atividade, turnos independentes.

### Dependências e critérios de implementação

Implementação futura sujeita a autorização específica, controles de integridade, acesso e auditoria e evidências na [homologação](criterios-homologacao-mvp.md). Configurações e identidades concretas devem ser confirmadas institucionalmente; não preencher lacunas com dados inventados.

## AD-05 — Professores, acesso e correções

### Regras aprovadas

Somente turmas autorizadas. Campos permitidos: nome completo, nascimento, responsáveis, contatos, escola, ano escolar, endereço e bairro. Negar CPF, RG, documentos sensíveis, anotações administrativas e outras turmas, efetivamente no banco. Autorizados corrigem chamadas concluídas com motivo durante todo o ano operacional; após encerramento exigem autorização administrativa específica. Substitutos consultam histórico anual completo durante autorização. Vigência definida ou até revogação; revogar interrompe acesso e preserva autoria histórica.

### Dependências e critérios de implementação

Implementação futura sujeita a autorização específica, controles de integridade, acesso e auditoria e evidências na [homologação](criterios-homologacao-mvp.md). Configurações e identidades concretas devem ser confirmadas institucionalmente; não preencher lacunas com dados inventados.

## AD-06 — Professores históricos e contas

### Regras aprovadas

Cadastro funcional independente da conta: nome completo obrigatório, telefone opcional. E-mail necessário para conta, dispensável para professor histórico sem acesso. Uma conta por pessoa com múltiplas funções. Diretora, supervisora e administradores expressamente autorizados gerenciam usuários. Contas criadas administrativamente; credencial inicial individual provisória e troca obrigatória. Professores de 2026 não recebem acesso/conta automaticamente. Vínculos antigos associados às fontes; ambiguidades confirmadas pela diretora ou supervisora. Vínculos e permissões de 2027 exigem confirmação própria. Direção indica primeira pessoa administradora antes da implantação; criação por procedimento técnico protegido. Concessões e alterações de permissões auditáveis.

### Dependências e critérios de implementação

Implementação futura sujeita a autorização específica, controles de integridade, acesso e auditoria e evidências na [homologação](criterios-homologacao-mvp.md). Configurações e identidades concretas devem ser confirmadas institucionalmente; não preencher lacunas com dados inventados.

## AD-07 — Importação dos dados históricos

### Regras aprovadas

Listas locais de 2026 são referência principal para oficina, turno e professor; documentação oficial/complementar para cadastro. Divergências exigem revisão; detectar duplicidades sem fusão insegura. Incompletos podem ser provisórios. Importação parcial dos conferidos permitida; aprovação final dos lotes pela diretora ou supervisora. Conflitantes pendentes. Reprocessar após correção, nova validação e aprovação sem duplicar alunos/vínculos. Registrar lote, fonte, responsável, decisão e resultado. Conferir separadamente linhas de origem, alunos distintos e vínculos históricos. Migração geral concluída somente com tratamento definitivo de todas as pendências; rejeições justificadas e rastreáveis. Sem matrícula automática de 2027 ou frequências inventadas. PDF pode exigir extração assistida, sem leitura universal presumida.

### Dependências e critérios de implementação

Implementação futura sujeita a autorização específica, controles de integridade, acesso e auditoria e evidências na [homologação](criterios-homologacao-mvp.md). Configurações e identidades concretas devem ser confirmadas institucionalmente; não preencher lacunas com dados inventados.

## AD-08 — Relatórios, exportações e indicadores

### Regras aprovadas

Seis relatórios: alunos e matrículas; vagas e lista de espera; frequência dos alunos; controle de chamadas; desligamentos e transferências; professores e turmas. Filtros de ano, oficina, turno e período conforme aplicabilidade. CSV para administração autorizada; PDF posterior. Professores consultam frequência/chamadas autorizadas sem exportação no MVP. Frequência individual = presenças / (presenças + ausências válidas) × 100, apenas chamadas concluídas, válidas e aluno elegível. Justificadas continuam ausências. Pendentes e dias sem atividade fora do denominador. Sem registros válidos: “Sem dados suficientes”, nunca zero presumido. Média do painel ponderada pelo total de registros válidos. Seis indicadores: alunos matriculados; vagas disponíveis; lista de espera; frequência média; chamadas pendentes; chamadas atrasadas. Somente dados reais, ano e referência temporal explícitos; distinguir zero, ausência de dados e falha de consulta; nenhum número demonstrativo em produção.

### Dependências e critérios de implementação

Implementação futura sujeita a autorização específica, controles de integridade, acesso e auditoria e evidências na [homologação](criterios-homologacao-mvp.md). Configurações e identidades concretas devem ser confirmadas institucionalmente; não preencher lacunas com dados inventados.

## AD-09 — Privacidade e proteção de dados

### Regras aprovadas

AABB ou mantenedora define finalidades e regras institucionais. Diretora e supervisora coordenam conjuntamente privacidade e incidentes. Uso legítimo e necessário; acesso por função/necessidade. Solicitações de responsáveis por procedimento institucional protegido, sem módulo específico no MVP. Histórico somente por finalidade/período justificáveis; avaliar eliminação, anonimização ou restrição do desnecessário. Desenvolvimento fictício; exportações e acessos técnicos restritos. Decisão operacional concluída, mas BLOQUEANTES para dados reais: confirmar formalmente entidade responsável; documentar finalidades/bases legais; aprovar aviso; formalizar critérios/prazos de retenção; definir canal de solicitações; avaliar fornecedores, contratos e transferências internacionais; formalizar resposta a incidentes; homologar segurança.

### Dependências e critérios de implementação

Implementação futura sujeita a autorização específica, controles de integridade, acesso e auditoria e evidências na [homologação](criterios-homologacao-mvp.md). Configurações e identidades concretas devem ser confirmadas institucionalmente; não preencher lacunas com dados inventados.

## AD-10 — Autenticação, sessões e auditoria

### Regras aprovadas

Login individual e senha protegida; uma conta por pessoa, múltiplas funções. Credencial provisória com troca no primeiro acesso. MFA posterior, sujeito a avaliação de risco antes da produção. Inatividade máxima 30 minutos; sessão máxima 8 horas; expiração efetiva nas operações protegidas. Recuperação segura por e-mail ou assistência administrativa com verificação de identidade; nunca revelar senhas antigas. Revogação efetiva nas próximas operações protegidas; desativação bloqueia acessos e invalida sessões. Auditar operações administrativas/de segurança relevantes: autor, momento, ação, registro, alterações e motivos necessários; sem senhas, tokens ou dados excessivos. Consulta por diretora, supervisora e administradores com permissão específica. Ninguém altera/apaga auditorias pela interface. Preservar autoria após desligamento/desativação; retenção institucional.

### Dependências e critérios de implementação

Implementação futura sujeita a autorização específica, controles de integridade, acesso e auditoria e evidências na [homologação](criterios-homologacao-mvp.md). Configurações e identidades concretas devem ser confirmadas institucionalmente; não preencher lacunas com dados inventados.

## AD-11 — Infraestrutura, backups e orçamento

### Regras aprovadas

Desenvolvimento separado da produção. Supabase Pro ou equivalente; Cloudflare Pages primeira opção estática. Região preferencial São Paulo, Brasil (sa-east-1); avaliar processamentos internacionais. Contas institucionais. Direção aprova orçamento/contratação; diretora responsável local pela administração/autorização de despesas conforme informado pelo solicitante, respeitadas competências formais. Técnico autorizado opera, faz backup e recuperação; definir substituto ou emergência antes do lançamento. Teto planejado R$ 350/mês recorrentes, sem autorização de contratar. RPO e RTO máximos de 24 horas. Backups automáticos diários, cópia independente protegida semanal; restauração trimestral e antes da produção. Verificar integridade, retenção, segurança e custos efetivos; homologar recuperação antes de dados reais.

### Dependências e critérios de implementação

Implementação futura sujeita a autorização específica, controles de integridade, acesso e auditoria e evidências na [homologação](criterios-homologacao-mvp.md). Configurações e identidades concretas devem ser confirmadas institucionalmente; não preencher lacunas com dados inventados.

## AD-12 — Treinamento, homologação e lançamento

### Regras aprovadas

Navegador em computadores e celulares; professores em ambos, administração principalmente computador; aplicativo nativo fora do MVP. Implantação gradual: diretora, supervisora e professores selecionados primeiro. Treinamento prático obrigatório por função; homologação conjunta diretora/supervisora e critérios documentados. Falhas críticas impedem lançamento/expansão. Piloto operacional de duas semanas. Contingência por registro físico temporário autorizado, regularização posterior auditável. Diretora autoriza formalmente piloto; após duas semanas diretora/supervisora avaliam resultados, diretora autoriza expansão às demais oficinas. Piloto real exige liberação prévia de segurança, privacidade e infraestrutura.

### Dependências e critérios de implementação

Implementação futura sujeita a autorização específica, controles de integridade, acesso e auditoria e evidências na [homologação](criterios-homologacao-mvp.md). Configurações e identidades concretas devem ser confirmadas institucionalmente; não preencher lacunas com dados inventados.

## Reconciliação com as RN e divergências

| RN | AD complementar | Tratamento |
| --- | --- | --- |
| RN-01 a RN-03 | AD-01 a AD-03 | Oficina fixa significa uma ativa, não imutabilidade anual; transferência preserva histórico. Histórico provisório comprovado não autoriza nova matrícula sem validação (RN-22). |
| RN-04 a RN-07 | AD-03, AD-04 | Capacidade, espera manual e concessões detalhadas; redução abaixo da ocupação passa a exigir alerta/confirmação, sem expulsão. |
| RN-08 a RN-11 | AD-04, AD-05, AD-08 | Mantida chamada única turma/data; correção após encerramento é autorização específica, não proibição definitiva. |
| RN-12 a RN-15 e A a D | Escopo adiado | Integralmente preservados; sem implementação de materiais no MVP. |
| RN-16 a RN-19 | AD-05, AD-06, AD-10 | Administradores autorizados mantêm gestão; consulta de auditoria requer permissão específica. Lista docente aprovada explicita necessidade/autorização da RN-17. |
| RN-20 a RN-23 | AD-01, AD-02, AD-07 | Provisórios históricos preservados, sem matrícula nova automática; fontes e conflitos rastreados. |
| RN-24 a RN-27 | AD-09 a AD-12 | Parâmetros concretizados sem presumir recursos contratados; retenção ainda institucional. |

Não identificado conflito material inevitável com as RN. Há pontos de desenho a revisar: fronteira temporal de entrada/saída no mesmo dia, representação de espera expirada sem criar silenciosamente quinto estado e permissão específica de auditoria versus acesso administrativo completo. Devem ser detalhados e homologados antes de operar, sem alterar RN silenciosamente.

## Pendências operacionais comuns

Confirmar fontes/layouts, catálogo e capacidades reais, calendário e marcos digitais, identidades/vínculos, primeira administração, contatos de recuperação, técnico/substituto e dispositivos. AD-09 mantém todos os bloqueantes institucionais; retenção de backups/logs e custos efetivos ainda precisam de validação. Nada foi contratado, importado ou implementado nesta consolidação.

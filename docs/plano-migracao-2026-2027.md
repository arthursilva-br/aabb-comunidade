# Plano de migração 2026–2027

## Consolidação oficial de 18/11/2026

As [AD-01 a AD-12 estão aprovadas](decisoes-administrativas-aprovadas.md), integralmente descritas na referência central. Menções abaixo a AD ainda não aprovada ou parâmetro dependente de aprovação são registro do planejamento de 17/11/2026, substituído por essa consolidação. Permanecem pendentes a execução técnica e as validações institucionais expressamente enumeradas na AD-09. Aprovação não comprova funcionalidade implementada. RN-01 a RN-27 e materiais permanecem preservados.


Data: 17/11/2026. Estratégia aprovada pelo solicitante: importar alunos e vínculos
de 2026, preservar histórico e preparar rematrícula administrativa de 2027.
Este documento propõe a execução futura; **nenhuma pessoa foi importada**.

Referências: [RN-01 a RN-27](decisoes-aprovadas.md), [modelo proposto](modelo-dados.md)
e [escopo/decisões AD](lancamento-mvp-escopo.md).

## 1. Inventário local e fontes ausentes

Inspeção em 17/11/2026, restrita à raiz deste repositório. Listagem recursiva de
metadados, incluindo arquivos não versionados e pastas ignoradas `output/`,
`dist/` e `.playwright-cli/`; excluídos `.git/` e `node_modules/` por serem
metadados/dependências, não acervo administrativo. Não foi feita busca em outras
pastas do computador, nuvem, e-mail ou documentos pessoais.

**Nenhuma fonte administrativa candidata encontrada.** Não existem localmente,
no escopo inspecionado, arquivos PDF, XLS/XLSX/XLSM, CSV/TSV, ODS, DOC/DOCX, TXT
ou ZIP candidatos à migração. Foram encontrados código, Markdown, configurações,
artefatos de build, imagens/capturas e logs técnicos; não são base oficial de alunos.
O levantamento não abriu nem transcreveu registros pessoais.

| Fonte conhecida | Disponibilidade local | Formato informado / a confirmar | Tratamento |
| --- | --- | --- | --- |
| `ALUNOS-AABB.pdf` | Não encontrado | PDF pelo nome; camada de texto e estrutura não verificadas | Receber original em local institucional protegido; conferir versão/ano e legibilidade |
| Arquivos complementares de alunos | Não encontrados/identificados | Desconhecido | Administração identifica nomes, versões, finalidade e abrangência |
| Planilhas oficiais de Educandos | Não encontradas | Planilha; extensão/layout não verificados | Receber exportação oficial, ano e dicionário de colunas |
| Outros arquivos históricos da administração | Não encontrados/identificados | Desconhecido | Inventariar antes de decidir se há sobreposição ou fonte suplementar |
| `src/modules/students/data/seed.ts` | Encontrado | TypeScript fictício | Somente testes; nunca importar como base institucional |
| `src/modules/attendance/services/seed.ts` | Encontrado | TypeScript fictício | Professores/calendários demonstrativos; não são evidência histórica |
| Documentos de requisitos/modelo em `docs/` | Encontrados | Markdown técnico | Orientam regras e campos propostos, sem comprovar conteúdo das fontes |

Não há número de educandos, páginas, abas, oficinas reais ou contatos a validar
nesta etapa. A ausência local não significa que a instituição não possua os arquivos.
Não afirmar que as colunas sugeridas abaixo existem nas fontes ainda indisponíveis.

### Inventário a preencher quando os arquivos forem recebidos

Manter fora do Git, em local institucional restrito, cadastro de fonte com:
identificador interno, nome neutro, formato/tamanho, hash, versão/data declarada,
ano de referência, responsável institucional, abrangência, número de páginas/abas,
texto pesquisável e status de conferência. Nome de arquivo que identifique criança
deve receber alias neutro no relatório técnico. O hash identifica a versão,
não prova exatidão nem substitui autorização de tratamento.

## 2. Estrutura proposta para preservar pessoas e anos

Não alterar o modelo existente nesta auditoria. Antes de materializá-lo, revisar
os seguintes ajustes técnicos com AD-01/02/06/07/09.

| Informação | Representação recomendada | Cuidados |
| --- | --- | --- |
| Cadastro permanente | `students` com ID estável e unidade, nome/nascimento/documento quando disponível, situação provisório/validado e arquivamento | Nunca usar nome como chave, nem gerar aluno novo a cada ano |
| Responsáveis | `guardians` e `student_guardians`, com contatos aprovados e vínculo estável | Não unir só por nome/telefone; famílias podem compartilhar contato; não reutilizar ID pela posição do formulário |
| Oficina | `workshops` da unidade, com correspondência da nomenclatura da fonte | Alias não cria automaticamente nova oficina nem consolida oficinas distintas |
| Turma histórica | `classes` com ano 2026, oficina e turno; identificação institucional se existir | Não inferir uma turma por turno se houver várias; não inventar capacidade histórica |
| Matrícula histórica | `enrollments` ligada ao mesmo aluno, unidade, turma e ano 2026, com eventos | Situação/datas efetivas sustentadas por fonte ou conferência; não usar comando demonstrativo que põe o instante atual como início |
| Situação incerta | Pendência na preparação da importação; vínculo definitivo após decisão | AD-02 define o estado histórico admissível. Não transformar desconhecido em desligado/concluído nem matricular provisório contra RN-22 |
| Origem | `import_batches`, `import_rows` e ligação de proveniência aos registros/campos relevantes | Fonte/lote, página ou aba/linha, ano e decisão; acesso restrito, sem anexar PDF pessoal ao Git |
| Pendências de conferência | Registro estruturado por entidade/campo, motivo, estado, decisão, autor/instante | Não esconder em texto genérico nem omitir linhas conflitantes das contagens |
| Professor responsável | Cadastro funcional independente, vínculo histórico por turma/ano/período | Identificação na fonte não cria conta ou autorização de acesso |
| Indicador geral de participação | Campo histórico complementar aprovado, se necessário | “FREQUENTE”/“NÃO FREQUENTE” não são chamadas, presenças diárias ou percentuais calculáveis |

Datas históricas podem ser desconhecidas. Proposta: admitir incerteza na preparação
e representar no modelo definitivo o que for aprovado, separando data da fonte,
vigência e instante da importação. Nunca preencher 01/01, início do ano ou data de
importação como fato histórico sem evidência. Se o modelo exigir um dado ausente,
manter vínculo em conferência até decisão; o ensaio deve tornar o bloqueio visível.

Histórico não é matrícula operacional de 2027. RN-01 limita as ativas por
aluno/ano/unidade, preservando os eventos. Situação, vigência e fechamento anual
precisam de AD-02 para que vínculos de 2026 não ocupem vagas das turmas de 2027.
Capacidades históricas desconhecidas também não podem ser preenchidas com 25 por
copiar a demonstração; conservar a incerteza até solução técnica/administrativa.

### Correspondência de campos — proposta sujeita ao layout recebido

| Campo lógico a procurar | Destino proposto | Normalização / conferência |
| --- | --- | --- |
| Código oficial do educando | Referência externa com sistema/unidade | Texto; confirmar unicidade/estabilidade; não substituir automaticamente ID interno |
| Nome do aluno | `students.display_name` | Preservar grafia conferida; normalizar somente para comparação |
| Nascimento | `students.birth_date` | Formato brasileiro/data serial de planilha sem ambiguidade; impossível vira pendência |
| Documento | `students.identity_document`, se aprovado | Preservar zeros/tipo; ausente não se inventa; não usar documento do responsável como sendo do aluno |
| Responsável e parentesco/vínculo | `guardians` e `student_guardians.relationship` | Distinguir principal/outros se a fonte permitir; nenhum nome genérico automático |
| Telefone/contato | Campos do responsável conforme modelo aprovado | Texto, país/DDD se informados; ausência tratada por AD-01 |
| Ano letivo | `import_batches.source_year`, `classes.school_year`, `enrollments.school_year` | Confirmado pela administração, não pela modificação do arquivo |
| Unidade | `unit_id` institucional | Mapeamento explícito e autorização; não confiar em valor arbitrário do arquivo |
| Oficina | `workshops`, por dicionário aprovado | Coluna ou cabeçalho/seção; alias sem equivalência automática |
| Turma e turno | `classes` e vínculo da matrícula | Coluna/cabeçalho/contexto confirmado; turnos independentes |
| Professor | Identificação de origem e futuro cadastro funcional/vínculo | Candidato por coluna/cabeçalho; validar homônimos, ano e período |
| Situação e datas do vínculo | Matrícula/eventos após AD-02 | Não inferir desligamento pela ausência em outra versão ou indicador genérico de frequência |
| Dados complementares | Apenas campos necessários/aprovados ou pendências | Não despejar colunas extras em JSON irrestrito nem transportar conteúdo desnecessário |

## 3. Extração futura de oficinas, turnos e professores

1. Receber originais em área institucional protegida, fora da pasta sincronizada
   de desenvolvimento/Git. Conferir finalidade, base legal e acesso autorizado.
2. Preservar original/hash e trabalhar em cópia controlada. Não usar serviços
   públicos de OCR/conversão nem enviar material pessoal a agentes/serviços externos.
3. Em planilhas, ler estrutura/valores localmente, sem executar macros, fórmulas
   ou referências externas. Preservar zeros, conferir datas, células mescladas,
   cabeçalhos repetidos, linhas vazias e abas. Layout ainda não verificado.
4. Em PDF pesquisável, extrair localmente por página/seção; se imagem, avaliar
   OCR local e conferir visualmente. Quebras podem separar aluno do responsável
   ou repetir cabeçalho; OCR é candidato, não cadastro validado.
5. Capturar oficina/turno/professor apenas no bloco identificado. Uma linha sem
   esses campos não herda contexto da página/turma anterior sem prova. Contradição
   entre coluna e cabeçalho gera conflito.
6. Criar dicionários de oficinas, turnos, turmas e identificações docentes em área
   protegida; administração confirma equivalências e lacunas antes dos vínculos.
7. Testar parser com amostras **sintéticas** da estrutura. Nunca salvar amostras
   “anonimizadas” ainda reconhecíveis, nomes reais ou capturas de alunos nos testes.

Execução somente em etapa autorizada e ambiente institucional protegido. No
desenvolvimento/homologação comuns, utilizar exclusivamente dados fictícios.

## 4. Comparação entre versões e riscos

Cada versão deve ter fonte/ano/abrangência declarados. Hash igual evita repetir
arquivo; diferente exige comparação, não substituição automática. Reordenar linhas
ou mudar formatação não deve criar pessoas.

| Situação | Tratamento proposto |
| --- | --- |
| Mesmo documento do aluno, outros campos divergentes | Forte candidato, ainda sujeito a conferir titular/documento e conflitos; não sobrescrever |
| Sem documento: nome + nascimento + responsável compatíveis | Candidato ao cadastro existente, confirmado pela administração; sem fusão por similaridade |
| Nome parecido, homônimo ou nascimento divergente | Mostrar razões/diferenças em área restrita; manter separado ou pendente conforme decisão |
| Mesmo responsável/telefone em vários alunos | Pode ser família; não comprova duplicidade de aluno |
| Documento incompleto, contato alterado ou OCR duvidoso | Pendência por campo; vazio não substitui valor já conferido |
| Oficina/turno/professor mudam entre fontes | Preservar versão/evidência; confirmar correção, período diferente ou conflito; sem transferência implícita |
| Aluno ausente na versão seguinte | Preservar cadastro/histórico; não desligar, excluir ou rematricular automaticamente |
| Cadastro local conferido difere do arquivo mais recente | Exibir antes/depois por campo; arquivo recente não estabelece autoridade |
| Dois vínculos ativos candidatos no mesmo ano/unidade | Bloquear conflito e solicitar decisão; não escolher a primeira linha |

Normalizar acentos, pontuação/espaços e datas apenas para busca, preservando o
original. Não fixar limiar fonético/estatístico nem precedência global sem AD-07.
Precedência pode variar por campo: fonte oficial de nascimento e atualização
administrativa de contato, por exemplo; registrar decisão, origem e autor.

## 5. Conferência administrativa e aplicação

Proposta de preparação restrita à administração, com as seguintes fases:

1. **Recebido:** inventário, ano/unidade e responsáveis confirmados.
2. **Preparado:** linhas candidatas, validações, dicionários e correspondências;
   nenhum cadastro operacional alterado.
3. **Em revisão:** filas de duplicidades, divergências, vínculos desconhecidos,
   obrigatórios ausentes e professores não identificados.
4. **Decidido:** por linha/campo, criar, vincular ao existente, manter valor,
   substituir explicitamente, manter separado, adiar ou rejeitar; motivo e autor.
5. **Pronto para confirmação:** inclusões/atualizações/provisórios, vínculos de
   2026, rejeições/pendências e contagens por oficina/turno/turma.
6. **Confirmado:** operação autorizada, transacional e idempotente por lote ou
   blocos rastreáveis; revalidar versões e regras no servidor.
7. **Reconciliado:** conferir totais/exceções e obter aceite administrativo.

RN-22 permite provisório, sem matrícula efetiva. Vínculo histórico incompleto
permanece rastreado na preparação até completar obrigatórios ou receber solução
histórica aprovada compatível com a RN. Não declarar migração integral com
vínculos sem decisão, nem marcar todos validados para forçar a carga.

Relatório técnico versionável contém apenas IDs neutros, regras, contagens
agregadas e status. A tela privada mostra ao administrador somente o necessário;
não copiar dados para logs, capturas, issues, commits ou testes.

### Reconciliação, reprocessamento e reversão

- Linhas lidas = aceitas + pendentes + rejeitadas, após separar cabeçalhos e
  totais. Toda linha candidata deve ter resultado rastreável.
- Distinguir pessoas únicas, linhas, vínculos/matrículas por ano, responsáveis
  e professores. Diferenças de contagem precisam de explicação.
- Conferir totais por oficina, turno e turma contra fontes confirmadas. Não usar
  os 85 alunos ou capacidades fictícias como meta.
- Resumir ausência de contatos, documentos, nascimento e vínculos desconhecidos,
  sem transcrever valores. Aceite/rejeição de pendências segue AD-07.
- Chave por lote/linha/decisão e versão impedem reaplicação. Deduplicar arquivo
  não basta para impedir pessoa repetida entre versões diferentes.
- Edição entre prévia e confirmação reabre conflito; revisão antiga não autoriza
  sobrescrever atualização mais recente.
- Falha de bloco mantém explícito o que confirmou e o que não confirmou;
  retomada não repete blocos aceitos nem declara sucesso total parcial.

Antes da carga: ensaio sintético, segurança/backup/restauração comprovados,
resumo revisado e autorização institucional. Congelar a versão das fontes;
atualizações posteriores entram por outro lote. Definir interrupção/retomada.
Reversão exige compensação revisada ou restauração coordenada; nunca apagar em
cascata pessoas que já receberam operações posteriores.

## 6. Professores: identidade, vínculo e acesso

O frontend separa `Teacher` de `Authorization`, mas `class_teachers` no modelo
proposto tem FK de `auth.users`. Revisar para admitir turmas antigas sem conta e
preservar histórico após saída do profissional.

| Camada proposta | Conteúdo | Concede acesso? |
| --- | --- | --- |
| Identificação na fonte | Referência de professor em coluna/cabeçalho, origem/contexto | Não; candidato a identificação |
| Cadastro funcional `teachers` | ID estável, unidade, nome conferido e situação funcional | Não; pode existir sem autenticação |
| Vínculo `class_teacher_assignments` (nome técnico proposto) | Professor, turma/ano, responsabilidade conforme evidência, período/origem | Não; registra responsável histórico de 2026 ou vínculo funcional de 2027 |
| Conta `auth.users` + perfil | Identidade individual, contato válido confirmado, ativo/função e ligação funcional | Conta sozinha não libera turma |
| Concessão `class_access_grants` (nome técnico proposto) | Conta/professor, turma, início/fim, concedente e revogação | Sim, apenas se vigente, perfil ativo e unidade autorizada |

Não criar esses objetos nesta etapa. Nomes são propostas técnicas, não novas RN.
Funções múltiplas e unicidade de titular dependem de AD-05/06; sobreposição
bloqueada na demonstração não é decisão institucional definitiva.

Na carga de 2026, identificar professores e vínculos históricos, **sem convite
ou concessão atual**. Para 2027, administração confirma cadastro funcional e turma,
obtém contato válido, aprova conta/função e concede acesso necessário. Não inventar
e-mails, compartilhar senhas ou promover professores a administradores.

Revogação encerra concessão sem apagar vínculo histórico. Desativação impede
leitura/escrita mesmo com sessão aberta. Corrigir chamada antiga exige autorização
atual e política de histórico aprovada; ter sido titular não dá acesso permanente.

## 7. Frequência histórica e início operacional

Não converter “FREQUENTE”/“NÃO FREQUENTE” em marcas diárias. Sem evidência por
turma/data/aluno, não criar chamadas finalizadas, presenças, ausências ou
percentuais. Dado geral só permanece como complemento necessário e aprovado.

Proposta sujeita a AD-04: separar ano/período de atividade do marco a partir do
qual o sistema cobra chamadas digitais. Turmas de 2026 podem conter matrículas
históricas sem cobrança retroativa; calendário de 2027 define atividades e
pendências a partir do marco confirmado. Não reutilizar datas fictícias de
novembro/dezembro nem inferir dias passados por padrão semanal. Ausência de
dados históricos deve aparecer como não disponível, sem percentual zero presumido.

Se chegarem registros diários válidos, importação de frequência exige layout,
reconciliação e autorização próprios; não é promessa desta carga.

## 8. Rematrícula administrativa de 2027

Pré-condições: cadastros persistidos/conferidos, turmas/capacidades de 2027,
administração autenticada e transação segura; calendário aprovado antes das chamadas.

1. Pesquisar cadastro permanente e consultar vínculo/histórico de 2026.
2. Conferir nome, nascimento, responsáveis e contatos em tela privada.
3. Atualizar, resolver duplicidades e completar obrigatórios. Provisório continua
   cadastrado, mas não recebe matrícula ativa.
4. Selecionar explicitamente 2027, visível em título, resumo e confirmação.
5. Selecionar oficina fixa, turno e turma de 2027 e visualizar vagas.
6. Revisar/confirmar; servidor revalida cadastro, unidade/ano/turma, oficina ativa
   única e vaga, com proteção de concorrência.
7. Na lotação, oferecer inclusão confirmada em espera, sem matrícula. Se a vaga
   acabar durante confirmação, informar e oferecer esse fluxo, sem inclusão
   silenciosa ou troca automática de turma.
8. Exibir matrícula de 2027 e conservar 2026 consultável. Retentativa da mesma
   requisição não duplica matrícula ou ocupação.

Não rematricular automaticamente em lote, não encerrar 2026 por desligamentos
inventados e não apagar quem não retornar. Fechamento de 2026 segue AD-02;
a nova matrícula não reescreve o histórico anterior.

### Decisões que realmente bloqueiam o fluxo

- AD-01: mínimo cadastral e contato ausente na validação.
- AD-02: estados/datas/encerramento e histórico; instante da confirmação não deve
  ser confundido com início de vigência do ano seguinte.
- AD-03: procedimento da espera/reingresso e necessidade inicial de transferência.
- AD-04: turmas/capacidades de 2027; calendário para a fase de chamadas.
- AD-07: identidade dos cadastros importados e conflitos conferidos.
- AD-09/10/11: autorização institucional, segurança, recuperação e infraestrutura
  antes dos dados reais; AD-05/06 para liberar professores.

Materiais/kits, gráficos e exportações personalizadas não bloqueiam rematrícula.
Responsáveis e demais decisões estão centralizados no [escopo](lancamento-mvp-escopo.md).

## 9. Aceite da migração

Administração aprova inventário, dicionários, conflitos e reconciliação de pessoas
e vínculos por oficina/turno/turma. Todo candidato tem destino rastreável, sem
pendência oculta de identidade, autorização ou vínculo efetivo. A carga de 2026
cria **zero matrículas de 2027** e **zero contas/concessões docentes automáticas**.

Portões e testes em [criterios-homologacao-mvp.md](criterios-homologacao-mvp.md).
Sem fontes locais, esta auditoria entrega planejamento, não validação de conteúdo,
contagens reais ou parser pronto.

## Atualização aplicável ao planejamento

Precedência por campo, lotes parciais e reprocessamento seguem AD-07. Diretora ou supervisora aprova lotes; conflitos permanecem pendentes. Separar linhas, alunos únicos e vínculos; justificar rejeições. Migração geral só conclui após tratamento definitivo de todas as pendências. AD-01 permite histórico provisório comprovado; não autoriza matrícula nova sem validação. AD-02 preserva datas desconhecidas, permite reingresso em novo registro e exige aprovação de encerramento em lote. Não criar matrícula/conta/concessão de 2027 automaticamente. Professores históricos sem conta e ambiguidades seguem AD-06.

# Lançamento do MVP — escopo da primeira versão

## Consolidação oficial de 18/11/2026

As [AD-01 a AD-12 estão aprovadas](decisoes-administrativas-aprovadas.md), integralmente descritas na referência central. Menções abaixo a AD ainda não aprovada ou parâmetro dependente de aprovação são registro do planejamento de 17/11/2026, substituído por essa consolidação. Permanecem pendentes a execução técnica e as validações institucionais expressamente enumeradas na AD-09. Aprovação não comprova funcionalidade implementada. RN-01 a RN-27 e materiais permanecem preservados.


Data: 17/11/2026. Etapa 01: auditoria e planejamento, para aprovação.

## Objetivo e limites da autorização

Preparar o Sistema AABB Comunidade para operação pela AABB de Paracatu–MG,
preservando o frontend demonstrativo das Implementações 01, 02, 03, 03.1 e 03.2.
O pedido desta etapa autoriza análise e documentação; **não autoriza implementação,
carga de dados reais ou implantação**. O sistema atual não está liberado para produção.

O novo recorte de lançamento foi determinado pelo solicitante. As soluções técnicas
e os parâmetros institucionais indicados como propostas ainda precisam de aprovação.
As [RN-01 a RN-27](decisoes-aprovadas.md) não foram alteradas ou renumeradas.
Os oito módulos permanecem no escopo global; nem todos terão operação no lançamento.
As ordens antigas de implementação que incluíam materiais antes de relatórios devem
ser lidas como planejamento anterior, substituído neste recorte pelo plano do MVP.

## Público e experiência

- Diretora, supervisora e administradores autorizados: gestão completa da unidade,
  principalmente em computador, com textos legíveis, ações claras e confirmações.
- Professores: contas individuais e acesso às turmas autorizadas, principalmente
  no celular, preservando Minhas turmas, Calendário e conferência nominal.
- Sem autoatendimento de crianças ou responsáveis nesta primeira versão.

## Funcionalidades incluídas

| Área | Entrega operacional exigida | Limite e condição |
| --- | --- | --- |
| Painel administrativo | Alunos matriculados, ocupação/vagas, oficinas/turmas em operação e chamadas pendentes/concluídas | Ano e data explícitos; valores do banco; fórmula e período aprovados; nenhum número fixo demonstrativo |
| Cadastro permanente | Pesquisa, cadastro manual, edição, provisório/validado, arquivamento e histórico | Campos obrigatórios dependem de AD-01; cadastro não se recria a cada ano |
| Responsáveis e contatos | Vários responsáveis vinculados, conferência e atualização de contatos | Identidades estáveis; projeção docente limitada aos campos aprovados |
| Matrícula anual | Oficina fixa pela turma, ano, unidade, validação e confirmação | Uma matrícula fixa ativa por aluno/ano/unidade; atomicidade e vaga verificadas no banco |
| Rematrícula | Reutilizar cadastro, conferir contatos e confirmar nova matrícula de 2027 | Não duplicar aluno nem alterar vínculo de 2026; não matricular automaticamente |
| Oficinas e turmas | Configurar oficinas, turmas por ano/turno, capacidade e vagas | Matutino e vespertino independentes; catálogo institucional confirmado antes da operação |
| Espera e desligamento | Espera sem vaga, seleção/promoção manual e desligamento confirmado com histórico | Revalidar vaga na confirmação; liberar vaga uma única vez; nunca promover automaticamente |
| Professores | Cadastro funcional, vínculos de turma, titular/adicionais e substitutos | Vínculo histórico separado de autorização atual e da conta individual |
| Calendário | Dias de atividade e exceções por turma, período operacional e acompanhamento mensal | Configurações reais aprovadas; histórico importado não gera pendências retroativas sem decisão |
| Chamada digital | Uma por turma/data de atividade; marcação nominal, justificativa, conferência e conclusão | Sem horário ou sessão na chave; sem ausência automática por chamada pendente |
| Rascunho | Salvamento persistente no servidor, retomada após recarga e tratamento de falha | “Salvo” só após confirmação do servidor; conflito simultâneo não pode sobrescrever silenciosamente |
| Correções e frequência | Correção com motivo, antes/depois, autoria e instante; consulta por período | Justificativa continua ausência; cálculo individual depende de fórmula aprovada |
| Autenticação | Login, saída, recuperação segura, sessão e contas individuais | Substituir seletores demonstrativos; cadastro público de contas desabilitado na proposta |
| Usuários e permissões | Administradores gerenciam contas; RLS por função/unidade/turma e vigência | Desativação e revogação efetivas mesmo com sessão já aberta |
| Relatórios essenciais | Relações por oficina/turma/turno/ano, vagas, matrículas, desligamentos, frequência e chamadas pendentes | Sem gráficos avançados; filtros, campos e fórmula sujeitos a AD-08 |
| Importação assistida | Pré-visualização, validação, comparação, revisão administrativa e confirmação rastreável | Layout recebido e validado; provisório não efetiva matrícula; sem fusão automática |
| Exportação essencial | Saída tabular dos relatórios essenciais para administração | Proposta: CSV com campos mínimos e proteção de fórmulas; formato final em AD-08 |
| Histórico e operação segura | Origem da carga, auditoria protegida, backup automático e recuperação testada | Critérios completos em [homologação](criterios-homologacao-mvp.md) |

Importação inicial deve preservar os alunos e vínculos de 2026 e preparar 2027.
Suporte às planilhas oficiais de Educandos deve partir de layout confirmado,
sem prometer leitura universal de qualquer Excel ou PDF. Extração histórica de PDF,
quando necessária, será procedimento local assistido; não exige um leitor universal
de PDF na aplicação operacional.

O cadastro manual é obrigatório e não substitui o fluxo assistido aprovado de migração.
O histórico sem informação diária deve aparecer como informação não disponível,
sem frequência fictícia, percentual zero presumido ou faltas inventadas.

## Adiado e excluído

| Grupo | Tratamento no lançamento |
| --- | --- |
| Uniformes, materiais, kits, entregas, estoque e seus relatórios | Adiados. Preservar integralmente RN-12 a RN-15 e complementos A a D, entidades e propostas existentes. Não precisam de tabelas na implantação inicial. A navegação operacional deverá indicar indisponibilidade ou ocultar a entrada, sem sugerir estoque real |
| Gráficos avançados e exportações personalizadas | P2; não condicionam as consultas e saídas essenciais |
| Offline com sincronização e instalação como aplicativo | Não aprovado; P2, sujeito à necessidade e avaliação própria. Contingência inicial é um procedimento operacional |
| Transferências | Incluídas no MVP conforme AD-03; reingresso cria novo registro conforme AD-02, sem apagar desligamento |
| Rodízio automatizado, transporte, eventos, financeiro e digitalização dos formulários físicos | Fora do escopo autorizado; não implementar por este plano |

Futuras migrations de materiais deverão referenciar o identificador permanente do
aluno e, quando pertinente, a matrícula/turma histórica. Não criar novo cadastro de
alunos, saldo paralelo de kits ou dependência de estoque para matricular/chamar.

## Invariantes para o lançamento

Referência normativa: [decisões aprovadas](decisoes-aprovadas.md).

- RN-01 a RN-07: cadastro permanente, vínculo anual, oficina ativa única, vagas
  por turma/turno, espera sem ocupação e promoção administrativa manual.
- RN-08 a RN-11: chave turma/data, apenas participantes elegíveis, dias sem
  atividade sem pendência, não realizadas pendentes, correções auditáveis e
  ausência justificada ainda ausência. A oficina fixa responde pela chamada.
- RN-16 a RN-19: administração autorizada, professor por turma, substituto
  autorizado e contas geridas administrativamente.
- RN-20 a RN-23: duplicidades sinalizadas, diferenças revisadas, provisórios
  identificados e preservação de quem não reaparece em 2027.
- RN-24 a RN-27: auditoria, recuperação testada, arquivamento e acesso individual seguro.

“Matrícula anual única” não significa apagar matrículas anteriores nem proibir
qualquer evento histórico no mesmo ano. A restrição aprovada é de **uma matrícula
fixa ativa** por aluno/ano/unidade; reingresso, transferência e encerramento
dependem do ciclo aprovado em AD-02/AD-03.

## Decisões administrativas aprovadas

Referência normativa complementar: [AD-01 a AD-12](decisoes-administrativas-aprovadas.md).

## Documentos para aprovação conjunta

- [Auditoria de prontidão](auditoria-prontidao-mvp.md): evidências, testes e lacunas.
- [Migração 2026–2027](plano-migracao-2026-2027.md): fontes e conferência.
- [Plano de implementação](plano-implementacao-mvp.md): prioridades e dependências.
- [Critérios de homologação](criterios-homologacao-mvp.md): portões antes dos dados reais e da operação.

Não há prazo estimado: faltam fontes, decisões institucionais e ensaio técnico do
backend. A aprovação deste pacote deve fixar o recorte e as decisões aplicáveis;
a execução técnica será uma etapa posterior expressamente autorizada.

## Recorte aprovado vigente

Incluídos painel, alunos/responsáveis, matrículas/rematrículas, oficinas/turmas, calendário/chamadas, professores/autorizações, vagas/espera/transferências/desligamentos, importação assistida, seis relatórios e CSV administrativo, autenticação/permissões/auditoria. Os seis relatórios e seis indicadores são exatamente os da AD-08. Adiados materiais/kits/estoque e relatórios correspondentes, PDF, gráficos avançados, aplicativo nativo, offline com sincronização e MFA (avaliar risco antes da produção). Transporte, eventos, financeiro, rodízio automatizado e digitalização de formulários permanecem excluídos.

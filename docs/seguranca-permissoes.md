# Segurança e permissões propostas — para revisão

## Autenticação e identidade

Usar Supabase Auth para contas individuais (RN-27), sem tabela própria de senhas. `auth.users` identifica a pessoa; `user_profiles` guarda papel, unidade e situação ativa. Login e recuperação/redefinição usam fluxo seguro do provedor; expiração de sessão e eventual autenticação adicional devem ser parametrizadas após validação. Não expor chaves privilegiadas ou tokens em logs, auditoria ou navegador. Gestão de contas por administradores autorizados (RN-19) passa por operação controlada, nunca por privilégio administrativo embutido no cliente.

## Matriz preliminar de acesso

| Recurso/ação | Administração ativa | Professor ativo com turma autorizada |
| --- | --- | --- |
| Alunos e responsáveis | Gestão na unidade autorizada | Apenas alunos de sua turma, campos essenciais e contatos aprovados; sem cadastro amplo |
| Turmas e vínculos docentes | Gestão na unidade | Consulta dos próprios vínculos |
| Matrículas, espera e vagas | Gestão e confirmação | Consulta mínima necessária à chamada, sem alteração |
| Chamadas | Consulta/acompanhamento administrativo das chamadas diárias previstas e pendentes | Abrir no máximo uma chamada por turma e data de atividade, marcar apenas alunos matriculados nessa turma, concluir e corrigir com motivo quando finalizada |
| Materiais e entregas | Gestão de itens, tamanhos e kits; entradas, entregas completas/parciais, pendências, adicionais, correções e estornos | Sem acesso previsto |
| Importação e usuários | Gestão e confirmação | Sem acesso |
| Painel, relatórios e exportação | Acesso administrativo conforme finalidade | Não previsto até aprovação explícita |
| Auditoria | Consulta administrativa necessária à investigação | Sem consulta geral; confirmação de sua própria ação pela interface |

Diretora, supervisora e outros administradores autorizados têm o mesmo acesso administrativo completo (RN-16). O escopo exato dos “dados essenciais” docentes continua bloqueante para a projeção de leitura. A autorização temporária de substituto (RN-18) exige início/fim quando definidos e revogação imediata; autorização é verificada no instante de cada consulta e escrita, não apenas no login.

## RLS e consultas

- Habilitar RLS em todas as tabelas de dados de negócio. Negar por padrão a usuários sem perfil ativo e a acesso anônimo; políticas específicas conferem unidade e vínculo autorizado.
- Uma função de autorização no banco verifica `auth.uid()`, perfil ativo, unidade, turma e período de validade. Evitar ciclos recursivos de RLS; revisar cuidadosamente funções com privilégios elevados, `search_path` fixo e entradas validadas.
- Administração pode consultar e operar apenas unidades que lhe forem autorizadas. A regra de acesso entre unidades ainda precisa de confirmação; não presumir acesso global.
- Professor lê apenas suas turmas e chamadas. Para alunos e responsáveis, usar projeção controlada com lista explícita de campos; RLS de linha sozinho não impede exposição de colunas indevidas. Não enviar cadastro completo ao navegador para esconder campos na interface.
- Escritas sensíveis ocorrem por operações transacionais que validam autorização, estado e integridade novamente. Não conceder gravação direta ampla nas tabelas subjacentes.
- Testar acesso negado, vínculo expirado/revogado, outra unidade, tentativa de alterar IDs na requisição e diferenças entre leitura direta, função e exportação.

## Auditoria e integridade

Registrar alterações importantes em matrículas, chamadas, materiais, cadastros, importações e usuários (RN-24), com operação, responsável, instante e valores necessários para investigação. Correções de chamada preservam valor anterior, novo valor e motivo; estornos mantêm movimento original e compensação. Trilha de auditoria não contém senhas, tokens ou cópia irrestrita de dados pessoais. Clientes não podem editar/apagar eventos; retenção e procedimento de correção/exclusão legítima precisam de definição (RN-26).

Operações de matrícula, vaga, abertura/conclusão de chamada, estoque e importação usam transações, restrições de unicidade, travas apropriadas e chave de idempotência quando houver risco de reenvio. A chamada exige unicidade de turma e data; autorização e composição dos alunos da turma são revalidadas no banco. Dia sem atividade não gera pendência. A permissão de saldo negativo (RN-13) não elimina validação de quantidade ou trilha de movimentos.

Para kits e materiais (complementos A a D de RN-12 a RN-15), as políticas propostas cobrem composição/versões, variantes, lotes de entrada, vínculo de kit com aluno, requisitos pendentes, linhas recebidas, movimentos e correções. Administração opera apenas a unidade autorizada; aluno, variante, kit e turma devem pertencer à mesma unidade. A pessoa que distribui fora do sistema não recebe conta automaticamente; o autor do lançamento é sempre o administrativo.

Auditar alterações de composição, entradas, confirmações, complementações, adicionais e estornos, identificando data, usuário e vínculos de origem. Pendência sem item recebido não gera movimento. Motivo opcional de reposição não pode contornar o motivo obrigatório de correção/estorno. Reenvio não duplica entrada ou entrega; correções compensam o original sem apagá-lo. Professores não recebem acesso às pendências de materiais por este complemento.

## Recuperação e operação

Prever backups automáticos e testes periódicos de restauração (RN-25). Frequência, retenção, destino, prazo de recuperação e responsabilidades serão definidos após verificar o plano e a infraestrutura contratados; não pressupor que um recurso exista. Separar ambientes e usar dados fictícios no desenvolvimento. Restringir acesso a backups e arquivos importados, registrar incidentes e prever revogação de contas. Política de arquivamento e procedimento separado para solicitações legítimas de exclusão/correção permanecem pendentes.

## Decisões bloqueantes

Antes de implementar acesso docente, aprovar campos essenciais e contatos visíveis. Antes de publicar, definir política de contas/sessões, retenção, recuperação, responsabilidades e recursos reais de backup. A arquitetura de RLS proposta deve ser revisada com consultas concretas e testes antes de receber dados reais.

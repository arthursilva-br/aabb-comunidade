# Estrutura do frontend proposta — para revisão

## Princípios

React + TypeScript e Vite, com Tailwind CSS e shadcn/ui, são tecnologias planejadas. A estrutura abaixo é proposta técnica, não um conjunto de componentes criado. Os oito módulos aprovados não equivalem a oito telas. A interface administrativa privilegia computador; chamadas docentes privilegiam celular; ambas são responsivas.

## Pastas propostas

```text
src/
  app/                 # inicialização, roteamento, sessão e layouts
  shared/
    ui/                # componentes acessíveis e estados comuns
    forms/             # campos e mensagens de validação reutilizáveis
    data/              # cliente Supabase e contratos de acesso
  modules/
    dashboard/         # painel administrativo
    students/          # alunos, responsáveis, matrículas, espera
    workshops/         # oficinas, turmas, turnos, vagas
    attendance/        # chamadas, justificativas, acompanhamento
    materials/         # itens, kits, estoque, entregas e pendências
    reports/           # relatórios aprovados
    users/             # login, usuários e autorizações
    interchange/       # importação e exportação
```

Em cada módulo, separar `pages/` (telas), `components/` (apresentação), `forms/` (esquemas e mensagens), `services/` (casos de uso/contratos) e `data/` (consultas autorizadas). Uma pasta só deve existir quando houver conteúdo real. A lógica que garante integridade e autorização fica no banco/operação controlada, não apenas em `services/` do navegador.

## Rotas conceituais propostas

| Área | Rotas ilustrativas | Acesso |
| --- | --- | --- |
| Pública | `/entrar`, `/recuperar-acesso` | Não autenticado, conforme fluxo Auth aprovado. |
| Administração | `/admin`, `/admin/alunos`, `/admin/oficinas`, `/admin/chamadas`, `/admin/materiais`, `/admin/relatorios`, `/admin/usuarios`, `/admin/importacao` | Administradores ativos; ações e dados revalidados no banco. |
| Professor | `/professor/turmas`, `/professor/turmas/:turmaId/chamadas/:chamadaId` | Professor ativo e autorizado à turma no momento da consulta/operação. |

Os caminhos são propostas de navegação, não interfaces aprovadas. Exportação pode ser ação dentro de relatórios ou importação/exportação; decisão visual pendente.

## Padrões de interação

- Usar nomes de ações claros, botões grandes, contraste, texto legível e navegação consistente. Presença, falta e pendência devem ter texto, não só cor.
- Reutilizar cartões, tabelas responsivas, formulários, confirmação de operações irreversíveis, alertas de saldo negativo, avisos de conflito e feedback de sucesso.
- Cada tela prevê carregamento, vazio, erro, sucesso e falta de permissão. A chamada diária distingue “prevista e não realizada” de “aberta com alunos ainda sem marcação”; dia sem atividade não mostra pendência. Não oferecer escolha de aula ou horário para criar chamadas extras.
- React Hook Form + Zod oferece retorno imediato; regras de vagas, matrícula única, permissões, estoque e importações são revalidadas nas operações transacionais.
- Mostrar apenas dados essenciais e contatos dos responsáveis ao professor, conforme lista de campos ainda a aprovar. Não buscar um registro completo e ocultar campos apenas por CSS.
- Em entregas coletivas, apresentar seleção de todos por turma e revisão de excluídos antes da confirmação; em importação, diferenças visíveis e decisão administrativa explícita.

## Detalhes ainda necessários

### Especificação de Uniformes e Materiais — complementos aprovados

Dentro do módulo existente, prever quatro áreas administrativas, com textos legíveis e poucos passos:

- **Catálogo:** itens avulsos, variantes de tamanho, kits cadastrados e composição configurável. A mudança de composição não reescreve histórico.
- **Estoque:** entrada de kits completos ou avulsos, quantidades por item/tamanho, disponibilidade calculada de kits e alerta de saldo negativo. Exibir disponibilidade como estimativa; não duplicar saldo do kit e componentes.
- **Entregas:** coletiva por oficina/turma, kit completo ou parcial, escolha do tamanho por peça para cada aluno, individual adicional, histórico por aluno e consulta de pendências. Alunos inicialmente selecionados podem ser desmarcados; componentes não recebidos também devem ser identificados antes da confirmação.
- **Histórico:** entradas, entregas iniciais, complementações, reposições, correções e estornos ligados à origem.

Mostrar claramente o que será entregue agora e o que continuará pendente. A complementação parte da pendência existente; a reposição/adicional é nova operação. Motivo opcional no adicional; motivo obrigatório na correção/estorno. Confirmar só baixa itens recebidos, mesmo em coletiva, e reenvio não repete o lançamento. Prever estados de kit sem composição, ausência de pendências, erro de confirmação e saldo negativo alertado sem bloquear a entrega apenas pelo saldo. Detalhes de layout são propostas a validar; nenhum frontend deve ser alterado nesta atualização documental.

Definir campos de formulários, calendário de dias de atividade por turma, conteúdo de relatórios, telas finais por módulo, cores oficiais, tipografia, arquivo original da marca, tamanhos e dispositivos de referência. `prototipos.md` é um mapa conceitual, não oito layouts aprovados. Validar a experiência com funcionários antes da implementação definitiva.

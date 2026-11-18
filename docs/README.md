# Documentação do Sistema AABB Comunidade

## Consolidação oficial de 18/11/2026

As [AD-01 a AD-12 estão aprovadas](decisoes-administrativas-aprovadas.md), integralmente descritas na referência central. Menções abaixo a AD ainda não aprovada ou parâmetro dependente de aprovação são registro do planejamento de 17/11/2026, substituído por essa consolidação. Permanecem pendentes a execução técnica e as validações institucionais expressamente enumeradas na AD-09. Aprovação não comprova funcionalidade implementada. RN-01 a RN-27 e materiais permanecem preservados.


Esta pasta reúne as definições aprovadas e os pontos ainda pendentes do sistema
de gestão administrativa e pedagógica da AABB Comunidade de Paracatu–MG.

## Índice

- [Requisitos](requisitos.md): objetivo, usuários, módulos, requisitos
  funcionais, restrições e escopo excluído.
- [Regras de negócio](regras-negocio.md): regras operacionais, permissões,
  histórico e tratamento de dados.
- [Decisões aprovadas](decisoes-aprovadas.md): referência oficial das 27 regras
  numeradas RN-01 a RN-27 e diretrizes permanentes.
- [Identidade visual](identidade-visual.md): diretrizes visuais, de usabilidade e
  adaptação por dispositivo.
- [Protótipos](prototipos.md): telas e fluxos conceituais a validar antes da
  criação dos protótipos visuais.
- [Plano de implementação](plano-implementacao.md): etapas propostas, critérios
  para avanço e decisões necessárias.
- [Decisões pendentes](decisoes-pendentes.md): pendências resolvidas pela versão
  1.0 e pontos ainda abertos, com prioridades e propostas não aprovadas.
- [Arquitetura técnica](arquitetura-tecnica.md): proposta de camadas, operações
  transacionais, compatibilidade e ordem de implementação.
- [Modelo de dados](modelo-dados.md): entidades, relações, campos propostos,
  integridade, índices e acesso.
- [Segurança e permissões](seguranca-permissoes.md): autenticação, matriz de
  acesso, RLS, auditoria e recuperação propostas.
- [Estrutura do frontend](estrutura-frontend.md): módulos, pastas, rotas e padrões
  de interação propostos.
- [Implementação 02 — alunos](implementacao-02-alunos.md): funcionalidades
  demonstrativas, critérios provisórios, inventário, testes e limites da entrega.
- [Implementação 03 — Oficinas, turmas e chamadas](implementacao-03-oficinas-chamadas.md).
- [Implementação 03.1 — Melhorias no módulo de chamadas](implementacao-03-1-melhorias-chamadas.md).
- [Implementação 03.2 — Navegação docente](implementacao-03-2-navegacao-docente.md).

### Preparação para o lançamento — Etapa 01 (17/11/2026)

- [Escopo do MVP](lancamento-mvp-escopo.md): funcionalidades incluídas/adiadas e
  decisões administrativas ainda necessárias (AD-01 a AD-12).
- [Auditoria de prontidão](auditoria-prontidao-mvp.md): matriz de funcionalidades,
  evidências do código/testes, limitações e preparação segura do backend.
- [Migração 2026–2027](plano-migracao-2026-2027.md): inventário local, campos,
  conferência das fontes, professores, histórico de 2026 e rematrícula de 2027.
- [Plano de implementação do MVP](plano-implementacao-mvp.md): tarefas P0/P1/P2,
  dependências, riscos, critérios de conclusão e primeira entrega recomendada.
- [Critérios de homologação](criterios-homologacao-mvp.md): portões antes de
  receber dados reais e antes de liberar a rotina institucional.

## Estado atual

As 27 decisões de negócio da versão 1.0 permanecem válidas. Há frontend
demonstrativo das Implementações 01, 02, 03, 03.1 e 03.2, com dados fictícios
em memória, sem banco, autenticação real ou liberação para produção.
A auditoria de 17/11/2026 verificou 102 testes locais e o build; isso não comprova
segurança, persistência ou operação multiusuário.

A prioridade autorizada passou a ser preparar o MVP operacional, importar os
cadastros/vínculos de 2026 e permitir rematrícula administrativa de 2027.
Uniformes, materiais e kits ficam adiados do lançamento, preservando integralmente
suas regras e propostas. Os novos documentos são análise e planejamento para
aprovação; nenhuma integração, conta real, carga ou implantação foi executada.
As escolhas temporárias da demonstração e as propostas técnicas não aprovam
pendências de negócio. O recorte de lançamento e a ordem proposta para o MVP
estão nos documentos novos; os planos anteriores permanecem como referência histórica.

## Princípios

- Utilizar somente dados fictícios durante o desenvolvimento inicial.
- Não armazenar cópias digitais dos formulários físicos de matrícula.
- Não tratar pontos pendentes como decisões aprovadas.
- Preservar a logomarca oficial, sem modificações, quando o arquivo original for
  disponibilizado.

## Atualização aplicável ao planejamento

[Implementação 04 — fundação PostgreSQL e Supabase](implementacao-04-backend.md) documenta as migrations, os contratos SQL, as verificações em ambiente fictício e os limites da integração Auth.

Referência central: [Decisões administrativas aprovadas](decisoes-administrativas-aprovadas.md). Consultar seu quadro de reconciliação com todas as RN e as condições bloqueantes antes de dados reais.

# Documentação do Sistema AABB Comunidade

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

## Estado atual

As 27 decisões de negócio da versão 1.0 foram consolidadas. A arquitetura e a
modelagem continuam propostas para revisão. Há frontend demonstrativo das
Implementações 01 e 02, sem banco, autenticação real ou operação de produção.
As escolhas temporárias da demonstração não aprovam pendências de negócio.

## Princípios

- Utilizar somente dados fictícios durante o desenvolvimento inicial.
- Não armazenar cópias digitais dos formulários físicos de matrícula.
- Não tratar pontos pendentes como decisões aprovadas.
- Preservar a logomarca oficial, sem modificações, quando o arquivo original for
  disponibilizado.

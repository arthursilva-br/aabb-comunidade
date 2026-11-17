# Sistema AABB Comunidade

Frontend demonstrativo para a gestão administrativa e pedagógica da AABB
Comunidade de Paracatu–MG. Referência principal: `AGENTS.md` e o índice em
[docs/README.md](docs/README.md).

## Estado do projeto

**Marco atual: frontend demonstrativo com Gestão de Alunos funcional.**
O projeto está preparado para versionamento do código e da documentação;
não está pronto para operação com dados reais ou uso em produção.

Implementações 01 e 02: React + TypeScript + Vite, Tailwind CSS e padrões shadcn/ui.
Todos os dados são fictícios e ficam apenas na demonstração. Não há Supabase,
autenticação real, persistência, importação de arquivos ou gravação operacional.

## Executar localmente

Requisito: Node.js 22.12 ou superior (validado com Node 24.21.0 e npm 11.19.0).

```powershell
npm ci
npm run dev
```

Abrir o endereço informado pelo Vite, normalmente `http://127.0.0.1:5173`.
Para verificar e gerar a versão de produção:

```powershell
npm run build
npm run preview
```

Testes das regras demonstrativas: `npm test` (Vitest). Para acompanhar alterações:
`npm run test:watch`.

O build executa a checagem estrita de TypeScript e gera `dist/`. Na hospedagem
futura, configurar fallback de rotas para `index.html`.

## Estrutura

```text
.
├── AGENTS.md
├── README.md
├── src/
│   ├── app/          # rotas, layouts e tokens visuais
│   ├── modules/      # oito módulos aprovados
│   └── shared/       # UI, formulários e contratos de dados
└── docs/
    └── README.md     # índice da documentação preservada
```

## Demonstração

- `/admin`: painel com indicadores, chamadas diárias, alertas e acessos rápidos.
- Navegação dos oito módulos, com consultas fictícias e telas preparatórias.
- `/professor/turmas`: turma autorizada fictícia e chamada por turma/data.
- `/entrar`: escolha de área demonstrativa, sem solicitar credenciais.
- Painel: seletor de estados de carregamento, vazio, erro e acesso negado.
- Gestão de alunos: pesquisa e filtros por ano, oficina, turno e situação;
  cadastro e edição com vários responsáveis; ficha e histórico anual.
- Matrícula com conferência de cadastro, vínculo anual único e capacidade;
  espera por turma, promoção manual e desligamento com confirmação e histórico.
- Alertas de possíveis duplicidades com conferência administrativa, sem fusão.
- Painel, oficinas e alunos compartilham o cálculo de ocupação de 2026.

Fluxo: `/admin/alunos` → cadastrar ou abrir ficha → editar, matricular ou registrar
interesse. A lista de espera também está em `/admin/alunos/espera`. A ficha permite
consultar anos anteriores sem alterar vínculos e desligar matrículas ativas.

O critério de validação cadastral é **provisório**, identificado nos formulários.
Cadastros incompletos podem ser salvos como provisórios, sem matrícula ativa.
Transferência está desabilitada, aguardando regras aprovadas. Todas as alterações
ficam apenas em memória, por aba, e são descartadas ao atualizar o navegador.
Não informe dados reais. Veja o inventário e os limites em
[Implementação 02](docs/implementacao-02-alunos.md).

Tokens preliminares autorizados: azul `#1769BF`, amarelo `#E8B62B`, fundos claros.
O nome textual do projeto identifica o sistema; nenhuma logomarca foi recriada.

Os controles de perfil demonstrativo não fornecem segurança ou autorização real.
A futura integração deverá aplicar Auth/RLS e as operações transacionais descritas
na documentação. `src/shared/data/contracts.ts` define a fronteira de dados;
o adaptador atual usa somente dados fictícios. Nenhuma credencial é necessária.

## Próximos passos

1. Revisar legibilidade, navegação e responsividade com usuários.
2. Validar campos, calendário de atividades, formatos das planilhas e telas finais.
3. Receber o arquivo oficial da logomarca.
4. Autorizar e planejar a integração segura com Supabase em etapa própria.

As versões resolvidas estão em `package-lock.json`. A instalação inicial e o
build validam React 19, Vite 8, TypeScript 7 e Tailwind CSS 4 em conjunto. O
arquivo `components.json` configura shadcn/ui com o alias `@/shared/ui`.

## Privacidade

Não devem ser usados dados pessoais reais no desenvolvimento, na documentação
ou nos testes. Exemplos futuros deverão empregar dados fictícios.

## Documentação e versionamento

- [Índice da documentação](docs/README.md).
- [Regras oficiais RN-01 a RN-27](docs/decisoes-aprovadas.md).
- [Decisões ainda pendentes](docs/decisoes-pendentes.md).
- [Entrega da Implementação 02](docs/implementacao-02-alunos.md): funcionalidades,
  arquivos, critérios temporários, testes e limitações.

Versionar `src/`, `docs/`, os arquivos de configuração, `package.json`,
`package-lock.json`, `README.md`, `AGENTS.md` e `.gitignore`.
As pastas `node_modules/`, `dist/`, `output/` e `.playwright-cli/`, assim como
arquivos `.env`, são excluídas pelo `.gitignore`.

Antes de cada entrega, executar `npm test` e `npm run build`. A verificação de
17/11/2026 aprovou os 24 testes de regras demonstrativas e o build.
Os testes visuais da Implementação 02 estão descritos no documento da entrega.

Arquitetura, modelagem e segurança em `docs/` incluem propostas para revisão;
somente as decisões explicitamente aprovadas constituem regras confirmadas.
O escopo atual em `AGENTS.md` registra as implementações demonstrativas
autorizadas nas etapas 01 e 02 e os limites para novas etapas.


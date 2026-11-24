# Orientações para agentes

## Escopo atual

Este repositório contém a documentação, o frontend demonstrativo das Implementações 01, 02, 03, 03.1 e 03.2 e a fundação PostgreSQL e Supabase entregue na Implementação 04. A Implementação 05.1.1 prepara a homologação de Supabase Auth e Data API no DEV institucional. A aplicação das migrations e os ensaios hospedados dependem de autorização específica para a Implementação 05.2. Consulte `docs/implementacao-05-1-1-bloqueios-supabase.md` para a sequência e os critérios de liberação.
As RN-01 a RN-27 e as AD-01 a AD-12 estão aprovadas. Consulte `docs/decisoes-administrativas-aprovadas.md` para as decisões administrativas e as validações institucionais ainda necessárias.
Utilize exclusivamente dados fictícios. O uso de dados reais continua bloqueado. Novas etapas, integrações além da homologação local autorizada e uso operacional dependem de autorização específica. Consulte `docs/implementacao-02-alunos.md`, `docs/implementacao-03-oficinas-chamadas.md`, `docs/implementacao-04-backend.md` e `docs/implementacao-05-auth-data-api.md` para o estado das entregas e preserve os critérios provisórios como tais.

## Diretrizes de trabalho

- Trabalhe somente dentro deste repositório.
- Preserve as decisões e os arquivos existentes.
- Não utilize dados pessoais reais em exemplos, testes, documentação ou código.
- Quando dados de demonstração forem necessários, use informações claramente
  fictícias e não identificáveis.
- Registre decisões relevantes e requisitos consolidados na pasta `docs/`.
- Evite escolher tecnologias, arquitetura ou padrões visuais sem requisitos.
- Antes de mudanças amplas, confirme o escopo e os critérios de aceitação.

## Qualidade e segurança

- Não inclua segredos, credenciais ou arquivos de configuração sensíveis.
- Mantenha a documentação em português, salvo orientação diferente.
- Ao implementar futuramente, inclua validações e testes proporcionais ao risco.

## Referências e restrições permanentes

- Consulte `docs/decisoes-aprovadas.md` como referência oficial RN-01 a RN-27;
  `docs/requisitos.md` e `docs/regras-negocio.md` resumem a aplicação; consulte
  `docs/decisoes-pendentes.md` antes de assumir detalhes ainda abertos.
- Mantenha os oito módulos aprovados e a interface simples, legível e responsiva,
  com administração voltada a computadores e professores a celulares.
- Não desenvolva rodízio de oficinas, transporte, eventos, controle financeiro
  ou digitalização/armazenamento dos formulários físicos de matrícula.
- Preserve a oficina fixa anual e a chamada sob responsabilidade do professor
  dessa oficina mesmo em dias de distribuição manual para outras atividades.
- A RN-08 corrigida permite no máximo uma chamada por turma e data de atividade,
  independente entre turnos; horários ou aulas individuais não geram chamadas.
- Respeite acesso por turma e dados essenciais para professores, auditoria,
  integridade do histórico e confirmação administrativa de importações.
- Materiais seguem os complementos aprovados A a D de RN-12 a RN-15 em
  `docs/decisoes-aprovadas.md`: kits configuráveis, tamanho por peça, pendências
  vinculadas e adicionais independentes. Pendências não baixam estoque; adicionais
  têm motivo opcional, correções/estornos exigem motivo. Não duplicar saldo de kit
  e componentes. Consulte a proposta técnica em `docs/modelo-dados.md`.


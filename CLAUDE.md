# Mega Acerto

Sistema local de análise de loterias da Caixa. O projeto armazena o histórico oficial de sorteios e prepara dados para que o Claude faça as estimativas estatísticas. O projeto não implementa cálculos estatísticos; ele coleta, organiza, agrega via SQL para conferência e valida as respostas da IA.

Objetivo: maximizar o valor esperado das apostas e validar estratégias com backtest. Não existe previsão de números: sorteios são independentes e uniformes, e qualquer análise parte dessa hipótese nula.

Roteiro e status das fases: [roadmap.md](roadmap.md).

## Stack

- Monorepo pnpm (`corepack pnpm`), Node 24 com type stripping nativo (sem etapa de build no backend).
- `apps/api`: Fastify 5, TypeBox, Kysely, PostgreSQL 16.
- `apps/web`: React 19 + Vite (SPA, sem SSR), React Router, TanStack Query, Tailwind CSS.
- `packages/domain`: regras dos jogos e tipos compartilhados, sem I/O.
- Docker Compose: `db` (PostgreSQL oficial) e `app` (API servindo o build do front). Na Fase 2 entra o `ai-worker` (Claude Code CLI headless + Python).

## Arquitetura

- Backend no padrão bulletproof-nodejs adaptado: `config` → `loaders` → `api/routes` → `services` → `data/repositories`. Integrações externas em `integrations/`. Rotas não acessam o banco; services não conhecem HTTP.
- Frontend no padrão bulletproof-react: `src/app` (rotas, providers), `src/features/<feature>/{api,components,routes,types}`, compartilhados em `src/components`, `src/lib`, `src/config`. Uma feature nunca importa outra feature; o fluxo de import é shared → features → app (garantido pelo ESLint).
- Regras de jogo vivem em `packages/domain` como configuração declarativa. Nada de `if (jogo === 'megasena')` espalhado.

## Regras obrigatórias

1. **Sem comentários no código.** O código deve se explicar por nomes e estrutura.
2. **Clean Code e SOLID.** Funções pequenas, responsabilidade única, dependências injetadas por construtor/fábrica, sem acoplamento a detalhes de infraestrutura nas regras.
3. **Commits sem trailer de coautoria.** Nenhuma linha `Co-Authored-By` (nem qualquer outro trailer de coautoria) na mensagem.
4. **Carregamento lazy em tudo que for possível.** Rotas do front com `lazy`, módulos pesados do backend com `import()` dinâmico, consultas paginadas, dados buscados sob demanda.
5. **Qualidade no commit via Lefthook** (`lefthook.yml` na raiz): todo commit formata com Prettier e verifica com ESLint (zero avisos) os arquivos alterados, e roda typecheck. Commit que falha não entra. Nunca usar `--no-verify`.
6. **Indentação de 2 espaços**, definida no `.editorconfig`. Fim de linha LF.
7. **Sem testes unitários no repositório.** A IA deve testar o código que escreve executando-o (subir a API, chamar endpoints, rodar a ingestão, abrir o front) antes de commitar.

## Convenções

- Termos de domínio em português (`concurso`, `dezena`, `premiacao`); termos técnicos em inglês (`repository`, `service`, `client`, `loader`).
- TypeScript estrito, apenas sintaxe apagável (`erasableSyntaxOnly`): sem `enum`, sem parameter properties, imports relativos com extensão `.ts`, `import type` para tipos.
- Mensagens de commit em português, no formato `tipo(escopo): descrição` (feat, fix, chore, docs, refactor).
- Um commit por parte entregue.

## Comandos

```bash
corepack pnpm install
corepack pnpm dev:db
corepack pnpm dev
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm format
docker compose up -d --build
```

## API da Caixa

- Base: `https://servicebus2.caixa.gov.br/portaldeloterias/api/{jogo}/{concurso?}`. Sem concurso, retorna o último.
- Não documentada. Throttling obrigatório, retry com backoff, payload bruto persistido.
- Dados sujos conhecidos: caractere `\u0000` em campos texto (Postgres rejeita), `valorArrecadado = 0` em concursos antigos, `ultimoConcurso` não confiável, datas `dd/MM/yyyy`, dezenas como string com zero à esquerda.
- O endpoint do Super Sete retorna HTTP 500; exigirá fonte alternativa.

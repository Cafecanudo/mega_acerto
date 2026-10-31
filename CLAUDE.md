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
corepack pnpm dev:db:copiar
corepack pnpm dev
corepack pnpm dev:worker
corepack pnpm dev:parar
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm format
corepack pnpm prod:up
corepack pnpm prod:backup
```

- Dois ambientes Docker isolados, cada um com PostgreSQL e volume próprios (detalhes no [README.md](README.md)):
  - **Produção** (`docker-compose.yml`, projeto `mega-acerto`): `db` sem porta no host, `app` em `:3000`, `ai-worker`. Contém os dados reais do usuário.
  - **Desenvolvimento** (`docker-compose.dev.yml`, projeto `mega-acerto-dev`): `db` em `localhost:5442` e `ai-worker` sob o perfil `analises`. `dev` roda a API em `:3100` (lê `.env`) e o Vite em `:5173` (proxy de `/api` para `:3100`).
- `dev:db:copiar` recria o banco de desenvolvimento a partir da produção (sempre nessa direção). Pare a API de dev antes.
- **Produção é intocável para a IA:** todo teste, migration nova, cadastro de conta de teste ou dado sintético vai no ambiente de desenvolvimento. Na produção, só leitura e só quando o usuário pedir; escrita, exclusão ou `prod:up` apenas com pedido explícito. Nunca rodar `down -v` no projeto `mega-acerto`.
- Ao testar processos em background, encerrar apenas o PID iniciado na sessão; nunca matar todos os processos `node`.

## Favoritos e Apostas

- **Favoritos** (tabela `favorito`, `/api/favoritos`): jogos que o usuário monta para usar quando quiser. Cadastro completo (criar, editar, excluir) pela página Favoritos, com diálogo e histórico das dezenas.
- **Apostas** (tabela `aposta`, `/api/apostas`): apostas efetivadas, criadas a partir de um favorito ou direto num jogo. Na página Apostas não se cria nem exclui; apostas ainda não sorteadas podem ser editadas (dezenas e nome, `PATCH /api/apostas/:id`). Numa Teimosinha, a edição vale para os concursos não sorteados do grupo; o valor é recalculado e o vínculo com o favorito cai se as dezenas mudarem. A lista segue o formato do histórico (tabela, busca por dezenas, combinações, paginação). `concurso` nulo confere contra o último sorteio; concurso futuro aparece como aguardando.
- A conferência é genérica (`ConferenciaService`) e atende às duas entidades.
- Página Início (`app/routes/inicio.tsx`, rota índice): compõe `DestaqueUltimoConcurso` e, por jogo disponível, as apostas do próximo concurso (`GET /api/apostas/proximas`, só concurso = último + 1), o resumo de `a-conferir`, as três análises mais recentes e o balanço (`GET /api/apostas/balanco`: gasto e prêmios das apostas sorteadas, total e últimos 12 meses pela data do concurso, mais o valor aguardando sorteio). O retorno por R$ 1 é só prêmios ÷ gasto, sem estatística. Por jogo há a linha do tempo (`features/linha-do-tempo`, carregada sob demanda, `GET /api/jogos/:jogo/linha-do-tempo?ultimos=`): gráfico SVG de acertos por concurso com o melhor acerto das minhas apostas e dos favoritos não apostados (favorito conta a partir da data de criação e sai do concurso em que virou aposta com as mesmas dezenas), prêmio real ou "teria ganho" no tooltip e linha de referência ao acaso (dezenas sorteadas × aposta mínima ÷ universo).
- Apostas são criadas pelo botão "Apostar" da sidebar: diálogo com seleção de jogo, dezenas na grade ou favoritos (um a um ou todos), lista de apostas a efetivar e botão "Efetivar", que grava o lote (`POST /api/apostas`, até 200 itens) para o próximo concurso.
- Teimosinha (1 a 12, `TEIMOSINHA_MAXIMA` no domínio): selecionada no Apostar para todos os itens ou por item. O backend grava uma aposta por concurso consecutivo, ligadas por `teimosinha_grupo` com `teimosinha_posicao` e `teimosinha_total`; conferência e prêmios seguem por concurso. Conferir Apostas mostra, de cada grupo, as já sorteadas e só a próxima aguardando. O Total do Apostar é o valor a pagar (valor × concursos); semana e mês seguem por concurso.
- Palpites › "Montar jogos" (`features/montar-jogos`, carregado sob demanda): gera jogos a partir das dezenas selecionadas (manual, todas as combinações ou sorteio) e envia a lista ao Apostar ou salva nos favoritos (`POST /api/favoritos/lote`, até 200, ignorando jogos já salvos). A geração fica em `packages/domain` (`listarCombinacoes`, `sortearCombinacoes` por desranqueamento de posições sorteadas com o algoritmo de Floyd); a aleatoriedade vem de `crypto.getRandomValues`.
- Simulador (`features/simulador`): modo Ao vivo (globo animado, uma bola por intervalo, hook `useSorteioAnimado` com `sortearConcursoNaOrdem`) e modo Rápido (lote). Cada sorteio é comparado com as apostas pendentes do jogo (`GET /api/apostas/pendentes?jogo=`, uma por Teimosinha) e os favoritos: a aposta e o favorito com mais acertos pintam as dezenas de verde e azul; selos e o filtro "Só premiados" usam `contarPremiosAposta`. "Sortear até ganhar" sorteia sem gravar no histórico até a melhor faixa da aposta ou do favorito atingir a faixa escolhida ("Parar em"); no Rápido roda num Web Worker (`workers/busca-ate-ganhar.worker.ts`, `criarSorteioReutilizavel` e RNG em lote), no Ao vivo pela animação (velocidade Turbo disponível); o match abre um diálogo com Continuar e Parar. A rota em `app` compõe as referências e o valor da aposta, já que features não se importam.

## Usuários e sessão

- Login e cadastro em diálogo flutuante (`features/autenticacao`), exibido enquanto não houver sessão; resposta 401 da API reabre o diálogo.
- Senha com scrypt (`shared/senha.ts`); sessão em cookie `mega_sessao` (HttpOnly, SameSite=Strict), guardada como hash SHA-256 na tabela `sessao` e renovada por 30 dias.
- Todo `/api` exige sessão, exceto `/api/auth/*` e `/api/saude`. Rotas obtêm o usuário com `usuarioDe(requisicao)` e repassam o id; repositórios de `favorito`, `aposta` e `analise` sempre filtram por `usuario_id`.
- Compartilhados entre usuários: concursos, ingestão e `valor_jogo`.
- Para testar com contas sem afetar os dados reais, use o ambiente de desenvolvimento (`dev:db:copiar` e conta de teste criada nele); o primeiro cadastro num banco sem usuários assume os dados sem dono.

## Análises com Claude (Fase 2)

- O container `ai-worker` roda `apps/api/src/worker.ts` (mesmo código da API, outro entrypoint). Ele reivindica análises `pendente` na tabela `analise`, exporta o dataset para uma pasta isolada e executa `claude -p` com `--json-schema`, `--model` e `--effort`.
- Autenticação pela assinatura Max: rode `claude setup-token` na máquina e grave o valor em `CLAUDE_CODE_OAUTH_TOKEN` no `.env` (nunca commitar nem colar em chat).
- O processo do Claude recebe ambiente reduzido (sem `DATABASE_URL`) e só pode usar `python3`, leitura e escrita de arquivos.
- Prompts e schemas ficam versionados em `packages/analises`. Mudou o prompt, suba `versaoPrompt` no catálogo.
- Tipos de análise: `aleatoriedade` e `estrategia`. Cada tipo registra prompt, schema e validação em `services/analises/tipos-analise.ts`; o executor não conhece tipos específicos.
- `estrategia` recebe `parametros` (estratégia do catálogo ou personalizada, quantidade de dezenas, janela), gravados em `analise.parametros` e considerados no reaproveitamento. O Claude gera o palpite, faz backtest walk-forward contra 2000 replicações aleatórias e teste de permutação. O sistema confere frequências, universo e quantidade do palpite, concurso-alvo, média teórica e, para estratégias determinísticas sem janela, o próprio palpite contra o ranking SQL.
- O catálogo de estratégias fica em `@mega/analises/catalogo` (sem `typebox`, para o front); schemas em `@mega/analises`.
- O projeto não calcula estatística: só exporta dados, confere as contagens do Claude contra os agregados SQL e valida o schema.
- Para testar a interface de resultado sem gastar cota, insira um registro sintético no banco de desenvolvimento.

## API da Caixa

- Base: `https://servicebus2.caixa.gov.br/portaldeloterias/api/{jogo}/{concurso?}`. Sem concurso, retorna o último.
- Não documentada. Throttling obrigatório, retry com backoff, payload bruto persistido.
- Dados sujos conhecidos: caractere `\u0000` em campos texto (Postgres rejeita), `valorArrecadado = 0` em concursos antigos, `ultimoConcurso` não confiável, datas `dd/MM/yyyy`, dezenas como string com zero à esquerda.
- O endpoint do Super Sete retorna HTTP 500; exigirá fonte alternativa.

# Roadmap

## Objetivo

Maximizar o valor esperado das apostas e validar estratégias com backtest, usando o Claude (assinatura Max via Claude Code headless) para todas as estimativas. O projeto coleta, organiza e valida; o Claude calcula.

## Fase 1: Fundação de dados (Mega-Sena)

- [ ] Monorepo pnpm, TypeScript, ESLint, Prettier, Lefthook, `.editorconfig`
- [ ] `packages/domain` com a configuração declarativa da Mega-Sena
- [ ] API Fastify com config validada, loaders e PostgreSQL via Kysely
- [ ] Migrations: `jogo`, `concurso`, `dezena_sorteada`, `premiacao`, `payload_bruto`, `ingestao_execucao`
- [ ] Cliente da Caixa: throttling, retry com backoff, timeout, sanitização de `\u0000`, parse de datas e dezenas
- [ ] Ingestão retomável (backfill) e sincronização periódica do último concurso
- [ ] Validação de integridade (sequência sem buracos, dezenas distintas no universo)
- [ ] Endpoints: jogos, concursos paginados, detalhe, busca por dezenas, status e disparo da ingestão
- [ ] Front React: histórico paginado, detalhe do concurso, busca por combinação, status da ingestão
- [ ] Docker Compose com `db` e `app`

Critério de pronto: todos os concursos da Mega-Sena no banco, validação sem erros e sincronização captando o próximo sorteio sozinha.

## Fase 2: Integração com Claude

- [ ] Container `ai-worker`: Node + Claude Code CLI + Python (NumPy, SciPy, pandas, statsmodels)
- [ ] Autenticação via `claude setup-token` (conta Max) em variável de ambiente
- [ ] Fila de análises com pg-boss
- [ ] Exportação do dataset (`concursos.csv`, `agregados.json`, `jogo.json`) para pasta de trabalho isolada
- [ ] Template de prompt versionado `aleatoriedade` e schema de `resultado.json`
- [ ] Validação do resultado (schema, regras de domínio, conferência contra agregados SQL)
- [ ] Persistência da análise: prompt, versão, modelo, duração, scripts gerados, resultado
- [ ] Seletor de modelo na UI (Opus 5.5 padrão, Sonnet, Haiku) e tela de resultado com gráficos

## Fase 3: Backtest e valor esperado

- [ ] Vigência de regras por período (preço da aposta, faixas de premiação)
- [ ] Template `backtest`: estratégia vs. aposta aleatória, walk-forward, correção para múltiplas comparações
- [ ] Template `ev`: prêmio estimado, probabilidade de rateio, IR, EV por aposta

## Fase 4: Diferenciais

- [ ] Template `popularidade`: ganhadores observados vs. esperados por perfil de dezenas
- [ ] Template `gerar_apostas`: apostas com mínima popularidade, validadas pelo domínio
- [ ] Servidor MCP local opcional para exploração no Claude Desktop

## Fase 5: Demais jogos

- [ ] Lotofácil, Quina, Lotomania, Dupla Sena, Dia de Sorte, Timemania, +Milionária
- [ ] Super Sete com fonte alternativa (endpoint da Caixa indisponível)

# Roadmap

## Objetivo

Maximizar o valor esperado das apostas e validar estratégias com backtest, usando o Claude (assinatura Max via Claude Code headless) para todas as estimativas. O projeto coleta, organiza e valida; o Claude calcula.

## Fase 1: Fundação de dados (Mega-Sena) — concluída

- [x] Monorepo pnpm, TypeScript, ESLint, Prettier, Lefthook, `.editorconfig`
- [x] `packages/domain` com a configuração declarativa da Mega-Sena
- [x] API Fastify com config validada, loaders e PostgreSQL via Kysely
- [x] Migrations: `jogo`, `concurso`, `dezena_sorteada`, `premiacao`, `payload_bruto`, `ingestao_execucao`
- [x] Cliente da Caixa: throttling, retry com backoff, timeout, sanitização de `\u0000`, parse de datas e dezenas
- [x] Ingestão retomável (backfill) e sincronização periódica do último concurso
- [x] Validação de integridade (sequência sem buracos, dezenas distintas no universo)
- [x] Endpoints: jogos, concursos paginados, detalhe, busca por dezenas, status e disparo da ingestão
- [x] Front React: histórico paginado, detalhe do concurso, busca por combinação, status da ingestão
- [x] Docker Compose com `db` e `app`

Critério de pronto: todos os concursos da Mega-Sena no banco, validação sem erros e sincronização captando o próximo sorteio sozinha.

Resultado (29/10/2026): 3077 concursos importados, sem lacunas e sem dezenas inválidas; ordem de extração presente em todos os concursos; banco com 18 MB.

Observações de dados para as próximas fases:

- 1069 concursos sem `valorArrecadado` (zero na Caixa, gravado como nulo); o primeiro com arrecadação é o 106. A regressão de popularidade (Fase 4) precisa restringir a amostra aos concursos com arrecadação.
- A sincronização periódica verifica o último concurso a cada 30 minutos (`SINCRONIZACAO_INTERVALO_MIN`), sem depender do calendário de sorteios.

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

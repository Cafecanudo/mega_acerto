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

- [x] Container `ai-worker`: Node + Claude Code CLI + Python (NumPy, SciPy, pandas, statsmodels)
- [x] Autenticação via `claude setup-token` (conta Max) em variável de ambiente
- [x] Fila de análises na própria tabela `analise` (`FOR UPDATE SKIP LOCKED`), em vez de pg-boss: uma única fonte de verdade para o status
- [x] Exportação do dataset (`concursos.csv`, `agregados.json`, `jogo.json`) para pasta de trabalho isolada
- [x] Template de prompt versionado `aleatoriedade` v1 e schema do resultado (`--json-schema`)
- [x] Validação do resultado (schema, universo de dezenas, conferência contra agregados SQL)
- [x] Persistência da análise: versão do prompt, modelo, esforço, duração, custo equivalente, scripts gerados, resultado
- [x] Seletor de modelo e esforço na UI (Opus 5.5 e esforço alto como padrão) e tela de resultado com gráfico
- [x] Template `frequencia-recente` v1 (31/10/2026): top N de uma janela recente com posição no ranking histórico, faixa do acaso por simulação, persistência entre janelas e backtest walk-forward; conferido contra agregados SQL da janela (`agregados_janela.json`). Execução real com o Claude ainda não feita
- [x] Template `sorteio-especifico` v1 (31/10/2026): perfil de um concurso antes do sorteio (posição, atraso e chance do atraso de cada dezena; soma, paridade e outras características em percentil entre todas as combinações) e palpite pouco popular conferido contra `filtrosPopularidade`; atalho na página do concurso. Execução real com o Claude ainda não feita
- [x] Teste ponta a ponta com o Opus 5.5 (29/10/2026: 5 min 24 s, custo equivalente US$ 1,07, conferência com SQL sem divergências)

## Gestão de apostas — concluída

Entregas fora das fases originais, feitas sobre a Fase 2:

- [x] Layout com sidebar: grupos Principal, Jogos, Minha Conta e Configurações, com indicadores de acertos e legenda
- [x] Busca no histórico com até 20 dezenas, combinações de até 3 ativas por padrão, busca ao digitar e detalhe do concurso em diálogo
- [x] Análises em menu próprio, com seleção do jogo
- [x] Favoritos: cadastro em diálogo com histórico das dezenas
- [x] Apostas: botão Apostar com lista de itens de jogos diferentes, favoritos um a um ou todos, efetivação em lote para o próximo concurso de cada jogo; lista somente leitura com conferência
- [x] Configurações › Valores: preço da aposta simples por jogo, custo por item e total no Apostar, valor gravado na aposta
- [x] Dezenas em cor neutra; verde reservado às dezenas acertadas em apostas (último sorteio, histórico, detalhe e lista de apostas)
- [x] Conferir Apostas: apostas não conferidas (inclusive aguardando sorteio), marcação individual ou "Todos conferidos" após o sorteio, prêmio a receber a partir da menor faixa premiada

Pendências conhecidas:

- [ ] Dupla Sena: a conferência não separa acertos por sorteio (aplica os mesmos acertos aos dois)
- [ ] Aposta sem concurso definido confere contra o último sorteio; depois de marcada como conferida, não volta à lista quando sai um novo sorteio
- [ ] Valores guarda só o preço atual; a vigência por período entra na Fase 3

## Multiusuário: login — concluída

Dados separados por usuário.

- [x] Diálogo flutuante de login e cadastro; senha com scrypt e sessão em cookie HttpOnly SameSite=Strict, renovada por 30 dias
- [x] Tabelas `usuario` e `sessao`; dono em `favorito`, `aposta` e `analise`; o primeiro cadastro assume os dados existentes
- [x] Filtro por usuário em todos os repositórios e endpoints dessas entidades; o restante da API exige sessão
- [x] `valor_jogo` continua global (preço oficial da Caixa)
- [x] Histórico de concursos e ingestão permanecem compartilhados

## Palpites e estratégias

- [x] Página Palpites: ranking das dezenas mais sorteadas por período, seleção livre ou Top 6/10/15, envio ao Apostar, favoritos ou busca no histórico
- [x] Análise `estrategia` pelo Claude: palpite do próximo concurso e backtest walk-forward contra apostas aleatórias (mais/menos sorteadas, mais atrasadas, equilibrada ou regra personalizada)
- [x] Montar jogos (diálogo em Palpites): jogo manual com as dezenas selecionadas, todas as combinações (até 1000) ou combinações sorteadas sem repetição, tipo de jogo e dezenas por jogo, envio de até 200 jogos ao Apostar
- [x] Teimosinha de 1 a 12 concursos no Apostar, com uma aposta gravada por concurso e etiqueta nas listas
- [x] Simulador: sorteios aleatórios no navegador, sem gravação. Modo Ao vivo com globo animado (uma bola por intervalo, até 100 sorteios) e modo Rápido (até 10 mil por clique, 100 mil na lista); dezenas que coincidem com apostas pendentes ficam verdes e com favoritos, azuis, com filtro de sorteios premiados; "Sortear até ganhar" com busca em Web Worker e diálogo de match
- [x] Página Início (`/`): por jogo, último sorteio e minhas apostas do próximo concurso (selo "aguardando resultado" quando a ingestão está atrasada); resumo do que há a conferir, análises recentes e balanço de gasto × prêmios (12 meses e todo o período); linha do tempo de acertos (apostas × favoritos não apostados × acaso) em 20, 50 ou 100 concursos
- [ ] Filtro de popularidade (evitar combinações muito jogadas): primeira versão heurística no palpite do `sorteio-especifico` (`filtrosPopularidade`); falta aplicar ao Montar jogos e ao Apostar
- [ ] Fechamentos (desdobramentos com garantia)

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

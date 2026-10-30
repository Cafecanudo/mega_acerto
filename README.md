# Mega Acerto

Sistema local de análise das loterias da Caixa: histórico oficial de sorteios, palpites, montagem de jogos, controle de apostas e análises estatísticas feitas pelo Claude. Uso exclusivamente local, sem publicação.

## Ambientes

O projeto tem dois ambientes Docker independentes, cada um com seu próprio PostgreSQL e volume. Nada do desenvolvimento alcança os dados de produção.

|                       | Produção                     | Desenvolvimento                            |
| --------------------- | ---------------------------- | ------------------------------------------ |
| Arquivo               | `docker-compose.yml`         | `docker-compose.dev.yml`                   |
| Projeto Docker        | `mega-acerto`                | `mega-acerto-dev`                          |
| Volume do banco       | `mega-acerto_dados-postgres` | `mega-acerto-dev_dados-postgres`           |
| Aplicação             | `http://localhost:3000`      | API `:3100` e Vite `http://localhost:5173` |
| Banco exposto no host | não                          | `localhost:5442`                           |
| Uso                   | seus dados reais             | codificar e testar, inclusive pela IA      |

Os dois podem rodar ao mesmo tempo. A produção não publica a porta do banco, então nenhuma ferramenta de desenvolvimento consegue se conectar a ela por engano. Os dados de desenvolvimento são descartáveis e podem ser recriados a partir da produção a qualquer momento.

## Pré-requisitos

- Docker com Docker Compose v2 (`docker compose version`)
- Node 24 e Corepack, somente para o desenvolvimento
- Opcional, para as análises: assinatura Claude Max e o Claude Code instalado na máquina

## Produção

### Subir

```bash
git clone https://github.com/Cafecanudo/mega_acerto.git
cd mega_acerto
cp .env.example .env
docker compose up -d --build
```

Acesse `http://localhost:3000` e crie sua conta no diálogo de login.

| Serviço     | Função                                                                 |
| ----------- | ---------------------------------------------------------------------- |
| `db`        | PostgreSQL 17, sem porta no host                                       |
| `app`       | API e interface web na porta 3000; aplica as migrations ao iniciar     |
| `ai-worker` | Executa as análises pedidas na interface usando o Claude Code headless |

Na primeira execução o `app` importa o histórico completo da Caixa. Com o intervalo padrão de 500 ms entre requisições, a Mega-Sena leva cerca de 30 minutos. A interface funciona durante a importação, que é retomável se o container parar. Depois disso, o último concurso é verificado a cada 30 minutos.

### Atualizar após mudanças no código

```bash
git pull
docker compose up -d --build
```

Só faça isso com código já testado no desenvolvimento: as migrations novas são aplicadas no banco de produção ao iniciar. Faça um backup antes.

### Operação

| Ação                         | Comando                                           |
| ---------------------------- | ------------------------------------------------- |
| Ver status e saúde           | `docker compose ps`                               |
| Acompanhar logs da aplicação | `docker compose logs -f app`                      |
| Acompanhar logs do worker    | `docker compose logs -f ai-worker`                |
| Parar sem perder dados       | `docker compose stop`                             |
| Iniciar de novo              | `docker compose start`                            |
| Consultar o banco            | `docker compose exec db psql -U mega mega_acerto` |
| Remover containers           | `docker compose down`                             |

**`docker compose down -v` apaga o volume do banco de produção**: histórico importado, contas, favoritos, apostas e análises são perdidos.

### Backup e restauração

```bash
corepack pnpm prod:backup
```

Gera `mega_acerto.dump` na raiz (ignorado pelo git). Sem Node, o equivalente é:

```bash
docker compose exec -T db pg_dump -U mega -Fc mega_acerto > mega_acerto.dump
```

Para restaurar, pare a aplicação e o worker antes, para não haver conexões abertas:

```bash
docker compose stop app ai-worker
docker compose exec -T db pg_restore -U mega -d mega_acerto --clean --if-exists < mega_acerto.dump
docker compose start app ai-worker
```

## Desenvolvimento

### Primeira vez

```bash
corepack pnpm install
cp .env.example .env
corepack pnpm dev:db:copiar
corepack pnpm dev
```

- `dev:db:copiar` sobe o banco de desenvolvimento e copia para ele os dados atuais da produção. A produção precisa estar rodando.
- `dev` roda a API em `:3100` (lê o `.env`, que aponta para `localhost:5442`) e o Vite em `http://localhost:5173`.
- Entre com a mesma conta da produção: os usuários também são copiados.

### Comandos

| Ação                                  | Comando                                     |
| ------------------------------------- | ------------------------------------------- |
| Subir só o banco de desenvolvimento   | `corepack pnpm dev:db`                      |
| Recriar os dados a partir da produção | `corepack pnpm dev:db:copiar`               |
| Rodar API e front                     | `corepack pnpm dev`                         |
| Subir o worker de análises do dev     | `corepack pnpm dev:worker`                  |
| Parar banco e worker do dev           | `corepack pnpm dev:parar`                   |
| Lint, typecheck e formatação          | `corepack pnpm lint`, `typecheck`, `format` |

- `dev:db:copiar` substitui todo o conteúdo do banco de desenvolvimento. Pare a API de desenvolvimento antes de rodar.
- O worker de desenvolvimento só sobe com `dev:worker` (perfil `analises`), para não consumir cota sem necessidade. Ele usa o banco de desenvolvimento.
- Para zerar o desenvolvimento por completo: `docker compose -f docker-compose.dev.yml --profile analises down -v`. Esse comando afeta apenas o volume `mega-acerto-dev_dados-postgres`.

## Análises com o Claude (opcional)

Sem token, o projeto funciona normalmente, mas as análises pedidas em **Análises** falham.

1. Na máquina, gere o token da assinatura Max:

   ```bash
   claude setup-token
   ```

2. Grave o valor em `CLAUDE_CODE_OAUTH_TOKEN` no `.env`. Nunca commite esse arquivo.
3. Recrie o worker do ambiente desejado:

   ```bash
   docker compose up -d ai-worker
   ```

   ```bash
   corepack pnpm dev:worker
   ```

## Configuração

O `.env` da raiz serve aos dois ambientes.

| Variável                      | Padrão | Ambiente | Uso                                              |
| ----------------------------- | ------ | -------- | ------------------------------------------------ |
| `APP_PORTA_HOST`              | `3000` | produção | Porta da aplicação no host                       |
| `DB_DEV_PORTA_HOST`           | `5442` | dev      | Porta do banco de desenvolvimento no host        |
| `DATABASE_URL`                | `5442` | dev      | Conexão da API de desenvolvimento                |
| `PORT`                        | `3100` | dev      | Porta da API de desenvolvimento                  |
| `SINCRONIZACAO_AO_INICIAR`    | `true` | dev      | Importar concursos novos ao iniciar a API de dev |
| `LOG_LEVEL`                   | `info` | ambos    | Nível de log                                     |
| `CAIXA_INTERVALO_MS`          | `500`  | ambos    | Intervalo entre requisições à API da Caixa       |
| `SINCRONIZACAO_INTERVALO_MIN` | `30`   | ambos    | Intervalo da verificação de novos concursos      |
| `CLAUDE_CODE_OAUTH_TOKEN`     | vazio  | ambos    | Token da assinatura Max para as análises         |
| `ANALISE_TIMEOUT_MIN`         | `30`   | ambos    | Tempo máximo de uma análise                      |

Dentro dos containers, `DATABASE_URL` e `PORT` são fixados pelo Compose; os valores do `.env` valem apenas para a API rodando na máquina.

## Contas de usuário

- O cadastro é aberto: qualquer pessoa com acesso à porta 3000 pode criar conta. Não exponha a aplicação fora da rede local.
- Favoritos, apostas e análises são separados por usuário. Concursos e valores das apostas são compartilhados.
- A primeira conta criada assume os dados que existiam sem dono.

## Problemas comuns

- **Porta em uso:** defina `APP_PORTA_HOST` ou `DB_DEV_PORTA_HOST` no `.env` e suba o ambiente de novo.
- **`dev:db:copiar` falha com "service db is not running":** suba a produção com `docker compose up -d`.
- **`dev:db:copiar` falha com objetos em uso:** pare a API de desenvolvimento e rode de novo.
- **Front de desenvolvimento não acha a API:** confira `PORT=3100` no `.env`; o Vite encaminha `/api` para `localhost:3100`.
- **Análise falha com "CLAUDE_CODE_OAUTH_TOKEN não configurado":** siga a seção de análises e recrie o worker.
- **Valores das apostas aparecem como "—":** cadastre o preço em **Configurações › Valores**.

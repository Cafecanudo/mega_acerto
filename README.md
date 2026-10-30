# Mega Acerto

Sistema local de análise das loterias da Caixa: histórico oficial de sorteios, palpites, montagem de jogos, controle de apostas e análises estatísticas feitas pelo Claude.

Este guia cobre a execução com Docker. Para desenvolvimento, veja [CLAUDE.md](CLAUDE.md).

## Pré-requisitos

- Docker com Docker Compose v2 (`docker compose version`)
- Portas livres no host: `3000` (aplicação) e `5442` (PostgreSQL)
- Opcional, para as análises: assinatura Claude Max e o Claude Code instalado na máquina

## Subir o projeto

```bash
git clone https://github.com/Cafecanudo/mega_acerto.git
cd mega_acerto
cp .env.example .env
docker compose up -d --build
```

Acesse `http://localhost:3000` e crie sua conta no diálogo de login.

O Compose sobe três containers:

| Serviço     | Função                                                                 |
| ----------- | ---------------------------------------------------------------------- |
| `db`        | PostgreSQL 17, dados no volume `dados-postgres`                        |
| `app`       | API e interface web na porta 3000; aplica as migrations ao iniciar     |
| `ai-worker` | Executa as análises pedidas na interface usando o Claude Code headless |

### Primeira execução

Ao iniciar, o `app` importa o histórico completo da Caixa. Com o intervalo padrão de 500 ms entre requisições, a Mega-Sena leva cerca de 30 minutos. A interface já funciona durante a importação e mostra o progresso. Depois disso, o último concurso é verificado a cada 30 minutos.

A importação é retomável: se o container parar, ela continua de onde parou.

## Análises com o Claude (opcional)

Sem token, o projeto funciona normalmente, mas as análises pedidas em **Análises** falham.

1. Na máquina, gere o token da assinatura Max:

   ```bash
   claude setup-token
   ```

2. Grave o valor em `CLAUDE_CODE_OAUTH_TOKEN` no `.env`. Nunca commite esse arquivo.
3. Recrie o worker:

   ```bash
   docker compose up -d ai-worker
   ```

## Configuração

O `docker compose` lê o `.env` da raiz. Variáveis usadas pelos containers:

| Variável                      | Padrão | Uso                                                |
| ----------------------------- | ------ | -------------------------------------------------- |
| `APP_PORTA_HOST`              | `3000` | Porta da aplicação no host                         |
| `DB_PORTA_HOST`               | `5442` | Porta do PostgreSQL no host                        |
| `LOG_LEVEL`                   | `info` | Nível de log da API e do worker                    |
| `CAIXA_INTERVALO_MS`          | `500`  | Intervalo entre requisições à API da Caixa         |
| `SINCRONIZACAO_INTERVALO_MIN` | `30`   | Intervalo da verificação de novos concursos        |
| `CLAUDE_CODE_OAUTH_TOKEN`     | vazio  | Token da assinatura Max para as análises           |
| `ANALISE_TIMEOUT_MIN`         | `30`   | Tempo máximo de uma análise antes de ser cancelada |

As demais variáveis do `.env.example` (`DATABASE_URL`, `PORT`) valem apenas para o modo de desenvolvimento; dentro do Docker elas são fixadas pelo Compose.

## Operação

| Ação                         | Comando                            |
| ---------------------------- | ---------------------------------- |
| Ver status e saúde           | `docker compose ps`                |
| Acompanhar logs da aplicação | `docker compose logs -f app`       |
| Acompanhar logs do worker    | `docker compose logs -f ai-worker` |
| Parar sem perder dados       | `docker compose stop`              |
| Iniciar de novo              | `docker compose start`             |
| Atualizar após `git pull`    | `docker compose up -d --build`     |
| Remover containers           | `docker compose down`              |

**`docker compose down -v` apaga o volume do banco**: todo o histórico importado, contas, favoritos, apostas e análises são perdidos.

## Backup e restauração

```bash
docker compose exec -T db pg_dump -U mega -Fc mega_acerto > backup.dump
```

Para restaurar, pare a aplicação e o worker antes, para não haver conexões abertas no banco:

```bash
docker compose stop app ai-worker
docker compose exec -T db pg_restore -U mega -d mega_acerto --clean --if-exists < backup.dump
docker compose start app ai-worker
```

## Contas de usuário

- O cadastro é aberto: qualquer pessoa com acesso à porta 3000 pode criar conta. Não exponha a aplicação fora da rede local.
- Favoritos, apostas e análises são separados por usuário. Concursos e valores das apostas são compartilhados.
- A primeira conta criada assume os dados que existiam sem dono.

## Problemas comuns

- **Porta em uso:** defina `APP_PORTA_HOST` ou `DB_PORTA_HOST` no `.env` e rode `docker compose up -d`.
- **Não rode o modo de desenvolvimento (`pnpm dev`) junto com o container `app`:** os dois usam a porta 3000 e disparariam a importação em paralelo.
- **Análise falha com "CLAUDE_CODE_OAUTH_TOKEN não configurado":** siga a seção de análises e recrie o `ai-worker`.
- **Valores das apostas aparecem como "—":** cadastre o preço em **Configurações › Valores**.

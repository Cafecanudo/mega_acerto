import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Kysely } from 'kysely';
import type { Config } from '../config/config.ts';
import type { Database } from '../data/database.ts';
import { AnaliseRepository } from '../data/repositories/analise-repository.ts';
import { ApostaRepository } from '../data/repositories/aposta-repository.ts';
import { ConferenciaRepository } from '../data/repositories/conferencia-repository.ts';
import { FavoritoRepository } from '../data/repositories/favorito-repository.ts';
import { ConcursoLeituraRepository } from '../data/repositories/concurso-leitura-repository.ts';
import { JogoRepository } from '../data/repositories/jogo-repository.ts';
import type { ExecutorAnalise } from '../services/analises/executor-analise.ts';
import { AnaliseService } from '../services/analise-service.ts';
import { ApostaService } from '../services/aposta-service.ts';
import { ConferenciaService } from '../services/conferencia-service.ts';
import { FavoritoService } from '../services/favorito-service.ts';
import { ConcursoService } from '../services/concurso-service.ts';
import type { IngestaoService } from '../services/ingestao-service.ts';
import { JogoService } from '../services/jogo-service.ts';
import type { Logger } from '../shared/logger.ts';
import { lazy } from '../shared/lazy.ts';

export interface Container {
  readonly config: Config;
  readonly db: Kysely<Database>;
  readonly logger: Logger;
  readonly jogoService: () => JogoService;
  readonly concursoService: () => ConcursoService;
  readonly analiseService: () => AnaliseService;
  readonly apostaService: () => ApostaService;
  readonly favoritoService: () => FavoritoService;
  readonly ingestaoService: () => Promise<IngestaoService>;
  readonly executorAnalise: () => Promise<ExecutorAnalise>;
}

const MILISSEGUNDOS_POR_MINUTO = 60_000;

const criarIngestaoService = async (
  config: Config,
  db: Kysely<Database>,
  logger: Logger,
): Promise<IngestaoService> => {
  const [servico, cliente, escrita, execucoes] = await Promise.all([
    import('../services/ingestao-service.ts'),
    import('../integrations/caixa/caixa-client.ts'),
    import('../data/repositories/concurso-escrita-repository.ts'),
    import('../data/repositories/ingestao-repository.ts'),
  ]);

  const caixa = new cliente.CaixaClient(
    {
      baseUrl: config.CAIXA_BASE_URL,
      intervaloMs: config.CAIXA_INTERVALO_MS,
      timeoutMs: config.CAIXA_TIMEOUT_MS,
      tentativas: config.CAIXA_TENTATIVAS,
    },
    logger,
  );

  return new servico.IngestaoService({
    caixa,
    concursos: new escrita.ConcursoEscritaRepository(db),
    execucoes: new execucoes.IngestaoRepository(db),
    logger,
  });
};

const criarExecutorAnalise = async (
  config: Config,
  db: Kysely<Database>,
  logger: Logger,
): Promise<ExecutorAnalise> => {
  const [executor, exportador, dataset, claude] = await Promise.all([
    import('../services/analises/executor-analise.ts'),
    import('../services/analises/exportador-dataset.ts'),
    import('../data/repositories/dataset-repository.ts'),
    import('../integrations/claude/claude-cli.ts'),
  ]);

  return new executor.ExecutorAnalise({
    analises: new AnaliseRepository(db),
    exportador: new exportador.ExportadorDataset(new dataset.DatasetRepository(db)),
    claude: new claude.ClaudeCli({
      executavel: config.CLAUDE_EXECUTAVEL,
      tokenOauth: config.CLAUDE_CODE_OAUTH_TOKEN,
      timeoutMs: config.ANALISE_TIMEOUT_MIN * MILISSEGUNDOS_POR_MINUTO,
    }),
    logger,
    diretorioTrabalho: config.ANALISE_DIRETORIO_TRABALHO ?? join(tmpdir(), 'mega-analises'),
  });
};

export const criarContainer = (config: Config, db: Kysely<Database>, logger: Logger): Container => {
  const concursosLeitura = lazy(() => new ConcursoLeituraRepository(db));
  const conferencia = lazy(() => new ConferenciaService(new ConferenciaRepository(db)));

  return {
    config,
    db,
    logger,
    jogoService: lazy(() => new JogoService(new JogoRepository(db))),
    concursoService: lazy(() => new ConcursoService(concursosLeitura())),
    analiseService: lazy(() => new AnaliseService(new AnaliseRepository(db), concursosLeitura())),
    apostaService: lazy(() => new ApostaService(new ApostaRepository(db), conferencia())),
    favoritoService: lazy(() => new FavoritoService(new FavoritoRepository(db), conferencia())),
    ingestaoService: lazy(() => criarIngestaoService(config, db, logger)),
    executorAnalise: lazy(() => criarExecutorAnalise(config, db, logger)),
  };
};

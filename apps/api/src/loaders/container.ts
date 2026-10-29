import type { Kysely } from 'kysely';
import type { Config } from '../config/config.ts';
import type { Database } from '../data/database.ts';
import { ConcursoLeituraRepository } from '../data/repositories/concurso-leitura-repository.ts';
import { JogoRepository } from '../data/repositories/jogo-repository.ts';
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
  readonly ingestaoService: () => Promise<IngestaoService>;
}

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

export const criarContainer = (
  config: Config,
  db: Kysely<Database>,
  logger: Logger,
): Container => ({
  config,
  db,
  logger,
  jogoService: lazy(() => new JogoService(new JogoRepository(db))),
  concursoService: lazy(() => new ConcursoService(new ConcursoLeituraRepository(db))),
  ingestaoService: lazy(() => criarIngestaoService(config, db, logger)),
});

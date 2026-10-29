import type { Kysely } from 'kysely';
import type { Config } from '../config/config.ts';
import type { Database } from '../data/database.ts';
import { JogoRepository } from '../data/repositories/jogo-repository.ts';
import { JogoService } from '../services/jogo-service.ts';
import type { Logger } from '../shared/logger.ts';
import { lazy } from '../shared/lazy.ts';

export interface Container {
  readonly config: Config;
  readonly db: Kysely<Database>;
  readonly logger: Logger;
  readonly jogoService: () => JogoService;
}

export const criarContainer = (
  config: Config,
  db: Kysely<Database>,
  logger: Logger,
): Container => ({
  config,
  db,
  logger,
  jogoService: lazy(() => new JogoService(new JogoRepository(db))),
});

import { carregarConfig } from './config/config.ts';
import { criarConexao } from './data/conexao.ts';
import { executarMigrations } from './data/migrator.ts';
import { AnaliseRepository } from './data/repositories/analise-repository.ts';
import { iniciarFilaAnalises } from './jobs/fila-analises.ts';
import { criarContainer } from './loaders/container.ts';
import { criarLogger } from './shared/logger.ts';

const iniciar = async (): Promise<void> => {
  const config = carregarConfig();
  const logger = criarLogger(config);
  const db = criarConexao(config.DATABASE_URL);

  await executarMigrations(db);

  const interrompidas = await new AnaliseRepository(db).interromperEmExecucao();
  if (interrompidas > 0)
    logger.warn({ interrompidas }, 'Análises interrompidas marcadas como falha');

  if (!config.CLAUDE_CODE_OAUTH_TOKEN) {
    logger.warn(
      'CLAUDE_CODE_OAUTH_TOKEN ausente: as análises vão falhar até o token ser configurado',
    );
  }

  const container = criarContainer(config, db, logger);
  const executor = await container.executorAnalise();
  const fila = iniciarFilaAnalises({
    intervaloMs: config.ANALISE_INTERVALO_FILA_MS,
    processarProxima: () => executor.processarProxima(),
    logger,
  });

  logger.info('Worker de análises aguardando pedidos');

  const encerrar = async (sinal: string): Promise<void> => {
    logger.info({ sinal }, 'Encerrando worker');
    await fila.parar();
    await db.destroy();
    process.exit(0);
  };

  process.once('SIGINT', (sinal) => void encerrar(sinal));
  process.once('SIGTERM', (sinal) => void encerrar(sinal));
};

await iniciar();

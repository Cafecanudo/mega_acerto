import { criarServidor } from './api/servidor.ts';
import { carregarConfig } from './config/config.ts';
import { criarConexao } from './data/conexao.ts';
import { executarMigrations } from './data/migrator.ts';
import { criarContainer } from './loaders/container.ts';
import { criarLogger } from './shared/logger.ts';

const iniciar = async (): Promise<void> => {
  const config = carregarConfig();
  const logger = criarLogger(config);
  const db = criarConexao(config.DATABASE_URL);

  const aplicadas = await executarMigrations(db);
  if (aplicadas.length > 0) logger.info({ aplicadas }, 'Migrations aplicadas');

  const container = criarContainer(config, db, logger);
  await container.jogoService().registrarCatalogo();

  const app = await criarServidor(container, logger);

  const encerrar = async (sinal: string): Promise<void> => {
    logger.info({ sinal }, 'Encerrando aplicação');
    await app.close();
    await db.destroy();
    process.exit(0);
  };

  process.once('SIGINT', (sinal) => void encerrar(sinal));
  process.once('SIGTERM', (sinal) => void encerrar(sinal));

  await app.listen({ host: config.HOST, port: config.PORT });
};

await iniciar();

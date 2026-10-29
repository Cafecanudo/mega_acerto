import Fastify, { type FastifyBaseLogger } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type { Container } from '../loaders/container.ts';
import { tratarErro } from './tratar-erro.ts';
import { registrarWebEstatico } from './web-estatico.ts';

const PREFIXO_API = '/api';

export const criarServidor = async (container: Container, logger: FastifyBaseLogger) => {
  const app = Fastify({ loggerInstance: logger }).withTypeProvider<TypeBoxTypeProvider>();

  app.setErrorHandler(tratarErro);

  const opcoes = { prefix: PREFIXO_API, container };
  await app.register(import('./routes/saude.ts'), opcoes);
  await app.register(import('./routes/jogos.ts'), opcoes);

  await registrarWebEstatico(app, container.config.WEB_DIST_DIR, PREFIXO_API);

  return app;
};

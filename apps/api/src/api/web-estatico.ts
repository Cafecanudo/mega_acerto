import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { FastifyInstance, FastifyReply } from 'fastify';

const responderRotaInexistente = async (resposta: FastifyReply): Promise<void> => {
  await resposta.status(404).send({ erro: 'nao-encontrado', mensagem: 'Rota não encontrada' });
};

const resolverRaiz = (app: FastifyInstance, diretorio: string | undefined): string | undefined => {
  if (!diretorio) return undefined;

  const raiz = resolve(diretorio);
  if (existsSync(raiz)) return raiz;

  app.log.warn({ raiz }, 'Diretório do front não encontrado; servindo apenas a API');
  return undefined;
};

export const registrarWebEstatico = async (
  app: FastifyInstance,
  diretorio: string | undefined,
  prefixoApi: string,
): Promise<void> => {
  const raiz = resolverRaiz(app, diretorio);

  if (!raiz) {
    app.setNotFoundHandler(async (_requisicao, resposta) => responderRotaInexistente(resposta));
    return;
  }

  const { default: fastifyStatic } = await import('@fastify/static');
  await app.register(fastifyStatic, { root: raiz, wildcard: false });

  app.setNotFoundHandler(async (requisicao, resposta) => {
    if (requisicao.url.startsWith(`${prefixoApi}/`)) {
      await responderRotaInexistente(resposta);
      return;
    }
    await resposta.sendFile('index.html');
  });
};

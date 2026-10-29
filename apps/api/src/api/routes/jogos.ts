import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { JogoDisponivelSchema } from '../schemas/jogo.ts';
import type { OpcoesRotas } from '../opcoes-rotas.ts';

const rotasJogos: FastifyPluginAsyncTypebox<OpcoesRotas> = async (app, { container }) => {
  app.get('/jogos', { schema: { response: { 200: Type.Array(JogoDisponivelSchema) } } }, async () =>
    container.jogoService().listar(),
  );
};

export default rotasJogos;

import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { usuarioDe } from '../autenticacao.ts';
import type { OpcoesRotas } from '../opcoes-rotas.ts';
import { ParametrosJogoSchema } from '../schemas/jogo.ts';
import { ConsultaLinhaDoTempoSchema, PontoLinhaDoTempoSchema } from '../schemas/linha-do-tempo.ts';

const rotasLinhaDoTempo: FastifyPluginAsyncTypebox<OpcoesRotas> = async (app, { container }) => {
  app.get(
    '/jogos/:jogo/linha-do-tempo',
    {
      schema: {
        params: ParametrosJogoSchema,
        querystring: ConsultaLinhaDoTempoSchema,
        response: { 200: Type.Array(PontoLinhaDoTempoSchema) },
      },
    },
    async (requisicao) =>
      container
        .linhaDoTempoService()
        .listar(usuarioDe(requisicao).id, requisicao.params.jogo, requisicao.query.ultimos),
  );
};

export default rotasLinhaDoTempo;

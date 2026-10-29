import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  AnaliseSchema,
  AnaliseSolicitadaSchema,
  ParametrosAnaliseSchema,
  ResumoAnaliseSchema,
  SolicitacaoAnaliseSchema,
} from '../schemas/analise.ts';
import { ParametrosJogoSchema } from '../schemas/jogo.ts';
import type { OpcoesRotas } from '../opcoes-rotas.ts';

const rotasAnalises: FastifyPluginAsyncTypebox<OpcoesRotas> = async (app, { container }) => {
  app.get(
    '/jogos/:jogo/analises',
    {
      schema: { params: ParametrosJogoSchema, response: { 200: Type.Array(ResumoAnaliseSchema) } },
    },
    async (requisicao) => container.analiseService().listar(requisicao.params.jogo),
  );

  app.post(
    '/jogos/:jogo/analises',
    {
      schema: {
        params: ParametrosJogoSchema,
        body: SolicitacaoAnaliseSchema,
        response: { 200: AnaliseSolicitadaSchema, 202: AnaliseSolicitadaSchema },
      },
    },
    async (requisicao, resposta) => {
      const solicitada = await container
        .analiseService()
        .solicitar(requisicao.params.jogo, requisicao.body);
      return resposta.status(solicitada.reaproveitada ? 200 : 202).send(solicitada);
    },
  );

  app.get(
    '/jogos/:jogo/analises/:id',
    { schema: { params: ParametrosAnaliseSchema, response: { 200: AnaliseSchema } } },
    async (requisicao) =>
      container.analiseService().obter(requisicao.params.jogo, requisicao.params.id),
  );
};

export default rotasAnalises;

import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  AnaliseSchema,
  AnaliseSolicitadaSchema,
  ParametrosAnaliseSchema,
  ResumoAnaliseSchema,
  SolicitacaoAnaliseSchema,
} from '../schemas/analise.ts';
import { ParametrosJogoSchema } from '../schemas/jogo.ts';
import { usuarioDe } from '../autenticacao.ts';
import type { OpcoesRotas } from '../opcoes-rotas.ts';

const rotasAnalises: FastifyPluginAsyncTypebox<OpcoesRotas> = async (app, { container }) => {
  app.get(
    '/analises',
    { schema: { response: { 200: Type.Array(ResumoAnaliseSchema) } } },
    async (requisicao) => container.analiseService().listar(usuarioDe(requisicao).id),
  );

  app.get(
    '/analises/:id',
    { schema: { params: ParametrosAnaliseSchema, response: { 200: AnaliseSchema } } },
    async (requisicao) =>
      container.analiseService().obter(usuarioDe(requisicao).id, requisicao.params.id),
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
        .solicitar(usuarioDe(requisicao).id, requisicao.params.jogo, requisicao.body);
      return resposta.status(solicitada.reaproveitada ? 200 : 202).send(solicitada);
    },
  );
};

export default rotasAnalises;

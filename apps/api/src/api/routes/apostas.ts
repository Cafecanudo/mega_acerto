import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  AlteracaoApostaSchema,
  ApostaSchema,
  FiltroApostasSchema,
  NovaApostaSchema,
  ParametrosApostaSchema,
} from '../schemas/aposta.ts';
import type { OpcoesRotas } from '../opcoes-rotas.ts';

const rotasApostas: FastifyPluginAsyncTypebox<OpcoesRotas> = async (app, { container }) => {
  app.get(
    '/apostas',
    { schema: { querystring: FiltroApostasSchema, response: { 200: Type.Array(ApostaSchema) } } },
    async (requisicao) => container.apostaService().listar(requisicao.query.favoritas),
  );

  app.post(
    '/apostas',
    { schema: { body: NovaApostaSchema, response: { 201: ApostaSchema } } },
    async (requisicao, resposta) => {
      const aposta = await container.apostaService().criar(requisicao.body);
      return resposta.status(201).send(aposta);
    },
  );

  app.patch(
    '/apostas/:id',
    {
      schema: {
        params: ParametrosApostaSchema,
        body: AlteracaoApostaSchema,
        response: { 200: ApostaSchema },
      },
    },
    async (requisicao) => container.apostaService().alterar(requisicao.params.id, requisicao.body),
  );

  app.delete(
    '/apostas/:id',
    { schema: { params: ParametrosApostaSchema } },
    async (requisicao, resposta) => {
      await container.apostaService().excluir(requisicao.params.id);
      return resposta.status(204).send();
    },
  );
};

export default rotasApostas;

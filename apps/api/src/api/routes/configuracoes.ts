import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { OpcoesRotas } from '../opcoes-rotas.ts';

const ValorConfiguradoSchema = Type.Object({
  jogo: Type.String(),
  valorAposta: Type.Union([Type.Number(), Type.Null()]),
  atualizadoEm: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
});

const rotasConfiguracoes: FastifyPluginAsyncTypebox<OpcoesRotas> = async (app, { container }) => {
  app.get(
    '/configuracoes/valores',
    { schema: { response: { 200: Type.Array(ValorConfiguradoSchema) } } },
    async () => container.valorJogoService().listar(),
  );

  app.put(
    '/configuracoes/valores/:jogo',
    {
      schema: {
        params: Type.Object({ jogo: Type.String({ minLength: 1 }) }),
        body: Type.Object(
          { valorAposta: Type.Number({ exclusiveMinimum: 0 }) },
          { additionalProperties: false },
        ),
        response: { 200: ValorConfiguradoSchema },
      },
    },
    async (requisicao) =>
      container.valorJogoService().salvar(requisicao.params.jogo, requisicao.body.valorAposta),
  );
};

export default rotasConfiguracoes;

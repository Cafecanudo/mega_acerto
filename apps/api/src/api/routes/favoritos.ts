import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  AlteracaoFavoritoSchema,
  FavoritoSchema,
  NovoFavoritoSchema,
  ParametrosFavoritoSchema,
} from '../schemas/favorito.ts';
import { usuarioDe } from '../autenticacao.ts';
import type { OpcoesRotas } from '../opcoes-rotas.ts';

const rotasFavoritos: FastifyPluginAsyncTypebox<OpcoesRotas> = async (app, { container }) => {
  app.get(
    '/favoritos',
    { schema: { response: { 200: Type.Array(FavoritoSchema) } } },
    async (requisicao) => container.favoritoService().listar(usuarioDe(requisicao).id),
  );

  app.post(
    '/favoritos',
    { schema: { body: NovoFavoritoSchema, response: { 201: FavoritoSchema } } },
    async (requisicao, resposta) => {
      const favorito = await container
        .favoritoService()
        .criar(usuarioDe(requisicao).id, requisicao.body);
      return resposta.status(201).send(favorito);
    },
  );

  app.patch(
    '/favoritos/:id',
    {
      schema: {
        params: ParametrosFavoritoSchema,
        body: AlteracaoFavoritoSchema,
        response: { 200: FavoritoSchema },
      },
    },
    async (requisicao) =>
      container
        .favoritoService()
        .alterar(usuarioDe(requisicao).id, requisicao.params.id, requisicao.body),
  );

  app.delete(
    '/favoritos/:id',
    { schema: { params: ParametrosFavoritoSchema } },
    async (requisicao, resposta) => {
      await container.favoritoService().excluir(usuarioDe(requisicao).id, requisicao.params.id);
      return resposta.status(204).send();
    },
  );
};

export default rotasFavoritos;

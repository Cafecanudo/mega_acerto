import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  BuscaQuerySchema,
  DetalheConcursoSchema,
  PaginaBuscaSchema,
  PaginaConcursosSchema,
  PaginacaoQuerySchema,
  ParametrosConcursoSchema,
} from '../schemas/concurso.ts';
import { ParametrosJogoSchema } from '../schemas/jogo.ts';
import type { OpcoesRotas } from '../opcoes-rotas.ts';

const converterListaDezenas = (valor: string): number[] =>
  valor.split(',').map((dezena) => Number.parseInt(dezena, 10));

const rotasConcursos: FastifyPluginAsyncTypebox<OpcoesRotas> = async (app, { container }) => {
  app.get(
    '/jogos/:jogo/concursos',
    {
      schema: {
        params: ParametrosJogoSchema,
        querystring: PaginacaoQuerySchema,
        response: { 200: PaginaConcursosSchema },
      },
    },
    async (requisicao) =>
      container.concursoService().listar(requisicao.params.jogo, requisicao.query),
  );

  app.get(
    '/jogos/:jogo/concursos/busca',
    {
      schema: {
        params: ParametrosJogoSchema,
        querystring: BuscaQuerySchema,
        response: { 200: PaginaBuscaSchema },
      },
    },
    async (requisicao) => {
      const { dezenas, minimoAcertos, pagina, tamanho } = requisicao.query;
      return container.concursoService().buscarPorDezenas(requisicao.params.jogo, {
        dezenas: converterListaDezenas(dezenas),
        minimoAcertos,
        pagina,
        tamanho,
      });
    },
  );

  app.get(
    '/jogos/:jogo/concursos/ultimo',
    { schema: { params: ParametrosJogoSchema, response: { 200: DetalheConcursoSchema } } },
    async (requisicao) => container.concursoService().obterUltimo(requisicao.params.jogo),
  );

  app.get(
    '/jogos/:jogo/concursos/:numero',
    { schema: { params: ParametrosConcursoSchema, response: { 200: DetalheConcursoSchema } } },
    async (requisicao) =>
      container.concursoService().obter(requisicao.params.jogo, requisicao.params.numero),
  );
};

export default rotasConcursos;

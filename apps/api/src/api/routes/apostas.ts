import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import {
  AcertosConcursoSchema,
  ApostasEfetivadasSchema,
  ConsultaApostasSchema,
  EfetivacaoApostasSchema,
  PaginaApostasSchema,
  ResumoApostasSchema,
} from '../schemas/aposta.ts';
import type { OpcoesRotas } from '../opcoes-rotas.ts';

const converterListaDezenas = (valor: string | undefined): number[] =>
  valor ? valor.split(',').map((dezena) => Number.parseInt(dezena, 10)) : [];

const rotasApostas: FastifyPluginAsyncTypebox<OpcoesRotas> = async (app, { container }) => {
  app.get(
    '/apostas',
    { schema: { querystring: ConsultaApostasSchema, response: { 200: PaginaApostasSchema } } },
    async (requisicao) => {
      const { dezenas, minimoCoincidencias, pagina, tamanho } = requisicao.query;
      return container.apostaService().listar({
        dezenas: converterListaDezenas(dezenas),
        minimoCoincidencias,
        pagina,
        tamanho,
      });
    },
  );

  app.post(
    '/apostas',
    { schema: { body: EfetivacaoApostasSchema, response: { 201: ApostasEfetivadasSchema } } },
    async (requisicao, resposta) => {
      const efetivadas = await container.apostaService().efetivar(requisicao.body);
      return resposta.status(201).send(efetivadas);
    },
  );

  app.get('/apostas/resumo', { schema: { response: { 200: ResumoApostasSchema } } }, async () =>
    container.apostaService().resumir(),
  );

  app.get(
    '/apostas/acertos',
    { schema: { response: { 200: Type.Array(AcertosConcursoSchema) } } },
    async () => container.apostaService().listarAcertosPorConcurso(),
  );
};

export default rotasApostas;

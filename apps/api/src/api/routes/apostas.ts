import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import {
  AcertosConcursoSchema,
  ApostaAConferirSchema,
  ApostaPendenteSchema,
  ApostasEditadasSchema,
  ConsultaPendentesSchema,
  ApostasEfetivadasSchema,
  EdicaoApostaSchema,
  ParametrosApostaSchema,
  ApostasMarcadasSchema,
  MarcacaoConferidasSchema,
  ConsultaApostasSchema,
  EfetivacaoApostasSchema,
  PaginaApostasSchema,
  ResumoApostasSchema,
} from '../schemas/aposta.ts';
import { usuarioDe } from '../autenticacao.ts';
import type { OpcoesRotas } from '../opcoes-rotas.ts';

const converterListaDezenas = (valor: string | undefined): number[] =>
  valor ? valor.split(',').map((dezena) => Number.parseInt(dezena, 10)) : [];

const rotasApostas: FastifyPluginAsyncTypebox<OpcoesRotas> = async (app, { container }) => {
  app.get(
    '/apostas',
    { schema: { querystring: ConsultaApostasSchema, response: { 200: PaginaApostasSchema } } },
    async (requisicao) => {
      const { dezenas, minimoCoincidencias, pagina, tamanho } = requisicao.query;
      return container.apostaService().listar(usuarioDe(requisicao).id, {
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
      const efetivadas = await container
        .apostaService()
        .efetivar(usuarioDe(requisicao).id, requisicao.body);
      return resposta.status(201).send(efetivadas);
    },
  );

  app.patch(
    '/apostas/:id',
    {
      schema: {
        params: ParametrosApostaSchema,
        body: EdicaoApostaSchema,
        response: { 200: ApostasEditadasSchema },
      },
    },
    async (requisicao) =>
      container
        .apostaService()
        .editar(usuarioDe(requisicao).id, requisicao.params.id, requisicao.body),
  );

  app.get(
    '/apostas/pendentes',
    {
      schema: {
        querystring: ConsultaPendentesSchema,
        response: { 200: Type.Array(ApostaPendenteSchema) },
      },
    },
    async (requisicao) =>
      container.apostaService().listarPendentes(usuarioDe(requisicao).id, requisicao.query.jogo),
  );

  app.get(
    '/apostas/resumo',
    { schema: { response: { 200: ResumoApostasSchema } } },
    async (requisicao) => container.apostaService().resumir(usuarioDe(requisicao).id),
  );

  app.get(
    '/apostas/a-conferir',
    { schema: { response: { 200: Type.Array(ApostaAConferirSchema) } } },
    async (requisicao) => container.apostaService().listarAConferir(usuarioDe(requisicao).id),
  );

  app.post(
    '/apostas/conferidas',
    { schema: { body: MarcacaoConferidasSchema, response: { 200: ApostasMarcadasSchema } } },
    async (requisicao) =>
      container.apostaService().marcarConferidas(usuarioDe(requisicao).id, requisicao.body.ids),
  );

  app.get(
    '/apostas/acertos',
    { schema: { response: { 200: Type.Array(AcertosConcursoSchema) } } },
    async (requisicao) =>
      container.apostaService().listarAcertosPorConcurso(usuarioDe(requisicao).id),
  );
};

export default rotasApostas;

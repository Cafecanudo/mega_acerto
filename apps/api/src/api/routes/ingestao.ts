import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { SincronizacaoIniciadaSchema, StatusIngestaoSchema } from '../schemas/ingestao.ts';
import { ParametrosJogoSchema } from '../schemas/jogo.ts';
import type { OpcoesRotas } from '../opcoes-rotas.ts';

const rotasIngestao: FastifyPluginAsyncTypebox<OpcoesRotas> = async (app, { container }) => {
  app.get(
    '/jogos/:jogo/ingestao',
    { schema: { params: ParametrosJogoSchema, response: { 200: StatusIngestaoSchema } } },
    async (requisicao) => {
      const servico = await container.ingestaoService();
      return servico.obterStatus(requisicao.params.jogo);
    },
  );

  app.post(
    '/jogos/:jogo/ingestao',
    { schema: { params: ParametrosJogoSchema, response: { 202: SincronizacaoIniciadaSchema } } },
    async (requisicao, resposta) => {
      const servico = await container.ingestaoService();
      const execucaoId = await servico.iniciarSincronizacao(requisicao.params.jogo, 'manual');
      return resposta.status(202).send({ execucaoId });
    },
  );
};

export default rotasIngestao;

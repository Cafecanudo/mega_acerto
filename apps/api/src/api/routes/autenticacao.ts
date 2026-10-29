import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  COOKIE_SESSAO,
  gravarCookieSessao,
  limparCookieSessao,
  usuarioDe,
} from '../autenticacao.ts';
import { CadastroSchema, CredenciaisSchema, UsuarioSchema } from '../schemas/autenticacao.ts';
import type { OpcoesRotas } from '../opcoes-rotas.ts';

const rotasAutenticacao: FastifyPluginAsyncTypebox<OpcoesRotas> = async (app, { container }) => {
  app.post(
    '/auth/cadastro',
    { schema: { body: CadastroSchema, response: { 201: UsuarioSchema } } },
    async (requisicao, resposta) => {
      const sessao = await container.autenticacaoService().cadastrar(requisicao.body);
      gravarCookieSessao(resposta, sessao);
      return resposta.status(201).send(sessao.usuario);
    },
  );

  app.post(
    '/auth/entrar',
    { schema: { body: CredenciaisSchema, response: { 200: UsuarioSchema } } },
    async (requisicao, resposta) => {
      const sessao = await container.autenticacaoService().entrar(requisicao.body);
      gravarCookieSessao(resposta, sessao);
      return sessao.usuario;
    },
  );

  app.post('/auth/sair', async (requisicao, resposta) => {
    const token = requisicao.cookies[COOKIE_SESSAO];
    if (token) await container.autenticacaoService().sair(token);
    limparCookieSessao(resposta);
    return resposta.status(204).send();
  });

  app.get('/auth/eu', { schema: { response: { 200: UsuarioSchema } } }, async (requisicao) =>
    usuarioDe(requisicao),
  );
};

export default rotasAutenticacao;

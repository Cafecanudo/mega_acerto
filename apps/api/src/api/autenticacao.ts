import cookie from '@fastify/cookie';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Usuario } from '../data/repositories/usuario-repository.ts';
import type { Container } from '../loaders/container.ts';
import type { SessaoAberta } from '../services/autenticacao-service.ts';
import { naoAutenticado } from '../shared/erros.ts';

declare module 'fastify' {
  interface FastifyRequest {
    usuario: Usuario | null;
  }
}

export const COOKIE_SESSAO = 'mega_sessao';

const ROTAS_PUBLICAS = ['/auth/', '/saude'];

const exigeSessao = (url: string, prefixoApi: string): boolean => {
  if (!url.startsWith(`${prefixoApi}/`)) return false;
  const caminho = url.slice(prefixoApi.length);
  return !ROTAS_PUBLICAS.some((publica) => caminho.startsWith(publica));
};

export const gravarCookieSessao = (resposta: FastifyReply, sessao: SessaoAberta): void => {
  void resposta.setCookie(COOKIE_SESSAO, sessao.token, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    expires: sessao.expiraEm,
  });
};

export const limparCookieSessao = (resposta: FastifyReply): void => {
  void resposta.clearCookie(COOKIE_SESSAO, { path: '/' });
};

export const usuarioDe = (requisicao: FastifyRequest): Usuario => {
  if (!requisicao.usuario) throw naoAutenticado('Sessão expirada. Entre novamente.');
  return requisicao.usuario;
};

export const registrarAutenticacao = async (
  app: FastifyInstance,
  container: Container,
  prefixoApi: string,
): Promise<void> => {
  await app.register(cookie);
  app.decorateRequest('usuario', null);

  app.addHook('onRequest', async (requisicao, resposta) => {
    const token = requisicao.cookies[COOKIE_SESSAO];
    const sessao = token ? await container.autenticacaoService().validar(token) : undefined;
    requisicao.usuario = sessao?.usuario ?? null;
    if (sessao && token) gravarCookieSessao(resposta, sessao);
    if (!sessao && exigeSessao(requisicao.url, prefixoApi)) {
      if (token) limparCookieSessao(resposta);
      throw naoAutenticado('Sessão expirada. Entre novamente.');
    }
  });
};

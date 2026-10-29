import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ErroAplicacao, type CodigoErro } from '../shared/erros.ts';

const statusPorCodigo: Record<CodigoErro, number> = {
  'nao-encontrado': 404,
  conflito: 409,
  'entrada-invalida': 400,
  'nao-autenticado': 401,
};

export const tratarErro = async (
  erro: FastifyError,
  requisicao: FastifyRequest,
  resposta: FastifyReply,
): Promise<void> => {
  if (erro instanceof ErroAplicacao) {
    await resposta
      .status(statusPorCodigo[erro.codigo])
      .send({ erro: erro.codigo, mensagem: erro.message });
    return;
  }

  if (erro.validation) {
    await resposta.status(400).send({ erro: 'entrada-invalida', mensagem: erro.message });
    return;
  }

  requisicao.log.error({ err: erro }, 'Erro não tratado');
  await resposta.status(500).send({ erro: 'interno', mensagem: 'Erro interno do servidor' });
};

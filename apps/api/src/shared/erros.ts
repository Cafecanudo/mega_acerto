export type CodigoErro = 'nao-encontrado' | 'conflito' | 'entrada-invalida' | 'nao-autenticado';

export class ErroAplicacao extends Error {
  readonly codigo: CodigoErro;

  constructor(codigo: CodigoErro, mensagem: string) {
    super(mensagem);
    this.name = 'ErroAplicacao';
    this.codigo = codigo;
  }
}

export const naoEncontrado = (mensagem: string): ErroAplicacao =>
  new ErroAplicacao('nao-encontrado', mensagem);

export const conflito = (mensagem: string): ErroAplicacao =>
  new ErroAplicacao('conflito', mensagem);

export const entradaInvalida = (mensagem: string): ErroAplicacao =>
  new ErroAplicacao('entrada-invalida', mensagem);

export const naoAutenticado = (mensagem: string): ErroAplicacao =>
  new ErroAplicacao('nao-autenticado', mensagem);

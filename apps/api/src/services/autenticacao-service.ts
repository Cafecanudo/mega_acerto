import { createHash, randomBytes } from 'node:crypto';
import { setTimeout as aguardar } from 'node:timers/promises';
import type { Usuario, UsuarioRepository } from '../data/repositories/usuario-repository.ts';
import { conflito, entradaInvalida, naoAutenticado } from '../shared/erros.ts';
import { conferirSenha, gerarHashSenha } from '../shared/senha.ts';

export interface Cadastro {
  readonly nome: string;
  readonly login: string;
  readonly senha: string;
}

export interface Credenciais {
  readonly login: string;
  readonly senha: string;
}

export interface SessaoAberta {
  readonly token: string;
  readonly usuario: Usuario;
  readonly expiraEm: Date;
}

const DURACAO_SESSAO_MS = 30 * 24 * 60 * 60 * 1000;
const ANTECEDENCIA_RENOVACAO_MS = 24 * 60 * 60 * 1000;
const ATRASO_FALHA_MS = 600;
const PADRAO_LOGIN = /^[a-z0-9._-]{3,32}$/;
const TAMANHO_MINIMO_SENHA = 8;
const TAMANHO_MAXIMO_SENHA = 128;
const TAMANHO_MAXIMO_NOME = 80;

const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');

const normalizarLogin = (login: string): string => login.trim().toLowerCase();

const validarCadastro = (cadastro: Cadastro): Cadastro => {
  const nome = cadastro.nome.trim();
  const login = normalizarLogin(cadastro.login);
  if (nome.length === 0 || nome.length > TAMANHO_MAXIMO_NOME) {
    throw entradaInvalida(`Informe um nome de até ${TAMANHO_MAXIMO_NOME} caracteres`);
  }
  if (!PADRAO_LOGIN.test(login)) {
    throw entradaInvalida(
      'O login deve ter de 3 a 32 letras minúsculas, números, ponto, hífen ou _',
    );
  }
  if (
    cadastro.senha.length < TAMANHO_MINIMO_SENHA ||
    cadastro.senha.length > TAMANHO_MAXIMO_SENHA
  ) {
    throw entradaInvalida(
      `A senha deve ter de ${TAMANHO_MINIMO_SENHA} a ${TAMANHO_MAXIMO_SENHA} caracteres`,
    );
  }
  return { nome, login, senha: cadastro.senha };
};

export class AutenticacaoService {
  readonly #repository: UsuarioRepository;

  constructor(repository: UsuarioRepository) {
    this.#repository = repository;
  }

  async cadastrar(cadastro: Cadastro): Promise<SessaoAberta> {
    const dados = validarCadastro(cadastro);
    const usuario = await this.#repository.criarAssumindoDadosSemDono({
      nome: dados.nome,
      login: dados.login,
      senhaHash: await gerarHashSenha(dados.senha),
    });
    if (!usuario) throw conflito(`O login ${dados.login} já está em uso`);
    return this.#abrirSessao(usuario);
  }

  async entrar(credenciais: Credenciais): Promise<SessaoAberta> {
    const usuario = await this.#repository.obterPorLogin(normalizarLogin(credenciais.login));
    const valida = usuario ? await conferirSenha(credenciais.senha, usuario.senhaHash) : false;
    if (!usuario || !valida) {
      await aguardar(ATRASO_FALHA_MS);
      throw naoAutenticado('Login ou senha inválidos');
    }
    return this.#abrirSessao({ id: usuario.id, nome: usuario.nome, login: usuario.login });
  }

  async validar(token: string): Promise<SessaoAberta | undefined> {
    const id = hashToken(token);
    const sessao = await this.#repository.obterPorSessao(id);
    if (!sessao) return undefined;

    const agora = Date.now();
    if (sessao.expiraEm.getTime() - agora > DURACAO_SESSAO_MS - ANTECEDENCIA_RENOVACAO_MS) {
      return { token, usuario: sessao.usuario, expiraEm: sessao.expiraEm };
    }
    const expiraEm = new Date(agora + DURACAO_SESSAO_MS);
    await this.#repository.renovarSessao(id, expiraEm);
    return { token, usuario: sessao.usuario, expiraEm };
  }

  async sair(token: string): Promise<void> {
    await this.#repository.excluirSessao(hashToken(token));
  }

  async #abrirSessao(usuario: Usuario): Promise<SessaoAberta> {
    const token = randomBytes(32).toString('base64url');
    const expiraEm = new Date(Date.now() + DURACAO_SESSAO_MS);
    await this.#repository.excluirSessoesExpiradas();
    await this.#repository.criarSessao(hashToken(token), usuario.id, expiraEm);
    return { token, usuario, expiraEm };
  }
}

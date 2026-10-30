import { isCodigoJogo, obterRegraJogo, validarAposta, type RegraJogo } from '@mega/domain';
import type {
  DadosFavorito,
  Favorito,
  FavoritoRepository,
} from '../data/repositories/favorito-repository.ts';
import { entradaInvalida, naoEncontrado } from '../shared/erros.ts';
import type { Conferencia, ConferenciaService } from './conferencia-service.ts';

export interface FavoritoConferido extends Favorito {
  readonly conferencia: Conferencia;
}

export interface EntradaFavorito {
  readonly jogo: string;
  readonly nome?: string | null | undefined;
  readonly dezenas: readonly number[];
}

export type AlteracaoFavorito = Partial<EntradaFavorito>;

export interface FavoritosCriados {
  readonly criados: number;
  readonly repetidos: number;
}

const TAMANHO_MAXIMO_NOME = 80;
const LIMITE_LOTE = 200;

const chaveFavorito = (dados: Pick<DadosFavorito, 'jogo' | 'dezenas'>): string =>
  `${dados.jogo}:${[...dados.dezenas].sort((a, b) => a - b).join(',')}`;

const regraDisponivel = (jogo: string): RegraJogo => {
  if (!isCodigoJogo(jogo)) throw entradaInvalida(`Jogo ${jogo} ainda não está disponível`);
  return obterRegraJogo(jogo);
};

const normalizarNome = (nome: string | null | undefined): string | null => {
  const texto = nome?.trim() ?? '';
  if (texto.length > TAMANHO_MAXIMO_NOME) {
    throw entradaInvalida(`O nome deve ter até ${TAMANHO_MAXIMO_NOME} caracteres`);
  }
  return texto.length > 0 ? texto : null;
};

const prepararDados = (entrada: EntradaFavorito): DadosFavorito => {
  const regra = regraDisponivel(entrada.jogo);
  const erros = validarAposta(regra, entrada.dezenas);
  if (erros.length > 0) throw entradaInvalida(`Favorito inválido: ${JSON.stringify(erros)}`);
  return { jogo: regra.codigo, nome: normalizarNome(entrada.nome), dezenas: entrada.dezenas };
};

export class FavoritoService {
  readonly #repository: FavoritoRepository;
  readonly #conferencia: ConferenciaService;

  constructor(repository: FavoritoRepository, conferencia: ConferenciaService) {
    this.#repository = repository;
    this.#conferencia = conferencia;
  }

  async listar(usuarioId: number): Promise<FavoritoConferido[]> {
    return this.#conferir(await this.#repository.listar(usuarioId));
  }

  async criar(usuarioId: number, entrada: EntradaFavorito): Promise<FavoritoConferido> {
    const favorito = await this.#repository.criar(usuarioId, prepararDados(entrada));
    return this.#conferirUm(favorito);
  }

  async criarLote(
    usuarioId: number,
    entradas: readonly EntradaFavorito[],
  ): Promise<FavoritosCriados> {
    if (entradas.length > LIMITE_LOTE)
      throw entradaInvalida(`Envie até ${LIMITE_LOTE} favoritos por vez`);
    const vistos = new Set(
      (await this.#repository.listar(usuarioId)).map((favorito) => chaveFavorito(favorito)),
    );
    const ineditos = entradas.map(prepararDados).filter((dados) => {
      const chave = chaveFavorito(dados);
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    });
    const criados = await this.#repository.criarLote(usuarioId, ineditos);
    return { criados, repetidos: entradas.length - ineditos.length };
  }

  async alterar(
    usuarioId: number,
    id: number,
    alteracao: AlteracaoFavorito,
  ): Promise<FavoritoConferido> {
    const atual = await this.#repository.obter(usuarioId, id);
    if (!atual) throw naoEncontrado(`Favorito ${id} não encontrado`);

    const dados = prepararDados({
      jogo: alteracao.jogo ?? atual.jogo,
      nome: alteracao.nome === undefined ? atual.nome : alteracao.nome,
      dezenas: alteracao.dezenas ?? atual.dezenas,
    });

    const favorito = await this.#repository.atualizar(usuarioId, id, dados);
    if (!favorito) throw naoEncontrado(`Favorito ${id} não encontrado`);
    return this.#conferirUm(favorito);
  }

  async excluir(usuarioId: number, id: number): Promise<void> {
    const excluido = await this.#repository.excluir(usuarioId, id);
    if (!excluido) throw naoEncontrado(`Favorito ${id} não encontrado`);
  }

  async #conferirUm(favorito: Favorito): Promise<FavoritoConferido> {
    const [conferido] = await this.#conferir([favorito]);
    if (!conferido) throw new Error(`Falha ao conferir o favorito ${favorito.id}`);
    return conferido;
  }

  async #conferir(favoritos: readonly Favorito[]): Promise<FavoritoConferido[]> {
    const conferencias = await this.#conferencia.conferir(
      favoritos.map((favorito) => ({ ...favorito, concurso: null })),
    );
    return favoritos.flatMap((favorito) => {
      const conferencia = conferencias.get(favorito.id);
      return conferencia ? [{ ...favorito, conferencia }] : [];
    });
  }
}

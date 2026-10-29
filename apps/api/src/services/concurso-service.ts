import { obterRegraJogo, validarDezenas, type CodigoJogo } from '@mega/domain';
import type {
  ConcursoLeituraRepository,
  DetalheConcurso,
  Pagina,
  ResumoConcurso,
} from '../data/repositories/concurso-leitura-repository.ts';
import { entradaInvalida, naoEncontrado } from '../shared/erros.ts';

export interface PaginaSolicitada {
  readonly pagina: number;
  readonly tamanho: number;
}

export interface PaginaConcursos<T> extends Pagina<T>, PaginaSolicitada {}

export interface BuscaPorDezenas extends PaginaSolicitada {
  readonly dezenas: readonly number[];
  readonly minimoAcertos?: number | undefined;
}

const paraPaginacao = ({ pagina, tamanho }: PaginaSolicitada) => ({
  deslocamento: (pagina - 1) * tamanho,
  limite: tamanho,
});

export class ConcursoService {
  readonly #repository: ConcursoLeituraRepository;

  constructor(repository: ConcursoLeituraRepository) {
    this.#repository = repository;
  }

  async listar(
    jogo: CodigoJogo,
    solicitada: PaginaSolicitada,
  ): Promise<PaginaConcursos<ResumoConcurso>> {
    const pagina = await this.#repository.listar(jogo, paraPaginacao(solicitada));
    return { ...pagina, ...solicitada };
  }

  async obter(jogo: CodigoJogo, numero: number): Promise<DetalheConcurso> {
    const concurso = await this.#repository.obter(jogo, numero);
    if (!concurso) throw naoEncontrado(`Concurso ${numero} não encontrado`);
    return concurso;
  }

  async buscarPorDezenas(
    jogo: CodigoJogo,
    busca: BuscaPorDezenas,
  ): Promise<PaginaConcursos<ResumoConcurso & { readonly acertos: number }>> {
    const regra = obterRegraJogo(jogo);
    const { dezenas } = busca;

    if (dezenas.length === 0 || dezenas.length > regra.dezenasPorSorteio) {
      throw entradaInvalida(`Informe de 1 a ${regra.dezenasPorSorteio} dezenas`);
    }

    const erros = validarDezenas(regra, dezenas, dezenas.length);
    if (erros.length > 0) throw entradaInvalida(`Dezenas inválidas: ${JSON.stringify(erros)}`);

    const minimoAcertos = busca.minimoAcertos ?? dezenas.length;
    if (minimoAcertos < 1 || minimoAcertos > dezenas.length) {
      throw entradaInvalida(`O mínimo de acertos deve estar entre 1 e ${dezenas.length}`);
    }

    const pagina = await this.#repository.buscarPorDezenas(
      jogo,
      dezenas,
      minimoAcertos,
      paraPaginacao(busca),
    );
    return { ...pagina, pagina: busca.pagina, tamanho: busca.tamanho };
  }
}

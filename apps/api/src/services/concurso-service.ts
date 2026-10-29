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

export interface FrequenciaDezena {
  readonly dezena: number;
  readonly vezes: number;
  readonly percentual: number;
  readonly ultimoConcurso: number | null;
  readonly atraso: number | null;
}

export interface FrequenciasJogo {
  readonly concursos: number;
  readonly ultimoConcurso: number | null;
  readonly dezenas: FrequenciaDezena[];
}

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

  async contarFrequencias(jogo: CodigoJogo, ultimos: number | null): Promise<FrequenciasJogo> {
    const { universo } = obterRegraJogo(jogo);
    const contagem = await this.#repository.contarFrequencias(jogo, ultimos);
    const porDezena = new Map(contagem.dezenas.map((linha) => [linha.dezena, linha]));
    const ultimoGeral = contagem.ultimoConcurso;

    const dezenas = Array.from({ length: universo.maximo - universo.minimo + 1 }, (_, indice) => {
      const dezena = universo.minimo + indice;
      const linha = porDezena.get(dezena);
      const vezes = linha?.vezes ?? 0;
      const ultimoConcurso = linha?.ultimoConcurso ?? null;
      return {
        dezena,
        vezes,
        percentual:
          contagem.concursos === 0 ? 0 : Math.round((vezes / contagem.concursos) * 10000) / 100,
        ultimoConcurso,
        atraso:
          ultimoGeral === null || ultimoConcurso === null ? null : ultimoGeral - ultimoConcurso,
      };
    });

    dezenas.sort((a, b) => b.vezes - a.vezes || a.dezena - b.dezena);
    return { concursos: contagem.concursos, ultimoConcurso: ultimoGeral, dezenas };
  }

  async obterUltimo(jogo: CodigoJogo): Promise<DetalheConcurso> {
    const numero = await this.#repository.obterNumeroUltimo(jogo);
    if (numero === null) throw naoEncontrado(`Nenhum concurso importado para ${jogo}`);
    return this.obter(jogo, numero);
  }

  async buscarPorDezenas(
    jogo: CodigoJogo,
    busca: BuscaPorDezenas,
  ): Promise<PaginaConcursos<ResumoConcurso & { readonly acertos: number }>> {
    const regra = obterRegraJogo(jogo);
    const { dezenas } = busca;

    const limite = regra.dezenasPorAposta.maximo;
    if (dezenas.length === 0 || dezenas.length > limite) {
      throw entradaInvalida(`Informe de 1 a ${limite} dezenas`);
    }

    const erros = validarDezenas(regra, dezenas, dezenas.length);
    if (erros.length > 0) throw entradaInvalida(`Dezenas inválidas: ${JSON.stringify(erros)}`);

    const acertosMaximos = Math.min(dezenas.length, regra.dezenasPorSorteio);
    const minimoAcertos = busca.minimoAcertos ?? acertosMaximos;
    if (minimoAcertos < 1 || minimoAcertos > acertosMaximos) {
      throw entradaInvalida(`O mínimo de acertos deve estar entre 1 e ${acertosMaximos}`);
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

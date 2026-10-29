import { apresentacoesJogo, obterApresentacaoJogo } from '@mega/domain';
import type { ValorJogoRepository } from '../data/repositories/valor-jogo-repository.ts';
import { entradaInvalida } from '../shared/erros.ts';

export interface ValorConfigurado {
  readonly jogo: string;
  readonly valorAposta: number | null;
  readonly atualizadoEm: string | null;
}

const VALOR_MAXIMO = 100_000;

export class ValorJogoService {
  readonly #repository: ValorJogoRepository;

  constructor(repository: ValorJogoRepository) {
    this.#repository = repository;
  }

  async listar(): Promise<ValorConfigurado[]> {
    const configurados = new Map(
      (await this.#repository.listar()).map((valor) => [valor.jogo, valor]),
    );
    return apresentacoesJogo.map((apresentacao) => {
      const configurado = configurados.get(apresentacao.codigo);
      return {
        jogo: apresentacao.codigo,
        valorAposta: configurado?.valorAposta ?? null,
        atualizadoEm: configurado?.atualizadoEm ?? null,
      };
    });
  }

  obterValorAposta(jogo: string): Promise<number | null> {
    return this.#repository.obter(jogo);
  }

  async salvar(jogo: string, valorAposta: number): Promise<ValorConfigurado> {
    if (!obterApresentacaoJogo(jogo)) throw entradaInvalida(`Jogo desconhecido: ${jogo}`);
    if (!(valorAposta > 0 && valorAposta <= VALOR_MAXIMO)) {
      throw entradaInvalida(`O valor deve ser maior que zero e até ${VALOR_MAXIMO}`);
    }
    const arredondado = Math.round(valorAposta * 100) / 100;
    await this.#repository.salvar(jogo, arredondado);
    return { jogo, valorAposta: arredondado, atualizadoEm: new Date().toISOString() };
  }
}

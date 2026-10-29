import { listarRegrasJogo, type FaixaPremiada, type RegraJogo } from '@mega/domain';
import type { JogoRepository, ResumoJogo } from '../data/repositories/jogo-repository.ts';

export interface JogoDisponivel {
  readonly regra: Omit<RegraJogo, 'faixasPremiadas'> & { faixasPremiadas: FaixaPremiada[] };
  readonly totalConcursos: number;
  readonly ultimoConcurso: number | null;
  readonly ultimaData: string | null;
  readonly ultimoAcumulado: boolean | null;
  readonly ultimosGanhadores: number | null;
  readonly ultimaSincronizacao: string | null;
}

const resumoVazio = (codigo: string): ResumoJogo => ({
  codigo,
  totalConcursos: 0,
  ultimoConcurso: null,
  ultimaData: null,
  ultimoAcumulado: null,
  ultimosGanhadores: null,
  ultimaSincronizacao: null,
});

export class JogoService {
  readonly #repository: JogoRepository;

  constructor(repository: JogoRepository) {
    this.#repository = repository;
  }

  async registrarCatalogo(): Promise<void> {
    await this.#repository.sincronizarCatalogo(listarRegrasJogo());
  }

  async listar(): Promise<JogoDisponivel[]> {
    const resumos = new Map(
      (await this.#repository.listarResumos()).map((resumo) => [resumo.codigo, resumo]),
    );

    return listarRegrasJogo().map((regra) => {
      const resumo = resumos.get(regra.codigo) ?? resumoVazio(regra.codigo);
      return {
        regra: { ...regra, faixasPremiadas: [...regra.faixasPremiadas] },
        totalConcursos: resumo.totalConcursos,
        ultimoConcurso: resumo.ultimoConcurso,
        ultimaData: resumo.ultimaData,
        ultimoAcumulado: resumo.ultimoAcumulado,
        ultimosGanhadores: resumo.ultimosGanhadores,
        ultimaSincronizacao: resumo.ultimaSincronizacao?.toISOString() ?? null,
      };
    });
  }
}

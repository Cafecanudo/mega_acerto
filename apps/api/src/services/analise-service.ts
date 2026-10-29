import {
  obterTipoAnalise,
  type EsforcoAnalise,
  type ModeloAnalise,
  type TipoAnalise,
} from '@mega/analises';
import type { CodigoJogo } from '@mega/domain';
import type {
  Analise,
  AnaliseRepository,
  ResumoAnalise,
} from '../data/repositories/analise-repository.ts';
import type { ConcursoLeituraRepository } from '../data/repositories/concurso-leitura-repository.ts';
import { entradaInvalida, naoEncontrado } from '../shared/erros.ts';

export interface SolicitacaoAnalise {
  readonly tipo: TipoAnalise;
  readonly modelo: ModeloAnalise;
  readonly esforco: EsforcoAnalise;
  readonly forcar: boolean;
}

export interface AnaliseSolicitada {
  readonly id: number;
  readonly reaproveitada: boolean;
}

const LIMITE_LISTAGEM = 50;

export class AnaliseService {
  readonly #analises: AnaliseRepository;
  readonly #concursos: ConcursoLeituraRepository;

  constructor(analises: AnaliseRepository, concursos: ConcursoLeituraRepository) {
    this.#analises = analises;
    this.#concursos = concursos;
  }

  async solicitar(jogo: CodigoJogo, solicitacao: SolicitacaoAnalise): Promise<AnaliseSolicitada> {
    const ultimoConcurso = await this.#concursos.obterNumeroUltimo(jogo);
    if (ultimoConcurso === null) {
      throw entradaInvalida(`Não há concursos importados para ${jogo}`);
    }

    const nova = {
      jogo,
      tipo: solicitacao.tipo,
      versaoPrompt: obterTipoAnalise(solicitacao.tipo).versaoPrompt,
      modelo: solicitacao.modelo,
      esforco: solicitacao.esforco,
      ultimoConcurso,
    };

    if (!solicitacao.forcar) {
      const existente = await this.#analises.buscarEquivalente(nova);
      if (existente !== null) return { id: existente, reaproveitada: true };
    }

    return { id: await this.#analises.criar(nova), reaproveitada: false };
  }

  listar(): Promise<ResumoAnalise[]> {
    return this.#analises.listar(LIMITE_LISTAGEM);
  }

  async obter(id: number): Promise<Analise> {
    const analise = await this.#analises.obter(id);
    if (!analise) throw naoEncontrado(`Análise ${id} não encontrada`);
    return analise;
  }
}

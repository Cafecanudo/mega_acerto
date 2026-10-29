import {
  obterTipoAnalise,
  type EsforcoAnalise,
  type ParametrosEstrategia,
  type ModeloAnalise,
  type TipoAnalise,
} from '@mega/analises';
import { obterRegraJogo, type CodigoJogo } from '@mega/domain';
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
  readonly parametros?: ParametrosEstrategia | null | undefined;
}

export interface AnaliseSolicitada {
  readonly id: number;
  readonly reaproveitada: boolean;
}

const LIMITE_LISTAGEM = 50;

const prepararParametros = (
  jogo: CodigoJogo,
  solicitacao: SolicitacaoAnalise,
): ParametrosEstrategia | null => {
  if (solicitacao.tipo !== 'estrategia') return null;
  const parametros = solicitacao.parametros;
  if (!parametros) throw entradaInvalida('Informe os parâmetros da estratégia');

  const { minimo, maximo } = obterRegraJogo(jogo).dezenasPorAposta;
  if (parametros.quantidadeDezenas < minimo || parametros.quantidadeDezenas > maximo) {
    throw entradaInvalida(`A quantidade de dezenas deve ficar entre ${minimo} e ${maximo}`);
  }

  const descricao = parametros.descricao?.trim() ?? '';
  if (parametros.estrategia === 'personalizada' && descricao.length === 0) {
    throw entradaInvalida('Descreva a regra da estratégia personalizada');
  }

  return {
    estrategia: parametros.estrategia,
    descricao: parametros.estrategia === 'personalizada' ? descricao : null,
    quantidadeDezenas: parametros.quantidadeDezenas,
    janela: parametros.janela,
  };
};

export class AnaliseService {
  readonly #analises: AnaliseRepository;
  readonly #concursos: ConcursoLeituraRepository;

  constructor(analises: AnaliseRepository, concursos: ConcursoLeituraRepository) {
    this.#analises = analises;
    this.#concursos = concursos;
  }

  async solicitar(
    usuarioId: number,
    jogo: CodigoJogo,
    solicitacao: SolicitacaoAnalise,
  ): Promise<AnaliseSolicitada> {
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
      parametros: prepararParametros(jogo, solicitacao),
    };

    if (!solicitacao.forcar) {
      const existente = await this.#analises.buscarEquivalente(usuarioId, nova);
      if (existente !== null) return { id: existente, reaproveitada: true };
    }

    return { id: await this.#analises.criar(usuarioId, nova), reaproveitada: false };
  }

  listar(usuarioId: number): Promise<ResumoAnalise[]> {
    return this.#analises.listar(usuarioId, LIMITE_LISTAGEM);
  }

  async obter(usuarioId: number, id: number): Promise<Analise> {
    const analise = await this.#analises.obter(usuarioId, id);
    if (!analise) throw naoEncontrado(`Análise ${id} não encontrada`);
    return analise;
  }
}

import {
  obterTipoAnalise,
  type EsforcoAnalise,
  type ParametrosEstrategia,
  type ParametrosFrequenciaRecente,
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

type ParametrosAnalise = ParametrosEstrategia | ParametrosFrequenciaRecente;

export interface SolicitacaoAnalise {
  readonly tipo: TipoAnalise;
  readonly modelo: ModeloAnalise;
  readonly esforco: EsforcoAnalise;
  readonly forcar: boolean;
  readonly parametros?: ParametrosAnalise | null | undefined;
}

export interface AnaliseSolicitada {
  readonly id: number;
  readonly reaproveitada: boolean;
}

interface ContextoParametros {
  readonly jogo: CodigoJogo;
  readonly ultimoConcurso: number;
}

const LIMITE_LISTAGEM = 50;

const isParametrosEstrategia = (
  parametros: ParametrosAnalise | null | undefined,
): parametros is ParametrosEstrategia => !!parametros && 'estrategia' in parametros;

const isParametrosFrequenciaRecente = (
  parametros: ParametrosAnalise | null | undefined,
): parametros is ParametrosFrequenciaRecente => !!parametros && 'tamanhoTop' in parametros;

const prepararFrequenciaRecente = (
  { ultimoConcurso }: ContextoParametros,
  parametros: ParametrosAnalise | null | undefined,
): ParametrosFrequenciaRecente => {
  if (!isParametrosFrequenciaRecente(parametros)) {
    throw entradaInvalida('Informe a janela e o tamanho do top');
  }
  if (parametros.janela > ultimoConcurso) {
    throw entradaInvalida(`A janela não pode passar de ${ultimoConcurso} concursos`);
  }
  return { janela: parametros.janela, tamanhoTop: parametros.tamanhoTop };
};

const prepararEstrategia = (
  { jogo }: ContextoParametros,
  parametros: ParametrosAnalise | null | undefined,
): ParametrosEstrategia => {
  if (!isParametrosEstrategia(parametros)) {
    throw entradaInvalida('Informe os parâmetros da estratégia');
  }

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

const preparadores: Record<
  TipoAnalise,
  (
    contexto: ContextoParametros,
    parametros: ParametrosAnalise | null | undefined,
  ) => ParametrosAnalise | null
> = {
  aleatoriedade: () => null,
  estrategia: prepararEstrategia,
  'frequencia-recente': prepararFrequenciaRecente,
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
      parametros: preparadores[solicitacao.tipo]({ jogo, ultimoConcurso }, solicitacao.parametros),
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

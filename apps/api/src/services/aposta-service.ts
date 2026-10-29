import {
  isCodigoJogo,
  menorFaixaPremiada,
  obterRegraJogo,
  validarAposta,
  type RegraJogo,
} from '@mega/domain';
import type {
  AcertosPorFaixa,
  AcertosUltimoConcurso,
  Aposta,
  ApostaRepository,
  DadosAposta,
} from '../data/repositories/aposta-repository.ts';
import { entradaInvalida, naoEncontrado } from '../shared/erros.ts';

export interface ConferenciaAposta {
  readonly ultimoConcurso: {
    readonly numero: number;
    readonly data: string;
    readonly acertos: number;
    readonly dezenasAcertadas: number[];
  } | null;
  readonly historico: {
    readonly acertos: number;
    readonly nome: string;
    readonly concursos: number;
  }[];
}

export interface ApostaConferida extends Aposta {
  readonly conferencia: ConferenciaAposta;
}

export interface EntradaAposta {
  readonly jogo: string;
  readonly nome?: string | null | undefined;
  readonly dezenas: readonly number[];
  readonly favorita?: boolean | undefined;
}

export type AlteracaoAposta = Partial<EntradaAposta>;

const TAMANHO_MAXIMO_NOME = 80;

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

const prepararDados = (entrada: EntradaAposta): DadosAposta => {
  const regra = regraDisponivel(entrada.jogo);
  const erros = validarAposta(regra, entrada.dezenas);
  if (erros.length > 0) throw entradaInvalida(`Aposta inválida: ${JSON.stringify(erros)}`);

  return {
    jogo: regra.codigo,
    nome: normalizarNome(entrada.nome),
    dezenas: entrada.dezenas,
    favorita: entrada.favorita ?? false,
  };
};

const montarConferencia = (
  aposta: Aposta,
  historico: readonly AcertosPorFaixa[],
  ultimo: AcertosUltimoConcurso | undefined,
): ConferenciaAposta => {
  const regra = regraDisponivel(aposta.jogo);
  const porAcertos = new Map(
    historico
      .filter((linha) => linha.apostaId === aposta.id)
      .map((linha) => [linha.acertos, linha.concursos]),
  );

  return {
    ultimoConcurso: ultimo
      ? {
          numero: ultimo.numero,
          data: ultimo.data,
          acertos: ultimo.dezenasAcertadas.length,
          dezenasAcertadas: ultimo.dezenasAcertadas,
        }
      : null,
    historico: regra.faixasPremiadas.map((faixa) => ({
      acertos: faixa.acertos,
      nome: faixa.nome,
      concursos: porAcertos.get(faixa.acertos) ?? 0,
    })),
  };
};

export class ApostaService {
  readonly #repository: ApostaRepository;

  constructor(repository: ApostaRepository) {
    this.#repository = repository;
  }

  async listar(somenteFavoritas: boolean): Promise<ApostaConferida[]> {
    return this.#conferir(await this.#repository.listar(somenteFavoritas));
  }

  async criar(entrada: EntradaAposta): Promise<ApostaConferida> {
    const aposta = await this.#repository.criar(prepararDados(entrada));
    return this.#conferirUma(aposta);
  }

  async alterar(id: number, alteracao: AlteracaoAposta): Promise<ApostaConferida> {
    const atual = await this.#obterExistente(id);
    const dados = prepararDados({
      jogo: alteracao.jogo ?? atual.jogo,
      nome: alteracao.nome === undefined ? atual.nome : alteracao.nome,
      dezenas: alteracao.dezenas ?? atual.dezenas,
      favorita: alteracao.favorita ?? atual.favorita,
    });

    const aposta = await this.#repository.atualizar(id, dados);
    if (!aposta) throw naoEncontrado(`Aposta ${id} não encontrada`);
    return this.#conferirUma(aposta);
  }

  async excluir(id: number): Promise<void> {
    const excluida = await this.#repository.excluir(id);
    if (!excluida) throw naoEncontrado(`Aposta ${id} não encontrada`);
  }

  async #obterExistente(id: number): Promise<Aposta> {
    const aposta = await this.#repository.obter(id);
    if (!aposta) throw naoEncontrado(`Aposta ${id} não encontrada`);
    return aposta;
  }

  async #conferirUma(aposta: Aposta): Promise<ApostaConferida> {
    const [conferida] = await this.#conferir([aposta]);
    if (!conferida) throw new Error(`Falha ao conferir a aposta ${aposta.id}`);
    return conferida;
  }

  async #conferir(apostas: readonly Aposta[]): Promise<ApostaConferida[]> {
    const disponiveis = apostas.filter((aposta) => isCodigoJogo(aposta.jogo));
    const ids = disponiveis.map((aposta) => aposta.id);
    const minimo = Math.min(
      ...disponiveis.map((aposta) => menorFaixaPremiada(regraDisponivel(aposta.jogo))),
    );

    const [historico, ultimos] = await Promise.all([
      this.#repository.contarAcertosHistoricos(ids, Number.isFinite(minimo) ? minimo : 1),
      this.#repository.conferirUltimoConcurso(ids),
    ]);
    const ultimoPorAposta = new Map(ultimos.map((linha) => [linha.apostaId, linha]));

    return disponiveis.map((aposta) => ({
      ...aposta,
      conferencia: montarConferencia(aposta, historico, ultimoPorAposta.get(aposta.id)),
    }));
  }
}

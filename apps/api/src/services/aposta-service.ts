import type { ApostaFiltrada, ApostaRepository } from '../data/repositories/aposta-repository.ts';
import { entradaInvalida } from '../shared/erros.ts';
import type { Conferencia, ConferenciaService } from './conferencia-service.ts';

export interface ApostaConferida extends ApostaFiltrada {
  readonly conferencia: Conferencia;
}

export interface ConsultaApostas {
  readonly dezenas: readonly number[];
  readonly minimoCoincidencias?: number | undefined;
  readonly pagina: number;
  readonly tamanho: number;
}

export interface PaginaApostas {
  readonly itens: ApostaConferida[];
  readonly total: number;
  readonly pagina: number;
  readonly tamanho: number;
}

export interface ResumoApostas {
  readonly total: number;
  readonly comAcertos: number;
  readonly maiorAcerto: number;
  readonly melhor: {
    readonly id: number;
    readonly nome: string | null;
    readonly concurso: number;
  } | null;
}

const LIMITE_DEZENAS_FILTRO = 20;

export class ApostaService {
  readonly #repository: ApostaRepository;
  readonly #conferencia: ConferenciaService;

  constructor(repository: ApostaRepository, conferencia: ConferenciaService) {
    this.#repository = repository;
    this.#conferencia = conferencia;
  }

  async listar(consulta: ConsultaApostas): Promise<PaginaApostas> {
    const dezenas = [...new Set(consulta.dezenas)];
    if (dezenas.length > LIMITE_DEZENAS_FILTRO) {
      throw entradaInvalida(`Informe até ${LIMITE_DEZENAS_FILTRO} dezenas no filtro`);
    }
    const minimo = consulta.minimoCoincidencias ?? Math.min(dezenas.length, 6);

    const { itens, total } = await this.#repository.listar(
      { dezenas, minimoCoincidencias: minimo },
      { deslocamento: (consulta.pagina - 1) * consulta.tamanho, limite: consulta.tamanho },
    );
    const conferencias = await this.#conferencia.conferir(itens);

    return {
      itens: itens.flatMap((aposta) => {
        const conferencia = conferencias.get(aposta.id);
        return conferencia ? [{ ...aposta, conferencia }] : [];
      }),
      total,
      pagina: consulta.pagina,
      tamanho: consulta.tamanho,
    };
  }

  async resumir(): Promise<ResumoApostas> {
    const apostas = await this.#repository.listarTodas();
    const conferencias = await this.#conferencia.conferir(apostas);

    let comAcertos = 0;
    let melhor: ResumoApostas['melhor'] = null;
    let maiorAcerto = 0;

    for (const aposta of apostas) {
      const concurso = conferencias.get(aposta.id)?.concursoConferido;
      if (!concurso || concurso.acertos === 0) continue;
      comAcertos++;
      if (concurso.acertos > maiorAcerto) {
        maiorAcerto = concurso.acertos;
        melhor = { id: aposta.id, nome: aposta.nome, concurso: concurso.numero };
      }
    }

    return { total: apostas.length, comAcertos, maiorAcerto, melhor };
  }
}

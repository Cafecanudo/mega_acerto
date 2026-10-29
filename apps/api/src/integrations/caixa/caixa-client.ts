import { setTimeout as aguardar } from 'node:timers/promises';
import { Value } from 'typebox/value';
import type { Logger } from '../../shared/logger.ts';
import { PayloadCaixaSchema, type PayloadCaixa } from './payload-caixa.ts';
import { removerCaracteresNulos } from './sanitizar.ts';

export interface OpcoesCaixaClient {
  readonly baseUrl: string;
  readonly intervaloMs: number;
  readonly timeoutMs: number;
  readonly tentativas: number;
}

export interface RespostaCaixa {
  readonly payload: PayloadCaixa;
  readonly bruto: unknown;
}

class ErroRetentavel extends Error {}

const BACKOFF_BASE_MS = 1000;

const ehStatusRetentavel = (status: number): boolean => status === 429 || status >= 500;

const ehFalhaDeRede = (erro: unknown): boolean =>
  erro instanceof TypeError ||
  (erro instanceof DOMException && (erro.name === 'TimeoutError' || erro.name === 'AbortError'));

export class CaixaClient {
  readonly #opcoes: OpcoesCaixaClient;
  readonly #logger: Logger;
  #fila: Promise<unknown> = Promise.resolve();
  #ultimaRequisicaoEm = 0;

  constructor(opcoes: OpcoesCaixaClient, logger: Logger) {
    this.#opcoes = opcoes;
    this.#logger = logger;
  }

  buscarUltimo(slug: string): Promise<RespostaCaixa> {
    return this.#enfileirar(() => this.#buscar(`${this.#opcoes.baseUrl}/${slug}/`));
  }

  buscarConcurso(slug: string, numero: number): Promise<RespostaCaixa> {
    return this.#enfileirar(() => this.#buscar(`${this.#opcoes.baseUrl}/${slug}/${numero}`));
  }

  #enfileirar<T>(tarefa: () => Promise<T>): Promise<T> {
    const execucao = this.#fila.then(tarefa, tarefa);
    this.#fila = execucao.catch(() => undefined);
    return execucao;
  }

  async #buscar(url: string): Promise<RespostaCaixa> {
    for (let tentativa = 1; ; tentativa++) {
      try {
        return await this.#requisitar(url);
      } catch (erro) {
        const retentavel = erro instanceof ErroRetentavel || ehFalhaDeRede(erro);
        if (!retentavel || tentativa >= this.#opcoes.tentativas) throw erro;

        const espera = BACKOFF_BASE_MS * 2 ** (tentativa - 1);
        this.#logger.warn({ url, tentativa, espera, err: erro }, 'Falha ao consultar a Caixa');
        await aguardar(espera);
      }
    }
  }

  async #requisitar(url: string): Promise<RespostaCaixa> {
    await this.#respeitarIntervalo();

    const resposta = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(this.#opcoes.timeoutMs),
    });

    if (!resposta.ok) {
      const mensagem = `Caixa respondeu HTTP ${resposta.status} para ${url}`;
      if (ehStatusRetentavel(resposta.status)) throw new ErroRetentavel(mensagem);
      throw new Error(mensagem);
    }

    const bruto = removerCaracteresNulos(await resposta.json());
    return { payload: this.#validar(bruto, url), bruto };
  }

  async #respeitarIntervalo(): Promise<void> {
    const decorrido = Date.now() - this.#ultimaRequisicaoEm;
    if (decorrido < this.#opcoes.intervaloMs) await aguardar(this.#opcoes.intervaloMs - decorrido);
    this.#ultimaRequisicaoEm = Date.now();
  }

  #validar(bruto: unknown, url: string): PayloadCaixa {
    if (Value.Check(PayloadCaixaSchema, bruto)) return bruto;

    const detalhes = [...Value.Errors(PayloadCaixaSchema, bruto)]
      .slice(0, 5)
      .map((erro) => `${erro.instancePath || '/'} ${erro.message}`)
      .join('; ');
    throw new Error(`Payload inesperado da Caixa em ${url}: ${detalhes}`);
  }
}

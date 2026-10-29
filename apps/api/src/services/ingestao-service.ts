import { obterRegraJogo, validarDezenas, type CodigoJogo, type RegraJogo } from '@mega/domain';
import type {
  ConcursoEscritaRepository,
  RelatorioIntegridade,
} from '../data/repositories/concurso-escrita-repository.ts';
import type {
  ExecucaoIngestao,
  GatilhoIngestao,
  IngestaoRepository,
} from '../data/repositories/ingestao-repository.ts';
import type { CaixaClient, RespostaCaixa } from '../integrations/caixa/caixa-client.ts';
import { mapearConcurso } from '../integrations/caixa/mapear-concurso.ts';
import type { ConcursoImportado } from '../models/concurso-importado.ts';
import { conflito } from '../shared/erros.ts';
import type { Logger } from '../shared/logger.ts';

export interface DependenciasIngestao {
  readonly caixa: CaixaClient;
  readonly concursos: ConcursoEscritaRepository;
  readonly execucoes: IngestaoRepository;
  readonly logger: Logger;
}

export interface StatusIngestaoJogo {
  readonly emAndamento: boolean;
  readonly ultimaExecucao: ExecucaoIngestao | null;
  readonly integridade: RelatorioIntegridade;
}

const INTERVALO_PROGRESSO = 25;

const descreverErro = (erro: unknown): string =>
  erro instanceof Error ? erro.message : String(erro);

export class IngestaoService {
  readonly #caixa: CaixaClient;
  readonly #concursos: ConcursoEscritaRepository;
  readonly #execucoes: IngestaoRepository;
  readonly #logger: Logger;
  readonly #emAndamento = new Map<CodigoJogo, Promise<void>>();

  constructor(dependencias: DependenciasIngestao) {
    this.#caixa = dependencias.caixa;
    this.#concursos = dependencias.concursos;
    this.#execucoes = dependencias.execucoes;
    this.#logger = dependencias.logger;
  }

  async marcarExecucoesInterrompidas(): Promise<void> {
    const interrompidas = await this.#execucoes.interromperPendentes();
    if (interrompidas > 0)
      this.#logger.warn({ interrompidas }, 'Execuções anteriores interrompidas');
  }

  async iniciarSincronizacao(codigo: CodigoJogo, gatilho: GatilhoIngestao): Promise<number> {
    if (this.#emAndamento.has(codigo)) {
      throw conflito(`Já existe uma sincronização em andamento para ${codigo}`);
    }

    const regra = obterRegraJogo(codigo);
    const id = await this.#execucoes.iniciar(codigo, gatilho);
    const tarefa = this.#sincronizar(regra, id).finally(() => this.#emAndamento.delete(codigo));
    this.#emAndamento.set(codigo, tarefa);
    return id;
  }

  async obterStatus(codigo: CodigoJogo): Promise<StatusIngestaoJogo> {
    const regra = obterRegraJogo(codigo);
    const [ultimaExecucao, integridade] = await Promise.all([
      this.#execucoes.obterUltima(codigo),
      this.#concursos.verificarIntegridade(
        codigo,
        regra.dezenasPorSorteio * regra.sorteiosPorConcurso,
      ),
    ]);
    return { emAndamento: this.#emAndamento.has(codigo), ultimaExecucao, integridade };
  }

  async aguardarConclusao(): Promise<void> {
    await Promise.allSettled(this.#emAndamento.values());
  }

  async #sincronizar(regra: RegraJogo, id: number): Promise<void> {
    let importados = 0;
    try {
      const ultimo = this.#converter(regra, await this.#caixa.buscarUltimo(regra.slugCaixa));
      await this.#concursos.salvar(ultimo);
      importados++;

      const ausentes = await this.#concursos.listarNumerosAusentes(regra.codigo, ultimo.numero);
      await this.#execucoes.registrarPlano(id, ultimo.numero, ausentes.length + 1);
      this.#logger.info(
        { jogo: regra.codigo, ultimo: ultimo.numero, ausentes: ausentes.length },
        'Sincronização iniciada',
      );

      for (const numero of ausentes) {
        const resposta = await this.#caixa.buscarConcurso(regra.slugCaixa, numero);
        await this.#concursos.salvar(this.#converter(regra, resposta, numero));
        importados++;
        if (importados % INTERVALO_PROGRESSO === 0) {
          await this.#execucoes.registrarProgresso(id, importados);
        }
      }

      await this.#execucoes.finalizar(id, 'concluida', importados);
      this.#logger.info({ jogo: regra.codigo, importados }, 'Sincronização concluída');
    } catch (erro) {
      await this.#execucoes.finalizar(id, 'falhou', importados, descreverErro(erro));
      this.#logger.error({ jogo: regra.codigo, importados, err: erro }, 'Sincronização falhou');
    }
  }

  #converter(
    regra: RegraJogo,
    resposta: RespostaCaixa,
    numeroEsperado?: number,
  ): ConcursoImportado {
    const concurso = mapearConcurso(regra, resposta);

    if (numeroEsperado !== undefined && concurso.numero !== numeroEsperado) {
      throw new Error(`A Caixa retornou o concurso ${concurso.numero} ao pedir ${numeroEsperado}`);
    }

    for (let sorteio = 1; sorteio <= regra.sorteiosPorConcurso; sorteio++) {
      const dezenas = concurso.dezenas
        .filter((dezena) => dezena.sorteio === sorteio)
        .map((dezena) => dezena.dezena);
      const erros = validarDezenas(regra, dezenas);
      if (erros.length > 0) {
        throw new Error(
          `Dezenas inválidas no concurso ${concurso.numero} (sorteio ${sorteio}): ${JSON.stringify(erros)}`,
        );
      }
    }

    return concurso;
  }
}

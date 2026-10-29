import { readdir, readFile, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { montarPromptAleatoriedade, ResultadoAleatoriedadeSchema } from '@mega/analises';
import { isCodigoJogo, obterRegraJogo } from '@mega/domain';
import type {
  Analise,
  AnaliseRepository,
  ScriptAnalise,
} from '../../data/repositories/analise-repository.ts';
import { ErroClaude, type ClaudeCli } from '../../integrations/claude/claude-cli.ts';
import type { Logger } from '../../shared/logger.ts';
import type { DatasetExportado, ExportadorDataset } from './exportador-dataset.ts';
import { conferirComSistema, validarEstrutura } from './validacao-aleatoriedade.ts';

export interface DependenciasExecutor {
  readonly analises: AnaliseRepository;
  readonly exportador: ExportadorDataset;
  readonly claude: ClaudeCli;
  readonly logger: Logger;
  readonly diretorioTrabalho: string;
}

const LIMITE_SCRIPTS = 30;
const LIMITE_BYTES_SCRIPT = 200_000;

const descreverErro = (erro: unknown): string =>
  erro instanceof Error ? erro.message : String(erro);

const coletarScripts = async (diretorio: string): Promise<ScriptAnalise[]> => {
  const pasta = join(diretorio, 'scripts');
  const nomes = await readdir(pasta).catch(() => [] as string[]);
  const scripts: ScriptAnalise[] = [];

  for (const nome of nomes.sort().slice(0, LIMITE_SCRIPTS)) {
    const caminho = join(pasta, nome);
    const info = await stat(caminho);
    if (!info.isFile() || info.size > LIMITE_BYTES_SCRIPT) continue;
    scripts.push({ nome, conteudo: await readFile(caminho, 'utf8') });
  }

  return scripts;
};

export class ExecutorAnalise {
  readonly #analises: AnaliseRepository;
  readonly #exportador: ExportadorDataset;
  readonly #claude: ClaudeCli;
  readonly #logger: Logger;
  readonly #diretorioTrabalho: string;

  constructor(dependencias: DependenciasExecutor) {
    this.#analises = dependencias.analises;
    this.#exportador = dependencias.exportador;
    this.#claude = dependencias.claude;
    this.#logger = dependencias.logger;
    this.#diretorioTrabalho = dependencias.diretorioTrabalho;
  }

  async processarProxima(): Promise<boolean> {
    const analise = await this.#analises.reivindicarProxima();
    if (!analise) return false;

    const diretorio = join(this.#diretorioTrabalho, `analise-${analise.id}`);
    const inicio = Date.now();
    let dataset: DatasetExportado | undefined;

    this.#logger.info(
      { id: analise.id, tipo: analise.tipo, modelo: analise.modelo },
      'Análise iniciada',
    );

    try {
      dataset = await this.#exportar(analise, diretorio);
      await this.#executar(analise, diretorio, dataset, inicio);
    } catch (erro) {
      await this.#analises.falhar(analise.id, {
        erro: descreverErro(erro),
        hashDataset: dataset?.hash,
        scripts: await coletarScripts(diretorio),
        metadados: erro instanceof ErroClaude ? erro.metadados : undefined,
        duracaoMs: Date.now() - inicio,
      });
      this.#logger.error({ id: analise.id, err: erro }, 'Análise falhou');
    } finally {
      await rm(diretorio, { recursive: true, force: true });
    }

    return true;
  }

  async #exportar(analise: Analise, diretorio: string): Promise<DatasetExportado> {
    if (!isCodigoJogo(analise.jogo)) throw new Error(`Jogo sem regras: ${analise.jogo}`);
    await rm(diretorio, { recursive: true, force: true });
    return this.#exportador.exportar(
      obterRegraJogo(analise.jogo),
      analise.ultimoConcurso,
      diretorio,
    );
  }

  async #executar(
    analise: Analise,
    diretorio: string,
    dataset: DatasetExportado,
    inicio: number,
  ): Promise<void> {
    if (!isCodigoJogo(analise.jogo)) throw new Error(`Jogo sem regras: ${analise.jogo}`);
    const regra = obterRegraJogo(analise.jogo);

    const resposta = await this.#claude.executar({
      prompt: montarPromptAleatoriedade({
        regra,
        totalConcursos: dataset.totalConcursos,
        dataInicio: dataset.dataInicio,
        dataFim: dataset.dataFim,
      }),
      schema: ResultadoAleatoriedadeSchema,
      modelo: analise.modelo,
      esforco: analise.esforco,
      diretorio,
    });

    const resultado = validarEstrutura(resposta.saida);
    const conferenciaSistema = conferirComSistema(regra, dataset, resultado);

    await this.#analises.concluir(analise.id, {
      hashDataset: dataset.hash,
      resultado,
      conferenciaSistema,
      scripts: await coletarScripts(diretorio),
      metadados: resposta.metadados,
      custoUsd: resposta.custoUsd,
      duracaoMs: Date.now() - inicio,
    });

    this.#logger.info(
      { id: analise.id, conferencia: conferenciaSistema.ok, custoUsd: resposta.custoUsd },
      'Análise concluída',
    );
  }
}

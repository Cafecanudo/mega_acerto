import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RegraJogo } from '@mega/domain';
import type {
  AgregadoDezena,
  ConcursoDataset,
  DatasetRepository,
} from '../../data/repositories/dataset-repository.ts';

export interface RecorteDataset {
  readonly ateConcurso: number;
  readonly janela: number | null;
}

export interface DatasetExportado {
  readonly hash: string;
  readonly totalConcursos: number;
  readonly dataInicio: string;
  readonly dataFim: string;
  readonly concursos: readonly ConcursoDataset[];
  readonly agregados: readonly AgregadoDezena[];
  readonly agregadosAntes: readonly AgregadoDezena[] | null;
  readonly agregadosJanela: readonly AgregadoDezena[] | null;
}

interface AgregadosRecorte {
  readonly antes: AgregadoDezena[] | null;
  readonly janela: AgregadoDezena[] | null;
}

const SEM_RECORTE: AgregadosRecorte = { antes: null, janela: null };

const montarFrequencias = (agregados: readonly AgregadoDezena[]) =>
  Object.fromEntries(agregados.map((item) => [item.dezena, item.frequencia]));

const montarCsv = (regra: RegraJogo, concursos: readonly ConcursoDataset[]): string => {
  const colunas = Array.from({ length: regra.dezenasPorSorteio }, (_, i) => `d${i + 1}`);
  const cabecalho = ['concurso', 'data', ...colunas].join(';');
  const linhas = concursos.map((concurso) =>
    [concurso.numero, concurso.data, ...concurso.dezenas].join(';'),
  );
  return [cabecalho, ...linhas].join('\n') + '\n';
};

const montarAgregados = (ultimoConcurso: number, agregados: readonly AgregadoDezena[]) => ({
  ultimoConcurso,
  frequencia: montarFrequencias(agregados),
  atrasoAtual: Object.fromEntries(agregados.map((item) => [item.dezena, item.atrasoAtual])),
});

const json = (valor: unknown): string => JSON.stringify(valor, null, 2);

const arquivosDoRecorte = (
  recorte: RecorteDataset | null,
  agregados: AgregadosRecorte,
): [string, string][] => {
  if (!recorte) return [];
  const arquivos: [string, string][] = [];
  if (agregados.antes) {
    arquivos.push([
      'agregados_antes.json',
      json(montarAgregados(recorte.ateConcurso, agregados.antes)),
    ]);
  }
  if (agregados.janela && recorte.janela !== null) {
    arquivos.push([
      'agregados_janela.json',
      json({
        primeiroConcurso: recorte.ateConcurso - recorte.janela + 1,
        ultimoConcurso: recorte.ateConcurso,
        frequencia: montarFrequencias(agregados.janela),
      }),
    ]);
  }
  return arquivos;
};

export class ExportadorDataset {
  readonly #repository: DatasetRepository;

  constructor(repository: DatasetRepository) {
    this.#repository = repository;
  }

  async exportar(
    regra: RegraJogo,
    ultimoConcurso: number,
    diretorio: string,
    recorte: RecorteDataset | null = null,
  ): Promise<DatasetExportado> {
    const [concursos, agregados, agregadosRecorte] = await Promise.all([
      this.#repository.listarConcursos(regra.codigo, ultimoConcurso),
      this.#repository.agregarDezenas(regra, ultimoConcurso),
      this.#agregarRecorte(regra, ultimoConcurso, recorte),
    ]);

    const primeiro = concursos.at(0);
    const ultimo = concursos.at(-1);
    if (!primeiro || !ultimo) throw new Error(`Não há concursos importados para ${regra.codigo}`);

    const arquivos: [string, string][] = [
      ['concursos.csv', montarCsv(regra, concursos)],
      ['agregados.json', json(montarAgregados(ultimoConcurso, agregados))],
      ...arquivosDoRecorte(recorte, agregadosRecorte),
    ];

    await mkdir(join(diretorio, 'scripts'), { recursive: true });
    await Promise.all([
      ...arquivos.map(([nome, conteudo]) => writeFile(join(diretorio, nome), conteudo, 'utf8')),
      writeFile(join(diretorio, 'jogo.json'), json(regra), 'utf8'),
    ]);

    const hash = createHash('sha256');
    for (const [, conteudo] of arquivos) hash.update(conteudo);

    return {
      hash: hash.digest('hex'),
      totalConcursos: concursos.length,
      dataInicio: primeiro.data,
      dataFim: ultimo.data,
      concursos,
      agregados,
      agregadosAntes: agregadosRecorte.antes,
      agregadosJanela: agregadosRecorte.janela,
    };
  }

  async #agregarRecorte(
    regra: RegraJogo,
    ultimoConcurso: number,
    recorte: RecorteDataset | null,
  ): Promise<AgregadosRecorte> {
    if (!recorte) return SEM_RECORTE;
    const { ateConcurso, janela } = recorte;
    const [antes, agregadosJanela] = await Promise.all([
      ateConcurso === ultimoConcurso
        ? Promise.resolve(null)
        : this.#repository.agregarDezenas(regra, ateConcurso),
      janela === null
        ? Promise.resolve(null)
        : this.#repository.agregarDezenas(regra, ateConcurso, ateConcurso - janela + 1),
    ]);
    return { antes, janela: agregadosJanela };
  }
}

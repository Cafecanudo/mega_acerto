import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RegraJogo } from '@mega/domain';
import type {
  AgregadoDezena,
  ConcursoDataset,
  DatasetRepository,
} from '../../data/repositories/dataset-repository.ts';

export interface DatasetExportado {
  readonly hash: string;
  readonly totalConcursos: number;
  readonly dataInicio: string;
  readonly dataFim: string;
  readonly agregados: readonly AgregadoDezena[];
}

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
  frequencia: Object.fromEntries(agregados.map((item) => [item.dezena, item.frequencia])),
  atrasoAtual: Object.fromEntries(agregados.map((item) => [item.dezena, item.atrasoAtual])),
});

export class ExportadorDataset {
  readonly #repository: DatasetRepository;

  constructor(repository: DatasetRepository) {
    this.#repository = repository;
  }

  async exportar(
    regra: RegraJogo,
    ultimoConcurso: number,
    diretorio: string,
  ): Promise<DatasetExportado> {
    const [concursos, agregados] = await Promise.all([
      this.#repository.listarConcursos(regra.codigo, ultimoConcurso),
      this.#repository.agregarDezenas(regra, ultimoConcurso),
    ]);

    const primeiro = concursos.at(0);
    const ultimo = concursos.at(-1);
    if (!primeiro || !ultimo) throw new Error(`Não há concursos importados para ${regra.codigo}`);

    const csv = montarCsv(regra, concursos);
    const agregadosJson = JSON.stringify(montarAgregados(ultimoConcurso, agregados), null, 2);

    await mkdir(join(diretorio, 'scripts'), { recursive: true });
    await Promise.all([
      writeFile(join(diretorio, 'concursos.csv'), csv, 'utf8'),
      writeFile(join(diretorio, 'agregados.json'), agregadosJson, 'utf8'),
      writeFile(join(diretorio, 'jogo.json'), JSON.stringify(regra, null, 2), 'utf8'),
    ]);

    return {
      hash: createHash('sha256').update(csv).update(agregadosJson).digest('hex'),
      totalConcursos: concursos.length,
      dataInicio: primeiro.data,
      dataFim: ultimo.data,
      agregados,
    };
  }
}

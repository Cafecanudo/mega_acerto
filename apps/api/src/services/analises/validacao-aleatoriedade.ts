import { ResultadoAleatoriedadeSchema, type ResultadoAleatoriedade } from '@mega/analises';
import type { RegraJogo } from '@mega/domain';
import type { ConferenciaSistema } from '../../data/repositories/analise-repository.ts';
import type { DatasetExportado } from './exportador-dataset.ts';
import { ErroValidacaoResultado, validarContraSchema } from './validacao-schema.ts';

export const validarEstrutura = (saida: unknown): ResultadoAleatoriedade =>
  validarContraSchema(ResultadoAleatoriedadeSchema, saida, 'Resultado');

const validarUniverso = (regra: RegraJogo, resultado: ResultadoAleatoriedade): string[] => {
  const esperado = regra.universo.maximo - regra.universo.minimo + 1;
  const dezenas = resultado.dezenas.map((item) => item.dezena);
  const unicas = new Set(dezenas);
  const foraDoUniverso = dezenas.filter(
    (dezena) => dezena < regra.universo.minimo || dezena > regra.universo.maximo,
  );

  const divergencias: string[] = [];
  if (unicas.size !== esperado || dezenas.length !== esperado) {
    divergencias.push(`Esperadas ${esperado} dezenas distintas, recebidas ${dezenas.length}`);
  }
  if (foraDoUniverso.length > 0) {
    divergencias.push(`Dezenas fora do universo: ${foraDoUniverso.join(', ')}`);
  }
  return divergencias;
};

const compararComSql = (dataset: DatasetExportado, resultado: ResultadoAleatoriedade): string[] => {
  const porDezena = new Map(resultado.dezenas.map((item) => [item.dezena, item]));
  const divergencias: string[] = [];

  if (resultado.amostra.concursos !== dataset.totalConcursos) {
    divergencias.push(
      `Amostra de ${resultado.amostra.concursos} concursos; o sistema tem ${dataset.totalConcursos}`,
    );
  }

  for (const agregado of dataset.agregados) {
    const informado = porDezena.get(agregado.dezena);
    if (!informado) continue;
    if (informado.frequencia !== agregado.frequencia) {
      divergencias.push(
        `Dezena ${agregado.dezena}: frequência ${informado.frequencia}, SQL ${agregado.frequencia}`,
      );
    }
    if (informado.atrasoAtual !== agregado.atrasoAtual) {
      divergencias.push(
        `Dezena ${agregado.dezena}: atraso ${informado.atrasoAtual}, SQL ${agregado.atrasoAtual}`,
      );
    }
  }

  return divergencias;
};

export const conferirComSistema = (
  regra: RegraJogo,
  dataset: DatasetExportado,
  resultado: ResultadoAleatoriedade,
): ConferenciaSistema => {
  const universo = validarUniverso(regra, resultado);
  if (universo.length > 0) throw new ErroValidacaoResultado(universo.join('; '));

  const divergencias = compararComSql(dataset, resultado);
  return { ok: divergencias.length === 0, divergencias };
};

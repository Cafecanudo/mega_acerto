import { contarPremiosAposta, type RegraJogo } from '@mega/domain';
import type {
  Coincidencia,
  JogoReferencia,
  Marcacao,
  ReferenciasSimulacao,
  ResultadoSorteio,
  SorteioConferido,
  SorteioSimulado,
} from './types';

const melhorCoincidencia = (
  regra: RegraJogo,
  sorteadas: ReadonlySet<number>,
  referencias: readonly JogoReferencia[],
): Coincidencia | null => {
  let melhor: { referencia: JogoReferencia; acertadas: number[] } | null = null;
  for (const referencia of referencias) {
    const acertadas = referencia.dezenas.filter((dezena) => sorteadas.has(dezena));
    if (acertadas.length > (melhor?.acertadas.length ?? 0)) melhor = { referencia, acertadas };
  }
  if (!melhor) return null;
  const [premio] = contarPremiosAposta(
    regra,
    melhor.referencia.dezenas.length,
    melhor.acertadas.length,
  );
  return {
    referencia: melhor.referencia,
    acertadas: new Set(melhor.acertadas),
    premio: premio?.nome ?? null,
  };
};

export const conferirDezenas = (
  regra: RegraJogo,
  dezenas: readonly number[],
  referencias: ReferenciasSimulacao,
): ResultadoSorteio => {
  const sorteadas = new Set(dezenas);
  return {
    dezenas,
    aposta: melhorCoincidencia(regra, sorteadas, referencias.apostas),
    favorito: melhorCoincidencia(regra, sorteadas, referencias.favoritos),
  };
};

export const conferirSorteio = (
  regra: RegraJogo,
  sorteio: SorteioSimulado,
  referencias: ReferenciasSimulacao,
): SorteioConferido => {
  const resultados = sorteio.sorteios.map((dezenas) =>
    conferirDezenas(regra, dezenas, referencias),
  );
  return {
    numero: sorteio.numero,
    resultados,
    premiado: resultados.some(
      (resultado) =>
        (resultado.aposta?.premio ?? null) !== null ||
        (resultado.favorito?.premio ?? null) !== null,
    ),
  };
};

export const marcacaoDaDezena = (
  resultado: Pick<ResultadoSorteio, 'aposta' | 'favorito'>,
  dezena: number,
): Marcacao | null => {
  const naAposta = resultado.aposta?.acertadas.has(dezena) ?? false;
  const noFavorito = resultado.favorito?.acertadas.has(dezena) ?? false;
  if (naAposta && noFavorito) return 'ambos';
  if (naAposta) return 'aposta';
  return noFavorito ? 'favorito' : null;
};

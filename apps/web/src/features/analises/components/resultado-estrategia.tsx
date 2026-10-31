import type { ResultadoEstrategia } from '@mega/analises';
import { descreverJanela, obterEstrategia } from '@mega/analises/catalogo';
import { formatarDezena, type RegraJogo } from '@mega/domain';
import type { ReactNode } from 'react';
import { BolaDezena } from '@/components/ui/bola-dezena';
import { formatarDecimal, formatarInteiro, formatarPValor } from '@/lib/formatadores';
import type { AnaliseEstrategia } from '../types';
import { Conferencia, Indicador, Limitacoes, Scripts, Secao } from './partes-resultado';

export interface PalpiteAnalise {
  readonly jogo: string;
  readonly dezenas: readonly number[];
}

interface ResultadoEstrategiaProps {
  readonly regra: RegraJogo;
  readonly analise: AnaliseEstrategia;
  readonly resultado: ResultadoEstrategia;
  readonly acoesPalpite?: ((palpite: PalpiteAnalise) => ReactNode) | undefined;
}

const LARGURA = 640;
const ALTURA = 180;
const MARGEM = 28;
const FRACAO_INICIAL_IGNORADA = 0.1;

const GraficoEvolucao = ({
  evolucao,
  teorica,
}: {
  readonly evolucao: ResultadoEstrategia['backtest']['evolucao'];
  readonly teorica: number;
}) => {
  if (evolucao.length < 2) return null;
  const estaveis = evolucao.slice(Math.floor(evolucao.length * FRACAO_INICIAL_IGNORADA));
  const valores = estaveis.flatMap((ponto) => [ponto.mediaEstrategia, ponto.mediaAleatoria]);
  const amplitude = Math.max(...valores.map((valor) => Math.abs(valor - teorica)), teorica * 0.01);
  const minimo = teorica - amplitude * 1.2;
  const maximo = teorica + amplitude * 1.2;
  const x = (indice: number) => MARGEM + (indice / (evolucao.length - 1)) * (LARGURA - 2 * MARGEM);
  const y = (valor: number) => {
    const limitado = Math.min(Math.max(valor, minimo), maximo);
    return ALTURA - MARGEM - ((limitado - minimo) / (maximo - minimo)) * (ALTURA - 2 * MARGEM);
  };
  const linha = (seletor: (ponto: (typeof evolucao)[number]) => number) =>
    evolucao.map((ponto, indice) => `${x(indice)},${y(seletor(ponto))}`).join(' ');
  const primeiro = evolucao[0];
  const ultimo = evolucao.at(-1);

  return (
    <figure className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="w-full max-w-3xl"
        role="img"
        aria-label="Média acumulada de acertos ao longo do backtest"
      >
        <line
          x1={MARGEM}
          x2={LARGURA - MARGEM}
          y1={y(teorica)}
          y2={y(teorica)}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeDasharray="4 4"
        />
        <polyline
          points={linha((ponto) => ponto.mediaAleatoria)}
          fill="none"
          className="stroke-slate-400"
          strokeWidth={2}
        />
        <polyline
          points={linha((ponto) => ponto.mediaEstrategia)}
          fill="none"
          className="stroke-jogo"
          strokeWidth={2.5}
        />
        <text x={MARGEM} y={ALTURA - 8} className="fill-slate-500 text-[10px]">
          {primeiro?.concurso}
        </text>
        <text
          x={LARGURA - MARGEM}
          y={ALTURA - 8}
          textAnchor="end"
          className="fill-slate-500 text-[10px]"
        >
          {ultimo?.concurso}
        </text>
      </svg>
      <figcaption className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-jogo" />
          Estratégia
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-slate-400" />
          Aleatória
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0 w-4 border-t border-dashed border-slate-400" />
          Teórica ({formatarDecimal(teorica, 3)})
        </span>
      </figcaption>
    </figure>
  );
};

export const ResultadoEstrategiaConcluida = ({
  regra,
  analise,
  resultado,
  acoesPalpite,
}: ResultadoEstrategiaProps) => {
  const { backtest, palpite, conclusao } = resultado;
  const parametros = analise.parametros;

  return (
    <>
      <Secao titulo={`Palpite para o concurso ${palpite.concursoAlvo}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {palpite.dezenas.map((dezena) => (
              <BolaDezena key={dezena} rotulo={formatarDezena(regra, dezena)} />
            ))}
          </div>
          {acoesPalpite?.({ jogo: analise.jogo, dezenas: palpite.dezenas })}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <strong className="font-semibold">{resultado.estrategia.nome}</strong>
          {parametros && ` · ${descreverJanela(parametros.janela)}`} ·{' '}
          {resultado.estrategia.regraAplicada}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">{palpite.justificativa}</p>
        {parametros?.estrategia === 'personalizada' && parametros.descricao && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-300">
            Regra informada: {parametros.descricao}
          </p>
        )}
        {parametros && parametros.estrategia !== 'personalizada' && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Regra do catálogo: {obterEstrategia(parametros.estrategia).regra}
          </p>
        )}
      </Secao>

      <Secao titulo="Conclusão">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              conclusao.superaAleatorio
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {conclusao.superaAleatorio ? 'Supera o aleatório' : 'Não supera o aleatório'}
          </span>
          <span className="text-sm font-medium">{conclusao.resumo}</span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300">
          {conclusao.interpretacao}
        </p>
        <Conferencia doClaude={resultado.conferencia} doSistema={analise.conferenciaSistema} />
      </Secao>

      <Secao
        titulo={`Backtest · ${formatarInteiro(backtest.concursosTestados)} concursos (${backtest.primeiroConcurso} a ${backtest.ultimoConcurso})`}
      >
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Indicador
            rotulo="Média de acertos da estratégia"
            valor={formatarDecimal(backtest.mediaAcertosEstrategia, 3)}
          />
          <Indicador
            rotulo={`Média aleatória (${formatarInteiro(backtest.simulacoesAleatorias)} simulações)`}
            valor={formatarDecimal(backtest.mediaAcertosAleatoria, 3)}
          />
          <Indicador
            rotulo="Média teórica"
            valor={formatarDecimal(backtest.mediaAcertosTeorica, 3)}
          />
          <Indicador rotulo="p-valor" valor={formatarPValor(backtest.teste.pValor)} />
        </div>
        <GraficoEvolucao evolucao={backtest.evolucao} teorica={backtest.mediaAcertosTeorica} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-2 pr-3">Faixa</th>
                <th className="py-2 pr-3 text-right">Estratégia</th>
                <th className="py-2 pr-3 text-right">Aleatória</th>
                <th className="py-2 text-right">Teórico</th>
              </tr>
            </thead>
            <tbody>
              {backtest.faixas.map((faixa) => (
                <tr
                  key={faixa.nome}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td className="py-2 pr-3 font-medium">
                    {faixa.nome}{' '}
                    <span className="text-xs text-slate-500">({faixa.acertos} acertos)</span>
                  </td>
                  <td className="py-2 pr-3 text-right font-semibold tabular-nums">
                    {formatarInteiro(faixa.ocorrenciasEstrategia)}
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums">
                    {formatarDecimal(faixa.ocorrenciasAleatoria, 1)}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {formatarDecimal(faixa.esperadoTeorico, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
          <strong className="font-semibold">{backtest.teste.nome}</strong> · estatística{' '}
          {formatarDecimal(backtest.teste.estatistica, 3)} · {backtest.teste.tamanhoEfeito} ·{' '}
          {backtest.teste.rejeitaH0 ? 'rejeita H0' : 'não rejeita H0'}
          <p className="mt-1 text-xs">{backtest.teste.interpretacao}</p>
        </div>
      </Secao>

      <Secao titulo="Limitações">
        <Limitacoes limitacoes={conclusao.limitacoes} />
      </Secao>
      {analise.scripts.length > 0 && (
        <Secao titulo={`Scripts executados pelo Claude (${analise.scripts.length})`}>
          <Scripts scripts={analise.scripts} />
        </Secao>
      )}
    </>
  );
};

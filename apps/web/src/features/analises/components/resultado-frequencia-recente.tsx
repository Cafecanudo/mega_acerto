import type { ResultadoFrequenciaRecente } from '@mega/analises';
import { formatarDezena, type RegraJogo } from '@mega/domain';
import { IconSparkles } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { BolaDezena } from '@/components/ui/bola-dezena';
import { paths } from '@/config/paths';
import { formatarDecimal, formatarInteiro, formatarPValor } from '@/lib/formatadores';
import { useSolicitarAnalise } from '../api/analises';
import type { AnaliseFrequenciaRecente } from '../types';
import { percentualNaEscala } from '../escala';
import {
  Conferencia,
  Indicador,
  Limitacoes,
  PosicaoNoRanking,
  Scripts,
  Secao,
} from './partes-resultado';

type DezenaTop = ResultadoFrequenciaRecente['top'][number];
type EstatisticaSimulada = ResultadoFrequenciaRecente['simulacao']['estatisticas'][number];

interface ResultadoFrequenciaRecenteProps {
  readonly regra: RegraJogo;
  readonly analise: AnaliseFrequenciaRecente;
  readonly resultado: ResultadoFrequenciaRecente;
}

const FOLGA_ESCALA = 0.08;

const BarraFrequencia = ({
  frequencia,
  esperado,
  maximo,
}: {
  readonly frequencia: number;
  readonly esperado: number;
  readonly maximo: number;
}) => (
  <div className="flex items-center gap-2">
    <div className="relative h-2.5 w-24 rounded-full bg-slate-100 dark:bg-slate-800">
      <span
        className="absolute inset-y-0 left-0 rounded-full bg-jogo"
        style={{ width: `${percentualNaEscala(frequencia, 0, maximo)}%` }}
      />
      <span
        title={`Esperado: ${formatarDecimal(esperado, 1)}`}
        className="absolute -inset-y-1 w-0.5 bg-slate-500 dark:bg-slate-300"
        style={{ left: `${percentualNaEscala(esperado, 0, maximo)}%` }}
      />
    </div>
    <span className="font-semibold tabular-nums">{frequencia}</span>
  </div>
);

const celula = 'px-3 py-2 align-middle whitespace-nowrap';

const TabelaTop = ({
  regra,
  resultado,
}: {
  readonly regra: RegraJogo;
  readonly resultado: ResultadoFrequenciaRecente;
}) => {
  const universo = regra.universo.maximo - regra.universo.minimo + 1;
  const maximo = Math.max(...resultado.top.map((item) => item.frequenciaJanela));
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className={celula}>#</th>
            <th className={celula}>Dezena</th>
            <th className={celula}>Na janela</th>
            <th className={`${celula} text-right`}>Desvio</th>
            <th className={celula}>Posição no histórico</th>
            <th className={`${celula} text-right`}>No histórico</th>
          </tr>
        </thead>
        <tbody>
          {resultado.top.map((item: DezenaTop) => (
            <tr
              key={item.dezena}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              <td className={`${celula} text-slate-500 tabular-nums`}>{item.posicaoJanela}º</td>
              <td className={celula}>
                <BolaDezena rotulo={formatarDezena(regra, item.dezena)} tamanho="sm" />
              </td>
              <td className={celula}>
                <BarraFrequencia
                  frequencia={item.frequenciaJanela}
                  esperado={resultado.janela.frequenciaEsperada}
                  maximo={maximo}
                />
              </td>
              <td className={`${celula} text-right tabular-nums`}>
                {item.desvioPadronizado > 0 ? '+' : ''}
                {formatarDecimal(item.desvioPadronizado, 2)} σ
              </td>
              <td className={celula}>
                <PosicaoNoRanking posicao={item.posicaoHistorica} universo={universo} />
              </td>
              <td className={`${celula} text-right tabular-nums`}>
                {formatarInteiro(item.frequenciaHistorica)}
                <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                  (p{formatarDecimal(item.percentilHistorico, 0)})
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const FaixaAcaso = ({ estatistica }: { readonly estatistica: EstatisticaSimulada }) => {
  const menor = Math.min(estatistica.percentil2_5, estatistica.observado);
  const maior = Math.max(estatistica.percentil97_5, estatistica.observado);
  const folga = (maior - menor) * FOLGA_ESCALA || 1;
  const minimo = menor - folga;
  const maximo = maior + folga;
  const posicao = (valor: number) => `${percentualNaEscala(valor, minimo, maximo)}%`;
  const dentro =
    estatistica.observado >= estatistica.percentil2_5 &&
    estatistica.observado <= estatistica.percentil97_5;

  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">{estatistica.nome}</span>
        <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
          observado {formatarDecimal(estatistica.observado, 1)} · acaso{' '}
          {formatarDecimal(estatistica.percentil2_5, 1)} a{' '}
          {formatarDecimal(estatistica.percentil97_5, 1)} · p {formatarPValor(estatistica.pValor)}
        </span>
      </div>
      <div
        role="img"
        aria-label={`Observado ${String(estatistica.observado)}, ${dentro ? 'dentro' : 'fora'} da faixa de 95% do acaso`}
        className="relative h-6"
      >
        <span className="absolute inset-x-0 top-1/2 h-px bg-slate-200 dark:bg-slate-700" />
        <span
          className="absolute top-1/2 h-3 -translate-y-1/2 rounded bg-slate-200 dark:bg-slate-700"
          style={{
            left: posicao(estatistica.percentil2_5),
            width: `calc(${posicao(estatistica.percentil97_5)} - ${posicao(estatistica.percentil2_5)})`,
          }}
        />
        <span
          className="absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-slate-500 dark:bg-slate-300"
          style={{ left: posicao(estatistica.mediana) }}
        />
        <span
          className={`absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white dark:ring-slate-900 ${
            dentro ? 'bg-jogo' : 'bg-amber-500'
          }`}
          style={{ left: posicao(estatistica.observado) }}
        />
      </div>
    </li>
  );
};

const LegendaFaixa = () => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
    <span className="flex items-center gap-1.5">
      <span className="h-3 w-6 rounded bg-slate-200 dark:bg-slate-700" />
      95% dos sorteios simulados
    </span>
    <span className="flex items-center gap-1.5">
      <span className="h-3.5 w-0.5 bg-slate-500 dark:bg-slate-300" />
      Mediana do acaso
    </span>
    <span className="flex items-center gap-1.5">
      <span className="size-3 rounded-full bg-jogo" />
      Valor real
    </span>
  </div>
);

const BotaoGerarPalpite = ({
  regra,
  analise,
  janela,
}: {
  readonly regra: RegraJogo;
  readonly analise: AnaliseFrequenciaRecente;
  readonly janela: number;
}) => {
  const solicitar = useSolicitarAnalise();
  const navegar = useNavigate();
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={solicitar.isPending}
        onClick={() => {
          solicitar.mutate(
            {
              jogo: analise.jogo,
              tipo: 'estrategia',
              modelo: analise.modelo,
              esforco: analise.esforco,
              forcar: false,
              parametros: {
                estrategia: 'mais-sorteadas',
                descricao: null,
                quantidadeDezenas: regra.dezenasPorAposta.minimo,
                janela,
              },
            },
            {
              onSuccess: (solicitada) => {
                void navegar(paths.analise(solicitada.id));
              },
            },
          );
        }}
        className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        <IconSparkles aria-hidden size="1rem" />
        {solicitar.isPending ? 'Enviando…' : 'Gerar palpite com esta janela'}
      </button>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        Executa a Estratégia › Mais sorteadas com os últimos {janela} concursos e backtest completo.
        Consome cota do Claude.
      </span>
      {solicitar.isError && (
        <span className="text-xs text-rose-600 dark:text-rose-400">{solicitar.error.message}</span>
      )}
    </div>
  );
};

const Persistencia = ({
  persistencia,
  tamanhoTop,
}: {
  readonly persistencia: ResultadoFrequenciaRecente['persistencia'];
  readonly tamanhoTop: number;
}) =>
  persistencia === null ? (
    <p className="text-sm text-slate-500 dark:text-slate-400">
      Não há concursos suficientes antes da janela para comparar.
    </p>
  ) : (
    <>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Indicador
          rotulo="Janela anterior"
          valor={`${String(persistencia.primeiroConcursoAnterior)}–${String(persistencia.ultimoConcursoAnterior)}`}
        />
        <Indicador
          rotulo={`No top ${String(tamanhoTop)} anterior`}
          valor={`${String(persistencia.sobreposicaoTop)} de ${String(tamanhoTop)}`}
        />
        <Indicador
          rotulo="Esperado ao acaso"
          valor={formatarDecimal(persistencia.sobreposicaoEsperada, 2)}
        />
        <Indicador
          rotulo="Correlação de Spearman"
          valor={`${formatarDecimal(persistencia.correlacaoSpearman, 3)} (p ${formatarPValor(persistencia.pValor)})`}
        />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{persistencia.interpretacao}</p>
    </>
  );

const Backtest = ({ backtest }: { readonly backtest: ResultadoFrequenciaRecente['backtest'] }) => (
  <>
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      <Indicador rotulo="Concursos testados" valor={formatarInteiro(backtest.concursosTestados)} />
      <Indicador
        rotulo="Acertos do top por concurso"
        valor={formatarDecimal(backtest.mediaAcertosTop, 3)}
      />
      <Indicador
        rotulo="Esperado ao acaso"
        valor={formatarDecimal(backtest.mediaAcertosEsperada, 3)}
      />
      <Indicador rotulo="p-valor" valor={formatarPValor(backtest.teste.pValor)} />
    </div>
    <p className="text-sm text-slate-600 dark:text-slate-300">
      <strong className="font-semibold">{backtest.teste.nome}</strong> ·{' '}
      {backtest.teste.tamanhoEfeito} · {backtest.teste.interpretacao}
    </p>
  </>
);

export const ResultadoFrequenciaRecenteConcluida = ({
  regra,
  analise,
  resultado,
}: ResultadoFrequenciaRecenteProps) => {
  const { janela, conclusao, simulacao } = resultado;
  const tamanhoTop = resultado.top.length;

  return (
    <>
      <Secao titulo="Conclusão">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              conclusao.explicavelPeloAcaso
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
            }`}
          >
            {conclusao.explicavelPeloAcaso ? 'Explicável pelo acaso' : 'Evidência contra o acaso'}
          </span>
          <span className="text-sm font-medium">{conclusao.resumo}</span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300">
          {conclusao.interpretacao}
        </p>
        <Conferencia doClaude={resultado.conferencia} doSistema={analise.conferenciaSistema} />
      </Secao>

      <Secao
        titulo={`Top ${String(tamanhoTop)} · últimos ${formatarInteiro(janela.concursos)} concursos (${String(janela.primeiroConcurso)} a ${String(janela.ultimoConcurso)})`}
      >
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Esperado por dezena: {formatarDecimal(janela.frequenciaEsperada, 1)} ± desvio de{' '}
          {formatarDecimal(janela.desvioPadraoEsperado, 2)}. O traço na barra marca o esperado; a
          posição no histórico mostra onde a dezena fica no ranking de todos os concursos.
        </p>
        <TabelaTop regra={regra} resultado={resultado} />
        <BotaoGerarPalpite regra={regra} analise={analise} janela={janela.concursos} />
      </Secao>

      <Secao
        titulo={`Faixa do acaso · ${formatarInteiro(simulacao.replicacoes)} janelas simuladas`}
      >
        <LegendaFaixa />
        <ul className="flex flex-col gap-4">
          {simulacao.estatisticas.map((estatistica) => (
            <FaixaAcaso key={estatistica.nome} estatistica={estatistica} />
          ))}
        </ul>
        <p className="text-sm text-slate-600 dark:text-slate-300">{simulacao.interpretacao}</p>
      </Secao>

      <Secao titulo="Persistência: o top anterior antecipa o atual?">
        <Persistencia persistencia={resultado.persistencia} tamanhoTop={tamanhoTop} />
      </Secao>

      <Secao
        titulo={`Backtest · top ${String(tamanhoTop)} como palpite do concurso seguinte (${String(resultado.backtest.primeiroConcurso)} a ${String(resultado.backtest.ultimoConcurso)})`}
      >
        <Backtest backtest={resultado.backtest} />
      </Secao>

      <Secao titulo="Limitações">
        <Limitacoes limitacoes={conclusao.limitacoes} />
      </Secao>
      {analise.scripts.length > 0 && (
        <Secao titulo={`Scripts executados pelo Claude (${String(analise.scripts.length)})`}>
          <Scripts scripts={analise.scripts} />
        </Secao>
      )}
    </>
  );
};

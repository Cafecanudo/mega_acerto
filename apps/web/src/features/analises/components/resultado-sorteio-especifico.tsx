import type { ResultadoSorteioEspecifico } from '@mega/analises';
import { filtrosPopularidade } from '@mega/analises/catalogo';
import { formatarDezena, type RegraJogo } from '@mega/domain';
import { IconAlertTriangle, IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { BolaDezena } from '@/components/ui/bola-dezena';
import { formatarData, formatarDecimal, formatarInteiro } from '@/lib/formatadores';
import type { AnaliseSorteioEspecifico } from '../types';
import { Conferencia, Limitacoes, PosicaoNoRanking, Scripts, Secao } from './partes-resultado';
import type { PalpiteAnalise } from './resultado-estrategia';

type Caracteristica = ResultadoSorteioEspecifico['perfil'][number];
type FiltroAplicado = ResultadoSorteioEspecifico['palpite']['filtros'][number];

interface ResultadoSorteioEspecificoProps {
  readonly regra: RegraJogo;
  readonly analise: AnaliseSorteioEspecifico;
  readonly resultado: ResultadoSorteioEspecifico;
  readonly acoesPalpite?: ((palpite: PalpiteAnalise) => ReactNode) | undefined;
}

const PERCENTIL_INFERIOR = 2.5;
const PERCENTIL_SUPERIOR = 97.5;

const isForaDaFaixa = (percentil: number): boolean =>
  percentil < PERCENTIL_INFERIOR || percentil > PERCENTIL_SUPERIOR;

const formatarPercentual = (probabilidade: number): string =>
  `${formatarDecimal(probabilidade * 100, 1)}%`;

const celula = 'px-3 py-2 align-middle whitespace-nowrap';

const TabelaDezenas = ({
  regra,
  resultado,
}: {
  readonly regra: RegraJogo;
  readonly resultado: ResultadoSorteioEspecifico;
}) => {
  const universo = regra.universo.maximo - regra.universo.minimo + 1;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className={celula}>Dezena</th>
            <th className={celula}>Posição no histórico</th>
            <th className={`${celula} text-right`}>Vezes antes</th>
            <th className={celula}>Posição na janela</th>
            <th className={`${celula} text-right`}>Atraso</th>
            <th className={`${celula} text-right`}>Chance do atraso</th>
          </tr>
        </thead>
        <tbody>
          {resultado.dezenas.map((item) => (
            <tr
              key={item.dezena}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              <td className={celula}>
                <BolaDezena rotulo={formatarDezena(regra, item.dezena)} tamanho="sm" />
              </td>
              <td className={celula}>
                <PosicaoNoRanking posicao={item.posicaoHistorica} universo={universo} />
              </td>
              <td className={`${celula} text-right tabular-nums`}>
                {formatarInteiro(item.frequenciaAntes)}
              </td>
              <td className={celula}>
                <PosicaoNoRanking posicao={item.posicaoJanela} universo={universo} />
              </td>
              <td className={`${celula} text-right tabular-nums`}>
                {item.atrasoAntes === 0 ? 'saiu no anterior' : `${String(item.atrasoAntes)} conc.`}
              </td>
              <td className={`${celula} text-right tabular-nums`}>
                {formatarPercentual(item.probabilidadeAtraso)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TrilhaPercentil = ({ percentil }: { readonly percentil: number }) => (
  <div
    role="img"
    aria-label={`Percentil ${formatarDecimal(percentil, 1)}`}
    className="relative h-5 w-full max-w-64"
  >
    <span className="absolute inset-x-0 top-1/2 h-px bg-slate-200 dark:bg-slate-700" />
    <span
      className="absolute top-1/2 h-3 -translate-y-1/2 rounded bg-slate-200 dark:bg-slate-700"
      style={{
        left: `${String(PERCENTIL_INFERIOR)}%`,
        width: `${String(PERCENTIL_SUPERIOR - PERCENTIL_INFERIOR)}%`,
      }}
    />
    <span className="absolute top-1/2 left-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-slate-500 dark:bg-slate-300" />
    <span
      className={`absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white dark:ring-slate-900 ${
        isForaDaFaixa(percentil) ? 'bg-amber-500' : 'bg-jogo'
      }`}
      style={{ left: `${String(percentil)}%` }}
    />
  </div>
);

const Perfil = ({ perfil }: { readonly perfil: readonly Caracteristica[] }) => (
  <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
    {perfil.map((caracteristica) => (
      <li
        key={caracteristica.nome}
        className="grid gap-x-4 gap-y-1 py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] sm:items-center"
      >
        <div className="flex flex-col">
          <span className="text-sm font-medium">{caracteristica.nome}</span>
          <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
            valor {formatarDecimal(caracteristica.valor, 1)} · típico {caracteristica.faixaTipica}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TrilhaPercentil percentil={caracteristica.percentil} />
          <span className="w-12 text-right text-xs text-slate-500 tabular-nums dark:text-slate-400">
            p{formatarDecimal(caracteristica.percentil, 0)}
          </span>
        </div>
        <span className="text-xs text-slate-600 sm:col-span-2 dark:text-slate-300">
          {caracteristica.interpretacao}
        </span>
      </li>
    ))}
  </ul>
);

const descricaoFiltro = (codigo: string): string =>
  filtrosPopularidade.find((filtro) => filtro.codigo === codigo)?.descricao ?? codigo;

const ListaFiltros = ({ filtros }: { readonly filtros: readonly FiltroAplicado[] }) => (
  <ul className="flex flex-col gap-1.5 text-sm">
    {filtros.map((filtro) => (
      <li key={filtro.codigo} className="flex items-start gap-2">
        {filtro.atende ? (
          <IconCircleCheck
            aria-label="Atende"
            size="1.125rem"
            className="mt-0.5 shrink-0 text-emerald-600"
          />
        ) : (
          <IconCircleX
            aria-label="Não atende"
            size="1.125rem"
            className="mt-0.5 shrink-0 text-rose-600"
          />
        )}
        <span>
          <span className="font-medium">{descricaoFiltro(filtro.codigo)}</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">{filtro.detalhe}</span>
        </span>
      </li>
    ))}
  </ul>
);

const Palpite = ({
  regra,
  analise,
  palpite,
  acoesPalpite,
}: {
  readonly regra: RegraJogo;
  readonly analise: AnaliseSorteioEspecifico;
  readonly palpite: ResultadoSorteioEspecifico['palpite'];
  readonly acoesPalpite: ResultadoSorteioEspecificoProps['acoesPalpite'];
}) => (
  <>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-1.5">
        {palpite.dezenas.map((dezena) => (
          <BolaDezena key={dezena} rotulo={formatarDezena(regra, dezena)} />
        ))}
      </div>
      {acoesPalpite?.({ jogo: analise.jogo, dezenas: palpite.dezenas })}
    </div>
    <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
      <IconAlertTriangle aria-hidden size="1.125rem" className="mt-0.5 shrink-0" />
      <span>
        Este palpite tem a mesma chance de acerto de qualquer outro jogo. Os filtros evitam padrões
        muito jogados para que, se ele sair, o prêmio tenda a ser dividido com menos pessoas. É uma
        heurística: a Caixa não publica como as apostas se distribuem.
      </span>
    </p>
    <p className="text-sm text-slate-600 dark:text-slate-300">{palpite.justificativa}</p>
    <ListaFiltros filtros={palpite.filtros} />
    <p className="text-xs text-slate-500 dark:text-slate-400">
      Sorteado entre {formatarInteiro(palpite.combinacoesElegiveis)} combinações que atendem a todos
      os filtros.
    </p>
  </>
);

export const ResultadoSorteioEspecificoConcluido = ({
  regra,
  analise,
  resultado,
  acoesPalpite,
}: ResultadoSorteioEspecificoProps) => {
  const { concurso, janela, conclusao, palpite } = resultado;

  return (
    <>
      <Secao titulo={`Concurso ${String(concurso.numero)} · ${formatarData(concurso.data)}`}>
        <div className="flex flex-wrap gap-1.5">
          {concurso.dezenas.map((dezena) => (
            <BolaDezena key={dezena} rotulo={formatarDezena(regra, dezena)} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              conclusao.sorteioTipico
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
            }`}
          >
            {conclusao.sorteioTipico
              ? 'Sorteio típico'
              : 'Sorteio atípico em alguma característica'}
          </span>
          <span className="text-sm font-medium">{conclusao.resumo}</span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300">
          {conclusao.interpretacao}
        </p>
        <Conferencia doClaude={resultado.conferencia} doSistema={analise.conferenciaSistema} />
      </Secao>

      <Secao
        titulo={`As dezenas antes do sorteio · janela ${String(janela.primeiroConcurso)} a ${String(janela.ultimoConcurso)}`}
      >
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tudo calculado só com os concursos anteriores. "Chance do atraso" é a probabilidade, ao
          acaso, de uma dezena ficar pelo menos esse tempo sem sair.
        </p>
        <TabelaDezenas regra={regra} resultado={resultado} />
      </Secao>

      <Secao titulo="Perfil do sorteio entre todas as combinações possíveis">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          A faixa cinza cobre 95% das combinações possíveis e o traço marca a mediana. Um ponto
          âmbar fica fora dessa faixa.
        </p>
        <Perfil perfil={resultado.perfil} />
      </Secao>

      <Secao titulo={`Palpite pouco popular para o concurso ${String(palpite.concursoAlvo)}`}>
        <Palpite regra={regra} analise={analise} palpite={palpite} acoesPalpite={acoesPalpite} />
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

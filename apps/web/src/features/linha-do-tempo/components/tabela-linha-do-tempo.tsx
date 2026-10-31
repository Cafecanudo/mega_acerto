import { formatarDezena, type RegraJogo } from '@mega/domain';
import { formatarData, formatarMoeda } from '@/lib/formatadores';
import type { DesempenhoConcurso, PontoLinhaDoTempo } from '../types';

interface TabelaLinhaDoTempoProps {
  readonly regra: RegraJogo;
  readonly pontos: readonly PontoLinhaDoTempo[];
}

const celula = 'px-3 py-1.5 whitespace-nowrap';

const acertos = (desempenho: DesempenhoConcurso | null): string =>
  desempenho ? String(desempenho.melhorAcerto) : '—';

const premio = (desempenho: DesempenhoConcurso | null): string =>
  desempenho?.premio ? formatarMoeda(desempenho.premio) : '—';

export const TabelaLinhaDoTempo = ({ regra, pontos }: TabelaLinhaDoTempoProps) => (
  <div className="max-h-72 overflow-auto">
    <table className="w-full text-left text-xs tabular-nums">
      <thead className="sticky top-0 bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400">
        <tr>
          <th className={celula}>Concurso</th>
          <th className={celula}>Data</th>
          <th className={celula}>Dezenas</th>
          <th className={`${celula} text-right`}>Apostas</th>
          <th className={`${celula} text-right`}>Prêmio</th>
          <th className={`${celula} text-right`}>Favoritos</th>
          <th className={`${celula} text-right`}>Teria ganho</th>
        </tr>
      </thead>
      <tbody>
        {pontos.toReversed().map((ponto) => (
          <tr key={ponto.numero} className="border-t border-slate-100 dark:border-slate-800">
            <td className={celula}>{ponto.numero}</td>
            <td className={celula}>{formatarData(ponto.data)}</td>
            <td className={`${celula} font-mono`}>
              {ponto.dezenas.map((dezena) => formatarDezena(regra, dezena)).join(' ')}
            </td>
            <td className={`${celula} text-right`}>{acertos(ponto.apostas)}</td>
            <td className={`${celula} text-right`}>{premio(ponto.apostas)}</td>
            <td className={`${celula} text-right`}>{acertos(ponto.favoritos)}</td>
            <td className={`${celula} text-right`}>{premio(ponto.favoritos)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

import type { RegraJogo } from '@mega/domain';
import { Link } from 'react-router';
import { paths } from '@/config/paths';
import { formatarData, formatarInteiro, formatarMoeda } from '@/lib/formatadores';
import type { ResumoConcurso } from '../types';
import { LinhaDezenas } from './linha-dezenas';

interface TabelaConcursosProps<T extends ResumoConcurso> {
  readonly regra: RegraJogo;
  readonly concursos: readonly T[];
  readonly destacadas?: ReadonlySet<number>;
  readonly colunaExtra?: { readonly titulo: string; readonly valor: (concurso: T) => string };
}

const celula = 'px-4 py-3 align-middle';

export const TabelaConcursos = <T extends ResumoConcurso>({
  regra,
  concursos,
  destacadas,
  colunaExtra,
}: TabelaConcursosProps<T>) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[640px] text-left text-sm">
      <thead className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
        <tr className="border-b border-slate-200 dark:border-slate-800">
          <th className={celula}>Concurso</th>
          <th className={celula}>Data</th>
          <th className={celula}>Dezenas</th>
          {colunaExtra && <th className={celula}>{colunaExtra.titulo}</th>}
          <th className={`${celula} text-right`}>Ganhadores</th>
          <th className={`${celula} text-right`}>Arrecadação</th>
        </tr>
      </thead>
      <tbody>
        {concursos.map((concurso) => (
          <tr
            key={concurso.numero}
            className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
          >
            <td className={celula}>
              <Link
                to={paths.concurso(regra.codigo, concurso.numero)}
                className="font-mono font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
              >
                {concurso.numero}
              </Link>
            </td>
            <td className={`${celula} tabular-nums`}>{formatarData(concurso.dataApuracao)}</td>
            <td className={celula}>
              <div className="flex flex-col gap-1.5">
                {concurso.sorteios.map((dezenas, indice) => (
                  <LinhaDezenas
                    key={indice}
                    regra={regra}
                    dezenas={dezenas}
                    destacadas={destacadas}
                    tamanho="sm"
                  />
                ))}
              </div>
            </td>
            {colunaExtra && (
              <td className={`${celula} font-semibold tabular-nums`}>
                {colunaExtra.valor(concurso)}
              </td>
            )}
            <td className={`${celula} text-right tabular-nums`}>
              {concurso.acumulado ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                  Acumulou
                </span>
              ) : (
                formatarInteiro(concurso.ganhadoresFaixaPrincipal)
              )}
            </td>
            <td className={`${celula} text-right tabular-nums`}>
              {formatarMoeda(concurso.valorArrecadado)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

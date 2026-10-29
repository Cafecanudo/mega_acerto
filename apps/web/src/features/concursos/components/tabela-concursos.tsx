import type { RegraJogo } from '@mega/domain';
import { useState } from 'react';
import { formatarData, formatarInteiro, formatarMoeda } from '@/lib/formatadores';
import type { ResumoConcurso } from '../types';
import { LinhaDezenas } from '@/components/dezenas/linha-dezenas';
import { DialogoConcurso } from './dialogo-concurso';

interface TabelaConcursosProps<T extends ResumoConcurso> {
  readonly regra: RegraJogo;
  readonly concursos: readonly T[];
  readonly destacadas?: ReadonlySet<number>;
  readonly colunaExtra?: { readonly titulo: string; readonly valor: (concurso: T) => string };
}

const celula = 'px-4 py-2 align-middle';
const cabecalho = 'sticky top-0 z-10 bg-white px-4 py-2 dark:bg-slate-900';

export const TabelaConcursos = <T extends ResumoConcurso>({
  regra,
  concursos,
  destacadas,
  colunaExtra,
}: TabelaConcursosProps<T>) => {
  const [selecionado, setSelecionado] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto lg:overflow-visible">
      {selecionado !== null && (
        <DialogoConcurso
          regra={regra}
          numeroInicial={selecionado}
          aoFechar={() => {
            setSelecionado(null);
          }}
        />
      )}
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className={cabecalho}>Concurso</th>
            <th className={cabecalho}>Data</th>
            <th className={cabecalho}>Dezenas</th>
            {colunaExtra && <th className={cabecalho}>{colunaExtra.titulo}</th>}
            <th className={`${cabecalho} text-right`}>Ganhadores</th>
            <th className={`${cabecalho} text-right`}>Arrecadação</th>
          </tr>
        </thead>
        <tbody>
          {concursos.map((concurso) => (
            <tr
              key={concurso.numero}
              onClick={() => {
                setSelecionado(concurso.numero);
              }}
              className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
            >
              <td className={`${celula} font-mono font-semibold text-jogo`}>{concurso.numero}</td>
              <td className={`${celula} tabular-nums`}>{formatarData(concurso.dataApuracao)}</td>
              <td className={celula}>
                <div className="flex min-w-52 flex-col gap-1.5">
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
};

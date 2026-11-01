import type { ReactNode } from 'react';
import { percentualNaEscala } from '../escala';
import type { Analise, ConferenciaSistema } from '../types';

export const Secao = ({
  titulo,
  children,
}: {
  readonly titulo: ReactNode;
  readonly children: ReactNode;
}) => (
  <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
    <h3 className="text-sm font-semibold">{titulo}</h3>
    {children}
  </section>
);

export const Conferencia = ({
  doClaude,
  doSistema,
}: {
  readonly doClaude: { readonly frequenciasConferem: boolean; readonly divergencias: string[] };
  readonly doSistema: ConferenciaSistema | null;
}) => {
  const ok = doClaude.frequenciasConferem && (doSistema?.ok ?? false);
  const divergencias = [...doClaude.divergencias, ...(doSistema?.divergencias ?? [])];

  return (
    <div
      className={`rounded-lg px-3 py-2 text-sm ${
        ok
          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300'
          : 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300'
      }`}
    >
      {ok
        ? 'Conferência ok: as contagens do Claude batem com os agregados SQL do sistema.'
        : 'Atenção: há divergências entre os cálculos do Claude e os agregados SQL.'}
      {divergencias.length > 0 && (
        <ul className="mt-1 list-disc pl-5 text-xs">
          {divergencias.slice(0, 10).map((divergencia) => (
            <li key={divergencia}>{divergencia}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const Scripts = ({ scripts }: { readonly scripts: Analise['scripts'] }) => (
  <div className="flex flex-col gap-2">
    {scripts.map((script) => (
      <details
        key={script.nome}
        className="rounded-lg border border-slate-200 dark:border-slate-800"
      >
        <summary className="cursor-pointer px-3 py-2 font-mono text-xs">{script.nome}</summary>
        <pre className="max-h-96 overflow-auto border-t border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950">
          {script.conteudo}
        </pre>
      </details>
    ))}
  </div>
);

export const Limitacoes = ({ limitacoes }: { readonly limitacoes: readonly string[] }) => (
  <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
    {limitacoes.map((limitacao) => (
      <li key={limitacao}>{limitacao}</li>
    ))}
  </ul>
);

export const Indicador = ({
  rotulo,
  valor,
}: {
  readonly rotulo: string;
  readonly valor: string;
}) => (
  <div className="flex flex-col gap-0.5 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
    <span className="text-xs text-slate-500 dark:text-slate-400">{rotulo}</span>
    <span className="text-base font-semibold tabular-nums">{valor}</span>
  </div>
);

export const PosicaoNoRanking = ({
  posicao,
  universo,
}: {
  readonly posicao: number;
  readonly universo: number;
}) => (
  <div className="flex items-center gap-2">
    <div className="relative h-1.5 w-28 rounded-full bg-slate-200 dark:bg-slate-700">
      <span
        className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-jogo ring-2 ring-white dark:ring-slate-900"
        style={{ left: `${percentualNaEscala(posicao, 1, universo)}%` }}
      />
    </div>
    <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
      {posicao}º de {universo}
    </span>
  </div>
);

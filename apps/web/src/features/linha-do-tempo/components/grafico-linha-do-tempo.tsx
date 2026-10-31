import type { RegraJogo } from '@mega/domain';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Carregando, Falha, Vazio } from '@/components/ui/estado';
import { linhaDoTempoQuery } from '../api/linha-do-tempo';
import { AmostraSerie } from './marcadores';
import { PlanoLinhaDoTempo } from './plano-linha-do-tempo';
import { TabelaLinhaDoTempo } from './tabela-linha-do-tempo';

interface GraficoLinhaDoTempoProps {
  readonly regra: RegraJogo;
}

const JANELAS = [20, 50, 100] as const;

const SeletorJanela = ({
  janela,
  aoMudar,
}: {
  readonly janela: number;
  readonly aoMudar: (janela: number) => void;
}) => (
  <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium dark:bg-slate-800">
    {JANELAS.map((opcao) => (
      <button
        key={opcao}
        type="button"
        aria-pressed={janela === opcao}
        onClick={() => {
          aoMudar(opcao);
        }}
        className={`rounded-md px-2.5 py-1 tabular-nums transition ${
          janela === opcao
            ? 'bg-white shadow-sm dark:bg-slate-950'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        {opcao}
      </button>
    ))}
  </div>
);

const Legenda = () => (
  <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
    <li className="flex items-center gap-1.5">
      <AmostraSerie serie="apostas" />
      Minhas apostas
    </li>
    <li className="flex items-center gap-1.5">
      <AmostraSerie serie="favoritos" />
      Favoritos não apostados
    </li>
    <li className="text-slate-500 dark:text-slate-400">Marcador cheio: faixa premiada</li>
  </ul>
);

export const GraficoLinhaDoTempo = ({ regra }: GraficoLinhaDoTempoProps) => {
  const [janela, setJanela] = useState<number>(50);
  const consulta = useQuery(linhaDoTempoQuery(regra.codigo, janela));

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[0.68rem] font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Linha do tempo
          </span>
          <span className="text-sm font-semibold">Acertos por concurso</span>
        </div>
        <div className="ml-auto">
          <SeletorJanela janela={janela} aoMudar={setJanela} />
        </div>
      </div>
      <Legenda />
      {consulta.isPending && <Carregando mensagem="Carregando linha do tempo…" />}
      {consulta.isError && <Falha erro={consulta.error} />}
      {consulta.isSuccess && consulta.data.length === 0 && <Vazio>Sem concursos importados.</Vazio>}
      {consulta.isSuccess && consulta.data.length > 0 && (
        <>
          <PlanoLinhaDoTempo regra={regra} pontos={consulta.data} />
          <details className="text-xs">
            <summary className="w-fit cursor-pointer font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              Ver tabela
            </summary>
            <TabelaLinhaDoTempo regra={regra} pontos={consulta.data} />
          </details>
        </>
      )}
    </div>
  );
};

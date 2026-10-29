import type { RegraJogo } from '@mega/domain';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Carregando, Falha, Vazio } from '@/components/ui/estado';
import { Paginacao } from '@/components/ui/paginacao';
import {
  descreverFaixa,
  MINIMO_ACERTOS_COMBINACOES,
  type ParametrosBusca,
} from '@/lib/busca-dezenas';
import { buscarConcursosQuery } from '../api/consultas';
import { TabelaConcursos } from './tabela-concursos';

interface ConcursosComDezenasProps {
  readonly regra: RegraJogo;
  readonly dezenas: readonly number[];
}

const Resultado = ({
  regra,
  busca,
  aoMudarPagina,
}: {
  readonly regra: RegraJogo;
  readonly busca: ParametrosBusca;
  readonly aoMudarPagina: (pagina: number) => void;
}) => {
  const consulta = useQuery(buscarConcursosQuery(regra, busca));

  if (consulta.isPending) return <Carregando mensagem="Buscando concursos…" />;
  if (consulta.isError) return <Falha erro={consulta.error} />;
  if (consulta.data.itens.length === 0) {
    return <Vazio>Nenhum concurso com {descreverFaixa(regra, busca)} entre essas dezenas.</Vazio>;
  }

  return (
    <>
      <div
        className={`lg:min-h-0 lg:flex-1 lg:overflow-auto ${consulta.isPlaceholderData ? 'opacity-60' : ''}`}
      >
        <TabelaConcursos
          regra={regra}
          concursos={consulta.data.itens}
          destacadas={new Set(busca.dezenas)}
          colunaExtra={{ titulo: 'Acertos', valor: (concurso) => String(concurso.acertos) }}
        />
      </div>
      <div className="shrink-0 border-t border-slate-200 px-4 py-2 dark:border-slate-800">
        <Paginacao
          pagina={busca.pagina}
          tamanho={consulta.data.tamanho}
          total={consulta.data.total}
          aoMudar={aoMudarPagina}
        />
      </div>
    </>
  );
};

export const ConcursosComDezenas = ({ regra, dezenas }: ConcursosComDezenasProps) => {
  const [incluirCombinacoes, setIncluirCombinacoes] = useState(true);
  const [pagina, setPagina] = useState(1);
  const chaveDezenas = dezenas.join(',');
  const [chaveAnterior, setChaveAnterior] = useState(chaveDezenas);
  if (chaveDezenas !== chaveAnterior) {
    setChaveAnterior(chaveDezenas);
    setPagina(1);
  }

  const busca: ParametrosBusca = { dezenas, incluirCombinacoes, pagina };
  const combinacoesDisponiveis =
    Math.min(dezenas.length, regra.dezenasPorSorteio) > MINIMO_ACERTOS_COMBINACOES;

  return (
    <section className="flex flex-col rounded-xl border border-slate-200 bg-white lg:min-h-0 lg:flex-1 dark:border-slate-800 dark:bg-slate-900">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-semibold">
          Quando essas dezenas foram sorteadas · {descreverFaixa(regra, busca)}
        </h2>
        <label
          className={`flex items-center gap-2 text-sm ${combinacoesDisponiveis ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400'}`}
          title={
            combinacoesDisponiveis
              ? `Inclui concursos com ${MINIMO_ACERTOS_COMBINACOES} ou mais acertos`
              : `Selecione mais de ${MINIMO_ACERTOS_COMBINACOES} dezenas para usar combinações`
          }
        >
          <input
            type="checkbox"
            checked={incluirCombinacoes && combinacoesDisponiveis}
            disabled={!combinacoesDisponiveis}
            onChange={(evento) => {
              setIncluirCombinacoes(evento.target.checked);
              setPagina(1);
            }}
            className="size-4 accent-jogo"
          />
          Combinações de até {MINIMO_ACERTOS_COMBINACOES}
        </label>
      </header>
      <Resultado regra={regra} busca={busca} aoMudarPagina={setPagina} />
    </section>
  );
};

import type { RegraJogo } from '@mega/domain';
import { useQuery } from '@tanstack/react-query';
import { lazy, Suspense, useState, type ReactNode } from 'react';
import { BarraBuscaDezenas } from '@/components/dezenas/barra-busca-dezenas';
import { BaloesAcertos } from '@/components/ui/baloes-acertos';
import { Carregando, Falha, Vazio } from '@/components/ui/estado';
import { Paginacao } from '@/components/ui/paginacao';
import { descreverFaixa, type ParametrosBusca } from '@/lib/busca-dezenas';
import { listarApostasQuery, resumoApostasQuery } from '../api/apostas';
import type { Aposta } from '../types';
import { TabelaApostas } from './tabela-apostas';

interface ListaApostasProps {
  readonly regra: RegraJogo;
  readonly busca: ParametrosBusca;
  readonly aoBuscar: (busca: ParametrosBusca) => void;
  readonly valorApostaSimples: (jogo: string) => number | null;
}

const DialogoEditarAposta = lazy(() =>
  import('./dialogo-editar-aposta').then((modulo) => ({ default: modulo.DialogoEditarAposta })),
);

const Estado = ({ children }: { readonly children: ReactNode }) => (
  <div className="p-4 lg:min-h-0 lg:flex-1 lg:overflow-auto">{children}</div>
);

const Resultados = ({ regra, busca, aoBuscar, valorApostaSimples }: ListaApostasProps) => {
  const consulta = useQuery(listarApostasQuery(regra, busca));
  const [emEdicao, setEmEdicao] = useState<Aposta | null>(null);
  const filtrando = busca.dezenas.length > 0;

  if (consulta.isPending) return <Estado>{<Carregando mensagem="Carregando apostas…" />}</Estado>;
  if (consulta.isError) return <Estado>{<Falha erro={consulta.error} />}</Estado>;
  if (consulta.data.itens.length === 0) {
    return (
      <Estado>
        <Vazio>
          {filtrando
            ? `Nenhuma aposta com ${descreverFaixa(regra, busca)} entre essas dezenas.`
            : 'Nenhuma aposta efetivada ainda. Elas aparecem aqui quando você apostar.'}
        </Vazio>
      </Estado>
    );
  }

  return (
    <>
      <div
        className={`lg:min-h-0 lg:flex-1 lg:overflow-auto ${consulta.isPlaceholderData ? 'opacity-60' : ''}`}
      >
        <TabelaApostas
          apostas={consulta.data.itens}
          destacadas={filtrando ? new Set(busca.dezenas) : undefined}
          exibirCoincidencias={filtrando}
          aoEditar={setEmEdicao}
        />
      </div>
      <div className="shrink-0 border-t border-slate-200 px-4 py-2 dark:border-slate-800">
        <Paginacao
          pagina={busca.pagina}
          tamanho={consulta.data.tamanho}
          total={consulta.data.total}
          aoMudar={(pagina) => {
            aoBuscar({ ...busca, pagina });
          }}
        />
      </div>
      {emEdicao && (
        <Suspense>
          <DialogoEditarAposta
            aposta={emEdicao}
            valorApostaSimples={valorApostaSimples}
            aoFechar={() => {
              setEmEdicao(null);
            }}
          />
        </Suspense>
      )}
    </>
  );
};

const Resumo = () => {
  const { data } = useQuery(resumoApostasQuery());
  if (!data) return null;
  return <BaloesAcertos resumo={data} rotuloComAcertos="Apostas com acertos" grupo="apostas" />;
};

export const ListaApostas = (props: ListaApostasProps) => {
  const filtrando = props.busca.dezenas.length > 0;

  return (
    <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1">
      <Resumo />
      <section className="flex flex-col rounded-xl border border-slate-200 bg-white lg:min-h-0 lg:flex-1 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex shrink-0 flex-col gap-3 border-b border-slate-200 px-4 py-3 xl:flex-row xl:items-center xl:justify-between dark:border-slate-800">
          <h2 className="text-sm font-semibold">
            {filtrando
              ? `Apostas com ${descreverFaixa(props.regra, props.busca)}`
              : 'Apostas efetivadas'}
          </h2>
          <div className="xl:w-[52rem]">
            <BarraBuscaDezenas regra={props.regra} busca={props.busca} aoBuscar={props.aoBuscar} />
          </div>
        </div>
        <Resultados {...props} />
      </section>
    </div>
  );
};

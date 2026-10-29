import type { RegraJogo } from '@mega/domain';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Carregando, Falha, Vazio } from '@/components/ui/estado';
import { Paginacao } from '@/components/ui/paginacao';
import { formatarInteiro } from '@/lib/formatadores';
import type { Pagina } from '@/types/api';
import { buscarConcursosQuery, listarConcursosQuery, type ParametrosBusca } from '../api/consultas';
import type { ResumoConcurso } from '../types';
import { BarraBusca } from './barra-busca';
import { TabelaConcursos } from './tabela-concursos';

interface SorteiosJogoProps {
  readonly regra: RegraJogo;
  readonly busca: ParametrosBusca;
  readonly aoBuscar: (busca: ParametrosBusca) => void;
}

interface ConteudoProps<T extends ResumoConcurso> extends SorteiosJogoProps {
  readonly pagina: Pagina<T>;
  readonly carregandoProxima: boolean;
  readonly tabela: ReactNode;
}

const AreaRolavel = ({ children }: { readonly children: ReactNode }) => (
  <div className="lg:min-h-0 lg:flex-1 lg:overflow-auto">{children}</div>
);

const Conteudo = <T extends ResumoConcurso>(props: ConteudoProps<T>) => (
  <>
    <AreaRolavel>
      <div className={props.carregandoProxima ? 'opacity-60' : ''}>{props.tabela}</div>
    </AreaRolavel>
    <div className="shrink-0 border-t border-slate-200 px-4 py-2 dark:border-slate-800">
      <Paginacao
        pagina={props.busca.pagina}
        tamanho={props.pagina.tamanho}
        total={props.pagina.total}
        aoMudar={(pagina) => {
          props.aoBuscar({ ...props.busca, pagina });
        }}
      />
    </div>
  </>
);

const Estado = ({ children }: { readonly children: ReactNode }) => (
  <AreaRolavel>
    <div className="p-4">{children}</div>
  </AreaRolavel>
);

const ListaCompleta = (props: SorteiosJogoProps) => {
  const consulta = useQuery(listarConcursosQuery(props.regra.codigo, props.busca.pagina));

  if (consulta.isPending) return <Estado>{<Carregando mensagem="Carregando sorteios…" />}</Estado>;
  if (consulta.isError) return <Estado>{<Falha erro={consulta.error} />}</Estado>;
  if (consulta.data.itens.length === 0) {
    return <Estado>{<Vazio>A sincronização inicial ainda não importou concursos.</Vazio>}</Estado>;
  }

  return (
    <Conteudo
      {...props}
      pagina={consulta.data}
      carregandoProxima={consulta.isPlaceholderData}
      tabela={<TabelaConcursos regra={props.regra} concursos={consulta.data.itens} />}
    />
  );
};

const ResultadoBusca = (props: SorteiosJogoProps) => {
  const consulta = useQuery(buscarConcursosQuery(props.regra.codigo, props.busca));

  if (consulta.isPending) return <Estado>{<Carregando mensagem="Buscando concursos…" />}</Estado>;
  if (consulta.isError) return <Estado>{<Falha erro={consulta.error} />}</Estado>;
  if (consulta.data.itens.length === 0) {
    return (
      <Estado>
        <Vazio>Nenhum concurso com pelo menos {props.busca.minimoAcertos} dessas dezenas.</Vazio>
      </Estado>
    );
  }

  return (
    <Conteudo
      {...props}
      pagina={consulta.data}
      carregandoProxima={consulta.isPlaceholderData}
      tabela={
        <TabelaConcursos
          regra={props.regra}
          concursos={consulta.data.itens}
          destacadas={new Set(props.busca.dezenas)}
          colunaExtra={{ titulo: 'Acertos', valor: (concurso) => String(concurso.acertos) }}
        />
      }
    />
  );
};

export const SorteiosJogo = (props: SorteiosJogoProps) => {
  const buscaAtiva = props.busca.dezenas.length > 0;

  return (
    <section className="flex flex-col rounded-xl border border-slate-200 bg-white lg:min-h-0 lg:flex-1 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex shrink-0 flex-col gap-3 border-b border-slate-200 px-4 py-3 xl:flex-row xl:items-center xl:justify-between dark:border-slate-800">
        <h2 className="text-sm font-semibold">
          {buscaAtiva
            ? `Concursos com ${formatarInteiro(props.busca.minimoAcertos)}+ acertos`
            : 'Histórico de sorteios'}
        </h2>
        <div className="xl:w-[42rem]">
          <BarraBusca
            key={props.busca.dezenas.join(',')}
            regra={props.regra}
            busca={props.busca}
            aoBuscar={props.aoBuscar}
          />
        </div>
      </div>
      {buscaAtiva ? <ResultadoBusca {...props} /> : <ListaCompleta {...props} />}
    </section>
  );
};

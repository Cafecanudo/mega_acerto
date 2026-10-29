import type { RegraJogo } from '@mega/domain';
import { useQuery } from '@tanstack/react-query';
import { Carregando, Falha, Vazio } from '@/components/ui/estado';
import { Paginacao } from '@/components/ui/paginacao';
import { formatarInteiro } from '@/lib/formatadores';
import { buscarConcursosQuery, listarConcursosQuery, type ParametrosBusca } from '../api/consultas';
import { BarraBusca } from './barra-busca';
import { TabelaConcursos } from './tabela-concursos';

interface SorteiosJogoProps {
  readonly regra: RegraJogo;
  readonly busca: ParametrosBusca;
  readonly aoBuscar: (busca: ParametrosBusca) => void;
}

type PropsResultado = SorteiosJogoProps;

const mudarPagina = (props: PropsResultado) => (pagina: number) => {
  props.aoBuscar({ ...props.busca, pagina });
};

const ListaCompleta = (props: PropsResultado) => {
  const consulta = useQuery(listarConcursosQuery(props.regra.codigo, props.busca.pagina));

  if (consulta.isPending) return <Carregando mensagem="Carregando sorteios…" />;
  if (consulta.isError) return <Falha erro={consulta.error} />;
  if (consulta.data.itens.length === 0) {
    return <Vazio>A sincronização inicial ainda não importou concursos.</Vazio>;
  }

  return (
    <div className={`flex flex-col gap-4 ${consulta.isPlaceholderData ? 'opacity-60' : ''}`}>
      <TabelaConcursos regra={props.regra} concursos={consulta.data.itens} />
      <Paginacao
        pagina={props.busca.pagina}
        tamanho={consulta.data.tamanho}
        total={consulta.data.total}
        aoMudar={mudarPagina(props)}
      />
    </div>
  );
};

const ResultadoBusca = (props: PropsResultado) => {
  const consulta = useQuery(buscarConcursosQuery(props.regra.codigo, props.busca));
  const destacadas = new Set(props.busca.dezenas);

  if (consulta.isPending) return <Carregando mensagem="Buscando concursos…" />;
  if (consulta.isError) return <Falha erro={consulta.error} />;
  if (consulta.data.itens.length === 0) {
    return (
      <Vazio>Nenhum concurso com pelo menos {props.busca.minimoAcertos} dessas dezenas.</Vazio>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${consulta.isPlaceholderData ? 'opacity-60' : ''}`}>
      <TabelaConcursos
        regra={props.regra}
        concursos={consulta.data.itens}
        destacadas={destacadas}
        colunaExtra={{ titulo: 'Acertos', valor: (concurso) => String(concurso.acertos) }}
      />
      <Paginacao
        pagina={props.busca.pagina}
        tamanho={consulta.data.tamanho}
        total={consulta.data.total}
        aoMudar={mudarPagina(props)}
      />
    </div>
  );
};

export const SorteiosJogo = (props: SorteiosJogoProps) => {
  const buscaAtiva = props.busca.dezenas.length > 0;

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <h2 className="text-lg font-semibold">
          {buscaAtiva
            ? `Concursos com ${formatarInteiro(props.busca.minimoAcertos)}+ acertos`
            : 'Todos os sorteios'}
        </h2>
        <div className="xl:w-[44rem]">
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

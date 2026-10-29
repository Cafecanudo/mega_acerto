import { useNavigate } from 'react-router';
import { paths } from '@/config/paths';
import { ListaAnalises } from '@/features/analises/components/lista-analises';
import { NovaAnalise } from '@/features/analises/components/nova-analise';
import { useContextoJogo } from './contexto-jogo';

const Analises = () => {
  const { regra } = useContextoJogo();
  const navegar = useNavigate();

  return (
    <div className="grid gap-3 lg:min-h-0 lg:flex-1 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="xl:self-start">
        <NovaAnalise
          jogo={regra.codigo}
          aoSolicitar={(solicitada) => {
            void navegar(paths.analise(regra.codigo, solicitada.id));
          }}
        />
      </div>
      <section className="flex flex-col rounded-xl border border-slate-200 bg-white lg:min-h-0 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="shrink-0 border-b border-slate-200 px-4 py-3 text-sm font-semibold dark:border-slate-800">
          Análises executadas
        </h2>
        <div className="overflow-x-auto lg:min-h-0 lg:flex-1 lg:overflow-auto">
          <ListaAnalises jogo={regra.codigo} />
        </div>
      </section>
    </div>
  );
};

export default Analises;

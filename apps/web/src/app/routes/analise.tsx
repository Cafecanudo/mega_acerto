import { IconArrowLeft, IconChartHistogram } from '@tabler/icons-react';
import { Link, useParams } from 'react-router';
import { paths } from '@/config/paths';
import { ResultadoAnalise } from '@/features/analises/components/resultado-analise';
import NaoEncontrado from './nao-encontrado';
import { PaginaConta } from './pagina-conta';

const Analise = () => {
  const id = Number.parseInt(useParams().id ?? '', 10);

  if (!Number.isInteger(id) || id < 1) return <NaoEncontrado />;

  return (
    <PaginaConta
      titulo="Análises"
      descricao="Resultado da análise."
      icone={
        <IconChartHistogram aria-hidden size="1.5rem" stroke={1.75} className="text-slate-500" />
      }
    >
      <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-auto">
        <Link
          to={paths.analises}
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-300"
        >
          <IconArrowLeft aria-hidden size="1rem" />
          Voltar para análises
        </Link>
        <ResultadoAnalise key={id} id={id} />
      </div>
    </PaginaConta>
  );
};

export default Analise;

import { IconArrowLeft } from '@tabler/icons-react';
import { Link, useParams } from 'react-router';
import { paths } from '@/config/paths';
import { ResultadoAnalise } from '@/features/analises/components/resultado-analise';
import { useContextoJogo } from './contexto-jogo';
import NaoEncontrado from './nao-encontrado';

const Analise = () => {
  const { regra } = useContextoJogo();
  const id = Number.parseInt(useParams().id ?? '', 10);

  if (!Number.isInteger(id) || id < 1) return <NaoEncontrado />;

  return (
    <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-auto">
      <Link
        to={paths.analises(regra.codigo)}
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 hover:text-jogo dark:text-slate-300"
      >
        <IconArrowLeft aria-hidden size="1rem" />
        Voltar para análises
      </Link>
      <ResultadoAnalise key={id} regra={regra} id={id} />
    </div>
  );
};

export default Analise;

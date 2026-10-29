import { IconArrowLeft } from '@tabler/icons-react';
import { Link, useLocation, useParams } from 'react-router';
import { paths } from '@/config/paths';
import { DetalheConcurso } from '@/features/concursos/components/detalhe-concurso';
import { lerRetorno } from '@/lib/retorno';
import { useContextoJogo } from './contexto-jogo';
import NaoEncontrado from './nao-encontrado';

const Concurso = () => {
  const { regra, apresentacao } = useContextoJogo();
  const numero = Number.parseInt(useParams().numero ?? '', 10);
  const voltarPara = lerRetorno(useLocation().state);

  if (!Number.isInteger(numero) || numero < 1) return <NaoEncontrado />;

  return (
    <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-auto">
      <Link
        to={voltarPara ?? paths.jogo(regra.codigo)}
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 hover:text-jogo dark:text-slate-300"
      >
        <IconArrowLeft aria-hidden size="1rem" />
        {voltarPara ? 'Voltar para a pesquisa' : `Voltar para ${apresentacao.nome}`}
      </Link>
      <DetalheConcurso key={numero} regra={regra} numero={numero} />
    </div>
  );
};

export default Concurso;

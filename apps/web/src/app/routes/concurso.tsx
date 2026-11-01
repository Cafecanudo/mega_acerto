import { IconArrowLeft } from '@tabler/icons-react';
import { Link, useParams } from 'react-router';
import { paths } from '@/config/paths';
import { BotaoAnalisarSorteio } from '@/features/analises/components/botao-analisar-sorteio';
import { DetalheConcurso } from '@/features/concursos/components/detalhe-concurso';
import { useContextoJogo } from './contexto-jogo';
import NaoEncontrado from './nao-encontrado';

const Concurso = () => {
  const { regra, apresentacao } = useContextoJogo();
  const numero = Number.parseInt(useParams().numero ?? '', 10);

  if (!Number.isInteger(numero) || numero < 1) return <NaoEncontrado />;

  return (
    <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-auto">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Link
          to={paths.jogo(regra.codigo)}
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 hover:text-jogo dark:text-slate-300"
        >
          <IconArrowLeft aria-hidden size="1rem" />
          Voltar para {apresentacao.nome}
        </Link>
        <BotaoAnalisarSorteio key={numero} jogo={regra.codigo} concurso={numero} />
      </div>
      <DetalheConcurso key={numero} regra={regra} numero={numero} />
    </div>
  );
};

export default Concurso;

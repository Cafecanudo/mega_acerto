import { useParams } from 'react-router';
import { DetalheConcurso } from '@/features/concursos/components/detalhe-concurso';
import { useRegraJogo } from './contexto-jogo';
import NaoEncontrado from './nao-encontrado';

const Concurso = () => {
  const regra = useRegraJogo();
  const numero = Number.parseInt(useParams().numero ?? '', 10);

  if (!Number.isInteger(numero) || numero < 1) return <NaoEncontrado />;

  return <DetalheConcurso key={numero} regra={regra} numero={numero} />;
};

export default Concurso;

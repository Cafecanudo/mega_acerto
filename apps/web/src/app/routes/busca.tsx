import { useSearchParams } from 'react-router';
import type { ParametrosBusca } from '@/features/concursos/api/consultas';
import { BuscaConcursos } from '@/features/concursos/components/busca-concursos';
import { useRegraJogo } from './contexto-jogo';

const lerInteiro = (valor: string | null, padrao: number): number => {
  const numero = Number.parseInt(valor ?? '', 10);
  return Number.isInteger(numero) && numero > 0 ? numero : padrao;
};

const lerBusca = (parametros: URLSearchParams): ParametrosBusca => {
  const dezenas = (parametros.get('dezenas') ?? '')
    .split(',')
    .map((dezena) => Number.parseInt(dezena, 10))
    .filter((dezena) => Number.isInteger(dezena));

  return {
    dezenas,
    minimoAcertos: lerInteiro(parametros.get('minimo'), dezenas.length),
    pagina: lerInteiro(parametros.get('pagina'), 1),
  };
};

const Busca = () => {
  const regra = useRegraJogo();
  const [parametros, setParametros] = useSearchParams();
  const busca = lerBusca(parametros);

  return (
    <BuscaConcursos
      key={parametros.get('dezenas') ?? ''}
      regra={regra}
      busca={busca}
      aoBuscar={(nova) => {
        setParametros({
          dezenas: nova.dezenas.join(','),
          minimo: String(nova.minimoAcertos),
          pagina: String(nova.pagina),
        });
      }}
    />
  );
};

export default Busca;

import { useSearchParams } from 'react-router';
import type { ParametrosBusca } from '@/features/concursos/api/consultas';
import { DestaqueUltimoConcurso } from '@/features/concursos/components/destaque-ultimo-concurso';
import { SorteiosJogo } from '@/features/concursos/components/sorteios-jogo';
import { useContextoJogo } from './contexto-jogo';

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
    incluirCombinacoes: parametros.get('combinacoes') === '1',
    pagina: lerInteiro(parametros.get('pagina'), 1),
  };
};

const paraParametros = (busca: ParametrosBusca): Record<string, string> => {
  const pagina = { pagina: String(busca.pagina) };
  if (busca.dezenas.length === 0) return pagina;
  return {
    ...pagina,
    dezenas: busca.dezenas.join(','),
    ...(busca.incluirCombinacoes ? { combinacoes: '1' } : {}),
  };
};

const Jogo = () => {
  const { regra } = useContextoJogo();
  const [parametros, setParametros] = useSearchParams();

  return (
    <>
      <DestaqueUltimoConcurso regra={regra} />
      <SorteiosJogo
        regra={regra}
        busca={lerBusca(parametros)}
        aoBuscar={(busca) => {
          setParametros(paraParametros(busca));
        }}
      />
    </>
  );
};

export default Jogo;

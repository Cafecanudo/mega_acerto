import { useSearchParams } from 'react-router';
import { HistoricoConcursos } from '@/features/concursos/components/historico-concursos';
import { useRegraJogo } from './contexto-jogo';

const lerPagina = (valor: string | null): number => {
  const pagina = Number.parseInt(valor ?? '', 10);
  return Number.isInteger(pagina) && pagina > 0 ? pagina : 1;
};

const Historico = () => {
  const regra = useRegraJogo();
  const [parametros, setParametros] = useSearchParams();

  return (
    <HistoricoConcursos
      regra={regra}
      pagina={lerPagina(parametros.get('pagina'))}
      aoMudarPagina={(pagina) => {
        setParametros({ pagina: String(pagina) });
      }}
    />
  );
};

export default Historico;

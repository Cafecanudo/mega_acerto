import { useSearchParams } from 'react-router';
import { DestaqueUltimoConcurso } from '@/features/concursos/components/destaque-ultimo-concurso';
import { SorteiosJogo } from '@/features/concursos/components/sorteios-jogo';
import { buscaParaUrl, lerBuscaDaUrl } from '@/lib/busca-dezenas';
import { useContextoJogo } from './contexto-jogo';

const Jogo = () => {
  const { regra } = useContextoJogo();
  const [parametros, setParametros] = useSearchParams();

  return (
    <>
      <DestaqueUltimoConcurso regra={regra} />
      <SorteiosJogo
        regra={regra}
        busca={lerBuscaDaUrl(parametros)}
        aoBuscar={(busca) => {
          setParametros(buscaParaUrl(busca), { replace: true });
        }}
      />
    </>
  );
};

export default Jogo;

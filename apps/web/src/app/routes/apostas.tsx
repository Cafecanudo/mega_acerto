import { obterRegraJogo } from '@mega/domain';
import { IconTicket } from '@tabler/icons-react';
import { useSearchParams } from 'react-router';
import { ListaApostas } from '@/features/apostas/components/lista-apostas';
import { buscaParaUrl, lerBuscaDaUrl } from '@/lib/busca-dezenas';
import { PaginaConta } from './pagina-conta';

const regraFiltro = obterRegraJogo('megasena');

const Apostas = () => {
  const [parametros, setParametros] = useSearchParams();

  return (
    <PaginaConta
      titulo="Apostas"
      descricao="Apostas efetivadas, conferidas contra o concurso em que foram feitas."
      icone={<IconTicket aria-hidden size="1.5rem" stroke={1.75} className="text-slate-500" />}
    >
      <ListaApostas
        regra={regraFiltro}
        busca={lerBuscaDaUrl(parametros)}
        aoBuscar={(busca) => {
          setParametros(buscaParaUrl(busca), { replace: true });
        }}
      />
    </PaginaConta>
  );
};

export default Apostas;

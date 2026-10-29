import { IconTicket } from '@tabler/icons-react';
import { PaginaApostas } from '@/features/apostas/components/pagina-apostas';
import { PaginaConta } from './pagina-conta';

const Apostas = () => (
  <PaginaConta
    titulo="Apostas"
    descricao="Suas apostas de qualquer jogo, conferidas contra o último concurso e o histórico."
    icone={<IconTicket aria-hidden size="1.5rem" stroke={1.75} className="text-slate-500" />}
  >
    <PaginaApostas somenteFavoritas={false} />
  </PaginaConta>
);

export default Apostas;

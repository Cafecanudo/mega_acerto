import { IconChecklist } from '@tabler/icons-react';
import { Vazio } from '@/components/ui/estado';
import { PaginaConta } from './pagina-conta';

const ConferirApostas = () => (
  <PaginaConta
    titulo="Conferir Apostas"
    descricao="Em breve."
    icone={<IconChecklist aria-hidden size="1.5rem" stroke={1.75} className="text-slate-500" />}
  >
    <Vazio>Esta tela ainda será definida.</Vazio>
  </PaginaConta>
);

export default ConferirApostas;

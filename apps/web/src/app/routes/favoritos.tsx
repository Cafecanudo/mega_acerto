import { IconStar } from '@tabler/icons-react';
import { PaginaApostas } from '@/features/apostas/components/pagina-apostas';
import { PaginaConta } from './pagina-conta';
import { PainelDezenasAposta } from './painel-dezenas-aposta';

const Favoritos = () => (
  <PaginaConta
    titulo="Favoritos"
    descricao="Apostas marcadas com estrela, de qualquer jogo."
    icone={<IconStar aria-hidden size="1.5rem" stroke={1.75} className="text-amber-500" />}
  >
    <PaginaApostas
      somenteFavoritas
      painelDezenas={(selecao) => <PainelDezenasAposta selecao={selecao} />}
    />
  </PaginaConta>
);

export default Favoritos;

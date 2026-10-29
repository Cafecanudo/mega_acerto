import { IconStar } from '@tabler/icons-react';
import { PaginaFavoritos } from '@/features/favoritos/components/pagina-favoritos';
import { PaginaConta } from './pagina-conta';
import { PainelDezenasAposta } from './painel-dezenas-aposta';

const Favoritos = () => (
  <PaginaConta
    titulo="Favoritos"
    descricao="Jogos que você monta para usar quando quiser apostar."
    icone={<IconStar aria-hidden size="1.5rem" stroke={1.75} className="text-amber-500" />}
  >
    <PaginaFavoritos painelDezenas={(selecao) => <PainelDezenasAposta selecao={selecao} />} />
  </PaginaConta>
);

export default Favoritos;

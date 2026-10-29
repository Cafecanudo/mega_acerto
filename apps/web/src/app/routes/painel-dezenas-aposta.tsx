import { isCodigoJogo, obterApresentacaoJogo, obterRegraJogo } from '@mega/domain';
import type { SelecaoDezenas } from '@/features/favoritos/components/formulario-favorito';
import { ConcursosComDezenas } from '@/features/concursos/components/concursos-com-dezenas';
import { estiloCorJogo } from '@/lib/cor-jogo';

export const PainelDezenasAposta = ({ selecao }: { readonly selecao: SelecaoDezenas }) => {
  const apresentacao = obterApresentacaoJogo(selecao.jogo);
  if (!apresentacao || !isCodigoJogo(selecao.jogo)) return null;

  return (
    <div style={estiloCorJogo(apresentacao)} className="flex flex-col lg:min-h-0 lg:flex-1">
      <ConcursosComDezenas regra={obterRegraJogo(selecao.jogo)} dezenas={selecao.dezenas} />
    </div>
  );
};

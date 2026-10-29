import { IconTicket } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { paths } from '@/config/paths';
import {
  DialogoApostar,
  type SelecaoParaAposta,
} from '@/features/apostas/components/dialogo-apostar';
import { listarValoresQuery } from '@/features/configuracoes/api/valores';
import { FavoritosParaAposta } from '@/features/favoritos/components/favoritos-para-aposta';
import { ApostarContexto, useAbrirApostar } from './apostar-contexto';
import { PainelDezenasAposta } from './routes/painel-dezenas-aposta';

interface EstadoApostar {
  readonly aberto: boolean;
  readonly inicial: SelecaoParaAposta | null;
}

export const ProvedorApostar = ({ children }: { readonly children: ReactNode }) => {
  const [estado, setEstado] = useState<EstadoApostar>({ aberto: false, inicial: null });
  const navegar = useNavigate();
  const valores = useQuery({ ...listarValoresQuery(), enabled: estado.aberto });

  const fechar = () => {
    setEstado({ aberto: false, inicial: null });
  };

  return (
    <ApostarContexto
      value={(inicial) => {
        setEstado({ aberto: true, inicial: inicial ?? null });
      }}
    >
      {children}
      <DialogoApostar
        aberto={estado.aberto}
        inicial={estado.inicial}
        aoFechar={fechar}
        aoEfetivar={() => {
          fechar();
          void navegar(paths.apostas);
        }}
        favoritos={(jogo, aoAdicionar) => (
          <FavoritosParaAposta jogo={jogo} aoAdicionar={aoAdicionar} />
        )}
        painelDezenas={(selecao) => <PainelDezenasAposta selecao={selecao} />}
        valorApostaSimples={(jogo) => valores.data?.get(jogo)?.valorAposta ?? null}
      />
    </ApostarContexto>
  );
};

export const BotaoApostar = () => {
  const abrir = useAbrirApostar();

  return (
    <button
      type="button"
      onClick={() => {
        abrir();
      }}
      className="mx-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
    >
      <IconTicket aria-hidden size="1.125rem" stroke={1.75} />
      Apostar
    </button>
  );
};

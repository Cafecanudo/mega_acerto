import { IconTicket } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { paths } from '@/config/paths';
import { DialogoApostar } from '@/features/apostas/components/dialogo-apostar';
import { listarValoresQuery } from '@/features/configuracoes/api/valores';
import { FavoritosParaAposta } from '@/features/favoritos/components/favoritos-para-aposta';
import { PainelDezenasAposta } from './routes/painel-dezenas-aposta';

export const BotaoApostar = () => {
  const [aberto, setAberto] = useState(false);
  const navegar = useNavigate();
  const valores = useQuery({ ...listarValoresQuery(), enabled: aberto });

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setAberto(true);
        }}
        className="mx-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
      >
        <IconTicket aria-hidden size="1.125rem" stroke={1.75} />
        Apostar
      </button>
      <DialogoApostar
        aberto={aberto}
        aoFechar={() => {
          setAberto(false);
        }}
        aoEfetivar={() => {
          setAberto(false);
          void navegar(paths.apostas);
        }}
        favoritos={(jogo, aoAdicionar) => (
          <FavoritosParaAposta jogo={jogo} aoAdicionar={aoAdicionar} />
        )}
        painelDezenas={(selecao) => <PainelDezenasAposta selecao={selecao} />}
        valorApostaSimples={(jogo) => valores.data?.get(jogo)?.valorAposta ?? null}
      />
    </>
  );
};

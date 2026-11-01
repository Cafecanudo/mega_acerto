import {
  ESFORCO_PADRAO,
  MODELO_PADRAO,
  PARAMETROS_SORTEIO_ESPECIFICO_PADRAO,
} from '@mega/analises/catalogo';
import { IconSparkles } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { paths } from '@/config/paths';
import { useSolicitarAnalise } from '../api/analises';

interface BotaoAnalisarSorteioProps {
  readonly jogo: string;
  readonly concurso: number;
}

export const BotaoAnalisarSorteio = ({ jogo, concurso }: BotaoAnalisarSorteioProps) => {
  const solicitar = useSolicitarAnalise();
  const navegar = useNavigate();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={solicitar.isPending}
        title="Executa a análise Sorteio específico com o Claude (consome cota)"
        onClick={() => {
          solicitar.mutate(
            {
              jogo,
              tipo: 'sorteio-especifico',
              modelo: MODELO_PADRAO,
              esforco: ESFORCO_PADRAO,
              forcar: false,
              parametros: { ...PARAMETROS_SORTEIO_ESPECIFICO_PADRAO, concurso },
            },
            {
              onSuccess: (solicitada) => {
                void navegar(paths.analise(solicitada.id));
              },
            },
          );
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        <IconSparkles aria-hidden size="1rem" />
        {solicitar.isPending ? 'Enviando…' : 'Analisar este sorteio'}
      </button>
      {solicitar.isError && (
        <span className="text-xs text-rose-600 dark:text-rose-400">{solicitar.error.message}</span>
      )}
    </div>
  );
};

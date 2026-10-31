import { obterTipoAnalise } from '@mega/analises/catalogo';
import { obterApresentacaoJogo } from '@mega/domain';
import { IconArrowRight } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Cartao } from '@/components/ui/cartao';
import { Carregando, Falha, Vazio } from '@/components/ui/estado';
import { paths } from '@/config/paths';
import { formatarDataHoraCurta } from '@/lib/formatadores';
import { listarAnalisesQuery } from '../api/analises';
import { SeloStatus } from './selo-status';

const QUANTIDADE_RECENTES = 3;

const ListaRecentes = () => {
  const consulta = useQuery(listarAnalisesQuery());

  if (consulta.isPending) return <Carregando mensagem="Carregando análises…" />;
  if (consulta.isError) return <Falha erro={consulta.error} />;
  if (consulta.data.length === 0) return <Vazio>Nenhuma análise executada ainda.</Vazio>;

  return (
    <ul className="-my-2 flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
      {consulta.data.slice(0, QUANTIDADE_RECENTES).map((analise) => (
        <li key={analise.id}>
          <Link
            to={paths.analise(analise.id)}
            className="-mx-2 flex flex-col gap-1 rounded-lg px-2 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
          >
            <span className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">{obterTipoAnalise(analise.tipo).nome}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {obterApresentacaoJogo(analise.jogo)?.nome ?? analise.jogo} ·{' '}
                {formatarDataHoraCurta(analise.criadoEm)}
              </span>
              <span className="ml-auto">
                <SeloStatus status={analise.status} />
              </span>
            </span>
            {(analise.resumoConclusao ?? analise.erro) && (
              <span className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                {analise.resumoConclusao ?? analise.erro}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export const AnalisesRecentes = () => (
  <Cartao
    titulo="Análises recentes"
    acoes={
      <Link
        to={paths.analises}
        className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:underline dark:text-sky-400"
      >
        Ver todas
        <IconArrowRight aria-hidden size="1rem" />
      </Link>
    }
  >
    <ListaRecentes />
  </Cartao>
);

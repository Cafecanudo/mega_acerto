import { apresentacoesJogo, type ApresentacaoJogo } from '@mega/domain';
import { IconClover } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router';
import { paths } from '@/config/paths';
import { formatarDataHoraCurta } from '@/lib/formatadores';
import { listarJogosQuery } from '../api/consultas';
import type { ResumoJogo } from '../types';

const descreverStatus = (
  apresentacao: ApresentacaoJogo,
  resumo: ResumoJogo | undefined,
): string => {
  if (apresentacao.disponibilidade === 'fonte-indisponivel') return 'Fonte indisponível';
  if (apresentacao.disponibilidade === 'em-breve') return 'Sem dados';
  if (!resumo?.ultimaSincronizacao) return 'Aguardando sincronização';

  const resultado = resumo.ultimoAcumulado ? 'Acumulou' : 'Teve ganhador';
  return `${formatarDataHoraCurta(resumo.ultimaSincronizacao)} · ${resultado}`;
};

const classeItem = ({ isActive }: { readonly isActive: boolean }) =>
  `group flex min-w-44 items-center gap-3 rounded-xl px-3 py-2.5 transition lg:min-w-0 ${
    isActive
      ? 'bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700'
      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
  }`;

export const MenuJogos = () => {
  const { data: resumos } = useQuery(listarJogosQuery());

  return (
    <ul className="flex gap-1 lg:flex-col">
      {apresentacoesJogo.map((apresentacao) => (
        <li key={apresentacao.codigo}>
          <NavLink to={paths.jogo(apresentacao.codigo)} className={classeItem}>
            <IconClover
              aria-hidden
              size={26}
              stroke={1.75}
              color={apresentacao.cor}
              className="shrink-0 dark:brightness-[1.8] dark:saturate-150"
            />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">{apresentacao.nome}</span>
              <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                {descreverStatus(apresentacao, resumos?.get(apresentacao.codigo))}
              </span>
            </span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

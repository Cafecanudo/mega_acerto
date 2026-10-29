import { apresentacoesJogo, type ApresentacaoJogo } from '@mega/domain';
import { IconClover } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { paths } from '@/config/paths';
import { formatarDataHoraCurta, formatarInteiro } from '@/lib/formatadores';
import { listarJogosQuery } from '../api/consultas';
import type { ResumoJogo } from '../types';

const descreverStatus = (
  apresentacao: ApresentacaoJogo,
  resumo: ResumoJogo | undefined,
): string => {
  if (apresentacao.disponibilidade === 'fonte-indisponivel') return 'Fonte indisponível';
  if (apresentacao.disponibilidade === 'em-breve') return 'Sem dados';
  if (!resumo?.ultimaSincronizacao) return 'Aguardando sincronização';

  return `${formatarDataHoraCurta(resumo.ultimaSincronizacao)} · ${descreverResultado(resumo)}`;
};

const descreverResultado = (resumo: ResumoJogo): string => {
  if (resumo.ultimoAcumulado || !resumo.ultimosGanhadores) return 'Acumulou';
  const quantidade = formatarInteiro(resumo.ultimosGanhadores);
  return `${quantidade} ${resumo.ultimosGanhadores === 1 ? 'ganhador' : 'ganhadores'}`;
};

const classeItem = ({ isActive }: { readonly isActive: boolean }) =>
  `group flex min-w-40 items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition lg:min-w-0 ${
    isActive
      ? 'bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700'
      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
  }`;

interface MenuJogosProps {
  readonly indicadores?: (codigoJogo: string) => ReactNode;
}

export const MenuJogos = ({ indicadores }: MenuJogosProps) => {
  const { data: resumos } = useQuery(listarJogosQuery());

  return (
    <ul className="flex gap-0.5 lg:flex-col">
      {apresentacoesJogo.map((apresentacao) => (
        <li key={apresentacao.codigo}>
          <NavLink to={paths.jogo(apresentacao.codigo)} className={classeItem}>
            <IconClover
              aria-hidden
              size="1.375rem"
              stroke={1.75}
              color={apresentacao.cor}
              className="shrink-0 dark:brightness-[1.8] dark:saturate-150"
            />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-sm font-medium">{apresentacao.nome}</span>
              <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                {descreverStatus(apresentacao, resumos?.get(apresentacao.codigo))}
              </span>
              {indicadores?.(apresentacao.codigo)}
            </span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

import { nomeEsforco, nomeModelo, obterTipoAnalise } from '@mega/analises/catalogo';
import { obterApresentacaoJogo } from '@mega/domain';
import { IconClover } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Carregando, Falha, Vazio } from '@/components/ui/estado';
import { paths } from '@/config/paths';
import { formatarDataHora, formatarDolar, formatarDuracao } from '@/lib/formatadores';
import { listarAnalisesQuery } from '../api/analises';
import { SeloStatus } from './selo-status';

const celula = 'px-4 py-2.5 align-top';
const cabecalho = 'sticky top-0 z-10 bg-white px-4 py-2 dark:bg-slate-900';

export const ListaAnalises = () => {
  const consulta = useQuery(listarAnalisesQuery());
  const navegar = useNavigate();

  if (consulta.isPending) return <Carregando mensagem="Carregando análises…" />;
  if (consulta.isError) return <Falha erro={consulta.error} />;
  if (consulta.data.length === 0) {
    return <Vazio>Nenhuma análise ainda. Escolha o jogo e o modelo e execute a primeira.</Vazio>;
  }

  return (
    <table className="w-full min-w-[720px] text-left text-sm">
      <thead className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
        <tr>
          <th className={cabecalho}>#</th>
          <th className={cabecalho}>Jogo</th>
          <th className={cabecalho}>Análise</th>
          <th className={cabecalho}>Status</th>
          <th className={cabecalho}>Conclusão</th>
          <th className={`${cabecalho} text-right`}>Duração</th>
          <th className={`${cabecalho} text-right`}>Custo equiv.</th>
        </tr>
      </thead>
      <tbody>
        {consulta.data.map((analise) => (
          <tr
            key={analise.id}
            onClick={() => {
              void navegar(paths.analise(analise.id));
            }}
            className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
          >
            <td
              className={`${celula} font-mono font-semibold text-emerald-600 dark:text-emerald-400`}
            >
              {analise.id}
            </td>
            <td className={celula}>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <IconClover
                  aria-hidden
                  size="1rem"
                  stroke={1.75}
                  color={obterApresentacaoJogo(analise.jogo)?.cor}
                  className="dark:brightness-[1.8] dark:saturate-150"
                />
                {obterApresentacaoJogo(analise.jogo)?.nome ?? analise.jogo}
              </span>
            </td>
            <td className={celula}>
              <div className="font-medium">{obterTipoAnalise(analise.tipo).nome}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {nomeModelo(analise.modelo)} · esforço {nomeEsforco(analise.esforco).toLowerCase()}{' '}
                · até o concurso {analise.ultimoConcurso} · {formatarDataHora(analise.criadoEm)}
              </div>
            </td>
            <td className={celula}>
              <SeloStatus status={analise.status} />
            </td>
            <td className={`${celula} max-w-md text-slate-600 dark:text-slate-300`}>
              <span className="line-clamp-2">{analise.resumoConclusao ?? analise.erro ?? '—'}</span>
            </td>
            <td className={`${celula} text-right tabular-nums`}>
              {formatarDuracao(analise.duracaoMs)}
            </td>
            <td className={`${celula} text-right tabular-nums`}>
              {formatarDolar(analise.custoUsd)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

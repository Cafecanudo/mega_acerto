import type { RegraJogo } from '@mega/domain';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { LinhaDezenas } from '@/components/dezenas/linha-dezenas';
import { paths } from '@/config/paths';
import { formatarInteiro, formatarMoeda } from '@/lib/formatadores';
import { apostasProximasQuery } from '../api/apostas';
import { SeloTeimosinha } from './selo-teimosinha';

interface ApostasProximoConcursoProps {
  readonly regra: RegraJogo;
  readonly concurso: number | null;
}

const LIMITE_EXIBIDAS = 5;

const Mensagem = ({ children }: { readonly children: string }) => (
  <p className="text-sm text-slate-500 dark:text-slate-400">{children}</p>
);

export const ApostasProximoConcurso = ({ regra, concurso }: ApostasProximoConcursoProps) => {
  const consulta = useQuery(apostasProximasQuery());

  if (consulta.isPending) return <Mensagem>Carregando apostas…</Mensagem>;
  if (consulta.isError) return <Mensagem>{consulta.error.message}</Mensagem>;

  const grupo = consulta.data.get(regra.codigo);
  if (grupo?.concurso !== concurso) {
    return (
      <Mensagem>
        {concurso === null
          ? 'Nenhuma aposta para o próximo concurso.'
          : `Nenhuma aposta para o concurso ${String(concurso)}.`}
      </Mensagem>
    );
  }

  const exibidas = grupo.apostas.slice(0, LIMITE_EXIBIDAS);
  const ocultas = grupo.apostas.length - exibidas.length;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        <strong className="font-semibold tabular-nums">
          {formatarInteiro(grupo.apostas.length)}{' '}
          {grupo.apostas.length === 1 ? 'aposta' : 'apostas'}
        </strong>{' '}
        · {formatarMoeda(grupo.valorTotal)}
      </p>
      <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
        {exibidas.map((aposta) => (
          <li key={aposta.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2">
            <LinhaDezenas regra={regra} dezenas={aposta.dezenas} tamanho="sm" />
            <span className="min-w-0 text-xs text-slate-500 dark:text-slate-400">
              {aposta.nome ?? `Aposta ${String(aposta.id)}`}
              <SeloTeimosinha teimosinha={aposta.teimosinha} />
            </span>
            <span className="ml-auto text-xs font-medium text-slate-600 tabular-nums dark:text-slate-300">
              {formatarMoeda(aposta.valor)}
            </span>
          </li>
        ))}
      </ul>
      {ocultas > 0 && (
        <Link to={paths.apostas} className="w-fit text-xs font-medium text-jogo hover:underline">
          Mais {formatarInteiro(ocultas)} {ocultas === 1 ? 'aposta' : 'apostas'}
        </Link>
      )}
    </div>
  );
};

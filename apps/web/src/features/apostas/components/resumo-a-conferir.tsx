import { IconArrowRight } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Cartao } from '@/components/ui/cartao';
import { Carregando, Falha } from '@/components/ui/estado';
import { paths } from '@/config/paths';
import { formatarInteiro, formatarMoeda } from '@/lib/formatadores';
import { apostasAConferirQuery, type ApostaAConferir } from '../api/conferencia';

const somarPremios = (apostas: readonly ApostaAConferir[]): number | null =>
  apostas.some((aposta) => aposta.premioTotal === null)
    ? null
    : apostas.reduce((soma, aposta) => soma + (aposta.premioTotal ?? 0), 0);

const Indicador = ({
  rotulo,
  valor,
  destaque = false,
}: {
  readonly rotulo: string;
  readonly valor: string;
  readonly destaque?: boolean;
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[0.68rem] font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
      {rotulo}
    </span>
    <span
      className={`text-lg font-semibold tabular-nums ${destaque ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
    >
      {valor}
    </span>
  </div>
);

export const ResumoAConferir = () => {
  const consulta = useQuery(apostasAConferirQuery());

  const acoes = (
    <Link
      to={paths.conferirApostas}
      className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
    >
      Conferir
      <IconArrowRight aria-hidden size="1rem" />
    </Link>
  );

  if (consulta.isPending) {
    return (
      <Cartao titulo="A conferir" acoes={acoes}>
        <Carregando />
      </Cartao>
    );
  }
  if (consulta.isError) {
    return (
      <Cartao titulo="A conferir" acoes={acoes}>
        <Falha erro={consulta.error} />
      </Cartao>
    );
  }

  const sorteadas = consulta.data.filter((aposta) => aposta.conferencia.concursoConferido);
  const premiadas = sorteadas.filter((aposta) => aposta.premios.length > 0);
  const aguardando = consulta.data.length - sorteadas.length;
  const premios = somarPremios(premiadas);

  return (
    <Cartao titulo="A conferir" acoes={acoes}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Indicador rotulo="Sorteadas" valor={formatarInteiro(sorteadas.length)} />
        <Indicador
          rotulo="Premiadas"
          valor={formatarInteiro(premiadas.length)}
          destaque={premiadas.length > 0}
        />
        <Indicador rotulo="Prêmios" valor={formatarMoeda(premios)} destaque={(premios ?? 0) > 0} />
        <Indicador rotulo="Aguardando" valor={formatarInteiro(aguardando)} />
      </div>
    </Cartao>
  );
};

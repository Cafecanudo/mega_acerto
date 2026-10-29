import { isCodigoJogo, obterApresentacaoJogo, obterRegraJogo } from '@mega/domain';
import { IconChecks, IconClover, IconConfetti, IconSquareCheck } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { LinhaDezenas } from '@/components/dezenas/linha-dezenas';
import { Carregando, Falha, Vazio } from '@/components/ui/estado';
import { estiloCorJogo } from '@/lib/cor-jogo';
import { formatarData, formatarInteiro, formatarMoeda } from '@/lib/formatadores';
import {
  apostasAConferirQuery,
  useMarcarConferidas,
  type ApostaAConferir,
} from '../api/conferencia';

const PremioAReceber = ({ aposta }: { readonly aposta: ApostaAConferir }) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
    <IconConfetti aria-hidden size="1.25rem" className="shrink-0" />
    <strong className="font-semibold">Prêmio a receber</strong>
    <span>
      {aposta.premios
        .map((premio) => `${formatarInteiro(premio.quantidade)}× ${premio.nome}`)
        .join(' · ')}
    </span>
    <span className="font-semibold tabular-nums sm:ml-auto">
      {aposta.premioTotal === null ? 'valor não divulgado' : formatarMoeda(aposta.premioTotal)}
    </span>
  </div>
);

const ItemConferencia = ({
  aposta,
  aoConferir,
  ocupado,
}: {
  readonly aposta: ApostaAConferir;
  readonly aoConferir: () => void;
  readonly ocupado: boolean;
}) => {
  const apresentacao = obterApresentacaoJogo(aposta.jogo);
  const concurso = aposta.conferencia.concursoConferido;
  if (!apresentacao || !concurso || !isCodigoJogo(aposta.jogo)) return null;
  const regra = obterRegraJogo(aposta.jogo);

  return (
    <li
      style={estiloCorJogo(apresentacao)}
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <IconClover
            aria-hidden
            size="1.25rem"
            stroke={1.75}
            color={apresentacao.cor}
            className="shrink-0 dark:brightness-[1.8] dark:saturate-150"
          />
          <div className="min-w-0">
            <p className="truncate font-medium">
              <span className="font-mono text-jogo">#{aposta.id}</span>{' '}
              {aposta.nome ?? apresentacao.nome}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {apresentacao.nome} · concurso {concurso.numero} · {formatarData(concurso.data)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tabular-nums">
            {concurso.acertos} {concurso.acertos === 1 ? 'acerto' : 'acertos'}
          </span>
          <button
            type="button"
            disabled={ocupado}
            onClick={aoConferir}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <IconSquareCheck aria-hidden size="1rem" />
            Conferido
          </button>
        </div>
      </div>
      <LinhaDezenas
        regra={regra}
        dezenas={aposta.dezenas}
        acertadas={new Set(concurso.dezenasAcertadas)}
        tamanho="sm"
      />
      {aposta.premios.length > 0 && <PremioAReceber aposta={aposta} />}
    </li>
  );
};

export const ListaConferencia = () => {
  const consulta = useQuery(apostasAConferirQuery());
  const marcar = useMarcarConferidas();

  if (consulta.isPending) return <Carregando mensagem="Carregando apostas…" />;
  if (consulta.isError) return <Falha erro={consulta.error} />;

  const apostas = consulta.data;
  const premiadas = apostas.filter((aposta) => aposta.premios.length > 0);
  const totalPremios = premiadas.reduce((soma, aposta) => soma + (aposta.premioTotal ?? 0), 0);

  return (
    <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {apostas.length === 0
            ? 'Nenhuma aposta para conferir.'
            : `${formatarInteiro(apostas.length)} ${apostas.length === 1 ? 'aposta sorteada' : 'apostas sorteadas'} para conferir`}
          {premiadas.length > 0 && (
            <strong className="ml-2 font-semibold text-emerald-700 dark:text-emerald-300">
              {premiadas.length} com prêmio · {formatarMoeda(totalPremios)}
            </strong>
          )}
        </p>
        <div className="flex items-center gap-3">
          {marcar.isError && (
            <span className="text-sm text-rose-600 dark:text-rose-400">{marcar.error.message}</span>
          )}
          <button
            type="button"
            disabled={apostas.length === 0 || marcar.isPending}
            onClick={() => {
              marcar.mutate(apostas.map((aposta) => aposta.id));
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconChecks aria-hidden size="1rem" />
            Todos conferidos
          </button>
        </div>
      </div>
      <div className="lg:min-h-0 lg:flex-1 lg:overflow-auto">
        {apostas.length === 0 ? (
          <Vazio>
            Quando um concurso em que você apostou for sorteado, as apostas aparecem aqui.
          </Vazio>
        ) : (
          <ul className="flex flex-col gap-3">
            {apostas.map((aposta) => (
              <ItemConferencia
                key={aposta.id}
                aposta={aposta}
                ocupado={marcar.isPending}
                aoConferir={() => {
                  marcar.mutate([aposta.id]);
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

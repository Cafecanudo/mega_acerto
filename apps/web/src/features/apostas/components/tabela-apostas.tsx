import { formatarDezena, isCodigoJogo, obterApresentacaoJogo, obterRegraJogo } from '@mega/domain';
import { IconClover } from '@tabler/icons-react';
import { LinhaDezenas } from '@/components/dezenas/linha-dezenas';
import { estiloCorJogo } from '@/lib/cor-jogo';
import { formatarDataHora, formatarInteiro, formatarMoeda } from '@/lib/formatadores';
import type { Aposta } from '../types';

interface TabelaApostasProps {
  readonly apostas: readonly Aposta[];
  readonly destacadas?: ReadonlySet<number>;
  readonly exibirCoincidencias: boolean;
}

const celula = 'px-4 py-2 align-middle';
const cabecalho = 'sticky top-0 z-10 bg-white px-4 py-2 dark:bg-slate-900';

const Resultado = ({ aposta }: { readonly aposta: Aposta }) => {
  const concurso = aposta.conferencia.concursoConferido;
  if (!concurso) {
    return (
      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800 dark:bg-sky-500/15 dark:text-sky-300">
        Aguardando sorteio
      </span>
    );
  }
  if (!isCodigoJogo(aposta.jogo)) return null;
  const regra = obterRegraJogo(aposta.jogo);

  return (
    <span className="flex flex-col">
      <strong className="font-semibold tabular-nums">
        {concurso.acertos} {concurso.acertos === 1 ? 'acerto' : 'acertos'}
      </strong>
      {concurso.acertos > 0 && (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {concurso.dezenasAcertadas.map((dezena) => formatarDezena(regra, dezena)).join(' ')}
        </span>
      )}
    </span>
  );
};

const Historico = ({ aposta }: { readonly aposta: Aposta }) => (
  <span className="flex flex-wrap gap-1 text-xs">
    {aposta.conferencia.historico.map((faixa) => (
      <span
        key={faixa.acertos}
        className={`rounded-full px-2 py-0.5 font-medium tabular-nums ${
          faixa.concursos > 0
            ? 'bg-jogo/15 text-slate-900 dark:text-slate-100'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
        }`}
      >
        {faixa.nome} {formatarInteiro(faixa.concursos)}
      </span>
    ))}
  </span>
);

export const TabelaApostas = ({ apostas, destacadas, exibirCoincidencias }: TabelaApostasProps) => (
  <div className="overflow-x-auto lg:overflow-visible">
    <table className="w-full min-w-[900px] text-left text-sm">
      <thead className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
        <tr className="border-b border-slate-200 dark:border-slate-800">
          <th className={cabecalho}>#</th>
          <th className={cabecalho}>Aposta</th>
          <th className={cabecalho}>Dezenas</th>
          {exibirCoincidencias && <th className={cabecalho}>Coincidências</th>}
          <th className={cabecalho}>Concurso</th>
          <th className={cabecalho}>Valor</th>
          <th className={cabecalho}>Resultado</th>
          <th className={cabecalho}>No histórico</th>
        </tr>
      </thead>
      <tbody>
        {apostas.map((aposta) => {
          const apresentacao = obterApresentacaoJogo(aposta.jogo);
          if (!apresentacao || !isCodigoJogo(aposta.jogo)) return null;
          const regra = obterRegraJogo(aposta.jogo);

          return (
            <tr
              key={aposta.id}
              style={estiloCorJogo(apresentacao)}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              <td className={`${celula} font-mono font-semibold text-jogo`}>{aposta.id}</td>
              <td className={celula}>
                <div className="flex items-center gap-2">
                  <IconClover
                    aria-hidden
                    size="1.125rem"
                    stroke={1.75}
                    color={apresentacao.cor}
                    className="shrink-0 dark:brightness-[1.8] dark:saturate-150"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {aposta.nome ?? apresentacao.nome}
                      {aposta.favoritoId !== null && (
                        <span className="ml-1 text-xs font-normal text-amber-600 dark:text-amber-400">
                          · favorito #{aposta.favoritoId}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatarDataHora(aposta.criadaEm)}
                    </p>
                  </div>
                </div>
              </td>
              <td className={celula}>
                <LinhaDezenas
                  regra={regra}
                  dezenas={aposta.dezenas}
                  destacadas={destacadas}
                  tamanho="sm"
                />
              </td>
              {exibirCoincidencias && (
                <td className={`${celula} font-semibold tabular-nums`}>
                  {aposta.coincidencias ?? '—'}
                </td>
              )}
              <td className={`${celula} font-mono tabular-nums`}>{aposta.concurso ?? 'último'}</td>
              <td className={`${celula} whitespace-nowrap tabular-nums`}>
                {formatarMoeda(aposta.valor)}
              </td>
              <td className={celula}>
                <Resultado aposta={aposta} />
              </td>
              <td className={celula}>
                <Historico aposta={aposta} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

import { formatarDezena, type RegraJogo } from '@mega/domain';
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
} from '@tabler/icons-react';
import { useState } from 'react';
import { formatarInteiro } from '@/lib/formatadores';
import {
  totalBolas,
  type AnimacaoSorteio,
  type EstadoAnimacao,
} from '../hooks/use-sorteio-animado';
import type { ReferenciasSimulacao } from '../types';
import { conferirDezenas, marcacaoDaDezena } from '../utils';
import { BolaSorteada } from './bola-sorteada';
import { GloboSorteio } from './globo-sorteio';
import { SeloCoincidencia } from './selo-coincidencia';

interface PainelAoVivoProps {
  readonly regra: RegraJogo;
  readonly referencias: ReferenciasSimulacao;
  readonly animacao: AnimacaoSorteio;
  readonly intervaloMs: number;
  readonly ateGanhar: boolean;
  readonly aoMudarIntervalo: (intervaloMs: number) => void;
  readonly aoIniciar: (quantidade: number) => void;
  readonly aoPausar: () => void;
  readonly aoContinuar: () => void;
  readonly aoParar: () => void;
}

const LIMITE_AO_VIVO = 100;
const VELOCIDADES = [
  { rotulo: '1 bola por segundo', intervaloMs: 1000 },
  { rotulo: '2 bolas por segundo', intervaloMs: 500 },
  { rotulo: '4 bolas por segundo', intervaloMs: 250 },
  { rotulo: 'Turbo, 20 bolas por segundo', intervaloMs: 50 },
] as const;

const classeEntrada =
  'rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950';
const classeBotao =
  'inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40';

const limitarQuantidade = (valor: number): number =>
  Math.min(Math.max(Math.trunc(valor) || 1, 1), LIMITE_AO_VIVO);

const reveladasPorLinha = (estado: EstadoAnimacao): (readonly number[])[] => {
  let restantes = estado.revelados;
  return (estado.sorteio ?? []).map((dezenas) => {
    const quantidade = Math.min(restantes, dezenas.length);
    restantes -= quantidade;
    return dezenas.slice(0, quantidade);
  });
};

const descreverStatus = (estado: EstadoAnimacao): string => {
  if (!estado.sorteio) return 'Pronto para sortear';
  const bolas = totalBolas(estado.sorteio);
  const bola = `bola ${String(Math.min(estado.revelados, bolas))}/${String(bolas)}`;
  const sorteio = Number.isFinite(estado.total)
    ? `Sorteio ${formatarInteiro(Math.min(estado.realizados + 1, estado.total))} de ${formatarInteiro(estado.total)}`
    : 'Sorteando até ganhar';
  const andamento = `${sorteio} · ${bola}`;
  if (estado.status === 'pausado') return `${andamento} · pausado`;
  if (estado.status === 'parado') return `${andamento} · encerrado`;
  return andamento;
};

export const PainelAoVivo = ({
  regra,
  referencias,
  animacao,
  intervaloMs,
  ateGanhar,
  aoMudarIntervalo,
  aoIniciar,
  aoPausar,
  aoContinuar,
  aoParar,
}: PainelAoVivoProps) => {
  const [quantidade, setQuantidade] = useState(10);
  const { estado } = animacao;

  const linhas = reveladasPorLinha(estado);
  const linhaIncompleta = linhas.findIndex(
    (reveladas, indice) => reveladas.length < (estado.sorteio?.[indice]?.length ?? 0),
  );
  const indiceLinhaAtual =
    linhaIncompleta === -1 ? Math.max(0, linhas.length - 1) : linhaIncompleta;
  const sorteioExibido =
    estado.sorteio ?? Array.from({ length: regra.sorteiosPorConcurso }, () => []);
  const ultimaBola = linhas.flat().at(-1);
  const emAndamento = estado.status !== 'parado';

  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 dark:border-slate-800">
      <div className="flex flex-wrap items-end gap-2">
        {!ateGanhar && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Sorteios (até {LIMITE_AO_VIVO})
            </span>
            <input
              type="number"
              min={1}
              max={LIMITE_AO_VIVO}
              value={quantidade}
              disabled={emAndamento}
              onChange={(evento) => {
                setQuantidade(limitarQuantidade(Number(evento.target.value)));
              }}
              className={`w-24 tabular-nums ${classeEntrada}`}
            />
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Velocidade</span>
          <select
            value={intervaloMs}
            onChange={(evento) => {
              aoMudarIntervalo(Number(evento.target.value));
            }}
            className={classeEntrada}
          >
            {VELOCIDADES.map((velocidade) => (
              <option key={velocidade.intervaloMs} value={velocidade.intervaloMs}>
                {velocidade.rotulo}
              </option>
            ))}
          </select>
        </label>
        {estado.status === 'parado' && (
          <button
            type="button"
            onClick={() => {
              aoIniciar(quantidade);
            }}
            className={`${classeBotao} bg-jogo text-jogo-texto hover:brightness-110`}
          >
            <IconPlayerPlayFilled aria-hidden size="1rem" />
            {ateGanhar ? 'Sortear até ganhar' : 'Sortear'}
          </button>
        )}
        {estado.status === 'rodando' && (
          <button
            type="button"
            onClick={aoPausar}
            className={`${classeBotao} bg-amber-500 text-white hover:brightness-110`}
          >
            <IconPlayerPauseFilled aria-hidden size="1rem" />
            Pausar
          </button>
        )}
        {estado.status === 'pausado' && (
          <button
            type="button"
            onClick={aoContinuar}
            className={`${classeBotao} bg-jogo text-jogo-texto hover:brightness-110`}
          >
            <IconPlayerPlayFilled aria-hidden size="1rem" />
            Continuar
          </button>
        )}
        <button
          type="button"
          disabled={!emAndamento}
          onClick={aoParar}
          className={`${classeBotao} border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800`}
        >
          <IconPlayerStopFilled aria-hidden size="1rem" />
          Parar
        </button>
        <span className="ml-auto text-xs text-slate-500 tabular-nums dark:text-slate-400">
          {descreverStatus(estado)}
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <GloboSorteio
          regra={regra}
          retiradas={new Set(linhas[indiceLinhaAtual])}
          girando={estado.status === 'rodando'}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Última bola
            </span>
            {ultimaBola === undefined ? (
              <span className="flex size-14 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-slate-400 dark:border-slate-700">
                ?
              </span>
            ) : (
              <BolaSorteada
                key={`${String(estado.realizados)}-${String(estado.revelados)}`}
                rotulo={formatarDezena(regra, ultimaBola)}
                marcacao={marcacaoDaDezena(
                  conferirDezenas(regra, linhas.flat(), referencias),
                  ultimaBola,
                )}
                tamanho="lg"
                className="motion-safe:animate-sair-bola"
              />
            )}
          </div>
          {sorteioExibido.map((dezenas, indice) => {
            const reveladas = linhas[indice] ?? [];
            const resultado = conferirDezenas(regra, reveladas, referencias);
            return (
              <div key={indice} className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2 rounded-full bg-slate-100 p-2 dark:bg-slate-800/60">
                  {Array.from({ length: regra.dezenasPorSorteio }, (_, posicao) => {
                    const dezena = reveladas[posicao];
                    return dezena === undefined ? (
                      <span
                        key={`vazia-${String(posicao)}`}
                        className="size-12 rounded-full border-2 border-dashed border-slate-300 sm:size-14 dark:border-slate-700"
                      />
                    ) : (
                      <BolaSorteada
                        key={dezena}
                        rotulo={formatarDezena(regra, dezena)}
                        marcacao={marcacaoDaDezena(resultado, dezena)}
                        tamanho="lg"
                        className="motion-safe:animate-sair-bola"
                      />
                    );
                  })}
                </div>
                {reveladas.length === dezenas.length && dezenas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <SeloCoincidencia tipo="aposta" coincidencia={resultado.aposta} />
                    <SeloCoincidencia tipo="favorito" coincidencia={resultado.favorito} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

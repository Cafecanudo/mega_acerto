import { menorFaixaPremiada, type RegraJogo } from '@mega/domain';
import { useState, type PointerEvent } from 'react';
import { formatarDecimal } from '@/lib/formatadores';
import {
  acertosEsperadosAoAcaso,
  criarEscala,
  indicesDoEixoX,
  isPontoIsolado,
  trechosDaSerie,
  type Escala,
} from '../geometria';
import { useLargura } from '../hooks/use-largura';
import type { PontoLinhaDoTempo, SerieLinhaDoTempo } from '../types';
import { DicaConcurso } from './dica-concurso';
import { CLASSE_SERIE } from '../estilos';
import { Marcador } from './marcadores';

interface PlanoLinhaDoTempoProps {
  readonly regra: RegraJogo;
  readonly pontos: readonly PontoLinhaDoTempo[];
}

const ALTURA = 240;
const MARGENS = { topo: 12, direita: 60, base: 28, esquerda: 32 };
const LARGURA_POR_ROTULO_X = 64;
const PASSO_MINIMO_MARCADOR = 10;
const SERIES: readonly SerieLinhaDoTempo[] = ['favoritos', 'apostas'];
const classeTextoEixo = 'fill-slate-500 text-[0.68rem] dark:fill-slate-400';

const EixoY = ({ escala, maximo }: { readonly escala: Escala; readonly maximo: number }) => (
  <g>
    {Array.from({ length: maximo + 1 }, (_, acertos) => (
      <g key={acertos}>
        <line
          x1={escala.margens.esquerda}
          x2={escala.largura - escala.margens.direita}
          y1={escala.y(acertos)}
          y2={escala.y(acertos)}
          className={
            acertos === 0
              ? 'stroke-slate-300 dark:stroke-slate-700'
              : 'stroke-slate-100 dark:stroke-slate-800'
          }
        />
        <text
          x={escala.margens.esquerda - 8}
          y={escala.y(acertos)}
          textAnchor="end"
          dominantBaseline="middle"
          className={classeTextoEixo}
        >
          {acertos}
        </text>
      </g>
    ))}
  </g>
);

const EixoX = ({
  escala,
  pontos,
}: {
  readonly escala: Escala;
  readonly pontos: readonly PontoLinhaDoTempo[];
}) => (
  <g>
    {indicesDoEixoX(pontos.length, Math.floor(escala.largura / LARGURA_POR_ROTULO_X)).map(
      (indice) => (
        <text
          key={indice}
          x={escala.x(indice)}
          y={escala.altura - 8}
          textAnchor="middle"
          className={classeTextoEixo}
        >
          {pontos[indice]?.numero}
        </text>
      ),
    )}
  </g>
);

const LinhaAcaso = ({
  escala,
  esperado,
}: {
  readonly escala: Escala;
  readonly esperado: number;
}) => (
  <g>
    <line
      x1={escala.margens.esquerda}
      x2={escala.largura - escala.margens.direita}
      y1={escala.y(esperado)}
      y2={escala.y(esperado)}
      strokeWidth={1.5}
      strokeDasharray="2 4"
      className="stroke-slate-400 dark:stroke-slate-500"
    />
    <text
      x={escala.largura - escala.margens.direita + 6}
      y={escala.y(esperado)}
      dominantBaseline="middle"
      className={classeTextoEixo}
    >
      acaso {formatarDecimal(esperado)}
    </text>
  </g>
);

const Serie = ({
  serie,
  pontos,
  escala,
  faixaPremiada,
}: {
  readonly serie: SerieLinhaDoTempo;
  readonly pontos: readonly PontoLinhaDoTempo[];
  readonly escala: Escala;
  readonly faixaPremiada: number;
}) => (
  <g>
    {trechosDaSerie(pontos, serie, escala).map((trecho) => (
      <path
        key={trecho}
        d={trecho}
        fill="none"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeDasharray={serie === 'favoritos' ? '5 4' : undefined}
        className={CLASSE_SERIE[serie]}
      />
    ))}
    {pontos.map((ponto, indice) => {
      const desempenho = ponto[serie];
      if (!desempenho) return null;
      const cheio = desempenho.melhorAcerto >= faixaPremiada;
      const visivel =
        escala.passo >= PASSO_MINIMO_MARCADOR || cheio || isPontoIsolado(pontos, serie, indice);
      return (
        visivel && (
          <Marcador
            key={ponto.numero}
            serie={serie}
            x={escala.x(indice)}
            y={escala.y(desempenho.melhorAcerto)}
            cheio={cheio}
          />
        )
      );
    })}
  </g>
);

export const PlanoLinhaDoTempo = ({ regra, pontos }: PlanoLinhaDoTempoProps) => {
  const { referencia, largura } = useLargura<HTMLDivElement>();
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const maximo = regra.dezenasPorSorteio;
  const escala = criarEscala(largura, ALTURA, MARGENS, pontos.length, maximo);
  const ponto = selecionado === null ? undefined : pontos[selecionado];

  const selecionar = (evento: PointerEvent<SVGRectElement>) => {
    const limites = evento.currentTarget.getBoundingClientRect();
    const indice = Math.floor((evento.clientX - limites.left) / escala.passo);
    setSelecionado(Math.min(Math.max(indice, 0), pontos.length - 1));
  };

  return (
    <div ref={referencia} className="relative w-full">
      {largura > 0 && (
        <svg
          width={largura}
          height={ALTURA}
          role="img"
          aria-label={`Acertos por concurso nos últimos ${String(pontos.length)} concursos`}
          className="block touch-pan-y"
        >
          <EixoY escala={escala} maximo={maximo} />
          <EixoX escala={escala} pontos={pontos} />
          <LinhaAcaso escala={escala} esperado={acertosEsperadosAoAcaso(regra)} />
          {selecionado !== null && (
            <line
              x1={escala.x(selecionado)}
              x2={escala.x(selecionado)}
              y1={MARGENS.topo}
              y2={ALTURA - MARGENS.base}
              className="stroke-slate-400 dark:stroke-slate-500"
            />
          )}
          {SERIES.map((serie) => (
            <Serie
              key={serie}
              serie={serie}
              pontos={pontos}
              escala={escala}
              faixaPremiada={menorFaixaPremiada(regra)}
            />
          ))}
          <rect
            x={MARGENS.esquerda}
            y={0}
            width={Math.max(largura - MARGENS.esquerda - MARGENS.direita, 0)}
            height={ALTURA - MARGENS.base}
            fill="transparent"
            onPointerMove={selecionar}
            onPointerDown={selecionar}
            onPointerLeave={() => {
              setSelecionado(null);
            }}
          />
        </svg>
      )}
      {ponto && selecionado !== null && (
        <DicaConcurso regra={regra} ponto={ponto} x={escala.x(selecionado)} largura={largura} />
      )}
    </div>
  );
};

import type { RegraJogo } from '@mega/domain';
import { LinhaDezenas } from '@/components/dezenas/linha-dezenas';
import { formatarData, formatarInteiro, formatarMoeda } from '@/lib/formatadores';
import type { DesempenhoConcurso, PontoLinhaDoTempo, SerieLinhaDoTempo } from '../types';
import { AmostraSerie } from './marcadores';

interface DicaConcursoProps {
  readonly regra: RegraJogo;
  readonly ponto: PontoLinhaDoTempo;
  readonly x: number;
  readonly largura: number;
}

const ROTULOS: Record<SerieLinhaDoTempo, { singular: string; plural: string; vazio: string }> = {
  apostas: { singular: 'aposta', plural: 'apostas', vazio: 'Sem aposta' },
  favoritos: { singular: 'favorito', plural: 'favoritos', vazio: 'Nenhum favorito de fora' },
};

const descrever = (serie: SerieLinhaDoTempo, desempenho: DesempenhoConcurso | null): string => {
  const rotulo = ROTULOS[serie];
  if (!desempenho) return rotulo.vazio;
  const quantidade = `${formatarInteiro(desempenho.itens)} ${desempenho.itens === 1 ? rotulo.singular : rotulo.plural}`;
  const acertos = `${String(desempenho.melhorAcerto)} ${desempenho.melhorAcerto === 1 ? 'acerto' : 'acertos'}`;
  const premio =
    desempenho.premio !== null && desempenho.premio > 0
      ? ` · ${serie === 'favoritos' ? 'teria ganho ' : ''}${formatarMoeda(desempenho.premio)}`
      : '';
  return `${quantidade} · melhor: ${acertos}${premio}`;
};

const LinhaSerie = ({
  serie,
  desempenho,
}: {
  readonly serie: SerieLinhaDoTempo;
  readonly desempenho: DesempenhoConcurso | null;
}) => (
  <div className="flex items-center gap-2">
    <AmostraSerie serie={serie} />
    <span>{descrever(serie, desempenho)}</span>
  </div>
);

export const DicaConcurso = ({ regra, ponto, x, largura }: DicaConcursoProps) => {
  const aEsquerda = x > largura / 2;
  return (
    <div
      role="tooltip"
      style={{
        left: x,
        transform: aEsquerda ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
      }}
      className="pointer-events-none absolute top-2 z-20 flex w-max max-w-72 flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
    >
      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Concurso {ponto.numero} · {formatarData(ponto.data)}
      </span>
      <LinhaDezenas regra={regra} dezenas={ponto.dezenas} tamanho="sm" />
      <LinhaSerie serie="apostas" desempenho={ponto.apostas} />
      <LinhaSerie serie="favoritos" desempenho={ponto.favoritos} />
    </div>
  );
};

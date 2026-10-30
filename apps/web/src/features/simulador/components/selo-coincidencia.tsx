import type { Coincidencia } from '../types';

interface SeloCoincidenciaProps {
  readonly tipo: 'aposta' | 'favorito';
  readonly coincidencia: Coincidencia | null;
}

const estilos = {
  aposta: {
    rotulo: 'Aposta',
    classe: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  favorito: {
    rotulo: 'Favorito',
    classe: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  },
} as const;

export const SeloCoincidencia = ({ tipo, coincidencia }: SeloCoincidenciaProps) => {
  if (!coincidencia?.premio) return null;
  const { rotulo, classe } = estilos[tipo];
  const nome = coincidencia.referencia.nome ?? `#${String(coincidencia.referencia.id)}`;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${classe}`}>
      {rotulo} {nome} · {coincidencia.acertadas.size} acertos · {coincidencia.premio}
    </span>
  );
};

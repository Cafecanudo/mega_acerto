import type { Location } from 'react-router';

export interface EstadoRetorno {
  readonly voltarPara: string;
}

export const estadoDeRetorno = (location: Location): EstadoRetorno => ({
  voltarPara: `${location.pathname}${location.search}`,
});

export const lerRetorno = (estado: unknown): string | null => {
  if (typeof estado !== 'object' || estado === null || !('voltarPara' in estado)) return null;
  const { voltarPara } = estado;
  return typeof voltarPara === 'string' ? voltarPara : null;
};

import { megaSena } from './mega-sena.ts';
import type { RegraJogo } from './regra-jogo.ts';

const catalogo = {
  [megaSena.codigo]: megaSena,
} as const satisfies Record<string, RegraJogo>;

export type CodigoJogo = keyof typeof catalogo;

export const codigosJogo = Object.keys(catalogo) as readonly CodigoJogo[];

export const isCodigoJogo = (valor: string): valor is CodigoJogo => Object.hasOwn(catalogo, valor);

export const obterRegraJogo = (codigo: CodigoJogo): RegraJogo => catalogo[codigo];

export const listarRegrasJogo = (): readonly RegraJogo[] => Object.values(catalogo);

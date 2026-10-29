import type { RegraJogo } from '../jogos/regra-jogo.ts';

export const formatarDezena = (regra: RegraJogo, dezena: number): string =>
  String(dezena).padStart(String(regra.universo.maximo).length, '0');

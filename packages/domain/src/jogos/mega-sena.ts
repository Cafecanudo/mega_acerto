import type { RegraJogo } from './regra-jogo.ts';

export const megaSena = {
  codigo: 'megasena',
  nome: 'Mega-Sena',
  slugCaixa: 'megasena',
  universo: { minimo: 1, maximo: 60 },
  dezenasPorSorteio: 6,
  sorteiosPorConcurso: 1,
  dezenasPorAposta: { minimo: 6, maximo: 20 },
} as const satisfies RegraJogo;

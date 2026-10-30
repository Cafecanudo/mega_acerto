import type { RegraJogo } from './regra-jogo.ts';

export const megaSena = {
  codigo: 'megasena',
  nome: 'Mega-Sena',
  slugCaixa: 'megasena',
  universo: { minimo: 1, maximo: 60 },
  dezenasPorSorteio: 6,
  sorteiosPorConcurso: 1,
  concursosPorSemana: 3,
  dezenasPorAposta: { minimo: 6, maximo: 20 },
  faixasPremiadas: [
    { acertos: 6, nome: 'Sena' },
    { acertos: 5, nome: 'Quina' },
    { acertos: 4, nome: 'Quadra' },
  ],
} as const satisfies RegraJogo;

import type { ApresentacaoJogo, RegraJogo } from '@mega/domain';
import { useOutletContext } from 'react-router';

export interface ContextoJogo {
  readonly regra: RegraJogo;
  readonly apresentacao: ApresentacaoJogo;
}

export const useContextoJogo = (): ContextoJogo => useOutletContext<ContextoJogo>();

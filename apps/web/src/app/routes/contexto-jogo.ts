import type { RegraJogo } from '@mega/domain';
import { useOutletContext } from 'react-router';

export interface ContextoJogo {
  readonly regra: RegraJogo;
}

export const useRegraJogo = (): RegraJogo => useOutletContext<ContextoJogo>().regra;

import { useQuery } from '@tanstack/react-query';
import { useCallback, type ReactNode } from 'react';
import { ProvedorAcertosApostas } from '@/components/dezenas/acertos-apostas';
import { acertosApostasQuery, buscarAcertos } from '../api/apostas';

const SEM_ACERTOS: ReadonlySet<number> = new Set();

export const ProvedorAcertosDasApostas = ({ children }: { readonly children: ReactNode }) => {
  const { data } = useQuery(acertosApostasQuery());
  const consultar = useCallback(
    (jogo: string, concurso: number) => buscarAcertos(data, jogo, concurso) ?? SEM_ACERTOS,
    [data],
  );

  return <ProvedorAcertosApostas value={consultar}>{children}</ProvedorAcertosApostas>;
};

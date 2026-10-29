import { createContext, use } from 'react';

export type ConsultaAcertosApostas = (jogo: string, concurso: number) => ReadonlySet<number>;

const SEM_ACERTOS: ReadonlySet<number> = new Set();

const AcertosApostasContexto = createContext<ConsultaAcertosApostas>(() => SEM_ACERTOS);

export const ProvedorAcertosApostas = AcertosApostasContexto;

export const useAcertosApostas = (): ConsultaAcertosApostas => use(AcertosApostasContexto);

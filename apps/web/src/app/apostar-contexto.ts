import { createContext, use } from 'react';
import type { SelecaoParaAposta } from '@/features/apostas/components/dialogo-apostar';

export type AbrirApostar = (inicial?: SelecaoParaAposta) => void;

export const ApostarContexto = createContext<AbrirApostar>(() => undefined);

export const useAbrirApostar = (): AbrirApostar => use(ApostarContexto);

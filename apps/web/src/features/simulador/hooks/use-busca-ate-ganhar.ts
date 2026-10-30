import { useRef, useState } from 'react';

type Sorteio = readonly (readonly number[])[];

export interface MatchEncontrado {
  readonly tentativa: number;
  readonly sorteio: Sorteio;
  readonly decorridoMs: number;
}

export interface EstadoBusca {
  readonly buscando: boolean;
  readonly tentativas: number;
  readonly decorridoMs: number;
  readonly matches: readonly MatchEncontrado[];
  readonly matchAberto: MatchEncontrado | null;
}

interface Trecho {
  readonly inicio: number;
  readonly baseTentativas: number;
  readonly baseDecorridoMs: number;
  tentativas: number;
}

const ESTADO_INICIAL: EstadoBusca = {
  buscando: false,
  tentativas: 0,
  decorridoMs: 0,
  matches: [],
  matchAberto: null,
};

const ordenar = (sorteio: Sorteio): Sorteio =>
  sorteio.map((dezenas) => [...dezenas].sort((a, b) => a - b));

export const useBuscaAteGanhar = () => {
  const [estado, setEstado] = useState<EstadoBusca>(ESTADO_INICIAL);
  const trecho = useRef<Trecho | null>(null);

  const medir = (atual: Trecho) => ({
    tentativas: atual.baseTentativas + atual.tentativas,
    decorridoMs: atual.baseDecorridoMs + performance.now() - atual.inicio,
  });

  const definirTentativas = (tentativas: number) => {
    const atual = trecho.current;
    if (!atual) return;
    atual.tentativas = tentativas;
    setEstado((anterior) => ({ ...anterior, ...medir(atual) }));
  };

  const encerrar = (match: Sorteio | null) => {
    const atual = trecho.current;
    trecho.current = null;
    if (!atual) return;
    const medida = medir(atual);
    setEstado((anterior) => {
      const encontrado = match
        ? { tentativa: medida.tentativas, sorteio: ordenar(match), decorridoMs: medida.decorridoMs }
        : null;
      return {
        ...anterior,
        ...medida,
        buscando: false,
        matches: encontrado ? [encontrado, ...anterior.matches] : anterior.matches,
        matchAberto: encontrado ?? anterior.matchAberto,
      };
    });
  };

  return {
    estado,
    retomar: () => {
      trecho.current = {
        inicio: performance.now(),
        baseTentativas: estado.tentativas,
        baseDecorridoMs: estado.decorridoMs,
        tentativas: 0,
      };
      setEstado((anterior) => ({ ...anterior, buscando: true, matchAberto: null }));
    },
    definirTentativas,
    somarTentativa: () => {
      definirTentativas((trecho.current?.tentativas ?? 0) + 1);
    },
    encontrar: (sorteio: Sorteio, tentativas?: number) => {
      if (tentativas !== undefined && trecho.current) trecho.current.tentativas = tentativas;
      encerrar(sorteio);
    },
    parar: () => {
      encerrar(null);
    },
    fecharMatch: () => {
      setEstado((anterior) => ({ ...anterior, matchAberto: null }));
    },
    limpar: () => {
      trecho.current = null;
      setEstado(ESTADO_INICIAL);
    },
  };
};

export type BuscaAteGanhar = ReturnType<typeof useBuscaAteGanhar>;

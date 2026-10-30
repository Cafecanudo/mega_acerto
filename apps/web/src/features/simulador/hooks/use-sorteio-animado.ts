import { sortearConcursoNaOrdem, type RegraJogo } from '@mega/domain';
import { useEffect, useEffectEvent, useReducer } from 'react';
import { sortearInteiro } from '@/lib/aleatorio';

type Sorteio = readonly (readonly number[])[];

export type StatusAnimacao = 'parado' | 'rodando' | 'pausado';

export interface EstadoAnimacao {
  readonly status: StatusAnimacao;
  readonly sorteio: Sorteio | null;
  readonly revelados: number;
  readonly restantes: number;
  readonly realizados: number;
  readonly total: number;
}

type Acao =
  | { readonly tipo: 'iniciar'; readonly sorteio: Sorteio; readonly quantidade: number }
  | { readonly tipo: 'avancar' }
  | { readonly tipo: 'proximo'; readonly sorteio: Sorteio }
  | { readonly tipo: 'pausar' }
  | { readonly tipo: 'continuar' }
  | { readonly tipo: 'parar' };

const PAUSA_MINIMA_RESULTADO_MS = 1500;

const pausaEntreSorteios = (intervaloMs: number): number =>
  Math.max(intervaloMs, Math.min(PAUSA_MINIMA_RESULTADO_MS, intervaloMs * 6));

const ESTADO_INICIAL: EstadoAnimacao = {
  status: 'parado',
  sorteio: null,
  revelados: 0,
  restantes: 0,
  realizados: 0,
  total: 0,
};

export const totalBolas = (sorteio: Sorteio): number =>
  sorteio.reduce((soma, dezenas) => soma + dezenas.length, 0);

const reduzir = (estado: EstadoAnimacao, acao: Acao): EstadoAnimacao => {
  switch (acao.tipo) {
    case 'iniciar':
      return {
        status: 'rodando',
        sorteio: acao.sorteio,
        revelados: 0,
        restantes: acao.quantidade - 1,
        realizados: 0,
        total: acao.quantidade,
      };
    case 'avancar': {
      const revelados = estado.revelados + 1;
      const completo = estado.sorteio !== null && revelados === totalBolas(estado.sorteio);
      return { ...estado, revelados, realizados: estado.realizados + (completo ? 1 : 0) };
    }
    case 'proximo':
      return { ...estado, sorteio: acao.sorteio, revelados: 0, restantes: estado.restantes - 1 };
    case 'pausar':
      return estado.status === 'rodando' ? { ...estado, status: 'pausado' } : estado;
    case 'continuar':
      return estado.status === 'pausado' ? { ...estado, status: 'rodando' } : estado;
    case 'parar':
      return { ...estado, status: 'parado' };
  }
};

export type AnimacaoSorteio = ReturnType<typeof useSorteioAnimado>;

export const useSorteioAnimado = (
  regra: RegraJogo,
  intervaloMs: number,
  aoConcluir: (sorteio: Sorteio) => boolean,
) => {
  const [estado, despachar] = useReducer(reduzir, ESTADO_INICIAL);
  const concluir = useEffectEvent(aoConcluir);

  useEffect(() => {
    const { status, sorteio, revelados, restantes } = estado;
    if (status !== 'rodando' || !sorteio) return;
    const bolas = totalBolas(sorteio);
    const completo = revelados >= bolas;

    const temporizador = window.setTimeout(
      () => {
        if (!completo) {
          const deveParar = revelados + 1 === bolas && concluir(sorteio);
          despachar({ tipo: 'avancar' });
          if (deveParar) despachar({ tipo: 'parar' });
        } else if (restantes > 0) {
          despachar({ tipo: 'proximo', sorteio: sortearConcursoNaOrdem(regra, sortearInteiro) });
        } else {
          despachar({ tipo: 'parar' });
        }
      },
      completo ? pausaEntreSorteios(intervaloMs) : intervaloMs,
    );
    return () => {
      window.clearTimeout(temporizador);
    };
  }, [estado, intervaloMs, regra]);

  return {
    estado,
    iniciar: (quantidade: number) => {
      despachar({
        tipo: 'iniciar',
        sorteio: sortearConcursoNaOrdem(regra, sortearInteiro),
        quantidade,
      });
    },
    pausar: () => {
      despachar({ tipo: 'pausar' });
    },
    continuar: () => {
      despachar({ tipo: 'continuar' });
    },
    parar: () => {
      despachar({ tipo: 'parar' });
    },
  };
};

import { useEffect, useRef } from 'react';
import type { MensagemBusca, PedidoBusca } from '../workers/mensagens';

interface OuvintesBusca {
  readonly aoProgredir: (tentativas: number) => void;
  readonly aoEncontrar: (sorteio: number[][], tentativas: number) => void;
}

export const useBuscaRapida = ({ aoProgredir, aoEncontrar }: OuvintesBusca) => {
  const worker = useRef<Worker | null>(null);

  const parar = () => {
    worker.current?.terminate();
    worker.current = null;
  };

  useEffect(
    () => () => {
      worker.current?.terminate();
    },
    [],
  );

  return {
    iniciar: (pedido: PedidoBusca) => {
      parar();
      const novo = new Worker(new URL('../workers/busca-ate-ganhar.worker.ts', import.meta.url), {
        type: 'module',
      });
      novo.addEventListener('message', (evento: MessageEvent<MensagemBusca>) => {
        const mensagem = evento.data;
        if (mensagem.tipo === 'progresso') {
          aoProgredir(mensagem.tentativas);
          return;
        }
        parar();
        aoEncontrar(mensagem.sorteio, mensagem.tentativas);
      });
      novo.postMessage(pedido);
      worker.current = novo;
    },
    parar,
  };
};

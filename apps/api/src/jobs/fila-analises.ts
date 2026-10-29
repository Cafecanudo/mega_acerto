import { setTimeout as aguardar } from 'node:timers/promises';
import type { Logger } from '../shared/logger.ts';

export interface OpcoesFilaAnalises {
  readonly intervaloMs: number;
  readonly processarProxima: () => Promise<boolean>;
  readonly logger: Logger;
}

export interface FilaAnalises {
  readonly parar: () => Promise<void>;
}

export const iniciarFilaAnalises = (opcoes: OpcoesFilaAnalises): FilaAnalises => {
  const controle = new AbortController();

  const ciclo = async (): Promise<void> => {
    while (!controle.signal.aborted) {
      const processou = await opcoes.processarProxima().catch((erro: unknown) => {
        opcoes.logger.error({ err: erro }, 'Falha ao processar a fila de análises');
        return false;
      });
      if (!processou) {
        await aguardar(opcoes.intervaloMs, undefined, { signal: controle.signal }).catch(
          () => undefined,
        );
      }
    }
  };

  const execucao = ciclo();

  return {
    parar: async () => {
      controle.abort();
      await execucao;
    },
  };
};

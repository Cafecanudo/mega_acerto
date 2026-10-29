import type { GatilhoIngestao } from '../data/repositories/ingestao-repository.ts';
import { ErroAplicacao } from '../shared/erros.ts';
import type { Logger } from '../shared/logger.ts';

export interface OpcoesAgendamento {
  readonly intervaloMinutos: number;
  readonly executarAoIniciar: boolean;
  readonly sincronizar: (gatilho: GatilhoIngestao) => Promise<unknown>;
  readonly logger: Logger;
}

const MILISSEGUNDOS_POR_MINUTO = 60_000;

export const agendarSincronizacao = (opcoes: OpcoesAgendamento): (() => void) => {
  const disparar = (gatilho: GatilhoIngestao): void => {
    opcoes.sincronizar(gatilho).catch((erro: unknown) => {
      if (erro instanceof ErroAplicacao && erro.codigo === 'conflito') {
        opcoes.logger.debug({ gatilho }, 'Sincronização ignorada: já em andamento');
        return;
      }
      opcoes.logger.error({ gatilho, err: erro }, 'Falha ao disparar sincronização');
    });
  };

  const temporizador = setInterval(() => {
    disparar('agendada');
  }, opcoes.intervaloMinutos * MILISSEGUNDOS_POR_MINUTO);
  temporizador.unref();

  if (opcoes.executarAoIniciar) disparar('inicializacao');

  return () => {
    clearInterval(temporizador);
  };
};

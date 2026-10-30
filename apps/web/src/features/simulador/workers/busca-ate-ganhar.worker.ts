import { criarSorteioReutilizavel, isCodigoJogo, obterRegraJogo } from '@mega/domain';
import { criarSorteadorEmLote } from '@/lib/aleatorio';
import { compilarReferencias, linhaGanhou } from '../busca';
import type { MensagemBusca, PedidoBusca } from './mensagens';

const INTERVALO_PROGRESSO_MS = 100;
const SORTEIOS_POR_VERIFICACAO = 2000;

const enviar = (mensagem: MensagemBusca) => {
  self.postMessage(mensagem);
};

const buscar = ({ jogo, referencias, faixaAlvo }: PedidoBusca) => {
  if (!isCodigoJogo(jogo)) return;
  const regra = obterRegraJogo(jogo);
  const compiladas = compilarReferencias(regra, referencias, faixaAlvo);
  const sortear = criarSorteioReutilizavel(regra, criarSorteadorEmLote());
  const linhas = Array.from(
    { length: regra.sorteiosPorConcurso },
    () => new Int32Array(regra.dezenasPorSorteio),
  );
  let tentativas = 0;

  const executarTrecho = () => {
    const limite = performance.now() + INTERVALO_PROGRESSO_MS;
    while (performance.now() < limite) {
      for (let lote = 0; lote < SORTEIOS_POR_VERIFICACAO; lote++) {
        tentativas++;
        let ganhou = false;
        for (const linha of linhas) {
          linha.set(sortear());
          ganhou = linhaGanhou(compiladas, linha) || ganhou;
        }
        if (ganhou) {
          enviar({ tipo: 'match', tentativas, sorteio: linhas.map((linha) => [...linha]) });
          return;
        }
      }
    }
    enviar({ tipo: 'progresso', tentativas });
    setTimeout(executarTrecho, 0);
  };

  executarTrecho();
};

self.addEventListener('message', (evento: MessageEvent<PedidoBusca>) => {
  buscar(evento.data);
});

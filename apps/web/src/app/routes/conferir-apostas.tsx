import { IconChecklist, IconInfoCircle } from '@tabler/icons-react';
import { ListaConferencia } from '@/features/apostas/components/lista-conferencia';
import { PaginaConta } from './pagina-conta';

const ConferirApostas = () => (
  <PaginaConta
    titulo="Conferir Apostas"
    descricao="Apostas cujo concurso já foi sorteado e ainda não foram conferidas."
    icone={<IconChecklist aria-hidden size="1.5rem" stroke={1.75} className="text-slate-500" />}
  >
    <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1">
      <p className="flex shrink-0 items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-slate-600 dark:border-sky-500/20 dark:bg-sky-500/5 dark:text-slate-300">
        <IconInfoCircle aria-hidden size="1.25rem" className="mt-0.5 shrink-0 text-sky-600" />
        Confira cada aposta e marque como conferida para tirá-la da lista. As dezenas acertadas
        aparecem em verde; acertos a partir da menor faixa premiada mostram o prêmio a receber,
        calculado pelo valor unitário divulgado pela Caixa.
      </p>
      <ListaConferencia />
    </div>
  </PaginaConta>
);

export default ConferirApostas;

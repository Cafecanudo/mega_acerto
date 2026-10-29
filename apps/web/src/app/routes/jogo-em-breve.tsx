import type { ApresentacaoJogo } from '@mega/domain';
import { IconClover } from '@tabler/icons-react';

const mensagens = {
  disponivel: '',
  'em-breve': 'O histórico deste jogo entra na Fase 5 do roadmap.',
  'fonte-indisponivel':
    'A API da Caixa não está respondendo para este jogo. Ele entra na Fase 5 com uma fonte alternativa.',
} as const;

export const JogoEmBreve = ({ apresentacao }: { readonly apresentacao: ApresentacaoJogo }) => (
  <section className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
    <IconClover aria-hidden size="4rem" stroke={1.25} color={apresentacao.cor} />
    <h2 className="text-xl font-semibold">{apresentacao.nome} ainda não tem dados</h2>
    <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
      {mensagens[apresentacao.disponibilidade]}
    </p>
  </section>
);

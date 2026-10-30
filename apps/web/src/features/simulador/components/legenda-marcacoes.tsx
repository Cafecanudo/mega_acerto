import type { ReferenciasSimulacao } from '../types';

const Item = ({ cor, texto }: { readonly cor: string; readonly texto: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span aria-hidden className={`size-3 rounded-full ${cor}`} />
    {texto}
  </span>
);

export const LegendaMarcacoes = ({
  referencias,
}: {
  readonly referencias: ReferenciasSimulacao;
}) => (
  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
    <Item
      cor="bg-emerald-600"
      texto={`Aposta pendente com mais acertos (${String(referencias.apostas.length)} comparadas)`}
    />
    <Item
      cor="bg-blue-600"
      texto={`Favorito com mais acertos (${String(referencias.favoritos.length)} comparados)`}
    />
  </p>
);

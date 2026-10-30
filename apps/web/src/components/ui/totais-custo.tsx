import type { CustoProjetado } from '@mega/domain';
import { formatarMoeda } from '@/lib/formatadores';

const Total = ({ rotulo, valor }: { readonly rotulo: string; readonly valor: number | null }) => (
  <span className="flex flex-col">
    <span className="text-xs text-slate-500 dark:text-slate-400">{rotulo}</span>
    <strong className="text-sm font-semibold text-slate-700 tabular-nums dark:text-slate-200">
      {formatarMoeda(valor)}
    </strong>
  </span>
);

export const TotaisCusto = ({ custo }: { readonly custo: CustoProjetado }) => (
  <span
    className="flex flex-wrap gap-x-5 gap-y-1"
    title="Semana e mês consideram jogar os mesmos jogos em todos os concursos regulares"
  >
    <Total rotulo="Total" valor={custo.porConcurso} />
    <Total rotulo="Por semana" valor={custo.porSemana} />
    <Total rotulo="Por mês" valor={custo.porMes} />
  </span>
);

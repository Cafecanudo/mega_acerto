import { IconCurrencyReal, IconInfoCircle } from '@tabler/icons-react';
import { TabelaValores } from '@/features/configuracoes/components/tabela-valores';
import { PaginaConta } from './pagina-conta';

const Valores = () => (
  <PaginaConta
    titulo="Valores"
    descricao="Preço da aposta simples de cada jogo."
    icone={<IconCurrencyReal aria-hidden size="1.5rem" stroke={1.75} className="text-slate-500" />}
  >
    <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-auto">
      <p className="flex shrink-0 items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-slate-600 dark:border-sky-500/20 dark:bg-sky-500/5 dark:text-slate-300">
        <IconInfoCircle aria-hidden size="1.25rem" className="mt-0.5 shrink-0 text-sky-600" />
        Informe o valor da aposta simples (na Mega-Sena, a de 6 dezenas). Apostas com mais dezenas
        custam o número de combinações simples que contêm: 7 dezenas = 7 apostas simples, 8 dezenas
        = 28, e assim por diante. O valor é gravado em cada aposta no momento de efetivar.
      </p>
      <TabelaValores />
    </div>
  </PaginaConta>
);

export default Valores;

import { IconChartHistogram, IconInfoCircle } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { paths } from '@/config/paths';
import { ListaAnalises } from '@/features/analises/components/lista-analises';
import { NovaAnalise } from '@/features/analises/components/nova-analise';
import { PaginaConta } from './pagina-conta';

const Passo = ({ titulo, children }: { readonly titulo: string; readonly children: ReactNode }) => (
  <li className="flex flex-col gap-0.5">
    <span className="font-semibold text-slate-800 dark:text-slate-100">{titulo}</span>
    <span>{children}</span>
  </li>
);

const Explicacao = () => (
  <section className="flex shrink-0 gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-slate-600 dark:border-sky-500/20 dark:bg-sky-500/5 dark:text-slate-300">
    <IconInfoCircle
      aria-hidden
      size="1.375rem"
      className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-400"
    />
    <div className="flex flex-col gap-3">
      <p>
        A análise de <strong>aleatoriedade</strong> verifica, com estatística, se o histórico do
        jogo escolhido se comporta como um sorteio <strong>uniforme e independente</strong>. Ela não
        prevê números: em um sorteio auditado, o resultado esperado é justamente não encontrar
        padrão.
      </p>
      <p>
        A análise de <strong>estratégia</strong> gera o palpite de uma regra de escolha de dezenas
        para o próximo concurso e testa essa regra em cada concurso do passado, usando só os dados
        anteriores a ele, contra apostas aleatórias. Ela mostra se a regra teria acertado mais que o
        acaso.
      </p>
      <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Passo titulo="1. Dados">
          O sistema exporta todos os concursos do jogo e as frequências contadas no banco.
        </Passo>
        <Passo titulo="2. Cálculo">
          O Claude escreve e executa scripts Python: qui-quadrado de frequência, intervalos entre
          aparições, independência entre concursos, pares de dezenas e a probabilidade estimada de
          cada dezena.
        </Passo>
        <Passo titulo="3. Conferência">
          O sistema confere as contagens do Claude contra o banco e valida o formato do resultado.
        </Passo>
        <Passo titulo="4. Resultado">
          Conclusão, gráfico de frequências, testes com p-valor e os scripts executados. Leva alguns
          minutos e consome cota da sua conta.
        </Passo>
      </ol>
    </div>
  </section>
);

const Analises = () => {
  const navegar = useNavigate();

  return (
    <PaginaConta
      titulo="Análises"
      descricao="Estudos estatísticos do histórico feitos pelo Claude."
      icone={
        <IconChartHistogram aria-hidden size="1.5rem" stroke={1.75} className="text-slate-500" />
      }
    >
      <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-auto">
        <Explicacao />
        <div className="grid gap-3 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <div className="xl:self-start">
            <NovaAnalise
              aoSolicitar={(solicitada) => {
                void navegar(paths.analise(solicitada.id));
              }}
            />
          </div>
          <section className="flex flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <h2 className="shrink-0 border-b border-slate-200 px-4 py-3 text-sm font-semibold dark:border-slate-800">
              Análises executadas
            </h2>
            <div className="overflow-x-auto">
              <ListaAnalises />
            </div>
          </section>
        </div>
      </div>
    </PaginaConta>
  );
};

export default Analises;

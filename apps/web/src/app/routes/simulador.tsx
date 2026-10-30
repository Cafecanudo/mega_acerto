import {
  apresentacoesJogo,
  isCodigoJogo,
  obterRegraJogo,
  type ApresentacaoJogo,
} from '@mega/domain';
import { IconDice5, IconInfoCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { apostasPendentesQuery } from '@/features/apostas/api/apostas';
import { listarValoresQuery } from '@/features/configuracoes/api/valores';
import { listarFavoritosQuery } from '@/features/favoritos/api/favoritos';
import { SimuladorSorteios } from '@/features/simulador/components/simulador-sorteios';
import type { ReferenciasSimulacao } from '@/features/simulador/types';
import { estiloCorJogo } from '@/lib/cor-jogo';
import { PaginaConta } from './pagina-conta';

const jogosDisponiveis: readonly ApresentacaoJogo[] = apresentacoesJogo.filter(
  (apresentacao) =>
    apresentacao.disponibilidade === 'disponivel' && isCodigoJogo(apresentacao.codigo),
);

const SEM_REFERENCIAS: ReferenciasSimulacao = { apostas: [], favoritos: [] };

const useReferencias = (jogo: string): ReferenciasSimulacao => {
  const apostas = useQuery({ ...apostasPendentesQuery(jogo), enabled: isCodigoJogo(jogo) });
  const favoritos = useQuery(listarFavoritosQuery());
  return useMemo(
    () =>
      apostas.data === undefined && favoritos.data === undefined
        ? SEM_REFERENCIAS
        : {
            apostas: apostas.data ?? [],
            favoritos: (favoritos.data ?? []).filter((favorito) => favorito.jogo === jogo),
          },
    [apostas.data, favoritos.data, jogo],
  );
};

const Simulador = () => {
  const [jogo, setJogo] = useState(jogosDisponiveis[0]?.codigo ?? '');
  const apresentacao = jogosDisponiveis.find((item) => item.codigo === jogo);
  const referencias = useReferencias(jogo);
  const valores = useQuery(listarValoresQuery());

  return (
    <PaginaConta
      titulo="Simulador"
      descricao="Sorteios aleatórios gerados no navegador, sem gravar nada."
      icone={<IconDice5 aria-hidden size="1.5rem" stroke={1.75} className="text-violet-500" />}
    >
      <div
        style={apresentacao ? estiloCorJogo(apresentacao) : undefined}
        className="flex flex-col gap-3 lg:min-h-0 lg:flex-1"
      >
        <div className="flex shrink-0 flex-wrap items-start gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Jogo</span>
            <select
              value={jogo}
              onChange={(evento) => {
                setJogo(evento.target.value);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              {jogosDisponiveis.map((item) => (
                <option key={item.codigo} value={item.codigo}>
                  {item.nome}
                </option>
              ))}
            </select>
          </label>
          <p className="flex flex-1 items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-slate-600 dark:border-sky-500/20 dark:bg-sky-500/5 dark:text-slate-300">
            <IconInfoCircle aria-hidden size="1.25rem" className="mt-0.5 shrink-0 text-sky-600" />
            Cada sorteio retira as dezenas do globo sem reposição, com gerador aleatório
            criptográfico, como um sorteio uniforme da Caixa. Os resultados existem só nesta página
            e somem ao sair dela.
          </p>
        </div>
        {isCodigoJogo(jogo) && (
          <SimuladorSorteios
            key={jogo}
            regra={obterRegraJogo(jogo)}
            referencias={referencias}
            valorApostaSimples={valores.data?.get(jogo)?.valorAposta ?? null}
          />
        )}
      </div>
    </PaginaConta>
  );
};

export default Simulador;

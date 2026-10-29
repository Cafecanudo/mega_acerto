import type { RegraJogo } from '@mega/domain';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Cartao } from '@/components/ui/cartao';
import { Carregando, Falha, Vazio } from '@/components/ui/estado';
import { Paginacao } from '@/components/ui/paginacao';
import { buscarConcursosQuery, type ParametrosBusca } from '../api/consultas';
import { SeletorDezenas } from './seletor-dezenas';
import { TabelaConcursos } from './tabela-concursos';

interface BuscaConcursosProps {
  readonly regra: RegraJogo;
  readonly busca: ParametrosBusca;
  readonly aoBuscar: (busca: ParametrosBusca) => void;
}

const botaoPrimario =
  'rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400';

const botaoSecundario =
  'rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800';

const Resultados = ({ regra, busca, aoBuscar }: BuscaConcursosProps) => {
  const consulta = useQuery(buscarConcursosQuery(regra.codigo, busca));
  const destacadas = new Set(busca.dezenas);

  if (consulta.isPending) return <Carregando mensagem="Buscando concursos…" />;
  if (consulta.isError) return <Falha erro={consulta.error} />;

  const { itens, total, tamanho } = consulta.data;
  if (itens.length === 0) {
    return <Vazio>Nenhum concurso com pelo menos {busca.minimoAcertos} dessas dezenas.</Vazio>;
  }

  return (
    <div className={`flex flex-col gap-4 ${consulta.isPlaceholderData ? 'opacity-60' : ''}`}>
      <TabelaConcursos
        regra={regra}
        concursos={itens}
        destacadas={destacadas}
        colunaExtra={{ titulo: 'Acertos', valor: (concurso) => String(concurso.acertos) }}
      />
      <Paginacao
        pagina={busca.pagina}
        tamanho={tamanho}
        total={total}
        aoMudar={(pagina) => {
          aoBuscar({ ...busca, pagina });
        }}
      />
    </div>
  );
};

export const BuscaConcursos = ({ regra, busca, aoBuscar }: BuscaConcursosProps) => {
  const [selecionadas, setSelecionadas] = useState<ReadonlySet<number>>(
    () => new Set(busca.dezenas),
  );
  const [minimoAcertos, setMinimoAcertos] = useState(busca.minimoAcertos);
  const limite = regra.dezenasPorSorteio;
  const minimoEfetivo = Math.min(Math.max(minimoAcertos, 1), Math.max(selecionadas.size, 1));

  const alternar = (dezena: number) => {
    setSelecionadas((atuais) => {
      const proximas = new Set(atuais);
      if (!proximas.delete(dezena)) proximas.add(dezena);
      return proximas;
    });
  };

  const buscar = () => {
    aoBuscar({
      dezenas: [...selecionadas].sort((a, b) => a - b),
      minimoAcertos: minimoEfetivo,
      pagina: 1,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Cartao
        titulo={`Escolha até ${limite} dezenas`}
        acoes={
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {selecionadas.size}/{limite} selecionadas
          </span>
        }
      >
        <div className="flex flex-col gap-5">
          <SeletorDezenas
            regra={regra}
            selecionadas={selecionadas}
            limite={limite}
            aoAlternar={alternar}
          />
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              Mínimo de acertos
              <select
                value={minimoEfetivo}
                onChange={(evento) => {
                  setMinimoAcertos(Number(evento.target.value));
                }}
                className="rounded-lg border border-slate-300 bg-transparent px-2 py-1.5 dark:border-slate-700"
              >
                {Array.from({ length: Math.max(selecionadas.size, 1) }, (_, indice) => (
                  <option key={indice + 1} value={indice + 1}>
                    {indice + 1}
                  </option>
                ))}
              </select>
            </label>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                className={botaoSecundario}
                onClick={() => {
                  setSelecionadas(new Set());
                }}
              >
                Limpar
              </button>
              <button
                type="button"
                className={botaoPrimario}
                disabled={selecionadas.size === 0}
                onClick={buscar}
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      </Cartao>
      {busca.dezenas.length > 0 && (
        <Cartao titulo="Concursos encontrados">
          <Resultados regra={regra} busca={busca} aoBuscar={aoBuscar} />
        </Cartao>
      )}
    </div>
  );
};

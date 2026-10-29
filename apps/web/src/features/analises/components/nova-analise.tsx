import {
  ESFORCO_PADRAO,
  esforcosAnalise,
  MODELO_PADRAO,
  modelosAnalise,
  obterTipoAnalise,
  tiposAnalise,
  type EsforcoAnalise,
  type ModeloAnalise,
  type TipoAnalise,
} from '@mega/analises/catalogo';
import { IconSparkles } from '@tabler/icons-react';
import { useState, type ReactNode, type SyntheticEvent } from 'react';
import { useSolicitarAnalise } from '../api/analises';
import type { AnaliseSolicitada } from '../types';

interface NovaAnaliseProps {
  readonly jogo: string;
  readonly aoSolicitar: (solicitada: AnaliseSolicitada) => void;
}

const Campo = ({ rotulo, children }: { readonly rotulo: string; readonly children: ReactNode }) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{rotulo}</span>
    {children}
  </label>
);

const classeSelect =
  'rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950';

export const NovaAnalise = ({ jogo, aoSolicitar }: NovaAnaliseProps) => {
  const [tipo, setTipo] = useState<TipoAnalise>(tiposAnalise[0].codigo);
  const [modelo, setModelo] = useState<ModeloAnalise>(MODELO_PADRAO);
  const [esforco, setEsforco] = useState<EsforcoAnalise>(ESFORCO_PADRAO);
  const [forcar, setForcar] = useState(false);
  const solicitar = useSolicitarAnalise(jogo);
  const definicao = obterTipoAnalise(tipo);

  const enviar = (evento: SyntheticEvent) => {
    evento.preventDefault();
    solicitar.mutate({ tipo, modelo, esforco, forcar }, { onSuccess: aoSolicitar });
  };

  return (
    <form
      onSubmit={enviar}
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-sm font-semibold">Nova análise</h2>
      <Campo rotulo="Tipo">
        <select
          value={tipo}
          onChange={(evento) => {
            setTipo(evento.target.value as TipoAnalise);
          }}
          className={classeSelect}
        >
          {tiposAnalise.map((item) => (
            <option key={item.codigo} value={item.codigo}>
              {item.nome}
            </option>
          ))}
        </select>
      </Campo>
      <p className="text-xs text-slate-500 dark:text-slate-400">{definicao.descricao}</p>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Modelo">
          <select
            value={modelo}
            onChange={(evento) => {
              setModelo(evento.target.value as ModeloAnalise);
            }}
            className={classeSelect}
          >
            {modelosAnalise.map((item) => (
              <option key={item.codigo} value={item.codigo}>
                {item.nome}
              </option>
            ))}
          </select>
        </Campo>
        <Campo rotulo="Esforço">
          <select
            value={esforco}
            onChange={(evento) => {
              setEsforco(evento.target.value as EsforcoAnalise);
            }}
            className={classeSelect}
          >
            {esforcosAnalise.map((item) => (
              <option key={item.codigo} value={item.codigo}>
                {item.nome}
              </option>
            ))}
          </select>
        </Campo>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={forcar}
          onChange={(evento) => {
            setForcar(evento.target.checked);
          }}
          className="size-4 accent-jogo"
        />
        Executar de novo mesmo se já houver resultado
      </label>
      <button
        type="submit"
        disabled={solicitar.isPending}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-jogo px-4 py-2 text-sm font-semibold text-jogo-texto transition hover:brightness-110 disabled:opacity-50"
      >
        <IconSparkles aria-hidden size="1rem" />
        {solicitar.isPending ? 'Enviando…' : 'Executar análise'}
      </button>
      {solicitar.isError && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{solicitar.error.message}</p>
      )}
    </form>
  );
};

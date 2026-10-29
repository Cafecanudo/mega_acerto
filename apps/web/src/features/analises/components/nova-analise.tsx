import {
  ESFORCO_PADRAO,
  esforcosAnalise,
  MODELO_PADRAO,
  modelosAnalise,
  estrategiasDisponiveis,
  obterEstrategia,
  obterTipoAnalise,
  TAMANHO_MAXIMO_DESCRICAO,
  tiposAnalise,
  type CodigoEstrategia,
  type EsforcoAnalise,
  type ModeloAnalise,
  type ParametrosEstrategia,
  type TipoAnalise,
} from '@mega/analises/catalogo';
import { apresentacoesJogo, isCodigoJogo, obterRegraJogo, type RegraJogo } from '@mega/domain';
import { IconSparkles } from '@tabler/icons-react';
import { useState, type ReactNode, type SyntheticEvent } from 'react';
import { useSolicitarAnalise } from '../api/analises';
import type { AnaliseSolicitada } from '../types';

const jogosDisponiveis = apresentacoesJogo.filter(
  (apresentacao) =>
    apresentacao.disponibilidade === 'disponivel' && isCodigoJogo(apresentacao.codigo),
);

interface NovaAnaliseProps {
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

const PARAMETROS_INICIAIS: ParametrosEstrategia = {
  estrategia: 'mais-sorteadas',
  descricao: null,
  quantidadeDezenas: 6,
  janela: null,
};

const JANELAS = [null, 500, 100, 50, 20] as const;

const CamposEstrategia = ({
  regra,
  parametros,
  aoAlterar,
}: {
  readonly regra: RegraJogo;
  readonly parametros: ParametrosEstrategia;
  readonly aoAlterar: (parametros: ParametrosEstrategia) => void;
}) => {
  const { minimo, maximo } = regra.dezenasPorAposta;
  const definicao = obterEstrategia(parametros.estrategia);
  const quantidades = Array.from({ length: maximo - minimo + 1 }, (_, indice) => minimo + indice);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <Campo rotulo="Estratégia">
        <select
          value={parametros.estrategia}
          onChange={(evento) => {
            aoAlterar({ ...parametros, estrategia: evento.target.value as CodigoEstrategia });
          }}
          className={classeSelect}
        >
          {estrategiasDisponiveis.map((item) => (
            <option key={item.codigo} value={item.codigo}>
              {item.nome}
            </option>
          ))}
        </select>
      </Campo>
      {parametros.estrategia === 'personalizada' ? (
        <Campo rotulo="Descreva a regra">
          <textarea
            value={parametros.descricao ?? ''}
            onChange={(evento) => {
              aoAlterar({ ...parametros, descricao: evento.target.value });
            }}
            maxLength={TAMANHO_MAXIMO_DESCRICAO}
            rows={4}
            required
            placeholder="Ex.: as dezenas que mais saíram junto com a dezena 10 nos últimos 200 concursos"
            className={`${classeSelect} resize-y`}
          />
        </Campo>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400">{definicao.regra}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Dezenas por palpite">
          <select
            value={parametros.quantidadeDezenas}
            onChange={(evento) => {
              aoAlterar({ ...parametros, quantidadeDezenas: Number(evento.target.value) });
            }}
            className={classeSelect}
          >
            {quantidades.map((quantidade) => (
              <option key={quantidade} value={quantidade}>
                {quantidade}
              </option>
            ))}
          </select>
        </Campo>
        <Campo rotulo="Período usado">
          <select
            value={parametros.janela ?? ''}
            onChange={(evento) => {
              aoAlterar({
                ...parametros,
                janela: evento.target.value === '' ? null : Number(evento.target.value),
              });
            }}
            className={classeSelect}
          >
            {JANELAS.map((janela) => (
              <option key={janela ?? 'todos'} value={janela ?? ''}>
                {janela === null ? 'Todo o histórico' : `Últimos ${janela}`}
              </option>
            ))}
          </select>
        </Campo>
      </div>
    </div>
  );
};

export const NovaAnalise = ({ aoSolicitar }: NovaAnaliseProps) => {
  const [jogo, setJogo] = useState(jogosDisponiveis[0]?.codigo ?? '');
  const [tipo, setTipo] = useState<TipoAnalise>(tiposAnalise[0].codigo);
  const [modelo, setModelo] = useState<ModeloAnalise>(MODELO_PADRAO);
  const [esforco, setEsforco] = useState<EsforcoAnalise>(ESFORCO_PADRAO);
  const [forcar, setForcar] = useState(false);
  const [estrategia, setEstrategia] = useState<ParametrosEstrategia>(PARAMETROS_INICIAIS);
  const solicitar = useSolicitarAnalise();
  const definicao = obterTipoAnalise(tipo);

  const enviar = (evento: SyntheticEvent) => {
    evento.preventDefault();
    const parametros =
      tipo === 'estrategia'
        ? {
            ...estrategia,
            descricao: estrategia.estrategia === 'personalizada' ? estrategia.descricao : null,
          }
        : null;
    solicitar.mutate(
      { jogo, tipo, modelo, esforco, forcar, parametros },
      { onSuccess: aoSolicitar },
    );
  };

  return (
    <form
      onSubmit={enviar}
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-sm font-semibold">Nova análise</h2>
      <Campo rotulo="Jogo">
        <select
          value={jogo}
          onChange={(evento) => {
            setJogo(evento.target.value);
          }}
          className={classeSelect}
        >
          {jogosDisponiveis.map((item) => (
            <option key={item.codigo} value={item.codigo}>
              {item.nome}
            </option>
          ))}
        </select>
      </Campo>
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
      {tipo === 'estrategia' && isCodigoJogo(jogo) && (
        <CamposEstrategia
          regra={obterRegraJogo(jogo)}
          parametros={estrategia}
          aoAlterar={setEstrategia}
        />
      )}
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

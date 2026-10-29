import {
  apresentacoesJogo,
  isCodigoJogo,
  obterApresentacaoJogo,
  obterRegraJogo,
  type ApresentacaoJogo,
} from '@mega/domain';
import { useEffect, useState, type ReactNode, type SyntheticEvent } from 'react';
import { SeletorDezenas } from '@/components/dezenas/seletor-dezenas';
import { estiloCorJogo } from '@/lib/cor-jogo';
import { useSalvarAposta } from '../api/apostas';
import type { Aposta } from '../types';

export interface SelecaoDezenas {
  readonly jogo: string;
  readonly dezenas: readonly number[];
}

interface FormularioApostaProps {
  readonly emEdicao: Aposta | null;
  readonly favoritaPadrao: boolean;
  readonly aoConcluir: () => void;
  readonly aoAlterarSelecao: (selecao: SelecaoDezenas) => void;
}

const jogosDisponiveis: readonly ApresentacaoJogo[] = apresentacoesJogo.filter(
  (apresentacao) =>
    apresentacao.disponibilidade === 'disponivel' && isCodigoJogo(apresentacao.codigo),
);

const Campo = ({ rotulo, children }: { readonly rotulo: string; readonly children: ReactNode }) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{rotulo}</span>
    {children}
  </label>
);

const classeEntrada =
  'rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950';

export const FormularioAposta = ({
  emEdicao,
  favoritaPadrao,
  aoConcluir,
  aoAlterarSelecao,
}: FormularioApostaProps) => {
  const [jogo, setJogo] = useState(emEdicao?.jogo ?? jogosDisponiveis[0]?.codigo ?? '');
  const [nome, setNome] = useState(emEdicao?.nome ?? '');
  const [dezenas, setDezenas] = useState<ReadonlySet<number>>(
    () => new Set(emEdicao?.dezenas ?? []),
  );
  const [favorita, setFavorita] = useState(emEdicao?.favorita ?? favoritaPadrao);
  const salvar = useSalvarAposta();

  useEffect(() => {
    aoAlterarSelecao({ jogo, dezenas: [...dezenas].sort((a, b) => a - b) });
  }, [jogo, dezenas, aoAlterarSelecao]);

  const apresentacao = obterApresentacaoJogo(jogo);
  if (!apresentacao || !isCodigoJogo(jogo)) return null;
  const regra = obterRegraJogo(jogo);
  const { minimo, maximo } = regra.dezenasPorAposta;
  const quantidadeValida = dezenas.size >= minimo && dezenas.size <= maximo;

  const alternar = (dezena: number) => {
    setDezenas((atuais) => {
      const proximas = new Set(atuais);
      if (!proximas.delete(dezena)) proximas.add(dezena);
      return proximas;
    });
  };

  const enviar = (evento: SyntheticEvent) => {
    evento.preventDefault();
    salvar.mutate(
      {
        id: emEdicao?.id ?? null,
        dados: {
          jogo,
          nome: nome.trim() || null,
          dezenas: [...dezenas].sort((a, b) => a - b),
          favorita,
        },
      },
      { onSuccess: aoConcluir },
    );
  };

  return (
    <form
      onSubmit={enviar}
      style={estiloCorJogo(apresentacao)}
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-sm font-semibold">
        {emEdicao ? `Editar aposta #${emEdicao.id}` : 'Nova aposta'}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Jogo">
          <select
            value={jogo}
            disabled={emEdicao !== null}
            onChange={(evento) => {
              setJogo(evento.target.value);
              setDezenas(new Set());
            }}
            className={classeEntrada}
          >
            {jogosDisponiveis.map((item) => (
              <option key={item.codigo} value={item.codigo}>
                {item.nome}
              </option>
            ))}
          </select>
        </Campo>
        <Campo rotulo="Nome (opcional)">
          <input
            value={nome}
            maxLength={80}
            onChange={(evento) => {
              setNome(evento.target.value);
            }}
            placeholder="Aposta da família"
            className={classeEntrada}
          />
        </Campo>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500 dark:text-slate-400">
            Dezenas ({minimo} a {maximo})
          </span>
          <span
            className={`tabular-nums ${quantidadeValida ? 'text-slate-500' : 'text-amber-600 dark:text-amber-400'}`}
          >
            {dezenas.size}/{maximo}
          </span>
        </div>
        <SeletorDezenas
          regra={regra}
          selecionadas={dezenas}
          limite={maximo}
          aoAlternar={alternar}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={favorita}
          onChange={(evento) => {
            setFavorita(evento.target.checked);
          }}
          className="size-4 accent-amber-500"
        />
        Marcar como favorita
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!quantidadeValida || salvar.isPending}
          className="flex-1 rounded-lg bg-jogo px-4 py-2 text-sm font-semibold text-jogo-texto transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {salvar.isPending ? 'Salvando…' : emEdicao ? 'Salvar alterações' : 'Criar aposta'}
        </button>
        {emEdicao && (
          <button
            type="button"
            onClick={aoConcluir}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
        )}
      </div>
      {salvar.isError && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{salvar.error.message}</p>
      )}
    </form>
  );
};

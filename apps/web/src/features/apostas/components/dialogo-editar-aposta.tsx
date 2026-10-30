import {
  calcularValorAposta,
  obterApresentacaoJogo,
  obterRegraJogo,
  isCodigoJogo,
} from '@mega/domain';
import { useState, type SyntheticEvent } from 'react';
import { SeletorDezenas } from '@/components/dezenas/seletor-dezenas';
import { Dialogo } from '@/components/ui/dialogo';
import { estiloCorJogo } from '@/lib/cor-jogo';
import { formatarMoeda } from '@/lib/formatadores';
import { useEditarAposta } from '../api/apostas';
import type { Aposta } from '../types';

interface DialogoEditarApostaProps {
  readonly aposta: Aposta | null;
  readonly valorApostaSimples: (jogo: string) => number | null;
  readonly aoFechar: () => void;
}

const classeEntrada =
  'rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950';

const descreverAlcance = (aposta: Aposta): string =>
  aposta.teimosinha
    ? `Teimosinha ${String(aposta.teimosinha.posicao)}/${String(aposta.teimosinha.total)}: a alteração vale para todos os concursos ainda não sorteados do grupo.`
    : `A alteração vale para o concurso ${String(aposta.concurso)}.`;

const Formulario = ({
  aposta,
  valorApostaSimples,
  aoFechar,
}: Omit<DialogoEditarApostaProps, 'aposta'> & { readonly aposta: Aposta }) => {
  const [nome, setNome] = useState(aposta.nome ?? '');
  const [dezenas, setDezenas] = useState<ReadonlySet<number>>(() => new Set(aposta.dezenas));
  const editar = useEditarAposta();

  const apresentacao = obterApresentacaoJogo(aposta.jogo);
  if (!apresentacao || !isCodigoJogo(aposta.jogo)) return null;
  const regra = obterRegraJogo(aposta.jogo);
  const { minimo, maximo } = regra.dezenasPorAposta;
  const quantidadeValida = dezenas.size >= minimo && dezenas.size <= maximo;
  const valorSimples = valorApostaSimples(aposta.jogo);
  const valor =
    valorSimples === null || !quantidadeValida
      ? null
      : calcularValorAposta(regra, dezenas.size, valorSimples);

  const alternar = (dezena: number) => {
    setDezenas((atuais) => {
      const proximas = new Set(atuais);
      if (!proximas.delete(dezena)) proximas.add(dezena);
      return proximas;
    });
  };

  const enviar = (evento: SyntheticEvent) => {
    evento.preventDefault();
    editar.mutate(
      {
        id: aposta.id,
        edicao: { nome: nome.trim() || null, dezenas: [...dezenas].sort((a, b) => a - b) },
      },
      { onSuccess: aoFechar },
    );
  };

  return (
    <form
      onSubmit={enviar}
      style={estiloCorJogo(apresentacao)}
      className="mx-auto flex max-w-xl flex-col gap-4"
    >
      <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:bg-sky-500/10 dark:text-sky-300">
        {descreverAlcance(aposta)}
      </p>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Nome (opcional)
        </span>
        <input
          value={nome}
          maxLength={80}
          onChange={(evento) => {
            setNome(evento.target.value);
          }}
          placeholder={apresentacao.nome}
          className={classeEntrada}
        />
      </label>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500 dark:text-slate-400">
            Dezenas ({minimo} a {maximo})
          </span>
          <span
            className={`tabular-nums ${quantidadeValida ? 'text-slate-500' : 'text-amber-600 dark:text-amber-400'}`}
          >
            {dezenas.size}/{maximo} · {formatarMoeda(valor)} por concurso
          </span>
        </div>
        <SeletorDezenas
          regra={regra}
          selecionadas={dezenas}
          limite={maximo}
          aoAlternar={alternar}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!quantidadeValida || editar.isPending}
          className="flex-1 rounded-lg bg-jogo px-4 py-2 text-sm font-semibold text-jogo-texto transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {editar.isPending ? 'Salvando…' : 'Salvar alterações'}
        </button>
        <button
          type="button"
          onClick={aoFechar}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Cancelar
        </button>
      </div>
      {editar.isError && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{editar.error.message}</p>
      )}
    </form>
  );
};

export const DialogoEditarAposta = ({ aposta, ...props }: DialogoEditarApostaProps) => (
  <Dialogo
    aberto={aposta !== null}
    titulo={aposta ? `Editar aposta #${String(aposta.id)}` : 'Editar aposta'}
    tamanho="medio"
    aoFechar={props.aoFechar}
  >
    {aposta && <Formulario key={aposta.id} aposta={aposta} {...props} />}
  </Dialogo>
);

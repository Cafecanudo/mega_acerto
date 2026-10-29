import {
  apresentacoesJogo,
  calcularValorAposta,
  contarApostasSimples,
  isCodigoJogo,
  obterApresentacaoJogo,
  obterRegraJogo,
  type ApresentacaoJogo,
} from '@mega/domain';
import { IconCheck, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState, type ReactNode } from 'react';
import { LinhaDezenas } from '@/components/dezenas/linha-dezenas';
import { SeletorDezenas } from '@/components/dezenas/seletor-dezenas';
import { Dialogo } from '@/components/ui/dialogo';
import { Vazio } from '@/components/ui/estado';
import { estiloCorJogo } from '@/lib/cor-jogo';
import { formatarInteiro, formatarMoeda } from '@/lib/formatadores';
import { useEfetivarApostas, type ApostasEfetivadas, type ItemEfetivacao } from '../api/apostas';

export interface SelecaoParaAposta {
  readonly jogo: string;
  readonly dezenas: readonly number[];
}

interface DialogoApostarProps {
  readonly aberto: boolean;
  readonly aoFechar: () => void;
  readonly aoEfetivar: (resultado: ApostasEfetivadas) => void;
  readonly favoritos?: (
    jogo: string,
    aoAdicionar: (itens: readonly ItemEfetivacao[]) => void,
  ) => ReactNode;
  readonly painelDezenas?: (selecao: SelecaoParaAposta) => ReactNode;
  readonly valorApostaSimples?: (jogo: string) => number | null;
}

interface ItemLista extends ItemEfetivacao {
  readonly chave: number;
}

const jogosDisponiveis: readonly ApresentacaoJogo[] = apresentacoesJogo.filter(
  (apresentacao) =>
    apresentacao.disponibilidade === 'disponivel' && isCodigoJogo(apresentacao.codigo),
);

const chaveDezenas = (dezenas: readonly number[]): string =>
  [...dezenas].sort((a, b) => a - b).join(',');

const classeSelect =
  'rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950';

const Conteudo = ({
  aoEfetivar,
  favoritos,
  painelDezenas,
  valorApostaSimples,
}: Omit<DialogoApostarProps, 'aberto' | 'aoFechar'>) => {
  const [jogo, setJogo] = useState(jogosDisponiveis[0]?.codigo ?? '');
  const [dezenas, setDezenas] = useState<ReadonlySet<number>>(new Set());
  const [itens, setItens] = useState<readonly ItemLista[]>([]);
  const [proximaChave, setProximaChave] = useState(1);
  const efetivar = useEfetivarApostas();

  const apresentacao = obterApresentacaoJogo(jogo);
  if (!apresentacao || !isCodigoJogo(jogo)) return null;
  const regra = obterRegraJogo(jogo);
  const { minimo, maximo } = regra.dezenasPorAposta;
  const quantidadeValida = dezenas.size >= minimo && dezenas.size <= maximo;
  const selecionadas = [...dezenas].sort((a, b) => a - b);
  const valorSimples = valorApostaSimples?.(jogo) ?? null;
  const valorDe = (quantidade: number): number | null =>
    valorSimples === null ? null : calcularValorAposta(regra, quantidade, valorSimples);
  const valorTotal =
    valorSimples === null
      ? null
      : itens.reduce((soma, item) => soma + (valorDe(item.dezenas.length) ?? 0), 0);

  const adicionar = (novos: readonly ItemEfetivacao[]) => {
    const existentes = new Set(itens.map((item) => chaveDezenas(item.dezenas)));
    const ineditos = novos.filter((item) => !existentes.has(chaveDezenas(item.dezenas)));
    setItens([
      ...itens,
      ...ineditos.map((item, indice) => ({ ...item, chave: proximaChave + indice })),
    ]);
    setProximaChave(proximaChave + ineditos.length);
  };

  const adicionarSelecao = () => {
    adicionar([{ dezenas: selecionadas, nome: null, favoritoId: null }]);
    setDezenas(new Set());
  };

  const alternar = (dezena: number) => {
    setDezenas((atuais) => {
      const proximas = new Set(atuais);
      if (!proximas.delete(dezena)) proximas.add(dezena);
      return proximas;
    });
  };

  const trocarJogo = (codigo: string) => {
    setJogo(codigo);
    setDezenas(new Set());
    setItens([]);
  };

  const confirmar = () => {
    efetivar.mutate(
      {
        jogo,
        itens: itens.map(({ dezenas: dezenasItem, nome, favoritoId }) => ({
          dezenas: dezenasItem,
          nome,
          favoritoId,
        })),
      },
      { onSuccess: aoEfetivar },
    );
  };

  return (
    <div
      style={estiloCorJogo(apresentacao)}
      className="grid h-full gap-3 lg:grid-cols-[24rem_minmax(0,1fr)]"
    >
      <div className="flex flex-col gap-3 lg:min-h-0 lg:overflow-auto">
        <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Jogo</span>
            <select
              value={jogo}
              onChange={(evento) => {
                trocarJogo(evento.target.value);
              }}
              className={classeSelect}
            >
              {jogosDisponiveis.map((item) => (
                <option key={item.codigo} value={item.codigo}>
                  {item.nome}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Dezenas ({minimo} a {maximo})
              </span>
              <span
                className={`tabular-nums ${quantidadeValida || dezenas.size === 0 ? 'text-slate-500' : 'text-amber-600 dark:text-amber-400'}`}
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
          {quantidadeValida && (
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {formatarInteiro(contarApostasSimples(regra, dezenas.size))}{' '}
              {contarApostasSimples(regra, dezenas.size) === 1
                ? 'aposta simples'
                : 'apostas simples'}
              {' · '}
              <strong className="font-semibold">{formatarMoeda(valorDe(dezenas.size))}</strong>
            </p>
          )}
          <button
            type="button"
            disabled={!quantidadeValida}
            onClick={adicionarSelecao}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <IconPlus aria-hidden size="1rem" />
            Adicionar à lista
          </button>
        </section>
        {favoritos?.(jogo, adicionar)}
      </div>

      <div className="flex flex-col gap-3 lg:min-h-0">
        <section className="flex flex-col rounded-xl border border-slate-200 bg-white lg:min-h-0 lg:flex-[2] dark:border-slate-800 dark:bg-slate-900">
          <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <h3 className="text-sm font-semibold">Apostas a efetivar ({itens.length})</h3>
            {itens.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setItens([]);
                }}
                className="text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400"
              >
                Limpar lista
              </button>
            )}
          </header>
          <div className="p-3 lg:min-h-0 lg:flex-1 lg:overflow-auto">
            {itens.length === 0 ? (
              <Vazio>Marque dezenas ou adicione favoritos para montar suas apostas.</Vazio>
            ) : (
              <ul className="flex flex-col gap-2">
                {itens.map((item) => (
                  <li
                    key={item.chave}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {item.nome ?? 'Aposta manual'} · {item.dezenas.length} dezenas ·{' '}
                        <strong className="font-semibold text-slate-700 dark:text-slate-200">
                          {formatarMoeda(valorDe(item.dezenas.length))}
                        </strong>
                      </span>
                      <LinhaDezenas regra={regra} dezenas={item.dezenas} tamanho="sm" />
                    </div>
                    <button
                      type="button"
                      aria-label="Remover da lista"
                      onClick={() => {
                        setItens(itens.filter((atual) => atual.chave !== item.chave));
                      }}
                      className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
                    >
                      <IconTrash aria-hidden size="1rem" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
            <span className="flex flex-col text-xs text-slate-500 dark:text-slate-400">
              <span>As apostas valem para o próximo concurso de {apresentacao.nome}.</span>
              {valorSimples === null ? (
                <span className="text-amber-600 dark:text-amber-400">
                  Valor não configurado. Defina em Configurações › Valores.
                </span>
              ) : (
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  Total: <strong className="font-semibold">{formatarMoeda(valorTotal)}</strong>
                </span>
              )}
            </span>
            <div className="flex items-center gap-3">
              {efetivar.isError && (
                <span className="text-sm text-rose-600 dark:text-rose-400">
                  {efetivar.error.message}
                </span>
              )}
              <button
                type="button"
                disabled={itens.length === 0 || efetivar.isPending}
                onClick={confirmar}
                className="inline-flex items-center gap-2 rounded-lg bg-jogo px-4 py-2 text-sm font-semibold text-jogo-texto transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <IconCheck aria-hidden size="1rem" />
                {efetivar.isPending
                  ? 'Efetivando…'
                  : `Efetivar ${itens.length} ${itens.length === 1 ? 'aposta' : 'apostas'}`}
              </button>
            </div>
          </footer>
        </section>
        {painelDezenas && selecionadas.length > 0 && (
          <div className="flex flex-col lg:min-h-0 lg:flex-[3]">
            {painelDezenas({ jogo, dezenas: selecionadas })}
          </div>
        )}
      </div>
    </div>
  );
};

export const DialogoApostar = ({ aberto, aoFechar, ...props }: DialogoApostarProps) => (
  <Dialogo aberto={aberto} titulo="Apostar" aoFechar={aoFechar}>
    {aberto && <Conteudo {...props} />}
  </Dialogo>
);

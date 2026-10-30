import {
  apresentacoesJogo,
  isCodigoJogo,
  obterRegraJogo,
  type ApresentacaoJogo,
} from '@mega/domain';
import { IconBulb, IconHistory, IconInfoCircle, IconStack2, IconTicket } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router';
import { paths } from '@/config/paths';
import {
  RankingDezenas,
  type SelecaoRanking,
} from '@/features/concursos/components/ranking-dezenas';
import { BotaoSalvarFavorito } from '@/features/favoritos/components/botao-salvar-favorito';
import { BotaoSalvarFavoritosLote } from '@/features/favoritos/components/botao-salvar-favoritos-lote';
import { listarValoresQuery } from '@/features/configuracoes/api/valores';
import { estiloCorJogo } from '@/lib/cor-jogo';
import { useAbrirApostar } from '../apostar-contexto';
import { PaginaConta } from './pagina-conta';

const jogosDisponiveis: readonly ApresentacaoJogo[] = apresentacoesJogo.filter(
  (apresentacao) =>
    apresentacao.disponibilidade === 'disponivel' && isCodigoJogo(apresentacao.codigo),
);

const DialogoMontarJogos = lazy(() =>
  import('@/features/montar-jogos/components/dialogo-montar-jogos').then((modulo) => ({
    default: modulo.DialogoMontarJogos,
  })),
);

const AcoesSelecao = ({
  selecao,
  aoMontar,
}: {
  readonly selecao: SelecaoRanking;
  readonly aoMontar: () => void;
}) => {
  const abrirApostar = useAbrirApostar();
  if (!isCodigoJogo(selecao.jogo)) return null;
  const { minimo } = obterRegraJogo(selecao.jogo).dezenasPorAposta;
  const valida = selecao.dezenas.length >= minimo;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {selecao.dezenas.length > 0 && (
        <Link
          to={paths.buscaNoHistorico(selecao.jogo, selecao.dezenas)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <IconHistory aria-hidden size="1rem" />
          Ver no histórico
        </Link>
      )}
      <BotaoSalvarFavorito
        key={selecao.dezenas.join(',')}
        jogo={selecao.jogo}
        dezenas={selecao.dezenas}
        nome="Palpite das mais sorteadas"
        desabilitado={!valida}
      />
      <button
        type="button"
        disabled={!valida}
        title={valida ? undefined : `Selecione pelo menos ${minimo} dezenas`}
        onClick={aoMontar}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        <IconStack2 aria-hidden size="1rem" />
        Montar jogos
      </button>
      <button
        type="button"
        disabled={!valida}
        title={valida ? undefined : `Selecione pelo menos ${minimo} dezenas`}
        onClick={() => {
          abrirApostar({ jogo: selecao.jogo, dezenas: selecao.dezenas });
        }}
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <IconTicket aria-hidden size="1rem" />
        Usar no Apostar
      </button>
    </div>
  );
};

const Palpites = () => {
  const [jogo, setJogo] = useState(jogosDisponiveis[0]?.codigo ?? '');
  const apresentacao = jogosDisponiveis.find((item) => item.codigo === jogo);
  const [montagem, setMontagem] = useState<SelecaoRanking | null>(null);
  const valores = useQuery({ ...listarValoresQuery(), enabled: montagem !== null });
  const abrirApostar = useAbrirApostar();

  return (
    <PaginaConta
      titulo="Palpites"
      descricao="Monte jogos a partir das dezenas que mais saíram."
      icone={<IconBulb aria-hidden size="1.5rem" stroke={1.75} className="text-amber-500" />}
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
            <IconInfoCircle aria-hidden size="1.25rem" className="mt-0.5 shrink-0 text-sky-600" />A
            lista ordena as dezenas pela quantidade de vezes que saíram no período escolhido. Marque
            as que quiser, ou use os atalhos, e leve a seleção para o Apostar. Lembre que cada
            sorteio é independente: sair mais no passado não aumenta a chance no próximo.
          </p>
        </div>
        {isCodigoJogo(jogo) && (
          <RankingDezenas
            key={jogo}
            regra={obterRegraJogo(jogo)}
            acoes={(selecao) => (
              <AcoesSelecao
                selecao={selecao}
                aoMontar={() => {
                  setMontagem(selecao);
                }}
              />
            )}
          />
        )}
      </div>
      {montagem && (
        <Suspense>
          <DialogoMontarJogos
            aberto
            jogo={montagem.jogo}
            dezenas={montagem.dezenas}
            valorApostaSimples={(codigo) => valores.data?.get(codigo)?.valorAposta ?? null}
            aoFechar={() => {
              setMontagem(null);
            }}
            salvarFavoritos={(itens, desabilitado) => (
              <BotaoSalvarFavoritosLote itens={itens} desabilitado={desabilitado} />
            )}
            aoApostar={(itens) => {
              setMontagem(null);
              abrirApostar({ jogo: montagem.jogo, dezenas: [], itens });
            }}
          />
        </Suspense>
      )}
    </PaginaConta>
  );
};

export default Palpites;

import {
  apresentacoesJogo,
  calcularValorAposta,
  isCodigoJogo,
  listarCombinacoes,
  obterApresentacaoJogo,
  obterRegraJogo,
  sortearCombinacoes,
  type ApresentacaoJogo,
} from '@mega/domain';
import { useState } from 'react';
import { Dialogo } from '@/components/ui/dialogo';
import { sortearInteiro } from '@/lib/aleatorio';
import { estiloCorJogo } from '@/lib/cor-jogo';
import { formatarInteiro } from '@/lib/formatadores';
import { LIMITE_JOGOS_MONTADOS, type JogoMontado, type JogoParaAposta } from '../types';
import { chaveJogo, tamanhosPossiveis } from '../utils';
import { DezenasBase } from './dezenas-base';
import { GerarJogos, type ConfiguracaoGeracao } from './gerar-jogos';
import { ListaJogosMontados } from './lista-jogos-montados';

interface DialogoMontarJogosProps {
  readonly aberto: boolean;
  readonly jogo: string;
  readonly dezenas: readonly number[];
  readonly valorApostaSimples: (jogo: string) => number | null;
  readonly aoFechar: () => void;
  readonly aoUsarNaAposta: (jogos: readonly JogoParaAposta[]) => void;
}

const NOME_MANUAL = 'Jogo montado';
const NOME_TODAS = 'Combinação';
const NOME_SORTEADA = 'Combinação sorteada';
const QUANTIDADE_SORTEIO_PADRAO = 10;

const classeSelect =
  'rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950';

const jogosQueComportam = (dezenas: readonly number[]): readonly ApresentacaoJogo[] =>
  apresentacoesJogo.filter((apresentacao) => {
    if (apresentacao.disponibilidade !== 'disponivel' || !isCodigoJogo(apresentacao.codigo))
      return false;
    const { universo } = obterRegraJogo(apresentacao.codigo);
    return dezenas.every((dezena) => dezena >= universo.minimo && dezena <= universo.maximo);
  });

const descreverAdicao = (adicionados: number, repetidos: number, cortados: number): string =>
  [
    `${formatarInteiro(adicionados)} ${adicionados === 1 ? 'jogo adicionado' : 'jogos adicionados'}`,
    repetidos > 0 && `${formatarInteiro(repetidos)} já estavam na lista`,
    cortados > 0 &&
      `${formatarInteiro(cortados)} ignorados pelo limite de ${LIMITE_JOGOS_MONTADOS}`,
  ]
    .filter(Boolean)
    .join(' · ');

const Conteudo = ({
  jogo: jogoInicial,
  dezenas,
  valorApostaSimples,
  aoUsarNaAposta,
}: Omit<DialogoMontarJogosProps, 'aberto' | 'aoFechar'>) => {
  const [base, setBase] = useState<readonly number[]>(() => [...dezenas].sort((a, b) => a - b));
  const [marcadas, setMarcadas] = useState<ReadonlySet<number>>(new Set());
  const [jogo, setJogo] = useState(jogoInicial);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoGeracao>({
    tamanho: 0,
    modo: 'sortear',
    quantidade: QUANTIDADE_SORTEIO_PADRAO,
  });
  const [jogos, setJogos] = useState<readonly JogoMontado[]>([]);
  const [proximaChave, setProximaChave] = useState(1);
  const [aviso, setAviso] = useState<string | null>(null);

  const compativeis = jogosQueComportam(base);
  const apresentacao = obterApresentacaoJogo(jogo);
  if (!apresentacao || !isCodigoJogo(jogo)) return null;
  const regra = obterRegraJogo(jogo);
  const tamanhos = tamanhosPossiveis(regra, base.length);
  const tamanho = tamanhos.includes(configuracao.tamanho)
    ? configuracao.tamanho
    : (tamanhos[0] ?? 0);
  const configuracaoAtual = { ...configuracao, tamanho };

  const valorDe = (item: Pick<JogoMontado, 'jogo' | 'dezenas'>): number | null => {
    const valorSimples = valorApostaSimples(item.jogo);
    return valorSimples === null || !isCodigoJogo(item.jogo)
      ? null
      : calcularValorAposta(obterRegraJogo(item.jogo), item.dezenas.length, valorSimples);
  };

  const adicionar = (novos: readonly (readonly number[])[], nome: string) => {
    const existentes = new Set(jogos.map((item) => chaveJogo(item.jogo, item.dezenas)));
    const ineditos = novos.filter((dezenasJogo) => !existentes.has(chaveJogo(jogo, dezenasJogo)));
    const aceitos = ineditos.slice(0, LIMITE_JOGOS_MONTADOS - jogos.length);
    setJogos([
      ...jogos,
      ...aceitos.map((dezenasJogo, indice) => ({
        chave: proximaChave + indice,
        jogo,
        dezenas: dezenasJogo,
        nome,
      })),
    ]);
    setProximaChave(proximaChave + aceitos.length);
    setAviso(
      descreverAdicao(
        aceitos.length,
        novos.length - ineditos.length,
        ineditos.length - aceitos.length,
      ),
    );
  };

  const alternar = (dezena: number) => {
    setMarcadas((atuais) => {
      const proximas = new Set(atuais);
      if (!proximas.delete(dezena)) proximas.add(dezena);
      return proximas;
    });
  };

  const adicionarManual = () => {
    adicionar([[...marcadas].sort((a, b) => a - b)], NOME_MANUAL);
    setMarcadas(new Set());
  };

  const removerDaBase = () => {
    setBase(base.filter((dezena) => !marcadas.has(dezena)));
    setMarcadas(new Set());
  };

  const gerar = () => {
    if (configuracaoAtual.modo === 'todas') {
      adicionar(listarCombinacoes(base, tamanho, LIMITE_JOGOS_MONTADOS), NOME_TODAS);
      return;
    }
    adicionar(
      sortearCombinacoes(base, tamanho, configuracaoAtual.quantidade, sortearInteiro),
      NOME_SORTEADA,
    );
  };

  const usarNaAposta = () => {
    aoUsarNaAposta(
      jogos.map((item) => ({
        jogo: item.jogo,
        dezenas: item.dezenas,
        nome: item.nome,
        favoritoId: null,
      })),
    );
  };

  return (
    <div
      style={estiloCorJogo(apresentacao)}
      className="grid h-full gap-3 lg:grid-cols-[26rem_minmax(0,1fr)]"
    >
      <div className="flex flex-col gap-3 lg:min-h-0 lg:overflow-auto">
        <label className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Tipo de jogo
          </span>
          <select
            value={jogo}
            onChange={(evento) => {
              setJogo(evento.target.value);
            }}
            className={classeSelect}
          >
            {compativeis.map((item) => (
              <option key={item.codigo} value={item.codigo}>
                {item.nome}
              </option>
            ))}
          </select>
        </label>
        <DezenasBase
          regra={regra}
          base={base}
          marcadas={marcadas}
          aoAlternar={alternar}
          aoAdicionarJogo={adicionarManual}
          aoRemoverDaBase={removerDaBase}
        />
        <GerarJogos
          regra={regra}
          totalBase={base.length}
          configuracao={configuracaoAtual}
          valorPorJogo={valorDe({ jogo, dezenas: base.slice(0, tamanho) })}
          aoMudar={setConfiguracao}
          aoGerar={gerar}
        />
      </div>
      <div className="lg:min-h-0">
        <ListaJogosMontados
          jogos={jogos}
          aviso={aviso}
          valorDe={valorDe}
          aoRemover={(chave) => {
            setJogos(jogos.filter((item) => item.chave !== chave));
          }}
          aoLimpar={() => {
            setJogos([]);
            setAviso(null);
          }}
          aoUsarNaAposta={usarNaAposta}
        />
      </div>
    </div>
  );
};

export const DialogoMontarJogos = ({ aberto, aoFechar, ...props }: DialogoMontarJogosProps) => (
  <Dialogo aberto={aberto} titulo="Montar jogos" aoFechar={aoFechar}>
    {aberto && <Conteudo {...props} />}
  </Dialogo>
);

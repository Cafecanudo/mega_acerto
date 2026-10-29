import type { ResultadoAleatoriedade } from '@mega/analises';
import { nomeEsforco, nomeModelo, obterTipoAnalise } from '@mega/analises/catalogo';
import {
  formatarDezena,
  isCodigoJogo,
  obterApresentacaoJogo,
  obterRegraJogo,
  type RegraJogo,
} from '@mega/domain';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Carregando, Falha } from '@/components/ui/estado';
import {
  formatarDataHora,
  formatarDecimal,
  formatarDolar,
  formatarDuracao,
  formatarPValor,
} from '@/lib/formatadores';
import { estiloCorJogo } from '@/lib/cor-jogo';
import { obterAnaliseQuery } from '../api/analises';
import { emAndamento, type Analise, type AnaliseAleatoriedade } from '../types';
import { GraficoFrequencias } from './grafico-frequencias';
import { Conferencia, Limitacoes, Scripts, Secao } from './partes-resultado';
import { ResultadoEstrategiaConcluida, type PalpiteAnalise } from './resultado-estrategia';
import { SeloStatus } from './selo-status';

interface ResultadoAnaliseProps {
  readonly id: number;
  readonly acoesPalpite?: (palpite: PalpiteAnalise) => ReactNode;
}

const Cabecalho = ({ analise }: { readonly analise: Analise }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
    <span className="font-semibold">
      #{analise.id} · {obterTipoAnalise(analise.tipo).nome}
    </span>
    <SeloStatus status={analise.status} />
    <span className="text-slate-500 dark:text-slate-400">
      {nomeModelo(analise.modelo)} · esforço {nomeEsforco(analise.esforco).toLowerCase()} · prompt v
      {analise.versaoPrompt} · até o concurso {analise.ultimoConcurso} ·{' '}
      {formatarDataHora(analise.criadoEm)} · {formatarDuracao(analise.duracaoMs)} · custo equiv.{' '}
      {formatarDolar(analise.custoUsd)}
    </span>
  </div>
);

const TabelaTestes = ({ testes }: { readonly testes: ResultadoAleatoriedade['testes'] }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[720px] text-left text-sm">
      <thead className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
        <tr className="border-b border-slate-200 dark:border-slate-800">
          <th className="py-2 pr-3">Teste</th>
          <th className="py-2 pr-3 text-right">Estatística</th>
          <th className="py-2 pr-3 text-right">p-valor</th>
          <th className="py-2 pr-3 text-right">p corrigido</th>
          <th className="py-2 pr-3">Efeito</th>
          <th className="py-2">Decisão</th>
        </tr>
      </thead>
      <tbody>
        {testes.map((teste) => (
          <tr
            key={teste.nome}
            className="border-b border-slate-100 align-top last:border-0 dark:border-slate-800/60"
          >
            <td className="py-2 pr-3">
              <div className="font-medium">{teste.nome}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {teste.interpretacao}
              </div>
            </td>
            <td className="py-2 pr-3 text-right tabular-nums">
              {formatarDecimal(teste.estatistica, 3)}
              {teste.grausLiberdade !== null && (
                <span className="text-xs text-slate-500"> (gl {teste.grausLiberdade})</span>
              )}
            </td>
            <td className="py-2 pr-3 text-right tabular-nums">{formatarPValor(teste.pValor)}</td>
            <td className="py-2 pr-3 text-right tabular-nums">
              {formatarPValor(teste.pValorCorrigido)}
            </td>
            <td className="py-2 pr-3 text-xs">{teste.tamanhoEfeito}</td>
            <td className="py-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  teste.rejeitaH0
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {teste.rejeitaH0 ? 'Rejeita H0' : 'Não rejeita'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Pares = ({
  regra,
  pares,
}: {
  readonly regra: RegraJogo;
  readonly pares: ResultadoAleatoriedade['paresRelevantes'];
}) =>
  pares.length === 0 ? (
    <p className="text-sm text-slate-500 dark:text-slate-400">
      Nenhum par de dezenas com frequência anormal após a correção para múltiplas comparações.
    </p>
  ) : (
    <ul className="flex flex-wrap gap-2 text-sm">
      {pares.map((par) => (
        <li
          key={`${par.dezenaA}-${par.dezenaB}`}
          className="rounded-lg border border-slate-200 px-2.5 py-1 font-mono dark:border-slate-700"
        >
          {formatarDezena(regra, par.dezenaA)}-{formatarDezena(regra, par.dezenaB)}:{' '}
          {par.ocorrencias} vs {formatarDecimal(par.esperado, 1)} (p{' '}
          {formatarPValor(par.pValorCorrigido)})
        </li>
      ))}
    </ul>
  );

const Concluida = ({
  regra,
  analise,
  resultado,
}: {
  readonly regra: RegraJogo;
  readonly analise: AnaliseAleatoriedade;
  readonly resultado: ResultadoAleatoriedade;
}) => (
  <>
    <Secao titulo="Conclusão">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            resultado.conclusao.rejeitaUniformidade
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
          }`}
        >
          {resultado.conclusao.rejeitaUniformidade
            ? 'Evidência contra a uniformidade'
            : 'Compatível com sorteio uniforme'}
        </span>
        <span className="text-sm font-medium">{resultado.conclusao.resumo}</span>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300">
        {resultado.conclusao.interpretacao}
      </p>
      <Conferencia doClaude={resultado.conferencia} doSistema={analise.conferenciaSistema} />
    </Secao>
    <Secao titulo={`Frequência por dezena · ${resultado.amostra.concursos} concursos`}>
      <GraficoFrequencias
        regra={regra}
        dezenas={resultado.dezenas}
        esperado={resultado.amostra.frequenciaEsperadaPorDezena}
      />
    </Secao>
    <Secao titulo="Testes estatísticos">
      <TabelaTestes testes={resultado.testes} />
    </Secao>
    <Secao titulo="Pares de dezenas">
      <Pares regra={regra} pares={resultado.paresRelevantes} />
    </Secao>
    <Secao titulo="Limitações">
      <Limitacoes limitacoes={resultado.conclusao.limitacoes} />
    </Secao>
    {analise.scripts.length > 0 && (
      <Secao titulo={`Scripts executados pelo Claude (${analise.scripts.length})`}>
        <Scripts scripts={analise.scripts} />
      </Secao>
    )}
  </>
);

const ConteudoConcluido = ({
  regra,
  analise,
  acoesPalpite,
}: {
  readonly regra: RegraJogo;
  readonly analise: Analise;
  readonly acoesPalpite: ResultadoAnaliseProps['acoesPalpite'];
}) => {
  if (analise.tipo === 'estrategia') {
    return analise.resultado ? (
      <ResultadoEstrategiaConcluida
        regra={regra}
        analise={analise}
        resultado={analise.resultado}
        acoesPalpite={acoesPalpite}
      />
    ) : null;
  }
  return analise.resultado ? (
    <Concluida regra={regra} analise={analise} resultado={analise.resultado} />
  ) : null;
};

export const ResultadoAnalise = ({ id, acoesPalpite }: ResultadoAnaliseProps) => {
  const consulta = useQuery(obterAnaliseQuery(id));

  if (consulta.isPending) return <Carregando mensagem="Carregando análise…" />;
  if (consulta.isError) return <Falha erro={consulta.error} />;

  const analise = consulta.data;
  const apresentacao = obterApresentacaoJogo(analise.jogo);
  if (!apresentacao || !isCodigoJogo(analise.jogo))
    return <Falha erro={new Error(`Jogo ${analise.jogo} indisponível`)} />;
  const regra = obterRegraJogo(analise.jogo);

  return (
    <div style={estiloCorJogo(apresentacao)} className="flex flex-col gap-3">
      <Cabecalho analise={analise} />
      {emAndamento(analise.status) && (
        <Carregando
          mensagem={
            analise.status === 'pendente'
              ? 'Na fila do worker…'
              : 'O Claude está calculando. Isso pode levar alguns minutos.'
          }
        />
      )}
      {analise.status === 'falhou' && (
        <Secao titulo="A análise falhou">
          <p className="text-sm text-rose-600 dark:text-rose-400">{analise.erro}</p>
          {analise.scripts.length > 0 && <Scripts scripts={analise.scripts} />}
        </Secao>
      )}
      {analise.status === 'concluida' && (
        <ConteudoConcluido regra={regra} analise={analise} acoesPalpite={acoesPalpite} />
      )}
    </div>
  );
};

import type { ResultadoAleatoriedade } from '@mega/analises';
import { nomeEsforco, nomeModelo, obterTipoAnalise } from '@mega/analises/catalogo';
import { formatarDezena, type RegraJogo } from '@mega/domain';
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
import { obterAnaliseQuery } from '../api/analises';
import { emAndamento, type Analise, type ConferenciaSistema } from '../types';
import { GraficoFrequencias } from './grafico-frequencias';
import { SeloStatus } from './selo-status';

interface ResultadoAnaliseProps {
  readonly regra: RegraJogo;
  readonly id: number;
}

const Secao = ({
  titulo,
  children,
}: {
  readonly titulo: ReactNode;
  readonly children: ReactNode;
}) => (
  <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
    <h3 className="text-sm font-semibold">{titulo}</h3>
    {children}
  </section>
);

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

const Conferencia = ({
  doClaude,
  doSistema,
}: {
  readonly doClaude: ResultadoAleatoriedade['conferencia'];
  readonly doSistema: ConferenciaSistema | null;
}) => {
  const ok = doClaude.frequenciasConferem && (doSistema?.ok ?? false);
  const divergencias = [...doClaude.divergencias, ...(doSistema?.divergencias ?? [])];

  return (
    <div
      className={`rounded-lg px-3 py-2 text-sm ${
        ok
          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300'
          : 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300'
      }`}
    >
      {ok
        ? 'Conferência ok: as contagens do Claude batem com os agregados SQL do sistema.'
        : 'Atenção: há divergências entre os cálculos do Claude e os agregados SQL.'}
      {divergencias.length > 0 && (
        <ul className="mt-1 list-disc pl-5 text-xs">
          {divergencias.slice(0, 10).map((divergencia) => (
            <li key={divergencia}>{divergencia}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

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

const Scripts = ({ scripts }: { readonly scripts: Analise['scripts'] }) => (
  <div className="flex flex-col gap-2">
    {scripts.map((script) => (
      <details
        key={script.nome}
        className="rounded-lg border border-slate-200 dark:border-slate-800"
      >
        <summary className="cursor-pointer px-3 py-2 font-mono text-xs">{script.nome}</summary>
        <pre className="max-h-96 overflow-auto border-t border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950">
          {script.conteudo}
        </pre>
      </details>
    ))}
  </div>
);

const Concluida = ({
  regra,
  analise,
  resultado,
}: {
  readonly regra: RegraJogo;
  readonly analise: Analise;
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
      <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
        {resultado.conclusao.limitacoes.map((limitacao) => (
          <li key={limitacao}>{limitacao}</li>
        ))}
      </ul>
    </Secao>
    {analise.scripts.length > 0 && (
      <Secao titulo={`Scripts executados pelo Claude (${analise.scripts.length})`}>
        <Scripts scripts={analise.scripts} />
      </Secao>
    )}
  </>
);

export const ResultadoAnalise = ({ regra, id }: ResultadoAnaliseProps) => {
  const consulta = useQuery(obterAnaliseQuery(regra.codigo, id));

  if (consulta.isPending) return <Carregando mensagem="Carregando análise…" />;
  if (consulta.isError) return <Falha erro={consulta.error} />;

  const analise = consulta.data;

  return (
    <div className="flex flex-col gap-3">
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
      {analise.status === 'concluida' && analise.resultado && (
        <Concluida regra={regra} analise={analise} resultado={analise.resultado} />
      )}
    </div>
  );
};

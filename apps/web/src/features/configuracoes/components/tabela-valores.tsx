import { apresentacoesJogo, type ApresentacaoJogo } from '@mega/domain';
import { IconClover, IconDeviceFloppy } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState, type SyntheticEvent } from 'react';
import { Carregando, Falha } from '@/components/ui/estado';
import { formatarDataHora, formatarMoeda } from '@/lib/formatadores';
import { listarValoresQuery, useSalvarValor, type ValorConfigurado } from '../api/valores';

const lerValor = (texto: string): number | null => {
  const numero = Number.parseFloat(texto.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(numero) && numero > 0 ? numero : null;
};

const formatarEntrada = (valor: number | null): string =>
  valor === null ? '' : valor.toFixed(2).replace('.', ',');

const LinhaValor = ({
  apresentacao,
  configurado,
}: {
  readonly apresentacao: ApresentacaoJogo;
  readonly configurado: ValorConfigurado | undefined;
}) => {
  const [texto, setTexto] = useState(formatarEntrada(configurado?.valorAposta ?? null));
  const salvar = useSalvarValor();
  const valor = lerValor(texto);
  const alterado = valor !== null && valor !== configurado?.valorAposta;

  const enviar = (evento: SyntheticEvent) => {
    evento.preventDefault();
    if (valor === null) return;
    salvar.mutate({ jogo: apresentacao.codigo, valorAposta: valor });
  };

  return (
    <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
      <td className="px-4 py-3">
        <span className="flex items-center gap-2 font-medium">
          <IconClover
            aria-hidden
            size="1.25rem"
            stroke={1.75}
            color={apresentacao.cor}
            className="dark:brightness-[1.8] dark:saturate-150"
          />
          {apresentacao.nome}
        </span>
      </td>
      <td className="px-4 py-3 tabular-nums">{formatarMoeda(configurado?.valorAposta ?? null)}</td>
      <td className="px-4 py-3">
        <form onSubmit={enviar} className="flex items-center gap-2">
          <label className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus-within:border-emerald-500 dark:border-slate-700 dark:bg-slate-950">
            <span className="text-slate-400">R$</span>
            <input
              value={texto}
              onChange={(evento) => {
                setTexto(evento.target.value);
              }}
              inputMode="decimal"
              placeholder="0,00"
              aria-label={`Valor da aposta simples de ${apresentacao.nome}`}
              className="w-24 bg-transparent tabular-nums outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={!alterado || salvar.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconDeviceFloppy aria-hidden size="1rem" />
            Salvar
          </button>
          {salvar.isError && (
            <span className="text-xs text-rose-600 dark:text-rose-400">{salvar.error.message}</span>
          )}
        </form>
      </td>
      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
        {configurado?.atualizadoEm ? formatarDataHora(configurado.atualizadoEm) : 'Não configurado'}
      </td>
    </tr>
  );
};

export const TabelaValores = () => {
  const consulta = useQuery(listarValoresQuery());

  if (consulta.isPending) return <Carregando mensagem="Carregando valores…" />;
  if (consulta.isError) return <Falha erro={consulta.error} />;

  return (
    <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-2">Jogo</th>
              <th className="px-4 py-2">Valor atual</th>
              <th className="px-4 py-2">Novo valor da aposta simples</th>
              <th className="px-4 py-2">Atualizado em</th>
            </tr>
          </thead>
          <tbody>
            {apresentacoesJogo.map((apresentacao) => (
              <LinhaValor
                key={`${apresentacao.codigo}-${String(consulta.data.get(apresentacao.codigo)?.atualizadoEm)}`}
                apresentacao={apresentacao}
                configurado={consulta.data.get(apresentacao.codigo)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

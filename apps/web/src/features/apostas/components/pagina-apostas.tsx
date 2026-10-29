import { IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Dialogo } from '@/components/ui/dialogo';
import { Carregando, Falha, Vazio } from '@/components/ui/estado';
import { listarApostasQuery } from '../api/apostas';
import type { Aposta } from '../types';
import { CartaoAposta } from './cartao-aposta';
import { FormularioAposta, type SelecaoDezenas } from './formulario-aposta';
import { ResumoApostas } from './resumo-apostas';

interface PaginaApostasProps {
  readonly somenteFavoritas: boolean;
  readonly painelDezenas?: (selecao: SelecaoDezenas) => ReactNode;
}

type EstadoDialogo =
  | { readonly modo: 'fechado' }
  | { readonly modo: 'nova' }
  | {
      readonly modo: 'edicao';
      readonly aposta: Aposta;
    };

const Lista = ({
  somenteFavoritas,
  aoEditar,
}: {
  readonly somenteFavoritas: boolean;
  readonly aoEditar: (aposta: Aposta) => void;
}) => {
  const consulta = useQuery(listarApostasQuery(somenteFavoritas));

  if (consulta.isPending) return <Carregando mensagem="Carregando apostas…" />;
  if (consulta.isError) return <Falha erro={consulta.error} />;
  if (consulta.data.length === 0) {
    return (
      <Vazio>
        {somenteFavoritas
          ? 'Nenhuma aposta favorita. Crie uma ou use a estrela de uma aposta.'
          : 'Nenhuma aposta ainda. Use o botão Nova aposta para criar a primeira.'}
      </Vazio>
    );
  }

  return (
    <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1">
      <ResumoApostas apostas={consulta.data} somenteFavoritas={somenteFavoritas} />
      <div className="grid content-start gap-3 lg:min-h-0 lg:flex-1 lg:overflow-auto xl:grid-cols-2 2xl:grid-cols-3">
        {consulta.data.map((aposta) => (
          <CartaoAposta key={aposta.id} aposta={aposta} aoEditar={aoEditar} />
        ))}
      </div>
    </div>
  );
};

const ConteudoDialogo = ({
  emEdicao,
  somenteFavoritas,
  painelDezenas,
  aoConcluir,
}: PaginaApostasProps & {
  readonly emEdicao: Aposta | null;
  readonly aoConcluir: () => void;
}) => {
  const [selecao, setSelecao] = useState<SelecaoDezenas | null>(null);
  const exibirPainel =
    painelDezenas !== undefined && selecao !== null && selecao.dezenas.length > 0;

  return (
    <div className="grid h-full gap-3 lg:grid-cols-[24rem_minmax(0,1fr)]">
      <div className="lg:self-start">
        <FormularioAposta
          emEdicao={emEdicao}
          favoritaPadrao={somenteFavoritas}
          aoConcluir={aoConcluir}
          aoAlterarSelecao={setSelecao}
        />
      </div>
      <div className="flex flex-col lg:min-h-0">
        {exibirPainel ? (
          painelDezenas(selecao)
        ) : (
          <Vazio>Marque as dezenas para ver quando elas foram sorteadas.</Vazio>
        )}
      </div>
    </div>
  );
};

export const PaginaApostas = ({ somenteFavoritas, painelDezenas }: PaginaApostasProps) => {
  const [dialogo, setDialogo] = useState<EstadoDialogo>({ modo: 'fechado' });
  const fechar = () => {
    setDialogo({ modo: 'fechado' });
  };
  const emEdicao = dialogo.modo === 'edicao' ? dialogo.aposta : null;

  return (
    <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1">
      <div className="flex shrink-0 justify-end">
        <button
          type="button"
          onClick={() => {
            setDialogo({ modo: 'nova' });
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <IconPlus aria-hidden size="1rem" />
          {somenteFavoritas ? 'Nova favorita' : 'Nova aposta'}
        </button>
      </div>
      <Lista
        somenteFavoritas={somenteFavoritas}
        aoEditar={(aposta) => {
          setDialogo({ modo: 'edicao', aposta });
        }}
      />
      <Dialogo
        aberto={dialogo.modo !== 'fechado'}
        titulo={
          emEdicao
            ? `Editar ${emEdicao.nome ?? `aposta #${emEdicao.id}`}`
            : somenteFavoritas
              ? 'Nova favorita'
              : 'Nova aposta'
        }
        aoFechar={fechar}
      >
        <ConteudoDialogo
          key={emEdicao ? `editar-${emEdicao.id}` : 'nova'}
          emEdicao={emEdicao}
          somenteFavoritas={somenteFavoritas}
          painelDezenas={painelDezenas}
          aoConcluir={fechar}
        />
      </Dialogo>
    </div>
  );
};

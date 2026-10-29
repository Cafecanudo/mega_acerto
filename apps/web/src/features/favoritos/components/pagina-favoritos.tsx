import { IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { BaloesAcertos } from '@/components/ui/baloes-acertos';
import { Dialogo } from '@/components/ui/dialogo';
import { Carregando, Falha, Vazio } from '@/components/ui/estado';
import { resumirAcertos } from '@/lib/acertos';
import { listarFavoritosQuery } from '../api/favoritos';
import type { Favorito } from '../types';
import { CartaoFavorito } from './cartao-favorito';
import { FormularioFavorito, type SelecaoDezenas } from './formulario-favorito';

interface PaginaFavoritosProps {
  readonly painelDezenas?: (selecao: SelecaoDezenas) => ReactNode;
}

type EstadoDialogo =
  | { readonly modo: 'fechado' }
  | { readonly modo: 'novo' }
  | { readonly modo: 'edicao'; readonly favorito: Favorito };

const Lista = ({ aoEditar }: { readonly aoEditar: (favorito: Favorito) => void }) => {
  const consulta = useQuery(listarFavoritosQuery());

  if (consulta.isPending) return <Carregando mensagem="Carregando favoritos…" />;
  if (consulta.isError) return <Falha erro={consulta.error} />;
  if (consulta.data.length === 0) {
    return <Vazio>Nenhum favorito ainda. Use o botão Novo favorito para criar o primeiro.</Vazio>;
  }

  return (
    <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1">
      <BaloesAcertos
        resumo={resumirAcertos(consulta.data)}
        rotuloComAcertos="Favoritos com acertos"
        grupo="favoritos"
      />
      <div className="grid content-start gap-3 lg:min-h-0 lg:flex-1 lg:overflow-auto xl:grid-cols-2 2xl:grid-cols-3">
        {consulta.data.map((favorito) => (
          <CartaoFavorito key={favorito.id} favorito={favorito} aoEditar={aoEditar} />
        ))}
      </div>
    </div>
  );
};

const ConteudoDialogo = ({
  emEdicao,
  painelDezenas,
  aoConcluir,
}: PaginaFavoritosProps & {
  readonly emEdicao: Favorito | null;
  readonly aoConcluir: () => void;
}) => {
  const [selecao, setSelecao] = useState<SelecaoDezenas | null>(null);
  const exibirPainel =
    painelDezenas !== undefined && selecao !== null && selecao.dezenas.length > 0;

  return (
    <div className="grid h-full gap-3 lg:grid-cols-[24rem_minmax(0,1fr)]">
      <div className="lg:self-start">
        <FormularioFavorito
          emEdicao={emEdicao}
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

export const PaginaFavoritos = ({ painelDezenas }: PaginaFavoritosProps) => {
  const [dialogo, setDialogo] = useState<EstadoDialogo>({ modo: 'fechado' });
  const fechar = () => {
    setDialogo({ modo: 'fechado' });
  };
  const emEdicao = dialogo.modo === 'edicao' ? dialogo.favorito : null;

  return (
    <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1">
      <div className="flex shrink-0 justify-end">
        <button
          type="button"
          onClick={() => {
            setDialogo({ modo: 'novo' });
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <IconPlus aria-hidden size="1rem" />
          Novo favorito
        </button>
      </div>
      <Lista
        aoEditar={(favorito) => {
          setDialogo({ modo: 'edicao', favorito });
        }}
      />
      <Dialogo
        aberto={dialogo.modo !== 'fechado'}
        titulo={
          emEdicao ? `Editar ${emEdicao.nome ?? `favorito #${emEdicao.id}`}` : 'Novo favorito'
        }
        aoFechar={fechar}
      >
        <ConteudoDialogo
          key={emEdicao ? `editar-${emEdicao.id}` : 'novo'}
          emEdicao={emEdicao}
          painelDezenas={painelDezenas}
          aoConcluir={fechar}
        />
      </Dialogo>
    </div>
  );
};

import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Carregando, Falha, Vazio } from '@/components/ui/estado';
import { listarApostasQuery } from '../api/apostas';
import type { Aposta } from '../types';
import { CartaoAposta } from './cartao-aposta';
import { FormularioAposta, type SelecaoDezenas } from './formulario-aposta';
import { ResumoFavoritas } from './resumo-favoritas';

interface PaginaApostasProps {
  readonly somenteFavoritas: boolean;
  readonly painelDezenas?: (selecao: SelecaoDezenas) => ReactNode;
}

const Lista = ({
  somenteFavoritas,
  aoEditar,
}: PaginaApostasProps & { readonly aoEditar: (aposta: Aposta) => void }) => {
  const consulta = useQuery(listarApostasQuery(somenteFavoritas));

  if (consulta.isPending) return <Carregando mensagem="Carregando apostas…" />;
  if (consulta.isError) return <Falha erro={consulta.error} />;
  if (consulta.data.length === 0) {
    return (
      <Vazio>
        {somenteFavoritas
          ? 'Nenhuma aposta favorita. Use a estrela de uma aposta para marcá-la.'
          : 'Nenhuma aposta ainda. Escolha as dezenas ao lado e crie a primeira.'}
      </Vazio>
    );
  }

  return (
    <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1">
      {somenteFavoritas && <ResumoFavoritas apostas={consulta.data} />}
      <div className="grid content-start gap-3 lg:min-h-0 lg:flex-1 lg:overflow-auto 2xl:grid-cols-2">
        {consulta.data.map((aposta) => (
          <CartaoAposta key={aposta.id} aposta={aposta} aoEditar={aoEditar} />
        ))}
      </div>
    </div>
  );
};

export const PaginaApostas = ({ somenteFavoritas, painelDezenas }: PaginaApostasProps) => {
  const [emEdicao, setEmEdicao] = useState<Aposta | null>(null);
  const [versaoFormulario, setVersaoFormulario] = useState(0);
  const [selecao, setSelecao] = useState<SelecaoDezenas | null>(null);
  const exibirPainel = painelDezenas !== undefined && (selecao?.dezenas.length ?? 0) > 0;

  const concluir = () => {
    setEmEdicao(null);
    setVersaoFormulario((versao) => versao + 1);
  };

  return (
    <div className="grid gap-3 lg:min-h-0 lg:flex-1 xl:grid-cols-[24rem_minmax(0,1fr)]">
      <div className="xl:self-start">
        <FormularioAposta
          key={emEdicao ? `editar-${emEdicao.id}` : `nova-${versaoFormulario}`}
          emEdicao={emEdicao}
          favoritaPadrao={somenteFavoritas}
          aoConcluir={concluir}
          aoAlterarSelecao={setSelecao}
        />
      </div>
      <div className="flex flex-col gap-3 lg:min-h-0">
        {exibirPainel && selecao && (
          <div className="flex flex-col lg:min-h-0 lg:flex-[3]">{painelDezenas(selecao)}</div>
        )}
        <div className={`flex flex-col lg:min-h-0 ${exibirPainel ? 'lg:flex-[2]' : 'lg:flex-1'}`}>
          <Lista somenteFavoritas={somenteFavoritas} aoEditar={setEmEdicao} />
        </div>
      </div>
    </div>
  );
};

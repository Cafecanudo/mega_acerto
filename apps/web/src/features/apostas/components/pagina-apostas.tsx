import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Carregando, Falha, Vazio } from '@/components/ui/estado';
import { listarApostasQuery } from '../api/apostas';
import type { Aposta } from '../types';
import { CartaoAposta } from './cartao-aposta';
import { FormularioAposta } from './formulario-aposta';

interface PaginaApostasProps {
  readonly somenteFavoritas: boolean;
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
    <div className="grid gap-3 2xl:grid-cols-2">
      {consulta.data.map((aposta) => (
        <CartaoAposta key={aposta.id} aposta={aposta} aoEditar={aoEditar} />
      ))}
    </div>
  );
};

export const PaginaApostas = ({ somenteFavoritas }: PaginaApostasProps) => {
  const [emEdicao, setEmEdicao] = useState<Aposta | null>(null);
  const [versaoFormulario, setVersaoFormulario] = useState(0);

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
        />
      </div>
      <div className="lg:min-h-0 lg:overflow-auto">
        <Lista somenteFavoritas={somenteFavoritas} aoEditar={setEmEdicao} />
      </div>
    </div>
  );
};

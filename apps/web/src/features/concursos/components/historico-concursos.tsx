import type { RegraJogo } from '@mega/domain';
import { useQuery } from '@tanstack/react-query';
import { Cartao } from '@/components/ui/cartao';
import { Carregando, Falha, Vazio } from '@/components/ui/estado';
import { Paginacao } from '@/components/ui/paginacao';
import { listarConcursosQuery } from '../api/consultas';
import { TabelaConcursos } from './tabela-concursos';

interface HistoricoConcursosProps {
  readonly regra: RegraJogo;
  readonly pagina: number;
  readonly aoMudarPagina: (pagina: number) => void;
}

export const HistoricoConcursos = ({ regra, pagina, aoMudarPagina }: HistoricoConcursosProps) => {
  const consulta = useQuery(listarConcursosQuery(regra.codigo, pagina));

  if (consulta.isPending) return <Carregando mensagem="Carregando concursos…" />;
  if (consulta.isError) return <Falha erro={consulta.error} />;

  const { itens, total, tamanho } = consulta.data;

  return (
    <Cartao titulo="Todos os concursos">
      {itens.length === 0 ? (
        <Vazio>Nenhum concurso importado ainda. A sincronização inicial está em andamento.</Vazio>
      ) : (
        <div className={`flex flex-col gap-4 ${consulta.isPlaceholderData ? 'opacity-60' : ''}`}>
          <TabelaConcursos regra={regra} concursos={itens} />
          <Paginacao pagina={pagina} tamanho={tamanho} total={total} aoMudar={aoMudarPagina} />
        </div>
      )}
    </Cartao>
  );
};

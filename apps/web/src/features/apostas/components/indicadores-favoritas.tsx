import { IconTarget, IconTrophy } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { listarApostasQuery } from '../api/apostas';
import { resumirFavoritas } from '../resumir-favoritas';

interface IndicadoresFavoritasProps {
  readonly jogo: string;
}

const Pilula = ({
  icone,
  valor,
  descricao,
}: {
  readonly icone: ReactNode;
  readonly valor: string;
  readonly descricao: string;
}) => (
  <span
    title={descricao}
    aria-label={descricao}
    className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[0.68rem] font-semibold text-amber-700 tabular-nums dark:bg-amber-500/15 dark:text-amber-300"
  >
    {icone}
    {valor}
  </span>
);

export const IndicadoresFavoritas = ({ jogo }: IndicadoresFavoritasProps) => {
  const { data: apostas = [] } = useQuery(listarApostasQuery(true));
  const doJogo = apostas.filter((aposta) => aposta.jogo === jogo);
  const { total, comAcertos, maiorAcerto } = resumirFavoritas(doJogo);

  if (total === 0) return null;

  return (
    <span className="ml-auto flex shrink-0 flex-col items-end gap-0.5">
      <Pilula
        icone={<IconTarget aria-hidden size="0.75rem" />}
        valor={`${comAcertos}/${total}`}
        descricao={`${comAcertos} de ${total} favoritas acertaram no último concurso`}
      />
      <Pilula
        icone={<IconTrophy aria-hidden size="0.75rem" />}
        valor={String(maiorAcerto)}
        descricao={`Maior número de acertos entre as favoritas: ${maiorAcerto}`}
      />
    </span>
  );
};

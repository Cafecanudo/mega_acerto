import { IconTarget, IconTrophy } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { listarApostasQuery } from '../api/apostas';
import { resumirApostas } from '../resumir-apostas';

interface IndicadoresApostasProps {
  readonly somenteFavoritas: boolean;
  readonly jogo?: string;
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

export const IndicadoresApostas = ({ somenteFavoritas, jogo }: IndicadoresApostasProps) => {
  const { data: apostas = [] } = useQuery(listarApostasQuery(somenteFavoritas));
  const filtradas = jogo ? apostas.filter((aposta) => aposta.jogo === jogo) : apostas;
  const { total, comAcertos, maiorAcerto } = resumirApostas(filtradas);

  if (total === 0) return null;

  const grupo = somenteFavoritas ? 'favoritas' : 'apostas';

  return (
    <span className="ml-auto flex shrink-0 flex-col items-end gap-0.5">
      <Pilula
        icone={<IconTarget aria-hidden size="0.75rem" />}
        valor={`${comAcertos}/${total}`}
        descricao={`${comAcertos} de ${total} ${grupo} acertaram no último concurso`}
      />
      <Pilula
        icone={<IconTrophy aria-hidden size="0.75rem" />}
        valor={String(maiorAcerto)}
        descricao={`Maior número de acertos entre as ${grupo}: ${maiorAcerto}`}
      />
    </span>
  );
};

import { IconTarget, IconTrophy } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import type { ResumoAcertos } from '@/types/conferencia';

interface IndicadoresAcertosProps {
  readonly resumo: ResumoAcertos;
  readonly grupo: string;
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

export const IndicadoresAcertos = ({ resumo, grupo }: IndicadoresAcertosProps) => {
  if (resumo.total === 0) return null;

  return (
    <span className="flex flex-wrap items-center gap-1">
      <Pilula
        icone={<IconTarget aria-hidden size="0.75rem" />}
        valor={`${resumo.comAcertos}/${resumo.total}`}
        descricao={`${resumo.comAcertos} de ${resumo.total} ${grupo} com acertos no concurso conferido`}
      />
      <Pilula
        icone={<IconTrophy aria-hidden size="0.75rem" />}
        valor={String(resumo.maiorAcerto)}
        descricao={`Maior número de acertos entre ${grupo}: ${resumo.maiorAcerto}`}
      />
    </span>
  );
};

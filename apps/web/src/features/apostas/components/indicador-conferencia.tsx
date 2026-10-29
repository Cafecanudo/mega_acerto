import { useQuery } from '@tanstack/react-query';
import { apostasAConferirQuery } from '../api/conferencia';

export const IndicadorConferencia = () => {
  const { data } = useQuery(apostasAConferirQuery());
  const sorteadas = (data ?? []).filter((aposta) => aposta.conferencia.concursoConferido !== null);
  if (sorteadas.length === 0) return null;
  const comPremio = sorteadas.some((aposta) => aposta.premios.length > 0);

  return (
    <span
      title={`${String(sorteadas.length)} apostas sorteadas para conferir`}
      className={`ml-auto rounded-full px-1.5 py-0.5 text-[0.68rem] font-semibold tabular-nums ${
        comPremio
          ? 'bg-emerald-600 text-white'
          : 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300'
      }`}
    >
      {sorteadas.length}
    </span>
  );
};

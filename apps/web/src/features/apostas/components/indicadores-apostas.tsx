import { useQuery } from '@tanstack/react-query';
import { IndicadoresAcertos } from '@/components/ui/indicadores-acertos';
import { resumoApostasQuery } from '../api/apostas';

export const IndicadoresApostas = () => {
  const { data } = useQuery(resumoApostasQuery());
  if (!data) return null;
  return <IndicadoresAcertos resumo={data} grupo="apostas" />;
};

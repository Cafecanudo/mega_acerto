import { useQuery } from '@tanstack/react-query';
import { IndicadoresAcertos } from '@/components/ui/indicadores-acertos';
import { resumirAcertos } from '@/lib/acertos';
import { listarFavoritosQuery } from '../api/favoritos';

export const IndicadoresFavoritos = ({ jogo }: { readonly jogo?: string }) => {
  const { data: favoritos = [] } = useQuery(listarFavoritosQuery());
  const filtrados = jogo ? favoritos.filter((favorito) => favorito.jogo === jogo) : favoritos;
  return <IndicadoresAcertos resumo={resumirAcertos(filtrados)} grupo="favoritos" />;
};

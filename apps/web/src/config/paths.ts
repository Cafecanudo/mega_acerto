export const JOGO_PADRAO = 'megasena';

export const paths = {
  inicio: '/',
  historico: (jogo: string) => `/${jogo}/concursos`,
  concurso: (jogo: string, numero: number) => `/${jogo}/concursos/${numero}`,
  busca: (jogo: string) => `/${jogo}/busca`,
} as const;

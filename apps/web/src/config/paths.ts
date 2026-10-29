export const JOGO_PADRAO = 'megasena';

export const paths = {
  inicio: '/',
  jogo: (jogo: string) => `/${jogo}`,
  concurso: (jogo: string, numero: number) => `/${jogo}/concursos/${numero}`,
} as const;

export const JOGO_PADRAO = 'megasena';

export const paths = {
  inicio: '/',
  jogo: (jogo: string) => `/${jogo}`,
  concurso: (jogo: string, numero: number) => `/${jogo}/concursos/${numero}`,
  analises: (jogo: string) => `/${jogo}/analises`,
  analise: (jogo: string, id: number) => `/${jogo}/analises/${id}`,
} as const;

export const JOGO_PADRAO = 'megasena';

export const paths = {
  inicio: '/',
  jogo: (jogo: string) => `/${jogo}`,
  concurso: (jogo: string, numero: number) => `/${jogo}/concursos/${numero}`,
  analises: '/analises',
  analise: (id: number) => `/analises/${id}`,
  conferirApostas: '/conferir-apostas',
  apostas: '/conta/apostas',
  favoritos: '/conta/favoritos',
  buscaNoHistorico: (jogo: string, dezenas: readonly number[]) =>
    `/${jogo}?dezenas=${dezenas.join(',')}`,
} as const;

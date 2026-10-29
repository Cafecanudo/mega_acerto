export const JOGO_PADRAO = 'megasena';

export const paths = {
  inicio: '/',
  jogo: (jogo: string) => `/${jogo}`,
  concurso: (jogo: string, numero: number) => `/${jogo}/concursos/${numero}`,
  analises: '/analises',
  analise: (id: number) => `/analises/${id}`,
  conferirApostas: '/conferir-apostas',
  palpites: '/palpites',
  apostas: '/conta/apostas',
  favoritos: '/conta/favoritos',
  valores: '/configuracoes/valores',
  buscaNoHistorico: (jogo: string, dezenas: readonly number[]) =>
    `/${jogo}?dezenas=${dezenas.join(',')}`,
} as const;

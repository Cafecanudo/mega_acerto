export const estrategiasDisponiveis = [
  {
    codigo: 'mais-sorteadas',
    nome: 'Mais sorteadas',
    regra: 'As dezenas com maior frequência no período; empate desfeito pela menor dezena.',
  },
  {
    codigo: 'menos-sorteadas',
    nome: 'Menos sorteadas',
    regra: 'As dezenas com menor frequência no período; empate desfeito pela menor dezena.',
  },
  {
    codigo: 'mais-atrasadas',
    nome: 'Mais atrasadas',
    regra:
      'As dezenas há mais concursos sem sair, contando a partir do fim do período; empate desfeito pela menor dezena.',
  },
  {
    codigo: 'equilibrada',
    nome: 'Equilibrada',
    regra:
      'Sorteio aleatório com semente fixa entre as combinações com metade pares e metade ímpares e soma das dezenas entre os percentis 25 e 75 do período.',
  },
  {
    codigo: 'personalizada',
    nome: 'Personalizada',
    regra: 'Regra descrita pelo usuário.',
  },
] as const;

export type CodigoEstrategia = (typeof estrategiasDisponiveis)[number]['codigo'];

export interface ParametrosEstrategia {
  readonly estrategia: CodigoEstrategia;
  readonly descricao: string | null;
  readonly quantidadeDezenas: number;
  readonly janela: number | null;
}

export const TAMANHO_MAXIMO_DESCRICAO = 600;
export const JANELA_MINIMA = 10;
export const JANELA_MAXIMA = 1000;

export const obterEstrategia = (codigo: CodigoEstrategia) => {
  const encontrada = estrategiasDisponiveis.find((item) => item.codigo === codigo);
  if (!encontrada) throw new Error(`Estratégia desconhecida: ${codigo}`);
  return encontrada;
};

export const descreverJanela = (janela: number | null): string =>
  janela === null ? 'todo o histórico anterior' : `os ${janela} concursos anteriores`;

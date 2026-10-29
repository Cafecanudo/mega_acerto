export type DisponibilidadeJogo = 'disponivel' | 'em-breve' | 'fonte-indisponivel';

export interface ApresentacaoJogo {
  readonly codigo: string;
  readonly nome: string;
  readonly cor: string;
  readonly corTexto: string;
  readonly disponibilidade: DisponibilidadeJogo;
}

const TEXTO_CLARO = '#ffffff';
const TEXTO_ESCURO = '#1a2e05';

export const apresentacoesJogo: readonly ApresentacaoJogo[] = [
  {
    codigo: 'megasena',
    nome: 'Mega-Sena',
    cor: '#209869',
    corTexto: TEXTO_CLARO,
    disponibilidade: 'disponivel',
  },
  {
    codigo: 'lotofacil',
    nome: 'Lotofácil',
    cor: '#930089',
    corTexto: TEXTO_CLARO,
    disponibilidade: 'em-breve',
  },
  {
    codigo: 'quina',
    nome: 'Quina',
    cor: '#260085',
    corTexto: TEXTO_CLARO,
    disponibilidade: 'em-breve',
  },
  {
    codigo: 'lotomania',
    nome: 'Lotomania',
    cor: '#f78100',
    corTexto: TEXTO_CLARO,
    disponibilidade: 'em-breve',
  },
  {
    codigo: 'duplasena',
    nome: 'Dupla Sena',
    cor: '#a61324',
    corTexto: TEXTO_CLARO,
    disponibilidade: 'em-breve',
  },
  {
    codigo: 'diadesorte',
    nome: 'Dia de Sorte',
    cor: '#cb852b',
    corTexto: TEXTO_CLARO,
    disponibilidade: 'em-breve',
  },
  {
    codigo: 'timemania',
    nome: 'Timemania',
    cor: '#00a650',
    corTexto: TEXTO_CLARO,
    disponibilidade: 'em-breve',
  },
  {
    codigo: 'supersete',
    nome: 'Super Sete',
    cor: '#a8cf45',
    corTexto: TEXTO_ESCURO,
    disponibilidade: 'fonte-indisponivel',
  },
  {
    codigo: 'maismilionaria',
    nome: '+Milionária',
    cor: '#2e3078',
    corTexto: TEXTO_CLARO,
    disponibilidade: 'em-breve',
  },
];

export const obterApresentacaoJogo = (codigo: string): ApresentacaoJogo | undefined =>
  apresentacoesJogo.find((apresentacao) => apresentacao.codigo === codigo);

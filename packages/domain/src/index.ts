export type { FaixaPremiada, IntervaloNumerico, RegraJogo } from './jogos/regra-jogo.ts';
export type { CodigoJogo } from './jogos/catalogo.ts';
export { codigosJogo, isCodigoJogo, listarRegrasJogo, obterRegraJogo } from './jogos/catalogo.ts';
export { megaSena } from './jogos/mega-sena.ts';
export type { ErroDezenas } from './dezenas/validar-dezenas.ts';
export { validarDezenas } from './dezenas/validar-dezenas.ts';
export { formatarDezena } from './dezenas/formatar-dezena.ts';
export type { ApresentacaoJogo, DisponibilidadeJogo } from './jogos/apresentacao.ts';
export { apresentacoesJogo, obterApresentacaoJogo } from './jogos/apresentacao.ts';
export type { ErroAposta } from './dezenas/validar-aposta.ts';
export { menorFaixaPremiada, validarAposta } from './dezenas/validar-aposta.ts';
export type { CustoAposta, CustoProjetado } from './dezenas/custo-aposta.ts';
export {
  calcularValorAposta,
  combinacoes,
  contarApostasSimples,
  projetarCusto,
} from './dezenas/custo-aposta.ts';
export type { PremioAposta } from './dezenas/premios-aposta.ts';
export { contarPremiosAposta } from './dezenas/premios-aposta.ts';
export type { SortearInteiro } from './dezenas/gerar-combinacoes.ts';
export { listarCombinacoes, sortearCombinacoes } from './dezenas/gerar-combinacoes.ts';

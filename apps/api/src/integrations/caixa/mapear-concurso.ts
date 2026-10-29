import { createHash } from 'node:crypto';
import type { RegraJogo } from '@mega/domain';
import type {
  ConcursoImportado,
  DezenaImportada,
  PremiacaoImportada,
} from '../../models/concurso-importado.ts';
import type { PayloadCaixa } from './payload-caixa.ts';
import type { RespostaCaixa } from './caixa-client.ts';

const DATA_BRASILEIRA = /^(\d{2})\/(\d{2})\/(\d{4})$/;

const converterData = (valor: string | null | undefined): string | null => {
  const partes = DATA_BRASILEIRA.exec(valor?.trim() ?? '');
  if (!partes) return null;
  const [, dia, mes, ano] = partes;
  return `${ano}-${mes}-${dia}`;
};

const textoOuNulo = (valor: string | null | undefined): string | null => {
  const texto = valor?.trim() ?? '';
  return texto.length > 0 ? texto : null;
};

const valorPositivoOuNulo = (valor: number | null | undefined): number | null =>
  valor !== null && valor !== undefined && valor > 0 ? valor : null;

const converterDezenas = (lista: readonly string[]): number[] =>
  lista.map((dezena) => Number.parseInt(dezena, 10));

const mapearSorteio = (
  sorteio: number,
  dezenas: readonly string[],
  ordemExtracao: readonly string[] | null | undefined,
): DezenaImportada[] => {
  const ordenadas = converterDezenas(dezenas);
  const extraidas = converterDezenas(ordemExtracao ?? []);
  const ordemConfiavel =
    extraidas.length === ordenadas.length &&
    extraidas.every((dezena) => ordenadas.includes(dezena));

  return ordenadas.map((dezena) => ({
    sorteio,
    dezena,
    ordemExtracao: ordemConfiavel ? extraidas.indexOf(dezena) + 1 : null,
  }));
};

const mapearDezenas = (payload: PayloadCaixa): DezenaImportada[] => {
  const primeiro = mapearSorteio(1, payload.listaDezenas, payload.dezenasSorteadasOrdemSorteio);
  const segundaLista = payload.listaDezenasSegundoSorteio ?? [];
  return segundaLista.length > 0
    ? [...primeiro, ...mapearSorteio(2, segundaLista, null)]
    : primeiro;
};

const mapearPremiacoes = (payload: PayloadCaixa): PremiacaoImportada[] =>
  payload.listaRateioPremio.map((rateio) => ({
    faixa: rateio.faixa,
    descricao: rateio.descricaoFaixa.trim(),
    ganhadores: rateio.numeroDeGanhadores,
    valorPremio: rateio.valorPremio,
  }));

const calcularHash = (bruto: unknown): string =>
  createHash('sha256').update(JSON.stringify(bruto)).digest('hex');

export const mapearConcurso = (regra: RegraJogo, resposta: RespostaCaixa): ConcursoImportado => {
  const { payload, bruto } = resposta;
  const dataApuracao = converterData(payload.dataApuracao);
  if (!dataApuracao) {
    throw new Error(
      `Data de apuração inválida no concurso ${payload.numero}: ${payload.dataApuracao}`,
    );
  }

  return {
    jogo: regra.codigo,
    numero: payload.numero,
    dataApuracao,
    acumulado: payload.acumulado,
    valorArrecadado: valorPositivoOuNulo(payload.valorArrecadado),
    valorAcumuladoProximo: valorPositivoOuNulo(payload.valorAcumuladoProximoConcurso),
    valorEstimadoProximo: valorPositivoOuNulo(payload.valorEstimadoProximoConcurso),
    dataProximo: converterData(payload.dataProximoConcurso),
    localSorteio: textoOuNulo(payload.localSorteio),
    municipioUf: textoOuNulo(payload.nomeMunicipioUFSorteio),
    dezenas: mapearDezenas(payload),
    premiacoes: mapearPremiacoes(payload),
    payload: bruto,
    hashPayload: calcularHash(bruto),
  };
};

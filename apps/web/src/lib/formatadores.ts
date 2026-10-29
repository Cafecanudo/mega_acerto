const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const moedaCompacta = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const inteiro = new Intl.NumberFormat('pt-BR');
const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const dataHoraCurta = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const dolar = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});
const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export const formatarDolar = (valor: number | null): string =>
  valor === null ? '—' : dolar.format(valor);

export const formatarDecimal = (valor: number, casas = 2): string =>
  casas === 2
    ? decimal.format(valor)
    : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: casas }).format(valor);

export const formatarPValor = (valor: number | null): string => {
  if (valor === null) return '—';
  return valor < 0.0001 ? '< 0,0001' : formatarDecimal(valor, 4);
};

export const formatarDuracao = (milissegundos: number | null): string => {
  if (milissegundos === null) return '—';
  const segundos = Math.round(milissegundos / 1000);
  const minutos = Math.floor(segundos / 60);
  return minutos > 0 ? `${minutos} min ${segundos % 60} s` : `${segundos} s`;
};

export const formatarMoeda = (valor: number | null): string =>
  valor === null ? '—' : moeda.format(valor);

export const formatarMoedaCompacta = (valor: number | null): string =>
  valor === null ? '—' : moedaCompacta.format(valor);

export const formatarInteiro = (valor: number | null): string =>
  valor === null ? '—' : inteiro.format(valor);

export const formatarData = (iso: string | null): string => {
  if (!iso) return '—';
  const [ano, mes, dia] = iso.split('-');
  return `${dia ?? ''}/${mes ?? ''}/${ano ?? ''}`;
};

export const formatarDataHora = (iso: string | null): string =>
  iso ? dataHora.format(new Date(iso)) : '—';

export const formatarDataHoraCurta = (iso: string | null): string =>
  iso ? dataHoraCurta.format(new Date(iso)).replace(',', '') : '—';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const inteiro = new Intl.NumberFormat('pt-BR');
const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export const formatarMoeda = (valor: number | null): string =>
  valor === null ? '—' : moeda.format(valor);

export const formatarInteiro = (valor: number | null): string =>
  valor === null ? '—' : inteiro.format(valor);

export const formatarData = (iso: string | null): string => {
  if (!iso) return '—';
  const [ano, mes, dia] = iso.split('-');
  return `${dia ?? ''}/${mes ?? ''}/${ano ?? ''}`;
};

export const formatarDataHora = (iso: string | null): string =>
  iso ? dataHora.format(new Date(iso)) : '—';

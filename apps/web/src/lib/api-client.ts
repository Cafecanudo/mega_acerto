export class ErroApi extends Error {
  readonly status: number;
  readonly codigo: string;

  constructor(status: number, codigo: string, mensagem: string) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
    this.codigo = codigo;
  }
}

type Parametros = Record<string, string | number | undefined>;

interface CorpoErro {
  readonly erro?: string;
  readonly mensagem?: string;
}

const PREFIXO = '/api';

const montarUrl = (caminho: string, parametros: Parametros = {}): string => {
  const url = new URL(`${PREFIXO}${caminho}`, window.location.origin);
  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor !== undefined) url.searchParams.set(chave, String(valor));
  }
  return url.toString();
};

const lerCorpo = async (resposta: Response): Promise<unknown> => {
  const texto = await resposta.text();
  return texto.length > 0 ? (JSON.parse(texto) as unknown) : null;
};

const requisitar = async <T>(metodo: 'GET' | 'POST', url: string, dados?: unknown): Promise<T> => {
  const comCorpo = dados !== undefined;
  const resposta = await fetch(url, {
    method: metodo,
    headers: comCorpo
      ? { accept: 'application/json', 'content-type': 'application/json' }
      : { accept: 'application/json' },
    body: comCorpo ? JSON.stringify(dados) : null,
  });
  const corpo = await lerCorpo(resposta);

  if (!resposta.ok) {
    const erro = (corpo ?? {}) as CorpoErro;
    throw new ErroApi(
      resposta.status,
      erro.erro ?? 'desconhecido',
      erro.mensagem ?? `Falha na requisição (HTTP ${resposta.status})`,
    );
  }

  return corpo as T;
};

export const api = {
  get: <T>(caminho: string, parametros?: Parametros) =>
    requisitar<T>('GET', montarUrl(caminho, parametros)),
  post: <T>(caminho: string, dados?: unknown) => requisitar<T>('POST', montarUrl(caminho), dados),
};

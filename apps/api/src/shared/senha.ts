import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

const PARAMETROS = { N: 16384, r: 8, p: 1 } as const;
const TAMANHO_CHAVE = 64;
const TAMANHO_SAL = 16;
const ALGORITMO = 'scrypt';

const derivar = (senha: string, sal: Buffer, opcoes: ScryptOptions): Promise<Buffer> =>
  new Promise((resolver, rejeitar) => {
    scrypt(senha.normalize('NFKC'), sal, TAMANHO_CHAVE, opcoes, (erro, chave) => {
      if (erro) rejeitar(erro);
      else resolver(chave);
    });
  });

export const gerarHashSenha = async (senha: string): Promise<string> => {
  const sal = randomBytes(TAMANHO_SAL);
  const chave = await derivar(senha, sal, PARAMETROS);
  const { N, r, p } = PARAMETROS;
  return [ALGORITMO, N, r, p, sal.toString('base64'), chave.toString('base64')].join('$');
};

export const conferirSenha = async (senha: string, hash: string): Promise<boolean> => {
  const [algoritmo, n, r, p, sal, chave] = hash.split('$');
  if (algoritmo !== ALGORITMO || !n || !r || !p || !sal || !chave) return false;
  const esperada = Buffer.from(chave, 'base64');
  const obtida = await derivar(senha, Buffer.from(sal, 'base64'), {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  return obtida.length === esperada.length && timingSafeEqual(obtida, esperada);
};

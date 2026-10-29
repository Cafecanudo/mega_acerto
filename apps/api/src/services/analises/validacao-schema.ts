import type { Static, TSchema } from 'typebox';
import { Value } from 'typebox/value';

const LIMITE_ERROS = 8;

export class ErroValidacaoResultado extends Error {}

export const validarContraSchema = <T extends TSchema>(
  schema: T,
  valor: unknown,
  rotulo: string,
): Static<T> => {
  if (Value.Check(schema, valor)) return valor;

  const detalhes = [...Value.Errors(schema, valor)]
    .slice(0, LIMITE_ERROS)
    .map((erro) => `${erro.instancePath || '/'} ${erro.message}`)
    .join('; ');
  throw new ErroValidacaoResultado(`${rotulo} fora do schema: ${detalhes}`);
};

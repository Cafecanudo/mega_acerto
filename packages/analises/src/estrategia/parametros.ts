import { Type } from 'typebox';
import {
  estrategiasDisponiveis,
  JANELA_MAXIMA,
  JANELA_MINIMA,
  TAMANHO_MAXIMO_DESCRICAO,
  type CodigoEstrategia,
} from './catalogo.ts';

export const ParametrosEstrategiaSchema = Type.Object(
  {
    estrategia: Type.Unsafe<CodigoEstrategia>(
      Type.Union(estrategiasDisponiveis.map((item) => Type.Literal(item.codigo))),
    ),
    descricao: Type.Union([
      Type.String({ minLength: 1, maxLength: TAMANHO_MAXIMO_DESCRICAO }),
      Type.Null(),
    ]),
    quantidadeDezenas: Type.Integer({ minimum: 1, maximum: 100 }),
    janela: Type.Union([
      Type.Integer({ minimum: JANELA_MINIMA, maximum: JANELA_MAXIMA }),
      Type.Null(),
    ]),
  },
  { additionalProperties: false },
);

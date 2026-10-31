import { Type } from 'typebox';
import {
  JANELA_FREQUENCIA_MAXIMA,
  JANELA_FREQUENCIA_MINIMA,
  TAMANHO_TOP_MAXIMO,
  TAMANHO_TOP_MINIMO,
} from './catalogo.ts';

export const ParametrosFrequenciaRecenteSchema = Type.Object(
  {
    janela: Type.Integer({ minimum: JANELA_FREQUENCIA_MINIMA, maximum: JANELA_FREQUENCIA_MAXIMA }),
    tamanhoTop: Type.Integer({ minimum: TAMANHO_TOP_MINIMO, maximum: TAMANHO_TOP_MAXIMO }),
  },
  { additionalProperties: false },
);

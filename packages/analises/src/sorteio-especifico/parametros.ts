import { Type } from 'typebox';
import { JANELA_SORTEIO_MAXIMA, JANELA_SORTEIO_MINIMA } from './catalogo.ts';

const Janela = Type.Integer({ minimum: JANELA_SORTEIO_MINIMA, maximum: JANELA_SORTEIO_MAXIMA });

export const SolicitacaoSorteioEspecificoSchema = Type.Object(
  {
    concurso: Type.Union([Type.Integer({ minimum: 1 }), Type.Null()]),
    janela: Janela,
  },
  { additionalProperties: false },
);

export const ParametrosSorteioEspecificoSchema = Type.Object(
  {
    concurso: Type.Integer({ minimum: 1 }),
    janela: Janela,
  },
  { additionalProperties: false },
);

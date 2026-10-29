import type { ApresentacaoJogo } from '@mega/domain';
import type { CSSProperties } from 'react';

export const estiloCorJogo = (apresentacao: ApresentacaoJogo): CSSProperties =>
  ({
    '--cor-jogo': apresentacao.cor,
    '--cor-jogo-texto': apresentacao.corTexto,
  }) as CSSProperties;

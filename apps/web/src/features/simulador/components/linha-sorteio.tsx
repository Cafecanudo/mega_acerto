import { formatarDezena, type RegraJogo } from '@mega/domain';
import type { ResultadoSorteio } from '../types';
import { marcacaoDaDezena } from '../utils';
import { BolaSorteada } from './bola-sorteada';
import { SeloCoincidencia } from './selo-coincidencia';

interface LinhaSorteioProps {
  readonly regra: RegraJogo;
  readonly resultado: ResultadoSorteio;
}

export const LinhaSorteio = ({ regra, resultado }: LinhaSorteioProps) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
    <div className="flex flex-wrap gap-1.5">
      {resultado.dezenas.map((dezena) => (
        <BolaSorteada
          key={dezena}
          rotulo={formatarDezena(regra, dezena)}
          marcacao={marcacaoDaDezena(resultado, dezena)}
        />
      ))}
    </div>
    <SeloCoincidencia tipo="aposta" coincidencia={resultado.aposta} />
    <SeloCoincidencia tipo="favorito" coincidencia={resultado.favorito} />
  </div>
);

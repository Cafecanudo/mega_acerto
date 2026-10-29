import type { RegraJogo } from '@mega/domain';
import { useState } from 'react';
import { Dialogo } from '@/components/ui/dialogo';
import { DetalheConcurso } from './detalhe-concurso';

interface DialogoConcursoProps {
  readonly regra: RegraJogo;
  readonly numeroInicial: number;
  readonly aoFechar: () => void;
}

export const DialogoConcurso = ({ regra, numeroInicial, aoFechar }: DialogoConcursoProps) => {
  const [numero, setNumero] = useState(numeroInicial);

  return (
    <Dialogo aberto titulo={`${regra.nome} · concurso ${numero}`} aoFechar={aoFechar}>
      <DetalheConcurso key={numero} regra={regra} numero={numero} aoNavegar={setNumero} />
    </Dialogo>
  );
};

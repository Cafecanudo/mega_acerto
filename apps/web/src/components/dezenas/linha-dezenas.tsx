import { formatarDezena, type RegraJogo } from '@mega/domain';
import { BolaDezena } from '@/components/ui/bola-dezena';

interface LinhaDezenasProps {
  readonly regra: RegraJogo;
  readonly dezenas: readonly number[];
  readonly destacadas?: ReadonlySet<number>;
  readonly acertadas?: ReadonlySet<number>;
  readonly tamanho?: 'sm' | 'md' | 'lg' | 'xl';
}

export const LinhaDezenas = ({
  regra,
  dezenas,
  destacadas,
  acertadas,
  tamanho,
}: LinhaDezenasProps) => (
  <div className="flex flex-wrap gap-1.5">
    {dezenas.map((dezena) => (
      <BolaDezena
        key={dezena}
        rotulo={formatarDezena(regra, dezena)}
        tamanho={tamanho}
        destaque={destacadas ? destacadas.has(dezena) : true}
        acerto={acertadas?.has(dezena)}
      />
    ))}
  </div>
);

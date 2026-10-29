import type { Conferencia, ResumoAcertos } from '@/types/conferencia';

interface ItemConferido {
  readonly id: number;
  readonly nome: string | null;
  readonly conferencia: Conferencia;
}

export const resumirAcertos = (itens: readonly ItemConferido[]): ResumoAcertos =>
  itens.reduce<ResumoAcertos>(
    (resumo, item) => {
      const concurso = item.conferencia.concursoConferido;
      if (!concurso) return resumo;
      if (concurso.acertos === 0) return { ...resumo, total: resumo.total + 1 };
      const melhorou = concurso.acertos > resumo.maiorAcerto;
      return {
        total: resumo.total + 1,
        comAcertos: resumo.comAcertos + 1,
        maiorAcerto: melhorou ? concurso.acertos : resumo.maiorAcerto,
        melhor: melhorou
          ? { id: item.id, nome: item.nome, concurso: concurso.numero }
          : resumo.melhor,
      };
    },
    { total: 0, comAcertos: 0, maiorAcerto: 0, melhor: null },
  );

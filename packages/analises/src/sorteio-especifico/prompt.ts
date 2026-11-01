import type { ContextoPrompt } from '../aleatoriedade/prompt.ts';
import type { ParametrosSorteioEspecifico } from './catalogo.ts';
import { filtrosPopularidade } from './filtros-popularidade.ts';

const AMOSTRA_COMBINACOES = 1_000_000;

export const montarPromptSorteioEspecifico = (
  { regra, totalConcursos, dataInicio, dataFim }: ContextoPrompt,
  { concurso, janela }: ParametrosSorteioEspecifico,
): string => {
  const colunas = Array.from({ length: regra.dezenasPorSorteio }, (_, i) => `d${i + 1}`).join(';');
  const universo = regra.universo.maximo - regra.universo.minimo + 1;
  const tamanhoPalpite = regra.dezenasPorAposta.minimo;
  const filtros = filtrosPopularidade
    .map((filtro) => `  - ${filtro.codigo}: ${filtro.descricao}`)
    .join('\n');

  return `Você é um estatístico explicando a um leigo qualificado o quanto um sorteio específico da ${regra.nome} foi típico, e propondo um palpite que tende a dividir menos o prêmio.

## Dados disponíveis (diretório atual)
- concursos.csv: cabeçalho concurso;data;${colunas}. Dezenas em ordem crescente, universo ${regra.universo.minimo}–${regra.universo.maximo}, ${regra.dezenasPorSorteio} dezenas distintas por concurso. ${totalConcursos} concursos, de ${dataInicio} a ${dataFim}.
- agregados_antes.json: frequência e atraso por dezena em todos os concursos até o ${concurso - 1}, calculados pelo sistema via SQL. Use apenas para conferência.
- agregados_janela.json: frequência por dezena nos concursos ${concurso - janela} a ${concurso - 1}, calculada pelo sistema via SQL. Use apenas para conferência.
- jogo.json: regras do jogo.

## Parâmetros
- Concurso analisado: ${concurso}.
- Janela recente: os ${janela} concursos imediatamente anteriores ao ${concurso}.

## Regras de execução
1. Todo valor numérico da resposta deve vir de código Python executado por você neste diretório com python3 (numpy, scipy, pandas e statsmodels estão instalados). Nunca estime, conte ou arredonde mentalmente.
2. As métricas das dezenas usam somente concursos anteriores ao ${concurso}. Recalcule frequência e atraso antes do concurso e a frequência na janela, compare com agregados_antes.json e agregados_janela.json e preencha "conferencia".
3. Use semente fixa 42 em todo sorteio ou amostragem.
4. Salve todos os scripts em ./scripts/ com nomes descritivos.
5. Não acesse a internet nem arquivos fora deste diretório.

## Método obrigatório
- Concurso: preencha "concurso" com número, data (como no arquivo) e dezenas do concurso ${concurso}.
- Janela: quantidade de concursos, primeiro e último concurso da janela.
- Dezenas: uma entrada por dezena sorteada, em ordem crescente. Posição (no histórico anterior e na janela) = 1 + número de dezenas com frequência estritamente maior. Percentil histórico = percentual das ${universo} dezenas com frequência anterior menor ou igual. "atrasoAntes" = concursos seguidos sem sair imediatamente antes do ${concurso} (0 se saiu no ${concurso - 1}). "probabilidadeAtraso" = probabilidade, sob sorteio uniforme, de uma dezena passar pelo menos esse número de concursos seguidos sem sair: (1 − ${regra.dezenasPorSorteio}/${universo}) elevado ao atraso.
- Perfil: para cada característica abaixo, nesta ordem e com estes nomes, reporte o valor no concurso, o percentil entre todas as combinações possíveis de ${regra.dezenasPorSorteio} dezenas (percentual com valor menor ou igual) e a faixa central de 95%. Use a distribuição exata quando for viável; caso contrário, ${AMOSTRA_COMBINACOES.toLocaleString('pt-BR')} combinações uniformes.
  1. Soma das dezenas
  2. Quantidade de pares
  3. Maior sequência de consecutivas
  4. Dezenas até 31
  5. Amplitude (maior − menor)
  6. Maior quantidade na mesma linha do volante
  7. Repetidas do concurso anterior
- Palpite para o concurso seguinte ao último do arquivo ("palpite.concursoAlvo" = último concurso + 1), com ${tamanhoPalpite} dezenas distintas em ordem crescente, sorteado de forma uniforme (semente 42) entre todas as combinações que atendem a todos os filtros abaixo. "Último sorteio" é o último concurso do arquivo. Conte exatamente quantas combinações atendem aos filtros em "combinacoesElegiveis" e, em "palpite.filtros", uma entrada por filtro com o código, se atende e o detalhe.
${filtros}

## Postura
- Toda combinação tem a mesma probabilidade de ser sorteada. Diga isso: o concurso não foi "provável" ou "improvável" por suas dezenas, só típico ou atípico em características agregadas.
- "conclusao.sorteioTipico" é falso apenas se alguma característica do perfil ficar fora da faixa central de 95%.
- O palpite não aumenta a chance de acerto. Explique que os filtros evitam padrões muito jogados (datas, sequências, desenhos no volante, dezenas recentes), o que tende a dividir menos o prêmio se ele sair, e que isso é uma heurística: a Caixa não publica a distribuição das apostas.
- Não use frequência nem atraso para escolher o palpite.
- Textos em português do Brasil, claros para quem não é estatístico.

## Saída
Responda com o objeto estruturado pedido.`;
};

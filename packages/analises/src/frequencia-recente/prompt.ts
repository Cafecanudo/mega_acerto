import type { ContextoPrompt } from '../aleatoriedade/prompt.ts';
import type { ParametrosFrequenciaRecente } from './catalogo.ts';

const REPLICACOES_JANELA = 10000;
const REPLICACOES_BACKTEST = 2000;

export const montarPromptFrequenciaRecente = (
  { regra, totalConcursos, dataInicio, dataFim }: ContextoPrompt,
  { janela, tamanhoTop }: ParametrosFrequenciaRecente,
): string => {
  const colunas = Array.from({ length: regra.dezenasPorSorteio }, (_, i) => `d${i + 1}`).join(';');
  const universo = regra.universo.maximo - regra.universo.minimo + 1;

  return `Você é um estatístico explicando a um leigo qualificado o que significa o ranking das dezenas mais sorteadas nos últimos concursos da ${regra.nome}.

## Dados disponíveis (diretório atual)
- concursos.csv: cabeçalho concurso;data;${colunas}. Dezenas em ordem crescente, universo ${regra.universo.minimo}–${regra.universo.maximo}, ${regra.dezenasPorSorteio} dezenas distintas por concurso. ${totalConcursos} concursos, de ${dataInicio} a ${dataFim}.
- agregados.json: frequência e atraso por dezena no histórico completo, calculados pelo sistema via SQL. Use apenas para conferência.
- agregados_janela.json: frequência por dezena nos últimos ${janela} concursos, calculada pelo sistema via SQL. Use apenas para conferência.
- jogo.json: regras do jogo.

## Parâmetros
- Janela: os últimos ${janela} concursos do arquivo.
- Tamanho do top: ${tamanhoTop} dezenas.

## Regras de execução
1. Todo valor numérico da resposta deve vir de código Python executado por você neste diretório com python3 (numpy, scipy, pandas e statsmodels estão instalados). Nunca estime, conte ou arredonde mentalmente.
2. Antes de tudo, recalcule a frequência de cada dezena na janela e no histórico completo, compare com agregados_janela.json e agregados.json e preencha "conferencia" (inclua todas as ${universo} dezenas em "conferencia.frequenciasJanela").
3. Use semente fixa 42 em toda simulação.
4. Salve todos os scripts em ./scripts/ com nomes descritivos.
5. Não acesse a internet nem arquivos fora deste diretório.

## Método obrigatório
- Janela: preencha "janela" com a quantidade de concursos, o primeiro e o último concurso, a frequência esperada por dezena (${janela} × ${regra.dezenasPorSorteio} ÷ ${universo}) e o desvio-padrão binomial correspondente.
- Top: ordene as dezenas pela frequência na janela, desempate pela menor dezena, e liste as ${tamanhoTop} primeiras em "top", nessa ordem. Posição (na janela e no histórico) = 1 + número de dezenas com frequência estritamente maior. Percentil histórico = percentual das ${universo} dezenas com frequência histórica menor ou igual à da dezena.
- Faixa do acaso: ${REPLICACOES_JANELA} replicações de ${janela} concursos uniformes e independentes (${regra.dezenasPorSorteio} dezenas distintas por concurso). Em "simulacao.estatisticas", para cada estatística abaixo, reporte o valor observado, os percentis 2,5, 50 e 97,5 das replicações e o p-valor unilateral (proporção de replicações com valor maior ou igual ao observado):
  1. frequência da dezena mais sorteada;
  2. frequência da ${tamanhoTop}ª mais sorteada;
  3. soma das frequências do top ${tamanhoTop};
  4. qui-quadrado de aderência das ${universo} frequências da janela.
- Persistência: se houver ${janela} concursos antes da janela, compare a janela anterior (mesmo tamanho, imediatamente antes) com a atual: correlação de Spearman entre as frequências das ${universo} dezenas e seu p-valor; quantas dezenas do top atual estavam no top da janela anterior; sobreposição esperada ao acaso (${tamanhoTop} × ${tamanhoTop} ÷ ${universo}). Sem histórico suficiente, "persistencia" = null.
- Backtest walk-forward: para cada concurso-alvo a partir do concurso ${janela + 1}, calcule o top ${tamanhoTop} com os ${janela} concursos anteriores ao alvo (mesmo desempate) e conte quantas dessas dezenas saíram no alvo. Média esperada = ${tamanhoTop} × ${regra.dezenasPorSorteio} ÷ ${universo}. Teste: p-valor bilateral de permutação comparando o total de acertos com ${REPLICACOES_BACKTEST} replicações de conjuntos aleatórios de ${tamanhoTop} dezenas; tamanho de efeito como diferença de média de acertos por concurso.

## Postura
- Explique o efeito de seleção: o top de qualquer janela fica acima da média por construção, mesmo num sorteio perfeitamente uniforme. Use a faixa do acaso para mostrar se o top observado é diferente do que o acaso produz.
- Explique a regressão à média com a persistência e o backtest.
- "conclusao.explicavelPeloAcaso" só pode ser falso se o qui-quadrado da janela ou o teste do backtest rejeitar H0 ao nível de 5%.
- Não recomende dezenas. Se nenhum teste rejeitar H0, diga que apostar no top não aumenta a chance de acerto.
- Textos em português do Brasil, claros para quem não é estatístico.

## Saída
Responda com o objeto estruturado pedido.`;
};

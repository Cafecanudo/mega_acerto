import type { Generated } from 'kysely';

export interface JogoTabela {
  codigo: string;
  nome: string;
  universo_minimo: number;
  universo_maximo: number;
  dezenas_por_sorteio: number;
  sorteios_por_concurso: number;
}

export interface ConcursoTabela {
  jogo: string;
  numero: number;
  data_apuracao: string;
  acumulado: boolean;
  valor_arrecadado: number | null;
  valor_acumulado_proximo: number | null;
  valor_estimado_proximo: number | null;
  data_proximo: string | null;
  local_sorteio: string | null;
  municipio_uf: string | null;
  importado_em: Generated<Date>;
}

export interface DezenaSorteadaTabela {
  jogo: string;
  numero: number;
  sorteio: number;
  dezena: number;
  ordem_extracao: number | null;
}

export interface PremiacaoTabela {
  jogo: string;
  numero: number;
  faixa: number;
  descricao: string;
  ganhadores: number;
  valor_premio: number;
}

export interface PayloadBrutoTabela {
  jogo: string;
  numero: number;
  payload: unknown;
  hash: string;
  obtido_em: Generated<Date>;
}

export interface IngestaoExecucaoTabela {
  id: Generated<number>;
  jogo: string;
  gatilho: string;
  status: string;
  iniciado_em: Generated<Date>;
  finalizado_em: Date | null;
  ultimo_concurso_caixa: number | null;
  total_previsto: Generated<number>;
  importados: Generated<number>;
  erro: string | null;
}

export interface AnaliseTabela {
  id: Generated<number>;
  jogo: string;
  tipo: string;
  versao_prompt: number;
  modelo: string;
  esforco: string;
  status: string;
  ultimo_concurso: number;
  hash_dataset: string | null;
  resultado: unknown;
  conferencia_sistema: unknown;
  scripts: unknown;
  metadados: unknown;
  custo_usd: number | null;
  duracao_ms: number | null;
  erro: string | null;
  criado_em: Generated<Date>;
  iniciado_em: Date | null;
  finalizado_em: Date | null;
}

export interface Database {
  jogo: JogoTabela;
  concurso: ConcursoTabela;
  dezena_sorteada: DezenaSorteadaTabela;
  premiacao: PremiacaoTabela;
  payload_bruto: PayloadBrutoTabela;
  ingestao_execucao: IngestaoExecucaoTabela;
  analise: AnaliseTabela;
  favorito: FavoritoTabela;
  aposta: ApostaTabela;
  valor_jogo: ValorJogoTabela;
}

export interface ValorJogoTabela {
  jogo: string;
  valor_aposta: number;
  atualizado_em: Generated<Date>;
}

export interface FavoritoTabela {
  id: Generated<number>;
  jogo: string;
  nome: string | null;
  dezenas: number[];
  criado_em: Generated<Date>;
  atualizado_em: Generated<Date>;
}

export interface ApostaTabela {
  id: Generated<number>;
  jogo: string;
  nome: string | null;
  dezenas: number[];
  favorito_id: number | null;
  concurso: number | null;
  valor: number | null;
  criada_em: Generated<Date>;
  conferida_em: Generated<Date | null>;
}

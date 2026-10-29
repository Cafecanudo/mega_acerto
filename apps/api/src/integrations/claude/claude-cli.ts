import { spawn } from 'node:child_process';

export interface OpcoesClaudeCli {
  readonly executavel: string;
  readonly tokenOauth: string | undefined;
  readonly timeoutMs: number;
}

export interface ExecucaoClaude {
  readonly prompt: string;
  readonly schema: object;
  readonly modelo: string;
  readonly esforco: string;
  readonly diretorio: string;
}

export interface RespostaClaude {
  readonly saida: unknown;
  readonly custoUsd: number | null;
  readonly duracaoMs: number;
  readonly metadados: Record<string, unknown>;
}

export class ErroClaude extends Error {
  readonly metadados: Record<string, unknown> | undefined;

  constructor(mensagem: string, metadados?: Record<string, unknown>) {
    super(mensagem);
    this.name = 'ErroClaude';
    this.metadados = metadados;
  }
}

interface SaidaCli {
  readonly is_error?: boolean;
  readonly result?: string;
  readonly structured_output?: unknown;
  readonly total_cost_usd?: number;
  readonly duration_ms?: number;
  readonly num_turns?: number;
  readonly session_id?: string;
  readonly usage?: unknown;
  readonly modelUsage?: unknown;
  readonly permission_denials?: unknown;
  readonly terminal_reason?: string;
}

const FERRAMENTAS_PERMITIDAS = ['Bash(python3:*)', 'Read', 'Write', 'Edit', 'Glob', 'Grep'];
const FERRAMENTAS_NEGADAS = ['WebFetch', 'WebSearch'];

const extrairMetadados = (saida: SaidaCli): Record<string, unknown> => ({
  numTurns: saida.num_turns,
  sessionId: saida.session_id,
  usage: saida.usage,
  modelUsage: saida.modelUsage,
  permissionDenials: saida.permission_denials,
  terminalReason: saida.terminal_reason,
});

const interpretarSaidaEstruturada = (saida: SaidaCli): unknown => {
  if (saida.structured_output !== undefined) return saida.structured_output;
  if (!saida.result)
    throw new ErroClaude('O Claude não retornou resultado', extrairMetadados(saida));
  try {
    return JSON.parse(saida.result) as unknown;
  } catch {
    throw new ErroClaude('O Claude não retornou um JSON estruturado', extrairMetadados(saida));
  }
};

export class ClaudeCli {
  readonly #opcoes: OpcoesClaudeCli;

  constructor(opcoes: OpcoesClaudeCli) {
    this.#opcoes = opcoes;
  }

  async executar(execucao: ExecucaoClaude): Promise<RespostaClaude> {
    if (!this.#opcoes.tokenOauth) {
      throw new ErroClaude(
        'CLAUDE_CODE_OAUTH_TOKEN não configurado. Gere com `claude setup-token` e adicione ao .env.',
      );
    }

    const inicio = Date.now();
    const stdout = await this.#rodarProcesso(execucao, this.#opcoes.tokenOauth);
    const saida = this.#lerSaida(stdout);

    if (saida.is_error) {
      throw new ErroClaude(saida.result ?? 'Falha na execução do Claude', extrairMetadados(saida));
    }

    return {
      saida: interpretarSaidaEstruturada(saida),
      custoUsd: saida.total_cost_usd ?? null,
      duracaoMs: saida.duration_ms ?? Date.now() - inicio,
      metadados: extrairMetadados(saida),
    };
  }

  #argumentos(execucao: ExecucaoClaude): string[] {
    return [
      '-p',
      '--output-format',
      'json',
      '--model',
      execucao.modelo,
      '--effort',
      execucao.esforco,
      '--no-session-persistence',
      '--permission-mode',
      'acceptEdits',
      '--allowedTools',
      ...FERRAMENTAS_PERMITIDAS,
      '--disallowedTools',
      ...FERRAMENTAS_NEGADAS,
      '--json-schema',
      JSON.stringify(execucao.schema),
    ];
  }

  #ambiente(token: string): NodeJS.ProcessEnv {
    return {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      USERPROFILE: process.env.USERPROFILE,
      LANG: process.env.LANG ?? 'C.UTF-8',
      TZ: process.env.TZ,
      CLAUDE_CODE_OAUTH_TOKEN: token,
      DISABLE_AUTOUPDATER: '1',
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
    };
  }

  #rodarProcesso(execucao: ExecucaoClaude, token: string): Promise<string> {
    return new Promise((resolver, rejeitar) => {
      const processo = spawn(this.#opcoes.executavel, this.#argumentos(execucao), {
        cwd: execucao.diretorio,
        env: this.#ambiente(token),
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const saida: Buffer[] = [];
      const erros: Buffer[] = [];
      const temporizador = setTimeout(() => {
        processo.kill('SIGKILL');
        rejeitar(new ErroClaude(`Tempo limite de ${this.#opcoes.timeoutMs / 60_000} min excedido`));
      }, this.#opcoes.timeoutMs);

      processo.stdout.on('data', (parte: Buffer) => saida.push(parte));
      processo.stderr.on('data', (parte: Buffer) => erros.push(parte));
      processo.on('error', (erro) => {
        clearTimeout(temporizador);
        rejeitar(new ErroClaude(`Não foi possível iniciar o Claude CLI: ${erro.message}`));
      });
      processo.on('close', (codigo) => {
        clearTimeout(temporizador);
        const texto = Buffer.concat(saida).toString('utf8');
        if (texto.trim().length > 0 || codigo === 0) {
          resolver(texto);
          return;
        }
        const detalhe = Buffer.concat(erros).toString('utf8').trim().slice(0, 2000);
        rejeitar(new ErroClaude(`Claude CLI terminou com código ${codigo}: ${detalhe}`));
      });

      processo.stdin.end(execucao.prompt, 'utf8');
    });
  }

  #lerSaida(texto: string): SaidaCli {
    try {
      return JSON.parse(texto) as SaidaCli;
    } catch {
      throw new ErroClaude(`Saída inesperada do Claude CLI: ${texto.slice(0, 500)}`);
    }
  }
}

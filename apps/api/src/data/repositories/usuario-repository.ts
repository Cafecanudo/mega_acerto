import { sql, type Kysely } from 'kysely';
import type { Database } from '../database.ts';

export interface Usuario {
  readonly id: number;
  readonly nome: string;
  readonly login: string;
}

export interface UsuarioComSenha extends Usuario {
  readonly senhaHash: string;
}

export interface NovoUsuario {
  readonly nome: string;
  readonly login: string;
  readonly senhaHash: string;
}

const TABELAS_COM_DONO = ['favorito', 'aposta', 'analise'] as const;

export class UsuarioRepository {
  readonly #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  async obterPorLogin(login: string): Promise<UsuarioComSenha | undefined> {
    return this.#db
      .selectFrom('usuario')
      .select(['id', 'nome', 'login', 'senha_hash as senhaHash'])
      .where('login', '=', login)
      .executeTakeFirst();
  }

  async criarAssumindoDadosSemDono(novo: NovoUsuario): Promise<Usuario | undefined> {
    return this.#db.transaction().execute(async (trx) => {
      await sql`lock table usuario in share row exclusive mode`.execute(trx);
      const existente = await trx
        .selectFrom('usuario')
        .select('id')
        .where('login', '=', novo.login)
        .executeTakeFirst();
      if (existente) return undefined;

      const primeiro = !(await trx.selectFrom('usuario').select('id').limit(1).executeTakeFirst());
      const usuario = await trx
        .insertInto('usuario')
        .values({ nome: novo.nome, login: novo.login, senha_hash: novo.senhaHash })
        .returning(['id', 'nome', 'login'])
        .executeTakeFirstOrThrow();

      if (primeiro) {
        for (const tabela of TABELAS_COM_DONO) {
          await trx
            .updateTable(tabela)
            .set({ usuario_id: usuario.id })
            .where('usuario_id', 'is', null)
            .execute();
        }
      }
      return usuario;
    });
  }

  async criarSessao(id: string, usuarioId: number, expiraEm: Date): Promise<void> {
    await this.#db
      .insertInto('sessao')
      .values({ id, usuario_id: usuarioId, expira_em: expiraEm })
      .execute();
  }

  async obterPorSessao(
    id: string,
  ): Promise<{ readonly usuario: Usuario; readonly expiraEm: Date } | undefined> {
    const linha = await this.#db
      .selectFrom('sessao as s')
      .innerJoin('usuario as u', 'u.id', 's.usuario_id')
      .select(['u.id', 'u.nome', 'u.login', 's.expira_em as expiraEm'])
      .where('s.id', '=', id)
      .where('s.expira_em', '>', sql<Date>`now()`)
      .executeTakeFirst();
    return linha
      ? {
          usuario: { id: linha.id, nome: linha.nome, login: linha.login },
          expiraEm: linha.expiraEm,
        }
      : undefined;
  }

  async renovarSessao(id: string, expiraEm: Date): Promise<void> {
    await this.#db
      .updateTable('sessao')
      .set({ expira_em: expiraEm })
      .where('id', '=', id)
      .execute();
  }

  async excluirSessao(id: string): Promise<void> {
    await this.#db.deleteFrom('sessao').where('id', '=', id).execute();
  }

  async excluirSessoesExpiradas(): Promise<void> {
    await this.#db
      .deleteFrom('sessao')
      .where('expira_em', '<=', sql<Date>`now()`)
      .execute();
  }
}

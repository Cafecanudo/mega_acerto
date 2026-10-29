import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { Database } from './database.ts';

pg.types.setTypeParser(pg.types.builtins.INT8, Number);
pg.types.setTypeParser(pg.types.builtins.NUMERIC, Number);
pg.types.setTypeParser(pg.types.builtins.DATE, (valor) => valor);

export const criarConexao = (databaseUrl: string): Kysely<Database> =>
  new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({ connectionString: databaseUrl, max: 10 }),
    }),
  });

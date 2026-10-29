import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Kysely } from 'kysely';
import { Migrator, type Migration, type MigrationProvider } from 'kysely/migration';
import type { Database } from './database.ts';

const diretorioMigrations = join(import.meta.dirname, 'migrations');

const carregarMigration = async (arquivo: string): Promise<readonly [string, Migration]> => {
  const url = pathToFileURL(join(diretorioMigrations, arquivo)).href;
  const modulo = (await import(url)) as Migration;
  return [arquivo.replace(/\.ts$/, ''), modulo];
};

const provedorMigrations: MigrationProvider = {
  async getMigrations() {
    const arquivos = (await readdir(diretorioMigrations)).filter((nome) => nome.endsWith('.ts'));
    const migrations = await Promise.all(arquivos.sort().map(carregarMigration));
    return Object.fromEntries(migrations);
  },
};

export const executarMigrations = async (db: Kysely<Database>): Promise<readonly string[]> => {
  const migrator = new Migrator({ db, provider: provedorMigrations });
  const { error, results = [] } = await migrator.migrateToLatest();

  if (error) {
    throw error instanceof Error
      ? error
      : new Error('Falha ao executar migrations', { cause: error });
  }

  return results
    .filter((resultado) => resultado.status === 'Success')
    .map((resultado) => resultado.migrationName);
};

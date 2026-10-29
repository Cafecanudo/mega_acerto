import { sql } from 'kysely';
import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { OpcoesRotas } from '../opcoes-rotas.ts';

const rotasSaude: FastifyPluginAsyncTypebox<OpcoesRotas> = async (app, { container }) => {
  app.get(
    '/saude',
    {
      schema: {
        response: {
          200: Type.Object({ status: Type.Literal('ok'), banco: Type.Boolean() }),
        },
      },
    },
    async () => {
      await sql`select 1`.execute(container.db);
      return { status: 'ok' as const, banco: true };
    },
  );
};

export default rotasSaude;

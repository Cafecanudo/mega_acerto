import { Type } from '@fastify/type-provider-typebox';

export const UsuarioSchema = Type.Object({
  id: Type.Integer(),
  nome: Type.String(),
  login: Type.String(),
});

export const CadastroSchema = Type.Object(
  {
    nome: Type.String({ minLength: 1, maxLength: 80 }),
    login: Type.String({ minLength: 3, maxLength: 32 }),
    senha: Type.String({ minLength: 8, maxLength: 128 }),
  },
  { additionalProperties: false },
);

export const CredenciaisSchema = Type.Object(
  {
    login: Type.String({ minLength: 1, maxLength: 32 }),
    senha: Type.String({ minLength: 1, maxLength: 128 }),
  },
  { additionalProperties: false },
);

import { IconClover, IconLogin2, IconUserPlus } from '@tabler/icons-react';
import { useEffect, useRef, useState, type InputHTMLAttributes, type SyntheticEvent } from 'react';
import { useCadastrar, useEntrar } from '../api/sessao';

type Modo = 'entrar' | 'cadastrar';

const classeCampo =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950';

const Campo = ({
  rotulo,
  ...props
}: { readonly rotulo: string } & InputHTMLAttributes<HTMLInputElement>) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{rotulo}</span>
    <input {...props} className={classeCampo} />
  </label>
);

const FormularioEntrar = () => {
  const entrar = useEntrar();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');

  const enviar = (evento: SyntheticEvent) => {
    evento.preventDefault();
    entrar.mutate({ login, senha });
  };

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3">
      <Campo
        rotulo="Login"
        value={login}
        onChange={(evento) => {
          setLogin(evento.target.value);
        }}
        autoComplete="username"
        autoFocus
        required
      />
      <Campo
        rotulo="Senha"
        type="password"
        value={senha}
        onChange={(evento) => {
          setSenha(evento.target.value);
        }}
        autoComplete="current-password"
        required
      />
      {entrar.isError && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{entrar.error.message}</p>
      )}
      <button
        type="submit"
        disabled={entrar.isPending}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        <IconLogin2 aria-hidden size="1rem" />
        {entrar.isPending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
};

const FormularioCadastro = () => {
  const cadastrar = useCadastrar();
  const [nome, setNome] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const senhasDiferentes = confirmacao.length > 0 && senha !== confirmacao;

  const enviar = (evento: SyntheticEvent) => {
    evento.preventDefault();
    if (senha !== confirmacao) return;
    cadastrar.mutate({ nome, login, senha });
  };

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3">
      <Campo
        rotulo="Nome"
        value={nome}
        onChange={(evento) => {
          setNome(evento.target.value);
        }}
        autoComplete="name"
        maxLength={80}
        autoFocus
        required
      />
      <Campo
        rotulo="Login"
        value={login}
        onChange={(evento) => {
          setLogin(evento.target.value.toLowerCase());
        }}
        autoComplete="username"
        pattern="[a-z0-9._\-]{3,32}"
        title="3 a 32 letras minúsculas, números, ponto, hífen ou _"
        required
      />
      <Campo
        rotulo="Senha (mínimo 8 caracteres)"
        type="password"
        value={senha}
        onChange={(evento) => {
          setSenha(evento.target.value);
        }}
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        required
      />
      <Campo
        rotulo="Confirmar senha"
        type="password"
        value={confirmacao}
        onChange={(evento) => {
          setConfirmacao(evento.target.value);
        }}
        autoComplete="new-password"
        required
      />
      {senhasDiferentes && (
        <p className="text-sm text-amber-600 dark:text-amber-400">As senhas não conferem.</p>
      )}
      {cadastrar.isError && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{cadastrar.error.message}</p>
      )}
      <button
        type="submit"
        disabled={cadastrar.isPending || senhasDiferentes}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        <IconUserPlus aria-hidden size="1rem" />
        {cadastrar.isPending ? 'Criando conta…' : 'Criar conta'}
      </button>
    </form>
  );
};

const classeAba = (ativa: boolean) =>
  `flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
    ativa
      ? 'bg-white shadow-sm dark:bg-slate-800'
      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
  }`;

export const DialogoLogin = () => {
  const referencia = useRef<HTMLDialogElement>(null);
  const [modo, setModo] = useState<Modo>('entrar');

  useEffect(() => {
    const dialogo = referencia.current;
    if (dialogo && !dialogo.open) dialogo.showModal();
  }, []);

  return (
    <dialog
      ref={referencia}
      aria-label="Entrar no Mega Acerto"
      onCancel={(evento) => {
        evento.preventDefault();
      }}
      className="m-auto w-[min(26rem,92vw)] max-w-none rounded-2xl border border-slate-200 bg-slate-50 p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
    >
      <div className="flex flex-col gap-5 p-6">
        <header className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white">
            <IconClover aria-hidden size="1.5rem" stroke={1.75} />
          </span>
          <div>
            <h2 className="text-base font-semibold">Mega Acerto</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {modo === 'entrar' ? 'Entre para ver seus jogos.' : 'Crie sua conta.'}
            </p>
          </div>
        </header>
        <div className="flex gap-1 rounded-lg bg-slate-200/70 p-1 dark:bg-slate-950">
          <button
            type="button"
            className={classeAba(modo === 'entrar')}
            onClick={() => {
              setModo('entrar');
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            className={classeAba(modo === 'cadastrar')}
            onClick={() => {
              setModo('cadastrar');
            }}
          >
            Criar conta
          </button>
        </div>
        {modo === 'entrar' ? <FormularioEntrar /> : <FormularioCadastro />}
      </div>
    </dialog>
  );
};

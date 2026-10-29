import { IconX } from '@tabler/icons-react';
import { useEffect, useRef, type ReactNode } from 'react';

interface DialogoProps {
  readonly aberto: boolean;
  readonly titulo: string;
  readonly aoFechar: () => void;
  readonly children: ReactNode;
}

export const Dialogo = ({ aberto, titulo, aoFechar, children }: DialogoProps) => {
  const referencia = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = referencia.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    <dialog
      ref={referencia}
      aria-label={titulo}
      onCancel={(evento) => {
        evento.preventDefault();
        aoFechar();
      }}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar();
      }}
      className="m-auto h-[min(52rem,92dvh)] w-[min(90rem,96vw)] max-w-none overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
    >
      {aberto && (
        <div className="flex h-full flex-col">
          <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
            <h2 className="text-base font-semibold">{titulo}</h2>
            <button
              type="button"
              aria-label="Fechar"
              onClick={aoFechar}
              className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <IconX aria-hidden size="1.125rem" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
        </div>
      )}
    </dialog>
  );
};

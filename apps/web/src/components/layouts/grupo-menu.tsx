import { IconChevronDown } from '@tabler/icons-react';
import { useState, type ReactNode } from 'react';

interface GrupoMenuProps {
  readonly titulo: string;
  readonly chave: string;
  readonly children: ReactNode;
}

const PREFIXO_ARMAZENAMENTO = 'mega-acerto:menu:';

const lerAberto = (chave: string): boolean => {
  try {
    return localStorage.getItem(PREFIXO_ARMAZENAMENTO + chave) !== 'fechado';
  } catch {
    return true;
  }
};

const gravarAberto = (chave: string, aberto: boolean): void => {
  try {
    localStorage.setItem(PREFIXO_ARMAZENAMENTO + chave, aberto ? 'aberto' : 'fechado');
  } catch {
    return;
  }
};

export const GrupoMenu = ({ titulo, chave, children }: GrupoMenuProps) => {
  const [aberto, setAberto] = useState(() => lerAberto(chave));

  const alternar = () => {
    setAberto((atual) => {
      gravarAberto(chave, !atual);
      return !atual;
    });
  };

  return (
    <section className="flex shrink-0 flex-col gap-1">
      <button
        type="button"
        aria-expanded={aberto}
        onClick={alternar}
        className="flex items-center justify-between rounded-md px-2.5 py-1 text-[0.7rem] font-semibold tracking-wider text-slate-500 uppercase transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
      >
        {titulo}
        <IconChevronDown
          aria-hidden
          size="0.875rem"
          className={`transition-transform ${aberto ? '' : '-rotate-90'}`}
        />
      </button>
      {aberto && children}
    </section>
  );
};

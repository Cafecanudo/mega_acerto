import { Link } from 'react-router';
import { JOGO_PADRAO, paths } from '@/config/paths';

const NaoEncontrado = () => (
  <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
    <p className="font-mono text-5xl font-bold text-emerald-600 dark:text-emerald-400">404</p>
    <p className="text-slate-600 dark:text-slate-300">Página não encontrada.</p>
    <Link
      to={paths.historico(JOGO_PADRAO)}
      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white dark:bg-emerald-500 dark:text-emerald-950"
    >
      Voltar ao histórico
    </Link>
  </div>
);

export default NaoEncontrado;

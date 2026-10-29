import type { ComponentType } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { JOGO_PADRAO, paths } from '@/config/paths';
import { ErroRota } from './routes/erro-rota';

type ModuloRota = Promise<{ default: ComponentType }>;

const carregar = (importar: () => ModuloRota) => async () => ({
  Component: (await importar()).default,
});

export const router = createBrowserRouter([
  {
    path: paths.inicio,
    element: <Navigate to={paths.historico(JOGO_PADRAO)} replace />,
  },
  {
    path: ':jogo',
    lazy: carregar(() => import('./routes/raiz-jogo')),
    ErrorBoundary: ErroRota,
    children: [
      { index: true, element: <Navigate to="concursos" replace /> },
      { path: 'concursos', lazy: carregar(() => import('./routes/historico')) },
      { path: 'concursos/:numero', lazy: carregar(() => import('./routes/concurso')) },
      { path: 'busca', lazy: carregar(() => import('./routes/busca')) },
    ],
  },
  { path: '*', lazy: carregar(() => import('./routes/nao-encontrado')) },
]);

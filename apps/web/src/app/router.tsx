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
    lazy: carregar(() => import('./routes/raiz')),
    ErrorBoundary: ErroRota,
    children: [
      { index: true, element: <Navigate to={paths.jogo(JOGO_PADRAO)} replace /> },
      { path: 'analises', lazy: carregar(() => import('./routes/analises')) },
      { path: 'analises/:id', lazy: carregar(() => import('./routes/analise')) },
      { path: 'conferir-apostas', lazy: carregar(() => import('./routes/conferir-apostas')) },
      { path: 'conta/apostas', lazy: carregar(() => import('./routes/apostas')) },
      { path: 'conta/favoritos', lazy: carregar(() => import('./routes/favoritos')) },
      { path: 'configuracoes/valores', lazy: carregar(() => import('./routes/valores')) },
      {
        path: ':jogo',
        lazy: carregar(() => import('./routes/raiz-jogo')),
        children: [
          { index: true, lazy: carregar(() => import('./routes/jogo')) },
          { path: 'concursos', element: <Navigate to=".." replace /> },
          { path: 'concursos/:numero', lazy: carregar(() => import('./routes/concurso')) },
        ],
      },
      { path: '*', lazy: carregar(() => import('./routes/nao-encontrado')) },
    ],
  },
]);

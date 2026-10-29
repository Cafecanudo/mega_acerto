import { RouterProvider } from 'react-router/dom';
import { AppProvider } from './provider';
import { router } from './router';

export const App = () => (
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>
);

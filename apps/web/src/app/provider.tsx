import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { criarQueryClient } from '@/lib/react-query';

export const AppProvider = ({ children }: { readonly children: ReactNode }) => {
  const [queryClient] = useState(criarQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

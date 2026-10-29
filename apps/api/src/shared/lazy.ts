export const lazy = <T>(fabrica: () => T): (() => T) => {
  let instancia: { readonly valor: T } | undefined;
  return () => {
    instancia ??= { valor: fabrica() };
    return instancia.valor;
  };
};

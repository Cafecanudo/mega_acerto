const CARACTERE_NULO = String.fromCharCode(0);

export const removerCaracteresNulos = (valor: unknown): unknown => {
  if (typeof valor === 'string') return valor.replaceAll(CARACTERE_NULO, '');
  if (Array.isArray(valor)) return valor.map(removerCaracteresNulos);
  if (valor !== null && typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor).map(([chave, item]) => [chave, removerCaracteresNulos(item)]),
    );
  }
  return valor;
};

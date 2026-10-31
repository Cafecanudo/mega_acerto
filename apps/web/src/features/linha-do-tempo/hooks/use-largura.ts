import { useLayoutEffect, useRef, useState } from 'react';

export const useLargura = <T extends HTMLElement>() => {
  const referencia = useRef<T>(null);
  const [largura, setLargura] = useState(0);

  useLayoutEffect(() => {
    const elemento = referencia.current;
    if (!elemento) return;
    setLargura(elemento.clientWidth);
    const observador = new ResizeObserver(([entrada]) => {
      if (entrada) setLargura(entrada.contentRect.width);
    });
    observador.observe(elemento);
    return () => {
      observador.disconnect();
    };
  }, []);

  return { referencia, largura };
};

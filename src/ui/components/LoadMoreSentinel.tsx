import { useEffect, useRef } from 'react';

/** Elemento invisible que llama a onVisible cuando entra en pantalla (scroll infinito). */
export default function LoadMoreSentinel({
  onVisible,
  disabled,
}: {
  onVisible: () => void;
  disabled: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;
    // Se recrea al cambiar `disabled`: si al terminar de cargar sigue visible, vuelve a disparar.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onVisible();
      },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible, disabled]);

  return <div ref={ref} style={{ height: 1 }} />;
}

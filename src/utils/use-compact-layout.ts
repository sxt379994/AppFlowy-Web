import { RefObject, useLayoutEffect, useState, useSyncExternalStore } from 'react';

const subscribe = (notify: () => void) => {
  const coarsePointer = window.matchMedia?.('(pointer: coarse)');

  window.addEventListener('resize', notify);
  coarsePointer?.addEventListener('change', notify);
  return () => {
    window.removeEventListener('resize', notify);
    coarsePointer?.removeEventListener('change', notify);
  };
};

export function useViewportWidth() {
  return useSyncExternalStore(subscribe, () => window.innerWidth, () => 1024);
}

// Presentation only. Authorization must not depend on viewport or input type.
export function useCompactLayout() {
  return useSyncExternalStore(
    subscribe,
    () => window.innerWidth < 768 ||
      (window.innerWidth < 1024 && Boolean(window.matchMedia?.('(pointer: coarse)').matches)),
    () => false
  );
}

export function useElementWidth(ref: RefObject<HTMLElement>) {
  const [width, setWidth] = useState<number>();

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) return;
    const measure = () => setWidth(element.clientWidth || undefined);

    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

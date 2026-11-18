import { useSyncExternalStore } from 'react';

/* ---------------------------------------------------------------------------
   Отслеживание системной настройки «меньше движения».

   useSyncExternalStore подписывается на matchMedia и корректно переживает
   StrictMode: каждый экземпляр хука добавляет ровно один обработчик и снимает
   его при отписке. Изменение настройки во время работы сайта сразу обновляет
   состояние компонента.
   --------------------------------------------------------------------------- */

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

let mediaQueryList: MediaQueryList | null = null;

function getMediaQueryList(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null;
  }

  if (!mediaQueryList) {
    mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
  }

  return mediaQueryList;
}

function getSnapshot(): boolean {
  return getMediaQueryList()?.matches ?? false;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(onStoreChange: () => void): () => void {
  const query = getMediaQueryList();

  if (!query) {
    return () => undefined;
  }

  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', onStoreChange);
    return () => query.removeEventListener('change', onStoreChange);
  }

  // Safari до 14 не поддерживает addEventListener у MediaQueryList.
  const legacyQuery = query as LegacyMediaQueryList;

  if (typeof legacyQuery.addListener === 'function') {
    legacyQuery.addListener(onStoreChange);
    return () => legacyQuery.removeListener?.(onStoreChange);
  }

  return () => undefined;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

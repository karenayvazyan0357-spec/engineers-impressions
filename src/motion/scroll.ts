import { ScrollTrigger } from './gsap';

/* ---------------------------------------------------------------------------
   Настройка ScrollTrigger и безопасный refresh.

   Модуль не создаёт ни одного ScrollTrigger: он только настраивает плагин и
   пересчитывает позиции уже существующих триггеров. Пока триггеров нет,
   refresh является no-op, поэтому подключение инфраструктуры не влияет на
   текущее поведение сайта.

   Refresh выполняется:
   - после загрузки страницы (window load);
   - после готовности веб-шрифтов (document.fonts.ready);
   - по явному запросу из useSectionMotion после создания контекста.

   Вызовы объединяются в один кадр, чтобы не вызывать ScrollTrigger.refresh()
   несколько раз подряд.
   --------------------------------------------------------------------------- */

const REFRESH_DELAY_MS = 100;

let isConfigured = false;
let refreshTimer: number | null = null;
let refreshFrame: number | null = null;

export function configureScrollTrigger(): void {
  if (isConfigured) {
    return;
  }

  // Не меняет анимации и их defaults; только убирает лишние refresh при
  // изменении адресной строки мобильного браузера.
  ScrollTrigger.config({ ignoreMobileResize: true });
  isConfigured = true;
}

function cancelScheduledRefresh(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (refreshTimer !== null) {
    window.clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  if (refreshFrame !== null) {
    window.cancelAnimationFrame(refreshFrame);
    refreshFrame = null;
  }
}

/** Немедленный, но безопасный пересчёт позиций существующих триггеров. */
export function refreshScrollTrigger(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (document.visibilityState === 'hidden' || !document.body) {
    return;
  }

  if (ScrollTrigger.getAll().length === 0) {
    return;
  }

  try {
    ScrollTrigger.refresh();
  } catch (error) {
    // Ошибка пересчёта не должна ломать страницу.
    if (import.meta.env.DEV) {
      console.warn('[motion] ScrollTrigger.refresh() failed', error);
    }
  }
}

/**
 * Планирует один refresh. Повторные вызовы до выполнения не создают очередь.
 * Задержка нужна, чтобы дождаться стабилизации layout после загрузки шрифтов.
 */
export function scheduleScrollTriggerRefresh(delay = REFRESH_DELAY_MS): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (refreshTimer !== null || refreshFrame !== null) {
    return;
  }

  refreshTimer = window.setTimeout(() => {
    refreshTimer = null;

    refreshFrame = window.requestAnimationFrame(() => {
      refreshFrame = null;
      refreshScrollTrigger();
    });
  }, Math.max(0, delay));
}

let retainCount = 0;
let detachRuntime: (() => void) | null = null;

function attachRuntimeRefresh(): () => void {
  configureScrollTrigger();

  let cancelled = false;
  const cleanups: Array<() => void> = [];

  const handleLoad = () => {
    scheduleScrollTriggerRefresh();
  };

  if (document.readyState === 'complete') {
    scheduleScrollTriggerRefresh();
  } else {
    window.addEventListener('load', handleLoad);
    cleanups.push(() => window.removeEventListener('load', handleLoad));
  }

  const fonts = document.fonts;

  if (fonts) {
    fonts.ready
      .then(() => {
        if (!cancelled) {
          scheduleScrollTriggerRefresh();
        }
      })
      .catch(() => undefined);

    cleanups.push(() => {
      cancelled = true;
    });
  }

  return () => {
    cancelled = true;
    cleanups.forEach((cleanup) => cleanup());
  };
}

/**
 * Подключает глобальные слушатели загрузки страницы и шрифтов.
 *
 * Использует счётчик ссылок: несколько секций делят один набор слушателей,
 * поэтому в StrictMode и при монтировании нескольких компонентов обработчики
 * не дублируются. Возвращаемая функция идемпотентна.
 */
export function setupScrollTriggerRefresh(): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  retainCount += 1;

  if (!detachRuntime) {
    detachRuntime = attachRuntimeRefresh();
  }

  let released = false;

  return () => {
    if (released) {
      return;
    }

    released = true;
    retainCount = Math.max(0, retainCount - 1);

    if (retainCount > 0 || !detachRuntime) {
      return;
    }

    detachRuntime();
    detachRuntime = null;
    cancelScheduledRefresh();
  };
}

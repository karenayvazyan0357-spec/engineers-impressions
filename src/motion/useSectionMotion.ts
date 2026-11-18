import { useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { ScrollTrigger, gsap } from './gsap';
import { scheduleScrollTriggerRefresh, setupScrollTriggerRefresh } from './scroll';
import { useReducedMotion } from './useReducedMotion';

/* ---------------------------------------------------------------------------
   React-хук для анимаций конкретной секции.

   Контекст создаётся только после того, как DOM-узел секции смонтирован,
   и получает этот узел как scope: селекторы внутри setup автоматически
   ограничены секцией. При размонтировании, смене зависимостей, отключении
   или включении prefers-reduced-motion контекст полностью откатывается
   (ctx.revert()), убивая созданные твины и ScrollTrigger.
   --------------------------------------------------------------------------- */

// useLayoutEffect на клиенте гарантирует наличие DOM, useEffect — безопасный
// вариант для потенциального SSR.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface SectionMotionContext {
  readonly gsap: typeof gsap;
  readonly ScrollTrigger: typeof ScrollTrigger;
  /** DOM-узел секции, переданный в gsap.context() как scope. */
  readonly scope: HTMLElement;
  /** Контекст GSAP: context.add(), context.selector и т. д. */
  readonly context: gsap.Context;
  /** Текущее значение системной настройки «меньше движения». */
  readonly reducedMotion: boolean;
}

export type SectionMotionSetup = (
  context: SectionMotionContext,
) => void | (() => void);

export interface UseSectionMotionOptions {
  /**
   * Зависимости, при изменении которых контекст пересоздаётся.
   * Сравниваются поверхностно, как в useEffect.
   */
  dependencies?: readonly unknown[];
  /** Полностью отключить motion для секции, не размонтируя её. */
  disabled?: boolean;
}

const EMPTY_DEPENDENCIES: readonly unknown[] = [];

function areDependenciesEqual(
  previous: readonly unknown[] | null,
  next: readonly unknown[],
): boolean {
  if (previous === next) {
    return true;
  }

  if (!previous || previous.length !== next.length) {
    return false;
  }

  return previous.every((value, index) => Object.is(value, next[index]));
}

export function useSectionMotion<T extends HTMLElement = HTMLElement>(
  setup: SectionMotionSetup,
  options: UseSectionMotionOptions = {},
): RefObject<T | null> {
  const scopeRef = useRef<T>(null);
  const contextRef = useRef<gsap.Context | null>(null);
  const setupRef = useRef(setup);

  const previousScopeRef = useRef<T | null>(null);
  const previousEnabledRef = useRef<boolean | null>(null);
  const previousDependenciesRef = useRef<readonly unknown[] | null>(null);

  const reducedMotion = useReducedMotion();
  const disabled = options.disabled ?? false;
  const dependencies = options.dependencies ?? EMPTY_DEPENDENCIES;

  // Глобальные слушатели load/fonts общие для всех секций и учитывают
  // повторное монтирование в StrictMode.
  useIsomorphicLayoutEffect(() => setupScrollTriggerRefresh(), []);

  // Эффект намеренно без массива зависимостей: он дешёвый, сравнивает
  // зависимости поверхностно и не пересоздаёт контекст без необходимости.
  // Так вызывающий код может передавать dependencies литералом.
  useIsomorphicLayoutEffect(() => {
    setupRef.current = setup;

    const scope = scopeRef.current;
    const enabled = !disabled && !reducedMotion;

    const scopeChanged = previousScopeRef.current !== scope;
    const enabledChanged = previousEnabledRef.current !== enabled;
    const dependenciesChanged = !areDependenciesEqual(
      previousDependenciesRef.current,
      dependencies,
    );

    previousScopeRef.current = scope;
    previousEnabledRef.current = enabled;
    previousDependenciesRef.current = dependencies;

    if (scopeChanged || enabledChanged || dependenciesChanged) {
      contextRef.current?.revert();
      contextRef.current = null;
    }

    // DOM-узел ещё не появился, motion отключён или reduced motion включён.
    if (!scope || !enabled || contextRef.current) {
      return;
    }

    contextRef.current = gsap.context((context) => {
      return setupRef.current({
        gsap,
        ScrollTrigger,
        scope,
        context,
        reducedMotion,
      });
    }, scope);

    scheduleScrollTriggerRefresh(0);
  });

  // Отдельная очистка при размонтировании. В StrictMode вызывается на
  // симулированном unmount, после чего основной эффект создаёт контекст заново.
  useIsomorphicLayoutEffect(() => {
    return () => {
      contextRef.current?.revert();
      contextRef.current = null;
      previousScopeRef.current = null;
      previousEnabledRef.current = null;
      previousDependenciesRef.current = null;
    };
  }, []);

  return scopeRef;
}

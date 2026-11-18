import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/* ---------------------------------------------------------------------------
   Единая точка входа в GSAP для всего сайта.

   Все модули движения импортируют gsap и ScrollTrigger только отсюда, поэтому:
   - в приложении существует один экземпляр GSAP;
   - ScrollTrigger регистрируется централизованно и без повторной регистрации;
   - глобальные defaults и настройки анимаций не меняются.
   --------------------------------------------------------------------------- */

let scrollTriggerRegistered = false;

/**
 * Регистрирует ScrollTrigger.
 *
 * gsap.registerPlugin() сам по себе идемпотентен, но локальный флаг избавляет
 * от повторного вызова в рамках одного экземпляра модуля (в том числе при
 * повторном монтировании компонентов в React StrictMode).
 */
export function registerScrollTrigger(): void {
  if (scrollTriggerRegistered) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  scrollTriggerRegistered = true;
}

registerScrollTrigger();

export { gsap, ScrollTrigger };

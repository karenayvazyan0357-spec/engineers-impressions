import { useState } from 'react';
import { motionDurations, motionEases } from '../../motion/tokens';
import { useSectionMotion } from '../../motion/useSectionMotion';
import ContactDrawing from './ContactDrawing';
import './Contact.css';

/* ---------------------------------------------------------------------------
   Contact — финальная секция «Есть идея?».

   Графитовый экран, который визуально замыкает сайт: крупный заголовок Playfair,
   терракотовый акцент, крупная CTA-кнопка и инженерный чертёж финальной сборки.
   Реального контактного адреса в проекте нет, поэтому кнопка — осознанная
   заглушка с понятным состоянием «контактные данные будут добавлены».
   --------------------------------------------------------------------------- */

const Contact = () => {
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  /* ---------------------------------------------------------------------
     Появление секции при скролле: один ScrollTrigger и одна сдержанная
     последовательность без пина. Двигаются только transform и opacity,
     поэтому заголовок, лид, CTA и чертёж сохраняют композицию и размеры,
     а интерактив (раскрытие placeholder, hover/focus кнопки) остаётся
     нетронутым.

     Placeholder не участвует в анимации: он скрыт до действия пользователя
     и раскрывается штатной логикой React, без GSAP.
     --------------------------------------------------------------------- */
  const contactRef = useSectionMotion<HTMLElement>(({ gsap, scope }) => {
    const top = scope.querySelector<HTMLElement>('.contact__top');
    const topRule = scope.querySelector<HTMLElement>('.contact__top-rule');
    const titleLines = Array.from(scope.querySelectorAll<HTMLElement>('.contact__title-line'));
    const lede = scope.querySelector<HTMLElement>('.contact__lede');
    const ctaButton = scope.querySelector<HTMLElement>('.contact__cta-button');
    const ctaStatus = scope.querySelector<HTMLElement>('.contact__cta-status');
    const drawingHead = scope.querySelector<HTMLElement>('.contact__drawing-head');
    const drawingCaption = scope.querySelector<HTMLElement>('.contact__drawing-caption');
    const drawingSvg = scope.querySelector<SVGSVGElement>('.contact-drawing');

    /* Слои чертежа идут в порядке разметки — сетка, оси, форма, штриховка,
       радиус, сечение, идея, размеры, подписи. Берём только реально
       отрисованные элементы, чтобы не анимировать скрытое. Проявляются они
       исключительно через opacity: геометрия SVG не меняется. */
    const drawingLayers = drawingSvg
      ? Array.from(drawingSvg.children).filter(
          (layer): layer is SVGElement => layer.getClientRects().length > 0,
        )
      : [];

    const isCompact = window.matchMedia('(max-width: 767px)').matches;
    const offset = isCompact ? 8 : 14;
    const entrance = isCompact ? motionDurations.fast : motionDurations.base;
    const reveal = isCompact ? motionDurations.base : motionDurations.slow;

    const timeline = gsap.timeline({
      defaults: { ease: motionEases.out },
      scrollTrigger: {
        trigger: scope,
        start: 'top 85%',
        once: true,
      },
    });

    if (top) {
      timeline.from(top, { y: offset * 0.5, opacity: 0, duration: entrance }, 0);
    }

    if (topRule) {
      timeline.from(
        topRule,
        {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: reveal,
          ease: motionEases.standard,
        },
        0,
      );
    }

    if (titleLines.length > 0) {
      timeline.from(
        titleLines,
        { y: offset, opacity: 0, duration: reveal, stagger: 0.06 },
        0.04,
      );
    }

    if (lede) {
      timeline.from(lede, { y: offset * 0.75, opacity: 0, duration: entrance }, 0.12);
    }

    if (ctaButton) {
      timeline.from(ctaButton, { y: offset * 0.75, opacity: 0, duration: entrance }, 0.18);
    }

    if (ctaStatus) {
      timeline.from(ctaStatus, { y: offset * 0.4, opacity: 0, duration: entrance }, 0.24);
    }

    if (drawingHead) {
      timeline.from(drawingHead, { y: offset * 0.4, opacity: 0, duration: entrance }, 0.2);
    }

    /* На мобильном каскад слоёв заменяется одним проявлением иллюстрации:
       меньше работы композитору, геометрия чертежа при этом не меняется. */
    if (drawingSvg) {
      if (isCompact) {
        timeline.from(
          drawingSvg,
          { opacity: 0, duration: reveal, ease: motionEases.standard },
          0.26,
        );
      } else if (drawingLayers.length > 0) {
        timeline.from(
          drawingLayers,
          {
            opacity: 0,
            duration: motionDurations.base,
            stagger: motionDurations.instant * 0.6,
            ease: motionEases.standard,
          },
          0.26,
        );
      }
    }

    if (drawingCaption) {
      timeline.from(drawingCaption, { y: offset * 0.4, opacity: 0, duration: entrance }, 0.36);
    }

    /* После проигрывания снимаем инлайновый transform: элементы возвращаются
       к натуральной раскладке, а геометрия секции совпадает со снимком до
       анимации. */
    const transformed = [
      top,
      topRule,
      ...titleLines,
      lede,
      ctaButton,
      ctaStatus,
      drawingHead,
      drawingCaption,
    ].filter((element): element is HTMLElement => element !== null);

    if (transformed.length > 0) {
      timeline.call(() => {
        gsap.set(transformed, { clearProps: 'transform' });
      });
    }
  });

  return (
    <section
      className="contact"
      id="contact"
      aria-labelledby="contact-title"
      ref={contactRef}
    >
      <div className="contact__frame">
        <div className="contact__top">
          <span className="contact__top-mark" aria-hidden="true" />
          <p className="contact__top-label">Контакт / Финальная сборка</p>
          <span className="contact__top-rule" aria-hidden="true" />
          <p className="contact__top-index">CONTACT / FINAL ASSEMBLY</p>
        </div>

        <div className="contact__head">
          <h2 className="contact__title" id="contact-title">
            <span className="contact__title-line">Есть идея?</span>
            <span className="contact__title-line">Давайте придадим</span>
            <span className="contact__title-line">
              ей <span className="contact__title-accent">форму.</span>
            </span>
          </h2>
          <p className="contact__lede">Большие впечатления начинаются с точного вопроса.</p>
        </div>

        <div className="contact__body">
          <div className="contact__cta">
            <button
              className="contact__cta-button"
              type="button"
              aria-expanded={showPlaceholder}
              aria-controls="contact-placeholder"
              onClick={() => setShowPlaceholder((open) => !open)}
            >
              Обсудить проект
              <span className="contact__cta-arrow" aria-hidden="true">
                →
              </span>
            </button>

            <p className="contact__cta-status">
              <span className="contact__cta-status-dot" aria-hidden="true" />
              Статус: контактные данные будут добавлены
            </p>

            <div
              id="contact-placeholder"
              className="contact__placeholder"
              role="status"
              aria-live="polite"
              hidden={!showPlaceholder}
            >
              Контактные данные будут добавлены. Пока расскажите о своей идее, изучив проекты и
              систему в разделах выше — точный вопрос уже приближает нас к форме.
            </div>
          </div>

          <figure className="contact__drawing">
            <div className="contact__drawing-head">
              <span className="contact__drawing-label">Чертёж сборки · Лист 006</span>
              <span className="contact__drawing-note">Финальная сборка / СПБ</span>
            </div>

            <div className="contact__drawing-body">
              <ContactDrawing />
            </div>

            <figcaption className="contact__drawing-caption">
              <span>
                Идея <span className="contact__drawing-caption-arrow">→</span> форма
              </span>
              <span>59°56′ N / 30°18′ E — Санкт-Петербург</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};

export default Contact;

import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { motionDurations, motionEases } from '../../motion/tokens';
import { useSectionMotion } from '../../motion/useSectionMotion';
import { QualityDial, QualityGauge } from './QualityDrawing';
import './Quality.css';

/* ---------------------------------------------------------------------------
   Секция «Quality — Контроль качества».

   Технический паспорт системы: четыре показателя концепции (360°, 05, 100%,
   01) в асимметричной композиции, инженерная шкала, циферблат и протокол
   проверки. Выбор контрольного пункта (клик, тап или клавиатура) двигает
   стрелку циферблата, курсор шкалы и световой индикатор, а также раскрывает
   пояснение. Все характеристики — условные и описывают концепцию контроля,
   а не фактические достижения компании (пометка — в конце показателей).
   --------------------------------------------------------------------------- */

interface ControlPoint {
  id: string;
  index: string;
  code: string;
  title: string;
  explanation: string;
  degrees: number;
  percent: number;
}

const CONTROL_POINTS: readonly ControlPoint[] = [
  {
    id: 'geometry',
    index: '01',
    code: 'DIM-001',
    title: 'Геометрия и размеры',
    explanation: 'Сетка, пропорции и допуски выверены по осям. Отклонение в пределах ±0,05.',
    degrees: 0,
    percent: 0,
  },
  {
    id: 'materials',
    index: '02',
    code: 'MAT-002',
    title: 'Материалы и поверхности',
    explanation: 'Отделка, фактуры и стыки соответствуют спецификации листа.',
    degrees: 72,
    percent: 25,
  },
  {
    id: 'lighting',
    index: '03',
    code: 'LUX-003',
    title: 'Свет и среда',
    explanation: 'Освещение откалибровано по сценарию, цветовая температура выдержана.',
    degrees: 144,
    percent: 50,
  },
  {
    id: 'navigation',
    index: '04',
    code: 'NAV-004',
    title: 'Сценарий и навигация',
    explanation: 'Логика движения зрителя проверена на макете, маршрут без тупиков.',
    degrees: 216,
    percent: 75,
  },
  {
    id: 'assembly',
    index: '05',
    code: 'ASM-005',
    title: 'Итоговая сборка',
    explanation: 'Все узлы собраны, зазоры в допуске, система готова к запуску.',
    degrees: 288,
    percent: 100,
  },
];

const SCALE_TICKS = [0, 25, 50, 75, 100];
const SCALE_LABELS = ['0°', '90°', '180°', '270°', '360°'];
const TICK_STEPS = [1, 2, 3, 4, 5];

const Quality = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activePoint = CONTROL_POINTS[activeIndex];

  /* ---------------------------------------------------------------------
     Появление секции при скролле: одна последовательность и один
     ScrollTrigger на всю секцию, без пина. Двигаются только transform и
     opacity, поэтому геометрия, шкала и протокол не меняются, а интерактив
     (aria-pressed, data-состояния, курсор шкалы, стрелка циферблата,
     CSS-анимация quality-swap) остаётся нетронутым.
     --------------------------------------------------------------------- */
  const qualityRef = useSectionMotion<HTMLElement>(({ gsap, scope }) => {
    const top = scope.querySelector<HTMLElement>('.quality__top');
    const topRule = scope.querySelector<HTMLElement>('.quality__top-rule');
    const titleLines = Array.from(scope.querySelectorAll<HTMLElement>('.quality__title-line'));
    const lede = scope.querySelector<HTMLElement>('.quality__lede');
    const scale = scope.querySelector<HTMLElement>('.quality__scale');
    const metrics = Array.from(scope.querySelectorAll<HTMLElement>('.quality__metric'));
    const note = scope.querySelector<HTMLElement>('.quality__note');
    const protocol = scope.querySelector<HTMLElement>('.quality__protocol');
    const protocolHead = scope.querySelector<HTMLElement>('.quality__protocol-head');
    const checkItems = Array.from(
      scope.querySelectorAll<HTMLElement>('.quality__checks > li'),
    );
    const readout = scope.querySelector<HTMLElement>('.quality__readout');
    const hint = scope.querySelector<HTMLElement>('.quality__hint');
    const footer = scope.querySelector<HTMLElement>('.quality__footer');

    /* Графика проявляется только через opacity, поэтому линии, деления и
       контуры не сдвигаются. Стрелку циферблата GSAP не трогает: её transform
       принадлежит React (inline style + CSS-transition), поэтому у стрелки
       один владелец transform. Проявляются лишь её штрих и наконечник —
       отдельные элементы, стили которых React не задаёт. */
    const dialLayers = Array.from(
      scope.querySelectorAll<SVGElement>('.quality-dial > :not(title)'),
    )
      .filter((layer) => !layer.classList.contains('quality-dial__needle'))
      .filter((layer) => layer.getClientRects().length > 0);
    const needleParts = Array.from(
      scope.querySelectorAll<SVGElement>('.quality-dial__needle > *'),
    ).filter((part) => part.getClientRects().length > 0);
    const gaugeLayers = Array.from(
      scope.querySelectorAll<SVGElement>('.quality-gauge > :not(title)'),
    ).filter((layer) => layer.getClientRects().length > 0);

    const isCompact = window.matchMedia('(max-width: 767px)').matches;
    const offset = isCompact ? 8 : 14;
    const entrance = isCompact ? motionDurations.fast : motionDurations.base;
    const reveal = isCompact ? motionDurations.base : motionDurations.slow;

    const timeline = gsap.timeline({
      defaults: { ease: motionEases.out },
      scrollTrigger: {
        trigger: scope,
        start: 'top 72%',
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
      timeline.from(lede, { y: offset * 0.75, opacity: 0, duration: entrance }, 0.14);
    }

    /* Шкала анимируется как блок: курсор внутри неё остаётся под React. */
    if (scale) {
      timeline.from(scale, { y: offset * 0.75, opacity: 0, duration: reveal }, 0.2);
    }

    if (metrics.length > 0) {
      timeline.from(
        metrics,
        {
          y: offset,
          opacity: 0,
          duration: reveal,
          stagger: isCompact ? 0.04 : 0.06,
        },
        0.2,
      );
    }

    if (dialLayers.length > 0) {
      timeline.from(
        dialLayers,
        {
          opacity: 0,
          duration: motionDurations.base,
          stagger: motionDurations.instant * 0.5,
          ease: motionEases.standard,
        },
        0.32,
      );
    }

    if (gaugeLayers.length > 0) {
      timeline.from(
        gaugeLayers,
        {
          opacity: 0,
          duration: motionDurations.base,
          stagger: motionDurations.instant * 0.4,
          ease: motionEases.standard,
        },
        0.36,
      );
    }

    if (needleParts.length > 0) {
      timeline.from(needleParts, { opacity: 0, duration: entrance }, 0.46);
    }

    if (note) {
      timeline.from(note, { opacity: 0, duration: entrance }, 0.5);
    }

    if (protocol) {
      timeline.from(protocol, { y: offset, opacity: 0, duration: reveal }, 0.3);
    }

    if (protocolHead) {
      timeline.from(protocolHead, { y: offset * 0.4, opacity: 0, duration: entrance }, 0.34);
    }

    if (checkItems.length > 0) {
      timeline.from(
        checkItems,
        {
          y: offset * 0.75,
          opacity: 0,
          duration: entrance,
          stagger: isCompact ? 0.04 : 0.05,
        },
        0.38,
      );
    }

    if (readout) {
      timeline.from(readout, { y: offset, opacity: 0, duration: reveal }, 0.44);
    }

    if (hint) {
      timeline.from(hint, { y: offset * 0.4, opacity: 0, duration: entrance }, 0.56);
    }

    if (footer) {
      timeline.from(footer, { y: offset * 0.6, opacity: 0, duration: entrance }, 0.5);
    }

    /* После проигрывания снимаем инлайновый transform: элементы возвращаются
       к натуральной раскладке, текст снова рисуется без слоя композиции, а
       геометрия секции совпадает со снимком до анимации. */
    const transformed = [
      top,
      topRule,
      ...titleLines,
      lede,
      scale,
      ...metrics,
      protocol,
      protocolHead,
      ...checkItems,
      readout,
      hint,
      footer,
    ].filter((element): element is HTMLElement => element !== null);

    if (transformed.length > 0) {
      timeline.call(() => {
        gsap.set(transformed, { clearProps: 'transform' });
      });
    }
  });

  /* Список контрольных пунктов ведёт себя как группа переключателей:
     стрелки, Home и End перемещают выбор и фокус, Enter и Space нативны. */
  const handleListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const lastIndex = CONTROL_POINTS.length - 1;
    let nextIndex: number;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = activeIndex === lastIndex ? 0 : activeIndex + 1;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = activeIndex === 0 ? lastIndex : activeIndex - 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    event.preventDefault();
    setActiveIndex(nextIndex);
    pointRefs.current[nextIndex]?.focus();
  };

  return (
    <section className="quality" id="quality" aria-labelledby="quality-title" ref={qualityRef}>
      <div className="quality__frame">
        <div className="quality__top">
          <span className="quality__top-mark" aria-hidden="true" />
          <p className="quality__top-label">Контроль качества / Система 001</p>
          <span className="quality__top-rule" aria-hidden="true" />
          <p className="quality__top-index">QUALITY CONTROL / SYSTEM 001</p>
        </div>

        <div className="quality__head">
          <h2 className="quality__title" id="quality-title">
            <span className="quality__title-line">Точность —</span>
            <span className="quality__title-line">
              <span className="quality__title-accent">не случайность.</span>
            </span>
          </h2>
          <p className="quality__lede">
            Впечатление складывается из деталей. Каждая деталь проходит проверку.
          </p>
        </div>

        <div className="quality__scale" aria-hidden="true">
          <span className="quality__scale-label">Шкала контроля · деление 90°</span>
          <div className="quality__scale-track">
            {SCALE_TICKS.map((tick) => (
              <span key={tick} className="quality__scale-tick" style={{ left: `${tick}%` }} />
            ))}
            <span className="quality__scale-cursor" style={{ left: `${activePoint.percent}%` }} />
          </div>
          <div className="quality__scale-labels">
            {SCALE_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>

        <div className="quality__metrics">
          <figure className="quality__metric quality__metric--dial">
            <div className="quality__metric-head">
              <span className="quality__metric-label">Обзор задачи</span>
              <span className="quality__metric-code">SYS-360</span>
            </div>
            <div className="quality__metric-media">
              <QualityDial degrees={activePoint.degrees} activeIndex={activeIndex} />
            </div>
            <figcaption className="quality__metric-foot">
              <span className="quality__metric-value">360°</span>
              <span className="quality__metric-caption">
                Полный охват — от контекста до каждой детали.
              </span>
            </figcaption>
          </figure>

          <div className="quality__side">
            <figure className="quality__metric quality__metric--gauge">
              <div className="quality__metric-head">
                <span className="quality__metric-label">Контроль этапов</span>
                <span className="quality__metric-code">COV-100</span>
              </div>
              <div className="quality__metric-media">
                <QualityGauge />
              </div>
              <figcaption className="quality__metric-foot">
                <span className="quality__metric-value">100%</span>
                <span className="quality__metric-caption">Каждый этап проходит проверку.</span>
              </figcaption>
            </figure>

            <div className="quality__pair">
              <figure className="quality__metric quality__metric--ticks">
                <div className="quality__metric-head">
                  <span className="quality__metric-label">Этапы системы</span>
                  <span className="quality__metric-code">STG-05</span>
                </div>
                <div className="quality__tick-ladder" aria-hidden="true">
                  {TICK_STEPS.map((step) => (
                    <span
                      key={step}
                      className="quality__tick-bar"
                      style={{ height: `${step * 8}px` }}
                    />
                  ))}
                </div>
                <figcaption className="quality__metric-foot">
                  <span className="quality__metric-value">05</span>
                  <span className="quality__metric-caption">этапов системы.</span>
                </figcaption>
              </figure>

              <figure className="quality__metric quality__metric--node">
                <div className="quality__metric-head">
                  <span className="quality__metric-label">Управление</span>
                  <span className="quality__metric-code">CTRL-01</span>
                </div>
                <div className="quality__node-glyph" aria-hidden="true">
                  <span className="quality__node-ring" />
                  <span className="quality__node-crossh" />
                  <span className="quality__node-crossv" />
                  <span className="quality__node-dot" />
                </div>
                <figcaption className="quality__metric-foot">
                  <span className="quality__metric-value">01</span>
                  <span className="quality__metric-caption">единая система управления.</span>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        <p className="quality__note">
          <span className="quality__note-mark" aria-hidden="true">
            *
          </span>
          Показатели системы условны и описывают концепцию контроля качества, а не фактические
          достижения компании.
        </p>

        <div className="quality__protocol">
          <div className="quality__protocol-head">
            <span className="quality__protocol-title">Протокол проверки</span>
            <span className="quality__protocol-meta">ОТК · ЛИСТ 001 · ПУНКТЫ 01—05</span>
            <span className="quality__protocol-stamp" aria-hidden="true">
              ОТК
            </span>
          </div>

          <div className="quality__protocol-body">
            <ul
              className="quality__checks"
              aria-label="Контрольные пункты протокола"
              onKeyDown={handleListKeyDown}
            >
              {CONTROL_POINTS.map((point, index) => (
                <li key={point.id}>
                  <button
                    ref={(node) => {
                      pointRefs.current[index] = node;
                    }}
                    type="button"
                    className="quality__check"
                    aria-pressed={index === activeIndex}
                    aria-controls="quality-readout"
                    onClick={() => setActiveIndex(index)}
                  >
                    <span className="quality__check-index" aria-hidden="true">
                      {point.index}
                    </span>
                    <span className="quality__check-title">{point.title}</span>
                    <span className="quality__check-code">{point.code}</span>
                    <span className="quality__check-mark" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            <div
              className="quality__readout"
              id="quality-readout"
              role="region"
              aria-labelledby="quality-readout-title"
              aria-live="polite"
            >
              <div className="quality__swap" key={activePoint.id}>
                <div className="quality__readout-head">
                  <span className="quality__readout-index" aria-hidden="true">
                    {activePoint.index}
                  </span>
                  <span className="quality__readout-code">{activePoint.code}</span>
                </div>

                <h3 className="quality__readout-title" id="quality-readout-title">
                  {activePoint.title}
                </h3>

                <p className="quality__readout-text">{activePoint.explanation}</p>

                <div className="quality__indicator" aria-hidden="true">
                  {CONTROL_POINTS.map((point, index) => (
                    <span
                      key={point.id}
                      className={
                        index === activeIndex
                          ? 'quality__indicator-seg is-active'
                          : 'quality__indicator-seg'
                      }
                    />
                  ))}
                </div>

                <p className="quality__readout-status">
                  <span className="quality__readout-status-dot" aria-hidden="true" />
                  ОТК · СООТВЕТСТВУЕТ
                </p>
              </div>
            </div>
          </div>

          <p className="quality__hint">
            Выберите пункт — стрелка, курсор шкалы и индикатор обновятся. Стрелки ↑↓ переключают
            пункты, Enter и Space подтверждают выбор.
          </p>
        </div>

        <footer className="quality__footer">
          <span className="quality__footer-mark" aria-hidden="true" />
          <p className="quality__footer-label">Точность — не случайность</p>
          <p className="quality__footer-text">
            Контроль качества встроен в каждый этап системы — от первого чертежа до финальной
            сборки.
          </p>
          <span className="quality__footer-index">QUALITY CONTROL / SYSTEM 001</span>
        </footer>
      </div>
    </section>
  );
};

export default Quality;

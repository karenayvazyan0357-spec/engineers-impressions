import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { motionDurations, motionEases } from '../../motion/tokens';
import { useSectionMotion } from '../../motion/useSectionMotion';
import AssemblyDrawing, { type StageId } from './AssemblyDrawing';
import './Assembly.css';

/* ---------------------------------------------------------------------------
   Секция «Assembly — Сборочный цех».

   Инженерный процесс показан как оживший чертёж: центральный модуль
   впечатления и пять этапов, связанных в единую систему. Выбор этапа
   (клик, тап или клавиатура) перекрашивает схему и обновляет описание.
   --------------------------------------------------------------------------- */

interface Stage {
  id: StageId;
  index: string;
  title: string;
  description: string;
  schema: string;
  params: readonly { label: string; value: string }[];
}

const STAGES: readonly Stage[] = [
  {
    id: 'research',
    index: '01',
    title: 'Исследование',
    description:
      'Изучаем контекст, аудиторию и ограничения. Собираем данные, на которых будет держаться вся конструкция будущего впечатления.',
    schema: 'Контекст / данные / гипотезы',
    params: [
      { label: 'Инструменты', value: 'Интервью · аудит · наблюдение' },
      { label: 'Результат', value: 'Бриф и карта контекста' },
    ],
  },
  {
    id: 'design',
    index: '02',
    title: 'Проектирование',
    description:
      'Переводим выводы исследования в чертёж: сценарии, структуру и правила, по которым будет работать впечатление.',
    schema: 'Сценарий / структура / правила',
    params: [
      { label: 'Инструменты', value: 'Сценарии · чертежи · прототипы' },
      { label: 'Результат', value: 'Техническое задание' },
    ],
  },
  {
    id: 'construction',
    index: '03',
    title: 'Конструирование',
    description:
      'Собираем систему из пространства, контента и технологий. Проверяем узлы и связи на прочность и совместимость.',
    schema: 'Узлы / связи / расчёты',
    params: [
      { label: 'Инструменты', value: 'Узлы · связи · макеты' },
      { label: 'Результат', value: 'Рабочая модель системы' },
    ],
  },
  {
    id: 'production',
    index: '04',
    title: 'Производство',
    description:
      'Изготавливаем и калибруем каждую деталь: материалы, медиа и инженерные решения доводятся до рабочего состояния.',
    schema: 'Материалы / медиа / сборка',
    params: [
      { label: 'Инструменты', value: 'Материалы · медиа · сборка' },
      { label: 'Результат', value: 'Готовая система' },
    ],
  },
  {
    id: 'launch',
    index: '05',
    title: 'Запуск',
    description:
      'Открываем впечатление зрителям и следим за системой: измеряем отклик и настраиваем до нужной точности.',
    schema: 'Отклик / калибровка / точность',
    params: [
      { label: 'Инструменты', value: 'Замеры · обратная связь' },
      { label: 'Результат', value: 'Настроенное впечатление' },
    ],
  },
];

const Assembly = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const stageRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeStage = STAGES[activeIndex];

  /* ---------------------------------------------------------------------
     Появление секции при скролле: одна последовательность и один
     ScrollTrigger на всю секцию, без пина. Двигаются только transform и
     opacity, поэтому чертёж и раскладка не меняются, а выбор этапа
     (aria-pressed, data-active, CSS-анимация assembly-swap) остаётся
     нетронутым. Стартовые состояния задают твины, а не CSS: без GSAP и при
     системной настройке «меньше движения» содержимое видно сразу.
     --------------------------------------------------------------------- */
  const assemblyRef = useSectionMotion<HTMLElement>(({ gsap, scope }) => {
    const top = scope.querySelector<HTMLElement>('.assembly__top');
    const topRule = scope.querySelector<HTMLElement>('.assembly__top-rule');
    const titleLines = Array.from(scope.querySelectorAll<HTMLElement>('.assembly__title-line'));
    const lede = scope.querySelector<HTMLElement>('.assembly__lede');
    const sheet = scope.querySelector<HTMLElement>('.assembly__sheet');
    const sheetHead = scope.querySelector<HTMLElement>('.assembly__sheet-head');
    const legend = scope.querySelector<HTMLElement>('.assembly__legend');
    const stagesHead = scope.querySelector<HTMLElement>('.assembly__stages-head');
    const stageItems = Array.from(
      scope.querySelectorAll<HTMLElement>('.assembly__stage-list > li'),
    );
    const hint = scope.querySelector<HTMLElement>('.assembly__hint');
    const readout = scope.querySelector<HTMLElement>('.assembly__readout');
    const footer = scope.querySelector<HTMLElement>('.assembly__footer');

    /* Слои схемы идут в порядке разметки — сетка, рамка, метки, ядро, кольцо,
       размеры, узлы, подписи — и проявляются только через opacity: геометрия
       SVG не меняется. Берём слои того листа, который реально отрисован:
       на мобильном радиальный лист скрыт, виден вертикальный. */
    const visibleSheets = Array.from(
      scope.querySelectorAll<SVGSVGElement>('.assembly__sheet-body .assembly-svg'),
    ).filter((svg) => svg.getClientRects().length > 0);
    const drawingLayers = visibleSheets.flatMap((svg) =>
      Array.from(svg.children).filter(
        (layer): layer is SVGElement => layer.getClientRects().length > 0,
      ),
    );

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

    if (sheet) {
      timeline.from(sheet, { y: offset, opacity: 0, duration: reveal }, 0.18);
    }

    if (sheetHead) {
      timeline.from(sheetHead, { y: offset * 0.4, opacity: 0, duration: entrance }, 0.24);
    }

    /* На мобильном каскад слоёв заменяется одним появлением листа. */
    if (isCompact) {
      if (visibleSheets.length > 0) {
        timeline.from(
          visibleSheets,
          { opacity: 0, duration: reveal, ease: motionEases.standard },
          0.3,
        );
      }
    } else if (drawingLayers.length > 0) {
      timeline.from(
        drawingLayers,
        {
          opacity: 0,
          duration: motionDurations.base,
          stagger: motionDurations.instant * 0.75,
          ease: motionEases.standard,
        },
        0.3,
      );
    }

    if (legend) {
      timeline.from(legend, { opacity: 0, duration: entrance }, 0.56);
    }

    if (stagesHead) {
      timeline.from(stagesHead, { y: offset * 0.5, opacity: 0, duration: entrance }, 0.2);
    }

    if (stageItems.length > 0) {
      timeline.from(
        stageItems,
        {
          y: offset * 0.75,
          opacity: 0,
          duration: entrance,
          stagger: isCompact ? 0.04 : 0.06,
        },
        0.24,
      );
    }

    if (readout) {
      timeline.from(readout, { y: offset, opacity: 0, duration: reveal }, 0.26);
    }

    if (hint) {
      timeline.from(hint, { y: offset * 0.4, opacity: 0, duration: entrance }, 0.5);
    }

    if (footer) {
      timeline.from(footer, { y: offset * 0.6, opacity: 0, duration: entrance }, 0.46);
    }

    /* После проигрывания снимаем инлайновый transform: элементы возвращаются
       к натуральной раскладке, текст снова рисуется без слоя композиции, а
       геометрия секции совпадает со снимком до анимации. */
    const transformed = [
      top,
      topRule,
      ...titleLines,
      lede,
      sheet,
      sheetHead,
      stagesHead,
      ...stageItems,
      hint,
      readout,
      footer,
    ].filter((element): element is HTMLElement => element !== null);

    if (transformed.length > 0) {
      timeline.call(() => {
        gsap.set(transformed, { clearProps: 'transform' });
      });
    }
  });

  /* Список ведёт себя как группа переключателей: стрелки, Home и End
     перемещают выбор и фокус, Enter и Space подтверждают нативно. */
  const handleListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const lastIndex = STAGES.length - 1;
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
    stageRefs.current[nextIndex]?.focus();
  };

  return (
    <section className="assembly" id="assembly" aria-labelledby="assembly-title" ref={assemblyRef}>
      <div className="assembly__frame">
        <div className="assembly__top">
          <span className="assembly__top-mark" aria-hidden="true" />
          <p className="assembly__top-label">Сборочный цех / Производственный процесс</p>
          <span className="assembly__top-rule" aria-hidden="true" />
          <p className="assembly__top-index">СПБ / 01—05</p>
        </div>

        <div className="assembly__head">
          <h2 className="assembly__title" id="assembly-title">
            <span className="assembly__title-line">От идеи</span>
            <span className="assembly__title-line">
              до <span className="assembly__title-accent">впечатления.</span>
            </span>
          </h2>
          <p className="assembly__lede">
            Каждое большое впечатление начинается с точной системы.
          </p>
        </div>



        <div className="assembly__body">
          <figure className="assembly__sheet">
            <div className="assembly__sheet-head">
              <span className="assembly__sheet-label">Схема сборки · этап {activeStage.index}</span>
              <span className="assembly__sheet-note">{activeStage.schema}</span>
            </div>

            <div className="assembly__sheet-body">
              <AssemblyDrawing activeId={activeStage.id} />
            </div>

            <figcaption className="assembly__legend">
              <span className="assembly__legend-item">
                <span
                  className="assembly__legend-swatch assembly__legend-swatch--core"
                  aria-hidden="true"
                />
                Основной модуль
              </span>
              <span className="assembly__legend-item">
                <span
                  className="assembly__legend-swatch assembly__legend-swatch--tech"
                  aria-hidden="true"
                />
                Узлы и связи
              </span>
              <span className="assembly__legend-item">
                <span
                  className="assembly__legend-swatch assembly__legend-swatch--accent"
                  aria-hidden="true"
                />
                Активный этап
              </span>
            </figcaption>
          </figure>

          <div className="assembly__console">
            <div className="assembly__stages">
              <div className="assembly__stages-head">
                <span className="assembly__stages-label">Этапы</span>
                <span className="assembly__stages-range">01—05</span>
              </div>

              <ul className="assembly__stage-list" onKeyDown={handleListKeyDown}>
                {STAGES.map((stage, index) => (
                  <li key={stage.id}>
                    <button
                      ref={(node) => {
                        stageRefs.current[index] = node;
                      }}
                      type="button"
                      className="assembly__stage"
                      aria-pressed={index === activeIndex}
                      aria-controls="assembly-readout"
                      onClick={() => setActiveIndex(index)}
                    >
                      <span className="assembly__stage-index" aria-hidden="true">
                        {stage.index}
                      </span>
                      <span className="assembly__stage-title">{stage.title}</span>
                      <span className="assembly__stage-mark" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>

              <p className="assembly__hint">
                Выберите этап — схема и описание обновятся. Стрелки ↑↓ переключают этапы,
                Enter и Space подтверждают выбор.
              </p>
            </div>

            <div
              className="assembly__readout"
              id="assembly-readout"
              role="region"
              aria-labelledby="assembly-readout-title"
              aria-live="polite"
            >
              <div className="assembly__swap" key={activeStage.id}>
                <h3 className="assembly__readout-title" id="assembly-readout-title">
                  <span className="assembly__readout-index" aria-hidden="true">
                    {activeStage.index}
                  </span>
                  {activeStage.title}
                </h3>

                <p className="assembly__desc">{activeStage.description}</p>

                <dl className="assembly__params">
                  {activeStage.params.map((param) => (
                    <div className="assembly__param" key={param.label}>
                      <dt className="assembly__param-label">{param.label}</dt>
                      <dd className="assembly__param-value">{param.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>

        <footer className="assembly__footer">
          <span className="assembly__footer-mark" aria-hidden="true" />
          <p className="assembly__footer-label">Пять этапов — одна система</p>
          <p className="assembly__footer-text">
            Исследование, проектирование, конструирование, производство и запуск работают
            как единый конвейер: каждый этап передаёт следующему проверенную конструкцию.
          </p>
          <span className="assembly__footer-index">01 — 05 / 2026</span>
        </footer>
      </div>
    </section>
  );
};

export default Assembly;

import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { motionDurations, motionEases } from '../../motion/tokens';
import { useSectionMotion } from '../../motion/useSectionMotion';
import LayersDrawing, { type LayerId } from './LayersDrawing';
import './Layers.css';

/* ---------------------------------------------------------------------------
   Содержание секции. Данные — единственный источник правды и для списка,
   и для панели: выбранное направление меняет описание, состав и схему.
   --------------------------------------------------------------------------- */

interface Layer {
  id: LayerId;
  index: string;
  title: string;
  description: string;
  scope: readonly string[];
  schema: string;
}

const LAYERS: readonly Layer[] = [
  {
    id: 'events',
    index: '01',
    title: 'События',
    description: 'Создаём события, которые объединяют людей вокруг идеи.',
    scope: ['Форумы и конференции', 'Фестивали и городские программы', 'Корпоративные события'],
    schema: 'Площадка / узлы / связи',
  },
  {
    id: 'content',
    index: '02',
    title: 'Контент',
    description: 'Превращаем сложные темы в истории, которые хочется исследовать.',
    scope: ['Сценарии и редакционные концепции', 'Лекции и экскурсии', 'Истории и тематические программы'],
    schema: 'Структура / блоки / связи',
  },
  {
    id: 'learning',
    index: '03',
    title: 'Обучение',
    description: 'Проектируем образовательный опыт через практику и исследование.',
    scope: ['Образовательные программы', 'Мастер-классы и лаборатории', 'Профориентационные проекты'],
    schema: 'Этапы / переходы / цикл',
  },
  {
    id: 'media',
    index: '04',
    title: 'Медиа',
    description: 'Создаём цифровые форматы, расширяющие границы реального пространства.',
    scope: ['Видео и визуальные истории', 'Интерактивные материалы', 'Цифровые коммуникации'],
    schema: 'Кадры / сетка / сигнал',
  },
  {
    id: 'special',
    index: '05',
    title: 'Спецпроекты',
    description: 'Объединяем разные дисциплины для решения нестандартных задач.',
    scope: ['Выставки и экспозиции', 'Музейные коллаборации', 'Городские и культурные проекты'],
    schema: 'Системы / пересечения / поле',
  },
];

const Layers = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeLayer = LAYERS[activeIndex];

  /* ---------------------------------------------------------------------
     Появление секции при скролле: одна последовательность и один
     ScrollTrigger на всю секцию, без пина. Двигаются только transform и
     opacity, поэтому layout, sticky-список и высота страницы не меняются,
     а смена направления (aria-pressed, CSS-анимация layers-swap) остаётся
     нетронутой. Стартовые состояния задают твины, а не CSS: без GSAP и при
     системной настройке «меньше движения» содержимое видно сразу.
     --------------------------------------------------------------------- */
  const layersRef = useSectionMotion<HTMLElement>(({ gsap, scope }) => {
    const top = scope.querySelector<HTMLElement>('.layers__top');
    const topRule = scope.querySelector<HTMLElement>('.layers__top-rule');
    const title = scope.querySelector<HTMLElement>('.layers__title');
    const lede = scope.querySelector<HTMLElement>('.layers__lede');
    const navHead = scope.querySelector<HTMLElement>('.layers__nav-head');
    const options = Array.from(scope.querySelectorAll<HTMLElement>('.layers__nav-list > li'));
    const hint = scope.querySelector<HTMLElement>('.layers__hint');
    const scheme = scope.querySelector<HTMLElement>('.layers__scheme');
    const spec = scope.querySelector<HTMLElement>('.layers__spec');
    const footer = scope.querySelector<HTMLElement>('.layers__footer');

    /* Слои чертежа идут в порядке разметки: сетка, рамка, угловые метки,
       направляющие, связи, узлы — схема словно достраивается на глазах.
       Названия элементов уже описаны классами, отдельные data-атрибуты
       для них не нужны. */
    const drawingLayers = Array.from(
      scope.querySelectorAll<SVGElement>('.layers-drawing > :not(title)'),
    ).filter((layer) => layer.getClientRects().length > 0);

    // На узком экране короче дистанция и длительность, а каскад SVG-слоёв
    // заменяется одним появлением листа вместе с панелью.
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

    if (title) {
      timeline.from(title, { y: offset, opacity: 0, duration: reveal }, 0.04);
    }

    if (lede) {
      timeline.from(lede, { y: offset * 0.75, opacity: 0, duration: entrance }, 0.12);
    }

    if (navHead) {
      timeline.from(navHead, { y: offset * 0.5, opacity: 0, duration: entrance }, 0.18);
    }

    if (options.length > 0) {
      timeline.from(
        options,
        {
          y: offset,
          opacity: 0,
          duration: entrance,
          stagger: isCompact ? 0.03 : 0.05,
        },
        0.22,
      );
    }

    if (hint) {
      timeline.from(hint, { y: offset * 0.4, opacity: 0, duration: entrance }, 0.46);
    }

    if (scheme) {
      timeline.from(scheme, { y: offset, opacity: 0, duration: reveal }, 0.2);
    }

    if (!isCompact && drawingLayers.length > 0) {
      timeline.from(
        drawingLayers,
        {
          opacity: 0,
          duration: motionDurations.base,
          stagger: motionDurations.instant * 0.5,
          ease: motionEases.standard,
        },
        0.3,
      );
    }

    if (spec) {
      timeline.from(spec, { y: offset, opacity: 0, duration: reveal }, 0.3);
    }

    if (footer) {
      timeline.from(footer, { y: offset * 0.6, opacity: 0, duration: entrance }, 0.44);
    }

    /* После проигрывания снимаем инлайновый transform: секция возвращается
       к натуральной раскладке, а текст перестаёт рисоваться на слое
       композиции. Слои чертежа анимируются только через opacity. */
    const transformed = [
      top,
      topRule,
      title,
      lede,
      navHead,
      ...options,
      hint,
      scheme,
      spec,
      footer,
    ].filter((element): element is HTMLElement => element !== null);

    if (transformed.length > 0) {
      timeline.call(() => {
        gsap.set(transformed, { clearProps: 'transform' });
      });
    }
  });

  /* Список ведёт себя как группа переключателей: стрелки, Home и End
     перемещают выбор и фокус, Enter и Space работают нативно. */
  const handleListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const lastIndex = LAYERS.length - 1;
    let nextIndex: number;

    switch (event.key) {
      case 'ArrowDown':
        nextIndex = activeIndex === lastIndex ? 0 : activeIndex + 1;
        break;
      case 'ArrowUp':
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
    optionRefs.current[nextIndex]?.focus();
  };

  return (
    <section className="layers" id="about" aria-labelledby="layers-title" ref={layersRef}>
      <div className="layers__frame">
        <div className="layers__top">
          <span className="layers__top-mark" aria-hidden="true" />
          <p className="layers__top-label">Система / 05 направлений</p>
          <span className="layers__top-rule" aria-hidden="true" />
        </div>

        <div className="layers__head">
          <h2 className="layers__title" id="layers-title">
            Впечатление — это <span className="layers__title-accent">система</span>
          </h2>
          <p className="layers__lede">
            Каждый проект собирается из взаимосвязанных элементов. Мы объединяем содержание,
            пространство, людей и технологии в единый опыт.
          </p>
        </div>

        <div className="layers__body">
          <div className="layers__nav">
            <div className="layers__nav-head">
              <span className="layers__nav-label">Направления</span>
              <span className="layers__nav-range">01—05</span>
            </div>

            <ul className="layers__nav-list" onKeyDown={handleListKeyDown}>
              {LAYERS.map((layer, index) => (
                <li key={layer.id}>
                  <button
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    type="button"
                    className="layers__option"
                    aria-pressed={index === activeIndex}
                    aria-controls="layers-panel"
                    onClick={() => setActiveIndex(index)}
                  >
                    <span className="layers__option-index" aria-hidden="true">
                      {layer.index}
                    </span>
                    <span className="layers__option-title">{layer.title}</span>
                    <span className="layers__option-mark" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            <p className="layers__hint">Выберите направление — описание и схема обновятся.</p>
          </div>

          <div
            className="layers__panel"
            id="layers-panel"
            role="region"
            aria-labelledby="layers-direction-title"
          >
            <figure className="layers__scheme">
              <div className="layers__scheme-head">
                <span className="layers__scheme-label">Схема направления {activeLayer.index}</span>
                <span className="layers__scheme-note">{activeLayer.schema}</span>
              </div>

              <div className="layers__scheme-body layers__swap" key={activeLayer.id}>
                <LayersDrawing id={activeLayer.id} />
              </div>

              <figcaption className="layers__legend">
                <span className="layers__legend-item">
                  <span
                    className="layers__legend-swatch layers__legend-swatch--accent"
                    aria-hidden="true"
                  />
                  Основной элемент
                </span>
                <span className="layers__legend-item">
                  <span
                    className="layers__legend-swatch layers__legend-swatch--tech"
                    aria-hidden="true"
                  />
                  Связи и оси
                </span>
              </figcaption>
            </figure>

            <div className="layers__spec" aria-live="polite">
              <div className="layers__swap" key={activeLayer.id}>
                <h3 className="layers__spec-title" id="layers-direction-title">
                  <span className="layers__spec-index" aria-hidden="true">
                    {activeLayer.index}
                  </span>
                  {activeLayer.title}
                </h3>

                <div className="layers__spec-body">
                  <p className="layers__desc">{activeLayer.description}</p>

                  <div className="layers__scope">
                    <p className="layers__scope-label">Состав</p>
                    <ul className="layers__scope-list">
                      {activeLayer.scope.map((item) => (
                        <li className="layers__scope-item" key={item}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="layers__footer">
          <p className="layers__footer-label">Комплексный подход</p>
          <p className="layers__footer-text">
            Содержание, пространство, люди и технологии работают как единое целое — направления
            усиливают друг друга.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Layers;

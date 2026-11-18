import React from 'react';
import { motionDurations, motionEases } from '../../motion/tokens';
import { useSectionMotion } from '../../motion/useSectionMotion';
import './Hero.css';

/* ---------------------------------------------------------------------------
   Геометрия чертежа. Система координат viewBox 640 × 780:
   70…570 — ширина фасада, 640 — линия земли, 210 — верх карниза,
   470 — стилобат колоннады, 320 — ось симметрии.
   --------------------------------------------------------------------------- */

const range = (start: number, end: number, step: number): number[] => {
  const values: number[] = [];
  for (let value = start; value <= end; value += step) {
    values.push(value);
  }
  return values;
};

const GRID_X = range(32, 608, 48);
const GRID_Y = range(96, 720, 48);
const DENTILS_X = range(176, 464, 12);
const COLUMN_AXES = [188, 226, 264, 376, 414, 452];
const PORTICO_WINDOWS = [207, 245, 395, 433];
const WING_WINDOWS = [90, 120, 150, 490, 520, 550];
const PILASTERS_X = [105, 135, 505, 535];
const RUSTICATION_Y = range(470, 630, 16);

/** Окно с полуциркульным завершением: springY — линия пят арки, bottomY — подоконник. */
const archedWindow = (
  centerX: number,
  halfWidth: number,
  springY: number,
  bottomY: number,
): string =>
  `M ${centerX - halfWidth} ${bottomY} V ${springY} ` +
  `A ${halfWidth} ${halfWidth} 0 0 1 ${centerX + halfWidth} ${springY} V ${bottomY} Z`;

const Hero: React.FC = () => {
  /* Короткая последовательность первого экрана. Заголовок получает только
     Y-смещение: это LCP-элемент, поэтому opacity для него не задаётся.
     SVG-слои проявляются исключительно через opacity, чтобы не перебивать
     CSS transform: scale(1.16) у чертежа на мобильных и планшетах. */
  const heroRef = useSectionMotion<HTMLElement>(({ gsap, scope }) => {
    const eyebrow = scope.querySelector<HTMLElement>('[data-motion="hero-eyebrow"]');
    const title = scope.querySelector<HTMLElement>('[data-motion="hero-title"]');
    const lede = scope.querySelector<HTMLElement>('[data-motion="hero-lede"]');
    const actions = scope.querySelector<HTMLElement>('[data-motion="hero-actions"]');
    const drawingLayers = Array.from(
      scope.querySelectorAll<SVGElement>(
        '[data-motion="drawing-grid"], [data-motion="drawing-lines"], [data-motion="drawing-annotations"]',
      ),
    ).filter((layer) => layer.getClientRects().length > 0);
    const isCompact = window.matchMedia('(max-width: 767px)').matches;

    // На мобильных короче дистанция и длительность, без каскада слоёв.
    const offset = isCompact ? 8 : 14;
    const entranceDuration = isCompact ? motionDurations.fast : motionDurations.base;

    const timeline = gsap.timeline({
      defaults: {
        ease: motionEases.out,
      },
    });

    if (eyebrow) {
      timeline.from(
        eyebrow,
        {
          y: offset * 0.5,
          opacity: 0,
          duration: entranceDuration,
        },
        0,
      );
    }

    if (title) {
      timeline.from(
        title,
        {
          y: offset,
          duration: isCompact ? motionDurations.base : motionDurations.slow,
        },
        isCompact ? 0.03 : 0.05,
      );
    }

    if (lede) {
      timeline.from(
        lede,
        {
          y: offset * 0.75,
          opacity: 0,
          duration: entranceDuration,
        },
        isCompact ? 0.08 : 0.12,
      );
    }

    if (actions) {
      timeline.from(
        actions,
        {
          y: offset * 0.6,
          opacity: 0,
          duration: entranceDuration,
        },
        isCompact ? 0.12 : 0.18,
      );
    }

    if (drawingLayers.length > 0) {
      timeline.from(
        drawingLayers,
        {
          opacity: 0,
          duration: isCompact ? motionDurations.base : motionDurations.slow,
          stagger: isCompact ? 0 : motionDurations.instant * 0.75,
          ease: motionEases.standard,
        },
        isCompact ? 0.1 : 0.16,
      );
    }

    /* Снимаем инлайновый transform после появления: заголовок (LCP-элемент)
       и остальные блоки возвращаются к натуральной раскладке. SVG-слои
       двигаются только через opacity, transform у них не появляется. */
    const transformed = [eyebrow, title, lede, actions].filter(
      (element): element is HTMLElement => element !== null,
    );

    if (transformed.length > 0) {
      timeline.call(() => {
        gsap.set(transformed, { clearProps: 'transform' });
      });
    }
  });

  return (
    <section className="hero" aria-labelledby="hero-title" ref={heroRef}>
      <div className="hero__frame">
        <div className="hero__grid">
          <div className="hero__intro">
            <p className="hero__eyebrow" data-motion="hero-eyebrow">
              <span className="hero__eyebrow-mark" aria-hidden="true" />
              <span className="hero__eyebrow-text">СПБ / ОБЪЕКТ № 001 / АРХИТЕКТУРА</span>
            </p>

            <h1 className="hero__title" id="hero-title" data-motion="hero-title">
              <span className="hero__title-line">Проектируем опыт.</span>
              <span className="hero__title-line">Собираем</span>
              <span className="hero__title-line hero__title-line--offset">
                <span className="hero__title-accent">впечатления.</span>
              </span>
            </h1>

            <p className="hero__lede" data-motion="hero-lede">
              Создаём пространства, события и цифровые впечатления на стыке инженерии,
              дизайна и культуры.
            </p>

            <div className="hero__actions" data-motion="hero-actions">
              <a className="hero__cta" href="#contact">
                Обсудить проект
              </a>
              <a className="hero__link" href="#projects">
                Исследовать проекты
              </a>
            </div>
          </div>

          <figure className="hero__drawing">
            <figcaption className="hero__caption">
              <span className="hero__caption-title">Центральный ризалит</span>
              <span className="hero__caption-meta">Эрмитаж / 1762</span>
            </figcaption>

            <svg
              className="hero-svg"
              viewBox="0 0 640 780"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              {/* Чертёжная сетка */}
              <g className="hero-svg__grid" data-motion="drawing-grid">
                {GRID_X.map((x) => (
                  <line key={`grid-x-${x}`} x1={x} y1="60" x2={x} y2="752" />
                ))}
                {GRID_Y.map((y) => (
                  <line key={`grid-y-${y}`} x1="24" y1={y} x2="616" y2={y} />
                ))}
              </g>

              {/* Силуэт фасада: непрозрачная заливка скрывает сетку внутри здания */}
              <path
                className="hero-svg__paper"
                d="M70 640 V210 H225 L320 120 L415 210 H570 V640 Z"
              />

              {/* Карниз, антаблемент, членения фасада */}
              <g className="hero-svg__lines" data-motion="drawing-lines">
                <line className="hero-svg__strong" x1="64" y1="204" x2="576" y2="204" />
                <line className="hero-svg__strong" x1="70" y1="210" x2="570" y2="210" />
                <line x1="70" y1="216" x2="570" y2="216" />
                <line x1="70" y1="232" x2="570" y2="232" />
                <line className="hero-svg__strong" x1="70" y1="252" x2="570" y2="252" />
                <line className="hero-svg__strong" x1="70" y1="470" x2="570" y2="470" />
                <line className="hero-svg__strong" x1="70" y1="640" x2="570" y2="640" />

                <line className="hero-svg__strong" x1="70" y1="204" x2="70" y2="640" />
                <line className="hero-svg__strong" x1="570" y1="204" x2="570" y2="640" />
                <line x1="76" y1="252" x2="76" y2="640" />
                <line x1="564" y1="252" x2="564" y2="640" />
                <line className="hero-svg__strong" x1="170" y1="210" x2="170" y2="640" />
                <line className="hero-svg__strong" x1="470" y1="210" x2="470" y2="640" />
                <line x1="176" y1="210" x2="176" y2="470" />
                <line x1="464" y1="210" x2="464" y2="470" />

                {DENTILS_X.map((x) => (
                  <line key={`dentil-${x}`} x1={x} y1="210" x2={x} y2="216" />
                ))}

                {PILASTERS_X.map((x) => (
                  <line key={`pilaster-${x}`} x1={x} y1="252" x2={x} y2="470" />
                ))}
              </g>

              {/* Фронтон с розеткой */}
              <g className="hero-svg__lines" data-motion="drawing-lines">
                <line className="hero-svg__strong" x1="225" y1="210" x2="320" y2="120" />
                <line className="hero-svg__strong" x1="415" y1="210" x2="320" y2="120" />
                <line x1="237" y1="210" x2="320" y2="132" />
                <line x1="403" y1="210" x2="320" y2="132" />
                <circle cx="320" cy="176" r="14" />
                <circle cx="320" cy="176" r="9" />
              </g>

              {/* Колоннада: плинт, база, ствол с каннелюрами, капитель */}
              <g className="hero-svg__lines" data-motion="drawing-lines">
                {COLUMN_AXES.map((x) => (
                  <g key={`column-${x}`}>
                    <rect x={x - 11} y="252" width="22" height="4" />
                    <rect x={x - 9} y="256" width="18" height="4" />
                    <rect x={x - 7.5} y="260" width="15" height="196" />
                    <line className="hero-svg__detail" x1={x - 3} y1="262" x2={x - 3} y2="454" />
                    <line className="hero-svg__detail" x1={x + 3} y1="262" x2={x + 3} y2="454" />
                    <rect x={x - 10} y="456" width="20" height="7" />
                    <rect x={x - 12} y="463" width="24" height="7" />
                  </g>
                ))}
              </g>

              {/* Верхний ярус окон */}
              <g className="hero-svg__windows">
                {PORTICO_WINDOWS.map((x) => (
                  <rect key={`p3-${x}`} x={x - 8} y="272" width="16" height="40" />
                ))}
                {WING_WINDOWS.map((x) => (
                  <rect key={`w3-${x}`} x={x - 11} y="272" width="22" height="40" />
                ))}
                <rect x="302" y="272" width="36" height="40" />
              </g>

              {/* Представительский ярус: высокие арочные окна */}
              <g className="hero-svg__windows">
                {PORTICO_WINDOWS.map((x) => (
                  <g key={`p2-${x}`}>
                    <path d={archedWindow(x, 9, 366, 446)} />
                    <line className="hero-svg__detail" x1={x} y1="366" x2={x} y2="446" />
                    <line className="hero-svg__detail" x1={x - 9} y1="404" x2={x + 9} y2="404" />
                  </g>
                ))}
                {WING_WINDOWS.map((x) => (
                  <g key={`w2-${x}`}>
                    <path d={archedWindow(x, 11, 366, 446)} />
                    <line className="hero-svg__detail" x1={x} y1="366" x2={x} y2="446" />
                    <line className="hero-svg__detail" x1={x - 11} y1="404" x2={x + 11} y2="404" />
                  </g>
                ))}
                <path d={archedWindow(320, 24, 372, 446)} />
                <line className="hero-svg__detail" x1="320" y1="378" x2="320" y2="446" />
                <line className="hero-svg__detail" x1="296" y1="410" x2="344" y2="410" />
              </g>

              {/* Рустовка первого этажа */}
              <g className="hero-svg__lines" data-motion="drawing-lines">
                {RUSTICATION_Y.map((y) => (
                  <line key={`rustication-${y}`} x1="70" y1={y} x2="570" y2={y} />
                ))}
              </g>

              {/* Окна первого этажа */}
              <g className="hero-svg__windows">
                {[...PORTICO_WINDOWS, ...WING_WINDOWS].map((x) => (
                  <g key={`g1-${x}`}>
                    <path d={archedWindow(x, 12, 540, 592)} />
                    <line className="hero-svg__detail" x1={x} y1="540" x2={x} y2="592" />
                    <line className="hero-svg__detail" x1={x - 12} y1="566" x2={x + 12} y2="566" />
                  </g>
                ))}
              </g>

              {/* Центральная арка с воротами */}
              <g className="hero-svg__lines" data-motion="drawing-lines">
                <path className="hero-svg__paper" d="M280 640 V600 A40 40 0 0 1 360 600 V640 Z" />
                <path className="hero-svg__strong" d="M280 640 V600 A40 40 0 0 1 360 600 V640" />
                <path d="M286 640 V600 A34 34 0 0 1 354 600 V640" />
                <line className="hero-svg__detail" x1="320" y1="600" x2="320" y2="640" />
                <line className="hero-svg__detail" x1="286" y1="620" x2="354" y2="620" />
              </g>

              {/* Оси, выносные линии и размеры */}
              <g className="hero-svg__annotations" data-motion="drawing-annotations">
                <line className="hero-svg__axis" x1="320" y1="86" x2="320" y2="676" />
                {[120, 210, 470, 640].map((y) => (
                  <circle key={`node-${y}`} className="hero-svg__node" cx="320" cy={y} r="3" />
                ))}

                <line className="hero-svg__dim" x1="34" y1="210" x2="70" y2="210" />
                <line className="hero-svg__dim" x1="34" y1="640" x2="70" y2="640" />
                <line className="hero-svg__dim" x1="40" y1="210" x2="40" y2="392" />
                <line className="hero-svg__dim" x1="40" y1="458" x2="40" y2="640" />
                <line className="hero-svg__dim-tick" x1="37" y1="210" x2="43" y2="216" />
                <line className="hero-svg__dim-tick" x1="37" y1="634" x2="43" y2="640" />

                <line className="hero-svg__dim" x1="170" y1="646" x2="170" y2="706" />
                <line className="hero-svg__dim" x1="470" y1="646" x2="470" y2="706" />
                <line className="hero-svg__dim" x1="70" y1="646" x2="70" y2="738" />
                <line className="hero-svg__dim" x1="570" y1="646" x2="570" y2="738" />

                <line className="hero-svg__dim" x1="170" y1="700" x2="278" y2="700" />
                <line className="hero-svg__dim" x1="362" y1="700" x2="470" y2="700" />
                <line className="hero-svg__dim-tick" x1="167" y1="703" x2="173" y2="697" />
                <line className="hero-svg__dim-tick" x1="467" y1="703" x2="473" y2="697" />

                <line className="hero-svg__dim" x1="70" y1="732" x2="278" y2="732" />
                <line className="hero-svg__dim" x1="362" y1="732" x2="570" y2="732" />
                <line className="hero-svg__dim-tick" x1="67" y1="735" x2="73" y2="729" />
                <line className="hero-svg__dim-tick" x1="567" y1="735" x2="573" y2="729" />

                <text className="hero-svg__label" x="32" y="84">
                  ФАСАД 01
                </text>
                <text className="hero-svg__label" x="30" y="425" textAnchor="middle" transform="rotate(-90 30 425)">
                  H 24 000
                </text>
                <text className="hero-svg__label" x="320" y="692" textAnchor="middle">
                  16 800
                </text>
                <text className="hero-svg__label" x="320" y="724" textAnchor="middle">
                  28 000
                </text>
                <text className="hero-svg__label hero-svg__label--accent" x="336" y="670">
                  ОСЬ 1
                </text>
              </g>
            </svg>
          </figure>
        </div>

        <ul className="hero__meta">
          <li className="hero__meta-item">59°56' N</li>
          <li className="hero__meta-item">30°18' E</li>
          <li className="hero__meta-item hero__meta-item--accent">Масштаб 1:500</li>
          <li className="hero__meta-item">Санкт-Петербург</li>
        </ul>
      </div>
    </section>
  );
};

export default Hero;


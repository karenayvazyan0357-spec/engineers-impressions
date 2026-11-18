/* ---------------------------------------------------------------------------
   QualityDrawing — инженерная графика секции «Контроль качества».

   Два индикатора, построенные вручную в локальных координатах viewBox:
   — QualityDial: циферблат-транспортир на 360° со стрелкой, которая
     указывает на проверяемый сектор (угол приходит извне через props);
   — QualityGauge: сегментная шкала покрытия «100%» — пять заполненных
     сегментов, по одному на каждый этап системы.

   Штрихи не масштабируются вместе с листом (vector-effect), поэтому толщина
   линий остаётся «инженерной» при любой ширине панели.
   --------------------------------------------------------------------------- */

const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)];
};

/* --- Циферблат: геометрия -------------------------------------------------
   Центр (160, 160), радиус рамки 120. Угол отсчитывается от «12 часов»
   по часовой стрелке: 0° — вверх, 90° — вправо, 180° — вниз, 270° — влево. */

const DIAL_CENTER = 160;

const DIAL_TICKS = Array.from({ length: 36 }, (_, index) => index * 10);

/* Контрольные точки: пять секторов, равномерно распределённых по кругу */
const DIAL_DOTS = [0, 72, 144, 216, 288];

const DIAL_LABELS = [
  { deg: 0, text: '0°', anchor: 'middle' },
  { deg: 90, text: '90°', anchor: 'start' },
  { deg: 180, text: '180°', anchor: 'middle' },
  { deg: 270, text: '270°', anchor: 'end' },
] as const;

export interface QualityDialProps {
  degrees: number;
  activeIndex: number;
}

export const QualityDial = ({ degrees, activeIndex }: QualityDialProps) => (
  <svg
    className="quality-dial"
    viewBox="0 0 320 320"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    focusable="false"
  >
    <title>Циферблат контроля качества на 360°: стрелка указывает на проверяемый сектор</title>

    <circle className="quality-dial__frame" cx={DIAL_CENTER} cy={DIAL_CENTER} r="120" />
    <circle className="quality-dial__inner" cx={DIAL_CENTER} cy={DIAL_CENTER} r="104" />

    <g className="quality-dial__cross">
      <line x1={DIAL_CENTER - 120} y1={DIAL_CENTER} x2={DIAL_CENTER + 120} y2={DIAL_CENTER} />
      <line x1={DIAL_CENTER} y1={DIAL_CENTER - 120} x2={DIAL_CENTER} y2={DIAL_CENTER + 120} />
    </g>

    <g className="quality-dial__ticks">
      {DIAL_TICKS.map((deg) => {
        const major = deg % 90 === 0;
        const [x1, y1] = polar(DIAL_CENTER, DIAL_CENTER, 120, deg);
        const [x2, y2] = polar(DIAL_CENTER, DIAL_CENTER, major ? 106 : 112, deg);
        return (
          <line
            key={deg}
            className={major ? 'quality-dial__tick quality-dial__tick--major' : 'quality-dial__tick'}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
          />
        );
      })}
    </g>

    <g className="quality-dial__labels">
      {DIAL_LABELS.map((label) => {
        const [x, y] = polar(DIAL_CENTER, DIAL_CENTER, 88, label.deg);
        return (
          <text
            key={label.deg}
            x={x}
            y={y}
            textAnchor={label.anchor}
            dominantBaseline="central"
          >
            {label.text}
          </text>
        );
      })}
    </g>

    <g className="quality-dial__dots">
      {DIAL_DOTS.map((deg, index) => {
        const [x, y] = polar(DIAL_CENTER, DIAL_CENTER, 120, deg);
        return (
          <circle
            key={deg}
            className={
              index === activeIndex
                ? 'quality-dial__dot quality-dial__dot--active'
                : 'quality-dial__dot'
            }
            cx={x}
            cy={y}
            r={index === activeIndex ? 6 : 3}
          />
        );
      })}
    </g>

    <g className="quality-dial__needle" style={{ transform: `rotate(${degrees}deg)` }}>
      <line className="quality-dial__needle-line" x1={DIAL_CENTER} y1={DIAL_CENTER} x2={DIAL_CENTER} y2="84" />
      <polygon className="quality-dial__needle-tip" points="160,80 155,92 165,92" />
    </g>
    <circle className="quality-dial__hub" cx={DIAL_CENTER} cy={DIAL_CENTER} r="6" />
  </svg>
);

/* --- Сегментная шкала: геометрия ------------------------------------------
   Пять сегментов по 64px с шагом 72px на базовой линии y = 96. Подписи 0…100
   расставлены под границами сегментов: 0, 20, 40, 60, 80, 100. */

const GAUGE_SEGMENTS = Array.from({ length: 5 }, (_, index) => index);

const GAUGE_LABELS = [
  { x: 24, text: '0', anchor: 'start' },
  { x: 88, text: '20', anchor: 'middle' },
  { x: 160, text: '40', anchor: 'middle' },
  { x: 232, text: '60', anchor: 'middle' },
  { x: 304, text: '80', anchor: 'middle' },
  { x: 376, text: '100', anchor: 'end' },
] as const;

const gaugeSegmentX = (index: number): number => 24 + index * 72;

export const QualityGauge = () => (
  <svg
    className="quality-gauge"
    viewBox="0 0 400 132"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    focusable="false"
  >
    <title>Сегментная шкала покрытия: пять этапов — сто процентов контроля</title>

    <line className="quality-gauge__base" x1="24" y1="96" x2="376" y2="96" />
    <line className="quality-gauge__end" x1="376" y1="96" x2="376" y2="86" />

    {GAUGE_SEGMENTS.map((index) => (
      <rect
        key={index}
        className="quality-gauge__segment"
        x={gaugeSegmentX(index)}
        y="64"
        width="64"
        height="32"
      />
    ))}

    {GAUGE_LABELS.map((label) => (
      <text
        key={label.x}
        className="quality-gauge__label"
        x={label.x}
        y="114"
        textAnchor={label.anchor}
      >
        {label.text}
      </text>
    ))}
  </svg>
);

import type { ReactNode } from 'react';

/* ---------------------------------------------------------------------------
   Схема сборки впечатления.

   Два листа одного альбома, построенные вручную:
   — радиальная (desktop): центральный «модуль впечатления» и пять этапов,
     расставленных по пентагону и связанных с ядром линиями-связями;
   — вертикальная (mobile): те же пять этапов, вытянутые вдоль одной оси.

   Обе схемы не интерактивны сами по себе (выбор — через консоль этапов),
   но отражают активный этап через атрибут data-active, который окрашивает
   узел, связь и подпись терракотой.
   --------------------------------------------------------------------------- */

export type StageId = 'research' | 'design' | 'construction' | 'production' | 'launch';

interface AssemblyDrawingProps {
  activeId: StageId;
}

type TextAnchor = 'start' | 'middle' | 'end';

const range = (start: number, end: number, step: number): number[] => {
  const values: number[] = [];
  for (let value = start; value <= end; value += step) {
    values.push(value);
  }
  return values;
};

/* --- Радиальный лист: геометрия ------------------------------------------
   viewBox 1200 × 560, рамка 56…1144 / 56…504, центр (600, 280).
   Узлы расставлены по пентагону радиусом 190; порты лежат на ядре (r = 48). */

interface RadialStage {
  id: StageId;
  index: string;
  node: readonly [number, number];
  port: readonly [number, number];
  tag: { x: number; y: number; anchor: TextAnchor };
}

const RADIAL_STAGES: readonly RadialStage[] = [
  { id: 'research', index: '01', node: [600, 90], port: [600, 232], tag: { x: 600, y: 62, anchor: 'middle' } },
  { id: 'design', index: '02', node: [781, 221], port: [646, 265], tag: { x: 815, y: 205, anchor: 'start' } },
  { id: 'construction', index: '03', node: [712, 434], port: [628, 319], tag: { x: 742, y: 456, anchor: 'start' } },
  { id: 'production', index: '04', node: [488, 434], port: [572, 319], tag: { x: 458, y: 456, anchor: 'end' } },
  { id: 'launch', index: '05', node: [419, 221], port: [554, 265], tag: { x: 385, y: 205, anchor: 'end' } },
];

/* Замкнутый пентагон, связывающий узлы в цикл производства */
const RADIAL_RING = 'M 600 90 L 781 221 L 712 434 L 488 434 L 419 221 Z';

/* --- Вертикальный лист: геометрия ----------------------------------------- */

interface VerticalStage {
  id: StageId;
  index: string;
  title: string;
  y: number;
}

const VERTICAL_STAGES: readonly VerticalStage[] = [
  { id: 'research', index: '01', title: 'Исследование', y: 96 },
  { id: 'design', index: '02', title: 'Проектирование', y: 200 },
  { id: 'construction', index: '03', title: 'Конструирование', y: 304 },
  { id: 'production', index: '04', title: 'Производство', y: 408 },
  { id: 'launch', index: '05', title: 'Запуск', y: 512 },
];

/* --- Маленькие символы этапов (в локальных координатах -20…20) ------------ */

const StageGlyph = ({ id }: { id: StageId }): ReactNode => {
  switch (id) {
    case 'research':
      /* Лупа: изучение и наблюдение */
      return (
        <>
          <circle cx="-5" cy="-4" r="8" />
          <line x1="1" y1="0" x2="13" y2="12" />
        </>
      );
    case 'design':
      /* Чертежный треугольник: проект и правила */
      return (
        <>
          <path d="M -13 13 L -13 -13 L 13 13 Z" />
          <line x1="-13" y1="13" x2="13" y2="13" />
        </>
      );
    case 'construction':
      /* Ферма с раскосами: конструкция и связи */
      return (
        <>
          <rect x="-13" y="-13" width="26" height="26" />
          <line x1="-13" y1="13" x2="13" y2="-13" />
          <line x1="-13" y1="-13" x2="13" y2="13" />
        </>
      );
    case 'production':
      /* Пара болтов: изготовление и сборка */
      return (
        <>
          <circle cx="-8" cy="0" r="7" />
          <circle cx="8" cy="0" r="7" />
          <line x1="-13" y1="0" x2="-3" y2="0" />
          <line x1="3" y1="0" x2="13" y2="0" />
        </>
      );
    case 'launch':
      /* Стрелка вверх: запуск и сигнал */
      return (
        <>
          <line x1="0" y1="14" x2="0" y2="-13" />
          <path d="M -10 -4 L 0 -13 L 10 -4" />
          <line x1="-13" y1="14" x2="13" y2="14" />
        </>
      );
  }
};

const RADIAL_GRID_X = range(56, 1144, 56);
const RADIAL_GRID_Y = range(56, 504, 56);

const RadialSchematic = ({ activeId }: AssemblyDrawingProps) => (
  <svg
    className="assembly-svg assembly-svg--radial"
    viewBox="0 0 1200 560"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    focusable="false"
  >
    <title>Схема сборки впечатления: центральный модуль и пять этапов от исследования до запуска</title>

    <defs>
      <pattern
        id="assembly-hatch"
        width="10"
        height="10"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line className="assembly-svg__hatch-line" x1="0" y1="0" x2="0" y2="10" />
      </pattern>
    </defs>

    <g className="assembly-svg__grid">
      {RADIAL_GRID_X.map((x) => (
        <line key={`gx-${x}`} x1={x} y1="56" x2={x} y2="504" />
      ))}
      {RADIAL_GRID_Y.map((y) => (
        <line key={`gy-${y}`} x1="56" y1={y} x2="1144" y2={y} />
      ))}
    </g>

    <rect className="assembly-svg__frame" x="56" y="56" width="1088" height="448" />

    <g className="assembly-svg__marks">
      <path d="M 56 92 V 56 H 92" />
      <path d="M 1108 56 H 1144 V 92" />
      <path d="M 1144 468 V 504 H 1108" />
      <path d="M 92 504 H 56 V 468" />
    </g>

    <g className="assembly-svg__core">
      <rect className="assembly-svg__core-outer" x="515" y="195" width="170" height="170" />
      <path className="assembly-svg__core-diamond" d="M 600 195 L 685 280 L 600 365 L 515 280 Z" />
      <path className="assembly-svg__core-hatch" d="M 600 195 L 685 280 L 600 365 L 515 280 Z" fill="url(#assembly-hatch)" />
      <circle className="assembly-svg__core-lens" cx="600" cy="280" r="48" />
      <line className="assembly-svg__core-axis" x1="600" y1="195" x2="600" y2="365" />
      <line className="assembly-svg__core-axis" x1="515" y1="280" x2="685" y2="280" />
    </g>

    <path className="assembly-svg__ring" d={RADIAL_RING} />

    <g className="assembly-svg__dims">
      <line className="assembly-svg__dim" x1="515" y1="365" x2="515" y2="424" />
      <line className="assembly-svg__dim" x1="685" y1="365" x2="685" y2="424" />
      <line className="assembly-svg__dim" x1="515" y1="424" x2="685" y2="424" />
      <line className="assembly-svg__dim-tick" x1="515" y1="421" x2="521" y2="427" />
      <line className="assembly-svg__dim-tick" x1="679" y1="421" x2="685" y2="427" />
      <text className="assembly-svg__dim-label" x="600" y="442" textAnchor="middle">
        170
      </text>

      <line className="assembly-svg__dim" x1="470" y1="195" x2="470" y2="365" />
      <line className="assembly-svg__dim" x1="467" y1="195" x2="473" y2="195" />
      <line className="assembly-svg__dim" x1="467" y1="365" x2="473" y2="365" />
      <text className="assembly-svg__dim-label" x="462" y="280" textAnchor="middle" transform="rotate(-90 462 280)">
        170
      </text>
    </g>

    {RADIAL_STAGES.map((stage) => (
      <g key={stage.id} className="assembly-svg__stage" data-active={stage.id === activeId}>
        <line
          className="assembly-svg__leader"
          x1={stage.port[0]}
          y1={stage.port[1]}
          x2={stage.node[0]}
          y2={stage.node[1]}
        />
        <rect className="assembly-svg__port" x={stage.port[0] - 4} y={stage.port[1] - 4} width="8" height="8" />
        <circle className="assembly-svg__pulse" cx={stage.node[0]} cy={stage.node[1]} r="31" />
        <circle className="assembly-svg__node" cx={stage.node[0]} cy={stage.node[1]} r="22" />
        <g className="assembly-svg__glyph" transform={`translate(${stage.node[0]} ${stage.node[1]})`}>
          <StageGlyph id={stage.id} />
        </g>
        <text className="assembly-svg__tag" x={stage.tag.x} y={stage.tag.y} textAnchor={stage.tag.anchor}>
          {stage.index}
        </text>
      </g>
    ))}

    <g className="assembly-svg__notes">
      <text className="assembly-svg__note" x="56" y="36" textAnchor="start">
        СБОРОЧНЫЙ ЦЕХ / МОДУЛЬ M-01
      </text>
      <text className="assembly-svg__note" x="612" y="190" textAnchor="start">
        ОСЬ A
      </text>
      <text className="assembly-svg__note" x="1144" y="544" textAnchor="end">
        МАСШТАБ 1:20 · ЛИСТ 04
      </text>
    </g>
  </svg>
);

const VerticalSchematic = ({ activeId }: AssemblyDrawingProps) => (
  <svg
    className="assembly-svg assembly-svg--vertical"
    viewBox="0 0 360 640"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    focusable="false"
  >
    <title>Схема сборки впечатления: пять этапов вдоль производственной оси</title>

    <rect className="assembly-svg__frame" x="20" y="20" width="320" height="600" />

    <g className="assembly-svg__marks">
      <path d="M 20 52 V 20 H 52" />
      <path d="M 308 20 H 340 V 52" />
      <path d="M 340 588 V 620 H 308" />
      <path d="M 52 620 H 20 V 588" />
    </g>

    <line className="assembly-svg__spine" x1="64" y1="96" x2="64" y2="512" />

    {VERTICAL_STAGES.map((stage) => (
      <g key={stage.id} className="assembly-svg__stage" data-active={stage.id === activeId}>
        <circle className="assembly-svg__pulse" cx="64" cy={stage.y} r="28" />
        <circle className="assembly-svg__node" cx="64" cy={stage.y} r="20" />
        <g className="assembly-svg__glyph" transform={`translate(64 ${stage.y})`}>
          <StageGlyph id={stage.id} />
        </g>
        <text className="assembly-svg__tag" x="32" y={stage.y + 5} textAnchor="middle">
          {stage.index}
        </text>
        <text className="assembly-svg__label" x="96" y={stage.y + 5} textAnchor="start">
          {stage.title}
        </text>
      </g>
    ))}

    <g className="assembly-svg__notes">
      <text className="assembly-svg__note" x="20" y="14" textAnchor="start">
        СБОРОЧНЫЙ ЦЕХ
      </text>
      <text className="assembly-svg__note" x="340" y="14" textAnchor="end">
        01—05
      </text>
    </g>
  </svg>
);

const AssemblyDrawing = ({ activeId }: AssemblyDrawingProps) => (
  <>
    <RadialSchematic activeId={activeId} />
    <VerticalSchematic activeId={activeId} />
  </>
);

export default AssemblyDrawing;



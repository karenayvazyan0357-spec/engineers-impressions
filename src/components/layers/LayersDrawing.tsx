import type { ReactNode } from 'react';

/* ---------------------------------------------------------------------------
   Схемы направлений. Общий лист — одна система координат 640 × 460:
   рамка 24…616 / 24…436, чертёжная сетка с шагом 40.
   Геометрия каждого направления строится на тех же осях, поэтому схемы
   читаются как серия листов одного альбома, а не как набор иконок.
   --------------------------------------------------------------------------- */

export type LayerId = 'events' | 'content' | 'learning' | 'media' | 'special';

interface LayersDrawingProps {
  id: LayerId;
}

const GRID_X = Array.from({ length: 15 }, (_, step) => 40 + step * 40);
const GRID_Y = Array.from({ length: 11 }, (_, step) => 40 + step * 40);

interface SchematicProps {
  title: string;
  children: ReactNode;
}

const Schematic = ({ title, children }: SchematicProps) => (
  <svg
    className="layers-drawing"
    viewBox="0 0 640 460"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    focusable="false"
  >
    <title>{title}</title>

    <g className="layers-drawing__grid">
      {GRID_X.map((x) => (
        <line key={`grid-x-${x}`} x1={x} y1="24" x2={x} y2="436" />
      ))}
      {GRID_Y.map((y) => (
        <line key={`grid-y-${y}`} x1="24" y1={y} x2="616" y2={y} />
      ))}
    </g>

    <rect className="layers-drawing__frame" x="24" y="24" width="592" height="412" />

    <g className="layers-drawing__marks">
      <path d="M 24 52 V 24 H 52" />
      <path d="M 588 24 H 616 V 52" />
      <path d="M 616 408 V 436 H 588" />
      <path d="M 52 436 H 24 V 408" />
    </g>

    {children}
  </svg>
);

/* --- 01. События: центральная площадка и связанные с ней узлы ------------ */

const EVENT_NODES = [
  { x: 478, y: 226 },
  { x: 432, y: 114 },
  { x: 320, y: 68 },
  { x: 208, y: 114 },
  { x: 162, y: 226 },
  { x: 208, y: 338 },
  { x: 320, y: 384 },
  { x: 432, y: 338 },
];

const EVENT_LINKS = [
  { x1: 478, y1: 226, x2: 430, y2: 226 },
  { x1: 432, y1: 114, x2: 420, y2: 126 },
  { x1: 320, y1: 68, x2: 320, y2: 126 },
  { x1: 208, y1: 114, x2: 220, y2: 126 },
  { x1: 162, y1: 226, x2: 210, y2: 226 },
  { x1: 208, y1: 338, x2: 220, y2: 326 },
  { x1: 320, y1: 384, x2: 320, y2: 326 },
  { x1: 432, y1: 338, x2: 420, y2: 326 },
];

const EventsSchematic = () => (
  <Schematic title="Схема направления «События»: центральная площадка и связанные с ней узлы">
    <g className="layers-drawing__guides">
      <line className="layers-drawing__guide-dash" x1="320" y1="56" x2="320" y2="404" />
      <line className="layers-drawing__guide-dash" x1="64" y1="226" x2="576" y2="226" />
      <circle className="layers-drawing__guide-dash" cx="320" cy="226" r="158" />
      <rect className="layers-drawing__guide" x="210" y="126" width="220" height="200" />
      <circle className="layers-drawing__guide" cx="320" cy="226" r="78" />
    </g>

    <g className="layers-drawing__links">
      {EVENT_LINKS.map((link) => (
        <line key={`${link.x1}-${link.y1}-${link.x2}`} {...link} />
      ))}
    </g>

    <rect className="layers-drawing__area" x="284" y="190" width="72" height="72" />
    <circle className="layers-drawing__accent-thin" cx="320" cy="226" r="21" />
    <circle className="layers-drawing__dot" cx="320" cy="226" r="4" />

    <g>
      {EVENT_NODES.map((node) => (
        <circle
          key={`${node.x}-${node.y}`}
          className="layers-drawing__node"
          cx={node.x}
          cy={node.y}
          r="8"
        />
      ))}
    </g>
  </Schematic>
);

/* --- 02. Контент: структура истории и взаимосвязанные блоки --------------- */

const CONTENT_RULES = [
  { x1: 148, x2: 330, y: 142 },
  { x1: 148, x2: 300, y: 162 },
  { x1: 148, x2: 252, y: 182 },
  { x1: 416, x2: 500, y: 142 },
  { x1: 416, x2: 486, y: 162 },
  { x1: 416, x2: 462, y: 182 },
  { x1: 148, x2: 272, y: 250 },
  { x1: 148, x2: 248, y: 270 },
  { x1: 148, x2: 220, y: 290 },
  { x1: 344, x2: 496, y: 250 },
  { x1: 344, x2: 472, y: 270 },
  { x1: 344, x2: 448, y: 290 },
];

const ContentSchematic = () => (
  <Schematic title="Схема направления «Контент»: структура истории и взаимосвязанные блоки">
    <rect className="layers-drawing__guide" x="96" y="64" width="448" height="332" />
    <line className="layers-drawing__guide" x1="120" y1="96" x2="520" y2="96" />
    <rect className="layers-drawing__area" x="120" y="116" width="256" height="96" />
    <rect className="layers-drawing__guide" x="396" y="116" width="124" height="96" />
    <rect className="layers-drawing__guide" x="120" y="232" width="180" height="84" />
    <rect className="layers-drawing__guide" x="320" y="232" width="200" height="84" />
    <rect className="layers-drawing__guide" x="120" y="336" width="400" height="36" />
    <rect className="layers-drawing__accent-bar" x="120" y="336" width="6" height="36" />

    <g className="layers-drawing__rules">
      {CONTENT_RULES.map((rule) => (
        <line key={`${rule.y}-${rule.x2}`} x1={rule.x1} y1={rule.y} x2={rule.x2} y2={rule.y} />
      ))}
    </g>

    <g className="layers-drawing__links">
      <line className="layers-drawing__accent-thin" x1="376" y1="164" x2="396" y2="164" />
      <path className="layers-drawing__guide-dash" d="M 210 212 V 232" />
      <path className="layers-drawing__guide-dash" d="M 458 212 V 232" />
      <line x1="300" y1="274" x2="320" y2="274" />
      <path className="layers-drawing__guide-dash" d="M 420 316 V 336" />
      <line x1="148" y1="354" x2="500" y2="354" />
    </g>

    <circle className="layers-drawing__dot" cx="210" cy="232" r="3" />
    <circle className="layers-drawing__dot" cx="420" cy="336" r="3" />
    <circle className="layers-drawing__marker" cx="310" cy="274" r="3" />
  </Schematic>
);

/* --- 03. Обучение: последовательность этапов и обратная связь ------------ */

const LEARNING_STAGES = [
  { x: 130, y: 320 },
  { x: 250, y: 260 },
  { x: 370, y: 200 },
  { x: 490, y: 140 },
];

const LEARNING_CHEVRONS = [
  { x: 190, y: 290 },
  { x: 310, y: 230 },
  { x: 430, y: 170 },
];

const LearningSchematic = () => (
  <Schematic title="Схема направления «Обучение»: последовательность этапов и цикл обратной связи">
    <line className="layers-drawing__guide" x1="80" y1="398" x2="560" y2="398" />
    {LEARNING_STAGES.map((stage) => (
      <line
        key={`tick-${stage.x}`}
        className={stage.x === 370 ? 'layers-drawing__tick layers-drawing__tick--accent' : 'layers-drawing__tick'}
        x1={stage.x}
        y1="392"
        x2={stage.x}
        y2="404"
      />
    ))}

    <g className="layers-drawing__links">
      {LEARNING_STAGES.slice(1).map((stage, index) => {
        const previous = LEARNING_STAGES[index];
        return (
          <line key={`stage-link-${stage.x}`} x1={previous.x} y1={previous.y} x2={stage.x} y2={stage.y} />
        );
      })}
    </g>

    {LEARNING_STAGES.map((stage, index) => (
      <rect
        key={`stage-${stage.x}`}
        className={
          index === 2
            ? 'layers-drawing__block layers-drawing__block--accent'
            : 'layers-drawing__block'
        }
        x={stage.x - 36}
        y={stage.y - 36}
        width="72"
        height="72"
      />
    ))}

    {LEARNING_STAGES.map((stage, index) => (
      <circle
        key={`stage-point-${stage.x}`}
        className={index === 2 ? 'layers-drawing__dot' : 'layers-drawing__marker'}
        cx={stage.x}
        cy={stage.y}
        r={index === 2 ? 4 : 3}
      />
    ))}

    {LEARNING_CHEVRONS.map((chevron) => (
      <path
        key={`chevron-${chevron.x}`}
        className="layers-drawing__chevron"
        d="M -7 -6 L 0 0 L -7 6"
        transform={`translate(${chevron.x} ${chevron.y}) rotate(-26.57)`}
      />
    ))}

    <path className="layers-drawing__guide-dash" d="M 490 104 V 76 H 74 V 320 H 86" />
    <path className="layers-drawing__arrow" d="M 94 320 L 83 314.5 L 83 325.5 Z" />
  </Schematic>
);

/* --- 04. Медиа: кадры, сетка и цифровой сигнал --------------------------- */

const MEDIA_PIXELS = Array.from({ length: 16 }, (_, index) => {
  const column = index % 4;
  const row = Math.floor(index / 4);
  return { x: 416 + column * 14, y: 304 + row * 14, accent: (column + row) % 3 === 0 };
});

const MediaSchematic = () => (
  <Schematic title="Схема направления «Медиа»: кадры, сетка и цифровой сигнал">
    <rect className="layers-drawing__guide" x="84" y="88" width="300" height="169" />
    <path className="layers-drawing__accent-thin" d="M 84 110 V 88 H 106" />

    <g className="layers-drawing__guides">
      <line className="layers-drawing__guide-dash" x1="184" y1="88" x2="184" y2="257" />
      <line className="layers-drawing__guide-dash" x1="284" y1="88" x2="284" y2="257" />
      <line className="layers-drawing__guide-dash" x1="84" y1="144" x2="384" y2="144" />
      <line className="layers-drawing__guide-dash" x1="84" y1="201" x2="384" y2="201" />
    </g>

    <rect className="layers-drawing__area" x="128" y="124" width="168" height="94" />

    <rect className="layers-drawing__guide" x="416" y="88" width="156" height="88" />
    <rect className="layers-drawing__guide" x="416" y="196" width="156" height="88" />
    <line className="layers-drawing__tick" x1="432" y1="158" x2="480" y2="158" />
    <line className="layers-drawing__tick" x1="432" y1="266" x2="512" y2="266" />

    <g>
      {MEDIA_PIXELS.map((pixel) => (
        <rect
          key={`${pixel.x}-${pixel.y}`}
          className={
            pixel.accent
              ? 'layers-drawing__pixel layers-drawing__pixel--accent'
              : 'layers-drawing__pixel'
          }
          x={pixel.x}
          y={pixel.y}
          width="6"
          height="6"
        />
      ))}
    </g>

    <g className="layers-drawing__guides">
      <path className="layers-drawing__guide-dash" d="M 84 304 A 40 40 0 0 0 124 344" />
      <path className="layers-drawing__guide-dash" d="M 84 280 A 64 64 0 0 0 148 344" />
      <path className="layers-drawing__guide-dash" d="M 84 256 A 88 88 0 0 0 172 344" />
      <line className="layers-drawing__guide-dash" x1="384" y1="132" x2="416" y2="132" />
      <line className="layers-drawing__guide-dash" x1="384" y1="240" x2="416" y2="240" />
    </g>

    <circle className="layers-drawing__dot" cx="400" cy="132" r="3" />
    <circle className="layers-drawing__marker" cx="400" cy="240" r="3" />
  </Schematic>
);

/* --- 05. Спецпроекты: пересечение нескольких систем ----------------------- */

interface SpecialSchematicProps {
  prefix: string;
}

const SPECIAL_LENS = 'M 320 91.26 A 118 118 0 0 1 320 264.74 A 118 118 0 0 1 320 91.26 Z';

const SpecialSchematic = ({ prefix }: SpecialSchematicProps) => (
  <Schematic title="Схема направления «Спецпроекты»: несколько пересекающихся систем">
    <defs>
      <pattern
        id={`${prefix}-hatch`}
        width="9"
        height="9"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line className="layers-drawing__hatch-line" x1="0" y1="0" x2="0" y2="9" />
      </pattern>
    </defs>

    <g className="layers-drawing__guides">
      <line className="layers-drawing__guide-dash" x1="320" y1="52" x2="320" y2="412" />
      <line className="layers-drawing__guide-dash" x1="70" y1="178" x2="570" y2="178" />
      <circle className="layers-drawing__guide" cx="240" cy="178" r="118" />
      <circle className="layers-drawing__guide" cx="400" cy="178" r="118" />
      <circle className="layers-drawing__guide" cx="320" cy="282" r="118" />
    </g>

    <path className="layers-drawing__area" d={SPECIAL_LENS} />
    <path
      className="layers-drawing__hatch"
      d={SPECIAL_LENS}
      fill={`url(#${prefix}-hatch)`}
    />

    <rect className="layers-drawing__marker" x="236" y="174" width="8" height="8" />
    <rect className="layers-drawing__marker" x="396" y="174" width="8" height="8" />
    <rect className="layers-drawing__accent-fill" x="316" y="278" width="8" height="8" />

    <line className="layers-drawing__accent-thin" x1="310" y1="178" x2="330" y2="178" />
    <line className="layers-drawing__accent-thin" x1="320" y1="168" x2="320" y2="188" />
  </Schematic>
);

const LayersDrawing = ({ id }: LayersDrawingProps) => {
  switch (id) {
    case 'events':
      return <EventsSchematic />;
    case 'content':
      return <ContentSchematic />;
    case 'learning':
      return <LearningSchematic />;
    case 'media':
      return <MediaSchematic />;
    case 'special':
      return <SpecialSchematic prefix="layers-special" />;
  }
};

export default LayersDrawing;

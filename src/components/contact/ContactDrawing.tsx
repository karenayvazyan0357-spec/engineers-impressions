/* ---------------------------------------------------------------------------
   ContactDrawing — инженерный чертёж финальной сборки.

   Замыкает концепцию сайта: идея (точка «?» слева) по пунктирной траектории
   приходит в центр собранной в аксонометрии формы и закрепляется координатной
   сеткой, осями X/Y/Z, линией сечения A—A, окружностью радиуса и размерами.
   Все штрихи тонкие и не масштабируются вместе с листом (vector-effect задаётся
   в Contact.css).
   --------------------------------------------------------------------------- */

const ContactDrawing = () => (
  <svg
    className="contact-drawing"
    viewBox="0 0 640 620"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    focusable="false"
  >
    <title>Инженерный чертёж финальной сборки: собранная форма с идеей в центре</title>

    <defs>
      {/* Координатная сетка: тонкие линии по 28 px */}
      <pattern id="contact-grid" width="28" height="28" patternUnits="userSpaceOnUse">
        <path className="contact-drawing__grid-path" d="M 28 0 L 0 0 L 0 28" />
      </pattern>
      {/* Штриховка боковой грани под 45° */}
      <pattern
        id="contact-hatch"
        width="8"
        height="8"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line className="contact-drawing__hatch-line" x1="0" y1="0" x2="0" y2="8" />
      </pattern>
    </defs>

    {/* Координатная сетка */}
    <rect width="640" height="620" fill="url(#contact-grid)" />

    {/* Оси координат */}
    <g className="contact-drawing__axes">
      <line x1="90" y1="540" x2="600" y2="540" />
      <line x1="90" y1="540" x2="90" y2="120" />
      <line x1="90" y1="540" x2="180" y2="440" />
      <text x="610" y="544" textAnchor="end">
        X
      </text>
      <text x="82" y="112" textAnchor="end">
        Y
      </text>
      <text x="192" y="434">
        Z
      </text>
    </g>

    {/* Собранная форма: каркас в аксонометрии */}
    <g className="contact-drawing__form">
      <path d="M 260 200 L 500 200 L 500 420 L 260 420 Z" />
      <path className="contact-drawing__form--ghost" d="M 316 128 L 556 128 L 556 348 L 316 348 Z" />
      <path d="M 260 200 L 316 128 M 500 200 L 556 128 M 500 420 L 556 348" />
    </g>

    {/* Штриховка боковой (глубинной) грани */}
    <polygon
      className="contact-drawing__hatch"
      points="260,420 316,348 316,128 260,200"
      fill="url(#contact-hatch)"
    />

    {/* Окружность радиуса вокруг центра формы */}
    <circle className="contact-drawing__radius" cx="380" cy="310" r="72" />

    {/* Линия сечения A—A */}
    <g className="contact-drawing__section">
      <line x1="380" y1="120" x2="380" y2="450" />
      <text x="372" y="112">
        A
      </text>
      <text x="372" y="470">
        A
      </text>
    </g>

    {/* Идея: точка вопроса и траектория к центру формы */}
    <g className="contact-drawing__highlight">
      <circle className="contact-drawing__origin" cx="140" cy="150" r="3" />
      <text className="contact-drawing__question" x="140" y="134" textAnchor="middle">
        ?
      </text>
      <line x1="140" y1="150" x2="380" y2="310" />
      <circle className="contact-drawing__node" cx="380" cy="310" r="7" />
    </g>

    {/* Размеры */}
    <g className="contact-drawing__dimensions">
      <line x1="260" y1="420" x2="260" y2="460" />
      <line x1="500" y1="420" x2="500" y2="460" />
      <line x1="260" y1="460" x2="500" y2="460" />
      <line className="contact-drawing__tick" x1="260" y1="460" x2="267" y2="453" />
      <line className="contact-drawing__tick" x1="500" y1="460" x2="493" y2="453" />
      <text x="380" y="456" textAnchor="middle">
        240
      </text>

      <line x1="500" y1="200" x2="570" y2="200" />
      <line x1="500" y1="420" x2="570" y2="420" />
      <line x1="570" y1="200" x2="570" y2="420" />
      <line className="contact-drawing__tick" x1="570" y1="200" x2="563" y2="207" />
      <line className="contact-drawing__tick" x1="570" y1="420" x2="563" y2="413" />
      <text x="578" y="310" textAnchor="middle" transform="rotate(-90 578 310)">
        220
      </text>
    </g>

    {/* Технические обозначения */}
    <g className="contact-drawing__annotations">
      <text x="24" y="44">
        ЛИСТ 006
      </text>
      <text x="24" y="66">
        ФИНАЛЬНАЯ СБОРКА
      </text>
      <text x="556" y="44" textAnchor="end">
        СЕЧЕНИЕ A—A
      </text>
      <text x="24" y="596">
        МАСШТАБ 1:1
      </text>
      <text x="440" y="258">
        R 72
      </text>
    </g>
  </svg>
);

export default ContactDrawing;

import { useState } from 'react';
import { motionDurations, motionEases } from '../../motion/tokens';
import { useSectionMotion } from '../../motion/useSectionMotion';
import './Cases.css';

/* ---------------------------------------------------------------------------
   Секция «Архитектура впечатлений»
   ---------------------------------------------------------------------------
   Три концептуальных исследования, собранные как журнальный разворот:
   01 — доминирующий лист с крупной фотографией и фрагментом,
   02 — асимметричный блок «текст / интерьер с архивной вставкой»,
   03 — панорама города с двумя фрагментами.

   Все проекты — дизайнерские упражнения, а не реализованные коммерческие
   проекты. Маркировка «Концептуальное исследование» стоит у каждого блока.
   --------------------------------------------------------------------------- */

interface Photo {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
  alt: string;
}

interface CaseSpec {
  label: string;
  value: string;
}

interface CaseStudy {
  id: string;
  number: string;
  kicker: string;
  title: readonly string[];
  description: string;
  idea: string;
  steps: readonly string[];
  specs: readonly CaseSpec[];
}

/* Оптимизированные WebP-версии лежат в public/media/hermitage/optimized
   с ASCII-именами, поэтому encodeURI не нужен и проблема %2C/%28 исчезает.

   Путь начинается с import.meta.env.BASE_URL, а не с «/»: на GitHub Pages
   сайт живёт в подкаталоге (/engineers-impressions/), и корневой слэш увёл бы
   запрос на верхний уровень домена, где этих файлов нет. BASE_URL всегда
   оканчивается слэшем, поэтому склейка даёт «…/engineers-impressions/media/…»
   на Pages и «/media/…» при локальной разработке (base = «/»). */
const optimized = (key: string, width: number): string =>
  `${import.meta.env.BASE_URL}media/hermitage/optimized/${key}-${width}.webp`;

const srcSet = (key: string, widths: readonly number[]): string =>
  widths.map((width) => `${optimized(key, width)} ${width}w`).join(', ');

/* Оценка реальной ширины рендера каждого кадра по брейкпоинтам композиции.
   Браузер умножает её на DPR и выбирает подходящего кандидата из srcset. */
const SIZES = {
  lead: '(max-width: 767px) 100vw, (max-width: 1023px) 58vw, 68vw',
  detail: '(max-width: 767px) 100vw, (max-width: 1023px) 42vw, 30vw',
  inside: '(max-width: 1023px) 100vw, 58vw',
  inset: '(max-width: 767px) 160px, 240px',
  panorama: '(min-width: 1440px) 1440px, 100vw',
  fragment: '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 30vw',
} as const;

const PHOTOS = {
  palaceSquare: {
    src: optimized('palaceSquare', 480),
    srcSet: srcSet('palaceSquare', [480, 768, 1280, 1920]),
    sizes: SIZES.lead,
    width: 4928,
    height: 3264,
    alt: 'Зимний дворец: симметричный фасад с центральной аркой и флагом, вид с Дворцовой площади',
  },
  facadeDetail: {
    src: optimized('facadeDetail', 480),
    srcSet: srcSet('facadeDetail', [480, 768, 1280, 1920]),
    sizes: SIZES.detail,
    width: 6000,
    height: 4000,
    alt: 'Фрагмент фасада Зимнего дворца: колонны, окна и скульптуры на карнизе',
  },
  innerHalls: {
    src: optimized('innerHalls', 480),
    srcSet: srcSet('innerHalls', [480, 768, 1280, 1920]),
    sizes: SIZES.inside,
    width: 4288,
    height: 2848,
    alt: 'Парадный зал Эрмитажа: люстры, лепнина, витрины с экспонатами и посетители',
  },
  alexanderHall: {
    src: optimized('alexanderHall', 480),
    srcSet: srcSet('alexanderHall', [480, 768, 1280]),
    sizes: SIZES.inset,
    width: 1476,
    height: 1367,
    alt: 'Александровский зал Зимнего дворца на акварели 1861 года',
  },
  panorama: {
    src: optimized('panorama', 480),
    srcSet: srcSet('panorama', [480, 768, 1280, 1920]),
    sizes: SIZES.panorama,
    width: 5980,
    height: 2594,
    alt: 'Панорама центра Санкт-Петербурга с Исаакиевского собора: крыши, шпили и Нева',
  },
  generalStaff: {
    src: optimized('generalStaff', 480),
    srcSet: srcSet('generalStaff', [480, 768, 1280, 1920]),
    sizes: SIZES.fragment,
    width: 6000,
    height: 4000,
    alt: 'Арка Главного штаба на Дворцовой площади с колесницей на вершине',
  },
  nevaView: {
    src: optimized('nevaView', 480),
    srcSet: srcSet('nevaView', [480, 768, 1280, 1920]),
    sizes: SIZES.fragment,
    width: 4928,
    height: 3264,
    alt: 'Зимний дворец со стороны Невы: фасад, набережная и вода',
  },
} as const satisfies Record<string, Photo>;

const CASE_STUDIES = {
  hermitage: {
    id: 'hermitage',
    number: '01',
    kicker: 'Эрмитаж / пространство',
    title: ['Эрмитаж.', 'Пространство искусства'],
    description:
      'Дворцовая площадь как первый кадр исследования: симметрия фасада, масштаб колоннады и пауза перед входом внутрь.',
    idea:
      'Музей рассматривается как последовательность порогов — от городской площади до отдельной архитектурной детали. На каждом пороге меняется масштаб человека относительно здания, а впечатление собирается из ритма окон, колонн и света.',
    steps: [
      'Площадь — горизонт и симметрия фасада',
      'Портал — точка входа и смена масштаба',
      'Анфилада — ритм залов и света',
      'Деталь — колонна, скульптура, отблеск золота',
    ],
    specs: [
      { label: 'Тип', value: 'Концептуальное исследование' },
      { label: 'Локация', value: 'Дворцовая площадь, 2' },
      { label: 'Координаты', value: '59°56′ N / 30°18′ E' },
      { label: 'Дисциплины', value: 'Архитектура, медиа, типографика' },
    ],
  },
  inside: {
    id: 'inside',
    number: '02',
    kicker: 'Интерьер / анфилада',
    title: ['Внутри', 'истории'],
    description:
      'Парадные залы Зимнего дворца: свет, лепнина и музейные витрины превращают интерьер в декорацию, где зритель становится частью сцены.',
    idea:
      'Исследование соединяет два времени в одном кадре: акварель 1861 года и современную музейную экспозицию. Исторический интерьер остаётся декорацией, а посетитель — действующим лицом, которое завершает композицию.',
    steps: [
      'Порог — переход из города в интерьер',
      'Свет — люстры и дневные окна',
      'Витрина — музейный объект в фокусе',
      'Зритель — подвижная точка в анфиладе',
    ],
    specs: [
      { label: 'Тип', value: 'Концептуальное исследование' },
      { label: 'Объект', value: 'Парадные залы Зимнего дворца' },
      { label: 'Архив', value: 'Акварель, 1861' },
      { label: 'Дисциплины', value: 'Экспозиция, свет, графика' },
    ],
  },
  city: {
    id: 'city',
    number: '03',
    kicker: 'Город / панорама',
    title: ['Петербург.', 'Архитектурный код'],
    description:
      'Город читается как система: линия Невы, шпили, арки и равномерный ритм фасадов. Панорама задаёт правило, деталь его уточняет.',
    idea:
      'Архитектурный код Петербурга собирается из повторяемых элементов: горизонтали набережных, вертикали шпилей, арок и мерного шага окон. Панорама показывает систему целиком, фрагменты — её отдельные знаки.',
    steps: [
      'Оси — Нева, Невский проспект, Дворцовая',
      'Ритм — окна, колонны, скульптуры',
      'Арка — точка перехода между пространствами',
      'Вода — отражение как второй фасад',
    ],
    specs: [
      { label: 'Тип', value: 'Концептуальное исследование' },
      { label: 'География', value: 'Санкт-Петербург, центр' },
      { label: 'Фокус', value: 'Панорама и архитектурная деталь' },
      { label: 'Дисциплины', value: 'Урбанистика, фотография, карты' },
    ],
  },
} as const satisfies Record<string, CaseStudy>;


/* --- Общие небольшие блоки ------------------------------------------------ */

const CaseMeta = ({ study }: { study: CaseStudy }) => (
  <div className="cases__case-meta">
    <p className="cases__kicker">
      <span className="cases__kicker-index" aria-hidden="true">
        {study.number}
      </span>
      <span className="cases__kicker-text">{study.kicker}</span>
    </p>
    <span className="cases__concept">Концептуальное исследование</span>
  </div>
);

const CaseToggle = ({
  study,
  open,
  onToggle,
}: {
  study: CaseStudy;
  open: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    className="cases__toggle"
    aria-expanded={open}
    aria-controls={`case-${study.id}-details`}
    onClick={onToggle}
  >
    <span className="cases__toggle-label">{open ? 'Свернуть' : 'Подробности'}</span>
    <span className="cases__toggle-icon" aria-hidden="true" />
  </button>
);

const CaseDetails = ({ study, open }: { study: CaseStudy; open: boolean }) => (
  <div
    className="cases__details"
    id={`case-${study.id}-details`}
    role="region"
    aria-labelledby={`case-${study.id}-title`}
    aria-hidden={!open}
    data-open={open}
  >
    <div className="cases__details-clip">
      <div className="cases__details-body">
        <div className="cases__detail">
          <p className="cases__detail-label">
            <span className="cases__detail-mark" aria-hidden="true" />
            Идея
          </p>
          <p className="cases__detail-text">{study.idea}</p>
        </div>

        <div className="cases__detail">
          <p className="cases__detail-label">
            <span className="cases__detail-mark" aria-hidden="true" />
            Сценарий
          </p>
          <ol className="cases__steps">
            {study.steps.map((step, index) => (
              <li className="cases__step" key={step}>
                <span className="cases__step-index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="cases__specs">
          <p className="cases__detail-label cases__specs-label">
            <span className="cases__detail-mark" aria-hidden="true" />
            Паспорт
          </p>
          <dl className="cases__spec-list">
            {study.specs.map((spec) => (
              <div className="cases__spec" key={spec.label}>
                <dt className="cases__spec-label">{spec.label}</dt>
                <dd className="cases__spec-value">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  </div>
);

/* --- Секция --------------------------------------------------------------- */

const Cases = () => {
  /* Каждый проект раскрывается независимо: посетитель может сравнить
     исследования, не закрывая предыдущее. */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const isOpen = (id: string) => Boolean(expanded[id]);
  const toggle = (id: string) => {
    setExpanded((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  const hermitage = CASE_STUDIES.hermitage;
  const inside = CASE_STUDIES.inside;
  const city = CASE_STUDIES.city;

  /* ---------------------------------------------------------------------
     Появление раздела при скролле: один ScrollTrigger на секцию, без пина.
     Двигаются только transform и opacity — сетки, «гармошка» подробностей
     (grid-template-rows), наведение на кадры и cases__scan остаются на CSS
     и не пересекаются с GSAP по свойствам. Стартовые состояния задают
     твины: без GSAP и при «меньше движения» всё содержимое видно.
     --------------------------------------------------------------------- */
  const casesRef = useSectionMotion<HTMLElement>(({ gsap, scope }) => {
    const top = scope.querySelector<HTMLElement>('.cases__top');
    const topRule = scope.querySelector<HTMLElement>('.cases__top-rule');
    const headingLines = Array.from(
      scope.querySelectorAll<HTMLElement>('.cases__heading-line'),
    );
    const lede = scope.querySelector<HTMLElement>('.cases__lede');
    const metaItems = Array.from(scope.querySelectorAll<HTMLElement>('.cases__meta-item'));
    const ruler = scope.querySelector<HTMLElement>('.cases__ruler');
    const studies = Array.from(scope.querySelectorAll<HTMLElement>('.cases__case'));

    // На узком экране короче дистанция, длительность и шаг каскада.
    const isCompact = window.matchMedia('(max-width: 767px)').matches;
    const offset = isCompact ? 8 : 16;
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

    // Верхняя линейка растёт слева направо — как шкала, разворачивающаяся
    // вместе с разворотом.
    if (topRule) {
      timeline.from(
        topRule,
        {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: reveal,
          ease: motionEases.standard,
        },
        0.02,
      );
    }

    if (headingLines.length > 0) {
      timeline.from(
        headingLines,
        {
          y: offset,
          opacity: 0,
          duration: reveal,
          stagger: isCompact ? 0.04 : 0.08,
        },
        0.06,
      );
    }

    if (lede) {
      timeline.from(lede, { y: offset * 0.75, opacity: 0, duration: entrance }, 0.18);
    }

    if (metaItems.length > 0) {
      timeline.from(
        metaItems,
        {
          y: offset * 0.5,
          opacity: 0,
          duration: entrance,
          stagger: isCompact ? 0.03 : 0.05,
        },
        0.24,
      );
    }

    if (ruler) {
      timeline.from(
        ruler,
        {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: reveal,
          ease: motionEases.standard,
        },
        0.3,
      );
    }

    /* Проекты идут каскадом внутри той же последовательности: отдельных
       триггеров на карточки нет. Вложенные части (паспорт строки, кадры,
       нижняя полоса) подхватывают движение чуть позже самой карточки —
       получается мягкий «второй шаг», без собственных триггеров. */
    const studiesStart = 0.34;
    const studiesStep = isCompact ? 0.08 : 0.12;

    studies.forEach((study, index) => {
      const at = studiesStart + index * studiesStep;

      timeline.from(study, { y: offset * 1.75, opacity: 0, duration: reveal }, at);

      const parts = Array.from(
        study.querySelectorAll<HTMLElement>('.cases__case-meta, .cases__figure, .cases__bar'),
      );

      if (parts.length > 0) {
        timeline.from(
          parts,
          {
            y: offset * 0.6,
            opacity: 0,
            duration: entrance,
            stagger: isCompact ? 0.02 : 0.05,
          },
          at + 0.06,
        );
      }
    });

    /* После проигрывания снимаем инлайновый transform: карточки проектов,
       кадры и паспорт строки возвращаются к натуральной раскладке, ховер
       на изображениях (CSS transform у img) не затрагивается. */
    const transformed = [
      top,
      topRule,
      ...headingLines,
      lede,
      ...metaItems,
      ruler,
      ...studies,
      ...Array.from(
        scope.querySelectorAll<HTMLElement>('.cases__case-meta, .cases__figure, .cases__bar'),
      ),
    ].filter((element): element is HTMLElement => element !== null);

    if (transformed.length > 0) {
      timeline.call(() => {
        gsap.set(transformed, { clearProps: 'transform' });
      });
    }
  });

  return (
    <section className="cases" id="projects" aria-labelledby="cases-title" ref={casesRef}>
      <div className="cases__frame">
        <div className="cases__top">
          <span className="cases__top-mark" aria-hidden="true" />
          <p className="cases__top-label">Концептуальные исследования</p>
          <span className="cases__top-rule" aria-hidden="true" />
          <p className="cases__top-index">СПБ / 01—03</p>
        </div>

        <div className="cases__head">
          <h2 className="cases__heading" id="cases-title">
            <span className="cases__heading-line">Архитектура</span>
            <span className="cases__heading-line cases__heading-line--accent">
              впечатлений.
            </span>
          </h2>

          <div className="cases__head-aside">
            <p className="cases__lede">
              Исследуем пространства, в которых архитектура становится частью истории.
            </p>
            <ul className="cases__meta" aria-label="Параметры раздела">
              <li className="cases__meta-item">
                <span className="cases__meta-label">Координаты</span>
                <span className="cases__meta-value">59°56′ N / 30°18′ E</span>
              </li>
              <li className="cases__meta-item">
                <span className="cases__meta-label">Период</span>
                <span className="cases__meta-value">1762 — 2026</span>
              </li>
              <li className="cases__meta-item">
                <span className="cases__meta-label">Том</span>
                <span className="cases__meta-value">I — III</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="cases__ruler" aria-hidden="true" />

        <article
          className="cases__case cases__case--lead"
          aria-labelledby={`case-${hermitage.id}-title`}
          data-expanded={isOpen(hermitage.id)}
        >
          <header className="cases__case-head cases__case-head--lead">
            <CaseMeta study={hermitage} />
            <h3
              className="cases__title cases__title--lead"
              id={`case-${hermitage.id}-title`}
            >
              {hermitage.title.map((line) => (
                <span className="cases__title-line" key={line}>
                  {line}
                </span>
              ))}
            </h3>
            <p className="cases__description">{hermitage.description}</p>
          </header>

          <div className="cases__lead-media">
            <figure className="cases__figure cases__figure--lead">
              <div className="cases__media cases__media--lead">
                <img
                  src={PHOTOS.palaceSquare.src}
                  srcSet={PHOTOS.palaceSquare.srcSet}
                  sizes={PHOTOS.palaceSquare.sizes}
                  width={PHOTOS.palaceSquare.width}
                  height={PHOTOS.palaceSquare.height}
                  alt={PHOTOS.palaceSquare.alt}
                  loading="lazy"
                  decoding="async"
                />
                <span className="cases__scan" aria-hidden="true" />
                <span className="cases__media-label cases__media-label--tl">
                  FIG. 01.1 / Северный фасад
                </span>
                <span className="cases__media-label cases__media-label--br">
                  59°56′ N / 30°18′ E
                </span>
              </div>
              <figcaption className="cases__caption">
                <span className="cases__caption-text">
                  Зимний дворец / Дворцовая площадь
                </span>
                <span className="cases__caption-tech">Инв. 01/1</span>
              </figcaption>
            </figure>

            <figure className="cases__figure cases__figure--detail">
              <div className="cases__media cases__media--detail">
                <img
                  src={PHOTOS.facadeDetail.src}
                  srcSet={PHOTOS.facadeDetail.srcSet}
                  sizes={PHOTOS.facadeDetail.sizes}
                  width={PHOTOS.facadeDetail.width}
                  height={PHOTOS.facadeDetail.height}
                  alt={PHOTOS.facadeDetail.alt}
                  loading="lazy"
                  decoding="async"
                />
                <span className="cases__scan" aria-hidden="true" />
                <span className="cases__media-label cases__media-label--tl">FIG. 01.2</span>
              </div>
              <figcaption className="cases__caption cases__caption--stacked">
                <span className="cases__caption-text">Деталь / колоннада и скульптура</span>
                <span className="cases__caption-tech">1:200</span>
              </figcaption>
            </figure>
          </div>

          <div className="cases__bar">
            <p className="cases__bar-note">Площадь → портал → анфилада → деталь</p>
            <CaseToggle
              study={hermitage}
              open={isOpen(hermitage.id)}
              onToggle={() => toggle(hermitage.id)}
            />
          </div>

          <CaseDetails study={hermitage} open={isOpen(hermitage.id)} />
        </article>

        {/* --- 02. Внутри истории ------------------------------------------ */}
        <article
          className="cases__case cases__case--inside"
          aria-labelledby={`case-${inside.id}-title`}
          data-expanded={isOpen(inside.id)}
        >
          <div className="cases__inside-text">
            <CaseMeta study={inside} />
            <h3
              className="cases__title cases__title--inside"
              id={`case-${inside.id}-title`}
            >
              {inside.title.map((line) => (
                <span className="cases__title-line" key={line}>
                  {line}
                </span>
              ))}
            </h3>
            <p className="cases__description">{inside.description}</p>
            <dl className="cases__facts">
              <div className="cases__fact">
                <dt>Маршрут</dt>
                <dd>Порог → анфилада</dd>
              </div>
              <div className="cases__fact">
                <dt>Слои времени</dt>
                <dd>1861 / 2026</dd>
              </div>
            </dl>
            <CaseToggle
              study={inside}
              open={isOpen(inside.id)}
              onToggle={() => toggle(inside.id)}
            />
          </div>

          <div className="cases__inside-media">
            <figure className="cases__figure cases__figure--inside">
              <div className="cases__media cases__media--inside">
                <img
                  src={PHOTOS.innerHalls.src}
                  srcSet={PHOTOS.innerHalls.srcSet}
                  sizes={PHOTOS.innerHalls.sizes}
                  width={PHOTOS.innerHalls.width}
                  height={PHOTOS.innerHalls.height}
                  alt={PHOTOS.innerHalls.alt}
                  loading="lazy"
                  decoding="async"
                />
                <span className="cases__scan" aria-hidden="true" />
                <span className="cases__media-label cases__media-label--tl">FIG. 02.1</span>
                <span className="cases__media-label cases__media-label--br">
                  59°56′ N / 30°18′ E
                </span>
              </div>
              <figcaption className="cases__caption">
                <span className="cases__caption-text">
                  Парадные залы / музейная экспозиция
                </span>
                <span className="cases__caption-tech">Интерьер</span>
              </figcaption>
            </figure>

            <figure className="cases__figure cases__figure--inset">
              <div className="cases__media cases__media--inset">
                <img
                  src={PHOTOS.alexanderHall.src}
                  srcSet={PHOTOS.alexanderHall.srcSet}
                  sizes={PHOTOS.alexanderHall.sizes}
                  width={PHOTOS.alexanderHall.width}
                  height={PHOTOS.alexanderHall.height}
                  alt={PHOTOS.alexanderHall.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption className="cases__caption cases__caption--inset">
                <span className="cases__caption-text">Александровский зал</span>
                <span className="cases__caption-tech">акварель, 1861</span>
              </figcaption>
            </figure>
          </div>

          <CaseDetails study={inside} open={isOpen(inside.id)} />
        </article>

        {/* --- 03. Петербург. Архитектурный код ---------------------------- */}
        <article
          className="cases__case cases__case--city"
          aria-labelledby={`case-${city.id}-title`}
          data-expanded={isOpen(city.id)}
        >
          <CaseMeta study={city} />

          <figure className="cases__figure cases__figure--panorama">
            <div className="cases__media cases__media--panorama">
              <img
                src={PHOTOS.panorama.src}
                srcSet={PHOTOS.panorama.srcSet}
                sizes={PHOTOS.panorama.sizes}
                width={PHOTOS.panorama.width}
                height={PHOTOS.panorama.height}
                alt={PHOTOS.panorama.alt}
                loading="lazy"
                decoding="async"
              />
              <span className="cases__scan" aria-hidden="true" />
              <div className="cases__panorama-copy">
                <span className="cases__panorama-index" aria-hidden="true">
                  03
                </span>
                <h3
                  className="cases__title cases__title--panorama"
                  id={`case-${city.id}-title`}
                >
                  {city.title.map((line) => (
                    <span className="cases__title-line" key={line}>
                      {line}
                    </span>
                  ))}
                </h3>
              </div>
              <span className="cases__media-label cases__media-label--tr">FIG. 03.1</span>
              <span className="cases__media-label cases__media-label--tl">
                59°56′ N / 30°18′ E
              </span>
            </div>
            <figcaption className="cases__caption">
              <span className="cases__caption-text">
                Панорама с Исаакиевского собора / вид на центр
              </span>
              <span className="cases__caption-tech">Сектор 270°</span>
            </figcaption>
          </figure>

          <div className="cases__city-lower">
            <div className="cases__city-fragments">
              <figure className="cases__figure cases__figure--fragment">
                <div className="cases__media cases__media--fragment">
                  <img
                    src={PHOTOS.generalStaff.src}
                    srcSet={PHOTOS.generalStaff.srcSet}
                    sizes={PHOTOS.generalStaff.sizes}
                    width={PHOTOS.generalStaff.width}
                    height={PHOTOS.generalStaff.height}
                    alt={PHOTOS.generalStaff.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="cases__scan" aria-hidden="true" />
                  <span className="cases__media-label cases__media-label--tl">FIG. 03.2</span>
                </div>
                <figcaption className="cases__caption cases__caption--stacked">
                  <span className="cases__caption-text">Арка Главного штаба</span>
                  <span className="cases__caption-tech">Дворцовая</span>
                </figcaption>
              </figure>

              <figure className="cases__figure cases__figure--fragment">
                <div className="cases__media cases__media--fragment">
                  <img
                    src={PHOTOS.nevaView.src}
                    srcSet={PHOTOS.nevaView.srcSet}
                    sizes={PHOTOS.nevaView.sizes}
                    width={PHOTOS.nevaView.width}
                    height={PHOTOS.nevaView.height}
                    alt={PHOTOS.nevaView.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="cases__scan" aria-hidden="true" />
                  <span className="cases__media-label cases__media-label--tl">FIG. 03.3</span>
                </div>
                <figcaption className="cases__caption cases__caption--stacked">
                  <span className="cases__caption-text">Зимний дворец / Нева</span>
                  <span className="cases__caption-tech">Набережная</span>
                </figcaption>
              </figure>
            </div>

            <div className="cases__city-text">
              <p className="cases__description">{city.description}</p>
              <dl className="cases__facts cases__facts--city">
                <div className="cases__fact">
                  <dt>Оси</dt>
                  <dd>Нева · Невский · Дворцовая</dd>
                </div>
                <div className="cases__fact">
                  <dt>Ритм</dt>
                  <dd>Окна · колонны · скульптуры</dd>
                </div>
                <div className="cases__fact">
                  <dt>Материал</dt>
                  <dd>Гранит · вода · золото</dd>
                </div>
              </dl>
              <CaseToggle
                study={city}
                open={isOpen(city.id)}
                onToggle={() => toggle(city.id)}
              />
            </div>
          </div>

          <CaseDetails study={city} open={isOpen(city.id)} />
        </article>

        <footer className="cases__footer">
          <span className="cases__footer-mark" aria-hidden="true" />
          <p className="cases__footer-text">
            Все проекты раздела — концептуальные исследования. Это дизайнерские
            упражнения, а не реализованные коммерческие проекты.
          </p>
          <span className="cases__footer-index">01 — 03 / 2026</span>
        </footer>
      </div>
    </section>
  );
};


export default Cases;


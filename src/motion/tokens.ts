/* ---------------------------------------------------------------------------
   Соответствие CSS-токенов движения из src/styles/variables.css.

   Длительности GSAP задаются в секундах, поэтому значения CSS переведены
   из миллисекунд: 80ms -> 0.08, 160ms -> 0.16 и т. д.

   Easing воспроизводит те же кривые cubic-bezier, что и CSS. Это позволяет
   использовать в GSAP-анимациях ровно ту же скорость и характер движения,
   что и в существующих CSS-переходах, без CustomEase и без изменения CSS.
   --------------------------------------------------------------------------- */

export const motionDurations = {
  instant: 0.08, // --duration-instant: 80ms
  fast: 0.16, // --duration-fast: 160ms
  base: 0.24, // --duration-base: 240ms
  slow: 0.4, // --duration-slow: 400ms
  slower: 0.7, // --duration-slower: 700ms
} as const;

export type MotionDurationToken = keyof typeof motionDurations;

export type CubicBezierPoints = readonly [
  x1: number,
  y1: number,
  x2: number,
  y2: number,
];

/** Функция easing в формате, который принимает GSAP. */
export type MotionEase = (progress: number) => number;

export const motionEasePoints = {
  standard: [0.2, 0, 0, 1], // --ease-standard: cubic-bezier(0.2, 0, 0, 1)
  out: [0.16, 1, 0.3, 1], // --ease-out: cubic-bezier(0.16, 1, 0.3, 1)
  inOut: [0.65, 0, 0.35, 1], // --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)
  engineering: [0.4, 0, 0.2, 1], // --ease-engineering: cubic-bezier(0.4, 0, 0.2, 1)
} as const satisfies Record<string, CubicBezierPoints>;

export type MotionEaseToken = keyof typeof motionEasePoints;

const NEWTON_ITERATIONS = 8;
const NEWTON_MIN_SLOPE = 0.001;
const SOLVE_EPSILON = 1e-7;
const BISECTION_ITERATIONS = 20;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function bezierValue(t: number, p1: number, p2: number): number {
  const a = 1 - 3 * p2 + 3 * p1;
  const b = 3 * p2 - 6 * p1;
  const c = 3 * p1;
  return ((a * t + b) * t + c) * t;
}

function bezierSlope(t: number, p1: number, p2: number): number {
  const a = 1 - 3 * p2 + 3 * p1;
  const b = 3 * p2 - 6 * p1;
  const c = 3 * p1;
  return (3 * a * t + 2 * b) * t + c;
}

/** Находит параметр t кривой, при котором x(t) равно progress. */
function solveBezierT(progress: number, x1: number, x2: number): number {
  if (progress <= 0) {
    return 0;
  }

  if (progress >= 1) {
    return 1;
  }

  let t = progress;

  // Метод Ньютона быстро сходится для большинства CSS-кривых.
  for (let iteration = 0; iteration < NEWTON_ITERATIONS; iteration += 1) {
    const slope = bezierSlope(t, x1, x2);

    if (Math.abs(slope) < NEWTON_MIN_SLOPE) {
      break;
    }

    const difference = bezierValue(t, x1, x2) - progress;

    if (Math.abs(difference) < SOLVE_EPSILON) {
      return t;
    }

    t = clamp01(t - difference / slope);
  }

  // Страховка для почти вертикальных участков кривой.
  let lower = 0;
  let upper = 1;
  t = progress;

  for (let iteration = 0; iteration < BISECTION_ITERATIONS; iteration += 1) {
    const value = bezierValue(t, x1, x2);

    if (Math.abs(value - progress) < SOLVE_EPSILON) {
      return t;
    }

    if (value < progress) {
      lower = t;
    } else {
      upper = t;
    }

    t = (lower + upper) / 2;
  }

  return t;
}

/** Создаёт easing-функцию из тех же координат, что указаны в CSS-токене. */
export function createCubicBezierEase([x1, y1, x2, y2]: CubicBezierPoints): MotionEase {
  return (progress: number): number => {
    if (progress <= 0) {
      return 0;
    }

    if (progress >= 1) {
      return 1;
    }

    return bezierValue(solveBezierT(progress, x1, x2), y1, y2);
  };
}

export const motionEases = {
  standard: createCubicBezierEase(motionEasePoints.standard),
  out: createCubicBezierEase(motionEasePoints.out),
  inOut: createCubicBezierEase(motionEasePoints.inOut),
  engineering: createCubicBezierEase(motionEasePoints.engineering),
} as const satisfies Record<MotionEaseToken, MotionEase>;

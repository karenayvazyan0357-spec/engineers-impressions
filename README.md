# Инженеры впечатлений

Одностраничный сайт студии на стыке инженерии, дизайна и музейной культуры:
экспозиции, пространства и цифровой опыт в Санкт-Петербурге.

Проект статический: React-приложение собирается Vite в папку `dist` и раздаётся
как project-страница GitHub Pages.

- Опубликованная версия: **https://karenayvazyan0357-spec.github.io/engineers-impressions/**
  (адрес заработает после первого успешного деплоя — см. раздел «Публикация»)
- Репозиторий: **https://github.com/karenayvazyan0357-spec/engineers-impressions**

## Стек

| Слой | Технологии |
| --- | --- |
| Интерфейс | React 19, TypeScript |
| Сборка | Vite 8 |
| Движение | GSAP 3 (`src/motion`), без Lenis |
| Стили | CSS-переменные в `src/styles/variables.css`, стили по компонентам |
| Шрифты | Playfair Display, Inter, JetBrains Mono (Google Fonts) |
| Проверки | ESLint, `tsc -b`, Playwright для локальных аудитов |

Новых зависимостей не добавлялось: сборка идёт на том, что уже было в проекте.

## Локальный запуск

```bash
npm install
npm run dev        # http://localhost:5173/
```

## Сборка и предпросмотр

```bash
npm run build      # tsc -b && vite build → dist/
npm run preview    # http://localhost:4173/engineers-impressions/
```

Важно: в `vite.config.ts` задан `base: '/engineers-impressions/'`, поэтому
предпросмотр открывается по адресу с подкаталогом. Все пути к ассетам в коде
строятся от `import.meta.env.BASE_URL` (например, кадры секции «Проекты» в
`src/components/cases/Cases.tsx`), а не от корневого слэша — иначе на Pages
запросы уходили бы на верхний уровень домена, где этих файлов нет.

Прочие команды:

```bash
npm run lint       # ESLint
npx tsc --noEmit   # только проверка типов
```

## Публикация

Деплой настроен в `.github/workflows/deploy.yml`:

1. push в ветку `main` (или ручной запуск workflow `Deploy to GitHub Pages`);
2. Node.js 22, `npm ci`, `npm run build`;
3. папка `dist` публикуется официальным Pages-деплоем Actions.

Один раз в настройках репозитория:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**;
2. при необходимости — **Settings → Environments → github-pages** (правила
   защиты окружения). Отдельная ветка `gh-pages` не нужна.

Адрес сайта `https://karenayvazyan0357-spec.github.io/engineers-impressions/`
задан в двух местах и меняется вместе с доменом:

- `vite.config.ts` — `base`;
- `index.html` — `canonical`, `og:url` и абсолютные ссылки на `og-image.png`.


## Структура

```
index.html                     метаданные, иконки, шрифты, точка входа Vite
public/
  media/hermitage/optimized/    адаптивные WebP для секции «Проекты»
  favicon.svg  favicon.ico      иконки сайта (SVG — источник, ICO/PNG — фолбэк)
  og-image.png                  превью ссылки 1200×630
scripts/generate-brand-assets.mjs  пересборка иконок и превью из favicon.svg
src/
  components/layout|hero|layers|cases|assembly|quality|contact|footer
  motion/                        токены и хуки GSAP
  styles/variables.css           дизайн-система: палитра, типографика, отступы
.github/workflows/deploy.yml     сборка и публикация на GitHub Pages
```

## Иконки и превью ссылки

Источник графики — `public/favicon.svg`. Если эмблема меняется, растровые
варианты и OG-картинка пересобираются одним скриптом (нужен установленный
Playwright из devDependencies):

```bash
node scripts/generate-brand-assets.mjs
```

Скрипт перезаписывает `favicon.ico`, `favicon-16/32/48.png`,
`apple-touch-icon.png` и `og-image.png` в `public/`.

## Перед публикацией

- Тексты, контакты и реквизиты на странице — содержательные данные владельца
  проекта; правки только вручную в компонентах секций.
- Фотографии Эрмитажа в `public/media/hermitage` приведены к WebP и несут
  описательные `alt`. Права на исходные снимки должен подтвердить владелец
  репозитория до публичного запуска.
- Диагностические отчёты и скриншоты локальных проверок в репозиторий не
  попадают (см. `.gitignore`).

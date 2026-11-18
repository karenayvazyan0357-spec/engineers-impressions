import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  /* Сайт публикуется как project-страница GitHub Pages:
     https://karenayvazyan0357-spec.github.io/engineers-impressions/
     Поэтому все ресурсы обслуживаются из подкаталога, а не из корня домена.
     Значение обязано начинаться и заканчиваться слэшем — Vite использует его
     как префикс для собранных ассетов и как import.meta.env.BASE_URL. */
  base: '/engineers-impressions/',
  plugins: [react()],
})

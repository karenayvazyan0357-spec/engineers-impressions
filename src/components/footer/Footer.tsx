import { motionDurations, motionEases } from '../../motion/tokens';
import { useSectionMotion } from '../../motion/useSectionMotion';
import './Footer.css';

/* Навигация по реальным якорям секций проекта:
   #projects (Cases), #assembly (Assembly), #quality (Quality), #contact (Contact). */
const FOOTER_NAV = [
  { href: '#projects', label: 'Проекты' },
  { href: '#assembly', label: 'Сборка' },
  { href: '#quality', label: 'Контроль качества' },
  { href: '#contact', label: 'Контакты' },
];

const Footer = () => {
  const year = new Date().getFullYear();

  const handleScrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  /* ---------------------------------------------------------------------
     Очень лёгкое появление подвала при приближении к viewport: один
     ScrollTrigger и короткие твины без сложной хореографии. Двигаются
     только transform и opacity, поэтому ссылки, кнопка и подписи остаются
     на своих местах, а hover/focus-состояния не затрагиваются.
     --------------------------------------------------------------------- */
  const footerRef = useSectionMotion<HTMLElement>(({ gsap, scope }) => {
    const brand = scope.querySelector<HTMLElement>('.site-footer__brand');
    const navItems = Array.from(
      scope.querySelectorAll<HTMLElement>('.site-footer__nav-list > li'),
    );
    const topButton = scope.querySelector<HTMLElement>('.site-footer__top-btn');
    const bottom = scope.querySelector<HTMLElement>('.site-footer__bottom');

    const isCompact = window.matchMedia('(max-width: 767px)').matches;
    const offset = isCompact ? 6 : 10;
    const entrance = isCompact ? motionDurations.fast : motionDurations.base;

    const timeline = gsap.timeline({
      defaults: { ease: motionEases.out },
      scrollTrigger: {
        trigger: scope,
        start: 'top 92%',
        once: true,
      },
    });

    if (brand) {
      timeline.from(brand, { y: offset, opacity: 0, duration: entrance }, 0);
    }

    if (navItems.length > 0) {
      timeline.from(
        navItems,
        {
          y: offset * 0.6,
          opacity: 0,
          duration: entrance,
          stagger: motionDurations.instant * 0.5,
        },
        0.04,
      );
    }

    if (topButton) {
      timeline.from(topButton, { y: offset * 0.6, opacity: 0, duration: entrance }, 0.06);
    }

    if (bottom) {
      timeline.from(bottom, { opacity: 0, duration: entrance, ease: motionEases.standard }, 0.1);
    }

    /* Снимаем инлайновый transform после появления: подвал возвращается
       к натуральной раскладке. */
    const transformed = [brand, ...navItems, topButton].filter(
      (element): element is HTMLElement => element !== null,
    );

    if (transformed.length > 0) {
      timeline.call(() => {
        gsap.set(transformed, { clearProps: 'transform' });
      });
    }
  });

  return (
    <footer className="site-footer" ref={footerRef}>
      <div className="site-footer__frame">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <svg
              className="site-footer__logo"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <polygon className="site-footer__logo-frame" points="50,5 95,85 5,85" />
              <circle className="site-footer__logo-core" cx="50" cy="50" r="20" />
            </svg>
            <span className="site-footer__brand-text">Инженеры впечатлений</span>
          </div>

          <nav className="site-footer__nav" aria-label="Навигация по секциям">
            <ul className="site-footer__nav-list">
              {FOOTER_NAV.map((item) => (
                <li key={item.href}>
                  <a className="site-footer__nav-link" href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            className="site-footer__top-btn"
            type="button"
            onClick={handleScrollToTop}
            aria-label="Вернуться наверх страницы"
          >
            Наверх
            <span className="site-footer__top-btn-arrow" aria-hidden="true">
              ↑
            </span>
          </button>
        </div>

        <div className="site-footer__bottom">
          <span className="site-footer__mark">DESIGNED &amp; ENGINEERED</span>
          <span className="site-footer__copyright">© {year} · Инженеры впечатлений</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

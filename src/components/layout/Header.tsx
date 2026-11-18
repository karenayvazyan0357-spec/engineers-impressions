import React, { useEffect, useRef, useState } from 'react';
import { motionDurations, motionEases } from '../../motion/tokens';
import { useSectionMotion } from '../../motion/useSectionMotion';
import './Header.css';

/* Пункты навигации: разметка одна для десктопа и мобильной панели */
const NAV_ITEMS = [
  { href: '#about', label: 'О нас' },
  { href: '#projects', label: 'Проекты' },
  { href: '#assembly', label: 'Сборка' },
  { href: '#quality', label: 'Качество' },
  { href: '#contact', label: 'Контакты' },
];

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /* Появление шапки: только transform/opacity, без ScrollTrigger.
     Мобильная панель и бургер анимируются собственным CSS и здесь не
     затрагиваются — ссылки получают движение лишь на десктопной ширине. */
  const headerRef = useSectionMotion<HTMLElement>(({ gsap, scope }) => {
    const logo = scope.querySelector<HTMLElement>('[data-motion="logo"]');
    const navLinks = Array.from(
      scope.querySelectorAll<HTMLElement>('[data-motion="nav-link"]'),
    );
    const isDesktop = window.matchMedia('(min-width: 769px)').matches;

    const timeline = gsap.timeline({
      defaults: {
        duration: motionDurations.fast,
        ease: motionEases.out,
      },
    });

    if (logo) {
      timeline.from(logo, { y: -6, opacity: 0 });
    }

    if (isDesktop && navLinks.length > 0) {
      timeline.from(
        navLinks,
        {
          y: -5,
          opacity: 0,
          stagger: motionDurations.instant * 0.5,
        },
        '<0.04',
      );
    }

    /* После появления снимаем инлайновый transform: элементы шапки
       возвращаются к натуральной раскладке и не остаются на слоях
       композиции (тот же приём, что в остальных секциях). */
    const transformed = [logo, ...navLinks].filter(
      (element): element is HTMLElement => element !== null,
    );

    if (transformed.length > 0) {
      timeline.call(() => {
        gsap.set(transformed, { clearProps: 'transform' });
      });
    }
  });

  /* Escape закрывает мобильную панель и возвращает фокус на кнопку */
  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  /* Переход на десктопную ширину не должен оставлять панель открытой */
  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 769px)');
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsMenuOpen(false);
      }
    };

    desktopQuery.addEventListener('change', handleChange);
    return () => desktopQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="header-container">
        <div className="logo-wrapper" data-motion="logo">
          <svg
            viewBox="0 0 100 100"
            className="geometric-logo"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <polygon className="geometric-logo__frame" points="50,5 95,85 5,85" />
            <circle className="geometric-logo__core" cx="50" cy="50" r="20" />
          </svg>
          <span className="logo-text">Инженеры впечатлений</span>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className={`menu-toggle${isMenuOpen ? ' is-open' : ''}`}
          aria-expanded={isMenuOpen}
          aria-controls="site-nav"
          aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="menu-toggle__bars" aria-hidden="true">
            <span className="menu-toggle__bar" />
            <span className="menu-toggle__bar" />
          </span>
        </button>

        <nav
          id="site-nav"
          className={`header-nav${isMenuOpen ? ' is-open' : ''}`}
          aria-label="Основная навигация"
        >
          <ul className="header-nav__list">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  className="header-nav__link"
                  href={item.href}
                  data-motion="nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;


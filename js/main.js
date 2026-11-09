/* ==============================
   FOOTER YEAR & LOGO / BURGER
============================== */
document.addEventListener('DOMContentLoaded', () => {


  /* ==============================
     SCROLL SPEED SETTINGS
  ============================== */

  const SCROLL_TO_TOP = 800;


  // Footer year
  const yearEl = document.getElementById('f_year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ==============================
     Smooth Scroll
  ============================== */
  function smoothScroll(targetY, duration = 800) {

    const start = window.scrollY || window.pageYOffset;
    const distance = targetY - start;
    let startTime = null;

    function animation(currentTime) {

      if (!startTime) startTime = currentTime;

      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      const ease = 0.5 * (1 - Math.cos(Math.PI * progress));

      window.scrollTo(0, start + distance * ease);

      if (timeElapsed < duration)
        requestAnimationFrame(animation);
    }

    requestAnimationFrame(animation);
  }


  // Logo scroll
  const logo = document.getElementById('logo');

  if (logo) {
    logo.addEventListener('click', e => {

      e.preventDefault();

      smoothScroll(0, SCROLL_TO_TOP);

    });
  }


  /* ==============================
     HERO — CHARACTER REVEAL + FLIP
  ============================== */

  const hero = document.querySelector('.hero');
  const heroDesc = hero?.querySelector('.hero-desc');
  const heroFlip = hero?.querySelector('.hero-flip');

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // При отключённой анимации сразу показываем нормальную композицию
  if (reduceMotion) {
    if (heroDesc) {
      heroDesc.classList.add('hero-desc-ready');
    }
  }

  if (hero && heroDesc && heroFlip && !reduceMotion) {

    // Сначала зеркально отображаем всю композицию
    heroFlip.classList.add('hero-flip-pending');

    const characters = [];
    const walker = document.createTreeWalker(
      heroDesc,
      NodeFilter.SHOW_TEXT
    );

    const textNodes = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    // Разбиваем текст на отдельные символы
    textNodes.forEach(textNode => {

      const value = textNode.nodeValue;

      if (!value || !value.trim()) return;

      const fragment = document.createDocumentFragment();

      for (const character of value) {

        if (/\s/.test(character)) {

          fragment.appendChild(
            document.createTextNode(character)
          );

        } else {

          const span = document.createElement('span');

          span.className = 'hero-reveal-char';
          span.textContent = character;
          span.setAttribute('aria-hidden', 'true');

          fragment.appendChild(span);
          characters.push(span);
        }
      }

      textNode.parentNode.replaceChild(fragment, textNode);
    });

    heroDesc.setAttribute('aria-label', heroDesc.textContent);

    // Показываем подготовленный текст
    heroDesc.classList.add('hero-desc-ready');

    if (characters.length) {

      // Случайный порядок появления символов
      for (let i = characters.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [characters[i], characters[j]] =
          [characters[j], characters[i]];
      }

      const totalRevealTime = 5400;
      const interval = totalRevealTime / characters.length;

      characters.forEach((character, index) => {

        character.style.animationDelay =
          `${Math.round(index * interval)}ms`;

      });

      // Последний символ завершает появление текста.
      // После этого разворачиваем всю композицию.
      const lastCharacter = characters[characters.length - 1];

      lastCharacter.addEventListener('animationend', () => {

        heroFlip.classList.add('is-flipped');

      }, { once: true });

    } else {

      // Если текста нет — разворачиваем сразу
      heroFlip.classList.add('is-flipped');

    }
  }

  // Burger menu
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('menu');

  if (burger && menu) {

    const menuLinks = menu.querySelectorAll('a');

    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      menu.classList.toggle('active');
    });

    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        menu.classList.remove('active');
      });
    });

  }

  /* ==============================
     MENU — SCROLL SPY
     Подсветка раздела по фактической позиции прокрутки.
     В Hero активного пункта нет.
  ============================== */
  if (menu) {
    const sectionLinks = Array.from(
      menu.querySelectorAll('a[href^="#"]')
    ).map(link => ({
      link,
      section: document.getElementById(
        decodeURIComponent(link.getAttribute('href').slice(1))
      )
    })).filter(item => item.section);

    let scrollSpyFrame = null;

    function updateActiveMenuItem() {
      scrollSpyFrame = null;

      const scrollPosition = window.scrollY || window.pageYOffset;
      const headerHeight = parseFloat(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--header-h')
      ) || 66;
      const activationLine = scrollPosition + headerHeight + 36;
      const pageBottom =
        window.innerHeight + scrollPosition >=
        document.documentElement.scrollHeight - 2;

      let currentSection = null;

      if (pageBottom && sectionLinks.length) {
        currentSection = sectionLinks[sectionLinks.length - 1];
      } else {
        for (const item of sectionLinks) {
          if (item.section.getBoundingClientRect().top + scrollPosition <= activationLine) {
            currentSection = item;
          } else {
            break;
          }
        }
      }

      sectionLinks.forEach(item => {
        const isCurrent = item === currentSection;
        item.link.classList.toggle('is-current', isCurrent);

        if (isCurrent) {
          item.link.setAttribute('aria-current', 'location');
        } else {
          item.link.removeAttribute('aria-current');
        }
      });
    }

    function requestMenuUpdate() {
      if (scrollSpyFrame !== null) return;
      scrollSpyFrame = requestAnimationFrame(updateActiveMenuItem);
    }

    window.addEventListener('scroll', requestMenuUpdate, { passive: true });
    window.addEventListener('resize', requestMenuUpdate);
    window.addEventListener('load', requestMenuUpdate);
    requestMenuUpdate();
  }

});

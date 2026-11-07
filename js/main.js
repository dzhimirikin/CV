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
     HERO — RANDOM CHARACTER REVEAL
     Анимация применяется только к описанию .hero-desc.
     Фото, заголовок и ссылка CV отображаются сразу.
  ============================== */
    const hero = document.querySelector('.hero');
    const heroDesc = hero?.querySelector('.hero-desc');

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Если анимация отключена настройками браузера,
    // сразу показываем обычный текст.
    if (heroDesc && reduceMotion) {
      heroDesc.classList.add('hero-desc-ready');
    }

    if (hero && heroDesc && !reduceMotion) {

    const characters = [];
    const walker = document.createTreeWalker(heroDesc, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(textNode => {
      const value = textNode.nodeValue;
      if (!value || !value.trim()) return;

      const fragment = document.createDocumentFragment();

      for (const character of value) {
        if (/\s/.test(character)) {
          fragment.appendChild(document.createTextNode(character));
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

    // Разрешаем показ текста после подготовки символов
    heroDesc.classList.add('hero-desc-ready');

    if (characters.length) {
      for (let i = characters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [characters[i], characters[j]] = [characters[j], characters[i]];
      }

      const totalRevealTime = 2700;
      const interval = totalRevealTime / characters.length;

      characters.forEach((character, index) => {
        character.style.animationDelay = `${Math.round(index * interval)}ms`;
      });
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

});

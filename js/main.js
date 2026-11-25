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
     LANGUAGE SWITCHER — MOVE + 360° SPIN
     Плашка перемещается к выбранному языку,
     затем делает полный оборот в плоскости экрана.
  ============================== */
  const languageBar = document.querySelector('.lang');

  if (languageBar) {
    const activeLanguage = languageBar.querySelector('strong');
    const languageLinks = languageBar.querySelectorAll('a[href]');

    if (activeLanguage && languageLinks.length) {
      const indicator = document.createElement('span');
      indicator.className = 'lang-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      languageBar.appendChild(indicator);

      const placeIndicator = (element) => {
        const barRect = languageBar.getBoundingClientRect();
        const targetRect = element.getBoundingClientRect();

        indicator.style.left = `${targetRect.left - barRect.left - 3}px`;
        indicator.style.top = `${targetRect.top - barRect.top - 5}px`;
        indicator.style.width = `${targetRect.width + 6}px`;
        indicator.style.height = `${targetRect.height + 10}px`;
      };

      // Начальное положение точно совпадает с активным языком.
      placeIndicator(activeLanguage);

      languageLinks.forEach((link) => {
        link.addEventListener('click', async (event) => {
          // Не перехватываем открытие в новой вкладке и системные комбинации.
          if (
            event.button !== 0 ||
            event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
          ) return;

          event.preventDefault();

          if (indicator.dataset.animating === 'true') return;
          indicator.dataset.animating = 'true';

          const barRect = languageBar.getBoundingClientRect();
          const targetRect = link.getBoundingClientRect();

          const targetLeft = targetRect.left - barRect.left - 3;
          const targetTop = targetRect.top - barRect.top - 5;
          const moveX = targetLeft - parseFloat(indicator.style.left);
          const moveY = targetTop - parseFloat(indicator.style.top);
          const destination = link.href;

          const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
          ).matches;

          if (reducedMotion || typeof indicator.animate !== 'function') {
            window.location.href = destination;
            return;
          }

          try {
            // Этап 1: плашка скользит к выбранному языку.
            const moveAnimation = indicator.animate(
              [
                { transform: 'translate(0, 0)' },
                { transform: `translate(${moveX}px, ${moveY}px)` }
              ],
              {
                duration: 300,
                easing: 'cubic-bezier(.22,.75,.25,1)',
                fill: 'forwards'
              }
            );

            await moveAnimation.finished;
            moveAnimation.cancel();

            // Фиксируем новую позицию, чтобы вращение шло уже на месте.
            indicator.style.left = `${targetLeft}px`;
            indicator.style.top = `${targetTop}px`;
            indicator.style.transform = 'none';

            // Этап 2: полный оборот вокруг центра в плоскости экрана.
            const spinAnimation = indicator.animate(
              [
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(360deg)' }
              ],
              {
                duration: 600,
                easing: 'cubic-bezier(.45,0,.2,1)',
                fill: 'forwards'
              }
            );

            await spinAnimation.finished;
            window.location.href = destination;
          } catch (error) {
            // Если анимация была прервана браузером, всё равно выполняем переход.
            window.location.href = destination;
          }
        });
      });
    }
  }


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
     HERO — PHOTO ASSEMBLY + CHARACTER REVEAL + FLIP
  ============================== */

  const hero = document.querySelector('.hero');
  const heroDesc = hero?.querySelector('.hero-desc');
  const heroFlip = hero?.querySelector('.hero-flip');
  const heroPhoto = hero?.querySelector('.hero-photo');

  const HERO_INTRO_KEY = 'heroIntroPlayed';

  // Проверяем, была ли заставка полностью показана в этой вкладке.
  let introAlreadyPlayed = false;
  try {
    introAlreadyPlayed = sessionStorage.getItem(HERO_INTRO_KEY) === 'true';
  } catch (e) {
    // Если sessionStorage недоступен, заставка работает обычно.
  }

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // Повторный вход в этой вкладке: сразу показываем готовую композицию.
  if (introAlreadyPlayed) {
    if (heroDesc) heroDesc.classList.add('hero-desc-ready');
    if (heroPhoto) heroPhoto.style.visibility = 'visible';
  }

  // При системном отключении анимации сразу показываем готовую композицию.
  if (reduceMotion) {
    if (heroDesc) heroDesc.classList.add('hero-desc-ready');
    if (heroPhoto) heroPhoto.style.visibility = 'visible';
    if (hero) {
      try {
        sessionStorage.setItem(HERO_INTRO_KEY, 'true');
      } catch (e) {
        // Ничего не делаем, если sessionStorage недоступен.
      }
    }
  }

  if (hero && heroDesc && heroFlip && !reduceMotion && !introAlreadyPlayed) {
    const TOTAL_REVEAL_TIME = 5400;
    const PHOTO_COLUMNS = 10;
    const PHOTO_ROWS = 10;
    const PHOTO_PIECE_DURATION = 400;
    const PHOTO_MAX_DELAY = TOTAL_REVEAL_TIME - PHOTO_PIECE_DURATION;
    const CHARACTER_DURATION = 130;

    // Исходное положение — зеркальное. Поворот будет только после двух сборок.
    heroFlip.classList.add('hero-flip-pending');

    let textFinished = false;
    let photoFinished = false;
    let flipStarted = false;

    function finishWhenBothReady() {
      if (textFinished && photoFinished && !flipStarted) {
        flipStarted = true;

        // Сессия считается завершённой только после окончания CSS-поворота.
        let introCompleted = false;
        let flipFallbackTimer = null;

        function completeHeroIntro() {
          if (introCompleted) return;
          introCompleted = true;
          if (flipFallbackTimer !== null) clearTimeout(flipFallbackTimer);
          heroFlip.removeEventListener('transitionend', onFlipTransitionEnd);

          try {
            sessionStorage.setItem(HERO_INTRO_KEY, 'true');
          } catch (e) {
            // Если хранилище недоступно, при следующей загрузке заставка повторится.
          }
        }

        function onFlipTransitionEnd(event) {
          if (event.target === heroFlip && event.propertyName === 'transform') {
            completeHeroIntro();
          }
        }

        heroFlip.addEventListener('transitionend', onFlipTransitionEnd);
        // Запасной вариант, если transitionend не придёт.
        flipFallbackTimer = window.setTimeout(completeHeroIntro, 2600);
        heroFlip.classList.add('is-flipped');
      }
    }

    // Фото собирается поверх исходного элемента, не меняя структуру HERO.
    function assembleHeroPhoto() {
      if (!heroPhoto || !heroPhoto.complete || !heroPhoto.naturalWidth) {
        photoFinished = true;
        finishWhenBothReady();
        return;
      }

      const heroInner = heroPhoto.parentElement;
      if (!heroInner) {
        photoFinished = true;
        finishWhenBothReady();
        return;
      }

      const imageLeft = heroPhoto.offsetLeft;
      const imageTop = heroPhoto.offsetTop;
      const imageWidth = heroPhoto.offsetWidth;
      const imageHeight = heroPhoto.offsetHeight;

      if (!imageWidth || !imageHeight) {
        photoFinished = true;
        heroPhoto.style.visibility = 'visible';
        finishWhenBothReady();
        return;
      }

      const assembly = document.createElement('div');
      assembly.className = 'hero-photo-assembly';
      Object.assign(assembly.style, {
        left: `${imageLeft}px`,
        top: `${imageTop}px`,
        width: `${imageWidth}px`,
        height: `${imageHeight}px`
      });

      const pieces = document.createElement('div');
      pieces.className = 'hero-photo-pieces';
      pieces.style.gridTemplateColumns = `repeat(${PHOTO_COLUMNS}, 1fr)`;
      pieces.style.gridTemplateRows = `repeat(${PHOTO_ROWS}, 1fr)`;
      assembly.appendChild(pieces);

      const pieceAnimations = [];
      const totalPieces = PHOTO_COLUMNS * PHOTO_ROWS;
      const imageUrl = heroPhoto.currentSrc || heroPhoto.src;

      // Сначала помещаем мозаику в DOM и только потом запускаем анимации.
      // Иначе браузер может завершить WAAPI-анимации ещё до вставки фрагментов.
      heroPhoto.style.visibility = 'hidden';
      heroInner.appendChild(assembly);
      pieces.getBoundingClientRect();

      let pieceIndex = 0;
      for (let row = 0; row < PHOTO_ROWS; row++) {
        for (let column = 0; column < PHOTO_COLUMNS; column++) {
          const piece = document.createElement('span');
          piece.className = 'hero-photo-piece';
          piece.style.backgroundImage = `url("${imageUrl}")`;
          piece.style.backgroundSize = `${PHOTO_COLUMNS * 100}% ${PHOTO_ROWS * 100}%`;
          piece.style.backgroundPosition =
            `${column / (PHOTO_COLUMNS - 1) * 100}% ${row / (PHOTO_ROWS - 1) * 100}%`;
          pieces.appendChild(piece);

          const delay = pieceIndex === totalPieces - 1
            ? PHOTO_MAX_DELAY
            : Math.round(Math.random() * PHOTO_MAX_DELAY);
          const fromX = (Math.random() - 0.5) * Math.max(window.innerWidth, 500) * 0.9;
          const fromY = (Math.random() - 0.5) * Math.max(window.innerHeight, 500) * 0.9;
          const fromRotate = (Math.random() - 0.5) * 100;

          const animation = piece.animate([
            {
              opacity: 0,
              transform: `translate3d(${fromX}px, ${fromY}px, 0) rotate(${fromRotate}deg) scale(.55)`
            },
            {
              opacity: 1,
              transform: 'translate3d(0, 0, 0) rotate(-2deg) scale(1.025)',
              offset: 0.72
            },
            {
              opacity: 1,
              transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)'
            }
          ], {
            duration: PHOTO_PIECE_DURATION,
            delay,
            easing: 'cubic-bezier(.16,.72,.22,1)',
            fill: 'both'
          });

          pieceAnimations.push(animation.finished.catch(() => {}));
          pieceIndex++;
        }
      }

      Promise.all(pieceAnimations).then(() => {
        assembly.remove();
        heroPhoto.style.visibility = 'visible';
        photoFinished = true;
        finishWhenBothReady();
      });
    }

    // Текст и фото запускаются в одном цикле после готовности изображения.
    function startHeroReveal() {
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
      heroDesc.classList.add('hero-desc-ready');

      if (characters.length) {
        // Случайный порядок появления символов.
        for (let i = characters.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [characters[i], characters[j]] = [characters[j], characters[i]];
        }

        // С учётом 130 мс самой анимации последний символ завершится на 5400 мс.
        const interval = characters.length > 1
          ? (TOTAL_REVEAL_TIME - CHARACTER_DURATION) / (characters.length - 1)
          : 0;

        characters.forEach((character, index) => {
          character.style.animationDelay = `${Math.round(index * interval)}ms`;
        });

        characters[characters.length - 1].addEventListener('animationend', () => {
          textFinished = true;
          finishWhenBothReady();
        }, { once: true });
      } else {
        textFinished = true;
        finishWhenBothReady();
      }

      assembleHeroPhoto();
    }

    if (heroPhoto && !heroPhoto.complete) {
      heroPhoto.addEventListener('load', startHeroReveal, { once: true });
      heroPhoto.addEventListener('error', () => {
        startHeroReveal = () => {
          heroDesc.classList.add('hero-desc-ready');
          textFinished = true;
          photoFinished = true;
          finishWhenBothReady();
        };
        startHeroReveal();
      }, { once: true });
    } else {
      startHeroReveal();
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

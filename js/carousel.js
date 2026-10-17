
/* ==========================================
   CERTIFICATE CAROUSEL — 3D + DOTS + TITLES
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('certCarousel');
  if (!carousel) return;

  const images = Array.from(carousel.querySelectorAll('img'));
  const count = images.length;

  if (!count) return;

  const angle = 360 / count;

  let currentIndex = 0;
  let rotation = 0;

  // Масштаб центрального и боковых сертификатов
  const CENTER_SCALE = 1;
  const SIDE_SCALE = 0.80;
  const FAR_SCALE = 0.65;

  // Радиус 3D-карусели — оставляем прежним
  function getRadius() {
    return window.innerWidth < 768 ? 300 : 420;
  }

  // Подготовка изображений
  images.forEach(img => {
    if (!img.hasAttribute('tabindex')) {
      img.tabIndex = 0;
    }

    img.style.transformOrigin = 'center center';
  });

  // Создание точек навигации
  let dots = document.getElementById('certificateDots');

  if (!dots) {
    dots = document.createElement('div');
    dots.id = 'certificateDots';
    dots.className = 'certificate-dots';
    dots.setAttribute('aria-label', 'Choose certificate');

    const container = carousel.closest(
      '.card, .certificates-card, section'
    );

    const controls = container?.querySelector('.carousel-controls');

    if (controls) {
      controls.insertAdjacentElement('beforebegin', dots);
    } else {
      carousel.insertAdjacentElement('afterend', dots);
    }
  }

  dots.replaceChildren();

  const dotButtons = images.map((img, index) => {
    const dot = document.createElement('button');

    dot.type = 'button';
    dot.className = 'certificate-dot';

    const title =
      img.dataset.title || img.alt || `Certificate ${index + 1}`;

    dot.setAttribute('aria-label', `Show ${title}`);

    dot.addEventListener('click', () => {
      goToCertificate(index);
    });

    dots.appendChild(dot);

    return dot;
  });

  // Кратчайшее расстояние между индексами по кругу
  function getDistance(index) {
    const forward = (index - currentIndex + count) % count;
    const backward = (currentIndex - index + count) % count;

    return Math.min(forward, backward);
  }

  // Расстановка карточек в 3D
  function layoutCarousel() {
    const radius = getRadius();

    images.forEach((img, index) => {
      const distance = getDistance(index);

      let scale = CENTER_SCALE;

      if (distance === 1) {
        scale = SIDE_SCALE;
      } else if (distance > 1) {
        scale = FAR_SCALE;
      }

      // Положение карточки и её индивидуальный масштаб
      img.style.transform =
        `rotateY(${index * angle}deg) ` +
        `translateZ(${radius}px) ` +
        `scale(${scale})`;
    });

    updateCarousel();
  }

  // Обновление поворота, точек и заголовка
  function updateCarousel() {
    carousel.style.transform = `rotateY(${rotation}deg)`;

    dotButtons.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });

    const currentTitle = document.getElementById(
      'certificateCurrentTitle'
    );

    const activeImage = images[currentIndex];

    if (currentTitle) {
      currentTitle.textContent =
        activeImage.dataset.title ||
        activeImage.alt ||
        '';
    }

    // Обновление кнопки материалов для выбранного сертификата
    const materialsButton = document.getElementById('downloadMaterialsBtn');

    if (materialsButton) {
      const materialsUrl = activeImage.dataset.materials?.trim();

      if (materialsUrl) {
        materialsButton.href = materialsUrl;
        materialsButton.classList.remove('disabled');
        materialsButton.setAttribute('aria-disabled', 'false');
        materialsButton.removeAttribute('tabindex');
      } else {
        materialsButton.href = '#';
        materialsButton.classList.add('disabled');
        materialsButton.setAttribute('aria-disabled', 'true');
        materialsButton.setAttribute('tabindex', '-1');
      }
    }

    // После выбора нового сертификата пересчитываем масштабы
    images.forEach((img, index) => {
      const distance = getDistance(index);

      let scale = CENTER_SCALE;

      if (distance === 1) {
        scale = SIDE_SCALE;
      } else if (distance > 1) {
        scale = FAR_SCALE;
      }

      img.style.transform =
        `rotateY(${index * angle}deg) ` +
        `translateZ(${getRadius()}px) ` +
        `scale(${scale})`;
    });
  }

  // Переход к определённому сертификату
  function goToCertificate(index) {
    currentIndex = (index + count) % count;
    rotation = -currentIndex * angle;

    updateCarousel();
  }

  // Совместимость с существующими кнопками-стрелками
  window.rotateCarousel = function(direction) {
    const step = Number(direction) < 0 ? -1 : 1;

    goToCertificate(currentIndex + step);
  };

  // Просмотр сертификата во всплывающем окне сайта с кнопкой закрытия
  let certificateViewer = null;
  let viewerImage = null;
  let closeViewerButton = null;
  let viewerPrevButton = null;
  let viewerNextButton = null;
  let viewerCounter = null;
  let viewerPages = [];
  let viewerPageIndex = 0;
  let previousBodyOverflow = '';
  let previouslyFocusedElement = null;

  function ensureCertificateViewer() {
    if (certificateViewer) return;

    const style = document.createElement('style');
    style.id = 'certificate-viewer-styles';
    style.textContent = `
      .certificate-viewer-overlay[hidden] {
        display: none !important;
      }
      .certificate-viewer-overlay {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 56px 24px 24px;
        background: rgba(0, 0, 0, 0.92);
      }
      .certificate-viewer-image {
        display: block;
        max-width: 100%;
        max-height: calc(100vh - 80px);
        width: auto;
        height: auto;
        object-fit: contain;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
        border-radius: 2px;
      }
      .certificate-viewer-nav {
        position: fixed;
        top: 50%;
        transform: translateY(-50%);
        z-index: 100001;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 46px;
        height: 46px;
        padding: 0;
        border: 1px solid rgba(255,255,255,.65);
        border-radius: 50%;
        background: rgba(25,25,25,.72);
        color: #fff;
        font: 32px/1 Arial, Helvetica, sans-serif;
        cursor: pointer;
        box-sizing: border-box;
        transition: background-color 0.15s ease, color 0.15s ease;
      }
      .certificate-viewer-prev { left: 22px; }
      .certificate-viewer-next { right: 22px; }
      .certificate-viewer-nav:hover,
      .certificate-viewer-nav:focus-visible {
        background: #fff;
        color: #111;
        outline: 2px solid #fff;
        outline-offset: 3px;
      }
      .certificate-viewer-nav[hidden],
      .certificate-viewer-counter[hidden] { display: none !important; }
      .certificate-viewer-counter {
        position: fixed;
        left: 50%;
        bottom: 14px;
        transform: translateX(-50%);
        z-index: 100001;
        padding: 6px 12px;
        border-radius: 16px;
        background: rgba(25,25,25,.78);
        color: #fff;
        font: 14px/1.2 Arial, Helvetica, sans-serif;
      }
      .certificate-viewer-close {
        position: fixed;
        top: 16px;
        right: 22px;
        z-index: 100001;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 46px;
        height: 46px;
        padding: 0;
        border: 1px solid rgba(255,255,255,.65);
        border-radius: 50%;
        background: rgba(25,25,25,.72);
        color: #fff;
        font: 36px/1 Arial, Helvetica, sans-serif;
        cursor: pointer;
      }
      .certificate-viewer-close:hover,
      .certificate-viewer-close:focus-visible {
        background: #fff;
        color: #111;
        outline: 2px solid #fff;
        outline-offset: 3px;
      }
      @media (max-width: 600px) {
        .certificate-viewer-overlay { padding: 60px 10px 38px; }
        .certificate-viewer-image { max-width: 100%; max-height: calc(100vh - 112px); }
        .certificate-viewer-close { top: 10px; right: 10px; width: 42px; height: 42px; }
        .certificate-viewer-nav { width: 42px; height: 42px; font-size: 30px; }
        .certificate-viewer-prev { left: 10px; }
        .certificate-viewer-next { right: 10px; }
        .certificate-viewer-counter { bottom: 8px; }
      }
    `;
    document.head.appendChild(style);

    certificateViewer = document.createElement('div');
    certificateViewer.className = 'certificate-viewer-overlay';
    certificateViewer.setAttribute('role', 'dialog');
    certificateViewer.setAttribute('aria-modal', 'true');
    certificateViewer.setAttribute('aria-label', 'Certificate preview');
    certificateViewer.hidden = true;

    viewerImage = document.createElement('img');
    viewerImage.className = 'certificate-viewer-image';
    viewerImage.alt = '';
    viewerImage.draggable = false;

    closeViewerButton = document.createElement('button');
    closeViewerButton.type = 'button';
    closeViewerButton.className = 'certificate-viewer-close';
    closeViewerButton.setAttribute('aria-label', 'Close certificate preview');
    closeViewerButton.title = 'Close';
    closeViewerButton.textContent = '×';

    viewerPrevButton = document.createElement('button');
    viewerPrevButton.type = 'button';
    viewerPrevButton.className = 'certificate-viewer-nav certificate-viewer-prev';
    viewerPrevButton.setAttribute('aria-label', 'Previous certificate page');
    viewerPrevButton.textContent = '‹';
    viewerPrevButton.hidden = true;
    viewerPrevButton.addEventListener('click', () => showViewerPage(viewerPageIndex - 1));

    viewerNextButton = document.createElement('button');
    viewerNextButton.type = 'button';
    viewerNextButton.className = 'certificate-viewer-nav certificate-viewer-next';
    viewerNextButton.setAttribute('aria-label', 'Next certificate page');
    viewerNextButton.textContent = '›';
    viewerNextButton.hidden = true;
    viewerNextButton.addEventListener('click', () => showViewerPage(viewerPageIndex + 1));

    viewerCounter = document.createElement('div');
    viewerCounter.className = 'certificate-viewer-counter';
    viewerCounter.setAttribute('aria-live', 'polite');
    viewerCounter.hidden = true;

    closeViewerButton.addEventListener('click', closeCertificateViewer);
    certificateViewer.addEventListener('click', event => {
      if (event.target === certificateViewer) closeCertificateViewer();
    });

    certificateViewer.append(viewerImage, viewerPrevButton, viewerNextButton, viewerCounter, closeViewerButton);
    document.body.appendChild(certificateViewer);
  }

  // Дополнительные JPG-страницы указываются в data-pages через запятую.
  // Первая страница — обычный src карточки, поэтому в карусели видна только она.
  function getCertificatePages(img) {
    const firstPage = img.currentSrc || img.src;
    const extraPages = (img.dataset.pages || '')
      .split(',')
      .map(path => path.trim())
      .filter(Boolean)
      .map(path => new URL(path, document.baseURI).href);
    return [firstPage, ...extraPages];
  }

  function showViewerPage(index) {
    if (!viewerPages.length) return;
    viewerPageIndex = Math.max(0, Math.min(index, viewerPages.length - 1));
    viewerImage.src = viewerPages[viewerPageIndex];
    viewerPrevButton.hidden = viewerPages.length < 2;
    viewerNextButton.hidden = viewerPages.length < 2;
    viewerCounter.hidden = viewerPages.length < 2;
    viewerCounter.textContent = `${viewerPageIndex + 1} / ${viewerPages.length}`;
    viewerPrevButton.disabled = viewerPageIndex === 0;
    viewerNextButton.disabled = viewerPageIndex === viewerPages.length - 1;
    // Нециклическая навигация по страницам документа.
    viewerPrevButton.style.opacity = viewerPrevButton.disabled ? '0.35' : '1';
    viewerNextButton.style.opacity = viewerNextButton.disabled ? '0.35' : '1';
  }

  function openCertificate(img) {
    if (!img) return;
    ensureCertificateViewer();
    previouslyFocusedElement = document.activeElement;
    viewerPages = getCertificatePages(img);
    viewerImage.alt = img.alt || img.dataset.title || 'Certificate';
    previousBodyOverflow = document.body.style.overflow;
    certificateViewer.hidden = false;
    document.body.style.overflow = 'hidden';
    showViewerPage(0);
    closeViewerButton.focus();
  }

  function closeCertificateViewer() {
    if (!certificateViewer || certificateViewer.hidden) return;
    certificateViewer.hidden = true;
    viewerImage.removeAttribute('src');
    viewerPages = [];
    document.body.style.overflow = previousBodyOverflow;
    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
      previouslyFocusedElement.focus();
    }
  }

  document.addEventListener('keydown', event => {
    if (!certificateViewer || certificateViewer.hidden) return;
    if (event.key === 'Escape') closeCertificateViewer();
    else if (event.key === 'ArrowLeft' && viewerPages.length > 1) showViewerPage(viewerPageIndex - 1);
    else if (event.key === 'ArrowRight' && viewerPages.length > 1) showViewerPage(viewerPageIndex + 1);
  });

  // Клавиатурная доступность сохраняется для каждой карточки.
  images.forEach(img => {
    img.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCertificate(img);
      }
    });
  });

  /*
   * Обработка указателя отдельно от 3D hit-testing.
   * Определяем ближайшую из трёх видимых карточек по экранным
   * координатам их проекций.
   */
  const hitArea = carousel.parentElement;
  let hoveredImage = null;

  function visibleCandidates() {
    return [
      images[(currentIndex - 1 + count) % count],
      images[currentIndex],
      images[(currentIndex + 1) % count]
    ];
  }

  function findImageAtPoint(clientX, clientY) {
    const matches = [];

    visibleCandidates().forEach(img => {
      const rect = img.getBoundingClientRect();

      if (clientX >= rect.left && clientX <= rect.right &&
          clientY >= rect.top && clientY <= rect.bottom) {
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);
        matches.push({ img, distance: dx * dx + dy * dy });
      }
    });

    matches.sort((a, b) => a.distance - b.distance);
    return matches.length ? matches[0].img : null;
  }

  function setHoveredImage(img) {
    if (hoveredImage === img) return;

    if (hoveredImage) {
      hoveredImage.style.filter = '';
      hoveredImage.style.boxShadow = '';
    }

    hoveredImage = img;

    if (hoveredImage) {
      hoveredImage.style.filter = 'brightness(0.95)';
      hoveredImage.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
    }

    hitArea.style.cursor = hoveredImage ? 'pointer' : '';
  }

  hitArea.addEventListener('pointermove', event => {
    setHoveredImage(findImageAtPoint(event.clientX, event.clientY));
  });

  hitArea.addEventListener('pointerleave', () => setHoveredImage(null));

  hitArea.addEventListener('click', event => {
    const img = findImageAtPoint(event.clientX, event.clientY);
    if (!img) return;

    event.preventDefault();
    event.stopPropagation();
    openCertificate(img);
  });

  // Первоначальная настройка
  layoutCarousel();

  // Перестройка при изменении ширины окна
  let resizeFrame = null;

  window.addEventListener('resize', () => {
    if (resizeFrame !== null) {
      cancelAnimationFrame(resizeFrame);
    }

    resizeFrame = requestAnimationFrame(() => {
      layoutCarousel();
      resizeFrame = null;
    });
  });
});

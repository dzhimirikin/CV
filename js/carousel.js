
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

    if (currentTitle) {
      const activeImage = images[currentIndex];

      currentTitle.textContent =
        activeImage.dataset.title ||
        activeImage.alt ||
        '';
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
        .certificate-viewer-overlay { padding: 60px 10px 12px; }
        .certificate-viewer-image { max-height: calc(100vh - 76px); }
        .certificate-viewer-close { top: 10px; right: 10px; width: 42px; height: 42px; }
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

    closeViewerButton.addEventListener('click', closeCertificateViewer);
    certificateViewer.addEventListener('click', event => {
      if (event.target === certificateViewer) closeCertificateViewer();
    });

    certificateViewer.append(viewerImage, closeViewerButton);
    document.body.appendChild(certificateViewer);
  }

  function openCertificate(img) {
    if (!img) return;
    ensureCertificateViewer();
    viewerImage.src = img.currentSrc || img.src;
    viewerImage.alt = img.alt || img.dataset.title || 'Certificate';
    certificateViewer.hidden = false;
    document.body.style.overflow = 'hidden';
    closeViewerButton.focus();
  }

  function closeCertificateViewer() {
    if (!certificateViewer || certificateViewer.hidden) return;
    certificateViewer.hidden = true;
    viewerImage.removeAttribute('src');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeCertificateViewer();
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

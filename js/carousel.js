
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

  // Открытие изображения в новой вкладке
  function openCertificate(img) {
    window.open(img.src, '_blank', 'noopener,noreferrer');
  }

  images.forEach(img => {
    img.addEventListener('click', () => {
      openCertificate(img);
    });

    img.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCertificate(img);
      }
    });
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

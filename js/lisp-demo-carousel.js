
/* ============================================================
   LISP DEMO CAROUSEL
   Independent from the Certificates carousel.
   Six-slide 3D carousel.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const root = document.getElementById('lisp-demo');
  const carousel = root?.querySelector('#lispCarousel');

  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll('img'));
  const count = slides.length;

  if (!count) return;

  const title = root.querySelector('#lispCurrentTitle');
  const description = root.querySelector('#lispCurrentDescription');
  const counter = root.querySelector('#lispCarouselCounter');
  const dotsContainer = root.querySelector('#lispDots');



  // Add vertical space between the workspace description and current command title.
  if (title) title.style.marginTop = '32px';

  // Move counter above navigation dots
  if (counter && dotsContainer) {
    counter.className = 'lisp-carousel-counter';
    counter.setAttribute('aria-live', 'polite');
    dotsContainer.insertAdjacentElement('beforebegin', counter);
  }

  let currentIndex = 0;
  let rotation = 0;

  const angle = 360 / count;

  const CENTER_SCALE = 0.90;
  const SIDE_SCALE = 0.80;
  const FAR_SCALE = 0.65;

  // Radius of the carousel
  const getRadius = () =>
    window.innerWidth < 768 ? 260 : 290;

  // Shortest distance between slides
  const getDistance = index => Math.min(
    (index - currentIndex + count) % count,
    (currentIndex - index + count) % count
  );

  // Create navigation dots
  const dots = dotsContainer
    ? slides.map((slide, index) => {

        const dot = document.createElement('button');

        dot.type = 'button';
        dot.className = 'lisp-dot';

        dot.setAttribute(
          'aria-label',
          `Show demonstration ${index + 1}`
        );

        dot.addEventListener('click', () => goTo(index));

        dotsContainer.appendChild(dot);

        return dot;
      })
    : [];

  // Counter typography matches the Certificates carousel exactly.
  if (counter) {
    counter.className = 'lisp-carousel-counter';
    counter.setAttribute('aria-live', 'polite');

    if (!document.getElementById('lisp-carousel-counter-styles')) {
      const counterStyle = document.createElement('style');
      counterStyle.id = 'lisp-carousel-counter-styles';
      counterStyle.textContent = `
        .lisp-carousel-counter {
          display: block;
          width: 100%;
          margin: 10px auto 0;
          color: #1f2933;
          font: 700 14px/1.2 Arial, Helvetica, sans-serif;
          text-align: center;
          font-variant-numeric: tabular-nums;
        }
        @media (max-width: 600px) {
          .lisp-carousel-counter { font-size: 12px; }
        }
      `;
      document.head.appendChild(counterStyle);
    }
  }

  // Elastic active indicator, independent from Certificates.
  let dotPill = null;
  let dotPillAnimation = null;

  function applyDotSizes() {
    const mobile = window.matchMedia('(max-width: 600px)').matches;
    const dotSize = mobile ? 8 : 12;

    dotsContainer.style.gap = mobile ? '9px' : '8px';

    dots.forEach(dot => {
      dot.style.position = 'relative';
      dot.style.zIndex = '2';
      dot.style.width = `${dotSize}px`;
      dot.style.height = `${dotSize}px`;
      dot.style.minWidth = `${dotSize}px`;
      dot.style.minHeight = `${dotSize}px`;
      dot.style.padding = '0';
      dot.style.borderRadius = '50%';
      dot.style.background = '#c7cdd2';
      dot.style.transform = 'none';
    });

    if (dotPill) {
      dotPill.style.width = mobile ? '18px' : '22px';
      dotPill.style.height = mobile ? '10px' : '14px';
    }
  }

  if (dotsContainer && dots.length) {
    dotsContainer.style.position = 'relative';
    dotsContainer.style.display = 'flex';
    dotsContainer.style.alignItems = 'center';
    dotsContainer.style.justifyContent = 'center';

    dotPill = document.createElement('span');
    dotPill.className = 'lisp-dot-pill';
    dotPill.setAttribute('aria-hidden', 'true');
    Object.assign(dotPill.style, {
      position: 'absolute',
      left: '0',
      top: '50%',
      width: '22px',
      height: '14px',
      borderRadius: '999px',
      background: '#1f2933',
      pointerEvents: 'none',
      zIndex: '3',
      transform: 'translate(0, -50%)',
      willChange: 'transform, width'
    });
    dotsContainer.prepend(dotPill);
    applyDotSizes();
  }

  const getPillWidth = () =>
    window.matchMedia('(max-width: 600px)').matches ? 18 : 22;

  function positionPill(dot) {
    const width = getPillWidth();
    return dot.offsetLeft + (dot.offsetWidth - width) / 2;
  }

  function animatePill(previousIndex, nextIndex) {
    if (!dotPill || !dots[nextIndex]) return;

    const width = getPillWidth();
    const dotsRect = dotsContainer.getBoundingClientRect();
    const pillRect = dotPill.getBoundingClientRect();
    const fromX = pillRect.left - dotsRect.left;
    const fromWidth = pillRect.width || width;
    const targetX = positionPill(dots[nextIndex]);

    if (dotPillAnimation) {
      dotPillAnimation.cancel();
      dotPillAnimation = null;
    }

    const finish = {
      transform: `translate(${targetX}px, -50%)`,
      width: `${width}px`
    };

    if (previousIndex === nextIndex ||
        !Number.isFinite(fromX) ||
        !fromWidth ||
        Math.abs(targetX - fromX) < 0.5 ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dotPill.style.width = finish.width;
      dotPill.style.transform = finish.transform;
      return;
    }

    const movingRight = targetX > fromX;
    const stretchedWidth = movingRight
      ? targetX + width - fromX
      : fromX + fromWidth - targetX;

    const start = {
      transform: `translate(${fromX}px, -50%)`,
      width: `${fromWidth}px`
    };

    const middle = movingRight
      ? {
          transform: `translate(${fromX}px, -50%)`,
          width: `${stretchedWidth}px`
        }
      : {
          transform: `translate(${targetX}px, -50%)`,
          width: `${stretchedWidth}px`
        };

    const frames = [
      { ...start, offset: 0, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      { ...middle, offset: 0.42, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      { ...finish, offset: 0.46 }
    ];

    const springDuration = 550;
    const springSteps = 34;
    const amplitude = 7;
    const damping = 5.5;
    const frequency = 2 * Math.PI * 4.5;

    for (let i = 1; i <= springSteps; i++) {
      const t = (i / springSteps) * (springDuration / 1000);
      const oscillation =
        amplitude * Math.exp(-damping * t) * Math.sin(frequency * t);
      const pillWidth = width + oscillation;
      const x = targetX + (width - pillWidth) / 2;

      frames.push({
        transform: `translate(${x}px, -50%)`,
        width: `${pillWidth}px`,
        offset: 0.46 + (i / springSteps) * 0.54
      });
    }

    dotPillAnimation = dotPill.animate(frames, {
      duration: 850,
      fill: 'forwards'
    });

    dotPillAnimation.onfinish = () => {
      dotPill.style.width = finish.width;
      dotPill.style.transform = finish.transform;
      dotPillAnimation.cancel();
      dotPillAnimation = null;
    };
  }

  // Update carousel
  function update(previousIndex = null) {

    carousel.style.transform = `rotateY(${rotation}deg)`;

    slides.forEach((slide, index) => {

      const distance = getDistance(index);

      const scale =
        distance === 0 ? CENTER_SCALE :
        distance === 1 ? SIDE_SCALE :
        FAR_SCALE;

      // Position relative to the active slide
      const relativeIndex =
        (index - currentIndex + count) % count;

      const relativeAngle = relativeIndex * angle;

      // Flip cards on the rear half of the carousel
      // so their content remains readable.
      const flipBack =
        relativeAngle > 90 && relativeAngle < 270;

      const faceRotation = flipBack ? 180 : 0;

      slide.style.transform =
        `rotateY(${index * angle}deg) ` +
        `translateZ(${getRadius()}px) ` +
        `rotateY(${faceRotation}deg) ` +
        `scale(${scale})`;

      slide.tabIndex = index === currentIndex ? 0 : -1;
    });

    // Update navigation dots and elastic active indicator.
    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.setAttribute('aria-current', 'true');
        dot.style.background = 'transparent';
      } else {
        dot.removeAttribute('aria-current');
        dot.style.background = '#c7cdd2';
      }
    });

    if (dotPill && dots[currentIndex]) {
      if (previousIndex !== null && previousIndex !== currentIndex) {
        animatePill(previousIndex, currentIndex);
      } else {
        if (dotPillAnimation) {
          dotPillAnimation.cancel();
          dotPillAnimation = null;
        }
        dotPill.style.width = `${getPillWidth()}px`;
        dotPill.style.transform =
          `translate(${positionPill(dots[currentIndex])}px, -50%)`;
      }
    }

    // Update title and description
    const active = slides[currentIndex];

    if (title) {
      title.textContent =
        active.dataset.title || active.alt || '';
    }

    if (description) {
      description.textContent =
        active.dataset.description || '';
    }

    // Update counter
    if (counter) {
      counter.textContent =
        `${currentIndex + 1} / ${count}`;
    }
  }

  // Navigate to a slide
  function goTo(index) {

    const previousIndex = currentIndex;
    currentIndex = (index + count) % count;

    rotation = -currentIndex * angle;

    update(previousIndex);
  }

  // Arrow controls
  window.lispRotateCarousel = direction => {

    goTo(
      currentIndex +
      (Number(direction) < 0 ? -1 : 1)
    );
  };

  // Click and keyboard navigation
  slides.forEach((slide, index) => {

    function activateSlide() {

if (index === currentIndex && slide.dataset.video) {
    window.openVideoModal(slide.dataset.video);
} else {
    goTo(index);
}

    }

    slide.addEventListener('click', activateSlide);

    slide.addEventListener('keydown', event => {

      if (event.key === 'Enter' || event.key === ' ') {

        event.preventDefault();

        activateSlide();
      }
    });
  });

  // Initial state
  update();

  // Recalculate dot sizes and positions on window resize.
  window.addEventListener('resize', () => {
    if (dotsContainer && dots.length) applyDotSizes();
    update();
  });

});

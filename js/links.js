// -------------------------------
// PWA LIGHTBOX + DESKTOP NORMAL LINKS
// -------------------------------

let currentIndex = 0;
let galleryImages = [];
let initialDistance = 0;
let currentScale = 1;

function openLightbox(url) {
  galleryImages = Array.from(
    document.querySelectorAll('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"], a[href$=".webp"], a[href$=".gif"]')
  ).map(a => a.href);

  currentIndex = galleryImages.indexOf(url);
  if (currentIndex < 0) currentIndex = 0;

  showImage(currentIndex);
}

function showImage(index) {
  const old = document.querySelector('.lightbox-overlay');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';

  const img = document.createElement('img');
  img.src = galleryImages[index];
  img.className = 'lightbox-img';
  img.style.transform = 'scale(1)';
  currentScale = 1;
  overlay.appendChild(img);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox-close';
  closeBtn.innerHTML = '&times;';
  overlay.appendChild(closeBtn);

  // SWIPE + PINCH
  let startX = 0;
  let isPinching = false;

  overlay.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      startX = e.touches[0].clientX;
      isPinching = false;
    }

    if (e.touches.length === 2) {
      isPinching = true;
      initialDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });

  overlay.addEventListener('touchmove', e => {
    if (e.touches.length === 2 && isPinching) {
      const newDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = Math.max(1, Math.min(4, (newDistance / initialDistance) * currentScale));
      img.style.transform = `scale(${scale})`;
    }
  }, { passive: true });

  overlay.addEventListener('touchend', e => {
    if (isPinching) {
      const match = img.style.transform.match(/scale\(([^)]+)\)/);
      currentScale = match ? parseFloat(match[1]) : 1;
      return;
    }

    if (!e.changedTouches || !e.changedTouches[0]) return;

    const endX = e.changedTouches[0].clientX;
    if (endX - startX > 60) prevImage();
    else if (startX - endX > 60) nextImage();
  }, { passive: true });

  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target === closeBtn) overlay.remove();
  });

  document.body.appendChild(overlay);
}

function prevImage() {
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  showImage(currentIndex);
}

function nextImage() {
  currentIndex = (currentIndex + 1) % galleryImages.length;
  showImage(currentIndex);
}

// -------------------------------
// LINK HANDLER
// -------------------------------

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

document.querySelectorAll('a[href]').forEach(link => {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#')) return;

  if (href.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
    if (isMobile) {
      // Mobile: PWA lightbox
      link.removeAttribute('target');
      link.addEventListener('click', e => {
        e.preventDefault();
        openLightbox(link.href);
      });
    } else {
      // Desktop: open in new tab
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
    return;
  }

  // External links always open in new tab
  const linkHost = new URL(link.href, location.href).host;
  if (linkHost !== location.host) {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  }
});

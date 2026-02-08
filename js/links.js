// -------------------------------
// PWA LIGHTBOX + SWIPE + PINCH-TO-ZOOM
// -------------------------------

let currentIndex = 0;
let galleryImages = [];
let initialDistance = 0;
let currentScale = 1;

function openLightbox(url) {
  galleryImages = Array.from(document.querySelectorAll('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"], a[href$=".webp"], a[href$=".gif"]'))
                       .map(a => a.href);
  currentIndex = galleryImages.indexOf(url);
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

  // Свайп для перелистывания
  let startX = 0;
  overlay.addEventListener('touchstart', e => {
    if (e.touches.length === 1) startX = e.touches[0].clientX;
    // Для pinch
    if (e.touches.length === 2) {
      initialDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  });

  overlay.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      // Pinch-to-zoom
      const newDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = Math.max(1, (newDistance / initialDistance) * currentScale);
      img.style.transform = `scale(${scale})`;
    }
  });

  overlay.addEventListener('touchend', e => {
    if (e.touches.length > 0) return; // не свайп при pinch

    const endX = e.changedTouches[0].clientX;
    if (endX - startX > 50) prevImage();
    else if (startX - endX > 50) nextImage();
  });

  overlay.addEventListener('touchcancel', () => { currentScale = parseFloat(img.style.transform.replace('scale(','').replace(')','')) || 1; });

  // Закрытие по кнопке или клику на фон
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

// Обработка ссылок
const links = document.querySelectorAll('a[href]');

links.forEach(link => {
  const href = link.getAttribute('href');
  if (href.startsWith('#')) return;

  if (href.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
    link.addEventListener('click', e => {
      e.preventDefault();
      openLightbox(href);
    });
    return;
  }

  const linkHost = new URL(href, location.href).host;
  if (linkHost !== location.host) {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  }
});
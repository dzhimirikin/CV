/* ==============================
   CERTIFICATE CAROUSEL
============================== */
document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('certCarousel');
  if (!carousel) return;

  const images = carousel.querySelectorAll('img');
  const count = images.length;
  const angle = 360 / count;
  let rotation = 0;

  function getRadius() {
    return window.innerWidth < 768 ? 260 : 420;
  }

  function layoutCarousel() {
    const radius = getRadius();
    images.forEach((img, i) => {
      img.style.transform = `rotateY(${i * angle}deg) translateZ(${radius}px)`;
    });
  }

  layoutCarousel();
  window.addEventListener('resize', layoutCarousel);

  images.forEach(img => img.addEventListener('click', () => window.open(img.src, '_blank')));

  window.rotateCarousel = function(direction) {
    rotation += direction * angle;
    carousel.style.transform = `rotateY(${rotation}deg)`;
  };
});
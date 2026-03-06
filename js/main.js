/* ==============================
   FOOTER YEAR & LOGO / BURGER
============================== */
document.addEventListener('DOMContentLoaded', () => {

  /* ==============================
     SCROLL SPEED SETTINGS
  ============================== */

  const SCROLL_TO_TOP = 800;


  // Footer year
  const yearEl = document.getElementById('year');
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

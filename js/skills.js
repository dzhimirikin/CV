/* ==============================
   SKILLS ANIMATION
============================== */
function animateSkills() {
  const skills = document.querySelectorAll('.skill');
  const triggerBottom = window.innerHeight * 0.9;

  skills.forEach(skill => {
    const skillTop = skill.getBoundingClientRect().top;
    if (skillTop < triggerBottom && !skill.classList.contains('animated')) {
      skill.classList.add('animated');

      const progress = skill.querySelector('.skill-progress');
      const percent = skill.querySelector('.skill-percent');
      const bar = skill.querySelector('.skill-bar');

      if (!progress) return;

      const target = parseInt(progress.dataset.width);

      if (bar && !bar.querySelector('.skill-track')) {
        const track = document.createElement('div');
        track.className = 'skill-track';
        bar.insertBefore(track, progress);
        track.style.width = target + '%';
      }

      progress.style.width = target + '%';

      let current = 0;
      const duration = 1200;
      const stepTime = 15;
      const increment = target / (duration / stepTime);

      const counter = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(counter);
        }
        if (percent) percent.textContent = Math.round(current) + '%';
      }, stepTime);
    }
  });
}

window.addEventListener('scroll', animateSkills);
window.addEventListener('load', animateSkills);
/* ==============================
   SKILLS ANIMATION
============================== */

function animateSkills(){

  const skills = document.querySelectorAll(".skill");

  skills.forEach(skill => {

    if (skill.classList.contains("animated")) return;

    const progress = skill.querySelector(".skill-progress");
    const percent  = skill.querySelector(".skill-percent");

    if (!progress) return;

    const rect = skill.getBoundingClientRect();

    if (rect.top > window.innerHeight * 0.9) return;

    const target = parseInt(progress.dataset.width);

    skill.classList.add("animated");

    progress.style.width = target + "%";

    let current = 0;

    const timer = setInterval(() => {

      current++;

      if (current >= target){
        current = target;
        clearInterval(timer);
      }

      if (percent){
        percent.textContent = current + "%";
      }

    },10);

  });

}

window.addEventListener("load", animateSkills);
window.addEventListener("scroll", animateSkills);

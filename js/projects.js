/* ==============================
   PROJECTS & GALLERY
============================== */
document.addEventListener('DOMContentLoaded', () => {
  const projectCards  = document.querySelectorAll('.card.project');
  const galleryImages = document.querySelectorAll('#gallery .gallery a');
  const gallerySection = document.getElementById('gallery');
  const showAllBtn = document.getElementById('showAllProjectsBtn');
  const historyBtn = document.getElementById('historyBtn');
  const backToProjectBtn = document.getElementById('backToProjectBtn');
  const yearFilter = document.getElementById('yearFilter');
  const companyFilter = document.getElementById('companyFilter');

  let currentProjectCard = null;

  const projectHistory = {
    "000_STAIR": 0,
    "001_IL": "https://ingmar.ru/en/forest",
    "002_KR": "https://ingmar.ru/en/k12",
    "003_BY": "https://www.skyscrapercity.com/threads/%D0%A1%D0%BF%D0%BE%D1%80%D1%82%D0%BA%D0%BB%D1%83%D0%B1-%C2%AB%D0%AF%D0%B2%D0%B0%D1%80%D0%B0-%D0%9D%D0%B5%D0%B2%D0%B0%C2%BB-%D0%BFoc%D1%82%D1%80oe%D0%BD.1338207/",
    "004_LAKHTA": "https://www.skyscrapercity.com/threads/%C2%AB%D0%9B%D0%B0%D1%85%D1%82%D0%B0-%D1%86%D0%B5%D0%BD%D1%82%D1%80%C2%BB-462%D0%BC-87%D1%8D-%D0%BF%D0%BE%D1%81%D1%82%D1%80%D0%BE%D0%B5%D0%BD.1338788/?post_id=74066229#post-74066229",
    "005_SILLA": 0,
    "006_MUHU": 0,
    "007_NRG": 0,
    "008_NEK": "https://www.threeplusone.ee/work/narva-estonian-school/",
    "009_NEL": "https://www.threeplusone.ee/work/narva-estonian-kindergarten/",
    "010_ML": 0,
    "011_LAAGRI": 0,
    "012_MERCEDES": 0,
    "013_GREENFL": 0,
    "014_KASTANI": "https://www.kastanikolmnurk.ee/",
    "015_TLT": 0,
    "016_LAT": 0,
    "017_JMETK": 0,
    "018_PCOOP": 0
  };

  function filterGallery(projectCode) {
    galleryImages.forEach(imgLink => {
      const href = imgLink.getAttribute('href');
      imgLink.style.display = href.startsWith(projectCode + '/') ? '' : 'none';
    });
  }

  function smoothScroll(target, duration = 800) {
    const start = window.scrollY || window.pageYOffset;
    const end = target.getBoundingClientRect().top + start - 20;
    const distance = end - start;
    let startTime = null;

    function animation(currentTime) {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = 0.5 * (1 - Math.cos(Math.PI * progress));
      window.scrollTo(0, start + distance * ease);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    requestAnimationFrame(animation);
  }

  function disableHistoryButton() {
    if (!historyBtn) return;
    historyBtn.disabled = true;
    historyBtn.classList.add('disabled');
    historyBtn.classList.remove('history');
    historyBtn.onclick = null;
  }

  function updateHistoryButton(projectCode) {
    if (!historyBtn || !projectCode || !projectHistory[projectCode]) {
      disableHistoryButton();
      return;
    }
    const url = projectHistory[projectCode];
    historyBtn.disabled = false;
    historyBtn.classList.remove('disabled');
    historyBtn.classList.add('history');
    historyBtn.onclick = () => window.open(url, '_blank');
  }

  function updateBackToProjectButton() {
    if (!backToProjectBtn) return;
    if (currentProjectCard) {
      backToProjectBtn.disabled = false;
      backToProjectBtn.classList.remove('disabled');
    } else {
      backToProjectBtn.disabled = true;
      backToProjectBtn.classList.add('disabled');
    }
  }

  projectCards.forEach(card => {
    const img = card.querySelector('img');
    if (!img) return;
    const projectCode = img.getAttribute('src').split('/')[0];
    if (projectHistory[projectCode]) card.classList.add('has-history');

    card.addEventListener('click', () => {
      projectCards.forEach(c => c.classList.remove('project-active'));
      card.classList.add('project-active');

      currentProjectCard = card;
      updateBackToProjectButton();

      filterGallery(projectCode);
      updateHistoryButton(projectCode);

      if (gallerySection) smoothScroll(gallerySection, 1000);
    });
  });

  if (showAllBtn) {
    showAllBtn.addEventListener('click', () => {
      projectCards.forEach(c => c.classList.remove('project-active'));
      galleryImages.forEach(imgLink => imgLink.style.display = '');
      updateHistoryButton(null);

      currentProjectCard = null;
      updateBackToProjectButton();
    });
  }

  if (backToProjectBtn) {
    backToProjectBtn.addEventListener('click', () => {
      if (!currentProjectCard) return;
      smoothScroll(currentProjectCard, 800);
    });
  }

  // Filter by year & company
  function filterProjects() {
    const selectedYear = yearFilter ? yearFilter.value : 'all';
    const selectedCompany = companyFilter ? companyFilter.value : 'all';

    projectCards.forEach(project => {
      const years = project.dataset.years.split(',').map(y => y.trim());
      const projectCompany = project.dataset.company;

      const yearMatch = selectedYear === 'all' || years.includes(selectedYear);
      const companyMatch = selectedCompany === 'all' || projectCompany === selectedCompany;

      project.style.display = yearMatch && companyMatch ? '' : 'none';
    });
  }

  if (yearFilter) yearFilter.addEventListener('change', filterProjects);
  if (companyFilter) companyFilter.addEventListener('change', filterProjects);
});


document.querySelectorAll('.combo-reset').forEach(btn => {
  const targetId = btn.dataset.target;
  const select = document.getElementById(targetId);

  function updateButton() {
    if (select.value === 'all') btn.classList.remove('active');
    else btn.classList.add('active');
  }

  select.addEventListener('change', updateButton);
  btn.addEventListener('click', () => {
    select.value = 'all';
    updateButton();
    select.dispatchEvent(new Event('change')); // если есть фильтрация проектов
  });

  updateButton();
});
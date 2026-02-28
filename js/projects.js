/* ==============================
   PROJECTS & GALLERY
============================= */
document.addEventListener('DOMContentLoaded', () => {
    // Карточки проектов и галерея
    const projectCards     = document.querySelectorAll('.card.project');
    const galleryImages    = document.querySelectorAll('#gallery .gallery a');
    const gallerySection   = document.getElementById('gallery');

    // Основные кнопки
    const showAllBtn       = document.getElementById('showAllProjectsBtn');
    const historyBtn       = document.getElementById('historyBtn');       // Project History
    const backToProjectBtn = document.getElementById('backToProjectBtn'); // Back to Project
    const googleMapBtn     = document.getElementById('googleMapBtn');     // Google Map
    const videoBtn         = document.getElementById('videoBtn');         // Video
    const companySiteBtn   = document.getElementById('companySiteBtn');   // Company WWW

    // Фильтры
    const yearFilter       = document.getElementById('yearFilter');
    const companyFilter    = document.getElementById('companyFilter');

    const yearCombo       = document.querySelector('.filter-item:first-child .combo-row');
    const companyCombo    = document.querySelector('.company-row .combo-row');

    let currentProjectCard = null;

    /* ==============================
       Project History Links
       (кнопка History активна только если есть ссылка)
    ============================== */
    const projectHistory = {
        "000_STAIR": 0,
        "001_IL": "https://ingmar.ru/en/forest",
        "002_KR": "https://ingmar.ru/en/k12",
        "003_BY": "https://www.skyscrapercity.com/threads/СПОРТКЛУБ-Явара-Нева-пocтpoен.1338207/",
        "004_LAKHTA": "https://www.skyscrapercity.com/threads/Лахта-центр-462м-87э-пocтpoен.1338788/?post_id=74066229#post-74066229",
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

    /* ==============================
       Video Links
       (кнопка Video активна только если есть видео)
    ============================== */
    const projectVideo = {
        "000_STAIR": 0,
        "001_IL": "https://drive.google.com/file/d/1P5N27OUiKsPKOYTi01UWlhSXRNohLcGE/view?usp=sharing",
        "002_KR": "https://drive.google.com/file/d/1tIqpg_TVqx3Yu2GuTW2yF_Y51ohHp_mb/view?usp=drive_link",
        "003_BY": "https://drive.google.com/file/d/1GvoF-6E10CFrEojiPkfNwNTajDZVA-FV/view?usp=drive_link",
        "004_LAKHTA": 0,
        "005_SILLA": 0,
        "006_MUHU": 0,
        "007_NRG": 0,
        "008_NEK": 0,
        "009_NEL": 0,
        "010_ML": 0,
        "011_LAAGRI": 0,
        "012_MERCEDES": 0,
        "013_GREENFL": 0,
        "014_KASTANI": "014_KASTANI/014_KASTANI_01 (720).mp4",
        "015_TLT": 0,
        "016_LAT": 0,
        "017_JMETK": 0,
        "018_PCOOP": 0
    };

    function updateVideoButton(projectCode) {
        if (!videoBtn || !projectCode) {
            videoBtn.disabled = true;
            videoBtn.classList.add('disabled');
            videoBtn.onclick = null;
            return;
        }

        const videoFile = projectVideo[projectCode];

        if (videoFile && videoFile !== 0) {
            videoBtn.disabled = false;
            videoBtn.classList.remove('disabled');
            videoBtn.onclick = () => window.open(videoFile, '_blank', 'width=800,height=450,resizable=yes');
        } else {
            videoBtn.disabled = true;
            videoBtn.classList.add('disabled');
            videoBtn.onclick = null;
        }
    }


    /* ==============================
       Back to Project Button
       (активна только если выбран проект)
    ============================== */
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


    /* ==============================
       Google Map Button — маркер + спутник
    ============================= */
    function updateGoogleMapButton(card) {
        if (!googleMapBtn) return;

        const lat = card ? card.dataset.lat : null;
        const lng = card ? card.dataset.lng : null;

        if (lat && lng && lat !== "0" && lng !== "0") {
            googleMapBtn.disabled = false;
            googleMapBtn.classList.remove('disabled');
            googleMapBtn.classList.add('history');

            // Открываем Google Maps с маркером и zoom=17
            googleMapBtn.onclick = () => {
                const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&zoom=17`;
                window.open(url, '_blank');
            };
        } else {
            googleMapBtn.disabled = true;
            googleMapBtn.classList.add('disabled');
            googleMapBtn.classList.remove('history');
            googleMapBtn.onclick = null;
        }
    }


    /* ==============================
       Company Website Button
       (активна только если выбранная компания имеет сайт)
    ============================== */
    function updateCompanySiteButton() {
        if (!companyFilter || !companySiteBtn) return;

        const selectedOption = companyFilter.options[companyFilter.selectedIndex];
        const url = selectedOption.dataset.site || "";

        if (url) {
            companySiteBtn.disabled = false;
            companySiteBtn.classList.remove('disabled');
            companySiteBtn.onclick = () => window.open(url, '_blank');
        } else {
            companySiteBtn.disabled = true;
            companySiteBtn.classList.add('disabled');
            companySiteBtn.onclick = null;
        }
    }

    /* ==============================
       Gallery Filter by Project
    ============================== */
    function filterGallery(projectCode) {
        galleryImages.forEach(imgLink => {
            const href = imgLink.getAttribute('href');
            imgLink.style.display = href.startsWith(projectCode + '/') ? '' : 'none';
        });
    }

    /* ==============================
       Smooth Scroll Helper
    ============================== */
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

    /* ==============================
       Sync Filter Widths
    ============================== */
    function syncFilterWidths() {
        if (!yearCombo || !companyCombo) return;
        if (window.innerWidth <= 768) {
            yearCombo.style.width = "100%";
            return;
        }
        yearCombo.style.width = companyCombo.offsetWidth + "px";
    }

    window.addEventListener('load', syncFilterWidths);
    window.addEventListener('resize', syncFilterWidths);

    /* ==============================
       Project Card Click
    ============================== */
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
            updateGoogleMapButton(card);
            updateHistoryButton(projectCode);
            updateVideoButton(projectCode);
            filterGallery(projectCode);

            if (gallerySection) smoothScroll(gallerySection, 1000);
        });
    });

    /* ==============================
       Show All Button
    ============================== */
    if (showAllBtn) {
        showAllBtn.addEventListener('click', () => {
            projectCards.forEach(c => c.classList.remove('project-active'));
            galleryImages.forEach(imgLink => imgLink.style.display = '');

            currentProjectCard = null;
            updateBackToProjectButton();
            updateGoogleMapButton(null);
            updateHistoryButton(null);
            updateVideoButton(null);
        });
    }

    /* ==============================
       Back to Project Click
    ============================== */
    if (backToProjectBtn) {
        backToProjectBtn.addEventListener('click', () => {
            if (!currentProjectCard) return;
            smoothScroll(currentProjectCard, 800);
        });
    }

    /* ==============================
       Filter Projects
    ============================== */
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

        updateCompanySiteButton();
    }

    if (yearFilter) yearFilter.addEventListener('change', () => { filterProjects(); syncFilterWidths(); });
    if (companyFilter) companyFilter.addEventListener('change', filterProjects);

    updateCompanySiteButton();
    syncFilterWidths();

    /* ==============================
       Combo Reset Buttons
    ============================== */
    document.querySelectorAll('.combo-reset').forEach(btn => {
        const targetId = btn.dataset.target;
        const select = document.getElementById(targetId);

        function updateButton() {
            btn.classList.toggle('active', select.value !== 'all');
        }

        select.addEventListener('change', updateButton);

        btn.addEventListener('click', () => {
            select.value = 'all';
            updateButton();
            select.dispatchEvent(new Event('change'));

            if (targetId === 'companyFilter' && companySiteBtn) {
                companySiteBtn.disabled = true;
                companySiteBtn.classList.add('disabled');
                companySiteBtn.onclick = null;
            }
        });

        updateButton();
    });
});

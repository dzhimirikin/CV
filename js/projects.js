/* ======================================================
    PROJECTS & GALLERY MODULE
    Handles projects selection, gallery filtering, and
    all project-related buttons with multilingual support
====================================================== */
document.addEventListener('DOMContentLoaded', () => {

    /* ==============================
       DOM Elements
    ============================== */
    const projectCards     = document.querySelectorAll('.card.project');
    const galleryImages    = document.querySelectorAll('#gallery .gallery a');
    const gallerySection   = document.getElementById('gallery');

    const showAllBtn       = document.getElementById('showAllProjectsBtn');
    const backToProjectBtn = document.getElementById('backToProjectBtn');
    const videoBtn         = document.getElementById('videoBtn');
    const googleMapBtn     = document.getElementById('googleMapBtn');
    const historyBtn       = document.getElementById('historyBtn');
    const companySiteBtn   = document.getElementById('companySiteBtn');

    const yearFilter       = document.getElementById('yearFilter');
    const companyFilter    = document.getElementById('companyFilter');

    const yearCombo        = document.querySelector('.filter-item:first-child .combo-row');
    const companyCombo     = document.querySelector('.company-row .combo-row');

    let currentProjectCard = null;
    let showingAll = false;
    let manualShowAll = false; // для пункта 2

    /* ==============================
       Multilingual Show All / Show Filtered
    ============================== */
    const showAllText = showAllBtn.dataset.showAll || showAllBtn.textContent.trim();
    const showFilteredText = showAllBtn.dataset.showFiltered || 'Show filtered';

    /* ==============================
       Project History Links
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
    ============================== */
    const projectVideo = {
        "000_STAIR": 0,
        "001_IL": "https://drive.google.com/file/d/1P5N27OUiKsPKOYTi01UWlhSXRNohLcGE/view?usp=sharing",
        "002_KR": "https://drive.google.com/file/d/1tIqpg_TVqx3Yu2GuTW2yF_Y51ohHp_mb/view?usp=drive_link",
        "003_BY": "https://drive.google.com/file/d/1GvoF-6E10CFrEojiPkfNwNTajDZVA-FV/view?usp=drive_link",
        "004_LAKHTA": "https://drive.google.com/file/d/1Iza_s50vTrs9sQGQUOUTjEMQmNGOXKT1/view?usp=sharing",
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
        if (!videoBtn || !projectCode) return disableVideoButton();
        const videoFile = projectVideo[projectCode];
        if (videoFile && videoFile !== 0) {
            videoBtn.disabled = false;
            videoBtn.classList.remove('disabled');
            videoBtn.onclick = () => window.open(videoFile, '_blank', 'width=800,height=450,resizable=yes');
        } else {
            disableVideoButton();
        }
    }

    function disableVideoButton() {
        if (!videoBtn) return;
        videoBtn.disabled = true;
        videoBtn.classList.add('disabled');
        videoBtn.onclick = null;
    }

    /* ==============================
       Back to Project
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

    backToProjectBtn?.addEventListener('click', () => {
        if (!currentProjectCard) return;
        smoothScroll(currentProjectCard, 800);
    });

    /* ==============================
       Google Map Button
    ============================== */
    function updateGoogleMapButton(card) {
        if (!googleMapBtn) return;
        const lat = card?.dataset.lat;
        const lng = card?.dataset.lng;

        if (lat && lng && lat !== "0" && lng !== "0") {
            googleMapBtn.disabled = false;
            googleMapBtn.classList.remove('disabled');
            googleMapBtn.classList.add('history');
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
       Company Site Button
    ============================== */
    function updateCompanySiteButton() {
        if (!companyFilter || !companySiteBtn) return;
        const selectedOption = companyFilter.options[companyFilter.selectedIndex];
        const url = selectedOption?.dataset.site || "";
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
       Filter Helpers
    ============================== */
    function filtersActive() {
        return (yearFilter && yearFilter.value !== 'all') ||
               (companyFilter && companyFilter.value !== 'all');
    }

    function filterGalleryImages() {
        const yearVal = yearFilter?.value || 'all';
        const companyVal = companyFilter?.value || 'all';

        galleryImages.forEach(img => {
            const projectCode = img.getAttribute('href').split('/')[0];
            const card = Array.from(projectCards).find(c => c.dataset.project === projectCode);
            if (!card) return;

            if (showingAll) {
                img.style.display = '';
            } else if (currentProjectCard) {
                img.style.display = (projectCode === currentProjectCard.dataset.project) ? '' : 'none';
            } else {
                const yearMatch = yearVal === 'all' || card.dataset.years.split(',').includes(yearVal);
                const companyMatch = companyVal === 'all' || card.dataset.company === companyVal;
                img.style.display = (yearMatch && companyMatch) ? '' : 'none';
            }
        });
    }

    function updateButtons() {
        // Show All / Show Filtered
        if (manualShowAll && showAllBtn.disabled) {
            showAllBtn.textContent = showAllText; // пункт 2
        } else {
            showAllBtn.textContent = showingAll ? showFilteredText : showAllText;
            showAllBtn.disabled = currentProjectCard ? false : !filtersActive();
        }

        // Other buttons
        updateBackToProjectButton();
        updateVideoButton(currentProjectCard?.dataset.project);
        updateGoogleMapButton(currentProjectCard);
        updateHistoryButton(currentProjectCard?.dataset.project);
    }

    /* ==============================
       Show All / Show Filtered Click
    ============================== */
    showAllBtn?.addEventListener('click', () => {
        if (currentProjectCard && !filtersActive()) {
            // пункт 2: выбран проект, фильтры пусты
            projectCards.forEach(c => c.classList.remove('project-active'));
            currentProjectCard = null;
            showingAll = false;
            manualShowAll = true;

            filterGalleryImages();
            showAllBtn.disabled = true;
            updateBackToProjectButton();
            disableVideoButton();
            updateGoogleMapButton(null);
            disableHistoryButton();
        } else {
            // обычная логика Show All / Show Filtered
            manualShowAll = false;
            showingAll = !showingAll;
            if (showingAll) currentProjectCard = null;
            projectCards.forEach(c => c.classList.remove('project-active'));
            filterGalleryImages();
            updateButtons();
        }
    });

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
            showingAll = false;
            manualShowAll = false;

            filterGalleryImages();
            updateButtons();

            smoothScroll(gallerySection, 1000);
        });
    });

    /* ==============================
       Project Filters
    ============================== */
    function filterProjects() {
        const selectedYear = yearFilter?.value || 'all';
        const selectedCompany = companyFilter?.value || 'all';

        // сбрасываем Show All, чтобы фильтр применился сразу
        showingAll = false;
        manualShowAll = false;

        projectCards.forEach(project => {
            const years = project.dataset.years.split(',').map(y => y.trim());
            const projectCompany = project.dataset.company;

            const yearMatch = selectedYear === 'all' || years.includes(selectedYear);
            const companyMatch = selectedCompany === 'all' || projectCompany === selectedCompany;

            project.style.display = yearMatch && companyMatch ? '' : 'none';
        });

        updateCompanySiteButton();
        filterGalleryImages();
        updateButtons();
    }

    yearFilter?.addEventListener('change', () => { filterProjects(); syncFilterWidths(); });
    companyFilter?.addEventListener('change', filterProjects);

    /* ==============================
       Smooth Scroll Helper
    ============================== */
    function smoothScroll(target, duration = 800) {
        if (!target) return;
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
        });

        updateButton();
    });

    /* ==============================
       Initial Setup
    ============================== */
    filterProjects();
    filterGalleryImages();
    updateButtons();
    syncFilterWidths();
});

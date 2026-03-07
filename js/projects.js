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

/* ==============================
   Project paragraph markers
============================== */

const lang = document.documentElement.lang;

const labels = {
    ru: ["Особенности", "Роль"],
    en: ["Project features", "Role"],
    et: ["Projekti eripära", "Roll"]
};

projectCards.forEach(card => {

    let firstMarkerFound = false;

    card.querySelectorAll("p").forEach(p => {

        const text = p.textContent.trim();

        labels[lang]?.forEach(label => {

            if (text.startsWith(label)) {

                p.classList.add("project-marker");

                /* делаем ключевое слово полужирным */
                p.innerHTML = p.innerHTML.replace(label, `<strong>${label}</strong>`);

                if (!firstMarkerFound) {
                    p.classList.add("marker-start");
                    firstMarkerFound = true;
                }

            }

        });

    });

});
   
    /* ==============================
       Profile Logos (auto from data attributes)
    ============================== */

    const profileLogos = {

        "Schüco": "schuco.png",
        "Reynaers": "reynaers.png",
        "Aluprof": "aluprof.png",
        "Alutech": "alutech.png",
        "ALMO": "almo.png",
        "Custom": "custom.png"

    };


    projectCards.forEach(card => {

        const prof1 = card.dataset.prof_1;
        const prof2 = card.dataset.prof_2;
        const prof3 = card.dataset.prof_3;

        const systemsBlock = document.createElement('div');
        systemsBlock.className = 'project-systems';

        [prof1, prof2, prof3].forEach(system => {

            if (system && system !== "0") {

            const logoFile = profileLogos[system];

            if (!logoFile) return;

            const img = document.createElement('img');

            img.src = `LinksLogo/${logoFile}`;
            img.alt = system;

            systemsBlock.appendChild(img);
            }

        });

        const firstImg = card.querySelector('img');

        if (firstImg)
            card.insertBefore(systemsBlock, firstImg);

    });
    const galleryImages    = document.querySelectorAll('#gallery .gallery a');
    const gallerySection   = document.getElementById('gallery');

    const showAllBtn       = document.getElementById('showAllProjectsBtn');
    const backToProjectBtn = document.getElementById('backToProjectBtn');
    const videoBtn         = document.getElementById('videoBtn');
    const googleMapBtn     = document.getElementById('googleMapBtn');
    const historyBtn       = document.getElementById('historyBtn');
    const companySiteBtn   = document.getElementById('companySiteBtn');
    const profileSiteBtn   = document.getElementById('profileSiteBtn');

    const yearFilter       = document.getElementById('yearFilter');
    const profileFilter    = document.getElementById('profileFilter');
    const companyFilter    = document.getElementById('companyFilter');

    const yearCombo        = document.querySelector('.filter-item:first-child .combo-row');
    const companyCombo     = document.querySelector('.company-row .combo-row');

    /* ===== NEW ===== */
    const projectsCounter  = document.getElementById('projectsCounter');

    let currentProjectCard = null;
    let lastFocusedProject = null;
    let showingAll = false;

    /* ==============================
       SCROLL SPEED SETTINGS
    ============================== */

    const SCROLL_TO_GALLERY = 800;
    const SCROLL_TO_PROJECT = 600;


    /* ==============================
       Multilingual Show All / Show Filtered
    ============================== */
    const showAllText      = showAllBtn.dataset.showAll || showAllBtn.textContent.trim();
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


    /* ==============================
       Mark projects with history
    ============================== */

    projectCards.forEach(card => {

        const id = card.dataset.project;

        if (projectHistory[id] && projectHistory[id] !== 0) {
            card.classList.add("has-history");
        }

    });

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

    /* ==============================
       Utility Functions
    ============================== */

    function disableButton(btn) {
        if (!btn) return;
        btn.disabled = true;
        btn.classList.add('disabled');
        btn.onclick = null;
    }

    function enableButton(btn, clickHandler) {
        if (!btn) return;
        btn.disabled = false;
        btn.classList.remove('disabled');
        btn.onclick = clickHandler || null;
    }

    function filtersActive() {
        return (
            (yearFilter && yearFilter.value !== 'all') ||
            (profileFilter && profileFilter.value !== 'all') ||
            (companyFilter && companyFilter.value !== 'all')
        );
    }

    /* ===== NEW ===== */
    function updateProjectsCounter() {

        if (!projectsCounter) return;

        const totalProjects = projectCards.length;

        const visibleProjects = Array.from(projectCards)
            .filter(card => card.style.display !== 'none')
            .length;

        projectsCounter.textContent = `${visibleProjects}/${totalProjects}`;
    }

    /* ==============================
       Update All Buttons
    ============================== */
    function updateButtons() {

        const noActiveFiltersOrProject = !currentProjectCard && !filtersActive();

        showAllBtn.textContent = showingAll ? showFilteredText : showAllText;

        if (noActiveFiltersOrProject) {
            disableButton(showAllBtn);
        } else {
            enableButton(showAllBtn, () => {

                showingAll = !showingAll;

                if (showingAll) {
                    lastFocusedProject = currentProjectCard;
                    currentProjectCard = null;
                    projectCards.forEach(c => c.classList.remove('project-active'));
                } else {
                    currentProjectCard = lastFocusedProject;
                    projectCards.forEach(c => c.classList.remove('project-active'));

                    if (currentProjectCard)
                        currentProjectCard.classList.add('project-active');
                }

                filterGalleryImages();
                updateButtons();
            });
        }

        if (currentProjectCard) {
            enableButton(backToProjectBtn, () => smoothScroll(currentProjectCard, SCROLL_TO_PROJECT));
        } else {
            disableButton(backToProjectBtn);
        }

        if (companyFilter && companySiteBtn) {

            const selectedOption = companyFilter.options[companyFilter.selectedIndex];
            const url = selectedOption?.dataset.site || "";

            if (url) {
                enableButton(companySiteBtn, () => window.open(url, '_blank'));
            } else {
                disableButton(companySiteBtn);
            }
        }

        if (profileFilter && profileSiteBtn) {

            const selectedOption = profileFilter.options[profileFilter.selectedIndex];
            const url = selectedOption?.dataset.site || "";

            if (url) {
                enableButton(profileSiteBtn, () => window.open(url, '_blank'));
            } else {
                disableButton(profileSiteBtn);
            }
        }

        if (currentProjectCard) {
            updateVideoButton(currentProjectCard.dataset.project);
            updateGoogleMapButton(currentProjectCard);
            updateHistoryButton(currentProjectCard.dataset.project);
        } else {
            disableButton(videoBtn);
            disableButton(googleMapBtn);
            disableButton(historyBtn);
        }
    }

    function updateHistoryButton(projectCode) {

        if (!historyBtn || !projectCode || !projectHistory[projectCode]) {
            disableButton(historyBtn);
            return;
        }

        enableButton(historyBtn, () => window.open(projectHistory[projectCode], '_blank'));
        historyBtn.classList.add('history');
    }

    function updateVideoButton(projectCode) {

        if (!videoBtn || !projectCode) {
            disableButton(videoBtn);
            return;
        }

        const videoFile = projectVideo[projectCode];

        if (videoFile && videoFile !== 0) {
            enableButton(videoBtn, () => window.open(videoFile, '_blank', 'width=800,height=450,resizable=yes'));
        } else {
            disableButton(videoBtn);
        }
    }

    function updateGoogleMapButton(card) {

        if (!googleMapBtn) return;

        const lat = card?.dataset.lat;
        const lng = card?.dataset.lng;

        if (lat && lng && lat !== "0" && lng !== "0") {

            enableButton(googleMapBtn, () => {

                const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&zoom=17`;
                window.open(url, '_blank');

            });

            googleMapBtn.classList.add('history');

        } else {
            disableButton(googleMapBtn);
        }
    }

    /* ==============================
       Gallery Filter
    ============================== */
function filterGalleryImages() {

    galleryImages.forEach(img => {

        const projectCode = img.getAttribute('href').split('/')[0];

        const card = Array.from(projectCards).find(
            c => c.dataset.project === projectCode
        );

        if (!card) return;

        if (showingAll) {

            img.style.display = '';

        } else if (currentProjectCard) {

            img.style.display =
                (projectCode === currentProjectCard.dataset.project)
                    ? ''
                    : 'none';

        } else {

            /* ВАЖНО: проверяем видимость карточки */

            img.style.display =
                card.style.display === 'none'
                    ? 'none'
                    : '';
        }

    });

}

    /* ==============================
       Project Click
    ============================== */
    projectCards.forEach(card => {

        const img = card.querySelector('img');

        if (!img) return;

        if (projectHistory[img.getAttribute('src').split('/')[0]])
            card.classList.add('has-history');

        card.addEventListener('click', () => {

            projectCards.forEach(c =>
                c.classList.remove('project-active')
            );

            card.classList.add('project-active');

            currentProjectCard = card;
            lastFocusedProject = card;
            showingAll = false;

            filterGalleryImages();
            updateButtons();

            smoothScroll(gallerySection, SCROLL_TO_GALLERY);
        });
    });

    /* ==============================
       Project Filters
    ============================== */
    function filterProjects() {

        const selectedYear = yearFilter?.value || 'all';
        const selectedProfile = profileFilter?.value || 'all';
        const selectedCompany = companyFilter?.value || 'all';

        currentProjectCard = null;
        showingAll = false;

        projectCards.forEach(project => {

            const years =
                project.dataset.years.split(',').map(y => y.trim());

            const company = project.dataset.company;

            const yearMatch =
                selectedYear === 'all' || years.includes(selectedYear);

    const prof1 = project.dataset.prof_1;
    const prof2 = project.dataset.prof_2;
    const prof3 = project.dataset.prof_3;

    const profileMatch =
        selectedProfile === 'all' ||
        selectedProfile === prof1 ||
        selectedProfile === prof2 ||
        selectedProfile === prof3;

    const companyMatch =
        selectedCompany === 'all' || company === selectedCompany;

    project.style.display =
        (yearMatch && companyMatch && profileMatch)
            ? ''
            : 'none';

            project.classList.remove('project-active');
        });

        filterGalleryImages();
        updateButtons();
        updateProjectsCounter(); /* NEW */
    }

    yearFilter?.addEventListener('change', () => {
        filterProjects();
        syncFilterWidths();
    });

    profileFilter?.addEventListener('change', filterProjects);
    companyFilter?.addEventListener('change', filterProjects);

    /* ==============================
       Smooth Scroll
    ============================== */
    function smoothScroll(target, duration = 800) {

        if (!target) return;

        const start = window.scrollY || window.pageYOffset;
        const end = target.getBoundingClientRect().top + start - 20;
        const distance = end - start;

        let startTime = null;

        function animation(currentTime) {

            if (!startTime)
                startTime = currentTime;

            const timeElapsed = currentTime - startTime;

            const progress =
                Math.min(timeElapsed / duration, 1);

            const ease =
                0.5 * (1 - Math.cos(Math.PI * progress));

            window.scrollTo(
                0,
                start + distance * ease
            );

            if (timeElapsed < duration)
                requestAnimationFrame(animation);
        }

        requestAnimationFrame(animation);
    }

    /* ==============================
       Sync Filter Widths
    ============================== */
    function syncFilterWidths() {

        if (!yearCombo || !companyCombo) return;

        yearCombo.style.width =
            window.innerWidth <= 768
                ? "100%"
                : companyCombo.offsetWidth + "px";
    }

    window.addEventListener('load', syncFilterWidths);
    window.addEventListener('resize', syncFilterWidths);

    /* ==============================
       Combo Reset Buttons
    ============================== */
    document.querySelectorAll('.combo-reset').forEach(btn => {

        const targetId = btn.dataset.target;
        const select = document.getElementById(targetId);

        if (!select) return;

        btn.addEventListener('click', () => {

            select.value = 'all';

            filterProjects();
        });
    });

    /* ==============================
       Initial Setup
    ============================== */
    filterProjects();
    filterGalleryImages();
    updateButtons();
    syncFilterWidths();
    updateProjectsCounter(); /* NEW */

});





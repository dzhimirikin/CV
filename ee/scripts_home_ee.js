document.addEventListener("DOMContentLoaded", function () {
    // Reposiidi nimi (õigete teede määramine GitHub Pages'is)
    const repoName = window.location.pathname.includes("/CV/") ? "CV" : "";

    // Määrame teed reposiidi arvestusega
    const languageRoutes = {
        "ru": `/${repoName}/ru/index_ru.html`,
        "en": `/${repoName}/en/index_en.html`,
        "ee": `/${repoName}/ee/index_ee.html`
    };

    // Keele vahetaja sündmuse töötleja
    document.querySelector(".language-switcher").addEventListener("click", function (event) {
        const target = event.target.closest("a");
        if (target) {
            event.preventDefault(); // Takistame lingi tavalist käitumist

            // Saame valitud keele
            const lang = target.getAttribute("data-lang");
            if (lang) {
                // Salvestame valitud keele localStorage'i
                localStorage.setItem("selectedLanguage", lang);

                // Liigume soovitud keele failile, arvestades reposiiti
                const targetPage = languageRoutes[lang] || languageRoutes["en"];
                window.location.href = targetPage;
            }
        }
    });

    // Modaalaken: parooli seadistamine ja töötlemine
    const correctPassword = "Qazwsx"; // Määrake oma parool
    const modal = document.getElementById("password-modal");
    const btn = document.getElementById("show-modal-btn");
    const closeBtn = document.getElementById("submit-password");
    const errorMessage = document.getElementById("error-message");
    const downloadLink = document.getElementById("download-link"); // Allalaadimise link

    // Avage modaalaken nupu klõpsamisel
    btn.onclick = function() {
        modal.style.display = "flex";  // Kuvame modaalakna
        errorMessage.textContent = ""; // Eemaldame vea sõnumi uuesti avamisel
        clearInputs(); // Kustutame kõik sisestusväljad
        inputs[0].focus(); // Asetame fookuse esimesele sisestusväljale
    };

    // Sulgege modaalaken kinnitamisnupu klõpsamisel
    closeBtn.onclick = function() {
        const enteredPassword = Array.from(document.querySelectorAll('.password-input'))
                                      .map(input => input.value)
                                      .join(''); // Kogume sisestatud parooli

        // Kontrollime sisestatud parooli
        if (enteredPassword === correctPassword) {
            modal.style.display = "none";  // Sulgeme modaalakna

            // Alustame faili allalaadimist
            downloadLink.click();  // Klikkame programmeeritult peidetud lingil
        } else {
            errorMessage.textContent = "Vale parool! Proovige uuesti.";  // Kui parool on vale
            clearInputs(); // Kustutame kõik sisestusväljad
            inputs[0].focus(); // Asetame fookuse esimesele sisestusväljale
        }
    };

    // Sulgege modaalaken, kui klõpsate väljaspool akent
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    // Saame kõik parooli sisestusväljad
    const inputs = document.querySelectorAll('.password-input');

    // Funktsioon, mis liigutab fookuse järgmisele sisestusväljale
    function moveFocus(event) {
        // Kui on sisestatud tähemärk (sisendi pikkus = 1)
        if (event.target.value.length === 1) {
            // Leiame järgmise sisestusvälja
            const nextInput = event.target.nextElementSibling;
            // Kui järgmine element eksisteerib, asetame fookuse sellele
            if (nextInput) {
                nextInput.focus();
            }
        }
    }

    // Määrame sündmuse töötleja kõikidele sisestusväljadele
    inputs.forEach(input => {
        input.addEventListener('input', moveFocus);
    });

    // Funktsioon, mis kustutab kõik sisestusväljad
    function clearInputs() {
        inputs.forEach(input => {
            input.value = ''; // Kustutame väljade väärtused
        });
    }

    // Dünaamiliselt uuendame aasta jaluses
    document.getElementById("year").textContent = new Date().getFullYear();
});
document.addEventListener("DOMContentLoaded", function () {
    function animateProgressBars() {
        const progressBars = document.querySelectorAll(".progress-bar .fill");

        progressBars.forEach((bar) => {
            const targetWidth = parseInt(bar.getAttribute("data-width"), 10); // Eesmärgi laius
            const progressValue = bar.closest(".progress-bar").querySelector(".progress-value"); // Numbrid baari kõrval

            let startTime = null;
            const duration = 2000; // Animatsiooni kestus millisekundites

            function animate(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime; // Möödunud aeg
                const progress = Math.min(elapsed / duration, 1); // Interpolatsioon vahemikus 0 kuni 1

                // Praegune baari laius (täpsusega)
                const currentWidth = progress * targetWidth;
                bar.style.width = `${currentWidth}%`; // Seame laiuse

                // Uuendame numbrilist väärtust ja muudame selle värvi
                const currentPercentage = Math.floor(currentWidth);
                progressValue.textContent = `${currentPercentage}%`; // Uuendame teksti

                // Vahepealsed numbrid (enne 100% saavutamist)
                if (progress < 1) {
                    progressValue.style.color = 'skyblue'; // Taevasinine värv vahepealsete väärtuste jaoks
                }
                // Lõpliku väärtuse värv
                if (progress === 1) {
                    progressValue.style.color = 'white'; // Valge värv lõpliku väärtuse jaoks
                }

                // Kui progress ei ole veel eesmärgini jõudnud, jätkame animatsiooni
                if (progress < 1) {
                    requestAnimationFrame(animate); // Käivitame järgmise animatsiooni kaadri
                }
            }

            // Animatsiooni käivitamine
            requestAnimationFrame(animate);
        });
    }

    animateProgressBars(); // Käivitame animatsiooni lehe laadimisel
});


document.getElementById("year").textContent = new Date().getFullYear();
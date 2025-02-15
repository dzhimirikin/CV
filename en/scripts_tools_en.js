window.onload = function () {
    function animateProgressBars() {
        const progressBars = document.querySelectorAll(".progress-bar .fill");

        if (progressBars.length === 0) {
            console.warn("Прогресс-бары не найдены!");
            return;
        }

        progressBars.forEach((bar) => {
            const targetWidth = parseInt(bar.getAttribute("data-width"), 10);
            if (isNaN(targetWidth)) {
                console.error("Неверное значение data-width у элемента:", bar);
                return;
            }

            const progressValue = bar.closest(".progress-bar").querySelector(".progress-value");

            let startTime = null;
            const duration = 2000;

            function animate(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const currentWidth = progress * targetWidth;
                bar.style.width = `${currentWidth}%`;

                const currentPercentage = Math.floor(currentWidth);
                if (progressValue) {
                    progressValue.textContent = `${currentPercentage}%`;
                    progressValue.style.color = progress < 1 ? 'skyblue' : 'white';
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }

            requestAnimationFrame(animate);
        });
    }

    animateProgressBars();
};


document.getElementById("year").textContent = new Date().getFullYear();
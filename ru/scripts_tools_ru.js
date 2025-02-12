document.addEventListener("DOMContentLoaded", function () {
    function animateProgressBars() {
        const progressBars = document.querySelectorAll(".progress-bar .fill");

        progressBars.forEach((bar) => {
            const targetWidth = parseInt(bar.getAttribute("data-width"), 10); // Целевая ширина
            const progressValue = bar.closest(".progress-bar").querySelector(".progress-value"); // Цифры рядом с баром

            let startTime = null;
            const duration = 2000; // Длительность анимации в миллисекундах

            function animate(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime; // Прошедшее время
                const progress = Math.min(elapsed / duration, 1); // Интерполяция от 0 до 1

                // Текущая ширина прогресс-бара (с высокой точностью)
                const currentWidth = progress * targetWidth;
                bar.style.width = `${currentWidth}%`; // Устанавливаем ширину

                // Обновляем числовое значение и меняем его цвет
                const currentPercentage = Math.floor(currentWidth);
                progressValue.textContent = `${currentPercentage}%`; // Обновляем текст

                // Цвет промежуточных цифр (до достижения 100%)
                if (progress < 1) {
                    progressValue.style.color = 'skyblue'; // Голубой цвет для промежуточных значений
                }
                // Цвет конечного значения
                if (progress === 1) {
                    progressValue.style.color = 'white'; // Белый цвет для конечного значения
                }

                // Если прогресс еще не достиг цели, продолжаем анимацию
                if (progress < 1) {
                    requestAnimationFrame(animate); // Запускаем следующий кадр анимации
                }
            }

            // Запуск анимации
            requestAnimationFrame(animate);
        });
    }

    animateProgressBars(); // Запуск анимации при загрузке страницы
});


document.getElementById("year").textContent = new Date().getFullYear();
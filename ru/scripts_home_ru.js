document.addEventListener("DOMContentLoaded", function () {
    // Название репозитория (для корректных путей на GitHub Pages)
    const repoName = window.location.pathname.includes("/CV/") ? "CV" : "";

    // Определяем маршруты с учетом репозитория
    const languageRoutes = {
        "ru": `/${repoName}/ru/index_ru.html`,
        "en": `/${repoName}/en/index_en.html`,
        "ee": `/${repoName}/ee/index_ee.html`
    };

    // Обработчик для переключения языка
    document.querySelector(".language-switcher").addEventListener("click", function (event) {
        const target = event.target.closest("a");
        if (target) {
            event.preventDefault(); // Предотвращаем стандартный переход по ссылке

            // Получаем выбранный язык
            const lang = target.getAttribute("data-lang");
            if (lang) {
                // Сохраняем выбранный язык в localStorage
                localStorage.setItem("selectedLanguage", lang);

                // Переходим на страницу с нужным языковым файлом с учетом репозитория
                const targetPage = languageRoutes[lang] || languageRoutes["en"];
                window.location.href = targetPage;
            }
        }
    });

    // Модальное окно: настройка пароля и его обработка
    const correctPassword = "Qazwsx"; // Укажите ваш пароль
    const modal = document.getElementById("password-modal");
    const btn = document.getElementById("show-modal-btn");
    const closeBtn = document.getElementById("submit-password");
    const errorMessage = document.getElementById("error-message");
    const downloadLink = document.getElementById("download-link"); // Ссылка для скачивания

    // Открытие модального окна при клике на кнопку
    btn.onclick = function() {
        modal.style.display = "flex";  // Отображаем модальное окно
        errorMessage.textContent = ""; // Очищаем сообщение об ошибке при повторном открытии
        clearInputs(); // Очищаем все поля ввода
        inputs[0].focus(); // Устанавливаем фокус на первое поле ввода
    };

    // Закрытие модального окна при нажатии на кнопку подтверждения
    closeBtn.onclick = function() {
        const enteredPassword = Array.from(document.querySelectorAll('.password-input'))
                                      .map(input => input.value)
                                      .join(''); // Собираем введенный пароль

        // Проверяем введенный пароль
        if (enteredPassword === correctPassword) {
            modal.style.display = "none";  // Закрываем модальное окно

            // Запускаем скачивание файла
            downloadLink.click();  // Программно нажимаем на скрытую ссылку
        } else {
            errorMessage.textContent = "Неверный пароль! Попробуйте снова.";  // Если пароль неверный
            clearInputs(); // Очищаем все поля ввода
            inputs[0].focus(); // Устанавливаем фокус на первое поле ввода
        }
    };

    // Закрытие модального окна при клике вне его области
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    // Получаем все поля ввода пароля
    const inputs = document.querySelectorAll('.password-input');

    // Функция для перемещения фокуса на следующее поле
    function moveFocus(event) {
        // Если введен символ (длина введенного значения = 1)
        if (event.target.value.length === 1) {
            // Находим следующий элемент ввода
            const nextInput = event.target.nextElementSibling;
            // Если следующий элемент существует, устанавливаем на него фокус
            if (nextInput) {
                nextInput.focus();
            }
        }
    }

    // Назначаем обработчик события для всех полей ввода
    inputs.forEach(input => {
        input.addEventListener('input', moveFocus);
    });

    // Функция для очистки всех полей ввода
    function clearInputs() {
        inputs.forEach(input => {
            input.value = ''; // Очищаем значение поля
        });
    }

    // Динамическое обновление года в футере
    document.getElementById("year").textContent = new Date().getFullYear();
});
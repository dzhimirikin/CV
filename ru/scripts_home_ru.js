// Дожидаемся полной загрузки документа
document.addEventListener("DOMContentLoaded", function () {
  // Определение названия репозитория для корректных путей на GitHub Pages
  const repoName = window.location.pathname.includes("/CV/") ? "CV" : "";

  // Маршруты для различных языковых версий сайта
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

      const lang = target.getAttribute("data-lang");
      if (lang) {
        localStorage.setItem("selectedLanguage", lang); // Сохраняем выбранный язык в localStorage
        const targetPage = languageRoutes[lang] || languageRoutes["en"]; // Получаем нужный маршрут
        window.location.href = targetPage; // Переходим на выбранную страницу
      }
    }
  });

  // Правильный пароль для доступа
  const correctPassword = "Qazwsx";
  const modal = document.getElementById("password-modal"); // Получаем модальное окно
  const btn = document.getElementById("show-modal-btn"); // Кнопка для открытия модального окна
  const closeBtn = document.getElementById("submit-password"); // Кнопка для подтверждения пароля
  const errorMessage = document.getElementById("error-message"); // Сообщение об ошибке
  const downloadLink = document.getElementById("download-link"); // Ссылка для скачивания

  // Открытие модального окна при клике на кнопку
  btn.onclick = function() {
    modal.style.display = "flex"; // Отображаем модальное окно
    errorMessage.textContent = ""; // Очищаем сообщение об ошибке при повторном открытии
    clearInputs(); // Очищаем все поля ввода
    inputs[0].focus(); // Устанавливаем фокус на первое поле ввода
  };

  // Закрытие модального окна при нажатии на кнопку подтверждения
  closeBtn.onclick = function() {
    const enteredPassword = Array.from(document.querySelectorAll('.password-input'))
                             .map(input => input.value)
                             .join(''); // Получаем введенный пароль

    // Проверяем введенный пароль
    if (enteredPassword === correctPassword) {
      modal.style.display = "none"; // Закрываем модальное окно
      downloadLink.click(); // Запускаем скачивание файла
    } else {
      errorMessage.textContent = "Неверный пароль! Попробуйте снова."; // Выводим сообщение об ошибке
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
    if (event.target.value.length === 1) {
      const nextInput = event.target.nextElementSibling;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  // Назначаем обработчик события для всех полей ввода
  inputs.forEach(input => {
    input.addEventListener('input', moveFocus);
  });

  // Функция для очистки всех полей ввода пароля
  function clearInputs() {
    inputs.forEach(input => {
      input.value = '';
    });

    // Динамическое обновление года в футере
    document.getElementById("year").textContent = new Date().getFullYear();
});

document.addEventListener("DOMContentLoaded", function() {
    // Название репозитория (для корректных путей на GitHub Pages)
    const repoName = window.location.pathname.includes("/CV/") ? "CV" : "";

    const projects = [
        {
            year: "2012",
            project: "Trepp, TKR Cosmos, Peterburi",
            client: "OAO EUROSTROYSTANDARD UK/Peterburi",
            description: `OÜ ELEMENTFACADE/Moskva<br><br>Fassaadi klaasimine, vitraažid ja seinad.`,
            galleryLink: `/${repoName}/ee/Project0_ee.html`
        },
        // Другие проекты
    ];

    const buttons = document.querySelectorAll('.details-btn');
    
    buttons.forEach((button, index) => {
        button.addEventListener('click', function() {
            const project = projects[index];

            const popup = document.createElement('div');
            popup.classList.add('popup');

            const popupContent = document.createElement('div');
            popupContent.classList.add('popup-content');

            const descriptionText = document.createElement('div');
            descriptionText.classList.add('description-text');
            descriptionText.innerHTML = project.description;

            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-container');

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Tühista';
            cancelButton.classList.add('cancel-btn');
            cancelButton.onclick = function() {
                popup.classList.remove('show');
                setTimeout(() => popup.remove(), 300); // Удаляем попап после анимации
            };

            const galleryButton = document.createElement('button');
            galleryButton.textContent = 'Galerii';
            galleryButton.classList.add('gallery-btn');
            galleryButton.onclick = function() {
                window.location.href = project.galleryLink;
            };

            buttonContainer.appendChild(cancelButton);
            buttonContainer.appendChild(galleryButton);

            popupContent.appendChild(descriptionText);
            popupContent.appendChild(buttonContainer);
            popup.appendChild(popupContent);

            document.body.appendChild(popup);

            // Добавляем класс для показа попапа с анимацией
            setTimeout(() => popup.classList.add('show'), 10);

            popup.addEventListener('click', function(e) {
                if (e.target === popup) {
                    popup.classList.remove('show');
                    setTimeout(() => popup.remove(), 300); // Удаляем попап после анимации
                }
            });
        });
    });
});


document.getElementById("year").textContent = new Date().getFullYear();
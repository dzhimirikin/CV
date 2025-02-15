document.addEventListener("DOMContentLoaded", function() {
    // Название репозитория (для корректных путей на GitHub Pages)
    const repoName = window.location.pathname.includes("/CV/") ? "CV" : "";

    const projects = [
        {
            year: "2012",
            project: "Лестница,ТРК Космос, Санкт-Петербург",
            client: "ЗАО ЕВРОСТРОЙСТАНДАРТ УК/Санкт-Петербург",
            description: `ЗАО ЕВРОСТРОЙСТАНДАРТ УК/Санкт-Петербург<br><br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/ru/Project0_ru.html`
        },
        {
            year: "2014",
            project: "Lesnaya Formula Residence",
            client: "ООО ЭЛЕМЕНТФАСАД/Москва",
            description: `ООО ЭЛЕМЕНТФАСАД/Москва<br><br>Индивидуальный жилой дом (~ 4 000 м2).<br><br>Вентилируемые фасады (3D керамика NBK CERAMIC, подсистема собственной разработки, алюминий), остекление (Reynaers), роллставни заполнены сеткой из нержавеющей стали).<br><br>Особенности проекта - прецизионная сборка фасадов с применением выравнивающих "крестов" собственной разработки.<br><br>Применение алюмодеревянной системы Reynaers для фасадных дверей. Высота дверей 4,0 метра.<br><br>Роль в проекте: Участие в выпуске АР, КМ, КМД. Участие в пусконаладке и сдаче`,
        galleryLink: `/${repoName}/ru/Project1_ru.html`
        },
        {
            year: "2014",
            project: "Apart-Hotel/Residence K12, Peterburi",
            client: "ООО ЭЛЕМЕНТФАСАД/Москва",
            description: `ООО ЭЛЕМЕНТФАСАД/Москва<br><br>Апарт-отель (~4 000 м2), Санкт-Петербург, Крестовский проспект, д. 12, стр. 2, лит. А. Вентилируемые фасады (объемная керамика NBK CERAMIC, подсистема - нержавеющая сталь OLMA, + подсистема собственной разработки (алюминий), гнутые элементы - лист EUROMAX), остекление (Reynaers, профили собственной экструзии).<br><br>Особенности объекта: использован кассетный монтаж вентилируемого фасада (собственная подсистема).<br><br>Роль в проекте: Участие в выпуске АР, КМ, КМД. Участие в пусконаладке и сдаче`,
        galleryLink: `/${repoName}/ru/Project2_ru.html`
        },
        {
            year: "2016",
            project: "Jahtklubi Yavara-Neva, Bychiy saar, Peterburi",
            client: "ООО ЭЛЕМЕНТФАСАД/Москва",
            description: `ООО ЭЛЕМЕНТФАСАД/Москва<br><br>Многофункциональный спортивно-развлекательный комплекс и яхт-клуб «Явара-Нева» (~10 000 м2), Бычий Остров, Санкт-Петербург. <br><br>Вентилируемые фасады (крупноблочные кассеты - алюминиевый лист NOVELIS, нержавеющая сталь СМК подсистема), остекление (Reynaers, ALMO, собственные экструзионные профили).<br><br>Роль в проекте: Участие в выпуске АР, КМ, КМД. Участие в пусконаладке и сдаче`,
        galleryLink: `/${repoName}/ru/Project3_ru.html`
        },
        {
            year: "2018",
            project: "Lakhta Center. Multifunktsionaalne hoone, Peterburi",
            client: "SAMSUNG C&T",
            description: `SAMSUNG C&T<br>Особенности проекта: <br>- Применение модульных фасадных конструкций, в том числе тепло-холодных и двойных фасадов,  спайдерных фасадов на стеклянных стойках, кабельных спайдерных фасадов, кровель на основе пленки этилен-тетрафторэтилен-этилен (ETFE);<br>- Детальная проработка проекта. <br>- Все виды расчетов (прочностные, тепловые, конденсационные).<br>- Все виды испытаний (климатические, эксплуатационные, подтверждение предела огнестойкости, заводские, приемочные).<br><br>Samsung C&T — мировой лидер в области управления строительством уникальных объектов; имеется рекомендательное письмо.<br><br>Работа в структуре Технического заказчика совместно с Генеральным проектировщиком - ООО Горпроект (Москва).<br><br>Зона ответственности: <br>- Светопрозрачные фасады, <br>-  Декоративные элементы кровли, <br>- Системы обслуживания фасадов Многофункционального здания комплекса Лахта Центр.<br><br>Обязанности: <br>- Внутренняя координация проектных решений по фасадам, <br>- Координация проектных решей по фасадам со смежными разделами;<br>- Координация проектных решений с ​​Заказчиком;<br>- Проверка документации стадии Проект и Рабочей документации; <br>- Проверка предоставленных расчетов и программ испытаний; <br>- Участие в натурных испытаниях и эксплуатационных испытаниях в испытательном центре IFT Rosenheim в Деггендорфе (Германия) и на производственной базе Lindner в Арнсторфе (Германия)`,
        galleryLink: `/${repoName}/ru/Project4_ru.html`
        },
        {
            year: "2021",
            project: "Sillamäe Vanalinna kool, Sillamäe, Eesti",
            client: "FENSTER ALUMIINIUM AS/Tallinn",
            description: `AS FENSTER ALUMIINIUM/Tallinn<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/ru/Project5_ru.html`
        },
        {
            year: "2021",
            project: "Kultuurikeskus Muhu Maja, Muhu saar, Eesti",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `AS FENSTER ALUMIINIUM/Tallinn<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/ru/Project6_ru.html`
        },
        {
            year: "2022",
            project: "Narva Riigigümnaasium, Narva, Eesti",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `AS FENSTER ALUMIINIUM/Tallinn<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/ru/Project7_ru.html`
        },
        {
            year: "2023",
            project: "Narva Eesti kool, Narva, Eesti",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `AS FENSTER ALUMIINIUM/Tallinn<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/ru/Project8_ru.html`
        },
        {
            year: "2023",
            project: "Narva Lasteaed Punamütsike, Narva, Eesti",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `AS FENSTER ALUMIINIUM/Tallinn<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/ru/Project9_ru.html`
        },
        {
            year: "2024",
            project: "Magdaleena Lasteaed, Tallinn, Eesti",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `AS FENSTER ALUMIINIUM/Tallinn<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/ru/Project10_ru.html`
        },
        {
            year: "2024",
            project: "Laagri Keskus/Laagri Kaubanduskeskus, vertikaalsed aknaluugid, Tallinn, Eesti",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `AS FENSTER ALUMIINIUM/Tallinn<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/ru/Project11_ru.html`
        },
        {
            year: "2024",
            project: "Mercedes Showroom - VEHO, Tallinn, Eesti",
            client: "AS MALMERK FASSAADID/Tallinn",
            description: `AS MALMERK FASSAADID/Tallinn<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/ru/Project12_ru.html`
        },
        {
            year: "2024",
            project: "Healing Hotel GREEN FLOW Baikal, Venemaa",
            client: "ООО RAY Alumiinium/Красноярск",
            description: `ООО RAY Alumiinium/Красноярск<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/ru/Project13_ru.html`
        }
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
            descriptionText.innerHTML = project.description;  // Kasutame innerHTML kuvamiseks HTML-i

            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-container');

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Tühista';
            cancelButton.classList.add('cancel-btn');
            cancelButton.onclick = function() {
                popup.remove();
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

            popup.addEventListener('click', function(e) {
                if (e.target === popup) {
                    popup.remove();
                }
            });
        });
    });
});


document.getElementById("year").textContent = new Date().getFullYear();
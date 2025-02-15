document.addEventListener("DOMContentLoaded", function() {
    // Название репозитория (для корректных путей на GitHub Pages)
    const repoName = window.location.pathname.includes("/CV/") ? "CV" : "";

    const projects = [
        {
            year: "2012",
            project: "Staircase, TKR Cosmos, St. Petersburg",
            client: "EUROSTROYSTANDARD UK JSC/Saint-Petersburg",
            description: `ELEMENTFACADE LTD/Moscow<br><br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/en/Project0_en.html`
        },
        {
            year: "2014",
            project: "Lesnaya Formula Residence",
            client: "ELEMENTFACADE LTD/Moscow",
            description: `ELEMENTFACADE LTD/Moscow<br><br>Private residential house (~4,000 m2).<br><br>Ventilated facades (3D ceramic NBK CERAMIC, custom-developed substructure, aluminum), glazing (Reynaers), roll-up shutters filled with stainless steel mesh).<br><br>Project features - precision facade assembly using custom-developed leveling "crosses".<br><br>Use of the Reynaers aluminum-wood system for facade doors. Door height 4.0 meters.<br><br>Role in the project: Participation in AR, KM, KMD development. Participation in commissioning and handover`,
        galleryLink: `/${repoName}/en/Project1_en.html`
        },
        {
            year: "2014",
            project: "Apart-Hotel/Residence K12, St. Petersburg",
            client: "ELEMENTFACADE LTD/Moscow",
            description: `ELEMENTFACADE LTD/Moscow<br><br>Apart-hotel (~4,000 m2), St. Petersburg, Krestovsky Prospect, No. 12, Building 2, Lit. A. Ventilated facades (volumetric ceramic NBK CERAMIC, substructure - stainless steel OLMA, + custom-developed substructure (aluminum), bent elements - EUROMAX sheet), glazing (Reynaers, profiles of our own extrusion).<br><br>Project features: cassette installation of ventilated facades used (custom substructure).<br><br>Role in the project: Participation in AR, KM, KMD development. Participation in commissioning and handover`,
        galleryLink: `/${repoName}/en/Project2_en.html`
        },
        {
            year: "2016",
            project: "Yacht Club Yavara-Neva, Bychiy Island, St. Petersburg",
            client: "ELEMENTFACADE LTD/Moscow",
            description: `ELEMENTFACADE LTD/Moscow<br><br>Multifunctional sports and entertainment complex and yacht club "Yavara-Neva" (~10,000 m2), Bychiy Island, St. Petersburg.<br><br>Ventilated facades (large block cassettes - NOVELIS aluminum sheet, SMK stainless steel substructure), glazing (Reynaers, ALMO, our own extrusion profiles).<br><br>Role in the project: Participation in AR, KM, KMD development. Participation in commissioning and handover`,
        galleryLink: `/${repoName}/en/Project3_en.html`
        },
        {
            year: "2018",
            project: "Lakhta Center. Multifunctional Building, St. Petersburg",
            client: "SAMSUNG C&T",
            description: `SAMSUNG C&T<br>Project features: <br>- Use of modular facade structures, including thermal-cold and double facades, spider facades on glass columns, cable spider facades, roofing based on ethylene-tetrafluoroethylene-ethylene (ETFE) film;<br>- Detailed project development. <br>- All types of calculations (strength, thermal, condensation).<br>- All types of tests (climatic, operational, fire resistance confirmation, factory, acceptance).<br><br>Samsung C&T - a global leader in the management of unique construction projects; recommendation letter available.<br><br>Work within the Technical Client's structure together with the General Designer - OÜ Gorproekt (Moscow).<br><br>Scope of responsibilities: <br>- Transparent facades, <br>- Decorative roof elements, <br>- Facade maintenance systems for the multifunctional Lakhta Center building complex.<br><br>Responsibilities: <br>- Internal coordination of facade design solutions, <br>- Coordination of facade design solutions with related sections;<br>- Coordination of design solutions with the Client;<br>- Checking Project and Working documentation stages; <br>- Checking provided calculations and test programs; <br>- Participation in field tests and operational tests at the IFT Rosenheim Testing Center in Deggendorf (Germany) and Lindner's manufacturing base in Arnstorf (Germany)`,
        galleryLink: `/${repoName}/en/Project4_en.html`
        },
        {
            year: "2021",
            project: "Sillamäe Vanalinna kool/Vanalinn Gymnasium, Sillamäe, Estonia",
            client: "FENSTER ALUMIINIUM AS/Tallinn",
            description: `AS FENSTER ALUMIINIUM/Tallinn<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/en/Project5_en.html`
        },
        {
            year: "2021",
            project: "Cultural Center Muhu Maja, Muhu Island, Estoni",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `AS FENSTER ALUMIINIUM/Tallinn<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/en/Project6_en.html`
        },
        {
            year: "2022",
            project: "Narva Riigigümnaasium/Narva State Gymnasium, Narva, Estonia",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `AS FENSTER ALUMIINIUM/Tallinn<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/en/Project7_en.html`
        },
        {
            year: "2023",
            project: "Narva Eesti kool/Narva Estonian School, Narva, Estonia",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `AS FENSTER ALUMIINIUM/Tallinn<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/en/Project8_en.html`
        },
        {
            year: "2023",
            project: "Narva Lasteaed Punamütsike/Narva Kindergarten 'Little Red Riding Hood', Narva, Estonia",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `AS FENSTER ALUMIINIUM/Tallinn<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/en/Project9_en.html`
        },
        {
            year: "2024",
            project: "Magdaleena Lasteaed/Magdaleena Kindergarten, Tallinn, Estonia",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `AS FENSTER ALUMIINIUM/Tallinn<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/en/Project10_en.html`
        },
        {
            year: "2024",
            project: "Laagri Keskus/Laagri Commercial Center, vertical blinds, Tallinn, Estonia",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `AS FENSTER ALUMIINIUM/Tallinn<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/en/Project11_en.html`
        },
        {
            year: "2024",
            project: "Mercedes Showroom - VEHO, Tallinn, Estonia",
            client: "AS MALMERK FASSAADID/Tallinn",
            description: `AS MALMERK FASSAADID/Tallinn<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/en/Project12_en.html`
        },
        {
            year: "2024",
            project: "Healing Hotel GREEN FLOW Baikal, Russia",
            client: "RAY Aluminium LTD/Krasnojarsk",
            description: `OÜ RAY Alumiinium/Krasnojarsk<br>Fassaadi klaasimine, vitraažid ja seinad`,
        galleryLink: `/${repoName}/en/Project13_en.html`
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
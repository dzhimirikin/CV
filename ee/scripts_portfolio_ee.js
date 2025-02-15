document.addEventListener("DOMContentLoaded", function() {
    const projects = [
        {
            year: "2012",
            project: "Trepp, TKR Cosmos, Peterburi",
            client: "OAO EUROSTROYSTANDARD UK/Peterburi",
            description: `Fassaadi klaasimine, vitraažid ja seinad.`,
            galleryLink: "Project0_ee.html"
        },
        {
            year: "2014",
            project: "Lesnaya Formula Residence",
            client: "OÜ ELEMENTFACADE/Moskva",
            description: `Arhitekt: Ingmar Vitvitski.<br><br>Privaatne elamu (~4000 m2).<br><br>Ventileeritud fassaadid (3D keraamiline NBK CERAMIC, kohandatud aluskonstruktsioon, alumiinium), klaasimine (Reynaers), rullimise aknaluugid, täidetud roostevaba terasevõrguga).<br><br>Projekti eripärad - täpsus fassaadi kokkupanekul, kasutades kohandatud tasandamis"ristide" süsteemi.<br><br>Reynaers alumiinium-puuliist süsteemi kasutamine fassaadi uste jaoks. Uste kõrgus 4,0 meetrit.<br><br>Projekti roll: Osalemine AR, KM, KMD arenduses. Osalemine üleandmise ja lõpliku heakskiidu protsessis.`,
            galleryLink: "Project1_ee.html"
        },
        {
            year: "2014",
            project: "Apart-Hotel/Residence K12, Peterburi",
            client: "OÜ ELEMENTFACADE/Moskva",
            description: `Arhitekt: Ingmar Vitvitski.<br><br>Apart-hotel (~4000 m2), Peterburi, Krestovski prospekt, Nr 12, Hoone 2, Lit. A. Ventileeritud fassaadid (volumetrilised keraamilised NBK CERAMIC, aluskonstruktsioon - roostevaba teras OLMA, + kohandatud aluskonstruktsioon (alumiinium), painutatud elemendid - EUROMAX leht), klaasimine (Reynaers, meie oma ekstrusiooniprofiilid).<br><br>Projekti eripärad: kasettide paigaldamine ventileeritud fassaadide jaoks (kohandatud aluskonstruktsioon).<br><br>Projekti roll: Osalemine AR, KM, KMD arenduses. Osalemine üleandmise ja lõpliku heakskiidu protsessis.`,
            galleryLink: "Project2_ee.html"
        },
        {
            year: "2016",
            project: "Jahtklubi Yavara-Neva, Bychiy saar, Peterburi",
            client: "OÜ ELEMENTFACADE/Moskva",
            description: `Arhitekt: Ingmar Vitvitski.<br><br>Multifunktsionaalne spordi- ja meelelahutuskeskus ning jahtklubi "Yavara-Neva" (~10 000 m2), Bychiy saar, Peterburi.<br><br>Ventileeritud fassaadid (suured plokikasetid - NOVELIS alumiiniumplekk, SMK roostevaba terase aluskonstruktsioon), klaasimine (Reynaers, ALMO, meie oma ekstrusiooniprofiilid).<br><br>Projekti roll: Osalemine AR, KM, KMD arenduses. Osalemine üleandmise ja lõpliku heakskiidu protsessis.`,
            galleryLink: "Project3_ee.html"
        },
        {
            year: "2018",
            project: "Lakhta Center. Multifunktsionaalne hoone, Peterburi",
            client: "SAMSUNG C&T",
            description: `Projekti eripärad: <br>- Moodulite fassaadikonstruktsioonide kasutamine, sealhulgas sooja-külma ja topeltfassaadid, klaaspostidele kinnitatud ämblikfassaadid, kaabelämblikfassaadid, katusekonstruktsioonid etüleen-tetrafluoroetüleen-etüleen (ETFE) kile baasil;<br>- Detailne projekti arendus. <br>- Kõik arvutused (mehaanilised, termilised, kondensatsioon).<br>- Kõik katsed (kliimatingimused, töötlus, tulekindluse kinnitamine, tehase ja vastuvõtu katsed).<br><br>Samsung C&T - globaali juht unikaalsete ehitusprojektide haldamises; soovituskiri saadaval.<br><br>Töötamine tehnilise tellija struktuuris koos üldarhitektiga - OÜ Gorproekt (Moskva).<br><br>Vastutusala: <br>- Läbipaistvad fassaadid, <br>- Dekoratiivsed katuseelemendid, <br>- Fassaadi hooldusüsteemid multifunktsionaalse Lakhta Centeri hoone jaoks.<br><br>Vastutus: <br>- Sisemine kooskõlastamine fassaadi lahendustega, <br>- Kooskõlastamine fassaadi lahendustega teiste osakondadega;<br>- Kooskõlastamine projekti lahendusi tellijaga;<br>- Projekti ja tööprojektide etappide kontrollimine; <br>- Kontrollitud arvutused ja katseprogrammide ülevaatamine; <br>- Osalemine valdkonna katsetustes ja töökatsetustes IFT Rosenheimi testimiskeskuses Deggendorfis (Saksamaa) ja Lindneri tootmisbaasis Arnstorfis (Saksamaa).`,
            galleryLink: "Project4_ee.html"
        },
        {
            year: "2021",
            project: "Sillamäe Vanalinna kool, Sillamäe, Eesti",
            client: "FENSTER ALUMIINIUM AS/Tallinn",
            description: `Fassaadi klaasimine, vitraažid ja seinad.`,
            galleryLink: "Project5_ee.html"
        },
        {
            year: "2021",
            project: "Kultuurikeskus Muhu Maja, Muhu saar, Eesti",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `Fassaadi klaasimine, vitraažid ja seinad.`,
            galleryLink: "Project6_ee.html"
        },
        {
            year: "2022",
            project: "Narva Riigigümnaasium, Narva, Eesti",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `Fassaadi klaasimine, vitraažid ja seinad.`,
            galleryLink: "Project7_ee.html"
        },
        {
            year: "2023",
            project: "Narva Eesti kool, Narva, Eesti",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `Fassaadi klaasimine, vitraažid ja seinad.`,
            galleryLink: "Project8_ee.html"
        },
        {
            year: "2023",
            project: "Narva Lasteaed Punamütsike, Narva, Eesti",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `Fassaadi klaasimine, vitraažid ja seinad.`,
            galleryLink: "Project9_ee.html"
        },
        {
            year: "2024",
            project: "Magdaleena Lasteaed, Tallinn, Eesti",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `Fassaadi klaasimine, vitraažid ja seinad.`,
            galleryLink: "Project10_ee.html"
        },
        {
            year: "2024",
            project: "Laagri Keskus/Laagri Kaubanduskeskus, vertikaalsed aknaluugid, Tallinn, Eesti",
            client: "AS FENSTER ALUMIINIUM/Tallinn",
            description: `Fassaadi klaasimine, vitraažid ja seinad.`,
            galleryLink: "Project11_ee.html"
        },
        {
            year: "2024",
            project: "Mercedes Showroom - VEHO, Tallinn, Eesti",
            client: "AS MALMERK FASSAADID/Tallinn",
            description: `Fassaadi klaasimine, vitraažid ja seinad.`,
            galleryLink: "Project12_ee.html"
        },
        {
            year: "2024",
            project: "Healing Hotel GREEN FLOW Baikal, Venemaa",
            client: "OÜ RAY Alumiinium/Krasnojarsk",
            description: `Fassaadi klaasimine, vitraažid ja seinad.`,
            galleryLink: "Project13_ee.html"
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
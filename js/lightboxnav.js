document.addEventListener("DOMContentLoaded", () => {

    const allGalleryLinks =
        Array.from(document.querySelectorAll("#gallery .gallery a"));

    let galleryLinks = [];
    let currentIndex = 0;


    /* ============================================================
       ФОРМИРУЕМ АКТУАЛЬНЫЙ СПИСОК ФОТОГРАФИЙ
    ============================================================ */

    function updateGalleryLinks() {

        galleryLinks = allGalleryLinks.filter(link => {

            const img = link.querySelector("img");

            if (!img) return false;

            return link.style.display !== "none";

        });

    }


    /* ============================================================
       ОТКРЫТИЕ ФОТО
    ============================================================ */

    allGalleryLinks.forEach(link => {

        link.addEventListener("click", e => {

            e.preventDefault();

            updateGalleryLinks();

            currentIndex = galleryLinks.indexOf(link);

            if (currentIndex === -1) return;

            const old =
                document.querySelector(".lightbox-overlay");

            if (old) old.remove();

            openLightbox(link.href);

        });

    });


    /* ============================================================
       LIGHTBOX
    ============================================================ */

    function openLightbox(src) {

        const overlay =
            document.createElement("div");

        overlay.className =
            "lightbox-overlay";


        const img =
            document.createElement("img");

        img.className =
            "lightbox-img";

        img.src = src;


        const closeBtn =
            document.createElement("button");

        closeBtn.className =
            "lightbox-close";

        closeBtn.textContent =
            "×";


        const prev =
            document.createElement("button");

        prev.className =
            "lightbox-prev";

        prev.textContent =
            "‹";


        const next =
            document.createElement("button");

        next.className =
            "lightbox-next";

        next.textContent =
            "›";


        overlay.append(
            img,
            closeBtn,
            prev,
            next
        );

        document.body.appendChild(overlay);


        /* ========================================================
           ПЕРЕЛИСТЫВАНИЕ
        ======================================================== */

        function showPrev() {

            if (!galleryLinks.length) return;

            currentIndex =
                (currentIndex - 1 + galleryLinks.length)
                % galleryLinks.length;

            img.src =
                galleryLinks[currentIndex].href;
        }


        function showNext() {

            if (!galleryLinks.length) return;

            currentIndex =
                (currentIndex + 1)
                % galleryLinks.length;

            img.src =
                galleryLinks[currentIndex].href;
        }


        /* ========================================================
           КНОПКИ
        ======================================================== */

        prev.onclick = () => {

            showPrev();

        };


        next.onclick = () => {

            showNext();

        };


        /* ========================================================
           КЛАВИАТУРА
        ======================================================== */

        function handleKey(e) {

            if (e.key === "ArrowLeft") {

                showPrev();

            }

            else if (e.key === "ArrowRight") {

                showNext();

            }

            else if (e.key === "Escape") {

                closeLightbox();

            }

        }


        document.addEventListener(
            "keydown",
            handleKey
        );


        /* ========================================================
           ЗАКРЫТИЕ
        ======================================================== */

        function closeLightbox() {

            document.removeEventListener(
                "keydown",
                handleKey
            );

            overlay.remove();

        }


        closeBtn.onclick =
            closeLightbox;


        /* ========================================================
           КЛИК ПО ФОНУ
        ======================================================== */

        overlay.addEventListener(
            "click",
            e => {

                if (e.target === overlay) {

                    closeLightbox();

                }

            }
        );

    }

});
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

        closeBtn.type = "button";
        closeBtn.setAttribute("aria-label", "Close image viewer");
        closeBtn.textContent = "×";

        // Круглая кнопка закрытия: белый крест и белый контур.
        // При наведении/нажатии круг становится белым, крест — чёрным.
        Object.assign(closeBtn.style, {
            position: "absolute",
            top: "18px",
            right: "18px",
            zIndex: "10001",
            width: "42px",
            height: "42px",
            padding: "0",
            border: "1px solid #fff",
            borderRadius: "50%",
            background: "transparent",
            color: "#fff",
            font: "32px/38px Arial, sans-serif",
            textAlign: "center",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
            transition: "background-color 0.15s ease, color 0.15s ease"
        });

        const activateCloseButton = () => {
            closeBtn.style.backgroundColor = "#fff";
            closeBtn.style.color = "#000";
        };

        const resetCloseButton = () => {
            closeBtn.style.backgroundColor = "transparent";
            closeBtn.style.color = "#fff";
        };

        closeBtn.addEventListener("mouseenter", activateCloseButton);
        closeBtn.addEventListener("mousedown", activateCloseButton);
        closeBtn.addEventListener("mouseup", activateCloseButton);
        closeBtn.addEventListener("mouseleave", resetCloseButton);
        closeBtn.addEventListener("focus", activateCloseButton);
        closeBtn.addEventListener("blur", resetCloseButton);


        const prev =
            document.createElement("button");

        prev.className =
            "lightbox-prev";

        prev.textContent = "‹";
        prev.type = "button";
        prev.setAttribute("aria-label", "Previous photo");

        const next =
            document.createElement("button");

        next.className = "lightbox-next";
        next.textContent = "›";
        next.type = "button";
        next.setAttribute("aria-label", "Next photo");

        // Стрелки оформлены в той же логике, что и крестик:
        // белый символ в круге с белой обводкой; при наведении
        // круг становится белым, а символ — чёрным.
        const styleArrowButton = (button, side) => {
            Object.assign(button.style, {
                position: "absolute",
                top: "50%",
                [side]: "18px",
                transform: "translateY(-50%)",
                zIndex: "10001",
                width: "42px",
                height: "42px",
                padding: "0",
                border: "1px solid #fff",
                borderRadius: "50%",
                background: "transparent",
                color: "#fff",
                font: "32px/38px Arial, sans-serif",
                textAlign: "center",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                transition: "background-color 0.15s ease, color 0.15s ease"
            });

            const activate = () => {
                button.style.backgroundColor = "#fff";
                button.style.color = "#000";
            };

            const reset = () => {
                button.style.backgroundColor = "transparent";
                button.style.color = "#fff";
            };

            button.addEventListener("mouseenter", activate);
            button.addEventListener("mousedown", activate);
            button.addEventListener("mouseup", activate);
            button.addEventListener("mouseleave", reset);
            button.addEventListener("focus", activate);
            button.addEventListener("blur", reset);
        };

        styleArrowButton(prev, "left");
        styleArrowButton(next, "right");


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
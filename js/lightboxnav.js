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

        // Атрибут hidden должен работать независимо от внешних CSS-правил.
        if (!document.getElementById("lightbox-nav-hidden-style")) {
            const style = document.createElement("style");
            style.id = "lightbox-nav-hidden-style";
            style.textContent = `
                .lightbox-prev[hidden],
                .lightbox-next[hidden] { display: none !important; }
                @media (min-width: 601px) {
                    .lightbox-img {
                        max-width: calc(100vw - 120px) !important;
                        max-height: calc(100vh - 160px) !important;
                        object-fit: contain;
                    }
                    .lightbox-counter {
                        bottom: 54px !important;
                        font-size: 14px !important;
                        padding: 5px 11px !important;
                    }
                    .lightbox-dots { bottom: 10px !important; gap: 6px !important; }
                    .lightbox-counter { font-size: 12px !important; padding: 3px 7px !important; bottom: 30px !important; }
                    .lightbox-dots button { width: 8px !important; height: 8px !important; min-width: 8px !important; }
                }
            `;
            document.head.appendChild(style);
        }

        overlay.className =
            "lightbox-overlay";


        const img =
            document.createElement("img");

        img.className =
            "lightbox-img";

        img.src = src;
        // Плавное растворение между фотографиями.
        img.style.transition = "opacity 2700ms ease-in-out";
        img.style.opacity = "1";

        let slideshowTimer = null;
        let slideshowRunning = false;


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

        // Кнопка слайд-шоу находится по центру той же верхней строки,
        // что и крестик закрытия.
        const slideshowBtn = document.createElement("button");
        slideshowBtn.className = "lightbox-slideshow";
        slideshowBtn.type = "button";
        slideshowBtn.setAttribute("aria-label", "Start slideshow");
        slideshowBtn.textContent = "▶";
        Object.assign(slideshowBtn.style, {
            position: "absolute",
            top: "18px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: "10001",
            width: "42px",
            height: "42px",
            padding: "0 0 0 2px",
            border: "1px solid #fff",
            borderRadius: "50%",
            background: "transparent",
            color: "#fff",
            font: "17px/1 Arial, sans-serif",
            textAlign: "center",
            cursor: "pointer",
            display: galleryLinks.length > 1 ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
            transition: "background-color 0.15s ease, color 0.15s ease"
        });

        const activateSlideshowButton = () => {
            slideshowBtn.style.backgroundColor = "#fff";
            slideshowBtn.style.color = "#000";
        };
        const resetSlideshowButton = () => {
            slideshowBtn.style.backgroundColor = "transparent";
            slideshowBtn.style.color = "#fff";
        };
        slideshowBtn.addEventListener("mouseenter", activateSlideshowButton);
        slideshowBtn.addEventListener("mousedown", activateSlideshowButton);
        slideshowBtn.addEventListener("mouseup", resetSlideshowButton);
        slideshowBtn.addEventListener("mouseleave", resetSlideshowButton);
        slideshowBtn.addEventListener("focus", activateSlideshowButton);
        slideshowBtn.addEventListener("blur", resetSlideshowButton);

        const prev =
            document.createElement("button");

        prev.className =
            "lightbox-prev";

        prev.textContent = "‹";
        prev.type = "button";
        prev.setAttribute("aria-label", "Previous photo");
        prev.hidden = true;

        const next =
            document.createElement("button");

        next.className = "lightbox-next";
        next.textContent = "›";
        next.type = "button";
        next.setAttribute("aria-label", "Next photo");
        next.hidden = true;

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


        // Стрелки показываем только тогда, когда есть что перелистывать.
        // galleryLinks содержит актуальный список видимых изображений.
        prev.hidden = galleryLinks.length < 2;
        next.hidden = galleryLinks.length < 2;

        const dots = document.createElement("div");
        dots.className = "lightbox-dots";
        Object.assign(dots.style, {
            position: "absolute",
            left: "50%",
            bottom: "22px",
            transform: "translateX(-50%)",
            display: galleryLinks.length > 1 ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            zIndex: "10001",
            position: "absolute"
        });

        const activeDotPill = document.createElement("span");
        activeDotPill.setAttribute("aria-hidden", "true");
        Object.assign(activeDotPill.style, {
            position: "absolute", left: "0", top: "0",
            width: window.innerWidth <= 600 ? "18px" : "22px",
            height: window.innerWidth <= 600 ? "10px" : "14px", borderRadius: "999px",
            background: "#fff", pointerEvents: "none",
            transition: "transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            zIndex: "1"
        });

        // Индикатор текущей фотографии в формате 1 / N.
        const counter = document.createElement("div");
        counter.className = "lightbox-counter";
        counter.setAttribute("aria-live", "polite");
        counter.textContent = `${currentIndex + 1} / ${galleryLinks.length}`;
        Object.assign(counter.style, {
            position: "absolute",
            left: "50%",
            bottom: "44px",
            transform: "translateX(-50%)",
            padding: "3px 9px",
            borderRadius: "14px",
            background: "rgba(25,25,25,0.78)",
            color: "#fff",
            font: "12px/1.2 Arial, Helvetica, sans-serif",
            whiteSpace: "nowrap",
            zIndex: "10001",
            display: galleryLinks.length > 1 ? "block" : "none"
        });

        function changeImage(newSrc, useFade = true) {
            if (img.src === new URL(newSrc, document.baseURI).href) return;

            // Ручное перелистывание стрелками/клавиатурой/точками — мгновенно,
            // без эффекта затемнения. Плавное растворение остаётся для слайд-шоу.
            if (!useFade) {
                img.style.transition = "none";
                img.style.opacity = "1";
                img.src = newSrc;
                return;
            }
            img.style.transition = "opacity 2700ms ease-in-out";

            const preload = new Image();

            preload.onload = () => {
                // Плавно гасим старую фотографию
                img.style.opacity = "0";

                window.setTimeout(() => {
                    // Меняем фотографию после угасания
                    img.src = newSrc;

                    // Фиксируем прозрачное состояние
                    img.style.opacity = "0";
                    void img.offsetWidth;

                    // Плавно проявляем новую фотографию
                    requestAnimationFrame(() => {
                        img.style.opacity = "1";
                    });
                }, 2700);
            };

            preload.onerror = () => {
                img.src = newSrc;
                img.style.opacity = "1";
            };

            preload.src = newSrc;
        }

        const dotButtons = galleryLinks.map((galleryLink, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", `Show photo ${index + 1}`);
            dot.setAttribute("aria-current", index === currentIndex ? "true" : "false");
            Object.assign(dot.style, {
                width: window.innerWidth <= 600 ? "8px" : "12px",
                height: window.innerWidth <= 600 ? "8px" : "12px",
                minWidth: window.innerWidth <= 600 ? "8px" : "12px",
                padding: "0",
                border: "1px solid rgba(255,255,255,0.75)",
                borderRadius: "50%",
                background: "transparent",
                opacity: index === currentIndex ? "1" : "0.75",
                cursor: "pointer",
                boxSizing: "border-box",
                position: "relative",
                zIndex: "2"
            });
            dot.addEventListener("click", () => {
                currentIndex = index;
                changeImage(galleryLinks[currentIndex].href, false);
                updateDots();
                updateCounter();
            });
            dots.appendChild(dot);
            return dot;
        });

        dots.prepend(activeDotPill);

        function updateDots() {
            dotButtons.forEach((dot, index) => {
                const active = index === currentIndex;
                dot.style.opacity = active ? "1" : "0.75";
                dot.setAttribute("aria-current", active ? "true" : "false");
            });
            const activeDot = dotButtons[currentIndex];
            const pillX = activeDot.offsetLeft + (activeDot.offsetWidth - activeDotPill.offsetWidth) / 2;
            activeDotPill.style.transform = `translateX(${pillX}px)`;
        }

        function updateCounter() {
            counter.textContent = `${currentIndex + 1} / ${galleryLinks.length}`;
        }

        overlay.append(
            img,
            closeBtn,
            slideshowBtn,
            prev,
            next,
            counter,
            dots
        );

        document.body.appendChild(overlay);
        updateDots();


        /* ========================================================
           ПЕРЕЛИСТЫВАНИЕ
        ======================================================== */

        function showPrev() {

            if (!galleryLinks.length) return;

            currentIndex =
                (currentIndex - 1 + galleryLinks.length)
                % galleryLinks.length;

            changeImage(galleryLinks[currentIndex].href, false);
            updateDots();
            updateCounter();
        }


        function showNext(useFade = false) {

            if (!galleryLinks.length) return;

            currentIndex =
                (currentIndex + 1)
                % galleryLinks.length;

            changeImage(galleryLinks[currentIndex].href, useFade);
            updateDots();
            updateCounter();
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

        function stopSlideshow() {
            if (slideshowTimer !== null) {
                window.clearInterval(slideshowTimer);
                slideshowTimer = null;
            }
            slideshowRunning = false;
            slideshowBtn.textContent = "▶";
            slideshowBtn.style.paddingLeft = "2px";
            slideshowBtn.setAttribute("aria-label", "Start slideshow");
        }

        function startSlideshow() {
            if (galleryLinks.length < 2 || slideshowRunning) return;
            slideshowRunning = true;
            slideshowBtn.textContent = "Ⅱ";
            slideshowBtn.style.paddingLeft = "0";
            slideshowBtn.setAttribute("aria-label", "Pause slideshow");
            slideshowTimer = window.setInterval(() => showNext(true), 6400);
        }

        slideshowBtn.addEventListener("click", () => {
            if (slideshowRunning) {
                stopSlideshow();
            } else {
                startSlideshow();
            }
        });


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

            stopSlideshow();
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
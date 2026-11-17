
document.addEventListener('DOMContentLoaded', () => {

    const modal = document.getElementById('videoModal');
    const player = document.getElementById('videoPlayer');
    const frame = document.getElementById('videoFrame');
    const closeButton = document.getElementById('videoClose');

    let savedScrollY = 0;

    if (!modal || !player || !frame || !closeButton) {
        console.error('Video Modal: required HTML elements not found');
        return;
    }

    // Открытие общего видеомодального окна
    window.openVideoModal = function (url) {

        if (!url) return;

        // Google Drive на мобильных устройствах
        if (
            /drive\.google\.com\/file\/d\//.test(url) &&
            window.matchMedia('(max-width: 768px)').matches
        ) {
            window.open(url, '_blank', 'noopener,noreferrer');
            return;
        }

        // Блокируем прокрутку страницы
        savedScrollY = window.scrollY;

        document.body.style.position = 'fixed';
        document.body.style.top = `-${savedScrollY}px`;
        document.body.style.width = '100%';

        // Закрываем предыдущее воспроизведение
        player.pause();
        player.removeAttribute('src');
        player.load();

        frame.removeAttribute('src');

        // Google Drive
        const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);

        if (driveMatch) {

            player.style.display = 'none';
            frame.style.display = 'block';

            frame.src = `https://drive.google.com/file/d/${driveMatch[1]}/preview`;

        } else {

            // Обычный MP4
            frame.style.display = 'none';
            player.style.display = 'block';

            player.src = url;
            player.play().catch(error => {
                console.warn('Video autoplay was prevented:', error);
            });

        }

        modal.classList.add('open');
    };

    // Закрытие общего видеомодального окна
    window.closeVideoModal = function () {

        player.pause();
        player.removeAttribute('src');
        player.load();

        frame.removeAttribute('src');

        modal.classList.remove('open');

        // Восстанавливаем прокрутку страницы
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';

        window.scrollTo(0, savedScrollY);

    };

    // Кнопка закрытия
    closeButton.addEventListener('click', window.closeVideoModal);

    // Закрытие при клике по затемнённой области
    modal.addEventListener('click', event => {
        if (event.target === modal) {
            window.closeVideoModal();
        }
    });

    // Закрытие клавишей Escape
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal.classList.contains('open')) {
            window.closeVideoModal();
        }
    });

});

document.addEventListener("DOMContentLoaded", function () {
    function animateProgressBars() {
        const progressBars = document.querySelectorAll(".progress-bar .fill");

        progressBars.forEach((bar) => {
            const targetWidth = parseInt(bar.getAttribute("data-width"), 10); // Target width
            const progressValue = bar.closest(".progress-bar").querySelector(".progress-value"); // Numbers next to the bar

            let startTime = null;
            const duration = 2000; // Animation duration in milliseconds

            function animate(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime; // Elapsed time
                const progress = Math.min(elapsed / duration, 1); // Interpolation from 0 to 1

                // Current width of the progress bar (with precision)
                const currentWidth = progress * targetWidth;
                bar.style.width = `${currentWidth}%`; // Set the width

                // Update the numeric value and change its color
                const currentPercentage = Math.floor(currentWidth);
                progressValue.textContent = `${currentPercentage}%`; // Update the text

                // Intermediate numbers (before reaching 100%)
                if (progress < 1) {
                    progressValue.style.color = 'skyblue'; // Skyblue color for intermediate values
                }
                // Final value color
                if (progress === 1) {
                    progressValue.style.color = 'white'; // White color for the final value
                }

                // If progress has not yet reached the goal, continue the animation
                if (progress < 1) {
                    requestAnimationFrame(animate); // Trigger the next animation frame
                }
            }

            // Start the animation
            requestAnimationFrame(animate);
        });
    }

    animateProgressBars(); // Start the animation when the page is loaded
});



document.getElementById("year").textContent = new Date().getFullYear();
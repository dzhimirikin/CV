document.addEventListener("DOMContentLoaded", function () {
    // Repository name (for correct paths on GitHub Pages)
    const repoName = window.location.pathname.includes("/CV/") ? "CV" : "";

    // Define routes with respect to the repository
    const languageRoutes = {
        "ru": `/${repoName}/ru/index_ru.html`,
        "en": `/${repoName}/en/index_en.html`,
        "ee": `/${repoName}/ee/index_ee.html`
    };

    // Event handler for language switcher
    document.querySelector(".language-switcher").addEventListener("click", function (event) {
        const target = event.target.closest("a");
        if (target) {
            event.preventDefault(); // Prevent default link behavior

            // Get the selected language
            const lang = target.getAttribute("data-lang");
            if (lang) {
                // Save the selected language in localStorage
                localStorage.setItem("selectedLanguage", lang);

                // Navigate to the page with the desired language file, considering the repository
                const targetPage = languageRoutes[lang] || languageRoutes["en"];
                window.location.href = targetPage;
            }
        }
    });

    // Modal window: password setup and handling
    const correctPassword = "Qazwsx"; // Specify your password
    const modal = document.getElementById("password-modal");
    const btn = document.getElementById("show-modal-btn");
    const closeBtn = document.getElementById("submit-password");
    const errorMessage = document.getElementById("error-message");
    const downloadLink = document.getElementById("download-link"); // Download link

    // Open modal window when clicking the button
    btn.onclick = function() {
        modal.style.display = "flex";  // Display the modal window
        errorMessage.textContent = ""; // Clear the error message when reopening
        clearInputs(); // Clear all input fields
        inputs[0].focus(); // Set focus on the first input field
    };

    // Close modal window when the submit button is clicked
    closeBtn.onclick = function() {
        const enteredPassword = Array.from(document.querySelectorAll('.password-input'))
                                      .map(input => input.value)
                                      .join(''); // Collect the entered password

        // Check the entered password
        if (enteredPassword === correctPassword) {
            modal.style.display = "none";  // Close the modal window

            // Start file download
            downloadLink.click();  // Programmatically click the hidden link
        } else {
            errorMessage.textContent = "Incorrect password! Try again.";  // If the password is incorrect
            clearInputs(); // Clear all input fields
            inputs[0].focus(); // Set focus on the first input field
        }
    };

    // Close the modal window when clicking outside its area
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    // Get all password input fields
    const inputs = document.querySelectorAll('.password-input');

    // Function to move the focus to the next field
    function moveFocus(event) {
        // If a symbol is entered (input length = 1)
        if (event.target.value.length === 1) {
            // Find the next input element
            const nextInput = event.target.nextElementSibling;
            // If the next element exists, set focus on it
            if (nextInput) {
                nextInput.focus();
            }
        }
    }

    // Assign the event handler for all input fields
    inputs.forEach(input => {
        input.addEventListener('input', moveFocus);
    });

    // Function to clear all input fields
    function clearInputs() {
        inputs.forEach(input => {
            input.value = ''; // Clear the field value
        });
    }

    // Dynamically update the year in the footer
    document.getElementById("year").textContent = new Date().getFullYear();
});
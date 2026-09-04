function openTelemostModal() {
    document.getElementById("telemostModal").classList.add("active");

    setTimeout(function() {
        document.getElementById("telemostCode").focus();
    }, 100);
}

function closeTelemostModal() {
    document.getElementById("telemostModal").classList.remove("active");
}

function joinTelemost() {

    const code = document
        .getElementById("telemostCode")
        .value
        .trim();

    if (!code) {
        alert("Введите код встречи");
        return;
    }

    const url = "https://telemost.yandex.ru/j/" + code;

    window.open(url, "_blank");

}

document.getElementById("telemostCode").addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        joinTelemost();
    }

});

document.getElementById("telemostModal").addEventListener("click", function(event) {

    if (event.target === this) {
        closeTelemostModal();
    }

});

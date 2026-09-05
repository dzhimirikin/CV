/* ============================================================
   TELEMOST ENCRYPTED DATA
============================================================ */

const telemostSalt =
    "tQdMnCkyPjhfPZbzFfr11A==";

const telemostIV =
    "SJuPUvhwu93wcHfz";

const telemostData =
    "P2rqvLobjhzYGemIO4AoM9IeJJP3o07WtxQDMO+Q";


/* ============================================================
   BASE64 → BYTES
============================================================ */

function base64ToBytes(base64) {

    const binary =
        atob(base64);

    const bytes =
        new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {

        bytes[i] =
            binary.charCodeAt(i);

    }

    return bytes;
}


/* ============================================================
   SHA-256 KEY
============================================================ */

async function makeKey(code, salt) {

    const encoder =
        new TextEncoder();

    const data =
        encoder.encode(code);

    const combined =
        new Uint8Array(
            salt.length + data.length
        );

    combined.set(salt, 0);

    combined.set(data, salt.length);

    const hash =
        await crypto.subtle.digest(
            "SHA-256",
            combined
        );

    return crypto.subtle.importKey(
        "raw",
        hash,
        {
            name: "AES-GCM"
        },
        false,
        ["decrypt"]
    );
}


/* ============================================================
   DECRYPT CONFERENCE NUMBER
============================================================ */

async function decryptConference(code) {

    try {

        const salt =
            base64ToBytes(
                telemostSalt
            );

        const iv =
            base64ToBytes(
                telemostIV
            );

        const encrypted =
            base64ToBytes(
                telemostData
            );

        const key =
            await makeKey(
                code,
                salt
            );

        const decrypted =
            await crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: iv
                },
                key,
                encrypted
            );

        return new TextDecoder()
            .decode(decrypted);

    } catch (error) {

        return null;

    }
}


/* ============================================================
   OPEN WINDOW
============================================================ */

function openTelemostModal() {

    const modal =
        document.getElementById(
            "telemostModal"
        );

    modal.classList.add("active");

    const input =
        document.getElementById(
            "telemostCode"
        );

    input.value = "";

    input.placeholder =
        "Код встречи";

    input.classList.remove(
        "telemost-error"
    );

    setTimeout(function() {

        input.focus();

    }, 100);
}


/* ============================================================
   CLOSE WINDOW
============================================================ */

function closeTelemostModal() {

    document
        .getElementById(
            "telemostModal"
        )
        .classList.remove(
            "active"
        );
}


/* ============================================================
   JOIN TELEMOST
============================================================ */

async function joinTelemost() {

    const input =
        document.getElementById(
            "telemostCode"
        );

    const code =
        input.value.trim();


    if (!code) {

        showTelemostError(
            "Введите код"
        );

        return;
    }


    input.disabled = true;


    const conference =
        await decryptConference(code);


    input.disabled = false;


    if (!conference) {

        showTelemostError(
            "Неверный код"
        );

        return;
    }


    const url =
        "https://telemost.yandex.ru/j/"
        + conference;


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

    closeTelemostModal();
}


/* ============================================================
   ERROR
============================================================ */

function showTelemostError(message) {

    const input =
        document.getElementById(
            "telemostCode"
        );

    input.value = "";

    input.placeholder =
        message;

    input.classList.add(
        "telemost-error"
    );

    input.focus();


    setTimeout(function() {

        input.classList.remove(
            "telemost-error"
        );

        input.placeholder =
            "Код встречи";

    }, 1800);
}


/* ============================================================
   ENTER KEY
============================================================ */

document
    .getElementById(
        "telemostCode"
    )
    .addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                joinTelemost();

            }

        }
    );


/* ============================================================
   CLICK OUTSIDE
============================================================ */

document
    .getElementById(
        "telemostModal"
    )
    .addEventListener(
        "click",
        function(event) {

            if (event.target === this) {

                closeTelemostModal();

            }

        }
    );

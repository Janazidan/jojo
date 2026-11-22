/* =====================================================
   RAFIQ - COMMUNITY
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const consent =
        document.getElementById("community-consent");

    const joinButton =
        document.getElementById("join-community");

    const error =
        document.getElementById("community-error");


    /* WhatsApp Community Link */

    const communityLink =
        "https://chat.whatsapp.com/DgS8JWiB9a00dnSTjtQCuX";


    /* =========================================
       Join Community
    ========================================= */

    if (joinButton) {

        joinButton.addEventListener("click", function () {

            error.textContent = "";


            /* Check privacy consent */

            if (!consent.checked) {

                error.textContent =
                    "اقرأ تنبيه الخصوصية ووافق عليه قبل المتابعة.";

                consent.focus();

                return;
            }


            /* Open WhatsApp */

            window.location.href = communityLink;

        });

    }


    /* =========================================
       Clear Error
    ========================================= */

    if (consent) {

        consent.addEventListener("change", function () {

            if (consent.checked) {
                error.textContent = "";
            }

        });

    }

});
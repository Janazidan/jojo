/* =====================================================
   RAFIQ — SMART BACK NAVIGATION
===================================================== */

(function () {

    const STORAGE_KEY = "rafiqPreviousPage";


    /* ---------------------------------------------
       Save current page before opening side tools
    --------------------------------------------- */

    document.addEventListener("click", function (event) {

        const link = event.target.closest("a");

        if (!link) return;


        const href = link.getAttribute("href");

        if (!href) return;


        const sidePages = [
            "problem.html",
            "services.html",
            "food.html",
            "stay.html",
            "experiences.html",
            "community.html"
        ];


        const isSidePage =
            sidePages.some(function (page) {
                return href.includes(page);
            });


        if (!isSidePage) return;


        const currentPage =
            window.location.pathname.split("/").pop();


        /* لا نحفظ صفحة جانبية فوق صفحة جانبية */
        const currentIsSidePage =
            sidePages.includes(currentPage);


        if (currentIsSidePage) return;


        sessionStorage.setItem(
            STORAGE_KEY,
            currentPage + window.location.search
        );

    });



    /* ---------------------------------------------
       Smart back buttons
    --------------------------------------------- */

    const smartBackButtons =
        document.querySelectorAll("[data-smart-back]");


    smartBackButtons.forEach(function (button) {

        button.addEventListener("click", function (event) {

            event.preventDefault();


            const previousPage =
                sessionStorage.getItem(STORAGE_KEY);


            if (previousPage) {

                window.location.href =
                    previousPage;

                return;
            }


            /* fallback */
            window.location.href =
                "index.html";

        });

    });

})();
/* =====================================================
   RAFIQ - PATIENT EXPERIENCES
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const experiencesList =
        document.getElementById("experiences-list");

    const emptyState =
        document.getElementById("experiences-empty");

    const filterButtons =
        document.querySelectorAll(".experience-filter");


    /* =========================================
       Demo Experiences

       Prototype content only.
       Replace with real approved experiences later.
    ========================================= */

    const demoExperiences = [

        {
            id: "demo-1",

            category:
                "الطريق والوصول",

            summary:
                "واجهت صعوبة في معرفة وسيلة النقل المناسبة، وكان السؤال قبل التحرك أسهل من محاولة تصحيح الطريق بعدين.",

            source:
                "demo"
        },


        {
            id: "demo-2",

            category:
                "داخل المستشفى",

            summary:
                "عند الوصول للمستشفى احتجت أسأل الاستقبال عن المكان الصحيح قبل ما أكمل للقسم.",

            source:
                "demo"
        },


        {
            id: "demo-3",

            category:
                "الاستعداد والمتطلبات",

            summary:
                "مراجعة الأوراق المطلوبة قبل الخروج ساعدتني أتأكد إني ما نسيت شيء مهم.",

            source:
                "demo"
        },


        {
            id: "demo-4",

            category:
                "العودة",

            summary:
                "قبل ما أطلع من المستشفى تأكدت من موعد المتابعة والأوراق اللي لازم أحتفظ فيها.",

            source:
                "demo"
        }

    ];


    /* =========================================
       Get Approved User Experiences
    ========================================= */

    function getSavedExperiences() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        "rafiqExperiences"
                    )
                    ||
                    "[]"
                );


            if (!Array.isArray(saved)) {

                return [];

            }


            return saved;

        }

        catch (error) {

            console.error(
                "Could not read experiences:",
                error
            );

            return [];

        }

    }


    /* =========================================
       Combine
    ========================================= */

    function getAllExperiences() {

        const saved =
            getSavedExperiences();


        return [
            ...saved,
            ...demoExperiences
        ];

    }


    /* =========================================
       Render
    ========================================= */

    function renderExperiences(category = "all") {

        const experiences =
            getAllExperiences();


        const filtered =
            category === "all"
                ?
                experiences
                :
                experiences.filter(
                    function (experience) {

                        return (
                            experience.category ===
                            category
                        );

                    }
                );


        experiencesList.innerHTML = "";


        if (filtered.length === 0) {

            emptyState.hidden = false;

            return;

        }


        emptyState.hidden = true;


        filtered.forEach(
            function (experience) {

                const card =
                    document.createElement("article");


                card.className =
                    "patient-experience-card";


                const badge =
                    document.createElement("span");


                badge.className =
                    "patient-experience-badge";


                badge.textContent =
                    experience.category;


                const text =
                    document.createElement("p");


                text.className =
                    "patient-experience-text";


                text.textContent =
                    experience.summary;


                const footer =
                    document.createElement("div");


                footer.className =
                    "patient-experience-footer";


                const source =
                    document.createElement("span");


                source.textContent =
                    experience.source === "demo"
                        ?
                        "مثال توضيحي للعرض"
                        :
                        "تجربة مريض سابق";


                footer.appendChild(source);


                card.appendChild(badge);

                card.appendChild(text);

                card.appendChild(footer);


                experiencesList.appendChild(
                    card
                );

            }
        );

    }


    /* =========================================
       Filters
    ========================================= */

    filterButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    filterButtons.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    renderExperiences(
                        button.dataset.category
                    );

                }
            );

        }
    );


    /* =========================================
       Initial
    ========================================= */

    renderExperiences();

});
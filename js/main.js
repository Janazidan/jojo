/* =====================================================
   RAFIQ - MAIN JAVASCRIPT

   Handles:
   1. Hospital Selection
   2. Appointment Details
   3. Readiness Checklist
   4. Companion Flow
   5. New Journey
===================================================== */


/* =====================================================
   1. HOSPITAL SELECTION
   readiness.html
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const dropdownButton =
        document.getElementById("hospital-dropdown-button");

    const dropdownMenu =
        document.getElementById("hospital-dropdown-menu");

    const selectedText =
        document.getElementById("selected-hospital-text");

    const continueButton =
        document.getElementById("continue-hospital");

    const message =
        document.getElementById("hospital-message");


    if (
        !dropdownButton ||
        !dropdownMenu ||
        !selectedText ||
        !continueButton
    ) {
        return;
    }


    let selectedHospital = null;


    const savedHospital =
        localStorage.getItem("selectedHospital");

    const savedHospitalName =
        localStorage.getItem("selectedHospitalName");


    /* Restore hospital */

    if (savedHospital && savedHospitalName) {

        selectedHospital = {
            value: savedHospital,
            name: savedHospitalName
        };

        selectedText.textContent =
            savedHospitalName;
    }


    /* Open / close dropdown */

    dropdownButton.addEventListener(
        "click",
        function () {

            dropdownMenu.classList.toggle("show");

            dropdownButton.classList.toggle("open");


            const isOpen =
                dropdownMenu.classList.contains("show");


            dropdownButton.setAttribute(
                "aria-expanded",
                isOpen
            );
        }
    );


    /* Hospital options */

    const hospitalOptions =
        document.querySelectorAll(
            ".hospital-dropdown-option"
        );


    hospitalOptions.forEach(function (option) {

        option.addEventListener(
            "click",
            function () {

                selectedHospital = {
                    value: option.dataset.value,
                    name: option.dataset.name
                };


                selectedText.textContent =
                    selectedHospital.name;


                dropdownMenu.classList.remove("show");

                dropdownButton.classList.remove("open");


                dropdownButton.setAttribute(
                    "aria-expanded",
                    "false"
                );


                if (message) {
                    message.textContent = "";
                }
            }
        );

    });


    /* Continue */

    continueButton.addEventListener(
        "click",
        function () {

            if (!selectedHospital) {

                if (message) {

                    message.textContent =
                        "اختر المستشفى أولاً حتى نكمل رحلتك.";
                }

                return;
            }


            localStorage.setItem(
                "selectedHospital",
                selectedHospital.value
            );


            localStorage.setItem(
                "selectedHospitalName",
                selectedHospital.name
            );


            window.location.href =
                "appointment.html";
        }
    );


    /* Close dropdown outside */

    document.addEventListener(
        "click",
        function (event) {

            if (
                !dropdownButton.contains(event.target) &&
                !dropdownMenu.contains(event.target)
            ) {

                dropdownMenu.classList.remove("show");

                dropdownButton.classList.remove("open");


                dropdownButton.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        }
    );

});



/* =====================================================
   2. APPOINTMENT DETAILS
   appointment.html
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const hospitalName =
        document.getElementById(
            "appointment-hospital"
        );

    const dateInput =
        document.getElementById(
            "appointment-date"
        );

    const timeInput =
        document.getElementById(
            "appointment-time"
        );

    const continueButton =
        document.getElementById(
            "continue-appointment"
        );

    const message =
        document.getElementById(
            "appointment-message"
        );


    if (
        !hospitalName ||
        !dateInput ||
        !timeInput ||
        !continueButton
    ) {
        return;
    }


    /* Hospital */

    const selectedHospitalName =
        localStorage.getItem(
            "selectedHospitalName"
        );


    hospitalName.textContent =
        selectedHospitalName ||
        "المستشفى المختار";


    /* Restore appointment */

    const savedDate =
        localStorage.getItem(
            "appointmentDate"
        );

    const savedTime =
        localStorage.getItem(
            "appointmentTime"
        );


    if (savedDate) {

        dateInput.value =
            savedDate;
    }


    if (savedTime) {

        timeInput.value =
            savedTime;
    }


    /* Clear error */

    dateInput.addEventListener(
        "change",
        function () {

            if (message) {
                message.textContent = "";
            }
        }
    );


    timeInput.addEventListener(
        "change",
        function () {

            if (message) {
                message.textContent = "";
            }
        }
    );


    /* Continue */

    continueButton.addEventListener(
        "click",
        function () {

            const appointmentDate =
                dateInput.value;

            const appointmentTime =
                timeInput.value;


            if (
                !appointmentDate ||
                !appointmentTime
            ) {

                if (message) {

                    message.textContent =
                        "أدخل تاريخ ووقت الموعد حتى نكمل.";
                }

                return;
            }


            localStorage.setItem(
                "appointmentDate",
                appointmentDate
            );


            localStorage.setItem(
                "appointmentTime",
                appointmentTime
            );


            window.location.href =
                "checklist.html";
        }
    );

});



/* =====================================================
   3. READINESS CHECKLIST
   checklist.html
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const checkButton =
        document.getElementById(
            "check-readiness"
        );

    const result =
        document.getElementById(
            "readiness-result"
        );


    if (!checkButton || !result) {
        return;
    }



    /* =================================================
       CHECKLIST FIELDS
    ================================================= */

    const checklistFields = [

        "patient-id",
        "appointment-proof",
        "permit",
        "magnetic-card",
        "has-companion",
        "companion-id",
        "companion-permit",
        "companion-magnetic"

    ];



    /* =================================================
       RESTORE SAVED ANSWERS
    ================================================= */

    checklistFields.forEach(
        function (fieldName) {

            const savedValue =
                localStorage.getItem(
                    "checklist-" + fieldName
                );


            if (!savedValue) {
                return;
            }


            const savedInput =
                document.querySelector(
                    `input[name="${fieldName}"][value="${savedValue}"]`
                );


            if (savedInput) {

                savedInput.checked = true;
            }
        }
    );



    /* =================================================
       SAVE ANSWERS
    ================================================= */

    checklistFields.forEach(
        function (fieldName) {

            const inputs =
                document.querySelectorAll(
                    `input[name="${fieldName}"]`
                );


            inputs.forEach(
                function (input) {

                    input.addEventListener(
                        "change",
                        function () {

                            localStorage.setItem(
                                "checklist-" + fieldName,
                                input.value
                            );
                        }
                    );

                }
            );
        }
    );



    /* =================================================
       TRIP SUMMARY
    ================================================= */

    const hospitalName =
        localStorage.getItem(
            "selectedHospitalName"
        );

    const appointmentDate =
        localStorage.getItem(
            "appointmentDate"
        );

    const appointmentTime =
        localStorage.getItem(
            "appointmentTime"
        );


    const hospitalDisplay =
        document.getElementById(
            "checklist-hospital"
        );

    const appointmentHospital =
        document.getElementById(
            "appointment-hospital-name"
        );

    const appointmentDisplay =
        document.getElementById(
            "checklist-appointment"
        );


    if (hospitalName) {

        if (hospitalDisplay) {

            hospitalDisplay.textContent =
                hospitalName;
        }


        if (appointmentHospital) {

            appointmentHospital.textContent =
                hospitalName;
        }
    }


    if (appointmentDisplay) {

        if (
            appointmentDate &&
            appointmentTime
        ) {

            appointmentDisplay.textContent =
                appointmentDate +
                " — " +
                appointmentTime;

        } else {

            appointmentDisplay.textContent =
                "تفاصيل الموعد";
        }
    }



    /* =================================================
       REQUIREMENT HELP
    ================================================= */

    const mainRequirements = [

        "patient-id",
        "appointment-proof",
        "permit",
        "magnetic-card"

    ];


    mainRequirements.forEach(
        function (name) {

            const inputs =
                document.querySelectorAll(
                    `input[name="${name}"]`
                );


            inputs.forEach(
                function (input) {

                    input.addEventListener(
                        "change",
                        function () {

                            updateRequirementHelp(
                                name
                            );
                        }
                    );

                }
            );


            updateRequirementHelp(name);
        }
    );


    function updateRequirementHelp(name) {

        const selected =
            document.querySelector(
                `input[name="${name}"]:checked`
            );

        const help =
            document.querySelector(
                `[data-help-for="${name}"]`
            );


        if (!help) {
            return;
        }


        if (
            selected &&
            selected.value === "missing"
        ) {

            help.classList.add("show");

        } else {

            help.classList.remove("show");
        }
    }



    /* =================================================
       COMPANION FLOW
    ================================================= */

    const hasCompanionInputs =
        document.querySelectorAll(
            'input[name="has-companion"]'
        );


    const companionSection =
        document.getElementById(
            "companion-requirements"
        );


    const companionRequestAction =
        document.getElementById(
            "companion-request-action"
        );


    const companionRequestStarted =
        localStorage.getItem(
            "companionRequestStarted"
        );


    /*
       هل المستخدم اختار إنه
       ما بحتاج مرافق وبكمل لحاله؟
    */

    let continueWithoutCompanion =
        localStorage.getItem(
            "continueWithoutCompanion"
        ) === "true";


    const continueWithoutCompanionButton =
        document.getElementById(
            "continue-without-companion"
        );



    /* =================================================
       CONTINUE WITHOUT COMPANION
    ================================================= */

    if (continueWithoutCompanionButton) {

        /*
           Restore previous choice
        */

        if (continueWithoutCompanion) {

            showContinueAloneSelected();
        }


        continueWithoutCompanionButton.addEventListener(
            "click",
            function () {

                continueWithoutCompanion = true;


                localStorage.setItem(
                    "continueWithoutCompanion",
                    "true"
                );


                showContinueAloneSelected();


                /*
                   إذا كان في نتيجة قديمة
                   نخفيها حتى يعيد الفحص
                */

                result.innerHTML = "";
            }
        );
    }


    function showContinueAloneSelected() {

        if (!continueWithoutCompanionButton) {
            return;
        }


        continueWithoutCompanionButton.classList.add(
            "selected"
        );


        continueWithoutCompanionButton.innerHTML = `
            <i class="fa-solid fa-check"></i>

            <span>
                تمام، بكمل لحالي
            </span>
        `;
    }



    /* =================================================
       RESTORE COMPANION SCREEN
    ================================================= */

    const savedHasCompanion =
        localStorage.getItem(
            "checklist-has-companion"
        );


    if (savedHasCompanion === "yes") {

        showCompanionDocuments();

    } else if (
        savedHasCompanion === "no"
    ) {

        showCompanionRequest();
    }



    /* =================================================
       COMPANION YES / NO
    ================================================= */

    hasCompanionInputs.forEach(
        function (input) {

            input.addEventListener(
                "change",
                function () {


                    /*
                       معه مرافق
                    */

                    if (input.value === "yes") {

                        /*
                           إلغاء اختيار:
                           بكمل لحالي
                        */

                        continueWithoutCompanion =
                            false;


                        localStorage.removeItem(
                            "continueWithoutCompanion"
                        );


                        if (
                            continueWithoutCompanionButton
                        ) {

                            continueWithoutCompanionButton
                                .classList
                                .remove("selected");
                        }


                        showCompanionDocuments();


                    /*
                       ما معه مرافق
                    */

                    } else {

                        showCompanionRequest();

                        clearCompanionDocuments();
                    }


                    /*
                       إزالة نتيجة الفحص القديمة
                    */

                    result.innerHTML = "";
                }
            );

        }
    );



    /* =================================================
       SHOW COMPANION DOCUMENTS
    ================================================= */

    function showCompanionDocuments() {

        if (companionSection) {

            companionSection.classList.add(
                "show"
            );
        }


        if (companionRequestAction) {

            companionRequestAction.classList.remove(
                "show"
            );
        }
    }



    /* =================================================
       SHOW COMPANION REQUEST / CONTINUE ALONE
    ================================================= */

    function showCompanionRequest() {

        if (companionSection) {

            companionSection.classList.remove(
                "show"
            );
        }


        if (!companionRequestAction) {
            return;
        }


        companionRequestAction.classList.add(
            "show"
        );


        /*
           إذا المستخدم بدأ طلب مرافق سابقًا
           ما بنعتبر الطلب "تم إرساله".
           فقط بنوضح إنه تم تجهيز/فتح الطلب.
        */

        if (
            companionRequestStarted === "true"
        ) {

            companionRequestAction.innerHTML = `

                <div class="companion-request-icon">

                    <i class="fa-solid fa-hand-holding-heart"></i>

                </div>


                <div class="companion-request-content">

                    <strong>
                        تم تجهيز طلب المرافق
                    </strong>


                    <p>
                        تم فتح الطلب عبر WhatsApp.
                        إذا لسا بحاجة لمرافق،
                        بتقدر تفتح الطلب مرة ثانية.
                        وإذا قررت تكمل لحالك،
                        اختار الخيار بالأسفل.
                    </p>


                    <div class="companion-action-buttons">

                        <button
                            type="button"
                            class="continue-alone-btn"
                            id="continue-without-companion-restored"
                        >

                            <i class="fa-solid fa-person-walking"></i>

                            <span>
                                ما بحتاج مرافق، بكمل لحالي
                            </span>

                        </button>


                        <a
                            href="companion-request.html"
                            class="primary-btn companion-request-btn"
                        >

                            <i class="fa-solid fa-user-plus"></i>

                            <span>
                                فتح طلب المرافق
                            </span>

                        </a>

                    </div>

                </div>
            `;


            const restoredContinueButton =
                document.getElementById(
                    "continue-without-companion-restored"
                );


            if (restoredContinueButton) {

                if (continueWithoutCompanion) {

                    restoredContinueButton
                        .classList
                        .add("selected");


                    restoredContinueButton.innerHTML = `
                        <i class="fa-solid fa-check"></i>

                        <span>
                            تمام، بكمل لحالي
                        </span>
                    `;
                }


                restoredContinueButton.addEventListener(
                    "click",
                    function () {

                        continueWithoutCompanion =
                            true;


                        localStorage.setItem(
                            "continueWithoutCompanion",
                            "true"
                        );


                        restoredContinueButton
                            .classList
                            .add("selected");


                        restoredContinueButton.innerHTML = `
                            <i class="fa-solid fa-check"></i>

                            <span>
                                تمام، بكمل لحالي
                            </span>
                        `;


                        result.innerHTML = "";
                    }
                );
            }
        }
    }



    /* =================================================
       CLEAR COMPANION DOCUMENTS
    ================================================= */

    function clearCompanionDocuments() {

        const companionFields = [

            "companion-id",
            "companion-permit",
            "companion-magnetic"

        ];


        companionFields.forEach(
            function (fieldName) {

                const inputs =
                    document.querySelectorAll(
                        `input[name="${fieldName}"]`
                    );


                inputs.forEach(
                    function (input) {

                        input.checked = false;
                    }
                );


                localStorage.removeItem(
                    "checklist-" + fieldName
                );
            }
        );
    }



    /* =================================================
       CHECK READINESS
    ================================================= */

    checkButton.addEventListener(
        "click",
        function () {


            const requirements = [

                {
                    name: "patient-id",
                    title: "الهوية الشخصية"
                },

                {
                    name: "appointment-proof",
                    title: "إثبات الموعد"
                },

                {
                    name: "permit",
                    title: "التصريح"
                },

                {
                    name: "magnetic-card",
                    title: "البطاقة الممغنطة"
                }

            ];


            const missing = [];

            const unanswered = [];



            /* =========================================
               PATIENT REQUIREMENTS
            ========================================== */

            requirements.forEach(
                function (requirement) {

                    const selected =
                        document.querySelector(
                            `input[name="${requirement.name}"]:checked`
                        );


                    if (!selected) {

                        unanswered.push(
                            requirement.title
                        );

                        return;
                    }


                    if (
                        selected.value === "missing"
                    ) {

                        missing.push(
                            requirement.title
                        );
                    }
                }
            );



            /* =========================================
               COMPANION
            ========================================== */

            const hasCompanion =
                document.querySelector(
                    'input[name="has-companion"]:checked'
                );


            if (!hasCompanion) {

                unanswered.push(
                    "هل معك مرافق؟"
                );


            } else if (
                hasCompanion.value === "yes"
            ) {


                /*
                   فقط إذا معه مرافق
                   نفحص أوراق المرافق
                */

                const companionRequirements = [

                    {
                        name: "companion-id",
                        title: "هوية المرافق"
                    },

                    {
                        name: "companion-permit",
                        title: "تصريح المرافق"
                    },

                    {
                        name: "companion-magnetic",
                        title: "البطاقة الممغنطة للمرافق"
                    }

                ];


                companionRequirements.forEach(
                    function (requirement) {

                        const selected =
                            document.querySelector(
                                `input[name="${requirement.name}"]:checked`
                            );


                        if (!selected) {

                            unanswered.push(
                                requirement.title
                            );

                            return;
                        }


                        if (
                            selected.value ===
                            "missing"
                        ) {

                            missing.push(
                                requirement.title
                            );
                        }
                    }
                );
            }



            /* =========================================
               UNANSWERED
            ========================================== */

            if (unanswered.length > 0) {

                result.innerHTML = `

                    <div class="result-warning">

                        <div class="result-icon">
                            ?
                        </div>


                        <h2>
                            لسا في أسئلة ما جاوبتها
                        </h2>


                        <p>
                            تأكد من:
                        </p>


                        <div class="problem-list">

                            ${
                                unanswered.map(
                                    function (item) {

                                        return `
                                            <div class="problem-item">
                                                ${item}
                                            </div>
                                        `;
                                    }
                                ).join("")
                            }

                        </div>

                    </div>
                `;


                showResult();

                return;
            }



            /* =========================================
               MISSING REQUIREMENTS
            ========================================== */

            if (missing.length > 0) {

                localStorage.setItem(
                    "readinessStatus",
                    "not-ready"
                );


                result.innerHTML = `

                    <div class="result-not-ready">

                        <div class="result-icon">
                            !
                        </div>


                        <h2>
                            لسا مش جاهز للرحلة
                        </h2>


                        <p>
                            في أشياء لازم تجهزها
                            قبل ما تبدأ.
                        </p>


                        <div class="problem-list">

                            ${
                                missing.map(
                                    function (item) {

                                        return `
                                            <div class="problem-item">
                                                ${item}
                                            </div>
                                        `;
                                    }
                                ).join("")
                            }

                        </div>


                        <div class="next-action-box">

                            <strong>
                                خطوتك التالية
                            </strong>

                            <p>
                                جهّز المتطلبات الناقصة،
                                وبعدها راجع جاهزيتك مرة ثانية.
                            </p>

                        </div>

                    </div>
                `;


                showResult();

                return;
            }



            /* =========================================
               NO COMPANION
               المستخدم لازم يحدد:
               يكمل لحاله أو يحتاج مرافق
            ========================================== */

            if (
                hasCompanion &&
                hasCompanion.value === "no" &&
                !continueWithoutCompanion
            ) {

                /*
                   مهم:
                   لا نقول له "مش جاهز"
                   لأنه ممكن ما يحتاج مرافق أصلًا.
                */

                localStorage.removeItem(
                    "readinessStatus"
                );


                result.innerHTML = `

                    <div class="result-warning">

                        <div class="result-icon">
                            ?
                        </div>


                        <h2>
                            قبل ما نكمل
                        </h2>


                        <p>
                            اختر إذا بدك تكمل رحلتك لحالك
                            أو إذا كنت بحاجة لطلب مرافق.
                        </p>


                        <div class="next-action-box">

                            <strong>
                                ما معك مرافق حاليًا
                            </strong>

                            <p>
                                إذا ما بتحتاج مرافق،
                                اختار "بكمل لحالي" بالأعلى.
                                وإذا بتحتاج مساعدة،
                                اختار طلب مرافق.
                            </p>

                        </div>

                    </div>
                `;


                showResult();

                return;
            }



            /* =========================================
               READY
            ========================================== */

            localStorage.setItem(
                "readinessStatus",
                "ready"
            );


            /*
               إذا اختار:
               لا يوجد مرافق + بكمل لحالي

               هذا طبيعي ولا يمنعه من الجاهزية.
            */

            let readyMessage =
                "حسب المعلومات التي أدخلتها، متطلبات رحلتك الأساسية جاهزة.";


            if (
                hasCompanion &&
                hasCompanion.value === "no" &&
                continueWithoutCompanion
            ) {

                readyMessage =
                    "حسب المعلومات التي أدخلتها، متطلبات رحلتك الأساسية جاهزة، وبتقدر تكمل رحلتك بدون مرافق.";
            }


            result.innerHTML = `

                <div class="result-ready">

                    <div class="result-icon">
                        ✓
                    </div>


                    <h2>
                        أنت جاهز للرحلة
                    </h2>


                    <p>
                        ${readyMessage}
                    </p>


                    <a
                        href="journey.html"
                        class="primary-btn"
                    >

                        <i class="fa-solid fa-route"></i>

                        <span>
                            ابدأ الرحلة
                        </span>

                    </a>

                </div>
            `;


            showResult();

        }
    );



    /* =================================================
       SHOW RESULT
    ================================================= */

    function showResult() {

        result.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

});



/* =====================================================
   4. NEW JOURNEY

   نمسح بيانات الرحلة فقط.
   لا نمسح إعدادات المستخدم مثل حجم الخط.
===================================================== */

window.startNewRafiqJourney =
    function () {


        const journeyKeys = [


            /* Hospital */

            "selectedHospital",
            "selectedHospitalName",


            /* Appointment */

            "appointmentDate",
            "appointmentTime",


            /* Checklist */

            "checklist-patient-id",
            "checklist-appointment-proof",
            "checklist-permit",
            "checklist-magnetic-card",
            "checklist-has-companion",


            /* Continue alone */

            "continueWithoutCompanion",


            /* Companion documents */

            "checklist-companion-id",
            "checklist-companion-permit",
            "checklist-companion-magnetic",


            /* Companion request */

            "companionRequestStarted",
            "companionRequestName",
            "companionRequestPhone",


            /* Readiness */

            "readinessStatus",


            /* Current journey page */

            "rafiqCurrentPage",


            /* Hospital stage */

            "rafiqHospitalIdReady",
            "rafiqHospitalAppointmentReady",
            "rafiqHospitalInsuranceReady",
            "rafiqHospitalDocuments",
            "rafiqDepartment",


            /* Follow-up */

            "rafiqFollowUpDate",
            "rafiqFollowUpTime"

        ];


        journeyKeys.forEach(
            function (key) {

                localStorage.removeItem(key);
            }
        );


        window.location.href =
            "readiness.html";
    };
    /* =====================================================
   START JOURNEY - PHONE MODAL
===================================================== */

window.openJourneyLogin = function () {

    const modal =
        document.getElementById("journey-login-modal");

    const phoneInput =
        document.getElementById("journey-phone");

    const error =
        document.getElementById("journey-phone-error");

    if (!modal) return;

    error.textContent = "";
    phoneInput.value = "";

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    setTimeout(function () {
        phoneInput.focus();
    }, 150);
};


window.closeJourneyLogin = function () {

    const modal =
        document.getElementById("journey-login-modal");

    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
};


window.continueNewJourney = function () {

    const phoneInput =
        document.getElementById("journey-phone");

    const error =
        document.getElementById("journey-phone-error");

    const phone =
        phoneInput.value.replace(/\D/g, "");

    if (phone.length < 9 || phone.length > 10) {

        error.textContent =
            "أدخل رقم موبايل صحيح للمتابعة.";

        phoneInput.focus();

        return;
    }

    /*
       نحفظ الرقم بشكل منفصل عن بيانات الرحلة
       حتى startNewRafiqJourney ما يمسحه
    */
    localStorage.setItem(
        "rafiqUserPhone",
        phone
    );

    closeJourneyLogin();

    /*
       نستعمل نفس دالة بدء الرحلة الموجودة أصلًا
       بدون تغيير منطق المشروع
    */
    startNewRafiqJourney();
};

/* =========================================
   BEFORE JOURNEY GUIDANCE
========================================= */

window.openPreparationGuide = function () {
    const dialog = document.getElementById("preparation-guide");

    if (!dialog) return;

    showGuideMain();

    if (!dialog.open) {
        dialog.showModal();
    }
};


window.closePreparationGuide = function () {
    const dialog = document.getElementById("preparation-guide");

    if (dialog && dialog.open) {
        dialog.close();
    }
};


window.showGuideMain = function () {

    const main = document.getElementById("guide-main");
    const referral = document.getElementById("guide-referral");
    const permit = document.getElementById("guide-permit");

    if (main) main.style.display = "block";
    if (referral) referral.style.display = "none";
    if (permit) permit.style.display = "none";
};


window.showReferralGuide = function () {

    document.getElementById("guide-main").style.display = "none";
    document.getElementById("guide-referral").style.display = "block";
    document.getElementById("guide-permit").style.display = "none";
};


window.showPermitGuide = function () {

    document.getElementById("guide-main").style.display = "none";
    document.getElementById("guide-referral").style.display = "none";
    document.getElementById("guide-permit").style.display = "block";
};
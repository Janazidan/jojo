document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
   SAVE CURRENT JOURNEY PAGE
===================================================== */

const currentPage =
    window.location.pathname.split("/").pop();

if (
    currentPage === "hospital.html" ||
    currentPage === "hospital-guide.html"
) {
    localStorage.setItem(
        "rafiqCurrentPage",
        currentPage
    );
}
/* =====================================================
   hospital.html
   Arrival Checklist
===================================================== */

const hospitalContinue =
    document.getElementById("hospital-continue");


if (hospitalContinue) {

    hospitalContinue.addEventListener("click", function () {

        /* =========================
           العناصر
        ========================== */

        const idCheckbox =
            document.getElementById("hc-id");

        const appointmentCheckbox =
            document.getElementById("hc-appointment");

        const insuranceCheckbox =
            document.getElementById("hc-insurance");

        const documentsCheckbox =
            document.getElementById("hc-documents");

        const note =
            document.getElementById(
                "hospital-checklist-note"
            );

        const missingItemsText =
            document.getElementById(
                "hospital-missing-items"
            );


        /* =========================
           تحديد الأشياء الناقصة
        ========================== */

        const missingItems = [];


        /* الهوية */

        if (!idCheckbox.checked) {

            missingItems.push(
                "هوية المريض"
            );
        }


        /* إثبات الموعد */

        if (!appointmentCheckbox.checked) {

            missingItems.push(
                "إثبات الموعد"
            );
        }


        /* التأمين الصحي */

        if (!insuranceCheckbox.checked) {

            missingItems.push(
                "التأمين الصحي"
            );
        }


        /* وثائق الزيارة */

        if (!documentsCheckbox.checked) {

            missingItems.push(
                "وثائق الزيارة"
            );
        }


        /* =========================
           إذا في شيء ناقص
        ========================== */

        if (missingItems.length > 0) {

            note.style.display =
                "block";


            missingItemsText.textContent =
                "لسا ناقصك: " +
                missingItems.join("، ") +
                ".";


            note.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });


            return;
        }


        /* =========================
           كل شيء جاهز
        ========================== */

        note.style.display =
            "none";


        /* حفظ حالة الـ Checklist */

        localStorage.setItem(
            "rafiqHospitalIdReady",
            "true"
        );


        localStorage.setItem(
            "rafiqHospitalAppointmentReady",
            "true"
        );


        localStorage.setItem(
            "rafiqHospitalInsuranceReady",
            "true"
        );


        localStorage.setItem(
            "rafiqHospitalDocuments",
            "ready"
        );


        /* الانتقال إلى دليل المستشفى */

        window.location.href =
            "hospital-guide.html";

    });

}
        const hospitalNameEl =
        document.getElementById("hg-hospital-name");

let selectedHospital =
    localStorage.getItem("selectedHospitalName") ||
    "المستشفى المختار";

if (hospitalNameEl) {
    hospitalNameEl.textContent = selectedHospital;
}


    const DEPARTMENTS = {
        "reception-emergency": {
            name: "الإسعاف والطوارئ",
            floor: "الطابق الأرضي والتسوية",
            detail: "المدخل المباشر للحالات العاجلة."
        },
        "radiology": {
            name: "الأشعة التشخيصية",
            floor: "الطابق الأرضي والتسوية",
            detail: "يشمل التصوير الطبقي والرنين المغناطيسي والأشعة السينية."
        },
        "labs": {
            name: "المختبرات الطبية وبنك الدم",
            floor: "الطابق الأرضي والتسوية",
            detail: "لسهولة سحب العينات وفحوصات بنك الدم."
        },
        "pharmacy": {
            name: "الصيدلية الرئيسية",
            floor: "الطابق الأرضي والتسوية",
            detail: "بجانب قسم المحاسبة والتسجيل."
        },
        "outpatient": {
            name: "العيادات الخارجية",
            floor: "الطابق الأرضي والتسوية",
            detail: "بمبنى العيادات الملحق، لاستقبال المراجعين اليوميين."
        },
        "obgyn": {
            name: "النسائية والتوليد",
            floor: "الطابق الأول",
            detail: "يشمل غرف الولادة وجناح جراحة النساء وقسم رعاية ما بعد الولادة."
        },
        "nicu": {
            name: "العناية المكثفة لحديثي الولادة (الخداج)",
            floor: "الطابق الأول",
            detail: "بالقرب المباشر من غرف الولادة."
        },
        "internal-men": {
            name: "الطب الباطني (رجال)",
            floor: "الطابق الأول",
            detail: "أجنحة مخصصة لإقامة المرضى ومتابعتهم."
        },
        "neurosurgery": {
            name: "جراحة الدماغ والأعصاب",
            floor: "الطابق الثاني",
            detail: "هذا الجناح يخضع حاليًا لمشاريع توسعة وترميم."
        },
        "major-surgery": {
            name: "العمليات الكبرى",
            floor: "الطابق الثاني",
            detail: "غرف العمليات المركزية المجهزة للجراحات المعقدة."
        },
        "icu": {
            name: "العناية الحثيثة (ICU)",
            floor: "الطابق الثاني",
            detail: "للرعاية المركزة بعد الجراحات أو الحالات الحرجة."
        },
        "pediatrics": {
            name: "الأطفال وجراحة قلب الأطفال",
            floor: "الطوابق العليا",
            detail: "أقسام منفصلة توفر الهدوء والرعاية المناسبة للأطفال."
        },
        "dialysis": {
            name: "وحدة غسيل الكلى (الكلية الصناعية)",
            floor: "الطوابق العليا",
            detail: "جناح مخصص ومجهز لمرضى الفشل الكلوي."
        }
    };


    const departmentSelect =
        document.getElementById("hg-department-select");

    let selectedDepartment = null;
    const savedDepartment =
    localStorage.getItem("rafiqDepartment");

if (
    savedDepartment &&
    DEPARTMENTS[savedDepartment]
) {

    selectedDepartment =
        DEPARTMENTS[savedDepartment];

    if (departmentSelect) {
        departmentSelect.value =
            savedDepartment;
    }
}
    if (departmentSelect) {

        departmentSelect.addEventListener("change", function () {

            const departmentError =
                document.getElementById("hg-department-error");

            if (departmentError) {
                departmentError.style.display = "none";
            }

            selectedDepartment = DEPARTMENTS[departmentSelect.value] || null;
            localStorage.setItem("rafiqDepartment", departmentSelect.value);

            renderStep();

        });

    }


    /* ===== hospital-guide.html: Route Stepper ===== */

    const nextButton =
        document.getElementById("hg-next-btn");

    let renderStep = function () {};

    if (nextButton) {

    /* ترتيب الطوابق من الأسفل للأعلى، لرسم خريطة الطوابق */
    const FLOOR_ORDER = [
        "الطابق الأرضي والتسوية",
        "الطابق الأول",
        "الطابق الثاني",
        "الطوابق العليا"
    ];

    function renderFloorMap(targetFloor) {

        const mapEl = document.getElementById("hg-floor-map");
        if (!mapEl) return;

        if (!targetFloor) {
            mapEl.style.display = "none";
            return;
        }

        const rowsHtml = FLOOR_ORDER
            .slice()
            .reverse()
            .map(function (floorName) {

                const isActive = floorName === targetFloor;

                return (
                    '<div class="floor-map-row' +
                    (isActive ? " floor-map-row-active" : "") +
                    '">' +
                    (isActive ? '<span class="floor-map-marker">◄ إنت هون</span>' : "") +
                    '<span class="floor-map-name">' + floorName + '</span>' +
                    '</div>'
                );

            })
            .join("");

        mapEl.innerHTML = rowsHtml;
        mapEl.style.display = "block";

    }


    const steps = [
            {
                routeId: "hg-route-reception",
                title: function () {
                    return "توجه إلى استقبال " + selectedHospital;
                },
                desc: "اعرض هويتك وتفاصيل موعدك عند الوصول.",
                buttonText: "وصلت، التالي"
            },
            {
                routeId: "hg-route-floor",
                title: function () {
                    return "شو القسم يلي وجّهوك له بالاستقبال؟";
                },
                desc: function () {
                    return "اختار القسم اللي وجّهوك إله، ورفيق بساعدك تكمل.";
                    },
                note: "",
                buttonText: "وصلت، التالي",
                showDepartmentSelect: true
            },
            {
                routeId: "hg-route-department",
                title: function () {
                    return "توجه إلى " + selectedDepartment.name;
                },
                desc: function () {
                    return selectedDepartment.detail;
                },
                note: "",
                buttonText: "وصلت وأنهيت زيارتي"
            }
        ];

        let currentStep = 0;

        const stepTitle = document.getElementById("hg-step-title");
        const stepDesc = document.getElementById("hg-step-desc");
        const stepNote = document.getElementById("hg-step-note");
        const deptSelectWrap = document.getElementById("hg-department-select-wrap");
        const floorResult = document.getElementById("hg-floor-result");
        const floorResultValue = document.getElementById("hg-floor-result-value");

        renderStep = function () {

            const step = steps[currentStep];

            stepTitle.textContent = step.title();
            stepDesc.textContent = (typeof step.desc === "function") ? step.desc() : step.desc;

            if (step.note) {
                stepNote.textContent = step.note;
                stepNote.style.display = "block";
            } else {
                stepNote.textContent = "";
                stepNote.style.display = "none";
            }

            nextButton.textContent = step.buttonText;

            if (deptSelectWrap) {
                deptSelectWrap.style.display = step.showDepartmentSelect ? "flex" : "none";
            }

            if (floorResult && floorResultValue) {
                if (selectedDepartment) {
                    floorResult.style.display = step.showDepartmentSelect ? "block" : "none";
                    floorResultValue.textContent = selectedDepartment.floor;
                    renderFloorMap(step.showDepartmentSelect ? selectedDepartment.floor : null);
                } else {
                    floorResult.style.display = "none";
                    renderFloorMap(null);
                }
            }

            steps.forEach(function (s, index) {

                const routeEl = document.getElementById(s.routeId);

                const wasDone = routeEl.classList.contains("done-route");

                routeEl.classList.remove("active-route", "done-route");

                if (index < currentStep) {

                    routeEl.classList.add("done-route");

                    if (!wasDone) {
                        routeEl.classList.add("just-done");
                        window.setTimeout(function () {
                            routeEl.classList.remove("just-done");
                        }, 500);
                    }

                } else if (index === currentStep) {
                    routeEl.classList.add("active-route");
                }

            });

        };

        nextButton.addEventListener("click", function () {

            if (currentStep === 1) {

                const departmentSelectEl =
                    document.getElementById("hg-department-select");

                const departmentError =
                    document.getElementById("hg-department-error");

                if (!departmentSelectEl.value) {

                    departmentError.style.display = "block";

                    departmentSelectEl.focus();

                    return;
                }

                departmentError.style.display = "none";
            }

            if (currentStep < steps.length - 1) {
                currentStep = currentStep + 1;
                renderStep();
                return;
            }

            window.location.href = "visit-complete.html";

        });

        renderStep();


        const readStepBtn =
            document.getElementById("hg-read-step-btn");

        if (readStepBtn) {

            readStepBtn.addEventListener("click", function () {

                if (speechSynthesis.speaking) {

                    window.rafiqStopSpeaking();

                    readStepBtn.textContent = "🔊 اقرأ لي الخطوة";
                    readStepBtn.classList.remove("reading");

                    return;
                }

                const step = steps[currentStep];

                const stepDescText =
                    (typeof step.desc === "function") ? step.desc() : step.desc;

                const text =
                    "أنت الآن في " + selectedHospital + ". خطوتك التالية هي: " +
                    step.title() + ". " + stepDescText;

                readStepBtn.textContent = "⏹ إيقاف القراءة";
                readStepBtn.classList.add("reading");

                window.rafiqSpeak(text, function () {
                    readStepBtn.textContent = "🔊 اقرأ لي الخطوة";
                    readStepBtn.classList.remove("reading");
                });

            });

        }

    }


    /* ===== hospital-guide.html: Share Location with Companion ===== */

    const shareLocationBtn =
        document.getElementById("hg-share-location-btn");

    const shareStatusEl =
        document.getElementById("hg-share-status");

    if (shareLocationBtn && shareStatusEl) {

        shareLocationBtn.addEventListener("click", function () {

            shareStatusEl.hidden = false;

     const companionPhone =
    localStorage.getItem("companionRequestPhone");
            if (!navigator.geolocation) {
                shareStatusEl.textContent = "المتصفح ما بيدعم تحديد الموقع على هالجهاز.";
                return;
            }

            shareStatusEl.textContent = "جاري تحديد موقعك...";

            navigator.geolocation.getCurrentPosition(

                function (position) {

                    const mapsLink =
                        "https://www.google.com/maps?q=" +
                        position.coords.latitude + "," + position.coords.longitude;

                    const message =
                        "أنا حالياً في " + selectedHospital + ". موقعي هون: " + mapsLink;

                    if (companionPhone) {

                        const cleanPhone = companionPhone.replace(/[^0-9]/g, "");

                        const waLink =
                            "https://wa.me/" + cleanPhone + "?text=" + encodeURIComponent(message);

                        shareStatusEl.textContent = "تم تجهيز رابط موقعك. رح يفتح واتساب حتى تختار إرسال الرسالة لمرافقك.";

                        window.open(waLink, "_blank");

                    } else {

                        shareStatusEl.textContent =
                            "ما لقينا رقم مرافق مسجل عندك. لينك موقعك: " + mapsLink;

                    }

                },

                function () {
                    shareStatusEl.textContent =
                        "ما قدرنا نحدد موقعك. تأكدي إنك سمحتي للمتصفح بالوصول لموقعك.";
                }

            );

        });

    }


    /* ===== شارة الاتصال بالإنترنت ===== */

    const offlineBadge =
        document.getElementById("hg-offline-badge");

    if (offlineBadge) {

        const updateOfflineBadge = function () {
            offlineBadge.hidden = navigator.onLine;
        };

        updateOfflineBadge();

        window.addEventListener("online", updateOfflineBadge);
        window.addEventListener("offline", updateOfflineBadge);

    }
/* =====================================================
   Hospital Problem Solving
===================================================== */

const hospitalProblemBtn =
    document.getElementById("hg-problem-btn");

const hospitalProblemBox =
    document.getElementById("hg-problem-box");

const hospitalProblemSolution =
    document.getElementById("hg-problem-solution");

const hospitalProblemSolutionText =
    document.getElementById("hg-problem-solution-text");

const hospitalProblemOptions =
    document.querySelectorAll(".hospital-problem-option");

const readProblemBtn =
    document.getElementById("hg-read-problem-btn");


/* فتح وإغلاق صندوق المشاكل */

if (hospitalProblemBtn && hospitalProblemBox) {

    hospitalProblemBtn.addEventListener("click", function () {

        const isOpen =
            hospitalProblemBox.style.display === "block";

        if (isOpen) {

            hospitalProblemBox.style.display = "none";

            hospitalProblemBtn.textContent =
                "واجهت مشكلة";

        } else {

            hospitalProblemBox.style.display = "block";

            hospitalProblemBtn.textContent =
                "إخفاء المساعدة";

            hospitalProblemBox.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

    });

}


/* اختيار المشكلة */

hospitalProblemOptions.forEach(function (button) {

    button.addEventListener("click", function () {

        const problem =
            button.dataset.problem;

        let solution = "";


        /* مش لاقي القسم */

        if (problem === "department") {

            solution =
                "ارجع لأقرب نقطة استقبال أو اسأل أحد موظفي المستشفى، " +
                "واذكر له اسم القسم الظاهر في رحلتك.";

        }


        /* مش عارف وين أنا */

        else if (problem === "location") {

            solution =
                "توقف في مكان واضح داخل المستشفى، " +
                "وابحث عن أقرب موظف أو نقطة استقبال، " +
                "واطلب المساعدة للوصول إلى القسم المطلوب.";

        }


        /* تم توجيهي لمكان مختلف */

        else if (problem === "different") {

            solution =
                "اتبع توجيهات موظف المستشفى، " +
                "لأن ترتيب الأقسام أو مسار الوصول قد يتغير. " +
                "بعدها ارجع إلى رفيق وكمل رحلتك.";

        }


        hospitalProblemSolutionText.textContent =
            solution;

        hospitalProblemSolution.style.display =
            "block";


        /* إزالة التحديد من الخيارات */

        hospitalProblemOptions.forEach(function (option) {

            option.classList.remove("selected-problem");

        });


        /* تحديد الخيار الحالي */

        button.classList.add("selected-problem");


        hospitalProblemSolution.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    });

});


/* قراءة حل المشكلة */

if (readProblemBtn) {

    readProblemBtn.addEventListener("click", function () {

        const text =
            hospitalProblemSolutionText.textContent.trim();


        if (!text) {
            return;
        }


        if (speechSynthesis.speaking) {

            window.rafiqStopSpeaking();

            readProblemBtn.textContent =
                "🔊 اقرأ لي الحل";

            return;
        }


        readProblemBtn.textContent =
            "⏹ إيقاف القراءة";


        window.rafiqSpeak(text, function () {

            readProblemBtn.textContent =
                "🔊 اقرأ لي الحل";

        });

    });

}
});
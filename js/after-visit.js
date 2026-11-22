document.addEventListener("DOMContentLoaded", function () {

    const continueButton =
        document.getElementById("continue-btn");

    const checkboxes =
        document.querySelectorAll(".leaving-check");

    const checkMessage =
        document.getElementById("check-message");

    if (continueButton) {

        continueButton.addEventListener("click", function () {

            let allChecked = true;

            checkboxes.forEach(function (checkbox) {

                if (!checkbox.checked) {
                    allChecked = false;
                }

            });

            if (allChecked) {

                window.location.href = "follow-up.html";

            } else {

                checkMessage.innerHTML = `
                    <div class="result-warning">
                        <strong>
                            تأكد من الخطوات قبل المتابعة
                        </strong>
                    </div>
                `;

            }

        });

    }


    const saveFollowUpButton =
        document.getElementById("save-follow-up");

    if (saveFollowUpButton) {

       saveFollowUpButton.addEventListener("click", function () {

    const followDate =
        document.getElementById("follow-date").value;

    const followTime =
        document.getElementById("follow-time").value;

    const followMessage =
        document.getElementById("follow-message");

    if (followDate === "" || followTime === "") {

        followMessage.innerHTML = `
            <div class="result-warning">
                <strong>
                    أدخل تاريخ ووقت موعد المتابعة
                </strong>
            </div>
        `;

        return;
    }

    // حفظ موعد المتابعة ضمن الرحلة الحالية
    localStorage.setItem(
        "followUpDate",
        followDate
    );

    localStorage.setItem(
        "followUpTime",
        followTime
    );

    window.location.href = "return.html";

});

    }


    const RETURN_ROUTES = {

        qalandia: [

            {
                location: "مستشفى المقاصد",
                next: "توجه إلى محطة السلطان سليمان",
                desc: "ابدأ رحلة العودة من المستشفى باتجاه محطة السلطان سليمان."
            },

            {
                location: "محطة السلطان سليمان",
                next: "توجه باتجاه باب العامود",
                desc: "تابع باتجاه منطقة باب العامود للانتقال إلى مواصلات قلنديا."
            },

            {
                location: "باب العامود",
                next: "اسأل عن المواصلات باتجاه قلنديا",
                desc: "تأكد من اتجاه وسيلة المواصلات قبل الركوب."
            },

            {
                location: "حاجز قلنديا",
                next: "وصلت إلى معبر قلنديا",
                desc: "أكملت مسار العودة إلى المعبر."
            }

        ],

        erez: [

            {
                location: "مستشفى المقاصد",
                next: "راجع تنسيق العودة الخاص بحالتك",
                desc: "قبل المغادرة، تأكد من الجهة المنسقة من ترتيبات العودة وحالة العبور إلى قطاع غزة."
            },

            {
                location: "مسار العودة إلى غزة",
                next: "اتبع تعليمات الجهة المنسقة",
                desc: "مسار العودة وحالة معبر بيت حانون قد يتغيران، لذلك لا يعتمد رفيق مسار مواصلات ثابتًا لهذه الرحلة."
            },

            {
                location: "معبر بيت حانون (إيرز)",
                next: "أكمل إجراءات العودة حسب التنسيق",
                desc: "اتبع التعليمات الرسمية والتنسيق الخاص بحالتك لإكمال العودة."
            }

        ],

        checkpoint300: [

            {
                location: "مستشفى المقاصد",
                next: "توجه إلى محطة السلطان سليمان",
                desc: "ابدأ رحلة العودة من المستشفى باتجاه محطة السلطان سليمان."
            },

            {
                location: "محطة السلطان سليمان",
                next: "توجه باتجاه منطقة باب العامود",
                desc: "تابع إلى منطقة باب العامود للانتقال إلى مواصلات معبر 300."
            },

            {
                location: "منطقة باب العامود",
                next: "اسأل عن المواصلات باتجاه معبر 300",
                desc: "تأكد من اتجاه وسيلة المواصلات قبل الركوب."
            },

            {
                location: "معبر 300",
                next: "وصلت إلى معبر 300",
                desc: "أكملت مسار العودة إلى المعبر."
            }

        ]

    };


    const returnContinueButton =
        document.getElementById("return-continue-btn");

    const returnBackButton =
        document.getElementById("return-back-btn");

    if (returnContinueButton) {

        const crossing =
            localStorage.getItem("rafiq_crossing");

        let returnStep = 0;

        const routeMessage =
            document.getElementById("return-route-message");

        if (!crossing || !RETURN_ROUTES[crossing]) {

            routeMessage.innerHTML = `
                <div class="result-warning">
                    <strong>
                        ما قدرنا نحدد مسار العودة.
                    </strong>
                    <div>
                        ارجع وحدد مسار رحلتك أولاً.
                    </div>
                </div>
            `;

            returnContinueButton.style.display = "none";

            if (returnBackButton) {
                returnBackButton.style.display = "none";
            }

        } else {

            const route = RETURN_ROUTES[crossing];

            function renderReturnStep() {

                const step = route[returnStep];

                document.getElementById(
                    "return-current-location"
                ).textContent = step.location;

                document.getElementById(
                    "return-next-step"
                ).textContent = step.next;

                document.getElementById(
                    "return-step-description"
                ).textContent = step.desc;

               const returnButtonText =
    returnContinueButton.querySelector("span");

if (returnButtonText) {

    if (returnStep === route.length - 1) {

        returnButtonText.textContent =
            "وصلت بسلام";

    } else {

        returnButtonText.textContent =
            "وصلت، أعطيني الخطوة التالية";

    }

}

                if (returnBackButton) {

                    if (returnStep === 0) {

                        returnBackButton.style.display =
                            "none";

                    } else {

                        returnBackButton.style.display =
                            "inline-flex";

                    }

                }

            }


            renderReturnStep();


            returnContinueButton.addEventListener(
                "click",
                function () {

                    if (returnStep < route.length - 1) {

                        returnStep++;
                        renderReturnStep();

                    } else {

                        window.location.href =
                            "completed.html";

                    }

                }
            );


            if (returnBackButton) {

                returnBackButton.addEventListener(
                    "click",
                    function () {

                        if (returnStep > 0) {

                            returnStep--;
                            renderReturnStep();

                        }

                    }
                );

            }

        }

    }



});
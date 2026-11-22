document.addEventListener("DOMContentLoaded", function () {

    const form =
        document.getElementById("companion-form");

    const successBox =
        document.getElementById("companion-success");

    const hospitalInput =
        document.getElementById("companion-hospital");


    if (!form || !successBox) {
        return;
    }


    /* ---------------------------------
       Get hospital from saved journey
    --------------------------------- */

    const savedHospital =
        localStorage.getItem("selectedHospitalName");


    if (hospitalInput) {

        hospitalInput.value =
            savedHospital || "المستشفى المختار";

    }


    /* ---------------------------------
       Submit Companion Request
    --------------------------------- */

    form.addEventListener("submit", function (e) {

        e.preventDefault();


        const name =
            document.getElementById(
                "companion-name"
            ).value.trim();


        const phone =
            document.getElementById(
                "companion-phone"
            ).value.trim();


        const hospital =
            hospitalInput
                ? hospitalInput.value
                : savedHospital || "غير محدد";


        const myWhatsAppNumber =
            "970594232250";


        const message =
`طلب مرافق جديد - رفيق

الاسم: ${name}
رقم الجوال: ${phone}
المستشفى: ${hospital}

تم تجهيز طلب مرافق من تطبيق رفيق.`;


        const whatsappURL =
            `https://wa.me/${myWhatsAppNumber}?text=${encodeURIComponent(message)}`;


        /* Save request state */

        localStorage.setItem(
            "companionRequestStarted",
            "true"
        );


        localStorage.setItem(
            "companionRequestName",
            name
        );


        localStorage.setItem(
            "companionRequestPhone",
            phone
        );


        /* Show next action */

        successBox.hidden = false;


        successBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


        /* Open WhatsApp */

        window.open(
            whatsappURL,
            "_blank"
        );

    });

});
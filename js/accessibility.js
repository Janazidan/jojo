document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       1. ACCESSIBILITY STYLE
       Skip Link + Keyboard Focus
    ===================================================== */

    const a11yStyle = document.createElement("style");

    a11yStyle.textContent = `
        .skip-link {
            position: absolute;
            right: 10px;
            top: -60px;
            z-index: 999;

            background: var(--burgundy, #6A2338);
            color: #ffffff;

            padding: 10px 18px;

            border-radius: 8px;

            text-decoration: none;

            transition: top 0.2s ease;
        }

        .skip-link:focus {
            top: 10px;
        }

        a:focus-visible,
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible,
        select:focus-visible {
            outline: 3px solid var(--burgundy, #6A2338);
            outline-offset: 3px;
        }
    `;

    document.head.appendChild(a11yStyle);



    /* =====================================================
       2. SKIP TO MAIN CONTENT
    ===================================================== */

    const mainEl = document.querySelector("main");

    if (mainEl && !document.querySelector(".skip-link")) {

        if (!mainEl.id) {
            mainEl.id = "main-content";
        }

        const skipLink = document.createElement("a");

        skipLink.href = "#" + mainEl.id;

        skipLink.className = "skip-link";

        skipLink.textContent =
            "تخطي إلى المحتوى الرئيسي";

        document.body.insertBefore(
            skipLink,
            document.body.firstChild
        );
    }

/* =====================================================
   3. FONT SIZE CONTROLS
   أيقونات واضحة للتكبير والتصغير
===================================================== */

const headerTools =
    document.querySelector(".header-tools");


if (
    headerTools &&
    !document.getElementById("font-decrease") &&
    !document.getElementById("font-increase")
) {

    /* =============================================
       زر تصغير الخط
    ============================================== */

    const decreaseBtn =
        document.createElement("button");

    decreaseBtn.type = "button";

    decreaseBtn.className =
        "simple-btn font-size-btn";

    decreaseBtn.id =
        "font-decrease";

    decreaseBtn.setAttribute(
        "aria-label",
        "تصغير حجم الخط"
    );

    decreaseBtn.setAttribute(
        "title",
        "تصغير الخط"
    );

    decreaseBtn.innerHTML =
        '<i class="fa-solid fa-magnifying-glass-minus" aria-hidden="true"></i>';


    /* =============================================
       زر تكبير الخط
    ============================================== */

    const increaseBtn =
        document.createElement("button");

    increaseBtn.type = "button";

    increaseBtn.className =
        "simple-btn font-size-btn";

    increaseBtn.id =
        "font-increase";

    increaseBtn.setAttribute(
        "aria-label",
        "تكبير حجم الخط"
    );

    increaseBtn.setAttribute(
        "title",
        "تكبير الخط"
    );

    increaseBtn.innerHTML =
        '<i class="fa-solid fa-magnifying-glass-plus" aria-hidden="true"></i>';


    /* =============================================
       إضافة الأزرار إلى الـ Header
    ============================================== */

    headerTools.insertBefore(
        increaseBtn,
        headerTools.firstChild
    );

    headerTools.insertBefore(
        decreaseBtn,
        headerTools.firstChild
    );


    /* =============================================
       حدود حجم الخط
    ============================================== */

    const minSize = 90;
    const maxSize = 130;
    const step = 10;


    /* =============================================
       تطبيق الحجم وحفظه
    ============================================== */

    function applyFontSize(size) {

        document.documentElement.style.fontSize =
            size + "%";

        localStorage.setItem(
            "rafiqFontSize",
            size
        );


        /*
           تعطيل الزر عند الوصول للحد
           حتى يكون واضح للمستخدم
        */

        decreaseBtn.disabled =
            size <= minSize;

        increaseBtn.disabled =
            size >= maxSize;
    }


    /* =============================================
       قراءة الحجم المحفوظ
    ============================================== */

    let currentSize =
        parseInt(
            localStorage.getItem("rafiqFontSize"),
            10
        );


    if (
        !currentSize ||
        isNaN(currentSize)
    ) {

        currentSize = 100;
    }


    /* =============================================
       تطبيق الحجم عند فتح الصفحة
    ============================================== */

    applyFontSize(currentSize);


    /* =============================================
       تكبير الخط
    ============================================== */

    increaseBtn.addEventListener(
        "click",
        function () {

            currentSize =
                Math.min(
                    maxSize,
                    currentSize + step
                );

            applyFontSize(currentSize);
        }
    );


    /* =============================================
       تصغير الخط
    ============================================== */

    decreaseBtn.addEventListener(
        "click",
        function () {

            currentSize =
                Math.max(
                    minSize,
                    currentSize - step
                );

            applyFontSize(currentSize);
        }
    );
}

    /* =====================================================
       4. ARABIC SPEECH
    ===================================================== */

    let rafiqVoices = [];


    function loadRafiqVoices() {

        rafiqVoices =
            speechSynthesis.getVoices();
    }


    loadRafiqVoices();


    if (
        typeof speechSynthesis.onvoiceschanged !==
        "undefined"
    ) {

        speechSynthesis.onvoiceschanged =
            loadRafiqVoices;
    }



    /* اختيار صوت عربي */

    function pickArabicVoice() {

        if (
            !rafiqVoices ||
            rafiqVoices.length === 0
        ) {

            rafiqVoices =
                speechSynthesis.getVoices();
        }


        const arabicVoices =
            rafiqVoices.filter(
                function (voice) {

                    return (
                        voice.lang &&
                        voice.lang.indexOf("ar") === 0
                    );
                }
            );


        if (arabicVoices.length === 0) {

            return null;
        }


        /*
           نفضل الصوت Online إذا كان موجود
        */

        const onlineVoice =
            arabicVoices.find(
                function (voice) {

                    return (
                        voice.localService === false
                    );
                }
            );


        return (
            onlineVoice ||
            arabicVoices[0]
        );
    }



    /* =====================================================
       5. تقسيم النص حتى لا يقطعه المتصفح
    ===================================================== */

    function splitIntoChunks(text) {

        return text

            .replace(
                /([.!؟])/g,
                "$1|"
            )

            .split("|")

            .map(
                function (chunk) {

                    return chunk.trim();
                }
            )

            .filter(
                function (chunk) {

                    return (
                        chunk.length > 0
                    );
                }
            );
    }



    /* =====================================================
       6. تحديد النص المهم للقراءة
    ===================================================== */

    function getImportantText(root) {

        const skipSelector =
            ".progress, " +
            ".hospital-route, " +
            ".step-number, " +
            ".hospital-select-card, " +
            "button, " +
            "select, " +
            ".header-tools";


        const importantSelector =
            "h1, " +
            "h2, " +
            "p, " +
            ".check-item strong, " +
            ".check-item small, " +
            ".floor-result-label, " +
            ".floor-result strong, " +
            ".return-label";


        const nodes =
            root.querySelectorAll(
                importantSelector
            );


        const parts = [];


        nodes.forEach(
            function (node) {

                if (
                    node.closest(
                        skipSelector
                    )
                ) {

                    return;
                }


                const text =
                    node.textContent.trim();


                if (text) {

                    parts.push(text);
                }
            }
        );


        return parts.join(". ");
    }



    /*
       نخلي Hospital JS يقدر يستخدم
       نفس وظيفة تحديد النص
    */

    window.rafiqGetImportantText =
        getImportantText;



    /* =====================================================
       7. وظيفة القراءة الرئيسية
    ===================================================== */

    window.rafiqSpeak =
        function (text, onEnd) {

            speechSynthesis.cancel();


            const chunks =
                splitIntoChunks(text);


            if (
                chunks.length === 0
            ) {

                if (onEnd) {

                    onEnd();
                }

                return;
            }


            const arabicVoice =
                pickArabicVoice();


            let index = 0;


            function speakNext() {

                if (
                    index >=
                    chunks.length
                ) {

                    if (onEnd) {

                        onEnd();
                    }

                    return;
                }


                const utterance =
                    new SpeechSynthesisUtterance(
                        chunks[index]
                    );


                utterance.lang =
                    "ar";


                /*
                   سرعة أبطأ قليلاً
                   حتى تكون أوضح
                */

                utterance.rate =
                    0.85;


                if (arabicVoice) {

                    utterance.voice =
                        arabicVoice;
                }


                utterance.onend =
                    function () {

                        index =
                            index + 1;

                        speakNext();
                    };


                speechSynthesis.speak(
                    utterance
                );
            }


            speakNext();
        };



    /* =====================================================
       8. إيقاف القراءة
    ===================================================== */

    window.rafiqStopSpeaking =
        function () {

            speechSynthesis.cancel();
        };



    /* =====================================================
       9. زر الصوت الموجود في الـ Header
    ===================================================== */

    const soundButtons =
        document.querySelectorAll(
            ".sound-btn"
        );


    soundButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {


                    /*
                       إذا القراءة شغالة:
                       أوقف القراءة
                    */

                    if (
                        speechSynthesis.speaking
                    ) {

                        window.rafiqStopSpeaking();

                        button.textContent =
                            "الصوت";

                        return;
                    }


                    /*
                       الحصول على محتوى الصفحة
                    */

                    const mainContent =
                        document.querySelector(
                            "main"
                        );


                    if (!mainContent) {

                        return;
                    }


                    /*
                       قراءة النص المهم فقط
                    */

                    const text =
                        getImportantText(
                            mainContent
                        );


                    if (!text) {

                        return;
                    }


                    button.textContent =
                        "إيقاف الصوت";


                    window.rafiqSpeak(
                        text,
                        function () {

                            button.textContent =
                                "الصوت";
                        }
                    );
                }
            );
        }
    );

});
/* =====================================================
   RAFIQ - PATIENT EXPERIENCE
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       Elements
    ========================= */

    const methodSection =
        document.getElementById("feedback-method");

    const voiceSection =
        document.getElementById("voice-feedback");

    const writingSection =
        document.getElementById("writing-feedback");

    const loadingSection =
        document.getElementById("feedback-loading");

    const reviewSection =
        document.getElementById("feedback-review");

    const successSection =
        document.getElementById("feedback-success");

    const privacyBox =
        document.getElementById("feedback-privacy");


    const chooseVoice =
        document.getElementById("choose-voice");

    const chooseWriting =
        document.getElementById("choose-writing");

    const backButtons =
        document.querySelectorAll("[data-back-method]");


    /* Writing */

    const feedbackText =
        document.getElementById("feedback-text");

    const feedbackError =
        document.getElementById("feedback-error");

    const analyzeTextButton =
        document.getElementById("analyze-text");


    /* Recording */

    const recordButton =
        document.getElementById("record-button");

    const recordAgainButton =
        document.getElementById("record-again");

    const recordingStatus =
        document.getElementById("recording-status");

    const recordingTime =
        document.getElementById("recording-time");

    const recordingPreview =
        document.getElementById("recording-preview");

    const audioPlayer =
        document.getElementById("feedback-audio");

    const analyzeVoiceButton =
        document.getElementById("analyze-voice");


    /* Review */

    const summaryElement =
        document.getElementById("feedback-summary");

    const categoryElement =
        document.getElementById("feedback-category");

    const originalTextElement =
        document.getElementById(
            "feedback-original-text"
        );

    const editButton =
        document.getElementById("edit-feedback");

    const publishButton =
        document.getElementById("publish-feedback");


    /* =========================
       State
    ========================= */

    let selectedMethod = null;

    let mediaRecorder = null;

    let audioChunks = [];

    let recordedAudioBlob = null;

    let recordingInterval = null;

    let recordingSeconds = 0;

    let currentOriginalText = "";

    let currentSummary = "";

    let currentCategory = "";


    /* =========================
       Choose Method
    ========================= */

    chooseVoice.addEventListener(
        "click",
        function () {

            selectedMethod = "voice";

            showOnly(
                voiceSection
            );

        }
    );


    chooseWriting.addEventListener(
        "click",
        function () {

            selectedMethod = "writing";

            showOnly(
                writingSection
            );

            setTimeout(function () {

                feedbackText.focus();

            }, 100);

        }
    );


    /* =========================
       Back To Method
    ========================= */

    backButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    stopRecordingIfNeeded();

                    selectedMethod = null;

                    showOnly(
                        methodSection
                    );

                }
            );

        }
    );


    /* =========================
       Writing
    ========================= */

    analyzeTextButton.addEventListener(
        "click",
        function () {

            const text =
                feedbackText.value.trim();


            if (text.length < 10) {

                feedbackError.textContent =
                    "احكيلنا شوي أكثر عن تجربتك.";

                return;
            }


            feedbackError.textContent = "";

            currentOriginalText = text;


      
            analyzeFeedback(text);

        }
    );


    feedbackText.addEventListener(
        "input",
        function () {

            feedbackError.textContent = "";

        }
    );


    /* =========================
       Start / Stop Recording
    ========================= */

    recordButton.addEventListener(
        "click",
        async function () {

            if (
                mediaRecorder &&
                mediaRecorder.state ===
                    "recording"
            ) {

                stopRecording();

                return;
            }


            await startRecording();

        }
    );


    async function startRecording() {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            recordingStatus.textContent =
                "المتصفح لا يدعم التسجيل الصوتي.";

            return;
        }


        try {

            const stream =
                await navigator.mediaDevices
                    .getUserMedia({
                        audio: true
                    });


            audioChunks = [];

            recordedAudioBlob = null;


            mediaRecorder =
                new MediaRecorder(stream);


            mediaRecorder.addEventListener(
                "dataavailable",
                function (event) {

                    if (
                        event.data.size > 0
                    ) {

                        audioChunks.push(
                            event.data
                        );
                    }

                }
            );


            mediaRecorder.addEventListener(
                "stop",
                function () {

                    recordedAudioBlob =
                        new Blob(
                            audioChunks,
                            {
                                type:
                                    mediaRecorder
                                        .mimeType ||
                                    "audio/webm"
                            }
                        );


                    const audioURL =
                        URL.createObjectURL(
                            recordedAudioBlob
                        );


                    audioPlayer.src =
                        audioURL;


                    recordingPreview.hidden =
                        false;


                    recordingStatus.textContent =
                        "تم التسجيل ✓";


                    recordingStatus.classList
                        .remove(
                            "recording-active"
                        );


                    recordButton.textContent =
                        "ابدأ تسجيل جديد";


                    stream
                        .getTracks()
                        .forEach(
                            function (track) {

                                track.stop();

                            }
                        );

                }
            );


            mediaRecorder.start();


            recordingSeconds = 0;

            updateRecordingTime();


            recordingStatus.textContent =
                "جاري التسجيل...";


            recordingStatus.classList.add(
                "recording-active"
            );


            recordButton.textContent =
                "إيقاف التسجيل";


            recordingPreview.hidden =
                true;


            recordingInterval =
                setInterval(
                    function () {

                        recordingSeconds++;

                        updateRecordingTime();

                    },
                    1000
                );

        }


        catch (error) {

            console.error(error);


            recordingStatus.textContent =
                "ما قدرنا نفتح الميكروفون. تأكد إنك سمحت للموقع باستخدامه.";

        }

    }


    function stopRecording() {

        if (
            mediaRecorder &&
            mediaRecorder.state ===
                "recording"
        ) {

            mediaRecorder.stop();

        }


        clearInterval(
            recordingInterval
        );

    }


    function stopRecordingIfNeeded() {

        if (
            mediaRecorder &&
            mediaRecorder.state ===
                "recording"
        ) {

            stopRecording();

        }

    }


    /* =========================
       Recording Timer
    ========================= */

    function updateRecordingTime() {

        const minutes =
            Math.floor(
                recordingSeconds / 60
            );

        const seconds =
            recordingSeconds % 60;


        recordingTime.textContent =
            String(minutes)
                .padStart(2, "0")
            +
            ":"
            +
            String(seconds)
                .padStart(2, "0");

    }


    /* =========================
       Record Again
    ========================= */

    recordAgainButton.addEventListener(
        "click",
        function () {

            recordedAudioBlob = null;

            audioChunks = [];

            audioPlayer.removeAttribute(
                "src"
            );


            recordingPreview.hidden =
                true;


            recordingSeconds = 0;

            updateRecordingTime();


            recordingStatus.textContent =
                "جاهز للتسجيل";


            recordButton.textContent =
                "ابدأ التسجيل";

        }
    );


   /* =========================
   Voice → Text → AI Analysis
========================= */

analyzeVoiceButton.addEventListener(
    "click",
    async function () {

        if (!recordedAudioBlob) {

            recordingStatus.textContent =
                "سجل تجربتك أولاً.";

            return;
        }


        showOnly(
            loadingSection
        );


        try {

            /* -------------------------
               Prepare audio
            ------------------------- */

            const formData =
                new FormData();


            formData.append(
                "audio",
                recordedAudioBlob,
                "feedback.webm"
            );


            /* -------------------------
               Send audio to PHP
            ------------------------- */

            const response =
                await fetch(
                    "api/transcribe-feedback.php",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Transcription failed"
                );

            }


            if (!data.transcript) {

                throw new Error(
                    "No transcript returned"
                );

            }


            /* -------------------------
               Save original transcript
            ------------------------- */

            currentOriginalText =
                data.transcript;


            /*
             * هسا بنستخدم نفس
             * AI analysis تبع الكتابة
             */

            await analyzeFeedback(
                data.transcript
            );

        }


        catch (error) {

            console.error(
                "Voice Feedback Error:",
                error
            );


            showOnly(
                voiceSection
            );


            recordingStatus.textContent =
                "ما قدرنا نفهم التسجيل. جرّب تسجل مرة ثانية بصوت أوضح.";

        }

    }
);
/* =========================
   AI Feedback Analysis
========================= */

async function analyzeFeedback(text) {

    showOnly(
        loadingSection
    );


    try {

        const response =
            await fetch(
                "api/analyze-feedback.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        text: text
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "AI analysis failed"
            );

        }


        if (
            !data.summary ||
            !data.category
        ) {

            throw new Error(
                "Invalid AI result"
            );

        }


        currentSummary =
            data.summary;


        currentCategory =
            data.category;


        summaryElement.textContent =
            currentSummary;


        categoryElement.textContent =
            currentCategory;


        originalTextElement.textContent =
            text;


        showOnly(
            reviewSection
        );

    }


    catch (error) {

        console.error(
            "Feedback AI Error:",
            error
        );


        showOnly(
            writingSection
        );


        feedbackError.textContent =
            "صار خطأ أثناء ترتيب التجربة. جرّب مرة ثانية.";

    }

}

    /* =========================
       Edit
    ========================= */

    editButton.addEventListener(
        "click",
        function () {

            if (
                selectedMethod ===
                "writing"
            ) {

                showOnly(
                    writingSection
                );

                return;
            }


            if (
                selectedMethod ===
                "voice"
            ) {

                showOnly(
                    voiceSection
                );

            }

        }
    );


    /* =========================
       Publish
    ========================= */

    publishButton.addEventListener(
        "click",
        function () {

            const experience = {

                id:
                    Date.now(),

                method:
                    selectedMethod,

                original:
                    currentOriginalText,

                summary:
                    currentSummary,

                category:
                    currentCategory,

                createdAt:
                    new Date()
                        .toISOString()

            };


            const savedExperiences =
                JSON.parse(
                    localStorage.getItem(
                        "rafiqExperiences"
                    )
                    ||
                    "[]"
                );


            savedExperiences.unshift(
                experience
            );


            localStorage.setItem(
                "rafiqExperiences",
                JSON.stringify(
                    savedExperiences
                )
            );


            showOnly(
                successSection
            );

        }
    );


    /* =========================
       Section Controller
    ========================= */

    function showOnly(section) {

        const sections = [

            methodSection,
            voiceSection,
            writingSection,
            loadingSection,
            reviewSection,
            successSection

        ];


        sections.forEach(
            function (item) {

                if (!item) {
                    return;
                }


                item.hidden =
                    item !== section;

            }
        );


        /*
         * Privacy remains visible
         * until success.
         */

        if (privacyBox) {

            privacyBox.hidden =
                section ===
                successSection;

        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

});
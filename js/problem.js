let userLatitude = null;
let userLongitude = null;

let map = null;
let userMarker = null;

const problemButtons =
    document.querySelectorAll(".problem-option");

const problemSection =
    document.getElementById("problem-section");

const locationSection =
    document.getElementById("location-section");

const languageSection =
    document.getElementById("language-section");

const locationBtn =
    document.getElementById("location-btn");

const locationStatus =
    document.getElementById("location-status");

const nearbyLoading =
    document.getElementById("nearby-loading");

const nearbySection =
    document.getElementById("nearby-section");

const nearbyPlaces =
    document.getElementById("nearby-places");

const languageImage =
    document.getElementById("language-image");

const imagePreview =
    document.getElementById("image-preview");

const translateLoading =
    document.getElementById("translate-loading");

const translationResult =
    document.getElementById("translation-result");

const arabicTranslation =
    document.getElementById("arabic-translation");

const backBtn =
    document.getElementById("back-btn");


problemButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const problem =
            button.getAttribute("data-problem");

        problemSection.style.display =
            "none";

        backBtn.style.display =
            "block";

        if (problem === "lost") {

            locationSection.style.display =
                "block";

        }

        if (problem === "language") {

            languageSection.style.display =
                "block";

        }

    });

});


locationBtn.addEventListener("click", function () {

    locationStatus.textContent =
        "جاري تحديد موقعك...";

    if (!navigator.geolocation) {

        locationStatus.textContent =
            "المتصفح لا يدعم تحديد الموقع.";

        return;
    }

    navigator.geolocation.getCurrentPosition(

        function (position) {

            userLatitude =
                position.coords.latitude;

            userLongitude =
                position.coords.longitude;

            locationStatus.textContent =
                "تم تحديد موقعك بنجاح ✓";

            locationBtn.style.display =
                "none";

            showMap();

            findNearbyPlaces();

        },

        function () {

            locationStatus.textContent =
                "ما قدرنا نحدد موقعك. تأكدي إنك سمحتي للموقع.";

        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }

    );

});


function showMap() {

    if (map !== null) {

        map.remove();

    }

    map = L.map("map").setView(
        [
            userLatitude,
            userLongitude
        ],
        16
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

    userMarker =
        L.marker([
            userLatitude,
            userLongitude
        ])
        .addTo(map);

    userMarker
        .bindPopup("<b>أنت هنا 📍</b>")
        .openPopup();

}


async function findNearbyPlaces() {

    nearbyLoading.style.display =
        "block";

    nearbySection.style.display =
        "none";

    nearbyPlaces.innerHTML =
        "";

    const radius = 1500;

    const query = `
        [out:json];

        (
            nwr
                ["name"]
                (around:${radius},${userLatitude},${userLongitude});

            nwr
                ["amenity"]
                (around:${radius},${userLatitude},${userLongitude});

            nwr
                ["shop"]
                (around:${radius},${userLatitude},${userLongitude});

            nwr
                ["highway"="bus_stop"]
                (around:${radius},${userLatitude},${userLongitude});

            nwr
                ["public_transport"]
                (around:${radius},${userLatitude},${userLongitude});
        );

        out center tags;
    `;

    try {

        const response =
            await fetch(
                "https://overpass-api.de/api/interpreter",
                {
                    method: "POST",
                    body: query
                }
            );

        if (!response.ok) {
            throw new Error("Overpass error");
        }

        const data =
            await response.json();

        nearbyLoading.style.display =
            "none";

        displayNearbyPlaces(
            data.elements
        );

    }

    catch (error) {

        nearbyLoading.style.display =
            "none";

        nearbySection.style.display =
            "block";

        nearbyPlaces.innerHTML =
            "<p>ما قدرنا نجيب الأماكن القريبة حالياً.</p>";

        console.log(error);

    }

}


function displayNearbyPlaces(places) {

    const validPlaces =
        places.filter(function (place) {

            return (
                place.tags &&
                (
                    place.tags.name ||
                    place.tags["name:ar"] ||
                    place.tags["name:en"]
                )
            );

        });

    const uniquePlaces = [];

    const names = new Set();

    validPlaces.forEach(function (place) {

        const name =
            place.tags.name ||
            place.tags["name:ar"] ||
            place.tags["name:en"];

        if (!names.has(name)) {

            names.add(name);

            uniquePlaces.push(place);

        }

    });


    const sortedPlaces =
        uniquePlaces
            .map(function (place) {

                const lat =
                    place.lat ||
                    place.center?.lat;

                const lon =
                    place.lon ||
                    place.center?.lon;

                return {
                    place: place,
                    lat: lat,
                    lon: lon,
                    distance: calculateDistance(
                        userLatitude,
                        userLongitude,
                        lat,
                        lon
                    )
                };

            })
            .filter(function (item) {

                return (
                    item.lat &&
                    item.lon
                );

            })
            .sort(function (a, b) {

                return a.distance - b.distance;

            })
            .slice(0, 10);


    nearbySection.style.display =
        "block";


    if (sortedPlaces.length === 0) {

        nearbyPlaces.innerHTML =
            "<p>ما لقينا أماكن قريبة باسم واضح.</p>";

        return;

    }


    sortedPlaces.forEach(function (item) {

        const place =
            item.place;

        const tags =
            place.tags || {};

        const name =
            tags.name ||
            tags["name:ar"] ||
            tags["name:en"];

        const type =
            getPlaceType(tags);

        const div =
            document.createElement("div");

        div.className =
            "nearby-place";

        div.innerHTML =
            `
            <strong>📍 ${escapeHtml(name)}</strong>
            <span>${type} · ${Math.round(item.distance)} متر</span>
            `;

        nearbyPlaces.appendChild(div);


        L.marker([
            item.lat,
            item.lon
        ])
        .addTo(map)
        .bindPopup(
            `<b>${escapeHtml(name)}</b><br>${type}`
        );

    });

}


function getPlaceType(tags) {

    if (tags.amenity === "pharmacy") {
        return "💊 صيدلية";
    }

    if (tags.amenity === "hospital") {
        return "🏥 مستشفى";
    }

    if (tags.amenity === "university") {
        return "🎓 جامعة";
    }

    if (tags.amenity === "school") {
        return "🏫 مدرسة";
    }

    if (tags.amenity === "restaurant") {
        return "🍽️ مطعم";
    }

    if (tags.amenity === "cafe") {
        return "☕ مقهى";
    }

    if (tags.amenity === "bank") {
        return "🏦 بنك";
    }

    if (tags.amenity === "clinic") {
        return "🏥 عيادة";
    }

    if (tags.shop === "supermarket") {
        return "🛒 سوبرماركت";
    }

    if (tags.shop === "convenience") {
        return "🛒 بقالة";
    }

    if (tags.shop) {
        return "🛍️ محل";
    }

    if (tags.highway === "bus_stop") {
        return "🚌 موقف باص";
    }

    if (tags.public_transport) {
        return "🚌 مواصلات";
    }

    return "📍 مكان قريب";

}


function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371000;

    const dLat =
        (lat2 - lat1) *
        Math.PI / 180;

    const dLon =
        (lon2 - lon1) *
        Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
        Math.cos(
            lat1 * Math.PI / 180
        ) *
        Math.cos(
            lat2 * Math.PI / 180
        ) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;

}


function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


languageImage.addEventListener(
    "change",
    async function () {

        const file =
            languageImage.files[0];

        if (!file) {
            return;
        }

        const reader =
            new FileReader();

        reader.onload =
            function (event) {

                imagePreview.src =
                    event.target.result;

                imagePreview.style.display =
                    "block";

            };

        reader.readAsDataURL(file);

        translateLoading.style.display =
            "block";

        translationResult.style.display =
            "none";

        try {

            const formData =
                new FormData();

            formData.append(
                "image",
                file
            );

            const response =
                await fetch(
                    "api/translate.php",
                    {
                        method: "POST",
                        body: formData
                    }
                );

            const data =
                await response.json();

            translateLoading.style.display =
                "none";

            if (!response.ok || data.error) {

                throw new Error(
                    data.error ||
                    "Translation failed"
                );

            }

            arabicTranslation.textContent =
                data.translation;

            translationResult.style.display =
                "block";

        }

        catch (error) {

            translateLoading.style.display =
                "none";

            translationResult.style.display =
                "block";

            arabicTranslation.textContent =
                "ما قدرنا نترجم الصورة حالياً.";

            console.log(error);

        }

    }
);


backBtn.addEventListener(
    "click",
    function () {

        locationSection.style.display =
            "none";

        languageSection.style.display =
            "none";

        problemSection.style.display =
            "block";

        backBtn.style.display =
            "none";

        locationBtn.style.display =
            "block";

        locationStatus.textContent =
            "";

        nearbySection.style.display =
            "none";

        nearbyPlaces.innerHTML =
            "";

        imagePreview.style.display =
            "none";

        translationResult.style.display =
            "none";

        translateLoading.style.display =
            "none";

        languageImage.value =
            "";

        if (map !== null) {

            map.remove();

            map = null;

        }

    }
);
/* =========================================
   VOICE TRANSLATION
========================================= */

const imageTranslationTab =
    document.getElementById("image-translation-tab");

const voiceTranslationTab =
    document.getElementById("voice-translation-tab");

const imageTranslationCard =
    document.getElementById("image-translation-card");

const voiceTranslationCard =
    document.getElementById("voice-translation-card");

const swapVoiceLanguage =
    document.getElementById("swap-voice-language");

const voiceSourceLabel =
    document.getElementById("voice-source-label");

const voiceTargetLabel =
    document.getElementById("voice-target-label");

const voiceRecordBtn =
    document.getElementById("voice-record-btn");

const voiceRecordText =
    document.getElementById("voice-record-text");

const voiceStatus =
    document.getElementById("voice-status");

const voiceHeardBox =
    document.getElementById("voice-heard-box");

const voiceHeardText =
    document.getElementById("voice-heard-text");

const voiceTranslationResult =
    document.getElementById("voice-translation-result");

const voiceTranslatedText =
    document.getElementById("voice-translated-text");

const playVoiceTranslation =
    document.getElementById("play-voice-translation");


let voiceSourceLanguage = "ar";
let voiceTargetLanguage = "he";

let lastVoiceTranslation = "";


/* TABS */

imageTranslationTab?.addEventListener(
    "click",
    function () {

        imageTranslationTab.classList.add("active");
        voiceTranslationTab.classList.remove("active");

        imageTranslationCard.style.display =
            "block";

        voiceTranslationCard.style.display =
            "none";
    }
);


voiceTranslationTab?.addEventListener(
    "click",
    function () {

        voiceTranslationTab.classList.add("active");
        imageTranslationTab.classList.remove("active");

        imageTranslationCard.style.display =
            "none";

        voiceTranslationCard.style.display =
            "block";
    }
);


/* SWAP LANGUAGE */

swapVoiceLanguage?.addEventListener(
    "click",
    function () {

        if (voiceSourceLanguage === "ar") {

            voiceSourceLanguage = "he";
            voiceTargetLanguage = "ar";

            voiceSourceLabel.textContent =
                "עברית";

            voiceTargetLabel.textContent =
                "العربية";

        }

        else {

            voiceSourceLanguage = "ar";
            voiceTargetLanguage = "he";

            voiceSourceLabel.textContent =
                "العربية";

            voiceTargetLabel.textContent =
                "עברית";
        }


        voiceHeardBox.style.display =
            "none";

        voiceTranslationResult.style.display =
            "none";

        voiceStatus.textContent =
            "";

        lastVoiceTranslation =
            "";
    }
);

/* =========================================
   SPEECH RECOGNITION - VOICE TRANSLATION
========================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;


if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;


    recognition.onstart = function () {

        isListening = true;

        voiceRecordBtn.classList.add("recording");

        voiceRecordText.textContent =
            "عم بسمعك... اضغط للإيقاف";

        voiceStatus.textContent =
            "احكي هسا بوضوح.";
    };


    recognition.onspeechstart = function () {

        voiceStatus.textContent =
            "سمعتك... كمّل حكي.";
    };


    recognition.onresult = async function (event) {

        let transcript = "";


        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            transcript +=
                event.results[i][0].transcript;
        }


        transcript = transcript.trim();


        if (!transcript) {
            return;
        }


        voiceHeardText.textContent =
            transcript;

        voiceHeardBox.style.display =
            "block";


        /* نستنى النتيجة النهائية */

        const lastResult =
            event.results[event.results.length - 1];


        if (!lastResult.isFinal) {

            voiceStatus.textContent =
                "عم بسمعك...";

            return;
        }


        /* وقف التسجيل بعد ما أخذنا الجملة */

        if (recognition && isListening) {

            recognition.stop();
        }


        voiceStatus.textContent =
            "رفيق بترجم...";


        await translateVoiceText(
            transcript
        );
    };


    recognition.onerror = function (event) {

        console.log(
            "Speech recognition error:",
            event.error
        );


        if (event.error === "not-allowed") {

            voiceStatus.textContent =
                "اسمح باستخدام الميكروفون من إعدادات المتصفح.";
        }

        else if (event.error === "no-speech") {

            voiceStatus.textContent =
                "ما سمعت صوت. اضغط المايك واحكي مباشرة.";
        }

        else if (event.error === "audio-capture") {

            voiceStatus.textContent =
                "ما قدرنا نوصل للمايك. تأكد إنه شغال.";
        }

        else {

            voiceStatus.textContent =
                "صار خطأ بالصوت. جرّب مرة ثانية.";
        }
    };


    recognition.onend = function () {

        isListening = false;

        voiceRecordBtn.classList.remove(
            "recording"
        );

        voiceRecordText.textContent =
            "اضغط واحكي";
    };
}


/* =========================================
   RECORD BUTTON
========================================= */

voiceRecordBtn?.addEventListener(
    "click",
    function () {

        if (!recognition) {

            voiceStatus.textContent =
                "المتصفح ما بدعم التعرف على الصوت.";

            return;
        }


        /* إذا شغال، الضغط مرة ثانية يوقفه */

        if (isListening) {

            recognition.stop();

            return;
        }


        recognition.lang =
            voiceSourceLanguage === "ar"
                ? "ar-PS"
                : "he-IL";


        voiceHeardBox.style.display =
            "none";

        voiceTranslationResult.style.display =
            "none";

        voiceStatus.textContent =
            "جاري تشغيل الميكروفون...";


        try {

            recognition.start();

        }

        catch (error) {

            console.error(error);

            voiceStatus.textContent =
                "جرّب اضغط المايك مرة ثانية.";
        }
    }
);
/* =========================================
   TRANSLATE TEXT
========================================= */
async function translateVoiceText(text) {

    try {

        const response = await fetch(
            "api/translate-text.php",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    text: text,
                    source: voiceSourceLanguage,
                    target: voiceTargetLanguage
                })
            }
        );


        const rawResponse =
            await response.text();

        console.log(
            "PHP RESPONSE:",
            rawResponse
        );


        let data;

        try {

            data =
                JSON.parse(rawResponse);

        }

        catch (error) {

            throw new Error(
                "PHP رجّع رد غير مفهوم: " +
                rawResponse
            );
        }


        if (!response.ok || data.error) {

            throw new Error(
                data.error ||
                "Translation failed"
            );
        }


        lastVoiceTranslation =
            data.translation;


        voiceTranslatedText.textContent =
            data.translation;


        voiceTranslationResult.style.display =
            "block";


        voiceStatus.textContent =
            "تمت الترجمة ✓";

    }

    catch (error) {

        console.error(
            "VOICE TRANSLATION ERROR:",
            error
        );

        voiceStatus.textContent =
            "خطأ: " + error.message;
    }
}


/* =========================================
   TEXT TO SPEECH
========================================= */

playVoiceTranslation?.addEventListener(
    "click",
    function () {

        if (!lastVoiceTranslation) {
            return;
        }


        window.speechSynthesis.cancel();


        const speech =
            new SpeechSynthesisUtterance(
                lastVoiceTranslation
            );


        speech.lang =
            voiceTargetLanguage === "he"
                ? "he-IL"
                : "ar";


        speech.rate =
            0.9;


        window.speechSynthesis.speak(
            speech
        );
    }
);
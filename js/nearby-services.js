let userLatitude = null;
let userLongitude = null;
let map = null;

const locationButton =
    document.getElementById("nearby-location-btn");

const locationStatus =
    document.getElementById("nearby-location-status");

const loadingSection =
    document.getElementById("nearby-loading");

const resultsSection =
    document.getElementById("nearby-results");

const placesContainer =
    document.getElementById("nearby-places");


const script =
    document.currentScript;

const serviceType =
    script.dataset.service;


/* =========================================
   LOCATION
========================================= */

locationButton.addEventListener("click", function () {

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


            locationButton.style.display =
                "none";


            showMap();

            findNearbyPlaces();

        },


        function () {

            locationStatus.textContent =
                "ما قدرنا نحدد موقعك. تأكد إنك سمحت للموقع.";

        },


        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }

    );

});


/* =========================================
   MAP
========================================= */

function showMap() {

    map =
        L.map("nearby-map").setView(
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


    L.marker([
        userLatitude,
        userLongitude
    ])
    .addTo(map)
    .bindPopup("<b>أنت هنا 📍</b>")
    .openPopup();

}


/* =========================================
   SEARCH
========================================= */

async function findNearbyPlaces() {

    loadingSection.style.display =
        "block";

    resultsSection.style.display =
        "none";

    placesContainer.innerHTML =
        "";


    const radius = 2000;

    let filters = "";


    /* FOOD */

    if (serviceType === "food") {

        filters = `

            nwr
                ["amenity"="restaurant"]
                (around:${radius},${userLatitude},${userLongitude});

            nwr
                ["amenity"="cafe"]
                (around:${radius},${userLatitude},${userLongitude});

            nwr
                ["amenity"="fast_food"]
                (around:${radius},${userLatitude},${userLongitude});
        `;

    }


    /* STAY */

    if (serviceType === "stay") {

        filters = `

            nwr
                ["tourism"="hotel"]
                (around:${radius},${userLatitude},${userLongitude});

            nwr
                ["tourism"="hostel"]
                (around:${radius},${userLatitude},${userLongitude});

            nwr
                ["tourism"="guest_house"]
                (around:${radius},${userLatitude},${userLongitude});
        `;

    }


    const query = `

        [out:json];

        (

            ${filters}

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

            throw new Error(
                "Nearby search failed"
            );
        }


        const data =
            await response.json();


        loadingSection.style.display =
            "none";


        displayPlaces(
            data.elements
        );

    }


    catch (error) {

        loadingSection.style.display =
            "none";

        resultsSection.style.display =
            "block";


        placesContainer.innerHTML = `

            <p>
                ما قدرنا نجيب الأماكن القريبة حاليًا.
                جرّب مرة ثانية.
            </p>

        `;


        console.log(error);

    }

}


/* =========================================
   DISPLAY RESULTS
========================================= */

function displayPlaces(places) {

    const results = [];


    places.forEach(function (place) {

        const tags =
            place.tags || {};


        const name =
            tags["name:ar"] ||
            tags.name ||
            tags["name:en"];


        if (!name) {
            return;
        }


        const latitude =
            place.lat ||
            place.center?.lat;


        const longitude =
            place.lon ||
            place.center?.lon;


        if (!latitude || !longitude) {
            return;
        }


        const distance =
            calculateDistance(
                userLatitude,
                userLongitude,
                latitude,
                longitude
            );


        results.push({

            name: name,

            lat: latitude,

            lon: longitude,

            distance: distance,

            type: getPlaceType(tags)

        });

    });


    /* Remove duplicate names */

    const uniqueResults = [];

    const names =
        new Set();


    results
        .sort(function (a, b) {

            return a.distance - b.distance;

        })
        .forEach(function (place) {

            if (!names.has(place.name)) {

                names.add(place.name);

                uniqueResults.push(place);

            }

        });


    const closest =
        uniqueResults.slice(0, 6);


    resultsSection.style.display =
        "block";


    if (closest.length === 0) {

        placesContainer.innerHTML = `

            <p>
                ما لقينا أماكن قريبة باسم واضح.
            </p>

        `;

        return;
    }


    closest.forEach(function (place) {

        const card =
            document.createElement("div");


        card.className =
            "nearby-place";


        card.innerHTML = `

            <strong>
                ${place.type}
                ${escapeHtml(place.name)}
            </strong>

            <span>
                يبعد عنك حوالي
                ${formatDistance(place.distance)}
            </span>

        `;


        placesContainer.appendChild(
            card
        );


        L.marker([
            place.lat,
            place.lon
        ])
        .addTo(map)
        .bindPopup(
            `<b>${escapeHtml(place.name)}</b>`
        );

    });

}


/* =========================================
   TYPE
========================================= */

function getPlaceType(tags) {

    if (tags.amenity === "restaurant") {
        return "🍽️";
    }


    if (tags.amenity === "cafe") {
        return "☕";
    }


    if (tags.amenity === "fast_food") {
        return "🥙";
    }


    if (tags.tourism === "hotel") {
        return "🏨";
    }


    if (tags.tourism === "hostel") {
        return "🛏️";
    }


    if (tags.tourism === "guest_house") {
        return "🏠";
    }


    return "📍";

}


/* =========================================
   DISTANCE
========================================= */

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R =
        6371000;


    const dLat =
        (lat2 - lat1) *
        Math.PI / 180;


    const dLon =
        (lon2 - lon1) *
        Math.PI / 180;


    const a =

        Math.sin(dLat / 2) *
        Math.sin(dLat / 2)

        +

        Math.cos(
            lat1 * Math.PI / 180
        )

        *

        Math.cos(
            lat2 * Math.PI / 180
        )

        *

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


/* =========================================
   DISTANCE FORMAT
========================================= */

function formatDistance(distance) {

    if (distance < 1000) {

        return (
            Math.round(distance) +
            " متر"
        );

    }


    return (
        (distance / 1000).toFixed(1) +
        " كم"
    );

}


/* =========================================
   SECURITY
========================================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}
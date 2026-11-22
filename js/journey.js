
const CROSSINGS = {  

    qalandia: {  
        label: "معبر قلنديا",  

        steps: [  

            {  
                location: "حاجز قلنديا",  
                next: "امشِ ودور على فوردات المقاصد",  
                desc: "امشِ إلى نقطة وقوف السيارات القريبة من المعبر واسأل: \"في فورد رايح عالمقاصد؟\"",  
                verified: true  
            },  

            {  
                location: "فوردات المقاصد",  
                next: "إذا لقيت فورد، اركبه مباشرة إلى المقاصد",  
                desc: "   إذا ما لقيت، اضغط \"ما لقيت فورد\".",  
                verified: true,  
                fordChoice: true,  
                foundNextIndex: 5  
            },  

            {  
                location: "حاجز قلنديا",  
                next: "امشِ إلى محطة الباصات القريبة",  
                desc: "إذا ما لقيت فورد، توجه إلى محطة الباصات القريبة واسأل عن خط 218 أو 218A باتجاه باب العامود.",  
                verified: true  
            },  

            {  
                location: "باب العامود",  
                next: "امشِ إلى محطة السلطان سليمان",  
                desc: "بعد النزول عند باب العامود، توجه سيرًا إلى محطة السلطان سليمان.",  
                verified: true  
            },  

            {  
                location: "محطة السلطان سليمان",  
                next: "اسأل عن خط 275",  
                desc: "اركب خط 275 وانزل عند Makassed Hospital Main Entrance / Rabia Al-Adawiya.",  
                verified: true  
            },  

            {  
                location: "مستشفى المقاصد",  
                next: "وصلت إلى مستشفى المقاصد",  
                desc: "وصلت إلى المستشفى مباشرة عن طريق الفورد.",  
                verified: true,  
                fordArrival: true  
            }  
        ]  
    },  


    erez: {

        label: "معبر بيت حانون (إيرز) — غزة",

        steps: [

            {
                location: "معبر بيت حانون (إيرز)",
                next: "تأكد من التنسيق وحالة العبور قبل المتابعة",
                desc: "حالة العبور من غزة قد تتغير. اعتمد على التنسيق والتعليمات الرسمية الخاصة برحلتك قبل التحرك.",
                verified: false
            },

            {
                location: "بعد إتمام العبور",
                next: "تابع حسب تعليمات الجهة المنسقة لرحلتك",
                desc: "رفيق لا يفترض مسار مواصلات ثابتًا من غزة. اتبع مسار النقل أو التنسيق المحدد لحالتك للوصول إلى القدس ومستشفى المقاصد.",
                verified: false
            }

        ]
    },


    checkpoint300: {  

        label: "معبر 300 (بيت لحم والخليل)",  

        steps: [  

            {  
                location: "معبر 300",  
                next: "اسأل عن خط 234 (باتجاه القدس)",  
                desc: "انتبه: خط 299 رايح باتجاه قلنديا مش القدس — تأكد من اتجاه الباص المكتوب قبل ما تركب.",  
                verified: true  
            },  

            {  
                location: "منطقة باب العامود",  
                next: "امشِ إلى محطة السلطان سليمان",  
                desc: "مسافة قريبة سيرًا على الأقدام.",  
                verified: true  
            },  

            {  
                location: "محطة السلطان سليمان",  
                next: "اسأل عن خط 275",  
                desc: "بيوصلك مباشرة إلى مستشفى المقاصد.",  
                verified: true  
            }  
        ]  
    }  
};  


const STORAGE_CROSSING = "rafiq_crossing";  
const STORAGE_STEP = "rafiq_journey_step";  


function initSelectorPage() {  

    const buttons = document.querySelectorAll("[data-crossing]");  

    buttons.forEach(btn => {  

        btn.addEventListener("click", () => {  

            const crossing = btn.getAttribute("data-crossing");  

            localStorage.setItem(STORAGE_CROSSING, crossing);  
            localStorage.setItem(STORAGE_STEP, "0");  

            window.location.href = "journey-step2.html";  

        });  
    });  
}  


function initStepPage() {  

    const locationEl = document.getElementById("current-location");  

    if (!locationEl) return;  


    const crossing = localStorage.getItem(STORAGE_CROSSING);  


    if (!crossing || !CROSSINGS[crossing]) {  

        window.location.href = "journey.html";  
        return;  

    }  


    renderStep(crossing, getStepIndex());  


    const continueBtn = document.getElementById("journey-continue-btn");  


    continueBtn.addEventListener("click", () => {  

        const currentIndex = getStepIndex();  
        const routeSteps = CROSSINGS[crossing].steps;  
        const currentStep = routeSteps[currentIndex];  

        const nextIndex = (currentStep && typeof currentStep.foundNextIndex === "number")
            ? currentStep.foundNextIndex
            : currentIndex + 1;  


        if (nextIndex < routeSteps.length) {  

            localStorage.setItem(STORAGE_STEP, String(nextIndex));  

            renderStep(crossing, nextIndex);  

        } else {  

            window.location.href = "arrival.html";  

        }  
    });  


    const noFordBtn = document.getElementById("no-ford-btn");  


   
        if (noFordBtn) {  

        noFordBtn.addEventListener("click", () => {  

            localStorage.setItem(STORAGE_STEP, "2");  

            renderStep(crossing, 2);  

        });  
    }  


    const backBtn = document.getElementById("journey-back-btn");  


    if (backBtn) {  

        backBtn.addEventListener("click", () => {  

            const prevIndex = getStepIndex() - 1;  

            if (prevIndex < 0) {  

                window.location.href = "journey.html";  

            } else {  

                localStorage.setItem(STORAGE_STEP, String(prevIndex));  

                renderStep(crossing, prevIndex);  

            }  

        });  
    }  
}


function getStepIndex() {  

    return parseInt(  
        localStorage.getItem(STORAGE_STEP) || "0",  
        10  
    );  
}  

function renderStep(crossingKey, index) {

    const route = CROSSINGS[crossingKey];
    const step = route.steps[index];

    if (!step) return;


    document.getElementById("current-location").textContent = step.location;

    document.getElementById("next-step-title").textContent = step.next;

    document.getElementById("next-step-desc").textContent = step.desc;


    const noFordBtn = document.getElementById("no-ford-btn");

    const continueBtn = document.getElementById("journey-continue-btn");


    if (noFordBtn) {

        if (step.fordChoice) {
            noFordBtn.style.display = "block";
        } else {
            noFordBtn.style.display = "none";
        }

    }


    if (step.fordChoice) {

        continueBtn.textContent = "لقيت فورد";

    } else if (step.fordArrival) {

        continueBtn.textContent = "وصلت";

    } else if (index === route.steps.length - 1) {

        continueBtn.textContent = "وصلت قرب المستشفى";

    } else {

        continueBtn.textContent = "وصلت للخطوة التالية";
    }
}
document.addEventListener("DOMContentLoaded", () => {  

    initSelectorPage();  

    initStepPage();  

});


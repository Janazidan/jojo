<?php

header("Content-Type: application/json; charset=UTF-8");

require_once "config.php";


/* =========================================
   Allow POST only
========================================= */

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "error" => "Method not allowed"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================
   Read JSON from frontend
========================================= */

$input = json_decode(
    file_get_contents("php://input"),
    true
);


$text = trim(
    $input["text"] ?? ""
);


if ($text === "") {

    http_response_code(400);

    echo json_encode([
        "error" => "No feedback text"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


if (mb_strlen($text) > 5000) {

    http_response_code(400);

    echo json_encode([
        "error" => "Feedback is too long"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================
   Prompt
========================================= */

$prompt = "
أنت جزء من تطبيق اسمه رفيق يساعد المرضى في رحلة العلاج.

المستخدم كتب تجربة شخصية مرّ بها أثناء رحلته.

مهمتك فقط:

1. لخّص التجربة بجملة عربية قصيرة وواضحة.
2. صنّف التجربة في تصنيف واحد فقط من التصنيفات التالية:

- الاستعداد والمتطلبات
- الطريق والوصول
- داخل المستشفى
- العودة
- نصيحة عامة

قواعد مهمة جداً:

- لا تخترع أي معلومة غير موجودة في كلام المستخدم.
- لا تضف تعليمات طبية.
- لا تضف معلومات عن الطرق أو المواصلات من عندك.
- لا تحول تجربة المستخدم إلى معلومة رسمية.
- لا تحكم على المستخدم.
- حافظ على المعنى الأساسي للتجربة.
- اكتب الملخص بلغة عربية بسيطة ومفهومة.
- إذا احتوى النص على معلومات شخصية حساسة مثل رقم هوية أو رقم تصريح أو رقم هاتف، لا تضعها في الملخص.
- اختر تصنيفاً واحداً فقط من القائمة المحددة.

تجربة المستخدم:

\"\"\"$text\"\"\"

أرجع النتيجة JSON فقط بهذا الشكل:

{
    \"summary\": \"ملخص التجربة\",
    \"category\": \"أحد التصنيفات الخمسة\"
}

لا تكتب Markdown.
لا تستخدم ```json.
لا تكتب أي شرح قبل أو بعد JSON.
";


/* =========================================
   Gemini Request
========================================= */

$data = [

    "contents" => [
        [
            "parts" => [
                [
                    "text" => $prompt
                ]
            ]
        ]
    ],

    "generationConfig" => [
        "temperature" => 0,
        "responseMimeType" => "application/json"
    ]

];


$url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";


$ch = curl_init($url);


curl_setopt(
    $ch,
    CURLOPT_POST,
    true
);


curl_setopt(
    $ch,
    CURLOPT_HTTPHEADER,
    [
        "Content-Type: application/json",
        "x-goog-api-key: " . $GEMINI_API_KEY
    ]
);


curl_setopt(
    $ch,
    CURLOPT_POSTFIELDS,
    json_encode(
        $data,
        JSON_UNESCAPED_UNICODE
    )
);


curl_setopt(
    $ch,
    CURLOPT_RETURNTRANSFER,
    true
);


curl_setopt(
    $ch,
    CURLOPT_CONNECTTIMEOUT,
    5
);


curl_setopt(
    $ch,
    CURLOPT_TIMEOUT,
    20
);


$response = curl_exec($ch);


if ($response === false) {

    curl_close($ch);

    http_response_code(500);

    echo json_encode([
        "error" => "AI request failed"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


$httpCode =
    curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );


curl_close($ch);


$result =
    json_decode(
        $response,
        true
    );


/* =========================================
   Gemini Error
========================================= */

if (
    $httpCode < 200 ||
    $httpCode >= 300
) {

    http_response_code(500);

    echo json_encode([
        "error" =>
            $result["error"]["message"] ??
            "Gemini error"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================
   Get Gemini Text
========================================= */

$aiText =
    $result["candidates"][0]["content"]["parts"][0]["text"]
    ?? "";


$aiText = trim($aiText);


if ($aiText === "") {

    http_response_code(500);

    echo json_encode([
        "error" => "No AI result returned"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================
   Decode AI JSON
========================================= */

$analysis =
    json_decode(
        $aiText,
        true
    );


if (
    !is_array($analysis) ||
    !isset($analysis["summary"]) ||
    !isset($analysis["category"])
) {

    http_response_code(500);

    echo json_encode([
        "error" => "Invalid AI response"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================
   Validate Category
========================================= */

$allowedCategories = [

    "الاستعداد والمتطلبات",
    "الطريق والوصول",
    "داخل المستشفى",
    "العودة",
    "نصيحة عامة"

];


if (
    !in_array(
        $analysis["category"],
        $allowedCategories,
        true
    )
) {

    $analysis["category"] =
        "نصيحة عامة";

}


/* =========================================
   Final Response
========================================= */

echo json_encode([

    "summary" =>
        trim($analysis["summary"]),

    "category" =>
        $analysis["category"]

], JSON_UNESCAPED_UNICODE);

?>
<?php

header("Content-Type: application/json; charset=UTF-8");

require_once "config.php";


/* =========================================
   ONLY POST REQUESTS
========================================= */

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "error" => "Method not allowed"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================
   READ JSON
========================================= */

$input =
    json_decode(
        file_get_contents("php://input"),
        true
    );


if (
    !$input ||
    !isset($input["text"]) ||
    !isset($input["source"]) ||
    !isset($input["target"])
) {

    http_response_code(400);

    echo json_encode([
        "error" => "Missing translation data"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


$text =
    trim($input["text"]);

$source =
    $input["source"];

$target =
    $input["target"];


/* =========================================
   VALIDATION
========================================= */

if ($text === "") {

    http_response_code(400);

    echo json_encode([
        "error" => "Empty text"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


$allowedLanguages = [
    "ar",
    "he"
];


if (
    !in_array($source, $allowedLanguages, true) ||
    !in_array($target, $allowedLanguages, true)
) {

    http_response_code(400);

    echo json_encode([
        "error" => "Unsupported language"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* Prevent unnecessary translation */

if ($source === $target) {

    echo json_encode([
        "translation" => $text
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================
   LANGUAGE NAMES
========================================= */

$languageNames = [

    "ar" => "العربية",

    "he" => "العبرية"

];


$sourceName =
    $languageNames[$source];

$targetName =
    $languageNames[$target];


/* =========================================
   GEMINI PROMPT
========================================= */

$prompt = "
أنت مترجم فوري يساعد مريضاً أثناء التواصل في رحلة علاج.

ترجم النص التالي من {$sourceName} إلى {$targetName}.

النص:
{$text}

قواعد مهمة جداً:

- ترجم المعنى بدقة وبأسلوب طبيعي وواضح.
- لا تضف أي معلومات غير موجودة في النص.
- لا تشرح الترجمة.
- لا تكتب النص الأصلي.
- لا تضف عناوين أو علامات مثل: الترجمة:
- حافظ على أسماء الأشخاص والأماكن قدر الإمكان.
- إذا كانت الجملة طبية، لا تغيّر معناها ولا تحاول تشخيص الحالة.
- إذا لم يكن النص واضحاً، ترجم فقط الجزء الذي يمكن فهمه.
- أعد النص المترجم فقط.
";


/* =========================================
   GEMINI REQUEST
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

        "temperature" => 0

    ]

];


$url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";


$ch =
    curl_init($url);


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


$response =
    curl_exec($ch);


if ($response === false) {

    $curlError =
        curl_error($ch);

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


/* =========================================
   READ GEMINI RESPONSE
========================================= */

$result =
    json_decode(
        $response,
        true
    );


if (
    $httpCode < 200 ||
    $httpCode >= 300
) {

    http_response_code(500);

    echo json_encode([
        "error" =>
            $result["error"]["message"]
            ?? "Gemini error"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


$translation =
    $result["candidates"][0]["content"]["parts"][0]["text"]
    ?? "";


$translation =
    trim($translation);


/* =========================================
   EMPTY RESPONSE
========================================= */

if ($translation === "") {

    http_response_code(500);

    echo json_encode([
        "error" => "No translation returned"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================
   SUCCESS
========================================= */

echo json_encode([

    "translation" =>
        $translation

], JSON_UNESCAPED_UNICODE);

?>
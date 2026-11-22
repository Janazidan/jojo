<?php

header("Content-Type: application/json; charset=UTF-8");

require_once "config.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "error" => "Method not allowed"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

if (!isset($_FILES["image"])) {
    http_response_code(400);

    echo json_encode([
        "error" => "No image"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

$image = $_FILES["image"];

if ($image["error"] !== UPLOAD_ERR_OK) {
    http_response_code(400);

    echo json_encode([
        "error" => "Image upload failed"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

$allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

if (!in_array($image["type"], $allowedTypes)) {
    http_response_code(400);

    echo json_encode([
        "error" => "Image type not supported"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

$imageData = file_get_contents($image["tmp_name"]);

$base64Image = base64_encode($imageData);


$prompt = "
اقرأ النص الموجود في الصورة بدقة.

إذا كان النص بالعبرية، اقرأه ثم ترجمه إلى العربية.

إذا كان النص بالإنجليزية، اقرأه ثم ترجمه إلى العربية.

إذا كان النص بالعربية، اكتبه كما هو.

مهم جداً:
- لا تخمّن النص.
- لا تضف معلومات غير موجودة في الصورة.
- حافظ على أسماء الأماكن والأشخاص قدر الإمكان.
- إذا كانت هناك عدة كلمات أو جمل، ترجمها كلها.
- أعطني الترجمة العربية فقط.
- لا تشرح كيف ترجمت النص.
- لا تكتب النص الأصلي.
- إذا لم تستطع قراءة النص بوضوح، اكتب فقط:
لم أستطع قراءة النص بوضوح.
";


$data = [
    "contents" => [
        [
            "parts" => [
                [
                    "inline_data" => [
                        "mime_type" => $image["type"],
                        "data" => $base64Image
                    ]
                ],
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


$ch = curl_init($url);

curl_setopt($ch, CURLOPT_POST, true);

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
    json_encode($data)
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

$httpCode =
    curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );

curl_close($ch);


if ($response === false) {

    http_response_code(500);

    echo json_encode([
        "error" => "AI request failed"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


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
            $result["error"]["message"] ??
            "Gemini error"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


$translation =
    $result["candidates"][0]["content"]["parts"][0]["text"]
    ?? "";


if ($translation === "") {

    http_response_code(500);

    echo json_encode([
        "error" => "No translation returned"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


echo json_encode([
    "translation" => trim($translation)
], JSON_UNESCAPED_UNICODE);

?>
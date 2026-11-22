<?php

header("Content-Type: application/json; charset=UTF-8");

require_once "config.php";


/* =========================================
   POST only
========================================= */

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "error" => "Method not allowed"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================
   Check audio
========================================= */

if (!isset($_FILES["audio"])) {

    http_response_code(400);

    echo json_encode([
        "error" => "No audio received"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


$audio = $_FILES["audio"];


if ($audio["error"] !== UPLOAD_ERR_OK) {

    http_response_code(400);

    echo json_encode([
        "error" => "Audio upload failed"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================
   Validate size
   Max 10 MB for our MVP
========================================= */

if ($audio["size"] > 10 * 1024 * 1024) {

    http_response_code(400);

    echo json_encode([
        "error" => "Audio file too large"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================
   Detect MIME type
========================================= */

$finfo = finfo_open(FILEINFO_MIME_TYPE);

$mimeType = finfo_file(
    $finfo,
    $audio["tmp_name"]
);

finfo_close($finfo);


$allowedTypes = [
    "audio/webm",
    "video/webm",
    "application/octet-stream",
    "audio/ogg",
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/mp4",
    "video/mp4",
    "audio/m4a"
];

if (!in_array($mimeType, $allowedTypes, true)) {

    http_response_code(400);

    echo json_encode([
        "error" => "Audio type not supported",
        "detected_type" => $mimeType
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

/* =========================================
   Normalize browser recording MIME
========================================= */

if (
    $mimeType === "video/webm" ||
    $mimeType === "application/octet-stream"
) {
    $mimeType = "audio/webm";
}
/* =========================================
   Read audio
========================================= */

$audioData =
    file_get_contents(
        $audio["tmp_name"]
    );


if ($audioData === false) {

    http_response_code(500);

    echo json_encode([
        "error" => "Could not read audio"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


$base64Audio =
    base64_encode(
        $audioData
    );


/* =========================================
   Prompt
========================================= */

$prompt = "
استمع إلى التسجيل الصوتي واكتب الكلام المنطوق كنص.

التسجيل هو تجربة لمريض أو مرافق ضمن تطبيق رفيق.

قواعد مهمة جداً:

- اكتب الكلام المنطوق فقط.
- لا تلخص الكلام.
- لا تضف معلومات من عندك.
- لا تجب على المتحدث.
- لا تحول التجربة إلى نصيحة.
- حافظ على أسماء الأماكن كما نطقها المستخدم قدر الإمكان.
- إذا كان الكلام باللهجة الفلسطينية أو العامية العربية، اكتبه بشكل واضح مع الحفاظ على معناه وطريقته.
- تجاهل الأصوات غير الكلامية.
- إذا لم يكن هناك كلام مفهوم، أرجع نصاً فارغاً.

أرجع النص فقط بدون أي شرح.
";


/* =========================================
   Gemini Request
========================================= */

$data = [

    "contents" => [
        [
            "parts" => [

                [
                    "inline_data" => [
                        "mime_type" => $mimeType,
                        "data" => $base64Audio
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
    10
);


curl_setopt(
    $ch,
    CURLOPT_TIMEOUT,
    40
);


$response =
    curl_exec($ch);


if ($response === false) {

    $curlError =
        curl_error($ch);

    curl_close($ch);


    http_response_code(500);

    echo json_encode([
        "error" => "AI request failed",
        "details" => $curlError
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
   Gemini error
========================================= */

if (
    $httpCode < 200 ||
    $httpCode >= 300
) {

    http_response_code(500);

    echo json_encode([
        "error" =>
            $result["error"]["message"]
            ??
            "Gemini error"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================
   Extract transcript
========================================= */

$transcript =
    $result["candidates"][0]["content"]["parts"][0]["text"]
    ?? "";


$transcript =
    trim($transcript);


if ($transcript === "") {

    http_response_code(422);

    echo json_encode([
        "error" => "No speech detected"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================
   Return transcript
========================================= */

echo json_encode([

    "transcript" =>
        $transcript

], JSON_UNESCAPED_UNICODE);

?>
<?php
/**
 * Gemini API kommunikáció - szöveg + kép támogatás
 */

require_once __DIR__ . '/config.php';

class GeminiAI
{
    private string $apiKey;
    private string $model;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey  = GEMINI_API_KEY;
        $this->model   = GEMINI_MODEL;
        $this->baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/';
    }

    /** Szöveges generálás */
    public function generate(string $prompt, string $systemPrompt = ''): string
    {
        $contents = $this->buildContents($systemPrompt, [['text' => $prompt]]);
        return $this->callApi($contents);
    }

    /**
     * Kép + szöveg generálás
     */
    public function generateWithImage(string $prompt, string $imageData, string $mimeType = 'image/jpeg', string $systemPrompt = ''): string
    {
        $parts = [
            [
                'inline_data' => [
                    'mime_type' => $mimeType,
                    'data'      => $imageData,
                ]
            ],
            ['text' => $prompt]
        ];
        $contents = $this->buildContents($systemPrompt, $parts);
        return $this->callApi($contents, 0.2);
    }

    /**
     * Kép + szöveg → JSON válasz
     */
    public function generateJsonWithImage(string $prompt, string $imageData, string $mimeType = 'image/jpeg', string $systemPrompt = ''): array
    {
        $jsonPrompt = $prompt . "\n\nVÁLASZOLJ KIZÁRÓLAG VALID JSON FORMÁTUMBAN, semmi más szöveg ne legyen!";
        $raw = $this->generateWithImage($jsonPrompt, $imageData, $mimeType, $systemPrompt);

        $raw = trim($raw);
        $raw = preg_replace('/^```json\s*/i', '', $raw);
        $raw = preg_replace('/\s*```$/i', '', $raw);

        $decoded = json_decode($raw, true);
        if ($decoded === null) {
            throw new Exception("AI nem adott valid JSON-t: " . mb_substr($raw, 0, 500));
        }
        return $decoded;
    }

    private function buildContents(string $systemPrompt, array $userParts): array
    {
        $contents = [];
        if ($systemPrompt) {
            $contents[] = ['role' => 'user',  'parts' => [['text' => $systemPrompt]]];
            $contents[] = ['role' => 'model', 'parts' => [['text' => 'Értettem, e szerint járok el.']]];
        }
        $contents[] = ['role' => 'user', 'parts' => $userParts];
        return $contents;
    }

    private function callApi(array $contents, float $temperature = 0.7): string
    {
        $url = $this->baseUrl . $this->model . ':generateContent?key=' . $this->apiKey;

        $payload = json_encode([
            'contents'         => $contents,
            'generationConfig' => [
                'temperature'     => $temperature,
                'maxOutputTokens' => 4096,
            ]
        ], JSON_UNESCAPED_UNICODE);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_TIMEOUT        => 120,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception("Gemini API hiba (HTTP $httpCode): $response");
        }

        $data = json_decode($response, true);
        return $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Nincs válasz az AI-tól.';
    }
}

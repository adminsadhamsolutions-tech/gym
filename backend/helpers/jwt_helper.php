<?php

function jwtEncode($payload) {
    $config = include __DIR__ . '/../config/jwt.php';
    $header = ['typ' => 'JWT', 'alg' => 'HS256'];
    $payload = array_merge($payload, [
        'iss' => $config['issuer'],
        'iat' => time(),
        'exp' => time() + $config['expire'],
    ]);

    $segments = [base64UrlEncode(json_encode($header)), base64UrlEncode(json_encode($payload))];
    $signingInput = implode('.', $segments);
    $signature = hash_hmac('sha256', $signingInput, $config['secret'], true);
    $segments[] = base64UrlEncode($signature);
    return implode('.', $segments);
}

function jwtDecode($token) {
    $config = include __DIR__ . '/../config/jwt.php';
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $payload, $signature] = $parts;
    $expected = base64UrlEncode(hash_hmac('sha256', "$header.$payload", $config['secret'], true));
    if (!hash_equals($expected, $signature)) return null;
    $decoded = json_decode(base64UrlDecode($payload), true);
    if (!$decoded || ($decoded['exp'] ?? 0) < time()) return null;
    return $decoded;
}

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

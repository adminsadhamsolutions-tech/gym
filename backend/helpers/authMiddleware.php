<?php

require_once __DIR__ . '/response.php';
require_once __DIR__ . '/jwt_helper.php';

function requireAuth() {
    $headers = function_exists('apache_request_headers') ? apache_request_headers() : getallheaders();
    $token = null;
    $authorization = $headers['Authorization'] ?? $headers['authorization'] ?? null;
    if (!empty($authorization) && str_starts_with($authorization, 'Bearer ')) {
        $token = substr($authorization, 7);
    }

    if (!$token) {
        responseJson(['success' => false, 'message' => 'Access denied.'], 401);
    }

    $payload = jwtDecode($token);
    if (!$payload) {
        responseJson(['success' => false, 'message' => 'Invalid or expired token.'], 401);
    }

    return $payload;
}

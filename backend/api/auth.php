<?php
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt_helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responseJson([
        'success' => false,
        'message' => 'Method not allowed'
    ], 405);
}

$body = json_decode(file_get_contents('php://input'), true);

$email = trim($body['email'] ?? '');
$password = trim($body['password'] ?? '');

if (
    $email === 'admin@gymerp.com' &&
    $password === 'admin123'
) {

    $token = jwtEncode([
        'sub' => $email
    ]);

    responseJson([
        'success' => true,
        'token' => $token
    ]);
}

responseJson([
    'success' => false,
    'message' => 'Invalid credentials'
], 401);
<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt_helper.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responseJson(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$input = getJsonInput();
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$email || !$password) {
    responseJson(['success' => false, 'message' => 'Email and password are required.'], 400);
}

$stmt = $pdo->prepare('SELECT id, email, password FROM admins WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$admin = $stmt->fetch();

$isValidPassword = false;
if ($admin) {
    if (password_verify($password, $admin['password'])) {
        $isValidPassword = true;
    } elseif ($password === $admin['password']) {
        $isValidPassword = true;
        $newHash = password_hash($password, PASSWORD_BCRYPT);
        $updateStmt = $pdo->prepare('UPDATE admins SET password = ? WHERE id = ?');
        $updateStmt->execute([$newHash, $admin['id']]);
    }
}

if (!$admin || !$isValidPassword) {
    responseJson(['success' => false, 'message' => 'Invalid email or password.'], 401);
}

$token = jwtEncode(['id' => $admin['id'], 'email' => $admin['email']]);

responseJson([
    'success' => true,
    'message' => 'Login successful.',
    'token' => $token,
    'user' => [
        'id' => $admin['id'],
        'email' => $admin['email'],
    ],
]);

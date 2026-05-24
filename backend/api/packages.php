<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/authMiddleware.php';

$payload = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
if (!empty($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $method = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'];
}

if ($method === 'GET') {
    if (isset($id) && is_numeric($id)) {
        $stmt = $pdo->prepare('SELECT * FROM packages WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $package = $stmt->fetch();
        if (!$package) responseJson(['success' => false, 'message' => 'Package not found'], 404);
        responseJson(['success' => true, 'data' => $package]);
    }
    $stmt = $pdo->query('SELECT * FROM packages ORDER BY id DESC');
    $packages = $stmt->fetchAll();
    responseJson(['success' => true, 'data' => $packages]);
}

if ($method === 'POST') {
    $data = $_POST ?: json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('INSERT INTO packages (name, price, duration_days) VALUES (:name, :price, :duration_days)');
    $stmt->execute([
        'name' => $data['name'] ?? '',
        'price' => $data['price'] ?? 0,
        'duration_days' => $data['duration_days'] ?? 0,
    ]);
    responseJson(['success' => true, 'message' => 'Package created successfully']);
}

if ($method === 'PUT') {
    if (!isset($id) || !is_numeric($id)) {
        responseJson(['success' => false, 'message' => 'Package id is required'], 400);
    }
    $data = $_POST ?: json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('UPDATE packages SET name = :name, price = :price, duration_days = :duration_days WHERE id = :id');
    $stmt->execute([
        'name' => $data['name'] ?? '',
        'price' => $data['price'] ?? 0,
        'duration_days' => $data['duration_days'] ?? 0,
        'id' => $id,
    ]);
    responseJson(['success' => true, 'message' => 'Package updated successfully']);
}

if ($method === 'DELETE') {
    if (!isset($id) || !is_numeric($id)) {
        responseJson(['success' => false, 'message' => 'Package id is required'], 400);
    }
    $stmt = $pdo->prepare('DELETE FROM packages WHERE id = :id');
    $stmt->execute(['id' => $id]);
    responseJson(['success' => true, 'message' => 'Package deleted successfully']);
}

responseJson(['success' => false, 'message' => 'Method not allowed'], 405);

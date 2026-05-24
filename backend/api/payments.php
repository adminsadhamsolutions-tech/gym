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
    $stmt = $pdo->query('SELECT p.*, m.full_name AS member_name, m.remaining_amount, m.mobile_number AS member_mobile, m.end_date AS member_end_date FROM payments p LEFT JOIN members m ON p.member_id = m.id ORDER BY p.id DESC');
    $payments = $stmt->fetchAll();
    responseJson(['success' => true, 'data' => $payments]);
}

if ($method === 'POST') {
    $data = $_POST ?: json_decode(file_get_contents('php://input'), true);
    $memberId = $data['member_id'] ?? null;
    $amount = $data['amount'] ?? 0;
    $type = $data['type'] ?? 'cash';

    if (!$memberId) {
        responseJson(['success' => false, 'message' => 'Member id is required'], 400);
    }

    $stmt = $pdo->prepare('INSERT INTO payments (member_id, amount, type) VALUES (:member_id, :amount, :type)');
    $stmt->execute(['member_id' => $memberId, 'amount' => $amount, 'type' => $type]);

    $pdo->prepare('UPDATE members SET remaining_amount = GREATEST(remaining_amount - :payment, 0) WHERE id = :member_id')
        ->execute(['payment' => $amount, 'member_id' => $memberId]);

    responseJson(['success' => true, 'message' => 'Payment saved successfully']);
}

responseJson(['success' => false, 'message' => 'Method not allowed'], 405);

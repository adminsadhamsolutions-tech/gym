<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/authMiddleware.php';

$payload = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$id = $segments[1] ?? null;

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT r.*, m.full_name, m.mobile_number, p.name AS package_name FROM renewals r LEFT JOIN members m ON r.member_id = m.id LEFT JOIN packages p ON m.package_id = p.id ORDER BY r.id DESC');
    $renewals = $stmt->fetchAll();
    responseJson(['success' => true, 'data' => $renewals]);
}

if ($method === 'POST') {
    $data = $_POST ?: json_decode(file_get_contents('php://input'), true);
    $memberId = $data['member_id'] ?? null;
    $newEndDate = $data['new_end_date'] ?? null;
    $notes = $data['notes'] ?? '';

    if (!$memberId || !$newEndDate) {
        responseJson(['success' => false, 'message' => 'Member id and new end date are required'], 400);
    }

    // Get current end date
    $stmt = $pdo->prepare('SELECT end_date FROM members WHERE id = :id');
    $stmt->execute(['id' => $memberId]);
    $member = $stmt->fetch();

    if (!$member) {
        responseJson(['success' => false, 'message' => 'Member not found'], 404);
    }

    // Insert renewal record
    $stmt = $pdo->prepare('INSERT INTO renewals (member_id, old_end_date, new_end_date, notes) VALUES (:member_id, :old_end_date, :new_end_date, :notes)');
    $stmt->execute([
        'member_id' => $memberId,
        'old_end_date' => $member['end_date'],
        'new_end_date' => $newEndDate,
        'notes' => $notes
    ]);

    // Update member's end date
    $stmt = $pdo->prepare('
    UPDATE members 
    SET 
        end_date = :new_end_date,
        renewal_message_status = NULL,
        status = "active"
    WHERE id = :id
');

$stmt->execute([
    'new_end_date' => $newEndDate,
    'id' => $memberId
]);
    responseJson(['success' => true, 'message' => 'Renewal processed successfully']);
}

responseJson(['success' => false, 'message' => 'Method not allowed'], 405);

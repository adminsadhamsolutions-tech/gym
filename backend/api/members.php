<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/authMiddleware.php';
require_once __DIR__ . '/../helpers/upload.php';

$payload = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
if (!empty($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $method = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'];
}

if ($method === 'GET') {
    if (isset($id) && is_numeric($id)) {
        $stmt = $pdo->prepare('SELECT m.*, p.name AS package_name FROM members m LEFT JOIN packages p ON m.package_id = p.id WHERE m.id = :id');
        $stmt->execute(['id' => $id]);
        $member = $stmt->fetch();
        if (!$member) responseJson(['success' => false, 'message' => 'Member not found'], 404);
        responseJson(['success' => true, 'data' => $member]);
    }

    $stmt = $pdo->query('SELECT m.*, p.name AS package_name FROM members m LEFT JOIN packages p ON m.package_id = p.id ORDER BY m.id DESC');
    $members = $stmt->fetchAll();
    responseJson(['success' => true, 'data' => $members]);
}

if ($method === 'POST') {
    $data = $_POST;
    $photoPath = handleFileUpload('photo');
    $stmt = $pdo->prepare('INSERT INTO members (full_name, mobile_number, joining_date, end_date, package_id, cash_payment, online_payment, remaining_amount, whatsapp_added, join_message_status, renewal_message_status, photo) VALUES (:full_name, :mobile_number, :joining_date, :end_date, :package_id, :cash_payment, :online_payment, :remaining_amount, :whatsapp_added, :join_message_status, :renewal_message_status, :photo)');
    $stmt->execute([
        'full_name' => $data['full_name'] ?? '',
        'mobile_number' => $data['mobile_number'] ?? '',
        'joining_date' => $data['joining_date'] ?? '',
        'end_date' => $data['end_date'] ?? '',
        'package_id' => $data['package_id'] ?? null,
        'cash_payment' => $data['cash_payment'] ?? 0,
        'online_payment' => $data['online_payment'] ?? 0,
        'remaining_amount' => $data['remaining_amount'] ?? 0,
        'whatsapp_added' => $data['whatsapp_added'] ?? 'no',
        'join_message_status' => $data['join_message_status'] ?? 'pending',
        'renewal_message_status' => $data['renewal_message_status'] ?? 'pending',
        'photo' => $photoPath,
    ]);

    $memberId = $pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT m.*, p.name AS package_name FROM members m LEFT JOIN packages p ON m.package_id = p.id WHERE m.id = :id');
    $stmt->execute(['id' => $memberId]);
    $member = $stmt->fetch();

    responseJson(['success' => true, 'message' => 'Member added successfully', 'data' => $member]);
}

if ($method === 'PUT') {
    if (!isset($id) || !is_numeric($id)) {
        responseJson(['success' => false, 'message' => 'Member id is required'], 400);
    }
    $data = $_POST;
    $current = $pdo->prepare('SELECT photo FROM members WHERE id = :id');
    $current->execute(['id' => $id]);
    $existing = $current->fetch();

    $photoPath = handleFileUpload('photo', $existing['photo'] ?? null);

    $stmt = $pdo->prepare('UPDATE members SET full_name = :full_name, mobile_number = :mobile_number, joining_date = :joining_date, end_date = :end_date, package_id = :package_id, cash_payment = :cash_payment, online_payment = :online_payment, remaining_amount = :remaining_amount, whatsapp_added = :whatsapp_added, join_message_status = :join_message_status, renewal_message_status = :renewal_message_status, photo = :photo WHERE id = :id');
    $stmt->execute([
        'full_name' => $data['full_name'] ?? '',
        'mobile_number' => $data['mobile_number'] ?? '',
        'joining_date' => $data['joining_date'] ?? '',
        'end_date' => $data['end_date'] ?? '',
        'package_id' => $data['package_id'] ?? null,
        'cash_payment' => $data['cash_payment'] ?? 0,
        'online_payment' => $data['online_payment'] ?? 0,
        'remaining_amount' => $data['remaining_amount'] ?? 0,
        'whatsapp_added' => $data['whatsapp_added'] ?? 'no',
        'join_message_status' => $data['join_message_status'] ?? 'pending',
        'renewal_message_status' => $data['renewal_message_status'] ?? 'pending',
        'photo' => $photoPath,
        'id' => $id,
    ]);
    responseJson(['success' => true, 'message' => 'Member updated successfully']);
}

if ($method === 'DELETE') {
    if (!isset($id) || !is_numeric($id)) {
        responseJson(['success' => false, 'message' => 'Member id is required'], 400);
    }
    $stmt = $pdo->prepare('DELETE FROM members WHERE id = :id');
    $stmt->execute(['id' => $id]);
    responseJson(['success' => true, 'message' => 'Member deleted successfully']);
}

responseJson(['success' => false, 'message' => 'Method not allowed'], 405);

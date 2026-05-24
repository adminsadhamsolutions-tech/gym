<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/authMiddleware.php';
require_once __DIR__ . '/../helpers/whatsapp.php';

$payload = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responseJson(['success' => false, 'message' => 'Method not allowed'], 405);
}

$data = $_POST ?: json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? null;

if ($action === 'send_join_message') {
    $memberId = $data['member_id'] ?? null;
    if (!$memberId) {
        responseJson(['success' => false, 'message' => 'Member id is required'], 400);
    }
    
    $stmt = $pdo->prepare('SELECT m.*, p.name AS package_name FROM members m LEFT JOIN packages p ON m.package_id = p.id WHERE m.id = :id');
    $stmt->execute(['id' => $memberId]);
    $member = $stmt->fetch();
    
    if (!$member) {
        responseJson(['success' => false, 'message' => 'Member not found'], 404);
    }
    
    $result = sendMemberJoinMessage(
        $member['full_name'], 
        $member['package_name'] ?: 'Standard', 
        $member['mobile_number'], 
        $member['end_date'], 
        $member['cash_payment'], 
        $member['online_payment']
    );
    
    $pdo->prepare('UPDATE members SET join_message_status = :status WHERE id = :id')
        ->execute(['status' => 'sent', 'id' => $memberId]);
    
    responseJson(['success' => true, 'message' => 'Join message sent successfully', 'data' => $result]);
}

if ($action === 'send_expiry_alert') {
    $memberId = $data['member_id'] ?? null;
    if (!$memberId) {
        responseJson(['success' => false, 'message' => 'Member id is required'], 400);
    }
    
    $stmt = $pdo->prepare('SELECT m.*, p.name AS package_name FROM members m LEFT JOIN packages p ON m.package_id = p.id WHERE m.id = :id');
    $stmt->execute(['id' => $memberId]);
    $member = $stmt->fetch();
    
    if (!$member) {
        responseJson(['success' => false, 'message' => 'Member not found'], 404);
    }
    
    $result = sendMemberExpiryAlert($member['full_name'], $member['end_date'], $member['mobile_number']);
    
    $pdo->prepare('UPDATE members SET renewal_message_status = :status WHERE id = :id')
        ->execute(['status' => 'sent', 'id' => $memberId]);
    
    responseJson(['success' => true, 'message' => 'Expiry alert sent successfully', 'data' => $result]);
}

if ($action === 'send_payment_receipt') {
    $memberId = $data['member_id'] ?? null;
    $amount = $data['amount'] ?? null;
    $type = $data['type'] ?? null;
    if (!$memberId || !$amount || !$type) {
        responseJson(['success' => false, 'message' => 'Member id, amount, and payment type are required'], 400);
    }

    $stmt = $pdo->prepare('SELECT m.*, p.name AS package_name FROM members m LEFT JOIN packages p ON m.package_id = p.id WHERE m.id = :id');
    $stmt->execute(['id' => $memberId]);
    $member = $stmt->fetch();

    if (!$member) {
        responseJson(['success' => false, 'message' => 'Member not found'], 404);
    }

    $result = sendPaymentReceiptMessage($member['full_name'], $amount, $type, $member['end_date'], $member['mobile_number']);
    responseJson(['success' => true, 'message' => 'Payment receipt message sent successfully', 'data' => $result]);
}

responseJson(['success' => false, 'message' => 'Invalid action'], 400);

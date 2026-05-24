<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/authMiddleware.php';

$payload = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$id = $segments[1] ?? null;

if ($method === 'GET') {
    if ($id) {
        $stmt = $pdo->prepare('SELECT * FROM expenses WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $expense = $stmt->fetch();
        if (!$expense) {
            responseJson(['success' => false, 'message' => 'Expense not found'], 404);
        }
        responseJson(['success' => true, 'data' => $expense]);
    } else {
        $stmt = $pdo->query('SELECT * FROM expenses ORDER BY date DESC');
        $expenses = $stmt->fetchAll();
        responseJson(['success' => true, 'data' => $expenses]);
    }
}

if ($method === 'POST') {
    $data = $_POST ?: json_decode(file_get_contents('php://input'), true);
    $category = $data['category'] ?? null;
    $description = $data['description'] ?? '';
    $amount = $data['amount'] ?? 0;
    $date = $data['date'] ?? date('Y-m-d');

    if (!$category || !$amount) {
        responseJson(['success' => false, 'message' => 'Category and amount are required'], 400);
    }

    $stmt = $pdo->prepare('INSERT INTO expenses (category, description, amount, date) VALUES (:category, :description, :amount, :date)');
    $stmt->execute([
        'category' => $category,
        'description' => $description,
        'amount' => $amount,
        'date' => $date
    ]);

    responseJson(['success' => true, 'message' => 'Expense saved successfully']);
}

if ($method === 'PUT' || $method === 'DELETE') {
    if (!$id) {
        responseJson(['success' => false, 'message' => 'ID is required'], 400);
    }

    if ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        $category = $data['category'] ?? null;
        $description = $data['description'] ?? '';
        $amount = $data['amount'] ?? 0;
        $date = $data['date'] ?? date('Y-m-d');

        if (!$category || !$amount) {
            responseJson(['success' => false, 'message' => 'Category and amount are required'], 400);
        }

        $stmt = $pdo->prepare('UPDATE expenses SET category = :category, description = :description, amount = :amount, date = :date WHERE id = :id');
        $stmt->execute([
            'category' => $category,
            'description' => $description,
            'amount' => $amount,
            'date' => $date,
            'id' => $id
        ]);

        responseJson(['success' => true, 'message' => 'Expense updated successfully']);
    }

    if ($method === 'DELETE') {
        $stmt = $pdo->prepare('DELETE FROM expenses WHERE id = :id');
        $stmt->execute(['id' => $id]);
        responseJson(['success' => true, 'message' => 'Expense deleted successfully']);
    }
}

responseJson(['success' => false, 'message' => 'Method not allowed'], 405);

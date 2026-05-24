<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt_helper.php';
require_once __DIR__ . '/../helpers/authMiddleware.php';
require_once __DIR__ . '/../helpers/upload.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$scriptName = dirname($_SERVER['SCRIPT_NAME']);
$path = trim(str_replace($scriptName, '', $uri), '/');
$segments = array_values(array_filter(explode('/', $path), fn($segment) => $segment !== ''));
if (!empty($segments) && $segments[0] === 'api') {
    array_shift($segments);
}

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$resource = $segments[0] ?? null;
$id = $segments[1] ?? null;

switch ($resource) {
    case 'login':
        require_once __DIR__ . '/auth.php';
        break;
    case 'members':
        require_once __DIR__ . '/members.php';
        break;
    case 'packages':
        require_once __DIR__ . '/packages.php';
        break;
    case 'payments':
        require_once __DIR__ . '/payments.php';
        break;
    case 'whatsapp':
        require_once __DIR__ . '/whatsapp.php';
        break;
    case 'renewals':
        require_once __DIR__ . '/renewals.php';
        break;
    case 'expenses':
        require_once __DIR__ . '/expenses.php';
        break;
    default:
        responseJson(['success' => false, 'message' => 'Endpoint not found'], 404);
        break;
}

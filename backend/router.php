<?php
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$fullPath = __DIR__ . $uri;

if ($uri !== '/' && file_exists($fullPath) && !is_dir($fullPath)) {
    return false;
}

require_once __DIR__ . '/api/index.php';

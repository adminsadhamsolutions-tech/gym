<?php

function handleFileUpload($field, $existingPath = null) {
    if (empty($_FILES[$field]) || $_FILES[$field]['error'] !== UPLOAD_ERR_OK) {
        return $existingPath;
    }

    $uploadDir = __DIR__ . '/../uploads/members';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $file = $_FILES[$field];
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = uniqid('member_', true) . '.' . strtolower($ext);
    $destination = $uploadDir . '/' . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        return $existingPath;
    }

    if ($existingPath && file_exists(__DIR__ . '/../' . ltrim($existingPath, '/'))) {
        @unlink(__DIR__ . '/../' . ltrim($existingPath, '/'));
    }

    return 'uploads/members/' . $fileName;
}

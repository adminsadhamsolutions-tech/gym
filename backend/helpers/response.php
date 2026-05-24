<?php

function responseJson($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function getJsonInput() {
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

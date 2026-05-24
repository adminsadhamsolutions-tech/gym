<?php

$env = file_exists(__DIR__ . '/../.env') ? parse_ini_file(__DIR__ . '/../.env') : [];

return [
    'secret' => $env['JWT_SECRET'] ?? 'verysecretkey',
    'issuer' => $env['JWT_ISSUER'] ?? 'GymERP',
    'expire' => intval($env['JWT_EXPIRE'] ?? 86400),
];

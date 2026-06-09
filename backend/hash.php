<?php
$email = "Orien@fitness.com";
$password = "Netrajagan@2022";

$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

echo "Email: " . $email . "<br>";
echo "Hashed Password: " . $hashedPassword;
?>
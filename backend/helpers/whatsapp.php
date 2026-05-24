<?php

function sendWhatsAppMessage($phoneNumber, $message) {
    // Remove spaces and country code handling
    $phoneNumber = preg_replace('/[^0-9]/', '', $phoneNumber);
    if (strlen($phoneNumber) === 10) {
        $phoneNumber = '91' . $phoneNumber;
    } elseif (!str_starts_with($phoneNumber, '91') && strlen($phoneNumber) === 12) {
        $phoneNumber = '91' . $phoneNumber;
    }

    // Log message locally (for demo purposes)
    $logFile = __DIR__ . '/../uploads/whatsapp_log.txt';
    $logEntry = date('Y-m-d H:i:s') . " | Phone: +$phoneNumber | Message: $message\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND);

    // In production, integrate with:
    // - Twilio WhatsApp API
    // - AWS SNS
    // - MessageBird
    // - Your custom WhatsApp Business API

    return [
        'success' => true,
        'phone' => '+' . $phoneNumber,
        'message' => 'WhatsApp message queued successfully'
    ];
}

function sendMemberJoinMessage($memberName, $packageName, $phoneNumber, $endDate, $cashPayment = 0, $onlinePayment = 0) {
    $totalPayment = number_format($cashPayment + $onlinePayment, 2, '.', ',');
    $message = "Hi $memberName! 🎉\n\n"
        . "Thanks for joining our gym. Your $packageName plan is active until " . date('d M Y', strtotime($endDate)) . ".\n\n"
        . "Payment received: ₹$totalPayment.\n\n"
        . "We’re excited to welcome you to the gym family. See you soon! 💪\n\n"
        . "Regards,\nGym ERP Team";
    return sendWhatsAppMessage($phoneNumber, $message);
}

function sendMemberExpiryAlert($memberName, $endDate, $phoneNumber) {
    $message = "Hi $memberName! 📢\n\n"
        . "Your gym membership expires on " . date('d M Y', strtotime($endDate)) . ".\n\n"
        . "Renew now to continue your workouts without interruption.\n\n"
        . "Regards,\nGym ERP Team";
    return sendWhatsAppMessage($phoneNumber, $message);
}

function sendPaymentReceiptMessage($memberName, $amount, $type, $endDate, $phoneNumber) {
    $paymentType = $type === 'online' ? 'online' : 'cash';
    $formattedAmount = number_format($amount, 2, '.', ',');
    $message = "Hi $memberName! 💰\n\n"
        . "We received your $paymentType payment of ₹$formattedAmount. Your membership is valid until " . date('d M Y', strtotime($endDate)) . ".\n\n"
        . "Thank you for choosing our gym! 💪\n\n"
        . "Regards,\nGym ERP Team";
    return sendWhatsAppMessage($phoneNumber, $message);
}

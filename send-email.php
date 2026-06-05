<?php
$to_fallback = "info@aitengineering.co.th";
$from_domain = "aitengineering.co.th";

$allowed_recipients = [
    "info@aitengineering.co.th",
    "support@aitengineering.co.th",
    "banpong@aitengineering.co.th",
    "aitsales1@aitengineering.co.th",
    "aitsales3@aitengineering.co.th",
    "aitsales4@aitengineering.co.th",
];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: contact.html");
    exit;
}

function clean($value) {
    $value = str_replace(["\r", "\n", "%0a", "%0d"], '', $value);
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

$fullname = clean($_POST['fullname'] ?? '');
$email    = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$tel      = clean($_POST['tel'] ?? '');
$message  = htmlspecialchars(strip_tags(trim($_POST['message'] ?? '')), ENT_QUOTES, 'UTF-8');
$dept     = trim($_POST['dept'] ?? $to_fallback);

$errors = [];

if (empty($fullname)) {
    $errors[] = "Please enter your name.";
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Invalid email address.";
}
if (empty($tel)) {
    $errors[] = "Please enter your phone number.";
}
if (empty($message)) {
    $errors[] = "Please enter your message.";
}

if (!in_array($dept, $allowed_recipients)) {
    $dept = $to_fallback;
}

if (!empty($errors)) {
    header("Content-Type: text/html; charset=UTF-8");
    echo "<div style='font-family:sans-serif; padding:20px; max-width:500px; margin:50px auto; border:1px solid #fee2e2; background:#fef2f2; rounded-xl'>";
    echo "<p style='color:#dc2626; font-weight:bold; margin-bottom:10px;'>Error occurred while sending data:</p>";
    echo "<ul style='color:#4b5563; padding-left:20px;'>" . implode("", array_map(function($err) { return "<li>$err</li>"; }, $errors)) . "</ul>";
    echo "<br><a href='javascript:history.back()' style='color:#16a34a; text-decoration:none; font-weight:bold;'>← กลับไปแก้ไขข้อมูล</a>";
    echo "</div>";
    exit;
}

$to      = $dept;
$subject = "=?UTF-8?B?" . base64_encode("AIT Contact Form: " . $fullname) . "?=";

$body  = "There is a new message from the contact form on the website\n";
$body .= "========================================\n";
$body .= "Name        : $fullname\n";
$body .= "Email       : $email\n";
$body .= "Phone Number: $tel\n";
$body .= "Department  : $dept\n";
$body .= "========================================\n\n";
$body .= "Message Details:\n$message\n";

$headers  = "From: no-reply@{$from_domain}\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: base64\r\n";

$encoded_body = chunk_split(base64_encode($body));

$sent = mail($to, $subject, $encoded_body, $headers);

if ($sent) {
    header("Location: contact.html?status=success");
    exit;
} else {
    header("Location: contact.html?status=error");
    exit;
}
?>
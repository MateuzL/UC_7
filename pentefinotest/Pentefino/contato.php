<?php
// Processa o formulário de contato sem abrir aplicativo de e-mail no dispositivo do visitante.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html#contato-desenvolvedores');
    exit;
}

$name = trim((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$subject = trim((string)($_POST['subject'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

$redirect = 'index.html#contato-desenvolvedores';

if ($name === '' || $email === '' || $subject === '' || $message === '') {
    header('Location: ' . $redirect . '?contato=campos');
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: ' . $redirect . '?contato=email');
    exit;
}

// Remove quebras de linha dos campos usados em cabeçalhos.
$safeName = preg_replace('/[\r\n]+/', ' ', $name);
$safeSubject = preg_replace('/[\r\n]+/', ' ', $subject);
$safeEmail = preg_replace('/[\r\n]+/', '', $email);

$to = 'contato@desenvolvedorcb.com.br';
$mailSubject = '[Operação Pente Fino] ' . $safeSubject;
$mailBody = "Nova mensagem recebida pelo site Operação Pente Fino.\n\n"
    . "Nome: " . $safeName . "\n"
    . "E-mail: " . $safeEmail . "\n"
    . "Assunto: " . $safeSubject . "\n\n"
    . "Mensagem:\n" . $message . "\n";

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: Operação Pente Fino <contato@desenvolvedorcb.com.br>',
    'Reply-To: ' . $safeEmail,
    'X-Mailer: PHP/' . PHP_VERSION
];

$sent = mail($to, $mailSubject, $mailBody, implode("\r\n", $headers));

header('Location: ' . $redirect . '?contato=' . ($sent ? 'sucesso' : 'erro'));
exit;
?>

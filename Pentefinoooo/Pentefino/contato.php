<?php
header('Content-Type: text/html; charset=UTF-8');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Location: professor.html'); exit; }
$nome = trim($_POST['nome'] ?? '');
$email = trim($_POST['email'] ?? '');
$assunto = trim($_POST['assunto'] ?? '');
$mensagem = trim($_POST['mensagem'] ?? '');
if ($nome === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $mensagem === '') {
  header('Location: professor.html?contato=erro#fale-conosco'); exit;
}
$destino = 'contato@desenvolvedorcb.com.br';
$subject = 'Operação Pente Fino — ' . ($assunto !== '' ? $assunto : 'Contato pelo site');
$body = "Nome: {$nome}\nE-mail: {$email}\nAssunto: {$assunto}\n\nMensagem:\n{$mensagem}";
$headers = "From: contato@desenvolvedorcb.com.br\r\n" . "Reply-To: {$email}\r\n" . "Content-Type: text/plain; charset=UTF-8\r\n";
$sent = mail($destino, $subject, $body, $headers);
header('Location: professor.html?contato=' . ($sent ? 'ok' : 'erro') . '#fale-conosco');
exit;
?>
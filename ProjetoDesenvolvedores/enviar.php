<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Location: index.html#contato'); exit; }
$destino = 'SEU_EMAIL_AQUI@exemplo.com'; // ALTERE PARA O E-MAIL QUE DEVE RECEBER AS MENSAGENS
$nome = trim($_POST['nome'] ?? ''); $email = trim($_POST['email'] ?? ''); $assunto = trim($_POST['assunto'] ?? ''); $mensagem = trim($_POST['mensagem'] ?? '');
if ($nome === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $assunto === '' || $mensagem === '') { die('Preencha todos os campos corretamente. <a href="index.html#contato">Voltar</a>'); }
$assuntoSeguro = 'Contato - ' . preg_replace('/[\r\n]+/', ' ', $assunto);
$corpo = "Nome: $nome\nE-mail: $email\n\nMensagem:\n$mensagem";
$headers = "From: formulario@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "\r\n" . "Reply-To: $email\r\n" . "Content-Type: text/plain; charset=UTF-8\r\n";
if (@mail($destino, $assuntoSeguro, $corpo, $headers)) { echo '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Mensagem enviada</title><style>body{font-family:Arial;background:#07101d;color:white;text-align:center;padding:80px}a{color:#52c8ff}</style><h1>Mensagem enviada!</h1><p>Obrigado pelo contato. Nossa equipe recebeu sua mensagem.</p><a href="index.html">Voltar ao site</a></html>'; } else { echo '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Falha no envio</title><style>body{font-family:Arial;background:#07101d;color:white;text-align:center;padding:80px}a{color:#52c8ff}</style><h1>Não foi possível enviar</h1><p>O servidor PHP ainda não está configurado para envio de e-mails. Verifique o endereço em enviar.php e a configuração de e-mail da hospedagem.</p><a href="index.html#contato">Voltar</a></html>'; }
?>

<?php
// ENVIO REAL DE E-MAIL
// 1) Coloque neste campo o e-mail que deverá receber as mensagens.
// 2) Hospede este projeto em um servidor com PHP e serviço de e-mail configurado.
// 3) Para hospedagens que bloqueiam mail(), use PHPMailer/SMTP.

$destino = "SEU_EMAIL_AQUI@exemplo.com";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: index.html#contato");
    exit;
}

$nome = trim($_POST["nome"] ?? "");
$email = trim($_POST["email"] ?? "");
$assunto = trim($_POST["assunto"] ?? "");
$mensagem = trim($_POST["mensagem"] ?? "");

if ($nome === "" || !filter_var($email, FILTER_VALIDATE_EMAIL) || $assunto === "" || $mensagem === "") {
    http_response_code(400);
    exit("Preencha todos os campos corretamente.");
}

$nome = strip_tags($nome);
$assunto = strip_tags($assunto);
$mensagem = strip_tags($mensagem);

$headers = "From: formulario@seudominio.com\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$corpo = "Nova mensagem do site Desenvolvedores Corumbá\n\n";
$corpo .= "Nome: " . $nome . "\n";
$corpo .= "E-mail: " . $email . "\n";
$corpo .= "Assunto: " . $assunto . "\n\n";
$corpo .= "Mensagem:\n" . $mensagem . "\n";

if (mail($destino, $assunto, $corpo, $headers)) {
    echo '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Mensagem enviada</title><style>body{font-family:Arial;background:#030814;color:#fff;text-align:center;padding:15vh 20px}a{color:#00c8ff}</style><h1>Mensagem enviada!</h1><p>Obrigado pelo contato.</p><a href="index.html#contato">Voltar ao site</a></html>';
} else {
    http_response_code(500);
    echo '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Erro</title><style>body{font-family:Arial;background:#030814;color:#fff;text-align:center;padding:15vh 20px}a{color:#00c8ff}</style><h1>Não foi possível enviar.</h1><p>Configure o serviço de e-mail do servidor PHP e o endereço em enviar.php.</p><a href="index.html#contato">Voltar</a></html>';
}
?>

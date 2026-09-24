<?php
/*
 * Recebe o formulário "Fale Conosco" do index.html e envia por e-mail
 * para a Secretaria de Saúde. Responde sempre em JSON: {"ok":bool,"erro"?:string}
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function responder(int $codigo, array $dados): void {
    http_response_code($codigo);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(405, ['ok' => false, 'erro' => 'Método não permitido.']);
}

$config = require __DIR__ . '/config.php';

// Anti-spam: campo "site" é invisível para pessoas; robôs costumam preenchê-lo.
if (!empty($_POST['site'])) {
    responder(200, ['ok' => true]);
}

// Limite simples de frequência por sessão.
session_start();
$agora = time();
if (isset($_SESSION['ultimo_envio']) && $agora - $_SESSION['ultimo_envio'] < $config['intervalo_minimo']) {
    responder(429, ['ok' => false, 'erro' => 'Aguarde alguns segundos antes de enviar outra mensagem.']);
}

// Remove quebras de linha de campos que vão em cabeçalhos (evita injeção de cabeçalho).
function limparLinha(string $v, int $max): string {
    $v = trim(preg_replace('/[\r\n\t]+/', ' ', $v));
    return mb_substr($v, 0, $max);
}

$nome     = limparLinha((string)($_POST['nome'] ?? ''), 120);
$email    = limparLinha((string)($_POST['email'] ?? ''), 160);
$telefone = limparLinha((string)($_POST['telefone'] ?? ''), 30);
$assunto  = limparLinha((string)($_POST['assunto'] ?? 'Contato'), 120);
$mensagem = mb_substr(trim((string)($_POST['mensagem'] ?? '')), 0, 5000);

if ($nome === '' || $mensagem === '') {
    responder(422, ['ok' => false, 'erro' => 'Preencha nome e mensagem.']);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(422, ['ok' => false, 'erro' => 'Informe um e-mail válido para resposta.']);
}

$assuntoFinal = $config['prefixo_assunto'] . ' ' . $assunto;
$corpo = "Nova mensagem enviada pelo formulário Fale Conosco\n"
       . "==================================================\n\n"
       . "Nome:     $nome\n"
       . "E-mail:   $email\n"
       . "Telefone: " . ($telefone !== '' ? $telefone : '-') . "\n"
       . "Assunto:  $assunto\n"
       . "Data:     " . date('d/m/Y H:i') . "\n"
       . "IP:       " . ($_SERVER['REMOTE_ADDR'] ?? '-') . "\n\n"
       . "Mensagem:\n---------\n$mensagem\n";

$destino = $config['email_destino'];
$enviado = !empty($config['smtp']['ativo'])
    ? enviarSmtp($config, $destino, $email, $nome, $assuntoFinal, $corpo)
    : enviarMail($config, $destino, $email, $nome, $assuntoFinal, $corpo);

if (!$enviado) {
    responder(500, ['ok' => false, 'erro' => 'O servidor não conseguiu enviar o e-mail agora.']);
}
$_SESSION['ultimo_envio'] = $agora;
responder(200, ['ok' => true]);

/* ---------- Envio pela função mail() nativa ---------- */
function enviarMail(array $c, string $para, string $replyTo, string $nome, string $assunto, string $corpo): bool {
    $cab = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'From: ' . mb_encode_mimeheader($c['nome_remetente'], 'UTF-8') . ' <' . $c['email_remetente'] . '>',
        'Reply-To: ' . mb_encode_mimeheader($nome, 'UTF-8') . ' <' . $replyTo . '>',
        'X-Mailer: PHP/' . PHP_VERSION,
    ];
    return @mail($para, mb_encode_mimeheader($assunto, 'UTF-8'), $corpo, implode("\r\n", $cab), '-f' . $c['email_remetente']);
}

/* ---------- Envio via SMTP autenticado (sem dependências externas) ---------- */
function enviarSmtp(array $c, string $para, string $replyTo, string $nome, string $assunto, string $corpo): bool {
    $s = $c['smtp'];
    $host = ($s['seguranca'] === 'ssl' ? 'ssl://' : '') . $s['host'];
    $fp = @stream_socket_client("$host:{$s['porta']}", $errno, $errstr, 15);
    if (!$fp) return false;
    stream_set_timeout($fp, 15);

    $ler = function () use ($fp): string {
        $resp = '';
        while (($linha = fgets($fp, 515)) !== false) {
            $resp .= $linha;
            if (isset($linha[3]) && $linha[3] === ' ') break;
        }
        return $resp;
    };
    $cmd = function (string $comando, array $esperado) use ($fp, $ler): bool {
        fwrite($fp, $comando . "\r\n");
        return in_array((int)substr($ler(), 0, 3), $esperado, true);
    };

    $servidor = $_SERVER['SERVER_NAME'] ?? 'localhost';
    $ok = in_array((int)substr($ler(), 0, 3), [220], true)
       && $cmd("EHLO $servidor", [250]);
    if ($ok && $s['seguranca'] === 'tls') {
        $ok = $cmd('STARTTLS', [220])
           && stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)
           && $cmd("EHLO $servidor", [250]);
    }
    $ok = $ok
       && $cmd('AUTH LOGIN', [334])
       && $cmd(base64_encode($s['usuario']), [334])
       && $cmd(base64_encode($s['senha']), [235])
       && $cmd('MAIL FROM:<' . $s['usuario'] . '>', [250])
       && $cmd("RCPT TO:<$para>", [250, 251])
       && $cmd('DATA', [354]);
    if (!$ok) { fclose($fp); return false; }

    $cab = [
        'Date: ' . date('r'),
        'From: ' . mb_encode_mimeheader($c['nome_remetente'], 'UTF-8') . ' <' . $s['usuario'] . '>',
        "To: <$para>",
        'Reply-To: ' . mb_encode_mimeheader($nome, 'UTF-8') . " <$replyTo>",
        'Subject: ' . mb_encode_mimeheader($assunto, 'UTF-8'),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];
    // Normaliza quebras de linha e escapa linhas iniciadas por "." (regra do SMTP).
    $corpoSmtp = preg_replace('/^\./m', '..', str_replace(["\r\n", "\r", "\n"], "\r\n", $corpo));
    $ok = $cmd(implode("\r\n", $cab) . "\r\n\r\n" . $corpoSmtp . "\r\n.", [250]);
    $cmd('QUIT', [221]);
    fclose($fp);
    return $ok;
}

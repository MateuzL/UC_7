<?php
$sucesso = '';
$erro = '';

require_once __DIR__ . '/email-config.php';

$isAjaxRequest = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

function smtp_read($socket) {
    $response = '';
    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;
        if (strlen($line) >= 4 && $line[3] === ' ') {
            break;
        }
    }
    return $response;
}

function smtp_expect($socket, $codes) {
    $response = smtp_read($socket);
    $code = (int)substr($response, 0, 3);
    if (!in_array($code, (array)$codes, true)) {
        throw new Exception('Resposta SMTP inesperada: ' . trim($response));
    }
    return $response;
}

function smtp_command($socket, $command, $codes) {
    fwrite($socket, $command . "\r\n");
    return smtp_expect($socket, $codes);
}

function smtp_send_message($to, $from, $replyTo, $subject, $body) {
    $host = SMTP_HOST;
    $port = SMTP_PORT;
    $timeout = 20;

    $socket = @stream_socket_client(
        'ssl://' . $host . ':' . $port,
        $errno,
        $errstr,
        $timeout,
        STREAM_CLIENT_CONNECT
    );

    if (!$socket) {
        throw new Exception('Não foi possível conectar ao servidor SMTP: ' . $errstr);
    }

    stream_set_timeout($socket, $timeout);

    try {
        smtp_expect($socket, 220);

        $helo = $_SERVER['SERVER_NAME'] ?? 'desenvolvedorcb.com.br';
        smtp_command($socket, 'EHLO ' . preg_replace('/[^a-zA-Z0-9.-]/', '', $helo), 250);

        smtp_command($socket, 'AUTH LOGIN', 334);
        smtp_command($socket, base64_encode(SMTP_USERNAME), 334);
        smtp_command($socket, base64_encode(SMTP_PASSWORD), 235);

        smtp_command($socket, 'MAIL FROM:<' . SMTP_USERNAME . '>', 250);
        smtp_command($socket, 'RCPT TO:<' . $to . '>', [250, 251]);
        smtp_command($socket, 'DATA', 354);

        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $safeReply = str_replace(["\r", "\n"], '', $replyTo);

        $headers = [
            'Date: ' . date('r'),
            'From: Desenvolvedores Corumbá <' . SMTP_USERNAME . '>',
            'To: <' . $to . '>',
            'Reply-To: ' . $safeReply,
            'Subject: ' . $encodedSubject,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
        ];

        // SMTP requires a line containing only a dot to be escaped.
        $body = str_replace(["\r\n", "\r"], "\n", $body);
        $body = str_replace("\n.", "\n..", $body);
        $body = str_replace("\n", "\r\n", $body);

        fwrite($socket, implode("\r\n", $headers) . "\r\n\r\n" . $body . "\r\n.\r\n");
        smtp_expect($socket, 250);

        smtp_command($socket, 'QUIT', 221);
    } finally {
        fclose($socket);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $destino = CONTACT_RECIPIENT;

    $nome = trim($_POST['nome'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $assunto = trim($_POST['assunto'] ?? '');
    $mensagem = trim($_POST['mensagem'] ?? '');

    if (
        $nome === '' ||
        !filter_var($email, FILTER_VALIDATE_EMAIL) ||
        $assunto === '' ||
        $mensagem === ''
    ) {
        $erro = 'Preencha todos os campos corretamente.';
    } else {
        $assuntoSeguro = 'Contato - ' . preg_replace('/[\r\n]+/', ' ', $assunto);
        $nomeSeguro = preg_replace('/[\r\n]+/', ' ', $nome);

        $corpo =
            "Novo contato pelo site Desenvolvedores Corumbá\n\n" .
            "Nome: " . $nomeSeguro . "\n" .
            "E-mail: " . $email . "\n" .
            "Assunto: " . $assuntoSeguro . "\n\n" .
            "Mensagem:\n" . $mensagem . "\n";

        try {
            smtp_send_message(
                $destino,
                SMTP_USERNAME,
                $email,
                $assuntoSeguro,
                $corpo
            );
            $sucesso = 'Mensagem enviada com sucesso! Em breve entraremos em contato.';
        } catch (Throwable $e) {
            // Não exibe credenciais ou detalhes internos para o visitante.
            $erro = 'Não foi possível enviar a mensagem agora. Verifique a configuração SMTP da conta de e-mail.';
            error_log('Erro no formulário de contato: ' . $e->getMessage());
        }
    }
}

if ($isAjaxRequest && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => $sucesso !== '',
        'message' => $sucesso !== '' ? $sucesso : $erro
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Desenvolvedores Corumbá - tecnologia, desenvolvimento de sistemas, design e inteligência artificial.">
<title>Desenvolvedores Corumbá | Tecnologia & Inovação</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Orbitron:wght@500;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
<canvas id="matrixCanvas" aria-hidden="true"></canvas>
<div class="grid-bg"></div>
<header class="navbar">
  <a class="logo" href="#inicio" aria-label="Desenvolvedores Corumbá">
    <span class="logo-symbol">&lt;/&gt;</span><span><strong>DESENVOLVEDORES</strong><small>CORUMBÁ • MS</small></span>
  </a>
  <button class="menu-toggle" aria-label="Abrir menu" aria-expanded="false">☰</button>
  <nav class="nav-menu">
    <a class="active" href="#inicio">🏠 Início</a><a href="#projetos">📂 Projetos</a><a href="#galeria">🖼️ Galeria</a><a href="#sobre">ℹ️ Sobre</a><a href="#contato">✉️ Fale Conosco</a>
  </nav>
</header>
<main id="inicio">
<section class="hero">
  <div class="hero-slides">
    <article class="hero-slide active"><div class="hero-copy"><span class="eyebrow">• BACKEND</span><h1>Node<span>.js</span></h1><p>Construção de APIs e aplicações rápidas, escaláveis e orientadas a serviços usando JavaScript no servidor.</p><code>const server = http.createServer();</code></div><div class="hero-art node-art"><b>JS</b><small>NODE.JS</small></div></article>
    <article class="hero-slide"><div class="hero-copy"><span class="eyebrow">• WEB</span><h1>Web <span>Development</span></h1><p>HTML, CSS, JavaScript e PHP para criar páginas, sistemas web e experiências digitais responsivas.</p><code>&lt;main&gt; • CSS • JS • PHP</code></div><div class="hero-art web-art"><b>&lt;/&gt;</b><small>HTML • CSS • JS • PHP</small></div></article>
    <article class="hero-slide"><div class="hero-copy"><span class="eyebrow">• DESKTOP</span><h1>Desktop <span>Apps</span></h1><p>ElectronJS, Qt/PySide6, Flutter Desktop e .NET MAUI para soluções multiplataforma.</p><code>DESKTOP • CROSS-PLATFORM • UI</code></div><div class="hero-art desktop-art"><b>▣</b><small>ELECTRON • QT • FLUTTER • MAUI</small></div></article>
    <article class="hero-slide"><div class="hero-copy"><span class="eyebrow">• MOBILE + IA</span><h1>Mobile <span>& IA</span></h1><p>React Native, Visual Studio Code, Android Studio e ferramentas de Inteligência Artificial.</p><code>AI + MOBILE + PRODUCTIVITY</code></div><div class="hero-art ai-art"><b>AI</b><small>REACT NATIVE • ANDROID • IA</small></div></article>
  </div>
  <button class="hero-btn prev" aria-label="Banner anterior">‹</button><button class="hero-btn next" aria-label="Próximo banner">›</button>
  <div class="hero-dots"><button class="active" aria-label="Banner 1"></button><button aria-label="Banner 2"></button><button aria-label="Banner 3"></button><button aria-label="Banner 4"></button></div>
</section>

<section class="developers section" id="equipe">
  <div class="section-title"><span>NOSSO TIME</span><h2>Desenvolvedores</h2><p>Conheça os integrantes. Clique na foto ou no currículo para abrir o portfólio individual.</p></div>
  <div class="dev-grid" id="devGrid"></div>
</section>

<section class="section" id="projetos">
  <div class="section-title"><span>PORTFÓLIO</span><h2>Projetos</h2><p>Conheça alguns projetos descritos nos currículos da equipe, apresentados com capas visuais demonstrativas.</p></div>
  <div class="project-grid">
    <article class="project-card"><div class="project-image"><img src="assets/projetos/site-institucional.jpg" alt="Capa demonstrativa do Site Institucional Desenvolvedores Corumbá" loading="lazy"></div><span>01 • WEB</span><h3>Site Institucional — Desenvolvedores Corumbá</h3><p>Site institucional para apresentar projetos, tecnologias e profissionais da área de desenvolvimento de sistemas.</p><a href="portfolio.html?dev=8">Ver portfólio →</a></article>
    <article class="project-card"><div class="project-image"><img src="assets/projetos/controle-estoque.jpg" alt="Capa demonstrativa do Sistema de Controle de Estoque" loading="lazy"></div><span>02 • DESKTOP</span><h3>Sistema de Controle de Estoque</h3><p>Aplicação para controlar produtos, quantidades e movimentações de estoque.</p><a href="portfolio.html?dev=8">Ver portfólio →</a></article>
    <article class="project-card"><div class="project-image"><img src="assets/projetos/agendamento-salas.jpg" alt="Capa demonstrativa do Sistema de Agendamento de Salas" loading="lazy"></div><span>03 • WEB</span><h3>Sistema de Agendamento de Salas</h3><p>Gerenciamento de reservas de salas e horários para professores e coordenadores.</p><a href="portfolio.html?dev=8">Ver portfólio →</a></article>
    <article class="project-card"><div class="project-image"><img src="assets/projetos/pantanal-guardian.jpg" alt="Capa demonstrativa do Pantanal Guardian AI" loading="lazy"></div><span>04 • IA / DADOS</span><h3>Pantanal Guardian AI</h3><p>Sistema de Inteligência Artificial para análise de condições climáticas e identificação de riscos no Pantanal.</p><a href="portfolio.html?dev=3">Ver portfólio →</a></article>
    <article class="project-card"><div class="project-image"><img src="assets/projetos/escola-online.jpg" alt="Capa demonstrativa da Escola Online" loading="lazy"></div><span>05 • WEB</span><h3>Escola Online</h3><p>Plataforma web para facilitar a comunicação entre professores e alunos, com conteúdos e atividades.</p><a href="portfolio.html?dev=7">Ver portfólio →</a></article>
    <article class="project-card"><div class="project-image"><img src="assets/projetos/conecta-saude.jpg" alt="Capa demonstrativa do Conecta Saúde" loading="lazy"></div><span>06 • WEB / MOBILE</span><h3>Cidade Inteligente — Conecta Saúde</h3><p>Aplicativo para facilitar o acesso da população aos serviços de uma UBS e organizar solicitações.</p><a href="portfolio.html?dev=0">Ver portfólio →</a></article>
    <article class="project-card"><div class="project-image"><img src="assets/projetos/skillhub.jpg" alt="Capa demonstrativa do SkillHub — Academia do Vinicius" loading="lazy"></div><span>07 • WEB / REACT</span><h3>SkillHub — Academia do Vinicius</h3><p>Plataforma de estudos com trilhas de aprendizado, cronômetro, metas, estatísticas e IA.</p><a href="portfolio.html?dev=0">Ver portfólio →</a></article>
    <article class="project-card"><div class="project-image"><img src="assets/projetos/sistema-vendas.jpg" alt="Capa demonstrativa de um sistema de vendas web" loading="lazy"></div><span>08 • WEB</span><h3>Sistema de Vendas</h3><p>Interface demonstrativa de gestão de vendas, produtos, clientes e pedidos para composição visual do portfólio.</p><a href="#contato">Conhecer projeto →</a></article>
  </div>
</section>

<section class="section" id="galeria"><div class="section-title"><span>SHOWCASE</span><h2>Galeria</h2><p>Imagens demonstrativas para apresentar as áreas e projetos da equipe.</p></div><div class="gallery-grid">
<div class="gallery-item"><div class="gallery-art"><img src="assets/galeria/galeria-codigo.svg" alt="Código em editor"></div><h3>Ambiente de Desenvolvimento</h3></div>
<div class="gallery-item"><div class="gallery-art"><img src="assets/galeria/galeria-web.svg" alt="Interface web demonstrativa"></div><h3>Interfaces Web</h3></div>
<div class="gallery-item"><div class="gallery-art"><img src="assets/galeria/galeria-ia.svg" alt="Inteligência artificial demonstrativa"></div><h3>Inteligência Artificial</h3></div>
<div class="gallery-item"><div class="gallery-art"><img src="assets/galeria/galeria-dados.svg" alt="Banco de dados demonstrativo"></div><h3>Dados e Sistemas</h3></div>
<div class="gallery-item"><div class="gallery-art"><img src="assets/galeria/galeria-mobile.svg" alt="Aplicação mobile demonstrativa"></div><h3>Aplicações Mobile</h3></div>
<div class="gallery-item"><div class="gallery-art"><img src="assets/galeria/galeria-ux.svg" alt="Prototipação de interface"></div><h3>UI/UX e Prototipação</h3></div>
</div></section>

<section class="about" id="sobre"><div class="about-inner"><div><span class="eyebrow">SOBRE NÓS</span><h2>Ideias locais.<br><span>Tecnologia sem limites.</span></h2></div><div><p>Somos um grupo de desenvolvedores em formação, reunidos em Corumbá/MS, com foco em transformar conhecimento em projetos práticos.</p><p>Trabalhamos de forma colaborativa em desenvolvimento web, sistemas, aplicações desktop e mobile, bancos de dados, design de interfaces e Inteligência Artificial.</p><div class="stats"><div><b>12</b><small>Desenvolvedores</small></div><div><b>4+</b><small>Trilhas</small></div><div><b>∞</b><small>Ideias</small></div></div></div></div></section>

<section class="contact section" id="contato"><div class="contact-copy"><span class="eyebrow">FALE CONOSCO</span><h2>Vamos criar algo<br><span>juntos?</span></h2><p>Envie uma mensagem para nossa equipe. Sua mensagem será enviada com segurança para o nosso e-mail de atendimento.</p><div class="contact-line">✉ <span>Contato por e-mail</span></div><div class="contact-line">⌖ <span>Corumbá • Mato Grosso do Sul</span></div></div>
<?php if ($sucesso !== ''): ?>
  <div class="form-feedback success" role="status"><?= htmlspecialchars($sucesso, ENT_QUOTES, 'UTF-8') ?></div>
<?php endif; ?>
<?php if ($erro !== ''): ?>
  <div class="form-feedback error" role="alert"><?= htmlspecialchars($erro, ENT_QUOTES, 'UTF-8') ?></div>
<?php endif; ?>
<form id="contactForm" class="contact-form" action="index.php" method="POST"><div class="input-row"><input type="text" name="nome" placeholder="Seu nome" required><input type="email" name="email" placeholder="Seu e-mail" required></div><input type="text" name="assunto" placeholder="Assunto" required><textarea name="mensagem" rows="7" placeholder="Digite sua mensagem..." required></textarea><button type="submit">ENVIAR MENSAGEM <span>→</span></button><small>Sua mensagem será enviada por SMTP seguro.</small></form>
<div id="contactToast" class="contact-toast" role="status" aria-live="polite" aria-atomic="true"></div></section>
</main>
<footer><div class="footer-content"><div class="footer-logo">&lt;/&gt; <b>DESENVOLVEDORES<br>CORUMBÁ</b></div><p>Conectando pessoas, código e inovação.</p><div class="footer-social"><span>GH</span><span>in</span><span>◎</span></div></div><div class="copyright">@SENACALUNOSCBDESENVOLVEDORESDESISTEMAS</div></footer>
<script>
document.addEventListener('DOMContentLoaded', function () {
  function scrollToContact() {
    if (window.location.hash !== '#contato') {
      return;
    }

    setTimeout(function () {
      var contato = document.getElementById('contato');
      if (contato) {
        contato.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 250);
  }

  function showContactToast(message, type) {
    var toast = document.getElementById('contactToast');
    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.className = 'contact-toast ' + (type === 'success' ? 'success' : 'error') + ' show';

    clearTimeout(window.contactToastTimer);
    window.contactToastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 5000);
  }

  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      var button = form.querySelector('button[type="submit"]');
      var originalButtonText = button ? button.innerHTML : '';

      if (button) {
        button.disabled = true;
        button.innerHTML = 'ENVIANDO... <span>↗</span>';
      }

      try {
        var response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });

        var data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Não foi possível enviar a mensagem.');
        }

        form.reset();
        showContactToast(data.message, 'success');
      } catch (error) {
        showContactToast(error.message || 'Não foi possível enviar a mensagem agora.', 'error');
      } finally {
        if (button) {
          button.disabled = false;
          button.innerHTML = originalButtonText;
        }
      }
    });
  }

  scrollToContact();
});
</script>
<script src="script.js"></script>
</body></html>

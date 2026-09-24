<?php
/*
 * Configuração do formulário "Fale Conosco".
 * Edite os valores abaixo antes de publicar o site.
 */
return [
    // E-mail da Secretaria de Saúde que RECEBE as mensagens.
    // Mantenha igual à constante EMAIL_SAUDE do index.html (que é só a exibição).
    'email_destino' => 'sms.corumba@gmail.com',

    // Remetente técnico. Use um e-mail do MESMO domínio do site hospedado
    // (ex.: nao-responda@seudominio.com.br), senão o e-mail pode cair no spam.
    'email_remetente' => 'nao-responda@' . preg_replace('/^www\./', '', $_SERVER['SERVER_NAME'] ?? 'localhost'),
    'nome_remetente'  => 'Portal Conecta Saúde',

    // Prefixo do assunto do e-mail recebido.
    'prefixo_assunto' => '[Fale Conosco - Conecta Saúde]',

    // Intervalo mínimo (segundos) entre envios do mesmo visitante.
    'intervalo_minimo' => 30,

    // --- SMTP (opcional) ---
    // Se a hospedagem não permitir a função mail() do PHP, preencha e ative o SMTP.
    // Funciona com Gmail (senha de app), Hostinger, Locaweb, etc.
    'smtp' => [
        'ativo'    => false,
        'host'     => 'smtp.gmail.com',
        'porta'    => 587,          // 587 = STARTTLS, 465 = SSL
        'seguranca'=> 'tls',        // 'tls' ou 'ssl'
        'usuario'  => 'seu-email@gmail.com',
        'senha'    => 'sua-senha-de-app',
    ],
];

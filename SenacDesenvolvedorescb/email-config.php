<?php
/*
 * CONFIGURAÇÃO DO FORMULÁRIO DE CONTATO
 *
 * Conta SMTP Titan da HostGator.
 *
 * IMPORTANTE:
 * 1. SMTP_PASSWORD deve ser a senha da conta Titan contato@desenvolvedorcb.com.br.
 * 2. No painel da HostGator, ative o Titan para uso em aplicativos externos.
 * 3. Se a conta usar autenticação em dois fatores, utilize a senha de aplicativo
 *    quando o Titan solicitar esse tipo de credencial.
 * 4. Nunca publique ou compartilhe a senha deste arquivo.
 */

define('SMTP_HOST', 'smtp.titan.email');
define('SMTP_PORT', 465);
define('SMTP_USERNAME', 'contato@desenvolvedorcb.com.br');
define('SMTP_PASSWORD', 'DEV@2026');

define('CONTACT_RECIPIENT', 'mariahelenalbaneze@gmail.com');

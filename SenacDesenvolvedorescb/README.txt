DESENVOLVEDORES CORUMBÁ - FORMULÁRIO SMTP TITAN + NOTIFICAÇÃO FLUTUANTE

FORMULÁRIO DE CONTATO
---------------------
O formulário usa SMTP autenticado da conta Titan da HostGator.

Remetente SMTP:
contato@desenvolvedorcb.com.br

Destinatário:
mariahelenalbaneze@gmail.com

Servidor SMTP Titan:
smtp.titan.email

Porta:
465

Criptografia:
SSL/TLS

USO DA SENHA
------------
A senha solicitada em email-config.php é a senha da própria conta Titan:
contato@desenvolvedorcb.com.br

Não é a senha do painel da HostGator/cPanel.

CONFIGURAÇÃO OBRIGATÓRIA NO HOSTGATOR
-------------------------------------
No gerenciamento do e-mail Titan, ative a opção equivalente a:
"Ative o Titan em outros aplicativos" / uso em aplicativos externos.

Se a conta tiver autenticação de dois fatores, o Titan pode exigir uma senha
de aplicativo para conexões externas.

CONFIGURAR A SENHA
------------------
1. Abra o arquivo email-config.php.
2. Localize:
   COLOQUE_AQUI_A_SENHA_DO_CONTATO
3. Substitua pelo valor da senha da conta Titan contato@desenvolvedorcb.com.br.
4. Salve o arquivo.
5. Não compartilhe essa senha em chats, prints ou repositórios públicos.

MELHORIAS DESTA VERSÃO
-----------------------
- O formulário agora é enviado sem recarregar a página usando JavaScript/AJAX.
- O botão mostra "ENVIANDO..." durante o envio.
- O sucesso ou erro aparece como uma notificação flutuante (toast),
  sem ocupar espaço dentro do layout da página.
- O formulário é limpo automaticamente quando o envio é concluído com sucesso.
- O link "Entrar em contato" dos portfólios usa um caminho relativo
  (index.php#contato), evitando erro 404 quando o site está publicado no
  diretório raiz do domínio.
- A página index.php mantém a rolagem automática até a seção de contato.

PUBLICAÇÃO NA HOSTGATOR
-----------------------
1. Faça backup da versão atual do site.
2. Envie os arquivos do ZIP para a pasta pública do domínio (normalmente public_html).
3. Confirme que o arquivo principal é index.php.
4. Confirme que email-config.php está no mesmo diretório do index.php.
5. Acesse o site.
6. Teste o formulário de contato.
7. Verifique a caixa de entrada e o spam de mariahelenalbaneze@gmail.com.

LINK "ENTRAR EM CONTATO"
------------------------
Os botões de contato dos portfólios individuais usam index.php#contato
para voltar diretamente à seção do formulário. O caminho é relativo ao
próprio diretório do portfólio, evitando problemas com caminhos absolutos.

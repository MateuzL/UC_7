DESENVOLVEDORES CORUMBÁ - PROJETO COMPLETO

ESTRUTURA
index.html          Página principal
portfolio.html      Página individual/portfólio dos desenvolvedores
style.css            Estilos do site
script.js            Dados dos 12 desenvolvedores + interações
 enviar.php          Formulário de contato por PHP
assets/desenvolvedores/  Fotos dos desenvolvedores

COMO PERSONALIZAR OS DESENVOLVEDORES
1. Abra script.js.
2. No início do arquivo existe a lista "developers".
3. Para cada desenvolvedor, altere:
   - name: nome
   - role: função
   - stack: tecnologias
   - project: projeto principal
   - photo: nome do arquivo da foto
   - bio: resumo profissional
   - skills: habilidades
   - projects: projetos do portfólio
4. Coloque as fotos em assets/desenvolvedores/.
5. Os 11 arquivos enviados já estão incluídos. O dev12.svg é apenas um espaço reservado para o 12º integrante.

COMPORTAMENTO
- A página inicial mostra 12 desenvolvedores em grade: 3 por linha no computador, 2 no tablet e 1 no celular.
- Clicar na FOTO ou em "Currículo / Portfólio" abre portfolio.html?dev=N.
- O portfólio individual mostra foto, currículo/resumo, stack, habilidades e projetos.
- A mesma página portfolio.html é reutilizada para os 12 desenvolvedores. Os dados ficam no script.js.

FOTOS INCLUÍDAS
Vinicius.jpeg
Dayane.jpeg
Leleo.jpeg
Jullya.jpeg
Carlos.jpeg
Enrique.jpeg
Freddy.jpeg
Fabio.jpeg
Mateus.jpeg
Pedro.jpeg
Felipe.jpeg
dev12.svg (substitua pela foto do 12º desenvolvedor quando tiver)

FORMULÁRIO DE CONTATO
O formulário envia para enviar.php. Abra enviar.php e troque:
SEU_EMAIL_AQUI@exemplo.com
pelo e-mail que deve receber as mensagens.

IMPORTANTE: mail() depende da configuração de e-mail do servidor PHP. Em hospedagens sem mail() configurado, use PHPMailer/SMTP ou outro serviço de envio.

COMO TESTAR
- Para páginas HTML, abra index.html no navegador.
- Para testar o enviar.php, hospede o projeto em um servidor PHP (XAMPP, WAMP, Laragon ou hospedagem).

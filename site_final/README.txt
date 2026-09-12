DESENVOLVEDORES CORUMBÁ - PROJETO COMPLETO

ESTRUTURA
index.php          Página principal
portfolio.html      Página individual/portfólio dos desenvolvedores
style.css            Estilos do site
script.js            Dados dos 12 desenvolvedores + interações
 index.php          Formulário de contato por PHP
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
O formulário envia para index.php. Abra index.php e troque:
SEU_EMAIL_AQUI@exemplo.com
pelo e-mail que deve receber as mensagens.

IMPORTANTE: mail() depende da configuração de e-mail do servidor PHP. Em hospedagens sem mail() configurado, use PHPMailer/SMTP ou outro serviço de envio.

COMO TESTAR
- Para páginas HTML, abra index.php no navegador.
- Para testar o index.php, hospede o projeto em um servidor PHP (XAMPP, WAMP, Laragon ou hospedagem).

ORDEM ALEATÓRIA DOS DESENVOLVEDORES
-----------------------------------
A equipe da página inicial é embaralhada automaticamente sempre que a página é carregada.
O sistema mantém os índices originais dos portfólios, então clicar em uma pessoa continua abrindo o portfólio correto.
Também há uma pequena proteção para evitar que o mesmo desenvolvedor fique em primeiro lugar em carregamentos consecutivos da mesma sessão.

ATUALIZAÇÕES DESTA VERSÃO
- Fundo Matrix animado restaurado na página inicial e nos portfólios.
- Galeria agora usa imagens demonstrativas em assets/galeria/.
- Projetos agora usam imagens demonstrativas em assets/projetos/.
- Os 12 desenvolvedores possuem formação preenchida como "Técnico em Desenvolvimento de Sistemas — Concluído".
- Mateus também foi alterado para formação concluída.
- A numeração sobre as fotos dos desenvolvedores permanece removida.
- A ordem dos desenvolvedores continua sendo embaralhada a cada acesso.

Para substituir as imagens da galeria/projetos, troque os arquivos SVG mantendo os mesmos nomes, ou altere os caminhos no index.php.


FORMULÁRIO
O site agora usa index.php e o processamento do formulário está no próprio arquivo. O destinatário configurado é mariahelenalbaneze@gmail.com. O envio usa mail() e depende da configuração de e-mail do servidor/hosting.

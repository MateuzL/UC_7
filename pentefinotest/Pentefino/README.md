# Operação Pente Fino — versão FAICEPAN

Versão otimizada do site para demonstração em feira tecnológica.

## Principais melhorias

- links internos corrigidos para a Área da Criança;
- três jogos educativos mantidos e reforçados;
- novo **Caça ao Piolho** com cena de cabelo em três níveis progressivos;
- reações visuais dos personagens nos acertos e erros;
- painel de progresso com três missões e botão para reiniciar o progresso;
- personagens individuais em WebP com fundo transparente e carregamento otimizado;
- Área do Professor ampliada com roteiro, jogos, material imprimível e compartilhamento do link;
- Área da Família ampliada com navegação educativa e acolhedora;
- página Sobre com indicadores do projeto, percentuais por fase e demonstração de acessibilidade;
- melhorias de teclado, foco, contraste, ampliação de texto e redução de movimento;
- transcrição do áudio de apresentação;
- fonte do sistema para não depender do Google Fonts durante a feira;
- `manifest.json` e `sw.js` para cache offline quando o site for servido por HTTP/HTTPS.

## Como abrir

Para testes simples, abra `index.php`.

Para testar o modo offline/PWA, use um servidor local. Exemplos:

```bash
python -m http.server 8000
```

ou, com PHP:

```bash
php -S localhost:8000
```

Depois acesse `http://localhost:8000`.

## QR Code

A Área do Professor possui um botão que copia o endereço atual da Área da Criança. Depois que o site for publicado em um endereço definitivo, esse link pode ser usado para criar o QR Code do estande e dos materiais impressos.

## Observação

Os percentuais e indicadores exibidos na página Sobre refletem a versão atual do projeto e devem ser atualizados após novas oficinas, validações e testes.


## Atualização — Caça ao Piolho dinâmico

A Missão 02 foi renovada para a versão de feira:

- Nível 1: Piolhinho se movimenta entre os fios; 5 capturas, 10 pontos cada.
- Nível 2: 3 Lendinhas permanecem presas aos fios e precisam ser identificadas.
- Nível 3: escolha de atitude preventiva, valendo 20 pontos.
- Pontuação máxima: 100 pontos; erros retiram 2 pontos.
- Recorde salvo apenas no navegador (sem coleta de dados pessoais).
- Modo desafio com cronômetro opcional.
- Botão para pausar o movimento.
- Respeita `prefers-reduced-motion`: com redução de movimento ativa, o Piolhinho não se desloca automaticamente.
- Navegação por teclado preservada.


## Atualização do Piolhinho
- O jogo **Caça ao Piolho** usa agora a imagem individual oficial do Piolhinho enviada para o projeto.
- O personagem aparece como alvo móvel no Nível 1, no painel da missão e na tela de conclusão.
- O arquivo original foi preservado em `assets/personagens/piolhinho-jogo.png`.

## Atualização — Caça ao Piolhinho profissional

A Missão 02 foi reconstruída em `caca.js` + `caca.css`, mantendo o restante do site.
A nova versão inclui arena responsiva, alvos em movimento, 3 fases de dificuldade,
alvo dourado, sequência de acertos, cronômetro de 40 segundos, recorde local,
pausa, reinício, resultado final, acessibilidade por teclado e integração com o
distintivo "Detetive da Higiene".

Importante: `crianca.html` carrega `caca.js` antes de `script.js` para que apenas a
Missão 02 seja substituída pela versão nova. O `sw.js` também foi atualizado para
a versão de cache `opf-faicepan-v4-caca-profissional`.


## Formulário de contato
A página inicial agora usa `index.php`. O formulário envia as mensagens diretamente para `contato@desenvolvedorcb.com.br` usando a função `mail()` do PHP da hospedagem. A hospedagem precisa oferecer suporte a PHP e permitir envio de e-mails.

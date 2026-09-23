"use strict";

const CACHE_NAME = 'opf-faicepan-v6-jogo-familia-marinheiro';
const CORE = [
  "./",
  "./index.html",
  "./crianca.html",
  "./professor.html",
  "./contato.php",
  "./familia.html",
  "./familia_sem_piolho.html",
  "./sobre.html",
  "./style.css",
  "./caca.css",
  "./script.js",
  "./caca.js",
  "./manifest.json",
    "./assets/personagens/marinheiro.webp",
  "./assets/personagens/babi.webp",
  "./assets/personagens/biel.webp",
  "./assets/personagens/joao.webp",
  "./assets/personagens/jose.webp",
  "./assets/personagens/lendinha.webp",
  "./assets/personagens/lili.webp",
  "./assets/personagens/mary.webp",
  "./assets/personagens/morango.webp",
  "./assets/personagens/pimenta.webp",
  "./assets/personagens/piolhinho.webp",
  "./assets/personagens/piolhinho-jogo.png",
  "./assets/personagens/sol.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});

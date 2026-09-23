/* =========================================================
   OPERAÇÃO PENTE FINO — MISSÃO 02 / CAÇA AO PIOLHINHO
   Jogo isolado. Carregue este arquivo ANTES de script.js.
   ========================================================= */

(function () {
  "use strict";

  const section = document.getElementById("caca-piolho");
  if (!section || section.dataset.opfGameReady === "true") return;
  section.dataset.opfGameReady = "true";

  const missionCardText = document.querySelector(".mission-two p");
  if (missionCardText) {
    missionCardText.textContent = "Capture os Piolhinhos em uma missão de 40 segundos com fases, sequência e recorde.";
  }
  const detectiveBadgeText = document.querySelector('[data-badge="detective"] p');
  if (detectiveBadgeText) {
    detectiveBadgeText.textContent = "Conclua uma partida do Caça ao Piolhinho para liberar.";
  }

  const TARGET_IMAGE = "assets/personagens/piolhinho-jogo.png";
  const GUIDE_IMAGE = "assets/personagens/marinheiro.webp";
  const GAME_SECONDS = 40;
  const BEST_KEY = "opfCacaPiolhoRecordeV2";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  section.innerHTML = `
    <div class="shell opf-game-shell">
      <div class="opf-game-card reveal">
        <div class="opf-game-topbar">
          <div class="opf-game-brand">
            <span class="anchor" aria-hidden="true">⚓</span>
            <span>
              <small>OPERAÇÃO PENTE FINO</small>
              <strong>Missão 02 · Caça ao Piolhinho</strong>
            </span>
          </div>
          <span class="opf-game-status"><i></i> SISTEMA DE MISSÃO ATIVO</span>
        </div>

        <div class="opf-game-main">
          <div class="opf-game-intro">
            <div>
              <p class="kicker">🎮 JOGO EDUCATIVO</p>
              <h2>Olhos de detetive!</h2>
            </div>
            <p>Capture os Piolhinhos que se movimentam entre os fios. Cada captura vale <strong>+10 pontos</strong>; o alvo dourado vale <strong>+20</strong>.</p>
          </div>

          <div class="opf-hud" aria-label="Placar do jogo">
            <div class="opf-hud-item"><span>PONTOS</span><strong id="opfScore">0</strong></div>
            <div class="opf-hud-item"><span>TEMPO</span><strong id="opfTime">40s</strong></div>
            <div class="opf-hud-item combo"><span>SEQUÊNCIA</span><strong id="opfCombo">0</strong></div>
            <div class="opf-hud-item"><span>RECORDE</span><strong id="opfBest">0</strong></div>
          </div>

          <div class="opf-timeline" aria-hidden="true"><span id="opfTimeline"></span></div>

          <div class="opf-phase-row" aria-label="Fases da missão">
            <div class="opf-phase-pill active" data-phase="1"><b>1</b><span>RASTREAMENTO</span></div>
            <div class="opf-phase-pill" data-phase="2"><b>2</b><span>ALERTA</span></div>
            <div class="opf-phase-pill" data-phase="3"><b>3</b><span>DESAFIO FINAL</span></div>
          </div>

          <div class="opf-arena-wrap">
            <div class="opf-arena" id="opfArena" tabindex="-1" aria-label="Área do jogo. Capture os Piolhinhos.">
              <div class="opf-arena-grid" aria-hidden="true"></div>
              <div class="opf-stage-message" id="opfStageMessage" role="status"></div>

              <div class="opf-overlay" id="opfOverlay">
                <div class="opf-overlay-card">
                  <span class="opf-overlay-badge" aria-hidden="true">🔎</span>
                  <small>MISSÃO 02</small>
                  <h3 id="opfOverlayTitle">Pronto para caçar?</h3>
                  <p id="opfOverlayText">Você terá 40 segundos. Clique ou toque nos Piolhinhos em movimento e tente superar seu recorde.</p>
                  <button class="opf-start-btn" id="opfStart" type="button">⚓ Iniciar missão</button>
                </div>
              </div>
            </div>
          </div>

          <div class="opf-bottom-row">
            <p class="opf-feedback" id="opfFeedback" aria-live="polite">Dica: quanto mais rápido você captura, maior fica sua sequência.</p>
            <div class="opf-controls">
              <button class="opf-control-btn" id="opfPause" type="button" aria-pressed="false" disabled>⏸ Pausar</button>
              <button class="opf-control-btn" id="opfRestart" type="button">↻ Reiniciar</button>
            </div>
          </div>
        </div>
      </div>

      <aside class="opf-mission-guide reveal" aria-label="Guia da missão">
        <span class="opf-guide-tag">⚓ MARINHEIRO PENTE FINO · GUIA</span>
        <img class="opf-guide-character" src="${GUIDE_IMAGE}" alt="Marinheiro Pente Fino segurando um pente">
        <h3>Missão Pente Fino</h3>
        <p>Mostre sua atenção, seus reflexos e o que aprendeu sobre cuidado e respeito.</p>
        <ul class="opf-guide-rules">
          <li><b>+10</b><span>Piolhinho comum: dez pontos.</span></li>
          <li><b>★</b><span>Piolhinho dourado: vinte pontos.</span></li>
          <li><b>3×</b><span>Três acertos rápidos formam uma sequência.</span></li>
          <li><b>40s</b><span>O desafio termina quando o tempo acaba.</span></li>
        </ul>
        <p class="opf-guide-tip"><strong>Mensagem da tripulação:</strong> ter piolho não é motivo para vergonha. Informação, cuidado e respeito fazem parte da missão.</p>
      </aside>
    </div>
  `;

  const $ = (selector) => section.querySelector(selector);
  const arena = $("#opfArena");
  const scoreEl = $("#opfScore");
  const timeEl = $("#opfTime");
  const comboEl = $("#opfCombo");
  const bestEl = $("#opfBest");
  const timeline = $("#opfTimeline");
  const overlay = $("#opfOverlay");
  const overlayTitle = $("#opfOverlayTitle");
  const overlayText = $("#opfOverlayText");
  const startBtn = $("#opfStart");
  const pauseBtn = $("#opfPause");
  const restartBtn = $("#opfRestart");
  const feedback = $("#opfFeedback");
  const stageMessage = $("#opfStageMessage");
  const phasePills = [...section.querySelectorAll(".opf-phase-pill")];

  let running = false;
  let paused = false;
  let countdownRunning = false;
  let score = 0;
  let combo = 0;
  let best = 0;
  let phase = 1;
  let gameStart = 0;
  let pauseStarted = 0;
  let pausedTotal = 0;
  let previousFrame = 0;
  let animationId = 0;
  let lastHitAt = 0;
  let targetSerial = 0;
  let phaseNoticeTimer = 0;
  const targets = new Set();

  try {
    const saved = Number(localStorage.getItem(BEST_KEY));
    if (Number.isFinite(saved) && saved > 0) best = saved;
  } catch (_) {}
  bestEl.textContent = String(best);

  const phaseConfig = {
    1: { maxTargets: 3, speedMin: 38, speedMax: 56, specialChance: 0.00, message: "FASE 1 · RASTREAMENTO — observe os fios e capture os alvos!" },
    2: { maxTargets: 4, speedMin: 52, speedMax: 72, specialChance: 0.13, message: "FASE 2 · ALERTA — agora eles estão mais rápidos!" },
    3: { maxTargets: 5, speedMin: 68, speedMax: 96, specialChance: 0.22, message: "FASE 3 · DESAFIO FINAL — procure também o alvo dourado!" }
  };

  function safeLocalBest(value) {
    try { localStorage.setItem(BEST_KEY, String(value)); } catch (_) {}
  }

  function updateHud(timeLeft = GAME_SECONDS) {
    scoreEl.textContent = String(score);
    comboEl.textContent = combo > 1 ? `${combo}×` : String(combo);
    bestEl.textContent = String(Math.max(best, score));
    timeEl.textContent = `${Math.max(0, Math.ceil(timeLeft))}s`;
    timeline.style.transform = `scaleX(${Math.max(0, Math.min(1, timeLeft / GAME_SECONDS))})`;
  }

  function setPhase(nextPhase, announce = true) {
    if (phase === nextPhase && !announce) return;
    phase = nextPhase;
    phasePills.forEach((pill, index) => {
      const number = index + 1;
      pill.classList.toggle("active", number === phase);
      pill.classList.toggle("done", number < phase);
    });
    if (announce) showStageMessage(phaseConfig[phase].message);
    syncTargetCount();
  }

  function showStageMessage(message) {
    clearTimeout(phaseNoticeTimer);
    stageMessage.textContent = message;
    stageMessage.classList.add("show");
    phaseNoticeTimer = window.setTimeout(() => stageMessage.classList.remove("show"), 2400);
  }

  function clearTargets() {
    targets.forEach((target) => target.button.remove());
    targets.clear();
    arena.querySelectorAll(".opf-score-pop").forEach((el) => el.remove());
  }

  function arenaBounds(button) {
    return {
      maxX: Math.max(8, arena.clientWidth - button.offsetWidth - 8),
      maxY: Math.max(8, arena.clientHeight - button.offsetHeight - 8)
    };
  }

  function paintTarget(target) {
    target.button.style.transform = `translate3d(${target.x}px,${target.y}px,0)`;
    target.button.style.setProperty("--tx", `${target.x}px`);
    target.button.style.setProperty("--ty", `${target.y}px`);
  }

  function randomPosition(button) {
    const bounds = arenaBounds(button);
    let x = 8 + Math.random() * Math.max(1, bounds.maxX - 8);
    let y = 56 + Math.random() * Math.max(1, bounds.maxY - 64);

    for (let attempt = 0; attempt < 25; attempt++) {
      const overlaps = [...targets].some((other) => Math.hypot(other.x - x, other.y - y) < 86);
      if (!overlaps) break;
      x = 8 + Math.random() * Math.max(1, bounds.maxX - 8);
      y = 56 + Math.random() * Math.max(1, bounds.maxY - 64);
    }
    return { x, y };
  }

  function makeTarget() {
    if (!running || paused || targets.size >= phaseConfig[phase].maxTargets) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "opf-target";
    button.dataset.targetId = String(++targetSerial);

    const special = phase > 1 && Math.random() < phaseConfig[phase].specialChance;
    if (special) button.classList.add("special");
    button.setAttribute("aria-label", special ? "Capturar Piolhinho dourado, vale vinte pontos" : "Capturar Piolhinho, vale dez pontos");

    const image = document.createElement("img");
    image.src = TARGET_IMAGE;
    image.alt = "";
    image.draggable = false;
    button.appendChild(image);
    arena.appendChild(button);

    const position = randomPosition(button);
    const angle = Math.random() * Math.PI * 2;
    const config = phaseConfig[phase];
    const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);

    const target = {
      button,
      special,
      x: position.x,
      y: position.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    };

    targets.add(target);
    paintTarget(target);

    button.addEventListener("click", (event) => captureTarget(target, event));
    button.addEventListener("focus", () => { target.keyboardFocus = true; });
    button.addEventListener("blur", () => { target.keyboardFocus = false; });
  }

  function captureTarget(target, event) {
    if (!running || paused || !targets.has(target)) return;
    event.stopPropagation();

    const now = performance.now();
    combo = now - lastHitAt <= 1450 ? combo + 1 : 1;
    lastHitAt = now;

    const value = target.special ? 20 : 10;
    score += value;
    updateHud(currentTimeLeft(now));

    const pop = document.createElement("span");
    pop.className = "opf-score-pop";
    pop.textContent = target.special ? "+20 ★" : "+10";
    pop.style.left = `${Math.min(arena.clientWidth - 74, Math.max(8, target.x + 8))}px`;
    pop.style.top = `${Math.max(48, target.y)}px`;
    arena.appendChild(pop);
    window.setTimeout(() => pop.remove(), 760);

    target.button.classList.add("caught");
    targets.delete(target);
    window.setTimeout(() => target.button.remove(), 260);

    feedback.textContent = combo >= 3
      ? `🔥 Sequência ${combo}×! Continue assim. +${value} pontos.`
      : `Boa captura! +${value} pontos.`;

    window.setTimeout(() => {
      if (running && !paused) {
        makeTarget();
        if (event.detail === 0) [...targets][0]?.button.focus({ preventScroll: true });
      }
    }, 180);
  }

  arena.addEventListener("click", (event) => {
    if (!running || paused) return;
    if (event.target === arena || event.target.classList.contains("opf-arena-grid")) {
      combo = 0;
      comboEl.textContent = "0";
      feedback.textContent = "Quase! Mire diretamente no Piolhinho. A sequência foi zerada.";
    }
  });

  function syncTargetCount() {
    if (!running || paused) return;
    const wanted = phaseConfig[phase].maxTargets;
    while (targets.size < wanted) makeTarget();
    while (targets.size > wanted) {
      const extra = [...targets].pop();
      targets.delete(extra);
      extra.button.remove();
    }
  }

  function currentTimeLeft(now = performance.now()) {
    if (!running && !countdownRunning) return GAME_SECONDS;
    const effectiveNow = paused ? pauseStarted : now;
    return GAME_SECONDS - (effectiveNow - gameStart - pausedTotal) / 1000;
  }

  function moveTargets(delta) {
    if (reduceMotion.matches) return;

    targets.forEach((target) => {
      if (target.keyboardFocus) return;
      const bounds = arenaBounds(target.button);
      target.x += target.vx * delta;
      target.y += target.vy * delta;

      if (target.x <= 8 || target.x >= bounds.maxX) target.vx *= -1;
      if (target.y <= 44 || target.y >= bounds.maxY) target.vy *= -1;

      target.x = Math.max(8, Math.min(bounds.maxX, target.x));
      target.y = Math.max(44, Math.min(bounds.maxY, target.y));
      paintTarget(target);
    });
  }

  function gameLoop(now) {
    if (!running) return;
    if (paused) {
      animationId = requestAnimationFrame(gameLoop);
      return;
    }

    const timeLeft = currentTimeLeft(now);
    if (timeLeft <= 0) {
      finishGame();
      return;
    }

    const elapsed = GAME_SECONDS - timeLeft;
    const nextPhase = elapsed < 14 ? 1 : elapsed < 27 ? 2 : 3;
    if (nextPhase !== phase) setPhase(nextPhase, true);

    if (combo > 0 && now - lastHitAt > 1650) {
      combo = 0;
      comboEl.textContent = "0";
    }

    updateHud(timeLeft);
    syncTargetCount();

    const delta = previousFrame ? Math.min((now - previousFrame) / 1000, .05) : 0;
    previousFrame = now;
    moveTargets(delta);
    animationId = requestAnimationFrame(gameLoop);
  }

  // As referências acima precisam permanecer constantes. Para o countdown,
  // trocamos somente o conteúdo visual de forma segura, sem usá-las durante o jogo.
  async function countdownOnly() {
    countdownRunning = true;
    overlay.hidden = false;
    const card = overlay.querySelector(".opf-overlay-card");
    card.dataset.savedHtml = card.innerHTML;
    for (const value of ["3", "2", "1", "VAI!"]) {
      card.innerHTML = `<div class="opf-countdown" aria-live="assertive">${value}</div>`;
      await new Promise((resolve) => window.setTimeout(resolve, value === "VAI!" ? 440 : 610));
    }
    card.innerHTML = card.dataset.savedHtml;
    card.removeAttribute("data-saved-html");
    overlay.hidden = true;
    countdownRunning = false;
  }

  async function startGame() {
    if (running || countdownRunning) return;

    cancelAnimationFrame(animationId);
    clearTargets();
    score = 0;
    combo = 0;
    phase = 1;
    paused = false;
    pausedTotal = 0;
    pauseStarted = 0;
    previousFrame = 0;
    lastHitAt = 0;
    updateHud(GAME_SECONDS);
    setPhase(1, false);
    feedback.textContent = "Prepare-se: a missão vai começar!";
    pauseBtn.disabled = true;
    pauseBtn.setAttribute("aria-pressed", "false");
    pauseBtn.textContent = "⏸ Pausar";

    await countdownOnly();

    // Como o conteúdo interno do overlay foi restaurado, reconectamos o botão.
    section.querySelector("#opfStart")?.addEventListener("click", startGame);

    running = true;
    gameStart = performance.now();
    previousFrame = gameStart;
    pauseBtn.disabled = false;
    feedback.textContent = "Missão iniciada! Capture os Piolhinhos.";
    syncTargetCount();
    showStageMessage(phaseConfig[1].message);
    animationId = requestAnimationFrame(gameLoop);
  }

  function medalFor(points) {
    if (points >= 260) return { icon: "🏆", title: "Comandante da Missão" };
    if (points >= 180) return { icon: "🥇", title: "Detetive de Ouro" };
    if (points >= 110) return { icon: "🥈", title: "Detetive de Prata" };
    return { icon: "⭐", title: "Cadete Detetive" };
  }

  function finishGame() {
    if (!running) return;
    running = false;
    paused = false;
    cancelAnimationFrame(animationId);
    clearTargets();
    updateHud(0);
    pauseBtn.disabled = true;

    const previousBest = best;
    if (score > best) {
      best = score;
      safeLocalBest(best);
      bestEl.textContent = String(best);
    }

    if (score > 0 && typeof window.awardBadge === "function") {
      window.awardBadge("detective");
    } else if (score > 0 && typeof awardBadge === "function") {
      awardBadge("detective");
    }

    const medal = medalFor(score);
    const newRecord = score > previousBest;
    const card = overlay.querySelector(".opf-overlay-card");
    card.innerHTML = `
      <span class="opf-overlay-badge" aria-hidden="true">${medal.icon}</span>
      <small>MISSÃO FINALIZADA</small>
      <h3>${medal.title}</h3>
      <div class="opf-result-score">${score} <small>pontos</small></div>
      <p>${newRecord ? "Novo recorde! " : ""}Você treinou atenção e reflexo. O recorde deste navegador é <strong>${best}</strong> pontos.</p>
      <button class="opf-start-btn" id="opfStartResult" type="button">↻ Jogar novamente</button>
    `;
    overlay.hidden = false;
    card.querySelector("#opfStartResult")?.addEventListener("click", startGame);
    feedback.textContent = `Missão concluída com ${score} pontos. Tente superar seu recorde!`;
  }

  function restartGame() {
    cancelAnimationFrame(animationId);
    running = false;
    paused = false;
    countdownRunning = false;
    clearTargets();
    score = 0;
    combo = 0;
    phase = 1;
    pausedTotal = 0;
    previousFrame = 0;
    updateHud(GAME_SECONDS);
    setPhase(1, false);
    pauseBtn.disabled = true;
    pauseBtn.textContent = "⏸ Pausar";
    pauseBtn.setAttribute("aria-pressed", "false");
    feedback.textContent = "Jogo reiniciado. Clique em “Iniciar missão” quando estiver pronto.";

    const card = overlay.querySelector(".opf-overlay-card");
    card.innerHTML = `
      <span class="opf-overlay-badge" aria-hidden="true">🔎</span>
      <small>MISSÃO 02</small>
      <h3>Pronto para caçar?</h3>
      <p>Você terá 40 segundos. Clique ou toque nos Piolhinhos em movimento e tente superar seu recorde.</p>
      <button class="opf-start-btn" id="opfStartReset" type="button">⚓ Iniciar missão</button>
    `;
    overlay.hidden = false;
    card.querySelector("#opfStartReset")?.addEventListener("click", startGame);
  }

  pauseBtn.addEventListener("click", () => {
    if (!running) return;
    paused = !paused;
    pauseBtn.setAttribute("aria-pressed", String(paused));
    pauseBtn.textContent = paused ? "▶ Continuar" : "⏸ Pausar";

    if (paused) {
      pauseStarted = performance.now();
      feedback.textContent = "Missão pausada. Clique em Continuar para retomar.";
      targets.forEach((target) => { target.button.disabled = true; });
    } else {
      pausedTotal += performance.now() - pauseStarted;
      previousFrame = performance.now();
      targets.forEach((target) => { target.button.disabled = false; });
      feedback.textContent = "Missão retomada!";
    }
  });

  restartBtn.addEventListener("click", restartGame);
  startBtn.addEventListener("click", startGame);

  window.addEventListener("resize", () => {
    targets.forEach((target) => {
      const bounds = arenaBounds(target.button);
      target.x = Math.max(8, Math.min(bounds.maxX, target.x));
      target.y = Math.max(44, Math.min(bounds.maxY, target.y));
      paintTarget(target);
    });
  });

  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(animationId);
    running = false;
  });

  // Pré-carrega as imagens para a primeira partida abrir sem "piscar".
  [TARGET_IMAGE, GUIDE_IMAGE].forEach((src) => {
    const img = new Image();
    img.src = src;
  });
})();

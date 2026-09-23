"use strict";

// =====================================================
// NAVEGAÇÃO E EFEITOS GERAIS
// =====================================================
const menuToggle = document.querySelector("#menuToggle");
const mainMenu = document.querySelector("#mainMenu");

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.classList.toggle("open");
  mainMenu?.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});

mainMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle?.classList.remove("open");
    mainMenu.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.13 });
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));
}

const scrollProgress = document.querySelector("#scrollProgress");
window.addEventListener("scroll", () => {
  if (!scrollProgress) return;
  const maximum = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = maximum > 0 ? (window.scrollY / maximum) * 100 : 0;
  scrollProgress.style.width = `${percentage}%`;
}, { passive: true });

// =====================================================
// ARMAZENAMENTO SEGURO
// =====================================================
function storageGet(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function storageSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* modo privado / arquivo local */ }
}

// =====================================================
// DISTINTIVOS
// =====================================================
const badgeNames = {
  apprentice: "Aprendiz da Prevenção",
  detective: "Detetive da Higiene",
  guardian: "Guardião do Pente Fino"
};

function getUnlockedBadges() {
  try {
    return JSON.parse(storageGet("opfBadges", "[]")) || [];
  } catch {
    return [];
  }
}

function awardBadge(id) {
  if (!badgeNames[id]) return false;
  const unlocked = getUnlockedBadges();
  if (unlocked.includes(id)) return false;
  unlocked.push(id);
  storageSet("opfBadges", JSON.stringify(unlocked));
  updateBadgeCollection();

  const message = document.querySelector("#collectionMessage");
  if (message) {
    message.textContent = `🏆 Novo distintivo desbloqueado: ${badgeNames[id]}!`;
    message.classList.add("show");
  }
  return true;
}

function updateBadgeCollection() {
  const unlocked = getUnlockedBadges();
  document.querySelectorAll("[data-badge]").forEach((card) => {
    const id = card.dataset.badge;
    const isUnlocked = unlocked.includes(id);
    card.classList.toggle("locked", !isUnlocked);
    card.classList.toggle("unlocked", isUnlocked);
    const status = card.querySelector(".badge-status");
    if (status) status.textContent = isUnlocked ? "✓ Desbloqueado" : "🔒 Bloqueado";
  });

  document.querySelectorAll("[data-mission-status]").forEach((item) => {
    const completed = unlocked.includes(item.dataset.missionStatus);
    item.classList.toggle("completed", completed);
    item.setAttribute("aria-label", `${item.textContent.trim()} — ${completed ? "concluída" : "não concluída"}`);
  });

  const progressText = document.querySelector("#missionProgressText");
  if (progressText) progressText.textContent = `${unlocked.length} de 3 missões concluídas`;
}
updateBadgeCollection();

document.querySelector("#resetProgress")?.addEventListener("click", () => {
  const confirmed = window.confirm("Reiniciar os distintivos e o progresso salvo neste navegador?");
  if (!confirmed) return;
  try { localStorage.removeItem("opfBadges"); } catch { /* sem armazenamento */ }
  updateBadgeCollection();
  const message = document.querySelector("#collectionMessage");
  if (message) {
    message.textContent = "Progresso reiniciado. As missões podem ser feitas novamente.";
    message.classList.add("show");
  }
});


// =====================================================
// REAÇÕES VISUAIS DOS PERSONAGENS
// =====================================================
function setReaction(prefix, state, message, imageSrc, imageAlt) {
  const box = document.querySelector(`#${prefix}Reaction`);
  const image = document.querySelector(`#${prefix}ReactionImg`);
  const text = document.querySelector(`#${prefix}ReactionText`);
  if (!box) return;
  box.classList.remove("reaction-good", "reaction-bad", "reaction-neutral");
  box.classList.add(state === "good" ? "reaction-good" : state === "bad" ? "reaction-bad" : "reaction-neutral");
  if (image && imageSrc) {
    image.src = imageSrc;
    image.alt = imageAlt || "";
  }
  if (text) text.textContent = message;
}

// =====================================================
// JOGO 1 — PODE OU NÃO PODE?
// =====================================================
const quiz = [
  {
    question: "Compartilhar pentes e bonés com os colegas?",
    correct: "no",
    success: "Isso! Objetos pessoais devem ser de uso individual.",
    error: "Quase! Pentes, bonés e acessórios devem ser de uso individual."
  },
  {
    question: "Avisar um adulto ao perceber muita coceira?",
    correct: "yes",
    success: "Muito bem! Pedir ajuda é uma atitude de cuidado.",
    error: "O melhor é avisar um adulto responsável para receber orientação adequada."
  },
  {
    question: "Zombar de um colega que está com piolho?",
    correct: "no",
    success: "Perfeito! Informação e respeito ajudam a combater o preconceito.",
    error: "Não pode. Pediculose não é motivo para vergonha ou brincadeira."
  },
  {
    question: "Usar o próprio pente e cuidar dos objetos pessoais?",
    correct: "yes",
    success: "Muito bem! Cuidar dos próprios objetos faz parte da prevenção.",
    error: "Pode sim. Usar os próprios objetos é uma atitude de cuidado."
  },
  {
    question: "Esconder dos responsáveis quando perceber sinais no couro cabeludo?",
    correct: "no",
    success: "Certo! Conversar com um adulto ajuda a receber orientação sem vergonha.",
    error: "Não é preciso esconder. O melhor é conversar com um adulto responsável."
  }
];

let quizIndex = 0;
let quizScore = 0;
let quizLocked = false;
const quizQuestion = document.querySelector("#quizQuestion");
const quizFeedback = document.querySelector("#quizFeedback");
const scoreText = document.querySelector("#scoreText");
const progressBar = document.querySelector("#progressBar");
const quizMissionNumber = document.querySelector("#quizMissionNumber");
const quizAnswers = [...document.querySelectorAll("[data-answer]")];
const quizNext = document.querySelector("#quizNext");

function resetQuizQuestion() {
  if (!quizQuestion) return;
  quizLocked = false;
  quizQuestion.textContent = quiz[quizIndex].question;
  if (quizMissionNumber) quizMissionNumber.textContent = `PERGUNTA ${String(quizIndex + 1).padStart(2, "0")}`;
  if (quizFeedback) {
    quizFeedback.textContent = "Escolha uma resposta para avançar.";
    quizFeedback.className = "feedback";
  }
  if (quizNext) quizNext.hidden = true;
  quizAnswers.forEach((button) => { button.disabled = false; });
  setReaction("quiz", "neutral", "O Oficial Morango está pronto para comemorar seus acertos!", "assets/personagens/morango.webp", "Oficial Morango");
}

quizAnswers.forEach((button) => button.addEventListener("click", () => {
  if (quizLocked || !quizQuestion) return;
  quizLocked = true;
  const current = quiz[quizIndex];
  const isCorrect = button.dataset.answer === current.correct;
  if (isCorrect) quizScore++;

  if (quizFeedback) {
    quizFeedback.textContent = isCorrect ? current.success : current.error;
    quizFeedback.className = `feedback ${isCorrect ? "good" : "bad"}`;
  }
  setReaction(
    "quiz",
    isCorrect ? "good" : "bad",
    isCorrect ? "Mandou bem! O Oficial Morango aprovou essa escolha." : "Quase! O Marinheiro Abacate mostra a orientação correta.",
    isCorrect ? "assets/personagens/morango.webp" : "assets/personagens/abacate.webp",
    isCorrect ? "Oficial Morango comemorando" : "Marinheiro Abacate orientando"
  );
  if (scoreText) scoreText.textContent = `${quizScore} / ${quiz.length}`;
  if (progressBar) progressBar.style.width = `${((quizIndex + 1) / quiz.length) * 100}%`;
  quizAnswers.forEach((answer) => { answer.disabled = true; });
  if (quizNext) {
    quizNext.hidden = false;
    quizNext.textContent = quizIndex === quiz.length - 1 ? "Ver resultado" : "Próxima pergunta";
  }
}));

quizNext?.addEventListener("click", () => {
  if (quizIndex < quiz.length - 1) {
    quizIndex++;
    resetQuizQuestion();
    quizAnswers[0]?.focus();
    return;
  }

  if (quizQuestion?.dataset.finished === "true") {
    quizIndex = 0;
    quizScore = 0;
    quizQuestion.dataset.finished = "false";
    if (scoreText) scoreText.textContent = `0 / ${quiz.length}`;
    if (progressBar) progressBar.style.width = "0%";
    resetQuizQuestion();
    quizAnswers[0]?.focus();
    return;
  }

  awardBadge("apprentice");
  quizQuestion.dataset.finished = "true";
  quizQuestion.textContent = "Missão concluída!";
  if (quizFeedback) {
    quizFeedback.textContent = `Você acertou ${quizScore} de ${quiz.length}. O mais importante é aprender, cuidar e respeitar.`;
    quizFeedback.className = "feedback good";
  }
  if (quizMissionNumber) quizMissionNumber.textContent = "RESULTADO";
  quizNext.textContent = "Jogar novamente";
  quizNext.hidden = false;
});

// =====================================================
// JOGO 2 — CAÇA AO PIOLHO — VERSÃO DINÂMICA
// =====================================================
const huntLevels = [
  {
    type: "moving-hunt",
    title: "Capture o Piolhinho",
    hint: "O Piolhinho se movimenta entre os fios. Clique nele 5 vezes para completar o nível.",
    success: "Boa! Você capturou o Piolhinho 5 vezes.",
    goal: 5,
    points: 10,
    time: 30,
    decoys: [
      { label: "Partícula clara", kind: "flake", x: 20, y: 28 },
      { label: "Partícula clara", kind: "flake", x: 42, y: 73 },
      { label: "Partícula clara", kind: "flake", x: 78, y: 33 },
      { label: "Partícula clara", kind: "flake", x: 84, y: 72 }
    ]
  },
  {
    type: "nit-search",
    title: "Encontre as Lendinhas",
    hint: "A lêndea fica presa ao fio de cabelo. Encontre as 3 Lendinhas sem confundir com as partículas claras.",
    success: "Muito bem! Você encontrou as 3 Lendinhas presas aos fios.",
    goal: 3,
    points: 10,
    time: 40,
    targets: [
      { label: "Lendinha", image: "assets/personagens/lendinha.webp", correct: true, x: 25, y: 44, size: "small" },
      { label: "Partícula clara", kind: "flake", x: 39, y: 70 },
      { label: "Lendinha", image: "assets/personagens/lendinha.webp", correct: true, x: 56, y: 28, size: "small" },
      { label: "Partícula clara", kind: "flake", x: 66, y: 64 },
      { label: "Partícula clara", kind: "flake", x: 82, y: 24 },
      { label: "Lendinha", image: "assets/personagens/lendinha.webp", correct: true, x: 78, y: 76, size: "small" },
      { label: "Partícula clara", kind: "flake", x: 18, y: 78 }
    ]
  },
  {
    type: "choices",
    title: "Qual atitude ajuda na prevenção?",
    hint: "Escolha uma atitude de cuidado com os objetos pessoais.",
    success: "Missão cumprida! Usar o próprio pente é uma atitude de cuidado.",
    goal: 1,
    points: 20,
    time: 30,
    items: [
      { label: "Usar meu próprio pente", icon: "🪮", correct: true },
      { label: "Compartilhar boné", icon: "🧢" },
      { label: "Usar o pente de outra pessoa", icon: "↔️" },
      { label: "Esconder que estou com coceira", icon: "🙈" }
    ]
  }
];

let huntLevel = 0;
let huntLocked = false;
let huntFinished = false;
let huntScoreValue = 0;
let huntLevelHits = 0;
let huntChallengeMode = false;
let huntPaused = false;
let huntMoveInterval = null;
let huntTimerInterval = null;
let huntTimeLeft = 0;
let huntFocusPause = false;

const huntScene = document.querySelector("#huntScene");
const huntTitle = document.querySelector("#huntTitle");
const huntHint = document.querySelector("#huntHint");
const huntFeedback = document.querySelector("#huntFeedback");
const huntNext = document.querySelector("#huntNext");
const huntLevelLabel = document.querySelector("#huntLevelLabel");
const huntDots = [...document.querySelectorAll("#huntDots span")];
const huntScore = document.querySelector("#huntScore");
const huntTargets = document.querySelector("#huntTargets");
const huntTimer = document.querySelector("#huntTimer");
const huntBest = document.querySelector("#huntBest");
const huntChallenge = document.querySelector("#huntChallenge");
const huntPause = document.querySelector("#huntPause");
const reduceMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

function getHuntBest() {
  return Number(storageGet("opfHuntBest", "0")) || 0;
}

function updateHuntHud() {
  const level = huntLevels[huntLevel];
  if (huntScore) huntScore.textContent = String(huntScoreValue);
  if (huntTargets) huntTargets.textContent = `${huntLevelHits} / ${level?.goal ?? 0}`;
  if (huntTimer) huntTimer.textContent = huntChallengeMode ? `${Math.max(0, huntTimeLeft)}s` : "—";
  if (huntBest) huntBest.textContent = String(getHuntBest());
}

function stopHuntMotion() {
  if (huntMoveInterval) window.clearInterval(huntMoveInterval);
  huntMoveInterval = null;
}

function stopHuntTimer() {
  if (huntTimerInterval) window.clearInterval(huntTimerInterval);
  huntTimerInterval = null;
}

function stopHuntDynamics() {
  stopHuntMotion();
  stopHuntTimer();
}

function randomHuntPosition() {
  return {
    x: Math.round(15 + Math.random() * 70),
    y: Math.round(22 + Math.random() * 60)
  };
}

function moveHuntTarget(force = false) {
  const target = huntScene?.querySelector("[data-moving-target='true']");
  if (!target || huntLocked || huntPaused || huntFocusPause) return;
  if (!force && reduceMotionQuery?.matches) return;
  const position = randomHuntPosition();
  target.style.left = `${position.x}%`;
  target.style.top = `${position.y}%`;
}

function startHuntMotion() {
  stopHuntMotion();
  if (huntLevels[huntLevel]?.type !== "moving-hunt" || huntLocked || huntPaused) return;
  // Com preferência de movimento reduzido, o alvo só muda de posição após o acerto.
  if (reduceMotionQuery?.matches) return;
  huntMoveInterval = window.setInterval(() => moveHuntTarget(false), 1150);
}

function startHuntTimer() {
  stopHuntTimer();
  if (!huntChallengeMode || huntLocked) {
    updateHuntHud();
    return;
  }
  const level = huntLevels[huntLevel];
  huntTimeLeft = level.time;
  updateHuntHud();
  huntTimerInterval = window.setInterval(() => {
    huntTimeLeft -= 1;
    updateHuntHud();
    if (huntTimeLeft <= 0) {
      stopHuntTimer();
      huntChallengeMode = false;
      if (huntChallenge) {
        huntChallenge.setAttribute("aria-pressed", "false");
        huntChallenge.textContent = "⏱ Modo desafio: desligado";
      }
      if (huntFeedback) {
        huntFeedback.textContent = "O tempo acabou, mas a missão continua sem cronômetro. Jogue no seu ritmo.";
        huntFeedback.className = "feedback hunt-feedback bad";
      }
      updateHuntHud();
    }
  }, 1000);
}

function createHairStrands() {
  const strands = document.createElement("div");
  strands.className = "hair-strands";
  strands.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 8; i++) {
    const strand = document.createElement("span");
    strand.style.setProperty("--i", i);
    strands.appendChild(strand);
  }
  return strands;
}

function makeHuntButton(item, isHairScene = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = isHairScene ? "hunt-hotspot" : "hunt-target";
  button.dataset.correct = item.correct ? "true" : "false";
  button.setAttribute("aria-label", item.label);

  if (isHairScene) {
    button.style.left = `${item.x}%`;
    button.style.top = `${item.y}%`;
    if (item.size) button.classList.add(`hotspot-${item.size}`);
  }

  if (item.image) {
    const image = document.createElement("img");
    image.src = item.image;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    button.appendChild(image);
  } else if (item.kind === "flake") {
    const flake = document.createElement("span");
    flake.className = "hair-flake";
    flake.setAttribute("aria-hidden", "true");
    button.appendChild(flake);
  } else {
    const icon = document.createElement("span");
    icon.className = "hunt-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = item.icon || "?";
    button.appendChild(icon);
  }

  if (!isHairScene) {
    const label = document.createElement("span");
    label.className = "hunt-label";
    label.textContent = item.label;
    button.appendChild(label);
  }
  return button;
}

function addHuntPoints(points) {
  huntScoreValue = Math.max(0, Math.min(100, huntScoreValue + points));
  updateHuntHud();
}

function completeHuntLevel(level) {
  huntLocked = true;
  stopHuntDynamics();
  huntScene?.querySelectorAll("button").forEach((target) => { target.disabled = true; });
  if (huntFeedback) {
    huntFeedback.textContent = `${level.success} Pontuação atual: ${huntScoreValue} pontos.`;
    huntFeedback.className = "feedback hunt-feedback good";
  }
  if (huntNext) {
    huntNext.hidden = false;
    huntNext.textContent = huntLevel === huntLevels.length - 1 ? "Concluir missão" : "Próximo nível";
    huntNext.focus();
  }
}

function registerWrongHuntChoice(button) {
  if (button) {
    button.classList.add("wrong");
    window.setTimeout(() => button.classList.remove("wrong"), 650);
  }
  addHuntPoints(-2);
  if (huntFeedback) {
    huntFeedback.textContent = `Quase! Observe com calma. Você perdeu 2 pontos e está com ${huntScoreValue}.`;
    huntFeedback.className = "feedback hunt-feedback bad";
  }
}

function renderMovingHunt(level) {
  huntScene.appendChild(createHairStrands());

  level.decoys.forEach((item) => {
    const button = makeHuntButton(item, true);
    button.addEventListener("click", () => {
      if (!huntLocked) registerWrongHuntChoice(button);
    });
    huntScene.appendChild(button);
  });

  const position = randomHuntPosition();
  const targetData = {
    label: "Piolhinho em movimento",
    image: "assets/personagens/piolhinho-jogo.png",
    correct: true,
    x: position.x,
    y: position.y,
    size: "medium"
  };
  const target = makeHuntButton(targetData, true);
  target.dataset.movingTarget = "true";
  target.classList.add("moving-piolho");
  target.addEventListener("focus", () => {
    huntFocusPause = true;
    stopHuntMotion();
  });
  target.addEventListener("blur", () => {
    huntFocusPause = false;
    startHuntMotion();
  });
  target.addEventListener("click", () => {
    if (huntLocked) return;
    huntLevelHits += 1;
    addHuntPoints(level.points);
    target.classList.add("caught");
    if (huntFeedback) {
      huntFeedback.textContent = `Acertou! +${level.points} pontos. Capturas: ${huntLevelHits}/${level.goal}.`;
      huntFeedback.className = "feedback hunt-feedback good";
    }
    updateHuntHud();
    if (huntLevelHits >= level.goal) {
      completeHuntLevel(level);
      return;
    }
    window.setTimeout(() => {
      target.classList.remove("caught");
      moveHuntTarget(true);
    }, 180);
  });
  huntScene.appendChild(target);
  startHuntMotion();
}

function renderNitSearch(level) {
  huntScene.appendChild(createHairStrands());
  level.targets.forEach((item) => {
    const button = makeHuntButton(item, true);
    button.addEventListener("click", () => {
      if (huntLocked || button.disabled) return;
      if (item.correct) {
        button.classList.add("correct");
        button.disabled = true;
        huntLevelHits += 1;
        addHuntPoints(level.points);
        if (huntFeedback) {
          huntFeedback.textContent = `Lendinha encontrada! +${level.points} pontos. Encontradas: ${huntLevelHits}/${level.goal}.`;
          huntFeedback.className = "feedback hunt-feedback good";
        }
        updateHuntHud();
        if (huntLevelHits >= level.goal) completeHuntLevel(level);
      } else {
        registerWrongHuntChoice(button);
      }
    });
    huntScene.appendChild(button);
  });
}

function renderHuntChoices(level) {
  level.items.forEach((item) => {
    const button = makeHuntButton(item, false);
    button.addEventListener("click", () => {
      if (huntLocked) return;
      if (item.correct) {
        button.classList.add("correct");
        huntLevelHits = 1;
        addHuntPoints(level.points);
        updateHuntHud();
        completeHuntLevel(level);
      } else {
        registerWrongHuntChoice(button);
      }
    });
    huntScene.appendChild(button);
  });
}

function renderHuntLevel() {
  if (!huntScene) return;
  stopHuntDynamics();
  huntLocked = false;
  huntFinished = false;
  huntLevelHits = 0;
  huntPaused = false;
  huntFocusPause = false;
  const level = huntLevels[huntLevel];

  huntTitle.textContent = level.title;
  huntHint.textContent = level.hint;
  if (huntLevelLabel) huntLevelLabel.textContent = `NÍVEL ${huntLevel + 1} / ${huntLevels.length}`;
  huntDots.forEach((dot, index) => dot.classList.toggle("active", index <= huntLevel));
  if (huntFeedback) {
    huntFeedback.textContent = level.type === "moving-hunt"
      ? "Clique no Piolhinho para pontuar. Use Tab + Enter se preferir teclado."
      : "Clique ou use Tab + Enter para escolher.";
    huntFeedback.className = "feedback hunt-feedback";
  }
  if (huntNext) huntNext.hidden = true;
  if (huntPause) {
    huntPause.disabled = level.type !== "moving-hunt";
    huntPause.setAttribute("aria-pressed", "false");
    huntPause.textContent = level.type === "moving-hunt" ? "⏸ Pausar movimento" : "✓ Sem movimento neste nível";
  }

  huntScene.innerHTML = "";
  const hairScene = level.type === "moving-hunt" || level.type === "nit-search";
  huntScene.className = `hunt-scene ${hairScene ? "hair-search-scene" : "choice-scene"}`;

  if (level.type === "moving-hunt") renderMovingHunt(level);
  else if (level.type === "nit-search") renderNitSearch(level);
  else renderHuntChoices(level);

  huntTimeLeft = level.time;
  updateHuntHud();
  startHuntTimer();
}

function finishHuntGame() {
  huntFinished = true;
  stopHuntDynamics();
  awardBadge("detective");
  const previousBest = getHuntBest();
  if (huntScoreValue > previousBest) storageSet("opfHuntBest", String(huntScoreValue));
  const best = Math.max(previousBest, huntScoreValue);
  const stars = huntScoreValue >= 90 ? "⭐⭐⭐" : huntScoreValue >= 70 ? "⭐⭐" : "⭐";
  const title = huntScoreValue >= 90 ? "Detetive Mestre!" : huntScoreValue >= 70 ? "Grande Detetive!" : "Missão Cumprida!";
  huntScene.innerHTML = `
    <div class="hunt-complete" role="status">
      <img src="assets/personagens/piolhinho-jogo.png" alt="Piolhinho sorrindo">
      <div><span>MISSÃO CONCLUÍDA</span><strong>${title}</strong><p>${stars} Você fez <b>${huntScoreValue}/100</b> pontos. Seu recorde é <b>${best}</b>.</p></div>
    </div>`;
  if (huntTitle) huntTitle.textContent = "Busca concluída!";
  if (huntHint) huntHint.textContent = "Você completou os três níveis do Caça ao Piolho.";
  if (huntFeedback) {
    huntFeedback.textContent = "Distintivo liberado: Detetive da Higiene. Você pode jogar novamente e tentar melhorar o recorde.";
    huntFeedback.className = "feedback hunt-feedback good";
  }
  if (huntTargets) huntTargets.textContent = "3 / 3 níveis";
  if (huntTimer) huntTimer.textContent = "—";
  if (huntBest) huntBest.textContent = String(best);
  if (huntPause) huntPause.disabled = true;
  if (huntNext) {
    huntNext.textContent = "Jogar novamente";
    huntNext.hidden = false;
  }
}

function restartHuntGame() {
  stopHuntDynamics();
  huntLevel = 0;
  huntScoreValue = 0;
  huntLevelHits = 0;
  huntFinished = false;
  renderHuntLevel();
  huntScene?.querySelector("button")?.focus();
}

huntChallenge?.addEventListener("click", () => {
  huntChallengeMode = !huntChallengeMode;
  huntChallenge.setAttribute("aria-pressed", String(huntChallengeMode));
  huntChallenge.textContent = huntChallengeMode ? "⏱ Modo desafio: ligado" : "⏱ Modo desafio: desligado";
  if (huntChallengeMode) {
    huntTimeLeft = huntLevels[huntLevel]?.time || 30;
    startHuntTimer();
    if (huntFeedback) huntFeedback.textContent = "Modo desafio ligado. O cronômetro é opcional e não bloqueia a missão.";
  } else {
    stopHuntTimer();
    if (huntTimer) huntTimer.textContent = "—";
    if (huntFeedback) huntFeedback.textContent = "Modo tranquilo ligado. Jogue no seu ritmo.";
  }
});

huntPause?.addEventListener("click", () => {
  if (huntLevels[huntLevel]?.type !== "moving-hunt") return;
  huntPaused = !huntPaused;
  huntPause.setAttribute("aria-pressed", String(huntPaused));
  huntPause.textContent = huntPaused ? "▶ Retomar movimento" : "⏸ Pausar movimento";
  if (huntPaused) {
    stopHuntMotion();
    if (huntFeedback) huntFeedback.textContent = "Movimento pausado. Você pode continuar usando mouse, toque ou teclado.";
  } else {
    startHuntMotion();
    if (huntFeedback) huntFeedback.textContent = "Movimento retomado. Capture o Piolhinho!";
  }
});

if (huntScene) renderHuntLevel();

huntNext?.addEventListener("click", () => {
  if (huntFinished) {
    restartHuntGame();
    return;
  }
  if (huntLevel < huntLevels.length - 1) {
    huntLevel += 1;
    renderHuntLevel();
    huntScene?.querySelector("button")?.focus();
    return;
  }
  finishHuntGame();
});

// =====================================================
// JOGO 3 — MITOS OU VERDADES?
// =====================================================
const mythQuestions = [
  { q: "Qualquer tipo de cabelo pode ter piolho.", a: "truth", info: "Verdade. A pediculose pode atingir pessoas com diferentes tipos de cabelo." },
  { q: "Ter piolho significa que a pessoa não tem higiene.", a: "myth", info: "Mito. Pediculose não deve ser usada para julgar a higiene de uma pessoa." },
  { q: "Compartilhar pentes e bonés pode facilitar a transmissão.", a: "truth", info: "Verdade. Por isso, objetos pessoais devem ser de uso individual." },
  { q: "Coçar muito pode machucar o couro cabeludo.", a: "truth", info: "Verdade. A coceira intensa pode causar lesões na pele." },
  { q: "É correto zombar de alguém que está com piolho.", a: "myth", info: "Mito. O correto é orientar e acolher sem constrangimento." },
  { q: "Avisar um adulto responsável ao notar sinais é uma atitude de cuidado.", a: "truth", info: "Verdade. Conversar com um responsável ajuda a buscar orientação adequada." },
  { q: "A lêndea é o ovo do piolho.", a: "truth", info: "Verdade. Lêndea é o nome dado ao ovo do piolho." },
  { q: "Somente crianças podem ter piolho.", a: "myth", info: "Mito. A pediculose não acontece apenas em crianças." },
  { q: "Contato próximo entre as cabeças pode favorecer a transmissão.", a: "truth", info: "Verdade. O contato próximo é uma forma importante de transmissão." },
  { q: "Informação e prevenção ajudam a lidar com a pediculose sem preconceito.", a: "truth", info: "Verdade. Informação segura ajuda no cuidado e reduz o estigma." }
];

let mythIndex = 0;
let mythScoreValue = 0;
let mythLocked = false;
const mythQuestion = document.querySelector("#mythQuestion");
const mythFeedback = document.querySelector("#mythFeedback");
const mythCounter = document.querySelector("#mythCounter");
const mythScore = document.querySelector("#mythScore");
const mythButtons = [...document.querySelectorAll("[data-myth-answer]")];
const mythNext = document.querySelector("#mythNext");

function renderMythQuestion() {
  if (!mythQuestion) return;
  mythLocked = false;
  mythQuestion.textContent = mythQuestions[mythIndex].q;
  if (mythCounter) mythCounter.textContent = `${mythIndex + 1} / ${mythQuestions.length}`;
  if (mythFeedback) {
    mythFeedback.textContent = "Escolha uma opção.";
    mythFeedback.className = "feedback";
  }
  mythButtons.forEach((button) => { button.disabled = false; button.classList.remove("correct-choice", "wrong-choice"); });
  if (mythNext) mythNext.hidden = true;
  setReaction("myth", "neutral", "A Professora Lili vai explicar cada resposta.", "assets/personagens/lili.webp", "Professora Lili");
}

mythButtons.forEach((button) => button.addEventListener("click", () => {
  if (mythLocked || !mythQuestion) return;
  mythLocked = true;
  const current = mythQuestions[mythIndex];
  const isCorrect = button.dataset.mythAnswer === current.a;
  if (isCorrect) mythScoreValue += 10;
  if (mythScore) mythScore.textContent = String(mythScoreValue);

  button.classList.add(isCorrect ? "correct-choice" : "wrong-choice");
  mythButtons.forEach((item) => {
    item.disabled = true;
    if (item.dataset.mythAnswer === current.a) item.classList.add("correct-choice");
  });

  if (mythFeedback) {
    mythFeedback.textContent = `${isCorrect ? "Acertou!" : "Quase!"} ${current.info}`;
    mythFeedback.className = `feedback ${isCorrect ? "good" : "bad"}`;
  }
  setReaction(
    "myth",
    isCorrect ? "good" : "bad",
    isCorrect ? "Muito bem! A Professora Lili confirma sua resposta." : "Tudo bem errar. Leia a explicação e tente lembrar na próxima.",
    isCorrect ? "assets/personagens/lili.webp" : "assets/personagens/biel.webp",
    isCorrect ? "Professora Lili" : "Biel"
  );
  if (mythNext) {
    mythNext.hidden = false;
    mythNext.textContent = mythIndex === mythQuestions.length - 1 ? "Ver resultado" : "Próxima pergunta";
  }
}));

mythNext?.addEventListener("click", () => {
  if (mythQuestion?.dataset.finished === "true") {
    mythIndex = 0;
    mythScoreValue = 0;
    mythQuestion.dataset.finished = "false";
    if (mythScore) mythScore.textContent = "0";
    renderMythQuestion();
    mythButtons[0]?.focus();
    return;
  }

  if (mythIndex < mythQuestions.length - 1) {
    mythIndex++;
    renderMythQuestion();
    mythButtons[0]?.focus();
    return;
  }

  mythQuestion.dataset.finished = "true";
  if (mythCounter) mythCounter.textContent = "RESULTADO";
  mythQuestion.textContent = `Você fez ${mythScoreValue} de 100 pontos!`;

  let resultMessage = "Você concluiu o quiz e aprendeu mais sobre prevenção e respeito.";
  if (mythScoreValue >= 80) {
    awardBadge("guardian");
    resultMessage = "Excelente missão! Você desbloqueou o distintivo Guardião do Pente Fino.";
  } else {
    resultMessage += " Faça 80 pontos ou mais para liberar o distintivo Guardião do Pente Fino.";
  }
  if (mythFeedback) {
    mythFeedback.textContent = resultMessage;
    mythFeedback.className = "feedback good";
  }
  mythButtons.forEach((button) => { button.disabled = true; });
  mythNext.textContent = "Jogar novamente";
  mythNext.hidden = false;
});

// =====================================================
// FASES DA PÁGINA SOBRE
// =====================================================
const phases = [
  { number: "01", label: "CIÊNCIA E SAÚDE", title: "Pesquisa, oficinas e validação especializada", text: "Levantamento bibliográfico, oficinas técnicas no Senac, revisão por médica dermatologista e apoio científico da UFMS." },
  { number: "02", label: "COCRIAÇÃO E MULTIPLICAÇÃO", title: "Conhecimento técnico em linguagem infantil", text: "Os estudantes transformam conteúdos de cuidados capilares e biossegurança em personagens, narrativas, missões e materiais educativos." },
  { number: "03", label: "TECNOLOGIA", title: "Desenvolvimento responsivo e acessível", text: "Arquitetura da informação, prototipagem, programação e testes com abordagem mobile first e referência nas WCAG 2.2." }
];

const phaseTabs = [...document.querySelectorAll("[data-phase]")];
function activatePhase(tab) {
  const phase = phases[Number(tab.dataset.phase)];
  if (!phase) return;
  phaseTabs.forEach((item) => {
    const selected = item === tab;
    item.classList.toggle("active", selected);
    item.setAttribute("aria-selected", String(selected));
    item.setAttribute("tabindex", selected ? "0" : "-1");
  });
  const phaseContent = document.querySelector("#phaseContent");
  if (phaseContent) {
    phaseContent.innerHTML = `<div class="phase-index">${phase.number}</div><div><p>${phase.label}</p><h3>${phase.title}</h3><p>${phase.text}</p></div>`;
    phaseContent.setAttribute("aria-labelledby", tab.id || "");
  }
}
phaseTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activatePhase(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % phaseTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + phaseTabs.length) % phaseTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = phaseTabs.length - 1;
    phaseTabs[nextIndex].focus();
    activatePhase(phaseTabs[nextIndex]);
  });
});

// =====================================================
// CONTADORES / ÁUDIO / IMPRESSÃO
// =====================================================
if ("IntersectionObserver" in window) {
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = entry.target;
      const total = Number(target.dataset.count);
      const suffix = target.dataset.suffix || "";
      let current = 0;
      const step = Math.max(1, Math.ceil(total / 40));
      const timer = window.setInterval(() => {
        current = Math.min(total, current + step);
        target.textContent = `${current}${suffix}`;
        if (current >= total) window.clearInterval(timer);
      }, 28);
      countObserver.unobserve(target);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((number) => countObserver.observe(number));
}

const audioIntroButton = document.querySelector("#audioIntro");
let introSpeech = null;
audioIntroButton?.addEventListener("click", (event) => {
  if (!("speechSynthesis" in window)) {
    event.currentTarget.textContent = "Áudio indisponível";
    return;
  }

  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
    event.currentTarget.innerHTML = '<svg><use href="#i-volume"></use></svg> Continuar apresentação';
    return;
  }

  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    event.currentTarget.innerHTML = '<svg><use href="#i-volume"></use></svg> Pausar apresentação';
    return;
  }

  const text = "Operação Pente Fino. Uma aventura educativa que une barbearia, ciência e tecnologia para combater a pediculose com informação, cuidado e diversão.";
  introSpeech = new SpeechSynthesisUtterance(text);
  introSpeech.lang = "pt-BR";
  introSpeech.rate = 0.92;
  introSpeech.onend = () => {
    if (audioIntroButton) audioIntroButton.innerHTML = '<svg><use href="#i-volume"></use></svg> Ouvir apresentação';
  };
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(introSpeech);
  event.currentTarget.innerHTML = '<svg><use href="#i-volume"></use></svg> Pausar apresentação';
});

document.querySelector("#printMaterial")?.addEventListener("click", () => window.print());

document.querySelector("#copyKidsLink")?.addEventListener("click", async () => {
  const status = document.querySelector("#copyKidsStatus");
  const target = new URL("crianca.html#missoes", window.location.href).href;
  try {
    await navigator.clipboard.writeText(target);
    if (status) status.textContent = "Link copiado. Use esse endereço para criar o QR Code quando o site estiver publicado.";
  } catch {
    if (status) status.textContent = `Copie este endereço: ${target}`;
  }
});


// =====================================================
// ACESSIBILIDADE: CONTRASTE + TAMANHO DE TEXTO
// =====================================================
const contrastToggle = document.querySelector("#contrastToggle");
const savedContrast = storageGet("opfHighContrast", "false") === "true";
if (savedContrast) {
  document.body.classList.add("high-contrast");
  contrastToggle?.setAttribute("aria-pressed", "true");
}

contrastToggle?.addEventListener("click", () => {
  const enabled = document.body.classList.toggle("high-contrast");
  contrastToggle.setAttribute("aria-pressed", String(enabled));
  storageSet("opfHighContrast", String(enabled));
});

const fontDecrease = document.querySelector("#fontDecrease");
const fontIncrease = document.querySelector("#fontIncrease");
const rootElement = document.documentElement;
const fontLevels = ["normal", "large", "xlarge"];
let fontLevel = storageGet("opfFontLevel", "normal");
if (!fontLevels.includes(fontLevel)) fontLevel = "normal";

function applyFontLevel(level) {
  rootElement.classList.remove("font-large", "font-xlarge");
  if (level === "large") rootElement.classList.add("font-large");
  if (level === "xlarge") rootElement.classList.add("font-xlarge");
  fontLevel = level;
  storageSet("opfFontLevel", level);
}
applyFontLevel(fontLevel);

fontIncrease?.addEventListener("click", () => {
  const current = fontLevels.indexOf(fontLevel);
  applyFontLevel(fontLevels[Math.min(current + 1, fontLevels.length - 1)]);
});
fontDecrease?.addEventListener("click", () => {
  const current = fontLevels.indexOf(fontLevel);
  applyFontLevel(fontLevels[Math.max(current - 1, 0)]);
});

// ESC fecha o menu móvel.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mainMenu?.classList.contains("open")) {
    menuToggle?.click();
    menuToggle?.focus();
  }
});


// =====================================================
// MODO OFFLINE / FEIRA
// =====================================================
if ("serviceWorker" in navigator && /^https?:$/.test(window.location.protocol)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* O site continua funcionando normalmente sem Service Worker. */
    });
  });
}


// =====================================================

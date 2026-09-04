// Carrossel de banners
const heroSlides=[...document.querySelectorAll(".hero-slide")];
const heroDots=[...document.querySelectorAll(".hero-dots button")];
let heroIndex=0,heroTimer;
function showHero(i){heroIndex=(i+heroSlides.length)%heroSlides.length;heroSlides.forEach((s,n)=>s.classList.toggle("active",n===heroIndex));heroDots.forEach((d,n)=>d.classList.toggle("active",n===heroIndex))}
function startHero(){clearInterval(heroTimer);heroTimer=setInterval(()=>showHero(heroIndex+1),5000)}
document.querySelector(".hero-btn.next").onclick=()=>{showHero(heroIndex+1);startHero()};
document.querySelector(".hero-btn.prev").onclick=()=>{showHero(heroIndex-1);startHero()};
heroDots.forEach((d,i)=>d.onclick=()=>{showHero(i);startHero()});startHero();

// Fundo Matrix sutil, mantendo a paleta original do site.
const matrixCanvas=document.getElementById("matrixCanvas");
const matrixCtx=matrixCanvas.getContext("2d");
let matrixDrops=[];
const matrixChars="01ABCDEFGHIJKLMNOPQRSTUVWXYZ<>[]{}$#@%&";

function resizeMatrix(){
  const dpr=Math.min(window.devicePixelRatio||1,2);
  matrixCanvas.width=innerWidth*dpr;
  matrixCanvas.height=innerHeight*dpr;
  matrixCanvas.style.width=innerWidth+"px";
  matrixCanvas.style.height=innerHeight+"px";
  matrixCtx.setTransform(dpr,0,0,dpr,0,0);
  const columns=Math.ceil(innerWidth/20);
  matrixDrops=Array.from({length:columns},()=>Math.random()*-innerHeight/18);
}

function drawMatrix(){
  matrixCtx.fillStyle="rgba(2,7,17,.035)";
  matrixCtx.fillRect(0,0,innerWidth,innerHeight);
  matrixCtx.font="14px Consolas, monospace";
  matrixCtx.textAlign="center";
  for(let i=0;i<matrixDrops.length;i++){
    const x=i*20+10;
    const y=matrixDrops[i]*20;
    const char=matrixChars[Math.floor(Math.random()*matrixChars.length)];
    const isHead=Math.random()>.88;
    matrixCtx.fillStyle=isHead?"rgba(120,255,170,.9)":"rgba(20,210,100,.55)";
    matrixCtx.fillText(char,x,y);
    if(y>innerHeight+Math.random()*900) matrixDrops[i]=Math.random()*-35;
    matrixDrops[i]+=.55+Math.random()*.65;
  }
  requestAnimationFrame(drawMatrix);
}

resizeMatrix();
drawMatrix();
window.addEventListener("resize",resizeMatrix);

// Carrossel de 12 desenvolvedores: 5 por vez no desktop, avanço de 1 card.
const track=document.getElementById("devTrack");
const cards=[...document.querySelectorAll(".dev-card")];
let devIndex=0,devTimer;
function visibleCount(){return innerWidth<=700?1:innerWidth<=1000?3:5}
function updateDev(){
  const visible=visibleCount();
  const max=Math.max(0,cards.length-visible);
  if(devIndex>max)devIndex=0;
  const gap=16;
  const cardWidth=cards[0].getBoundingClientRect().width;
  track.style.transform=`translateX(-${devIndex*(cardWidth+gap)}px)`;
  document.getElementById("devProgress").style.width=`${((devIndex+visible)/cards.length)*100}%`;
}
function nextDev(){devIndex++;if(devIndex>cards.length-visibleCount())devIndex=0;updateDev()}
function prevDev(){devIndex--;if(devIndex<0)devIndex=cards.length-visibleCount();updateDev()}
document.querySelector(".dev-next").onclick=()=>{nextDev();startDev()};
document.querySelector(".dev-prev").onclick=()=>{prevDev();startDev()};
function startDev(){clearInterval(devTimer);devTimer=setInterval(nextDev,2000)}
const devWindow=document.querySelector(".dev-window");
devWindow.addEventListener("mouseenter",()=>clearInterval(devTimer));
devWindow.addEventListener("mouseleave",startDev);
window.addEventListener("resize",updateDev);
updateDev();startDev();

// Currículos são demonstrativos até que os PDFs/links reais da turma sejam inseridos.
function demoCV(event,nome){event.preventDefault();alert(`Currículo demonstrativo de ${nome}.\\n\\nSubstitua o href deste card pelo PDF ou link real do currículo.`);return false}

// Menu mobile
const toggle=document.querySelector(".menu-toggle"),nav=document.querySelector(".nav-menu");
toggle.addEventListener("click",()=>{const open=nav.classList.toggle("open");toggle.setAttribute("aria-expanded",open)});
document.querySelectorAll(".nav-menu a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));

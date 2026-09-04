// Carrossel de banners
const heroSlides=[...document.querySelectorAll(".hero-slide")];
const heroDots=[...document.querySelectorAll(".hero-dots button")];
let heroIndex=0,heroTimer;
function showHero(i){heroIndex=(i+heroSlides.length)%heroSlides.length;heroSlides.forEach((s,n)=>s.classList.toggle("active",n===heroIndex));heroDots.forEach((d,n)=>d.classList.toggle("active",n===heroIndex))}
function startHero(){clearInterval(heroTimer);heroTimer=setInterval(()=>showHero(heroIndex+1),5000)}
document.querySelector(".hero-btn.next").onclick=()=>{showHero(heroIndex+1);startHero()};
document.querySelector(".hero-btn.prev").onclick=()=>{showHero(heroIndex-1);startHero()};
heroDots.forEach((d,i)=>d.onclick=()=>{showHero(i);startHero()});startHero();

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
function startDev(){clearInterval(devTimer);devTimer=setInterval(nextDev,3500)}
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

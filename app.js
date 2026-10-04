const CONFIG = {
  eventStart: '2026-11-07T14:00:00+03:00',
  eventEnd: '2026-11-07T17:00:00+03:00',
  venue: 'Salihli Öğretmenevi',
  mapsQuery: 'Salihli Öğretmenevi ve Akşam Sanat Okulu, Aksoy Mahallesi Menderes Caddesi No:70, Salihli, Manisa',
  musicSrc: 'videoplayback.m4a',
  cinematicSrc: 'cinematic-opening.mp4'
};

const $ = (s) => document.querySelector(s);
const opening = $('#opening');
const invitation = $('#invitation');
const openButton = $('#openInvitation');
const replayButton = $('#replayBtn');
const music = $('#music');
const soundToggle = $('#soundToggle');
const rsvpModal = $('#rsvpModal');
const cinematicIntro = $('#cinematicIntro');
const cinemaStatus = $('#cinemaStatus');

let timers = [];
let filmStarted = false;
let filmEnding = false;

function clearTimers(){
  timers.forEach(clearTimeout);
  timers=[];
}

async function startMusicFromGesture(){
  if(!CONFIG.musicSrc) return;
  if(!music.src) music.src=CONFIG.musicSrc;
  music.pause();
  try{music.currentTime=0}catch(_){}
  music.volume=0;

  try{
    await music.play();
    soundToggle.hidden=false;
    soundToggle.classList.remove('is-muted');

    const t0=performance.now();
    const duration=1900;
    const ramp=(t)=>{
      const p=Math.min(1,(t-t0)/duration);
      music.volume=.50*(1-Math.pow(1-p,3));
      if(p<1&&!music.paused) requestAnimationFrame(ramp);
    };
    requestAnimationFrame(ramp);
  }catch(_){
    soundToggle.hidden=true;
  }
}

function showInvitation(){
  invitation.classList.add('is-visible');
  invitation.setAttribute('aria-hidden','false');
}

function finishFilm(){
  if(filmEnding) return;
  filmEnding=true;
  opening.classList.add('is-ending');
  showInvitation();
  timers.push(setTimeout(()=>opening.classList.add('is-complete'),720));
}

async function openInvitation(){
  if(filmStarted) return;
  filmStarted=true;
  filmEnding=false;
  clearTimers();

  opening.classList.add('is-playing');
  cinemaStatus.textContent='';
  startMusicFromGesture();

  try{
    cinematicIntro.pause();
    cinematicIntro.muted=true;
    cinematicIntro.playbackRate=1;
    cinematicIntro.currentTime=0;
    const p=cinematicIntro.play();
    if(p) await p;

    const duration=(Number.isFinite(cinematicIntro.duration)&&cinematicIntro.duration>0)
      ? cinematicIntro.duration
      : 10;

    timers.push(setTimeout(()=>{
      if(!filmEnding){
        opening.classList.add('is-ending');
        showInvitation();
      }
    },Math.max(1000,(duration-.78)*1000)));

    timers.push(setTimeout(finishFilm,Math.max(1400,duration*1000)));
  }catch(_){
    opening.classList.add('video-error');
    cinemaStatus.textContent='Sinematik açılış bu tarayıcıda oynatılamadı; davetiye açılıyor…';
    timers.push(setTimeout(finishFilm,650));
  }
}

cinematicIntro.addEventListener('ended',finishFilm);
cinematicIntro.addEventListener('error',()=>{
  if(filmStarted){
    opening.classList.add('video-error');
    finishFilm();
  }
});

function replayInvitation(){
  clearTimers();
  filmStarted=false;
  filmEnding=false;

  invitation.classList.remove('is-visible');
  invitation.setAttribute('aria-hidden','true');

  opening.classList.remove('is-complete','is-ending','is-playing','video-error');

  cinematicIntro.pause();
  cinematicIntro.muted=true;
  try{cinematicIntro.currentTime=0}catch(_){}

  music.pause();
  try{music.currentTime=0}catch(_){}
  soundToggle.classList.add('is-muted');

  cinemaStatus.textContent='';
  window.scrollTo({top:0,behavior:'auto'});
}

function updateCountdown(){
  const el=$('#countdown');
  const now=new Date();
  const start=new Date(CONFIG.eventStart);
  const diff=start-now;

  if(diff<=-3*60*60*1000){el.textContent='Bu güzel gün için teşekkür ederiz.';return}
  if(diff<=0){el.textContent='Bugün buluşuyoruz.';return}

  const days=Math.floor(diff/86400000);
  const hours=Math.floor((diff%86400000)/3600000);
  if(days>=2) el.textContent=`${days} gün kaldı`;
  else if(days===1) el.textContent=`1 gün ${hours} saat kaldı`;
  else el.textContent=`${hours} saat kaldı`;
}

openButton.addEventListener('click',openInvitation);
replayButton.addEventListener('click',replayInvitation);

soundToggle.addEventListener('click',async()=>{
  if(!music.src) return;
  if(music.paused){
    await music.play().catch(()=>{});
    soundToggle.classList.remove('is-muted');
  }else{
    music.pause();
    soundToggle.classList.add('is-muted');
  }
});

$('#locationBtn').addEventListener('click',()=>{
  const url=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapsQuery)}`;
  window.open(url,'_blank','noopener,noreferrer');
});

$('#calendarBtn').addEventListener('click',()=>{
  window.location.href='burcu-vural-salihli-dugun.ics';
});

function openRSVP(){
  const saved=localStorage.getItem('burcu-vural-salihli-rsvp');
  $('#rsvpStatus').textContent=saved?`Seçiminiz: ${saved}`:'';
  rsvpModal.hidden=false;
}
function closeRSVP(){rsvpModal.hidden=true}

$('#rsvpBtn').addEventListener('click',openRSVP);
$('#rsvpClose').addEventListener('click',closeRSVP);

rsvpModal.addEventListener('click',(e)=>{
  if(e.target.matches('[data-close-rsvp]')) closeRSVP();
});

document.querySelectorAll('[data-rsvp]').forEach((btn)=>{
  btn.addEventListener('click',()=>{
    const value=btn.dataset.rsvp;
    localStorage.setItem('burcu-vural-salihli-rsvp',value);
    $('#rsvpStatus').textContent=`Seçiminiz kaydedildi: ${value}`;
  });
});

window.addEventListener('keydown',(e)=>{
  if(e.key==='Escape'&&!rsvpModal.hidden) closeRSVP();
});

updateCountdown();
setInterval(updateCountdown,60000);

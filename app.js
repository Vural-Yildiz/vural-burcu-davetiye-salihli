 'use strict';
const $ = s => document.querySelector(s);
const opening=$('#opening'), invitation=$('#invitation'), button=$('#openInvitation'), music=$('#music');
const video=$('#introVideo'), resume=$('#resumeIntro'), introSound=$('#introSound');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const config=window.INVITATION_INTRO || {};
let timers=[], run=0, finished=false, mode='idle', videoTimer, wasPlaying=false;
function later(fn,ms){const current=run;timers.push(setTimeout(()=>{if(current===run)fn();},ms));}
function clear(){run++;timers.forEach(clearTimeout);timers=[];clearTimeout(videoTimer);}
function scene(n){document.querySelectorAll('.scene').forEach(el=>el.classList.toggle('active',Number(el.dataset.scene)===n));}
function readyImage(img){return new Promise(resolve=>{if(img.complete)return resolve(img.naturalWidth>0);img.addEventListener('load',()=>resolve(true),{once:true});img.addEventListener('error',()=>resolve(false),{once:true});setTimeout(()=>resolve(false),8000);});}
const imagesReady=Promise.all([...document.querySelectorAll('.scene')].map(readyImage));
for(let i=0;i<24;i++){const p=document.createElement('i');p.className='mote';p.style.cssText=`--x:${(i*37)%100}%;--y:${(i*19)%100}%;--size:${1+i%3}px;--delay:${-i/3}s;--duration:${5+i%6}s`;$('#particles').append(p);}
function endIntro(){
 if(finished)return;
 clear();mode='ended';video.pause();resume.hidden=true;introSound.hidden=true;
 opening.className='cinema intro-ended';scene(10);$('.cinema__controls').hidden=false;
 $('#openingAssetStatus').textContent='Açılış tamamlandı. Daveti açabilirsiniz.';
}
function finish(){
 if(finished)return;
 finished=true;clear();mode='invitation';video.pause();resume.hidden=true;introSound.hidden=true;
 opening.classList.add('complete');opening.inert=true;invitation.inert=false;
 invitation.setAttribute('aria-hidden','false');invitation.classList.add('is-visible');
 document.body.classList.remove('intro-active');$('#openingAssetStatus').textContent='Davetiye açıldı.';
 invitation.focus({preventScroll:true});
}
function fallback(){
 if(finished || mode==='ended' || mode==='fallback')return;
 clear();video.pause();mode='fallback';resume.hidden=true;introSound.hidden=true;
 opening.className='cinema playing';scene(1);const current=run;
 imagesReady.then(()=>{
  if(current!==run || finished || mode!=='fallback')return;
  later(()=>scene(2),2000);later(()=>scene(3),4000);
  later(()=>{scene(4);opening.classList.add('bloom');},6000);
  later(()=>{scene(5);opening.classList.add('doors-ready');},8000);
  later(()=>opening.classList.add('doors-open'),8100);
  later(()=>opening.classList.remove('bloom'),10500);
  later(()=>{opening.classList.remove('doors-ready','doors-open');scene(6);},11000);
  later(()=>scene(7),13000);later(()=>{scene(8);opening.classList.add('bloom');},15000);
  later(()=>{scene(9);opening.classList.remove('bloom');},17000);later(endIntro,20000);
 });
}
function guardVideo(){
 clearTimeout(videoTimer);
 videoTimer=setTimeout(()=>{if(mode==='video' && !document.hidden && !video.ended)fallback();},config.loadTimeoutMs || 15000);
}
async function attemptPlay(){
 resume.hidden=true;mode='video';guardVideo();const current=run;
 try{await video.play();if(current!==run || mode!=='video'){video.pause();return;}}
 catch{if(current!==run || mode!=='video')return;clearTimeout(videoTimer);resume.hidden=false;$('#openingAssetStatus').textContent='Açılışı oynatmak için dokunun.';}
}
function idle(){
 clear();finished=false;mode='idle';wasPlaying=false;video.pause();video.muted=true;
 introSound.setAttribute('aria-pressed','false');introSound.textContent='Sesi aç';
 opening.className='cinema playing';opening.inert=false;
 invitation.classList.remove('is-visible');invitation.inert=true;invitation.setAttribute('aria-hidden','true');
 $('.cinema__controls').hidden=true;resume.hidden=true;introSound.hidden=true;
 document.body.classList.add('intro-active');scene(1);window.scrollTo(0,0);
 if(reduced.matches){endIntro();return;}
 if(!config.src){fallback();return;}
 opening.classList.add('has-video');introSound.hidden=false;
 if(video.getAttribute('src')!==config.src)video.src=config.src;else video.currentTime=0;
 attemptPlay();
}
video.addEventListener('timeupdate',()=>{
 if(mode==='video' && !finished && video.currentTime >= (config.finalActionAt || Infinity)){
  opening.classList.add('intro-final');$('.cinema__controls').hidden=false;
  $('#openingAssetStatus').textContent='Daveti açabilirsiniz.';
 }
});
video.addEventListener('ended',()=>{if(mode==='video')endIntro();});
video.addEventListener('error',()=>{if(mode==='video')fallback();});
video.addEventListener('playing',()=>{if(mode==='video'){clearTimeout(videoTimer);resume.hidden=true;}});
video.addEventListener('waiting',()=>{if(mode==='video')guardVideo();});
video.addEventListener('stalled',()=>{if(mode==='video')guardVideo();});
video.addEventListener('pause',()=>{if(mode==='video' && !video.ended && !document.hidden){clearTimeout(videoTimer);resume.hidden=false;}});
resume.addEventListener('click',attemptPlay);
introSound.addEventListener('click',()=>{video.muted=!video.muted;introSound.setAttribute('aria-pressed',String(!video.muted));introSound.textContent=video.muted?'Sesi aç':'Sesi kapat';});
document.addEventListener('visibilitychange',()=>{
 if(mode!=='video')return;
 if(document.hidden){wasPlaying=!video.paused;clearTimeout(videoTimer);video.pause();}
 else if(wasPlaying){wasPlaying=false;attemptPlay();}
});
reduced.addEventListener('change',()=>{if(reduced.matches && !finished)endIntro();});
function playMusic(){if(!music.src)music.src='videoplayback.m4a';music.volume=.32;music.loop=true;music.play().then(()=>{$('#soundToggle').hidden=false;$('#soundToggle').textContent='♫ Müziği kapat';}).catch(()=>{});}
button.addEventListener('click',()=>{if(mode!=='ended' && !opening.classList.contains('intro-final'))return;playMusic();finish();});
$('#skipIntro').addEventListener('click',finish);
$('#replayBtn').addEventListener('click',()=>{music.pause();idle();$('#skipIntro').focus({preventScroll:true});});
$('#soundToggle').addEventListener('click',()=>{if(music.paused){music.play().then(()=>$('#soundToggle').textContent='♫ Müziği kapat').catch(()=>{});}else{music.pause();$('#soundToggle').textContent='♫ Müziği aç';}});
$('#locationBtn').addEventListener('click',()=>window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('Salihli Öğretmenevi ve Akşam Sanat Okulu, Aksoy Mahallesi Menderes Caddesi No:70, Salihli, Manisa'),'_blank','noopener,noreferrer'));
$('#calendarBtn').addEventListener('click',()=>{window.location.href='burcu-vural-salihli-dugun.ics';});
function countdown(){const diff=new Date('2026-11-07T14:00:00+03:00')-Date.now();$('#countdown').textContent=diff<-10800000?'Bu güzel gün için teşekkür ederiz.':diff<=0?'Bugün buluşuyoruz.':Math.floor(diff/86400000)>0?`${Math.floor(diff/86400000)} gün kaldı`:`${Math.floor(diff/3600000)} saat kaldı`;}
countdown();setInterval(countdown,60000);
const modal=$('#rsvpModal');let lastFocus;
function closeModal(){modal.hidden=true;invitation.inert=false;if(lastFocus)lastFocus.focus();}
$('#rsvpBtn').addEventListener('click',()=>{lastFocus=document.activeElement;let saved='';try{saved=localStorage.getItem('burcu-vural-salihli-rsvp')||'';}catch{}$('#rsvpStatus').textContent=saved?`Bu cihazdaki seçiminiz: ${saved}`:'';modal.hidden=false;invitation.inert=true;$('#rsvpClose').focus();});
$('#rsvpClose').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target.matches('[data-close-rsvp]'))closeModal();});
document.querySelectorAll('[data-rsvp]').forEach(b=>b.addEventListener('click',()=>{try{localStorage.setItem('burcu-vural-salihli-rsvp',b.dataset.rsvp);$('#rsvpStatus').textContent=`Bu cihazda kaydedildi: ${b.dataset.rsvp}`;}catch{$('#rsvpStatus').textContent='Tarayıcınız bu seçimin kaydedilmesine izin vermiyor.';}}));
document.addEventListener('keydown',e=>{if(modal.hidden)return;if(e.key==='Escape')closeModal();if(e.key==='Tab'){const els=[...modal.querySelectorAll('button')];if(e.shiftKey&&document.activeElement===els[0]){e.preventDefault();els.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===els.at(-1)){e.preventDefault();els[0].focus();}}});

idle();

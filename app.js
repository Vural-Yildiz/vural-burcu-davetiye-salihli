'use strict';
const $ = s => document.querySelector(s);
const opening=$('#opening'), invitation=$('#invitation'), button=$('#openInvitation'), music=$('#music');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let timers=[], run=0, busy=false, finished=false;
document.body.classList.add('intro-active');
function later(fn,ms){const current=run;timers.push(setTimeout(()=>{if(current===run)fn();},ms));}
function clear(){run++;timers.forEach(clearTimeout);timers=[];}
function scene(n){document.querySelectorAll('.scene').forEach(el=>el.classList.toggle('active',Number(el.dataset.scene)===n));}
function readyImage(img){return new Promise(resolve=>{if(img.complete)return resolve(img.naturalWidth>0);img.addEventListener('load',()=>resolve(true),{once:true});img.addEventListener('error',()=>resolve(false),{once:true});setTimeout(()=>resolve(false),8000);});}
const imagesReady=Promise.all([...document.querySelectorAll('.scene')].map(readyImage));
for(let i=0;i<24;i++){const p=document.createElement('i');p.className='mote';p.style.cssText=`--x:${(i*37)%100}%;--y:${(i*19)%100}%;--size:${1+i%3}px;--delay:${-i/3}s;--duration:${5+i%6}s`;$('#particles').append(p);}
function idle(){clear();busy=false;finished=false;button.disabled=false;opening.className='cinema';invitation.classList.remove('is-visible');invitation.inert=true;invitation.setAttribute('aria-hidden','true');opening.inert=false;document.body.classList.add('intro-active');scene(reduced.matches?3:1);window.scrollTo(0,0);if(!reduced.matches){later(()=>scene(2),1500);later(()=>scene(3),3300);}}
function finish(){if(finished)return;finished=true;clear();busy=false;opening.classList.add('complete');opening.inert=true;invitation.inert=false;invitation.setAttribute('aria-hidden','false');invitation.classList.add('is-visible');document.body.classList.remove('intro-active');$('#openingAssetStatus').textContent='Davetiye açıldı.';invitation.focus({preventScroll:true});}
function playMusic(){if(!music.src)music.src='videoplayback.m4a';music.volume=.32;music.loop=true;music.play().then(()=>{$('#soundToggle').hidden=false;$('#soundToggle').textContent='♫ Müziği kapat';}).catch(()=>{});}
async function open(){if(busy||finished)return;clear();busy=true;button.disabled=true;opening.classList.add('playing');const thisRun=run;playMusic();if(reduced.matches){finish();return;}$('#openingAssetStatus').textContent='Davetiye açılıyor.';await imagesReady;if(thisRun!==run||!busy||finished)return;
 scene(4);opening.classList.add('bloom');later(()=>{scene(5);opening.classList.add('doors-ready');},1300);later(()=>opening.classList.add('doors-open'),1400);later(()=>opening.classList.remove('bloom'),2700);later(()=>{opening.classList.remove('doors-ready','doors-open');scene(6);},4200);later(()=>scene(7),6200);later(()=>{scene(8);opening.classList.add('bloom');},8100);later(()=>{scene(9);opening.classList.remove('bloom');},10100);later(finish,12300);
}
button.addEventListener('click',open);$('#skipIntro').addEventListener('click',finish);$('#replayBtn').addEventListener('click',()=>{idle();button.focus({preventScroll:true});});
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
imagesReady.then(results=>{$('#openingAssetStatus').textContent=results.every(Boolean)?'Davet hazır.':'Davet hazır. Açılışı geçerek davetiyeye ulaşabilirsiniz.';});
idle();

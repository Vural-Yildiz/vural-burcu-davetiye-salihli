const CONFIG = {
  eventStart: '2026-11-07T14:00:00+03:00',
  eventEnd: '2026-11-07T17:00:00+03:00',
  venue: 'Salihli Öğretmenevi',
  mapsQuery: 'Salihli Öğretmenevi ve Akşam Sanat Okulu, Aksoy Mahallesi Menderes Caddesi No:70, Salihli, Manisa',
  musicSrc: 'videoplayback.m4a'
};

const $ = (s) => document.querySelector(s);
const opening = $('#opening');
const invitation = $('#invitation');
const openButton = $('#openInvitation');
const replayButton = $('#replayBtn');
const particles = $('#particles');
const music = $('#music');
const soundToggle = $('#soundToggle');
const rsvpModal = $('#rsvpModal');
const openingClosedArtwork = $('#openingClosedArtwork');
const openingOpenArtwork = $('#openingOpenArtwork');
const openingAssetStatus = $('#openingAssetStatus');
const atelierFrame = $('#atelierFrame');

let timers = [];

function waitForImage(img) {
  if (img.complete && img.naturalWidth) return Promise.resolve();
  return new Promise((resolve,reject) => {
    img.addEventListener('load',resolve,{once:true});
    img.addEventListener('error',reject,{once:true});
  });
}

async function hydrateOpeningArtwork() {
  try {
    await Promise.all([
      waitForImage(openingClosedArtwork),
      waitForImage(openingOpenArtwork)
    ]);
    opening.classList.add('artwork-ready');
    openButton.disabled = false;
    openingAssetStatus.textContent = '';
  } catch (_) {
    opening.classList.add('artwork-ready');
    openButton.disabled = false;
    openingAssetStatus.textContent = 'Daveti açmak için dokunun.';
  }
}

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

function buildParticles() {
  particles.replaceChildren();
  const spec = [
    [-126,-116,1.4,1.65,.12,1.4],[-108,-72,2.0,1.82,.18,1.8],[-92,-24,1.1,1.54,.24,1.3],
    [-80,34,2.3,1.88,.30,1.9],[-64,92,1.3,1.76,.36,1.5],[-44,-132,1.0,1.62,.14,1.2],
    [-38,-58,2.1,1.84,.22,1.7],[-28,6,1.3,1.72,.27,1.4],[-18,74,2.4,1.96,.35,1.9],
    [-6,126,1.1,1.88,.42,1.3],[13,-128,1.4,1.70,.13,1.5],[24,-74,2.2,1.90,.19,1.8],
    [36,-17,1.2,1.66,.26,1.3],[46,48,2.5,1.94,.32,2.0],[58,108,1.3,1.82,.40,1.4],
    [78,-118,1.0,1.70,.16,1.2],[94,-62,2.0,1.86,.23,1.7],[108,-8,1.4,1.72,.29,1.5],
    [122,48,2.2,1.92,.34,1.8],[138,104,1.1,1.84,.44,1.3],[-145,64,1.0,2.05,.38,1.2],
    [148,-88,1.2,2.02,.21,1.3],[-92,136,1.0,2.06,.46,1.2],[94,142,1.2,2.08,.48,1.3]
  ];

  for (const [x,y,s,d,delay,z] of spec) {
    const p = document.createElement('span');
    p.className = 'atelier-particle';
    p.style.setProperty('--x', `${x}px`);
    p.style.setProperty('--y', `${y}px`);
    p.style.setProperty('--s', `${s}px`);
    p.style.setProperty('--d', `${d}s`);
    p.style.setProperty('--delay', `${delay}s`);
    p.style.setProperty('--z', z);
    particles.appendChild(p);
  }
}

async function startMusicFromGesture() {
  if (!CONFIG.musicSrc) return;
  if (!music.src) music.src = CONFIG.musicSrc;

  music.pause();
  try { music.currentTime = 0; } catch (_) {}
  music.volume = 0;

  try {
    await music.play();
    soundToggle.hidden = false;
    soundToggle.classList.remove('is-muted');

    const t0 = performance.now();
    const duration = 1800;
    const ramp = (t) => {
      const p = Math.min(1,(t - t0) / duration);
      music.volume = .50 * (1 - Math.pow(1 - p,3));
      if (p < 1 && !music.paused) requestAnimationFrame(ramp);
    };
    requestAnimationFrame(ramp);
  } catch (_) {
    soundToggle.hidden = true;
  }
}

function showInvitation() {
  invitation.classList.add('is-visible');
  invitation.setAttribute('aria-hidden','false');
}

function openInvitation() {
  if (opening.classList.contains('is-opening')) return;

  clearTimers();
  buildParticles();
  opening.classList.add('is-opening');
  startMusicFromGesture();

  timers.push(setTimeout(showInvitation, 3400));
  timers.push(setTimeout(() => opening.classList.add('is-complete'), 4150));
}

function replayInvitation() {
  clearTimers();

  invitation.classList.remove('is-visible');
  invitation.setAttribute('aria-hidden','true');

  opening.classList.add('restarting');
  opening.classList.remove('is-complete','is-opening');
  particles.replaceChildren();

  music.pause();
  try { music.currentTime = 0; } catch (_) {}
  soundToggle.classList.add('is-muted');

  void opening.offsetHeight;
  opening.classList.remove('restarting');
  void opening.offsetHeight;
  window.scrollTo({top:0,behavior:'auto'});
}

if (atelierFrame && matchMedia('(hover:hover) and (pointer:fine)').matches) {
  atelierFrame.addEventListener('pointermove',(e) => {
    if (opening.classList.contains('is-opening')) return;
    const r = atelierFrame.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width - .5) * 2;
    const py = ((e.clientY - r.top) / r.height - .5) * 2;
    atelierFrame.style.setProperty('--tilt-x', `${(px * 1.4).toFixed(2)}px`);
    atelierFrame.style.setProperty('--tilt-y', `${(py * 1.1).toFixed(2)}px`);
  });
  atelierFrame.addEventListener('pointerleave',() => {
    atelierFrame.style.setProperty('--tilt-x','0px');
    atelierFrame.style.setProperty('--tilt-y','0px');
  });
}

function updateCountdown() {
  const el = $('#countdown');
  const now = new Date();
  const start = new Date(CONFIG.eventStart);
  const diff = start - now;

  if (diff <= -3 * 60 * 60 * 1000) {
    el.textContent = 'Bu güzel gün için teşekkür ederiz.';
    return;
  }
  if (diff <= 0) {
    el.textContent = 'Bugün buluşuyoruz.';
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);

  if (days >= 2) el.textContent = `${days} gün kaldı`;
  else if (days === 1) el.textContent = `1 gün ${hours} saat kaldı`;
  else el.textContent = `${hours} saat kaldı`;
}

openButton.addEventListener('click',openInvitation);
replayButton.addEventListener('click',replayInvitation);

soundToggle.addEventListener('click',async () => {
  if (!music.src) return;

  if (music.paused) {
    await music.play().catch(() => {});
    soundToggle.classList.remove('is-muted');
  } else {
    music.pause();
    soundToggle.classList.add('is-muted');
  }
});

$('#locationBtn').addEventListener('click',() => {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapsQuery)}`;
  window.open(url,'_blank','noopener,noreferrer');
});

$('#calendarBtn').addEventListener('click',() => {
  window.location.href = 'burcu-vural-salihli-dugun.ics';
});

function openRSVP() {
  const saved = localStorage.getItem('burcu-vural-salihli-rsvp');
  $('#rsvpStatus').textContent = saved ? `Seçiminiz: ${saved}` : '';
  rsvpModal.hidden = false;
}

function closeRSVP() {
  rsvpModal.hidden = true;
}

$('#rsvpBtn').addEventListener('click',openRSVP);
$('#rsvpClose').addEventListener('click',closeRSVP);

rsvpModal.addEventListener('click',(e) => {
  if (e.target.matches('[data-close-rsvp]')) closeRSVP();
});

document.querySelectorAll('[data-rsvp]').forEach((btn) => {
  btn.addEventListener('click',() => {
    const value = btn.dataset.rsvp;
    localStorage.setItem('burcu-vural-salihli-rsvp',value);
    $('#rsvpStatus').textContent = `Seçiminiz kaydedildi: ${value}`;
  });
});

window.addEventListener('keydown',(e) => {
  if (e.key === 'Escape' && !rsvpModal.hidden) closeRSVP();
});

hydrateOpeningArtwork();
updateCountdown();
setInterval(updateCountdown,60000);

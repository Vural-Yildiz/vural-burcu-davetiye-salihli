const CONFIG = {
  eventStart: '2026-11-07T14:00:00+03:00',
  eventEnd: '2026-11-07T17:00:00+03:00',
  venue: 'Salihli Öğretmenevi',
  mapsQuery: 'Salihli Öğretmenevi ve Akşam Sanat Okulu, Aksoy Mahallesi Menderes Caddesi No:70, Salihli, Manisa',
  musicSrc: 'videoplayback.m4a' // Repo kökündeki müzik
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
let timers = [];


function waitForImage(img) {
  if (img.complete && img.naturalWidth) return Promise.resolve();
  return new Promise((resolve, reject) => {
    img.addEventListener('load', resolve, { once: true });
    img.addEventListener('error', reject, { once: true });
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
    openingAssetStatus.textContent = 'Daveti açmak için dokunun.';
    openButton.disabled = false;
  }
}

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

function buildParticles() {
  particles.replaceChildren();
  const spec = [
    [-66,-42,2.1,.88,.20],[-51,18,1.4,.98,.24],[-39,-62,1.8,.94,.27],[-22,46,1.1,.86,.19],
    [-8,-57,2.5,1.02,.23],[10,52,1.3,.90,.31],[21,-68,1.5,.98,.18],[36,38,2.0,.92,.26],
    [53,-35,1.2,1.02,.21],[69,8,1.7,.88,.33],[7,-39,1.0,.96,.36],[-4,62,1.4,.91,.34]
  ];
  for (const [x,y,s,d,delay] of spec) {
    const p = document.createElement('span');
    p.className = 'particle';
    p.style.setProperty('--x', `${x}px`);
    p.style.setProperty('--y', `${y}px`);
    p.style.setProperty('--s', `${s}px`);
    p.style.setProperty('--d', `${d}s`);
    p.style.setProperty('--delay', `${delay}s`);
    particles.appendChild(p);
  }
}

async function startMusicFromGesture() {
  if (!CONFIG.musicSrc) return;
  if (!music.src) music.src = CONFIG.musicSrc;
  music.volume = 0;
  try {
    await music.play();
    soundToggle.hidden = false;
    const t0 = performance.now();
    const duration = 1400;
    const ramp = (t) => {
      const p = Math.min(1,(t - t0) / duration);
      music.volume = .58 * (1 - Math.pow(1 - p,3));
      if (p < 1) requestAnimationFrame(ramp);
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

  timers.push(setTimeout(showInvitation, 2850));
  timers.push(setTimeout(() => opening.classList.add('is-complete'), 3460));
}

function replayInvitation() {
  clearTimers();
  invitation.classList.remove('is-visible');
  invitation.setAttribute('aria-hidden','true');
  opening.classList.add('restarting');
  opening.classList.remove('is-complete','is-opening');
  particles.replaceChildren();
  void opening.offsetHeight;
  opening.classList.remove('restarting');
  void opening.offsetHeight;
  window.scrollTo({top:0,behavior:'auto'});
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

openButton.addEventListener('click', openInvitation);
replayButton.addEventListener('click', replayInvitation);

soundToggle.addEventListener('click', async () => {
  if (!music.src) return;
  if (music.paused) {
    await music.play().catch(() => {});
    soundToggle.classList.remove('is-muted');
  } else {
    music.pause();
    soundToggle.classList.add('is-muted');
  }
});

$('#locationBtn').addEventListener('click', () => {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapsQuery)}`;
  window.open(url,'_blank','noopener,noreferrer');
});

$('#calendarBtn').addEventListener('click', () => {
  window.location.href = 'burcu-vural-salihli-dugun.ics';
});

function openRSVP() {
  const saved = localStorage.getItem('burcu-vural-salihli-rsvp');
  $('#rsvpStatus').textContent = saved ? `Seçiminiz: ${saved}` : '';
  rsvpModal.hidden = false;
}
function closeRSVP() { rsvpModal.hidden = true; }
$('#rsvpBtn').addEventListener('click', openRSVP);
$('#rsvpClose').addEventListener('click', closeRSVP);
rsvpModal.addEventListener('click', (e) => {
  if (e.target.matches('[data-close-rsvp]')) closeRSVP();
});
document.querySelectorAll('[data-rsvp]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const value = btn.dataset.rsvp;
    localStorage.setItem('burcu-vural-salihli-rsvp', value);
    $('#rsvpStatus').textContent = `Seçiminiz kaydedildi: ${value}`;
  });
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !rsvpModal.hidden) closeRSVP();
});

hydrateOpeningArtwork();
updateCountdown();
setInterval(updateCountdown, 60000);

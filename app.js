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
let timers = [];


function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

function buildParticles() {
  particles.replaceChildren();
  const spec = [
    [-118,-146,1.5,2.10,.05,1.4],[-92,-104,2.2,1.82,.12,1.8],[-74,-58,1.2,1.55,.18,1.3],
    [-138,-24,1.8,2.24,.22,1.6],[-104,22,2.6,1.86,.28,1.9],[-84,72,1.3,2.06,.32,1.4],
    [-56,118,1.9,2.18,.38,1.7],[-31,-132,1.1,1.72,.10,1.2],[-24,-82,2.4,1.92,.20,1.8],
    [-18,-35,1.4,1.62,.24,1.4],[-8,44,2.1,2.02,.34,1.7],[-4,126,1.2,2.16,.44,1.4],
    [17,-146,1.7,2.08,.08,1.5],[28,-96,2.5,1.78,.16,1.9],[34,-46,1.2,1.62,.22,1.3],
    [44,18,2.0,1.92,.29,1.7],[51,83,1.5,2.12,.38,1.5],[68,132,2.2,2.24,.46,1.8],
    [91,-126,1.2,2.02,.12,1.3],[108,-82,2.1,1.84,.19,1.7],[126,-32,1.4,2.12,.25,1.5],
    [118,28,2.6,1.88,.31,2.0],[104,86,1.3,2.06,.40,1.4],[138,122,1.8,2.26,.48,1.6],
    [-154,-72,1.0,2.30,.26,1.2],[154,-64,1.0,2.30,.30,1.2],[-144,92,1.4,2.18,.42,1.5],
    [146,96,1.5,2.20,.45,1.5],[-66,154,1.2,2.28,.52,1.4],[12,166,1.7,2.34,.54,1.6],
    [82,154,1.1,2.24,.50,1.3],[-20,-166,1.1,2.20,.14,1.2]
  ];
  for (const [x,y,s,d,delay,z] of spec) {
    const p = document.createElement('span');
    p.className = 'particle';
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
  music.volume = 0;
  try {
    await music.play();
    soundToggle.hidden = false;
    const t0 = performance.now();
    const duration = 1900;
    const ramp = (t) => {
      const p = Math.min(1,(t - t0) / duration);
      music.volume = .52 * (1 - Math.pow(1 - p,3));
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

  timers.push(setTimeout(showInvitation, 6900));
  timers.push(setTimeout(() => opening.classList.add('is-complete'), 7480));
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

updateCountdown();
setInterval(updateCountdown, 60000);

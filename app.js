const CONFIG = {
  eventStart: '2026-11-07T14:00:00+03:00',
  eventEnd: '2026-11-07T17:00:00+03:00',
  venue: 'Salihli Öğretmenevi',
  mapsQuery: 'Salihli Öğretmenevi ve Akşam Sanat Okulu, Aksoy Mahallesi Menderes Caddesi No:70, Salihli, Manisa',
  musicSrc: 'videoplayback.m4a',
  filmHoldAt: 3.18
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

let timers = [];
let preludeRAF = 0;
let filmStarted = false;
let filmFinishing = false;

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
  if (preludeRAF) cancelAnimationFrame(preludeRAF);
  preludeRAF = 0;
}

function waitForVideo(video) {
  if (video.readyState >= 2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('video-load'));
    };
    const cleanup = () => {
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('canplay', onReady);
      video.removeEventListener('error', onError);
    };
    video.addEventListener('loadeddata', onReady, { once: true });
    video.addEventListener('canplay', onReady, { once: true });
    video.addEventListener('error', onError, { once: true });
  });
}

function showTapMoment() {
  cinematicIntro.pause();
  try { cinematicIntro.currentTime = CONFIG.filmHoldAt; } catch (_) {}
  opening.classList.add('is-awaiting-tap');
  openButton.hidden = false;
}

async function playPrelude() {
  clearTimers();
  filmStarted = false;
  filmFinishing = false;
  opening.classList.remove('is-opening','is-film-ending','is-complete','is-awaiting-tap');
  openButton.hidden = true;

  try {
    await waitForVideo(cinematicIntro);
    opening.classList.add('film-ready');
    cinematicIntro.muted = true;
    cinematicIntro.playbackRate = 1;
    cinematicIntro.currentTime = 0;

    const playPromise = cinematicIntro.play();
    if (playPromise) await playPromise;

    const watch = () => {
      if (cinematicIntro.currentTime >= CONFIG.filmHoldAt - 0.035) {
        showTapMoment();
        return;
      }
      preludeRAF = requestAnimationFrame(watch);
    };
    preludeRAF = requestAnimationFrame(watch);
  } catch (_) {
    opening.classList.add('film-ready');
    try { cinematicIntro.currentTime = CONFIG.filmHoldAt; } catch (_) {}
    showTapMoment();
  }
}

async function startMusicFromGesture() {
  if (!CONFIG.musicSrc) return;
  if (!music.src) music.src = CONFIG.musicSrc;

  try {
    music.pause();
    music.currentTime = 0;
    music.volume = 0;
    await music.play();
    soundToggle.hidden = false;
    soundToggle.classList.remove('is-muted');

    const t0 = performance.now();
    const duration = 2100;
    const ramp = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      music.volume = .52 * (1 - Math.pow(1 - p, 3));
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

function finishFilm() {
  if (filmFinishing) return;
  filmFinishing = true;
  opening.classList.add('is-film-ending');
  showInvitation();
  timers.push(setTimeout(() => {
    opening.classList.add('is-complete');
  }, 470));
}

async function openInvitation() {
  if (filmStarted) return;
  filmStarted = true;
  clearTimers();

  opening.classList.remove('is-awaiting-tap');
  opening.classList.add('is-opening');
  openButton.hidden = true;

  startMusicFromGesture();

  try {
    cinematicIntro.muted = true;
    if (cinematicIntro.currentTime < CONFIG.filmHoldAt - .12) {
      cinematicIntro.currentTime = CONFIG.filmHoldAt;
    }
    await cinematicIntro.play();
  } catch (_) {
    finishFilm();
    return;
  }

  const remaining = Math.max(0, (cinematicIntro.duration || 9.33) - cinematicIntro.currentTime);
  timers.push(setTimeout(finishFilm, Math.max(900, remaining * 1000 - 140)));
}

cinematicIntro.addEventListener('ended', finishFilm);

function replayInvitation() {
  clearTimers();

  invitation.classList.remove('is-visible');
  invitation.setAttribute('aria-hidden','true');

  music.pause();
  try { music.currentTime = 0; } catch (_) {}
  soundToggle.classList.add('is-muted');

  opening.classList.add('restarting');
  opening.classList.remove('is-complete','is-opening','is-film-ending','is-awaiting-tap');
  cinematicIntro.pause();
  try { cinematicIntro.currentTime = 0; } catch (_) {}

  void opening.offsetHeight;
  opening.classList.remove('restarting');

  window.scrollTo({top:0,behavior:'auto'});
  playPrelude();
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

function closeRSVP() {
  rsvpModal.hidden = true;
}

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

document.addEventListener('visibilitychange', () => {
  if (document.hidden && !cinematicIntro.paused && !filmStarted) {
    cinematicIntro.pause();
  } else if (!document.hidden && !filmStarted && !opening.classList.contains('is-awaiting-tap')) {
    playPrelude();
  }
});

updateCountdown();
setInterval(updateCountdown, 60000);
playPrelude();

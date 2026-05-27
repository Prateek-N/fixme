// App shell: tab + viewport routing, tweaks, persistence

const SCREENS = {
  landing:    { m: typeof landingMobile    !== 'undefined' ? landingMobile    : null, d: typeof landingDesktop    !== 'undefined' ? landingDesktop    : null },
  upload:     { m: typeof uploadMobile     !== 'undefined' ? uploadMobile     : null, d: typeof uploadDesktop     !== 'undefined' ? uploadDesktop     : null },
  processing: { m: typeof processingMobile !== 'undefined' ? processingMobile : null, d: typeof processingDesktop !== 'undefined' ? processingDesktop : null },
  txn:        { m: typeof txnMobile        !== 'undefined' ? txnMobile        : null, d: typeof txnDesktop        !== 'undefined' ? txnDesktop        : null },
  insights:   { m: typeof insightsMobile   !== 'undefined' ? insightsMobile   : null, d: typeof insightsDesktop   !== 'undefined' ? insightsDesktop   : null },
  system:     { m: typeof systemNotes      !== 'undefined' ? systemNotes      : null, d: typeof systemNotes       !== 'undefined' ? systemNotes       : null }
};

const state = {
  tab: localStorage.getItem('fmf.tab') || 'landing',
  vp: localStorage.getItem('fmf.vp') || 'mobile'
};

const stage = document.getElementById('stage');

function render() {
  const src = SCREENS[state.tab];
  if (!src) { stage.innerHTML = '<div class="notes">Screen missing.</div>'; return; }
  const html = state.vp === 'mobile' ? src.m : src.d;
  stage.innerHTML = typeof html === 'function' ? html() : (html || '<div class="notes">No variation for this viewport yet.</div>');
  // re-run any inline step animations
  document.querySelectorAll('[data-animate-steps]').forEach(el => animateSteps(el));
  applyPersona();
}

function setTab(t) {
  state.tab = t;
  localStorage.setItem('fmf.tab', t);
  document.querySelectorAll('#tabs .tab').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
  render();
}
function setVp(v) {
  state.vp = v;
  localStorage.setItem('fmf.vp', v);
  document.querySelectorAll('#vpSwitch button').forEach(b => b.classList.toggle('active', b.dataset.vp === v));
  render();
}

// init tabs
document.querySelectorAll('#tabs .tab').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
document.querySelectorAll('#vpSwitch button').forEach(b => b.addEventListener('click', () => setVp(b.dataset.vp)));

// Tweaks
const tweaksToggle = document.getElementById('tweaksToggle');
const tweaksPanel = document.getElementById('tweaksPanel');
tweaksToggle.addEventListener('click', () => { tweaksPanel.classList.remove('hidden'); tweaksToggle.classList.add('hidden'); });
document.getElementById('tweaksClose').addEventListener('click', () => { tweaksPanel.classList.add('hidden'); tweaksToggle.classList.remove('hidden'); });

// accent
document.querySelectorAll('#accentSwatches .sw').forEach(s => s.addEventListener('click', () => {
  document.querySelectorAll('#accentSwatches .sw').forEach(x => x.classList.remove('active'));
  s.classList.add('active');
  document.documentElement.style.setProperty('--blue', s.dataset.accent);
  // derive a soft version
  document.documentElement.style.setProperty('--blue-soft', hexToSoft(s.dataset.accent));
  localStorage.setItem('fmf.accent', s.dataset.accent);
}));
// paper
document.querySelectorAll('#paperSwatches .sw').forEach(s => s.addEventListener('click', () => {
  document.querySelectorAll('#paperSwatches .sw').forEach(x => x.classList.remove('active'));
  s.classList.add('active');
  if (s.dataset.dark) {
    document.documentElement.style.setProperty('--paper', '#151227');
    document.documentElement.style.setProperty('--paper-2', '#0E0B1F');
    document.documentElement.style.setProperty('--paper-3', '#1E1A36');
    document.documentElement.style.setProperty('--ink', '#F4F2E8');
    document.documentElement.style.setProperty('--ink-2', '#C8C4F0');
    document.documentElement.style.setProperty('--muted', '#8f8caa');
    document.documentElement.style.setProperty('--line', '#F4F2E8');
    document.documentElement.style.setProperty('--line-soft', '#6a6690');
    document.body.style.background = '#080616';
  } else {
    document.documentElement.style.setProperty('--paper', s.dataset.paper);
    document.documentElement.style.setProperty('--paper-2', shade(s.dataset.paper, -4));
    document.documentElement.style.setProperty('--paper-3', shade(s.dataset.paper, -8));
    document.documentElement.style.setProperty('--ink', '#080616');
    document.documentElement.style.setProperty('--ink-2', '#1A1953');
    document.documentElement.style.setProperty('--muted', '#6a6a6a');
    document.documentElement.style.setProperty('--line', '#222');
    document.documentElement.style.setProperty('--line-soft', '#999');
    document.body.style.background = '';
  }
}));

// persona
document.getElementById('personaTone').addEventListener('change', e => {
  localStorage.setItem('fmf.persona', e.target.value);
  applyPersona();
});
// annotations
document.getElementById('annotToggle').addEventListener('change', e => {
  document.body.classList.toggle('no-annot', e.target.value === 'off');
  localStorage.setItem('fmf.annot', e.target.value);
});

function applyPersona() {
  const tone = document.getElementById('personaTone')?.value || 'gentle';
  const titles = {
    playful: { t: 'The Foodie 🍜', s: 'You spend like a food-court mayor. Not bad, just… spicy.' },
    gentle:  { t: 'You love good food', s: '4 in 10 rupees went to eating out and delivery.' },
    blunt:   { t: 'Food is eating your salary', s: '42% of your spend. That is a lot.' }
  };
  const v = titles[tone];
  document.querySelectorAll('[data-persona-title]').forEach(el => el.textContent = v.t);
  document.querySelectorAll('[data-persona-sub]').forEach(el => el.textContent = v.s);
}

// Utils
function hexToSoft(hex) {
  const rgb = [1,3,5].map(i => parseInt(hex.substr(i,2),16));
  return `rgba(${rgb.join(',')},0.12)`;
}
function shade(hex, amt) {
  const rgb = [1,3,5].map(i => Math.max(0, Math.min(255, parseInt(hex.substr(i,2),16) + amt)));
  return '#' + rgb.map(x => x.toString(16).padStart(2,'0')).join('');
}

function animateSteps(el) {
  const steps = el.querySelectorAll('.step');
  if (!steps.length) return;
  let i = parseInt(el.dataset.animateSteps || '1', 10);
  if (i >= steps.length) return;
  setInterval(() => {
    steps.forEach((s, idx) => {
      s.classList.toggle('done', idx < i);
      s.classList.toggle('active', idx === i);
    });
    i = (i + 1) % (steps.length + 1);
  }, 1400);
}

// initial paint
const savedAccent = localStorage.getItem('fmf.accent');
if (savedAccent) {
  const sw = document.querySelector(`#accentSwatches .sw[data-accent="${savedAccent}"]`);
  if (sw) sw.click();
}
const savedPersona = localStorage.getItem('fmf.persona');
if (savedPersona) document.getElementById('personaTone').value = savedPersona;
const savedAnnot = localStorage.getItem('fmf.annot');
if (savedAnnot) { document.getElementById('annotToggle').value = savedAnnot; document.body.classList.toggle('no-annot', savedAnnot === 'off'); }

setTab(state.tab);
setVp(state.vp);

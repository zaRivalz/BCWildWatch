/**
 * main.js — BC WildWatch SPA controller
 *
 * Responsibilities:
 *  1. Check SWA built-in auth state via /.auth/me
 *  2. Show login screen or main app accordingly
 *  3. Render navbar + view routing
 *  4. Load animal list from /api/get-animals and render picker grid
 *
 * No external dependencies. ES2020 module syntax.
 */

// ── Emoji map for known animal names (case-insensitive prefix match) ──────────
const ANIMAL_EMOJIS = {
  snake:      '🐍',
  bee:        '🐝',
  wasp:       '🐝',
  dog:        '🐕',
  cat:        '🐈',
  bird:       '🦅',
  crow:       '🐦',
  pigeon:     '🐦',
  monkey:     '🐒',
  baboon:     '🐒',
  spider:     '🕷️',
  scorpion:   '🦂',
  rat:        '🐀',
  mouse:      '🐭',
  mongoose:   '🦡',
  rabbit:     '🐇',
  squirrel:   '🐿️',
  lizard:     '🦎',
  gecko:      '🦎',
  frog:       '🐸',
  toad:       '🐸',
  insect:     '🦟',
  mosquito:   '🦟',
  cockroach:  '🪳',
  other:      '❓',
  unknown:    '❓',
};

function getEmoji(animalName = '') {
  const key = Object.keys(ANIMAL_EMOJIS).find(k =>
    animalName.toLowerCase().includes(k)
  );
  return key ? ANIMAL_EMOJIS[key] : '🐾';
}

// ── Auth check ────────────────────────────────────────────────────────────────
async function getAuthUser() {
  try {
    const res = await fetch('/.auth/me');
    if (!res.ok) return null;
    const data = await res.json();
    // SWA returns { clientPrincipal: {...} | null }
    return data?.clientPrincipal ?? null;
  } catch {
    return null;
  }
}

function getClaimValue(claims = [], typName) {
  return claims.find(c => c.typ === typName)?.val ?? '';
}

// ── View router ───────────────────────────────────────────────────────────────
const views = {
  home:    document.getElementById('view-home'),
  report:  document.getElementById('view-report'),
  map:     document.getElementById('view-map'),
  chatbot: document.getElementById('view-chatbot'),
};

const navBtns = document.querySelectorAll('.nav-btn[data-view]');

function showView(name) {
  Object.values(views).forEach(v => v?.classList.remove('active'));
  navBtns.forEach(b => b.classList.remove('active'));

  if (views[name]) {
    views[name].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const activeBtn = document.querySelector(`.nav-btn[data-view="${name}"]`);
  if (activeBtn) activeBtn.classList.add('active');
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.view));
});

// ── Animal grid ───────────────────────────────────────────────────────────────
let animals = []; // populated from API

async function loadAnimals() {
  const grid = document.getElementById('animal-grid');
  try {
    const res = await fetch('/api/get-animals');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    animals = await res.json();
    renderAnimalGrid(animals);
  } catch (err) {
    grid.innerHTML = `
      <div class="animal-grid-loading">
        <p style="color:var(--clr-danger)">⚠️ Could not load animals (${err.message}).</p>
        <button class="btn btn-secondary btn-sm" onclick="loadAnimals()">Retry</button>
      </div>`;
  }
}

function renderAnimalGrid(list) {
  const grid = document.getElementById('animal-grid');
  if (!list.length) {
    grid.innerHTML = '<div class="animal-grid-loading"><p>No animals found in the database.</p></div>';
    return;
  }

  grid.innerHTML = list.map(a => `
    <button
      class="animal-card"
      data-id="${a.id}"
      data-name="${escHtml(a.name)}"
      type="button"
      aria-label="Report a ${escHtml(a.name)}"
    >
      <span class="animal-emoji" aria-hidden="true">${getEmoji(a.name)}</span>
      <span class="animal-label">${escHtml(a.name)}</span>
    </button>
  `).join('');

  grid.querySelectorAll('.animal-card').forEach(card => {
    card.addEventListener('click', () => selectAnimal(card.dataset.id, card.dataset.name));
  });
}

// ── Animal selection → open report form ───────────────────────────────────────
export function selectAnimal(id, name) {
  // Expose on window so report.js can read it
  window.__selectedAnimal = { id, name };

  const pill = document.getElementById('selected-animal-pill');
  document.getElementById('selected-animal-icon').textContent = getEmoji(name);
  document.getElementById('selected-animal-name').textContent = name;
  pill.classList.remove('hidden');

  // Reset form state (report.js listens for this event)
  document.dispatchEvent(new CustomEvent('animal:selected', { detail: { id, name } }));

  showView('report');
}

// ── "Other" button ─────────────────────────────────────────────────────────────
document.getElementById('btn-other-animal')?.addEventListener('click', () => {
  selectAnimal('OTHER', 'Other / Unknown');
});

// ── "Back" button on report form ─────────────────────────────────────────────
document.getElementById('btn-back-to-home')?.addEventListener('click', () => showView('home'));

// ── "Change" animal pill button ────────────────────────────────────────────────
document.getElementById('btn-change-animal')?.addEventListener('click', () => showView('home'));

// ── Dev bypass ────────────────────────────────────────────────────────────────
const DEV_BYPASS_KEY = 'bcw_dev_bypass';

document.getElementById('btn-dev-bypass')?.addEventListener('click', () => {
  sessionStorage.setItem(DEV_BYPASS_KEY, '1');
  launchApp({ name: 'Dev User', email: 'dev@belgiumcampus.ac.za' });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function boot() {
  // Check for active dev bypass first (persists for the browser tab session)
  if (sessionStorage.getItem(DEV_BYPASS_KEY)) {
    launchApp({ name: 'Dev User', email: 'dev@belgiumcampus.ac.za' });
    return;
  }

  const user = await getAuthUser();

  if (!user) {
    // Not logged in — show landing page
    document.getElementById('landing').classList.remove('hidden');
    return;
  }

  // Validate tenant domain as a client-side guard
  // (The staticwebapp.config.json issuer is the authoritative gate)
  const email = getClaimValue(user.claims, 'preferred_username') ||
                getClaimValue(user.claims, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress');

  if (email && !email.toLowerCase().endsWith('@belgiumcampus.ac.za')) {
    // Redirect to logout — wrong tenant somehow bypassed the issuer check
    window.location.href = '/logout';
    return;
  }

  const name = getClaimValue(user.claims, 'name') || email || 'U';
  launchApp({ name, email });
}

function launchApp({ name, email }) {
  // Populate user avatar
  const avatarEl = document.getElementById('user-avatar');
  if (avatarEl) {
    avatarEl.textContent = (name || email || 'U').charAt(0).toUpperCase();
    avatarEl.title = name || email || '';
  }

  // Show app shell
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  showView('home');
  loadAnimals();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Kick off
boot();

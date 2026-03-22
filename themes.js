// ═══════════════════════════════════════════════════════
// THEMES.JS — Theme Switcher (Sitewide)
// ═══════════════════════════════════════════════════════

const THEMES = [
  { id: 'dark',  label: 'Dark',  desc: 'Classic dark',      swatch: 'dark'  },
  { id: 'light', label: 'Light', desc: 'Clean & bright',    swatch: 'light' },
  { id: 'mixed', label: 'Mixed', desc: 'Dark nav + light',  swatch: 'mixed' },
  { id: 'blue',  label: 'Blue',  desc: 'Deep ocean blue',   swatch: 'blue'  },
];

function getTheme() {
  return localStorage.getItem('dm_theme') || 'dark';
}

function applyTheme(themeId) {
  document.documentElement.setAttribute('data-theme', themeId);
  localStorage.setItem('dm_theme', themeId);
  updateThemePanel(themeId);
}

function updateThemePanel(themeId) {
  document.querySelectorAll('.theme-option').forEach(el => {
    el.classList.toggle('selected', el.dataset.theme === themeId);
  });
}

function toggleThemePanel() {
  const panel = document.getElementById('theme-panel');
  if (panel) panel.classList.toggle('open');
}

function injectThemeSwitcher() {
  if (document.getElementById('theme-switcher')) return;
  const switcher = document.createElement('div');
  switcher.className = 'theme-switcher';
  switcher.id = 'theme-switcher';
  switcher.innerHTML = `
    <div class="theme-panel" id="theme-panel">
      <div class="theme-panel-title">🎨 Choose Theme</div>
      ${THEMES.map(t => `
        <div class="theme-option ${getTheme()===t.id?'selected':''}"
             data-theme="${t.id}" onclick="applyTheme('${t.id}')">
          <div class="theme-swatch ${t.swatch}"></div>
          <div class="theme-label">${t.label}<small>${t.desc}</small></div>
          <span class="theme-check">✓</span>
        </div>`).join('')}
    </div>
    <button class="theme-toggle-btn" onclick="toggleThemePanel()" title="Change Theme">🎨</button>
  `;
  document.body.appendChild(switcher);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.theme-switcher')) {
      document.getElementById('theme-panel')?.classList.remove('open');
    }
  });
}

// ── Apply on ALL pages immediately ──
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(getTheme());
  injectThemeSwitcher();
});

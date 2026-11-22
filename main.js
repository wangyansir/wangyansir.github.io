const root = document.documentElement;
const english = root.lang === 'en';
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
let selectedTheme;
try { selectedTheme = localStorage.getItem('haoyan-theme'); } catch {}
function setTheme(theme) {
  root.dataset.theme = theme;
  const button = document.querySelector('[data-theme-toggle]');
  if (button) {
    button.setAttribute('aria-label', english
      ? (theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme')
      : (theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'));
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  }
}
setTheme(selectedTheme || (systemTheme.matches ? 'dark' : 'light'));
document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
  selectedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('haoyan-theme', selectedTheme); } catch {}
  setTheme(selectedTheme);
});
systemTheme.addEventListener('change', event => {
  if (!selectedTheme) setTheme(event.matches ? 'dark' : 'light');
});
document.querySelectorAll('.language-switch').forEach(link => {
  link.addEventListener('click', () => {
    link.hash = location.hash;
    if (document.body.classList.contains('homepage')) {
      const open = [...document.querySelectorAll('.work-entry')].filter(entry => entry.querySelector('details[open]')).map(entry => entry.id);
      const method = [...document.querySelectorAll('.work-entry')].filter(entry => entry.querySelector('[data-visual-toggle][aria-pressed="true"]')).map(entry => entry.id);
      try { sessionStorage.setItem('haoyan-language-state', JSON.stringify({ open, method })); } catch {}
    }
  });
});

document.querySelectorAll('[data-visual-toggle]').forEach(button => {
  let pinned = false;
  let hovered = false;
  const caption = button.closest('figure').querySelector('[data-visual-caption]');
  const enlarge = button.closest('figure').querySelector('.image-caption a');
  const render = () => {
    button.classList.toggle('show-method', pinned || hovered);
    button.setAttribute('aria-pressed', String(pinned));
    caption.textContent = pinned || hovered ? button.dataset.captionMethod : button.dataset.captionOverview;
    enlarge.href = button.querySelector(pinned || hovered ? '.visual-method' : '.visual-overview').src;
  };
  button.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') { hovered = true; render(); }
  });
  button.addEventListener('pointerleave', () => { hovered = false; render(); });
  button.addEventListener('click', () => { pinned = !pinned; render(); });
});
document.querySelectorAll('.contribution').forEach(details => {
  details.addEventListener('toggle', () => {
    const label = details.querySelector('.expand-label');
    label.textContent = details.open ? label.dataset.openLabel : label.dataset.closedLabel;
  });
});
if (document.body.classList.contains('homepage')) {
  try {
    const state = JSON.parse(sessionStorage.getItem('haoyan-language-state') || 'null');
    sessionStorage.removeItem('haoyan-language-state');
    for (const id of state?.open || []) {
      const details = document.getElementById(id)?.querySelector('details');
      if (details) details.open = true;
    }
    for (const id of state?.method || []) document.getElementById(id)?.querySelector('[data-visual-toggle]')?.click();
  } catch {}
}
const links = [...document.querySelectorAll('.topbar-nav a[href^="#"]')];
const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if (sections.length) {
  const visible = new Map();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => visible.set(entry.target.id, entry.isIntersecting));
    const active = sections.find(section => visible.get(section.id));
    if (!active) return;
    links.forEach(link => {
      if (link.hash === '#' + active.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-60px 0px -55% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
  links.forEach(link => link.addEventListener('click', () => {
    links.forEach(other => other.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'location');
  }));
}

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const worldContext = {
  space: ['ORBITAL SYSTEM', 'SPACE / 01']
};
window.applyAppWorld = next => {
  const selected = worldContext[next] ? next : 'space';
  document.body.dataset.world = selected;
  const name = document.getElementById('world-context-name');
  const code = document.getElementById('world-context-code');
  if (name) name.textContent = worldContext[selected][0];
  if (code) code.textContent = worldContext[selected][1];
  document.querySelectorAll('main section').forEach(section => {
    section.classList.remove('world-transition');
    requestAnimationFrame(() => section.classList.add('world-transition'));
  });
};
window.applyAppWorld('space');
const heroLede = document.querySelector('.hero-lede');
if (heroLede) heroLede.textContent = "I'm Ibrahim, a frontend and full-stack developer at AiTech. I build production dashboards, real-time interfaces, and complete MERN applications - from interaction design and state architecture to APIs, data models, and deployment.";
const heroFootnote = document.querySelector('.hero-footnote span:last-child');
if (heroFootnote) heroFootnote.textContent = 'FRONTEND ENGINEERING · FULL-STACK DELIVERY · REAL-TIME SYSTEMS';
const dashboardCounter = document.querySelector('.signal-strip strong:not([data-count])');
if (dashboardCounter) { dashboardCounter.dataset.count = '30'; dashboardCounter.textContent = '0–40'; }
menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.project-card');
filters.forEach(filter => filter.addEventListener('click', () => {
  filters.forEach(item => item.classList.remove('active'));
  filters.forEach(item => item.setAttribute('aria-pressed', 'false'));
  filter.classList.add('active');
  filter.setAttribute('aria-pressed', 'true');
  const selected = filter.dataset.filter;
  cards.forEach(card => {
    card.hidden = selected !== 'all' && card.dataset.kind !== selected;
  });
}));
document.getElementById('year').textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.project-card, .experience-card, .principles article, .tool-group, .section-heading').forEach((element, index) => {
  element.classList.add('reveal');
  element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 80}ms`);
  revealObserver.observe(element);
});

const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const counter = entry.target;
    const target = Number(counter.dataset.count);
    const suffix = target === 2 || target === 600 ? '+' : '';
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / 1100, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    observer.unobserve(counter);
  });
}, { threshold: 0.8 });
counters.forEach(counter => counterObserver.observe(counter));

document.querySelectorAll('.project-visual, .hero-visual').forEach(card => {
  card.addEventListener('pointermove', event => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty('--tilt-x', `${y * -5}deg`);
    card.style.setProperty('--tilt-y', `${x * 5}deg`);
  });
  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  });
});

const scene = document.querySelector('.scene-3d');
scene?.addEventListener('pointermove', event => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const bounds = scene.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  scene.style.setProperty('--scene-x', `${x * 16}deg`);
  scene.style.setProperty('--scene-y', `${y * -12}deg`);
});
scene?.addEventListener('pointerleave', () => {
  scene.style.setProperty('--scene-x', '0deg');
  scene.style.setProperty('--scene-y', '0deg');
});

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
if (window.scrollX !== 0) window.scrollTo({ left: 0, top: window.scrollY, behavior: 'auto' });
document.documentElement.scrollLeft = 0;
document.body.scrollLeft = 0;
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
const verifiedProjectCopy = [
  {
    title: 'AiTech GenAI Platform',
    description: 'A suite of practical GenAI products for business: Customer Service Chatbots, Intelligent Knowledge Hub, Competitor Analysis, Media Listening, Deep Meeting, AiTech Compass, Applicant Tracking, and Smart Tech Advisor. AiTech also provides SaaS certifications and courses across different fields.'
  },
  {
    title: 'Drosat',
    description: 'An online education platform for primary, preparatory, and secondary curricula, with structured video lessons, post-lesson tests, step-by-step parent progress tracking, and interactive learning games in Arabic and English. It also supports Android and iOS learning experiences.',
    tags: ['Vue.js', 'Bootstrap', 'Arabic / English', 'EdTech']
  },
  {
    title: 'Kuttab Online',
    description: 'A free learning platform for Quran recitation, memorization, Arabic language, and Hadith studies. It combines expert-led learning with an engaging, personalized experience that helps learners deepen their understanding of Islam and the Quran.',
    tags: ['Nuxt.js', 'Tailwind CSS', 'Islamic Education']
  },
  {
    title: 'AI Business Assistant',
    description: 'A multi-tenant AI workspace with a multimodal RAG engine for PDFs, Word and Excel files, images, audio, video, and links. It supports a public chatbot alongside a private owner advisory workspace, with hash-based duplicate detection, hybrid OCR/VLM extraction, isolated sessions, persistent workspaces, RBAC, OpenAI and internal AI APIs, Telegram and Gmail channels, three subscription tiers, and Vitest coverage for core RAG and API flows.',
    tags: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Multimodal RAG', 'Vitest']
  }
];
verifiedProjectCopy.forEach(project => {
  const card = [...cards].find(item => item.querySelector('.project-info h3')?.textContent.trim().startsWith(project.title));
  if (!card) return;
  const description = card.querySelector('.project-info p');
  if (description) description.textContent = project.description;
  if (project.tags) {
    const tagList = card.querySelector('.tags');
    if (tagList) tagList.innerHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');
  }
});
const vizrCard = [...document.querySelectorAll('.project-card')].find(card => card.querySelector('.project-info h3')?.textContent.trim().startsWith('Vizr'));
if (vizrCard) {
  const title = vizrCard.querySelector('.project-info h3');
  const link = title?.querySelector('a');
  if (title) {
    title.textContent = 'AI Business Assistant Platform - Vizr';
    if (link) title.append(' ', link);
  }
  const meta = vizrCard.querySelector('.project-meta');
  if (meta) meta.innerHTML = '<span>INDEPENDENT PROJECT</span><span>01 — MERN + AI PLATFORM</span>';
  const description = vizrCard.querySelector('.project-info p');
  if (description) description.textContent = 'A multimodal AI business assistant that accepts PDFs, Word, Excel, images, audio, video, and links. Vizr combines a public chatbot with a private owner advisory workspace, isolated user sessions, persistent workspaces, RAG retrieval, OpenAI and internal AI APIs, Telegram and Gmail channels, and subscription billing.';
  const tags = vizrCard.querySelector('.tags');
  if (tags) tags.innerHTML = ['React', 'TypeScript', 'Node.js', 'AI API', 'MongoDB', 'Multimodal RAG'].map(tag => `<span>${tag}</span>`).join('');
}
const duplicateAssistant = [...document.querySelectorAll('.project-card')].find(card => card !== vizrCard && card.querySelector('.project-info h3')?.textContent.trim().startsWith('AI Business Assistant'));
if (duplicateAssistant) duplicateAssistant.remove();
const ecommerceCard = [...document.querySelectorAll('.project-card')].find(card => card.querySelector('.project-info h3')?.textContent.trim().startsWith('Brand Mongo'));
if (ecommerceCard) {
  const title = ecommerceCard.querySelector('.project-info h3');
  const link = title?.querySelector('a');
  if (title) {
    title.textContent = 'Brand E-commerce';
    if (link) title.append(' ', link);
  }
}
const projectNumbers = {
  'AI Business Assistant Platform - Vizr': '01 — MERN + AI PLATFORM',
  'Brand E-commerce': '02 — E-COMMERCE',
  'AiTech GenAI Platform': '03 — SAAS ECOSYSTEM',
  'Drosat': '04 — EDTECH SAAS',
  'Kuttab Online': '05 — LEARNING SAAS',
  'Applicant Tracking System': '06 — ATS',
  'Deep Meeting Analyzer': '07 — REAL-TIME',
  'Safety Monitoring System': '08 — MONITORING'
};
document.querySelectorAll('.project-card').forEach(card => {
  const heading = card.querySelector('.project-info h3')?.childNodes[0]?.textContent.trim();
  const number = projectNumbers[heading];
  const meta = card.querySelector('.project-meta');
  if (number && meta?.lastElementChild) meta.lastElementChild.textContent = number;
});
const repositoryLinks = {
  'AI Business Assistant Platform - Vizr': [
    ['Frontend GitHub', 'https://github.com/Ibrahemyoussef2020/chatbot-vizr-frontend'],
    ['Backend GitHub', 'https://github.com/Ibrahemyoussef2020/chatbot-vizr-backend']
  ],
  'Brand E-commerce': [
    ['GitHub repository', 'https://github.com/Ibrahemyoussef2020/brand-mongo']
  ]
};
document.querySelectorAll('.project-card').forEach(card => {
  const heading = card.querySelector('.project-info h3')?.childNodes[0]?.textContent.trim();
  const links = repositoryLinks[heading];
  if (!links) return;
  const info = card.querySelector('.project-info');
  if (!info || info.querySelector('.project-links')) return;
  const linkRow = document.createElement('div');
  linkRow.className = 'project-links';
  linkRow.innerHTML = links.map(([label, url]) => `<a href="${url}" target="_blank" rel="noreferrer">${label} ↗</a>`).join('');
  info.append(linkRow);
});
const allFilterCount = document.querySelector('.filter[data-filter="all"] span');
if (allFilterCount) allFilterCount.textContent = '08';
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

document.querySelectorAll('.project-card, .experience-card, .skill-card, .principles article, .tool-group, .section-heading').forEach((element, index) => {
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

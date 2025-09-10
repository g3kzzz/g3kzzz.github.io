// Theme handling
const html = document.documentElement;
const btnTheme = document.getElementById('theme-toggle');
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav-links');
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

function applyTheme(pref){
  html.setAttribute('data-theme', pref);
  btnTheme && (btnTheme.textContent = (pref === 'light') ? '🌙' : '☀️');
}
function getSystemTheme(){
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
const saved = localStorage.getItem('theme') || 'system';
applyTheme(saved === 'system' ? getSystemTheme() : saved);
if (btnTheme){
  btnTheme.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = (current === 'dark') ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });
}

// Hamburger
if (hamburger && nav){
  hamburger.addEventListener('click', () => nav.classList.toggle('open'));
}

// Filtering + rendering
const grid = document.getElementById('grid');
const searchEl = document.getElementById('search');
const catEl = document.getElementById('category');
const tagsEl = document.getElementById('tags');
const emptyEl = document.getElementById('empty');

let POSTS = [];
let TAGS = new Set();
let CATS = new Set();
let ACTIVE_TAGS = new Set();

function cardTemplate(p){
  const url = p.url;
  const t = `
  <article class="card">
    <a href="${url}">
      <img class="thumb" loading="lazy" src="${p.cover}" alt="Cover for ${p.title}">
    </a>
    <div class="body">
      <a class="title" href="${url}">${p.title}</a>
      <div class="meta">
        <time>${p.date_pretty}</time>
        <span>&middot;</span>
        <span>${p.reading_time}</span>
      </div>
      <p>${p.summary || ''}</p>
      <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">#${t}</span>`).join('')}</div>
    </div>
  </article>`;
  return t;
}

function render(){
  const q = (searchEl?.value || '').toLowerCase().trim();
  const cat = catEl?.value || '';
  const activeTagList = [...ACTIVE_TAGS];
  const items = POSTS.filter(p => {
    const hitQ = !q || (p.title.toLowerCase().includes(q) || (p.summary||'').toLowerCase().includes(q) || (p.tags||[]).join(' ').toLowerCase().includes(q));
    const hitC = !cat || (p.categories||[]).includes(cat);
    const hitT = activeTagList.length === 0 || activeTagList.every(t => (p.tags||[]).includes(t));
    return hitQ && hitC && hitT;
  }).sort((a,b) => {
    const s = document.getElementById('sort')?.value || 'date-desc';
    if (s === 'date-asc') return a.date_raw.localeCompare(b.date_raw);
    if (s === 'title-asc') return a.title.localeCompare(b.title);
    if (s === 'title-desc') return b.title.localeCompare(a.title);
    return b.date_raw.localeCompare(a.date_raw); // date-desc
  });

  grid.innerHTML = items.map(cardTemplate).join('');
  emptyEl.hidden = items.length !== 0;
}

function buildFilters(){
  // categories
  const cats = [...CATS].sort();
  if (catEl){
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      catEl.appendChild(opt);
    });
  }
  // tags
  if (tagsEl){
    tagsEl.innerHTML = [...TAGS].sort().map(t => `<button class="tag-chip" data-tag="${t}">#${t}</button>`).join('');
    tagsEl.querySelectorAll('.tag-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.getAttribute('data-tag');
        if (ACTIVE_TAGS.has(tag)) { ACTIVE_TAGS.delete(tag); btn.classList.remove('active'); }
        else { ACTIVE_TAGS.add(tag); btn.classList.add('active'); }
        render();
      });
    });
  }
}

async function bootstrap(){
  try{
    const res = await fetch('assets/posts.json?v=' + Date.now());
    const data = await res.json();
    POSTS = data.posts || [];
    POSTS.forEach(p => {
      (p.tags||[]).forEach(t => TAGS.add(t));
      (p.categories||[]).forEach(c => CATS.add(c));
    });
    buildFilters();
    render();
  }catch(e){
    console.error('Failed to load posts.json', e);
  }
}

['input','change'].forEach(ev => {
  searchEl?.addEventListener(ev, render);
  catEl?.addEventListener(ev, render);
  document.getElementById('sort')?.addEventListener(ev, render);
});

bootstrap();

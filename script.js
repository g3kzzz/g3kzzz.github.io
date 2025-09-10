
// Simple static-site loader for GitHub Pages without server-side support.
// Loads writeups listed in writeups/index.json
const INDEX_URL = 'writeups/index.json';
const cards = document.getElementById('cards');
const tpl = document.getElementById('cardTpl');
const tagContainer = document.getElementById('tagContainer');
const searchInput = document.getElementById('search');
const themeToggle = document.getElementById('themeToggle');

let writeups = [];
let activeTag = null;

// init
document.getElementById('year').textContent = new Date().getFullYear();

// theme
const saved = localStorage.getItem('theme');
if(saved==='light') document.body.classList.add('light'), themeToggle.textContent='🌞';
themeToggle.addEventListener('click', ()=>{
  document.body.classList.toggle('light');
  const mode = document.body.classList.contains('light') ? 'light' : 'dark';
  localStorage.setItem('theme', mode);
  themeToggle.textContent = mode==='light' ? '🌞' : '🌙';
});

async function loadIndex(){
  try{
    const r = await fetch(INDEX_URL);
    writeups = await r.json();
    // sort by date desc
    writeups.sort((a,b)=> new Date(b.date)-new Date(a.date));
    renderTags();
    renderCards(writeups);
  }catch(e){
    cards.innerHTML='<p class="muted">Failed to load writeups index. Make sure writeups/index.json exists.</p>';
    console.error(e);
  }
}

function renderTags(){
  const all = new Set();
  writeups.forEach(w=> w.tags.forEach(t=> all.add(t)));
  tagContainer.innerHTML='';
  const a = document.createElement('button');
  a.textContent = 'All';
  a.className='tag';
  a.onclick = ()=>{ activeTag=null; renderCards(writeups); };
  tagContainer.appendChild(a);
  Array.from(all).sort().forEach(t=>{
    const btn = document.createElement('button');
    btn.className='tag';
    btn.textContent = t;
    btn.onclick = ()=>{ activeTag = t; renderCards(writeups.filter(w=> w.tags.includes(t))); };
    tagContainer.appendChild(btn);
  });
}

function renderCards(list){
  cards.innerHTML='';
  const q = searchInput.value.trim().toLowerCase();
  const filtered = list.filter(w=>{
    if(!q) return true;
    return (w.machine + ' ' + w.title + ' ' + w.description + ' ' + w.tags.join(' ')).toLowerCase().includes(q);
  });
  if(filtered.length===0) cards.innerHTML='<p class="muted">No writeups found. Add some to writeups/index.json and the writeups folder.</p>';
  filtered.forEach(w=>{
    const node = tpl.content.cloneNode(true);
    node.querySelector('.machine').textContent = w.machine + ' — ' + w.title;
    node.querySelector('.date').textContent = new Date(w.date).toLocaleDateString();
    node.querySelector('.desc').textContent = w.description;
    node.querySelector('.readtime').textContent = w.readtime ? (w.readtime + ' min read') : '';
    const tagList = node.querySelector('.tagList');
    w.tags.forEach(t=>{
      const span = document.createElement('button');
      span.className='tag';
      span.textContent = '🔖 ' + t;
      span.onclick = ()=>{ activeTag = t; renderCards(writeups.filter(x=> x.tags.includes(t))); };
      tagList.appendChild(span);
    });
    const open = node.querySelector('.open');
    open.href = 'writeup.html?file=' + encodeURIComponent(w.file);
    cards.appendChild(node);
  });
}

searchInput.addEventListener('input', ()=> renderCards(writeups));

loadIndex();

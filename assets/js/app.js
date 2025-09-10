
(function(){
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Theme
  const userPref = localStorage.getItem('theme');
  const mql = window.matchMedia('(prefers-color-scheme: light)');
  function setTheme(t){
    if(t === 'light'){ root.classList.add('light'); }
    else { root.classList.remove('light'); }
    localStorage.setItem('theme', t);
  }
  setTheme(userPref || (mql.matches ? 'light' : 'dark'));
  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      const next = root.classList.contains('light') ? 'dark' : 'light';
      setTheme(next);
    });
  }

  // Elements
  const platformBadges = document.getElementById('platformBadges');
  const resultsGrid = document.getElementById('resultsGrid');
  const recentGrid = document.getElementById('recentGrid');
  const resultsMeta = document.getElementById('resultsMeta');
  const totalWriteupsEl = document.getElementById('totalWriteups');
  const platformCountEl = document.getElementById('platformCount');

  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const difficultySelect = document.getElementById('difficultySelect');
  const clearBtn = document.getElementById('clearFilters');

  let ALL = [];
  let selectedPlatform = '';
  let searchQuery = '';
  let selectedDifficulty = '';

  // Load data
  fetch('data/writeups.json')
    .then(r => r.json())
    .then(data => {
      ALL = data;
      initUI();
    })
    .catch(err => {
      console.error(err);
      resultsMeta.textContent = 'Failed to load data.';
    });

  function initUI(){
    totalWriteupsEl.textContent = ALL.length;
    // Build platform counts
    const map = new Map();
    for(const w of ALL){
      const p = w.platform || 'Other';
      map.set(p, (map.get(p)||0) + 1);
    }
    platformCountEl.textContent = map.size;

    platformBadges.innerHTML = '';
    // "All" badge first
    platformBadges.appendChild(makeBadge('All', ALL.length, ''));
    for(const [platform, count] of [...map.entries()].sort((a,b)=> a[0].localeCompare(b[0]))){
      platformBadges.appendChild(makeBadge(platform, count, platform));
    }

    // Render recent 9
    const recent = [...ALL].sort((a,b)=> new Date(b.date) - new Date(a.date)).slice(0,9);
    renderGrid(recentGrid, recent);

    // Initial results = all
    applyFilters();

    // Events
    platformBadges.addEventListener('click', (e)=>{
      const el = e.target.closest('.badge');
      if(!el) return;
      selectedPlatform = el.dataset.platform;
      for(const b of platformBadges.querySelectorAll('.badge')){
        b.dataset.active = String(b.dataset.platform === selectedPlatform);
      }
      applyFilters();
    });
    function doSearch(){
      searchQuery = (searchInput.value || '').trim().toLowerCase();
      applyFilters();
    }
    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doSearch(); });
    difficultySelect.addEventListener('change', ()=>{ selectedDifficulty = difficultySelect.value; applyFilters(); });
    clearBtn.addEventListener('click', ()=>{
      selectedPlatform=''; searchQuery=''; selectedDifficulty='';
      searchInput.value=''; difficultySelect.value='';
      for(const b of platformBadges.querySelectorAll('.badge')) b.dataset.active = String(b.dataset.platform==='');
      applyFilters();
    });
  }

  function makeBadge(label, count, platformValue){
    const b = document.createElement('button');
    b.className = 'badge';
    b.type = 'button';
    b.dataset.platform = platformValue;
    b.dataset.active = String(platformValue === '');
    b.innerHTML = `<span>${label}</span><span class="tag">${count}</span>`;
    return b;
  }

  function applyFilters(){
    let arr = ALL;
    if(selectedPlatform){
      arr = arr.filter(w => (w.platform || '') === selectedPlatform);
    }
    if(selectedDifficulty){
      arr = arr.filter(w => (w.difficulty || '') === selectedDifficulty);
    }
    if(searchQuery){
      arr = arr.filter(w => {
        const hay = (w.title + ' ' + (w.platform||'') + ' ' + (w.tags||[]).join(' ')).toLowerCase();
        return hay.includes(searchQuery);
      });
    }
    resultsMeta.textContent = `${arr.length} result(s)`;
    renderGrid(resultsGrid, arr);
  }

  function renderGrid(container, list){
    container.innerHTML = list.map(toCardHTML).join('');
  }

  function toCardHTML(w){
    const date = new Date(w.date);
    const dateStr = date.toLocaleDateString(undefined, {year:'numeric', month:'short', day:'2-digit'});
    const tags = (w.tags||[]).slice(0,4).map(t=>`<span class="tag">${escape(t)}</span>`).join(' ');
    const href = `post.html?id=${encodeURIComponent(w.id)}`;
    return `
      <article class="card">
        <div class="meta">${escape(w.platform || 'Other')} • ${escape(w.difficulty || 'Unknown')} • ${dateStr}</div>
        <h3>${escape(w.title)}</h3>
        <p class="muted">${escape(w.summary || '')}</p>
        <div class="meta">${tags}</div>
        <a class="card-link" href="${href}">Read writeup →</a>
      </article>
    `;
  }

  // tiny escape
  function escape(s){
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})();

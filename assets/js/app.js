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

  // --- POSTS ---
  const searchInputPost = document.getElementById('searchInputPost');
  const searchBtnPost = document.getElementById('searchBtnPost');
  const clearPost = document.getElementById('clearPost');
  const resultsMetaPost = document.getElementById('resultsMetaPost');
  const resultsGridPost = document.getElementById('resultsGridPost');
  const paginationPost = document.getElementById('paginationPost');

  let POSTS = [];
  let postSearchQuery = '';
  let filteredPosts = [];
  let currentPage = 1;
  const RESULTS_PER_PAGE = 10;

  fetch('data/post.json?nocache=' + new Date().getTime())
    .then(r => r.json())
    .then(data => {
      POSTS = data;
      filteredPosts = [...POSTS];
      renderPosts();
    })
    .catch(err => {
      console.error(err);
      if(resultsMetaPost) resultsMetaPost.textContent = 'Failed to load posts.';
    });

  function renderPosts(){
    if(!resultsGridPost) return;
    resultsGridPost.innerHTML = '';
    paginationPost.innerHTML = '';

    if(filteredPosts.length === 0){
      resultsMetaPost.textContent = 'No posts found.';
      return;
    }

    resultsMetaPost.textContent = `${filteredPosts.length} post(s)`;

    const start = (currentPage - 1) * RESULTS_PER_PAGE;
    const end = start + RESULTS_PER_PAGE;
    const pageResults = filteredPosts.slice(start, end);

    pageResults.forEach(p => {
      resultsGridPost.insertAdjacentHTML('beforeend', toCardHTMLPost(p));
    });

    // paginación
    const totalPages = Math.ceil(filteredPosts.length / RESULTS_PER_PAGE);
    if(totalPages > 1){
      for(let i=1;i<=totalPages;i++){
        const btn = document.createElement('button');
        btn.textContent = i;
        if(i === currentPage) btn.classList.add('active');
        btn.addEventListener('click', ()=>{
          currentPage = i;
          renderPosts();
        });
        paginationPost.appendChild(btn);
      }
    }
  }

  function toCardHTMLPost(p){
    const date = new Date(p.date);
    const dateStr = date.toLocaleDateString(undefined, {year:'numeric', month:'short', day:'2-digit'});
    const tags = (p.tags||[]).slice(0,4).map(t=>`<span class="tag">${escape(t)}</span>`).join(' ');
    const href = p.link || '#';
    return `
      <div class="post-card">
        <img src="${p.image || 'assets/images/post.png'}" alt="Preview" style="width:80px; height:80px; object-fit:cover; border-radius:6px;">
        <div class="post-content">
          <h3>${escape(p.title)}</h3>
          <p class="muted">${escape(p.summary || '')}</p>
          <div class="meta">${dateStr} ${tags}</div>
          <a class="card-link" href="${href}" target="_blank">Read post →</a>
        </div>
      </div>
    `;
  }

  // eventos de búsqueda en POSTS
  function doSearchPost(){
    postSearchQuery = (searchInputPost.value || '').trim().toLowerCase();
    if(postSearchQuery){
      filteredPosts = POSTS.filter(p => {
        const hay = (p.title + ' ' + (p.tags||[]).join(' ')).toLowerCase();
        return hay.includes(postSearchQuery);
      });
    } else {
      filteredPosts = [...POSTS];
    }
    currentPage = 1;
    renderPosts();
  }

  if(searchBtnPost) searchBtnPost.addEventListener('click', doSearchPost);
  if(searchInputPost) searchInputPost.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doSearchPost(); });
  if(clearPost) clearPost.addEventListener('click', ()=>{
    postSearchQuery='';
    if(searchInputPost) searchInputPost.value='';
    filteredPosts = [...POSTS];
    currentPage = 1;
    renderPosts();
  });

  // --- VIEW ROUTER ---
  const views = Array.from(document.querySelectorAll('[data-view]'));
  const navLinks = Array.from(document.querySelectorAll('[data-link]'));
  const defaultView = 'home';

  function showView(name){
    views.forEach(v => {
      const match = v.dataset.view === name;
      v.hidden = !match;
    });
    navLinks.forEach(a => {
      const href = a.getAttribute('href') || '';
      const isActive = href.replace('#','') === name || (href === '#' && name === defaultView);
      a.classList.toggle('active', isActive);
    });
    if(name === 'profile') renderRecentInto('recentGridProfile');
  }

  function route(){
    const h = (location.hash || `#${defaultView}`).replace('#','') || defaultView;
    showView(h);
  }

  window.addEventListener('hashchange', route);
  navLinks.forEach(a => a.addEventListener('click', ()=>{}));

  // --- estado inicial forzado a HOME ---
  let requestedView = (location.hash.replace('#','') || 'profile');
  location.hash = '#home';
  showView('home');

  // Elements and state
  const osSelect = document.getElementById('osSelect');
  let selectedOS = '';

  const platformBadges = document.getElementById('platformBadges');
  const resultsGrid = document.getElementById('resultsGrid');
  const recentGrid = document.getElementById('recentGrid');
  const resultsMeta = document.getElementById('resultsMeta');
  const totalWriteupsEl = document.getElementById('totalWriteups');
  const platformCountEl = document.getElementById('platformCount');
  const platformOverview = document.getElementById('platformOverview');
  const tagOverview = document.getElementById('tagOverview');
  const recentGridProfile = document.getElementById('recentGridProfile');

  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const difficultySelect = document.getElementById('difficultySelect');
  const clearBtn = document.getElementById('clearFilters');

  let ALL = [];
  let selectedPlatform = '';
  let searchQuery = '';
  let selectedDifficulty = '';

  // Load data
  fetch('data/writeups.json?nocache=' + new Date().getTime())
    .then(r => r.json())
    .then(data => {
      ALL = data;
      initUI();
      if (requestedView === 'profile') {
        location.hash = '#profile';
        showView('profile');
      }
    })
    .catch(err => {
      console.error(err);
      if(resultsMeta) resultsMeta.textContent = 'Failed to load data.';
    });

  function initUI(){
    if(totalWriteupsEl) totalWriteupsEl.textContent = ALL.length;
    const map = new Map();
    const tagMap = new Map();
    for(const w of ALL){
      const p = w.platform || 'Other';
      map.set(p, (map.get(p)||0) + 1);
      for(const t of (w.tags||[])){
        tagMap.set(t, (tagMap.get(t)||0) + 1);
      }
    }
    if(platformCountEl) platformCountEl.textContent = map.size;

    if(platformBadges){
      platformBadges.innerHTML = '';
      platformBadges.appendChild(makeBadge('All', ALL.length, ''));
      for(const [platform, count] of [...map.entries()].sort((a,b)=> a[0].localeCompare(b[0]))){
        platformBadges.appendChild(makeBadge(platform, count, platform));
      }
      platformBadges.addEventListener('click', (e)=>{
        const el = e.target.closest('.badge');
        if(!el) return;
        selectedPlatform = el.dataset.platform;
        for(const b of platformBadges.querySelectorAll('.badge')){
          b.dataset.active = String(b.dataset.platform === selectedPlatform);
        }
        applyFilters();
        location.hash = '#home';
      });
    }

    if(platformOverview){
      platformOverview.innerHTML = [...map.entries()].sort((a,b)=>b[1]-a[1]).map(([p,c])=>`
        <button class="badge platform-tile" data-platform="${escapeAttr(p)}">${escape(p)} <span class="tag">${c}</span></button>
      `).join('');
      platformOverview.addEventListener('click', (e)=>{
        const btn = e.target.closest('.platform-tile');
        if(!btn) return;
        selectedPlatform = btn.dataset.platform;
        location.hash = '#home';
        setTimeout(()=>{
          for(const b of document.querySelectorAll('#platformBadges .badge')){
            b.dataset.active = String(b.dataset.platform === selectedPlatform);
          }
          applyFilters();
        }, 120);
      });
    }

    if(tagOverview){
      tagOverview.innerHTML = [...tagMap.entries()].sort((a,b)=>b[1]-a[1]).map(([t,c])=>`
        <button class="badge tag-tile" data-tag="${escapeAttr(t)}">${escape(t)} <span class="tag">${c}</span></button>
      `).join('');
      tagOverview.addEventListener('click', (e)=>{
        const btn = e.target.closest('.tag-tile');
        if(!btn) return;
        searchInput.value = btn.dataset.tag;
        searchBtn.click();
        location.hash = '#home';
      });
    }

    const recent = [...ALL].sort((a,b)=> new Date(b.date) - new Date(a.date)).slice(0,9);
    if(recentGrid) renderGrid(recentGrid, recent);
    if(recentGridProfile) renderGrid(recentGridProfile, recent);

    applyFilters();

    function doSearch(){
      searchQuery = (searchInput.value || '').trim().toLowerCase();
      applyFilters();
      location.hash = '#home';
    }
    if(searchBtn) searchBtn.addEventListener('click', doSearch);
    if(searchInput) searchInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doSearch(); });
    if(difficultySelect) difficultySelect.addEventListener('change', ()=>{ selectedDifficulty = difficultySelect.value; applyFilters(); });
    if(osSelect) osSelect.addEventListener('change', ()=>{ selectedOS = osSelect.value; applyFilters(); });
    if(clearBtn) clearBtn.addEventListener('click', ()=>{
      selectedPlatform=''; searchQuery=''; selectedDifficulty=''; selectedOS='';
      if(searchInput) searchInput.value=''; 
      if(difficultySelect) difficultySelect.value='';
      if(osSelect) osSelect.value='';
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
    if(selectedOS){
      arr = arr.filter(w => (w.os || '') === selectedOS);
    }
    if(searchInput && searchInput.value){
      searchQuery = (searchInput.value || '').trim().toLowerCase();
    }
    if(searchQuery){
      arr = arr.filter(w => {
        const hay = (w.title + ' ' + (w.platform||'') + ' ' + (w.tags||[]).join(' ')).toLowerCase();
        return hay.includes(searchQuery);
      });
    }
    if(resultsMeta) resultsMeta.textContent = `${arr.length} result(s)`;
    if(resultsGrid) renderGrid(resultsGrid, arr);
  }

  function renderGrid(container, list){
    if(!container) return;
    container.innerHTML = list.map(toCardHTML).join('');
  }

  function renderRecentInto(id){
    const container = document.getElementById(id);
    if(!container) return;
    const recent = [...ALL].sort((a,b)=> new Date(b.date) - new Date(a.date)).slice(0,3);
    renderGrid(container, recent);
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

  function escape(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function escapeAttr(s){ return String(s||'').replace(/["']/g, c => ({'"':'&quot;',"'":'&#39;'}[c])); }

})();


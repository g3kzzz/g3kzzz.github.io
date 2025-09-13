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

  let POSTS = [];
  let postSearchQuery = '';
  let currentPagePost = 1;
  const POSTS_PER_PAGE = 9;

  fetch('data/post.json?nocache=' + new Date().getTime())
    .then(r => r.json())
    .then(data => {
      POSTS = data;
      renderPosts(POSTS); // render inicial
    })
    .catch(err => {
      console.error(err);
      if(resultsMetaPost) resultsMetaPost.textContent = 'Failed to load posts.';
    });

  function renderPosts(list){
    if(!resultsGridPost) return;

    const totalPages = Math.ceil(list.length / POSTS_PER_PAGE);
    if(currentPagePost > totalPages) currentPagePost = totalPages || 1;
    const start = (currentPagePost - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    const pageItems = list.slice(start, end);

    resultsGridPost.innerHTML = pageItems.map(toCardHTMLPost).join('');
    if(resultsMetaPost) resultsMetaPost.textContent = `${list.length} post(s)`;

    renderPaginationPost(list.length, totalPages);
  }

  function renderPaginationPost(totalItems, totalPages){
    let pagination = document.getElementById('paginationPost');
    if(!pagination){
      pagination = document.createElement('div');
      pagination.id = 'paginationPost';
      pagination.className = 'pagination';
      resultsGridPost.parentNode.appendChild(pagination);
    }
    pagination.innerHTML = '';

    if(totalPages <= 1) return;

    if(currentPagePost > 1){
      const prev = document.createElement('button');
      prev.textContent = 'Anterior';
      prev.onclick = () => { currentPagePost--; renderPosts(filterPosts()); };
      pagination.appendChild(prev);
    }

    for(let i = 1; i <= totalPages; i++){
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.disabled = i === currentPagePost;
      btn.onclick = () => { currentPagePost = i; renderPosts(filterPosts()); };
      pagination.appendChild(btn);
    }

    if(currentPagePost < totalPages){
      const next = document.createElement('button');
      next.textContent = 'Siguiente';
      next.onclick = () => { currentPagePost++; renderPosts(filterPosts()); };
      pagination.appendChild(next);
    }
  }

  function filterPosts(){
    let arr = POSTS;
    if(postSearchQuery){
      arr = arr.filter(p => {
        const hay = (p.title + ' ' + (p.tags||[]).join(' ')).toLowerCase();
        return hay.includes(postSearchQuery);
      });
    }
    return arr;
  }

  function toCardHTMLPost(p){
    const date = new Date(p.date);
    const dateStr = date.toLocaleDateString(undefined, {year:'numeric', month:'short', day:'2-digit'});
    const tags = (p.tags||[]).slice(0,4).map(t=>`<span class="tag">${escape(t)}</span>`).join(' ');
    const href = p.link || '#';
    return `
      <article class="card">
        <div class="meta">${dateStr}</div>
        <h3>${escape(p.title)}</h3>
        <p class="muted">${escape(p.summary || '')}</p>
        <div class="meta">${tags}</div>
        <a class="card-link" href="${href}" target="_blank">Read post →</a>
      </article>
    `;
  }

  function doSearchPost(){
    postSearchQuery = (searchInputPost.value || '').trim().toLowerCase();
    currentPagePost = 1;
    renderPosts(filterPosts());
  }

  if(searchBtnPost) searchBtnPost.addEventListener('click', doSearchPost);
  if(searchInputPost) searchInputPost.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doSearchPost(); });
  if(clearPost) clearPost.addEventListener('click', ()=>{
    postSearchQuery='';
    currentPagePost = 1;
    if(searchInputPost) searchInputPost.value='';
    renderPosts(POSTS);
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
  let currentPageWriteups = 1;
  const WRITEUPS_PER_PAGE = 9;

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
        currentPageWriteups = 1;
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
          currentPageWriteups = 1;
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

    applyFilters();

    function doSearch(){
      searchQuery = (searchInput.value || '').trim().toLowerCase();
      currentPageWriteups = 1;
      applyFilters();
      location.hash = '#home';
    }
    if(searchBtn) searchBtn.addEventListener('click', doSearch);
    if(searchInput) searchInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doSearch(); });
    if(difficultySelect) difficultySelect.addEventListener('change', ()=>{ selectedDifficulty = difficultySelect.value; currentPageWriteups = 1; applyFilters(); });
    if(osSelect) osSelect.addEventListener('change', ()=>{ selectedOS = osSelect.value; currentPageWriteups = 1; applyFilters(); });
    if(clearBtn) clearBtn.addEventListener('click', ()=>{
      selectedPlatform=''; searchQuery=''; selectedDifficulty=''; selectedOS='';
      if(searchInput) searchInput.value=''; 
      if(difficultySelect) difficultySelect.value='';
      if(osSelect) osSelect.value='';
      for(const b of platformBadges.querySelectorAll('.badge')) b.dataset.active = String(b.dataset.platform==='');
      currentPageWriteups = 1;
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

    renderWriteupsPage(arr);
  }

  function renderWriteupsPage(list){
    if(!resultsGrid) return;
    const totalPages = Math.ceil(list.length / WRITEUPS_PER_PAGE);
    if(currentPageWriteups > totalPages) currentPageWriteups = totalPages || 1;
    const start = (currentPageWriteups - 1) * WRITEUPS_PER_PAGE;
    const end = start + WRITEUPS_PER_PAGE;
    const pageItems = list.slice(start, end);

    resultsGrid.innerHTML = pageItems.map(toCardHTML).join('');
    renderPaginationWriteups(list.length, totalPages);
  }

  function renderPaginationWriteups(totalItems, totalPages){
    let pagination = document.getElementById('paginationWriteups');
    if(!pagination){
      pagination = document.createElement('div');
      pagination.id = 'paginationWriteups';
      pagination.className = 'pagination';
      resultsGrid.parentNode.appendChild(pagination);
    }
    pagination.innerHTML = '';
    if(totalPages <= 1) return;

    if(currentPageWriteups > 1){
      const prev = document.createElement('button');
      prev.textContent = 'Anterior';
      prev.onclick = () => { currentPageWriteups--; applyFilters(); };
      pagination.appendChild(prev);
    }

    for(let i = 1; i <= totalPages; i++){
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.disabled = i === currentPageWriteups;
      btn.onclick = () => { currentPageWriteups = i; applyFilters(); };
      pagination.appendChild(btn);
    }

    if(currentPageWriteups < totalPages){
      const next = document.createElement('button');
      next.textContent = 'Siguiente';
      next.onclick = () => { currentPageWriteups++; applyFilters(); };
      pagination.appendChild(next);
    }
  }

  function renderRecentInto(id){
    const container = document.getElementById(id);
    if(!container) return;
    const recent = [...ALL].sort((a,b)=> new Date(b.date) - new Date(a.date)).slice(0,3);
    container.innerHTML = recent.map(toCardHTML).join('');
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


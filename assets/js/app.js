
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

  // Screen navigation (SPA-like)
  const screens = document.querySelectorAll('.screen');
  const navLinks = document.querySelectorAll('.nav-link[data-screen]');
  const profileBtn = document.getElementById('profileBtn');

  function showScreen(id, push=true){
    for(const s of screens){
      s.classList.toggle('visible', s.id === id);
    }
    // mark active link
    for(const a of navLinks){
      a.classList.toggle('active', a.dataset.screen === id);
    }
    // update hash (so direct links work)
    if(push) location.hash = id;
    // focus first meaningful element for accessibility
    const visible = document.getElementById(id);
    if(visible){
      const focusable = visible.querySelector('input, button, a, [tabindex]');
      if(focusable) focusable.focus({preventScroll:true});
    }
  }

  // initial screen from hash
  const initial = (location.hash && location.hash.substring(1)) || 'home';
  showScreen(initial, false);

  // nav click handling
  for(const a of navLinks){
    a.addEventListener('click', (e)=>{
      const id = a.dataset.screen;
      showScreen(id);
      e.preventDefault();
    });
  }
  if(profileBtn){
    profileBtn.addEventListener('click', ()=> showScreen('profile'));
  }
  // react to hashchange (back/forward)
  window.addEventListener('hashchange', ()=>{
    const id = (location.hash && location.hash.substring(1)) || 'home';
    showScreen(id, false);
  });

  // Elements (list & filters)
  const platformBadges = document.getElementById('platformBadges');
  const resultsGrid = document.getElementById('resultsGrid');
  const recentGrid = document.getElementById('recentGrid');
  const resultsMeta = document.getElementById('resultsMeta');
  const totalWriteupsEl = document.getElementById('totalWriteups');
  const platformCountEl = document.getElementById('platformCount');
  const tagsCloud = document.getElementById('tagsCloud');

  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const difficultySelect = document.getElementById('difficultySelect');
  const clearBtn = document.getElementById('clearFilters');

  // Profile elements
  const headerAvatar = document.getElementById('headerAvatar');
  const heroAvatar = document.getElementById('heroAvatar');
  const heroName = document.getElementById('heroName');
  const heroTag = document.getElementById('heroTag');

  const profilePreview = document.getElementById('profilePreview');
  const avatarFile = document.getElementById('avatarFile');
  const resetAvatar = document.getElementById('resetAvatar');
  const profileName = document.getElementById('profileName');
  const profileTagline = document.getElementById('profileTagline');
  const accentColor = document.getElementById('accentColor');
  const saveProfile = document.getElementById('saveProfile');

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
      if(resultsMeta) resultsMeta.textContent = 'Failed to load data.';
    });

  function initUI(){
    totalWriteupsEl.textContent = ALL.length;
    // Build platform counts
    const map = new Map();
    const tagMap = new Map();
    for(const w of ALL){
      const p = w.platform || 'Other';
      map.set(p, (map.get(p)||0) + 1);
      for(const t of (w.tags||[])){
        tagMap.set(t, (tagMap.get(t)||0)+1);
      }
    }
    platformCountEl.textContent = map.size;

    platformBadges.innerHTML = '';
    platformBadges.appendChild(makeBadge('All', ALL.length, ''));
    for(const [platform, count] of [...map.entries()].sort((a,b)=> a[0].localeCompare(b[0]))){
      platformBadges.appendChild(makeBadge(platform, count, platform));
    }

    // tags cloud
    if(tagsCloud){
      tagsCloud.innerHTML = '';
      for(const [t,c] of [...tagMap.entries()].sort((a,b)=> b[1]-a[1])){
        const span = document.createElement('button');
        span.className = 'tag';
        span.type = 'button';
        span.textContent = `${t} (${c})`;
        span.dataset.tag = t;
        span.addEventListener('click', ()=>{
          // switch to platforms screen and apply search by tag
          showScreen('platforms');
          searchInput.value = t;
          searchInput.focus();
          searchBtn.click();
        });
        tagsCloud.appendChild(span);
      }
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
    if(searchBtn) searchBtn.addEventListener('click', doSearch);
    if(searchInput) searchInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doSearch(); });
    if(difficultySelect) difficultySelect.addEventListener('change', ()=>{ selectedDifficulty = difficultySelect.value; applyFilters(); });
    if(clearBtn) clearBtn.addEventListener('click', ()=>{
      selectedPlatform=''; searchQuery=''; selectedDifficulty='';
      searchInput.value=''; difficultySelect.value='';
      for(const b of platformBadges.querySelectorAll('.badge')) b.dataset.active = String(b.dataset.platform==='');
      applyFilters();
    });

    // Load profile from storage
    loadProfile();
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
    if(!container) return;
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

  // PROFILE persistence (localStorage)
  function loadProfile(){
    const avatar = localStorage.getItem('g3k-profile-avatar');
    const name = localStorage.getItem('g3k-profile-name') || 'G3K';
    const tag = localStorage.getItem('g3k-profile-tag') || 'A place for technical writeups and walkthroughs.';
    const accent = localStorage.getItem('g3k-accent') || null;

    if(avatar){
      headerAvatar.src = avatar;
      heroAvatar.src = avatar;
      profilePreview.src = avatar;
    }
    heroName.textContent = name;
    heroTag.textContent = tag;
    profileName.value = name;
    profileTagline.value = tag;
    if(accent){
      accentColor.value = accent;
      setAccentColor(accent);
    } else {
      // keep default value
      setAccentColor(accentColor.value || '#7c9bff');
    }
  }
  function setAccentColor(color){
    if(!color) return;
    root.style.setProperty('--acc', color);
    localStorage.setItem('g3k-accent', color);
  }

  // Avatar upload
  if(avatarFile){
    avatarFile.addEventListener('change', (e)=>{
      const f = e.target.files && e.target.files[0];
      if(!f) return;
      const reader = new FileReader();
      reader.onload = function(ev){
        const dataUrl = ev.target.result;
        profilePreview.src = dataUrl;
        headerAvatar.src = dataUrl;
        heroAvatar.src = dataUrl;
        // persist immediately
        localStorage.setItem('g3k-profile-avatar', dataUrl);
      };
      reader.readAsDataURL(f);
    });
  }
  if(resetAvatar){
    resetAvatar.addEventListener('click', ()=>{
      const src = 'assets/img/default-avatar.svg';
      profilePreview.src = src;
      headerAvatar.src = src;
      heroAvatar.src = src;
      localStorage.removeItem('g3k-profile-avatar');
    });
  }
  if(saveProfile){
    saveProfile.addEventListener('click', ()=>{
      localStorage.setItem('g3k-profile-name', profileName.value || 'G3K');
      localStorage.setItem('g3k-profile-tag', profileTagline.value || 'A place for technical writeups and walkthroughs.');
      setAccentColor(accentColor.value || '#7c9bff');
      loadProfile();
      alert('Profile saved locally in your browser.');
    });
  }
  if(accentColor){
    accentColor.addEventListener('input', (e)=> setAccentColor(e.target.value));
  }

})();

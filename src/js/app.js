(function () {
  // =============================
  // DOM ELEMENTS
  // =============================
  const navLinks = document.querySelectorAll('.nav-link');
  const workspaces = document.querySelectorAll('.workspace');
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const yearEl = document.getElementById('year');
  const iconSun = document.getElementById('icon-sun');
  const iconMoon = document.getElementById('icon-moon');

  // WRITEUPS DOM
  const resultsGrid = document.getElementById('resultsGrid');
  const resultsMeta = document.getElementById('resultsMeta');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const difficultySelect = document.getElementById('difficultySelect');
  const osSelect = document.getElementById('osSelect');
  const clearFilters = document.getElementById('clearFilters');
  const totalWriteupsEl = document.getElementById('totalWriteups');
  const platformCountEl = document.getElementById('platformCount');
  const recentGridProfile = document.getElementById('recentGridProfile');

  // POSTS DOM
  const resultsGridPost = document.getElementById('resultsGridPost');
  const resultsMetaPost = document.getElementById('resultsMetaPost');
  const searchInputPost = document.getElementById('searchInputPost');
  const searchBtnPost = document.getElementById('searchBtnPost');
  const clearPostBtn = document.getElementById('clearPost');
  const totalReposEl = document.getElementById('totalRepos');
  const recentReposEl = document.getElementById('recentRepos');

  // =============================
  // DYNAMIC YEAR
  // =============================
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // =============================
  // THEME
  // =============================
  const userPref = localStorage.getItem('theme');
  const mql = window.matchMedia('(prefers-color-scheme: light)');

  function setTheme(t) {
    root.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);

    if (iconSun && iconMoon) {
      iconSun.style.display = t === 'light' ? 'none' : 'inline';
      iconMoon.style.display = t === 'light' ? 'inline' : 'none';
    }
  }

  setTheme(userPref === 'light' || userPref === 'dark' ? userPref : (mql.matches ? 'light' : 'dark'));

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      setTheme(current === 'light' ? 'dark' : 'light');
    });
  }

  window.addEventListener('storage', e => {
    if (e.key === 'theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
      setTheme(e.newValue);
    }
  });

  // =============================
  // SPA NAVIGATION
  // =============================
  function showWorkspace(id) {
    workspaces.forEach(w => w.classList.remove('active'));
    const ws = document.getElementById(id);
    if (ws) ws.classList.add('active');

    navLinks.forEach(l => l.classList.remove('active'));
    const activeLink = Array.from(navLinks).find(l => l.dataset.page === id);
    if (activeLink) activeLink.classList.add('active');
  }

  const brandLink = document.getElementById('brandLink');
  if (brandLink) {
    brandLink.addEventListener('click', e => {
      e.preventDefault();
      showWorkspace('profile');
      history.pushState(null, '', '#profile');
    });
  }

  if (location.hash) {
    showWorkspace(location.hash.substring(1));
  }

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.dataset.page || link.getAttribute('href').substring(1);
      showWorkspace(target);
      history.pushState(null, '', `#${target}`);
    });
  });

  // =============================
  // WRITEUPS
  // =============================
  let allWriteups = [];
  let currentPage = 1;
  const itemsPerPage = 9;

  async function loadWriteups() {
    try {
      const res = await fetch('data/writeups.json?nocache=' + new Date().getTime());
      allWriteups = await res.json();
      renderRecentWriteups();
      renderWriteupsPaginated();
      updateStats();
    } catch (err) {
      console.error('Error loading writeups:', err);
      if (resultsMeta) resultsMeta.textContent = 'Error loading writeups.';
    }
  }

  function updateStats() {
    if (totalWriteupsEl) totalWriteupsEl.textContent = allWriteups.length;
    if (platformCountEl) {
      const platforms = Array.from(new Set(allWriteups.map(w => w.platform)));
      platformCountEl.textContent = platforms.length;
    }
  }

  function formatDatePretty(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;

    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month}, ${year}`;
  }

  function renderRecentWriteups() {
    if (!recentGridProfile) return;
    recentGridProfile.innerHTML = '';
    const recent = allWriteups.slice(0, 3);

    recent.forEach(w => {
      const div = document.createElement('div');
      div.className = 'card clickable-card recent-card';
      const dateStr = formatDatePretty(w.date);

      const tagsHTML = w.tags
        .slice(0, 10)
        .map((tag, i) => `<span class="tag-pill${i === 0 ? ' name-tag' : ''}">${tag}</span>`)
        .join('');

      div.innerHTML = `
        <div class="recent-header">
          <h4 class="post-title">${w.title}</h4>
          <span class="recent-date">${dateStr}</span>
        </div>
        <p class="recent-meta">${w.platform} | ${w.os} | ${w.difficulty.charAt(0).toUpperCase() + w.difficulty.slice(1)}</p>
        <p>${w.summary}</p>
        <div class="tags-container">${tagsHTML}</div>
      `;

      div.addEventListener('click', () => {
        sessionStorage.setItem('currentWriteup', w.id);
        window.location.href = 'post.html';
      });
      recentGridProfile.appendChild(div);
    });
  }

  function renderWriteupsPaginated(list = allWriteups) {
    if (!resultsGrid || !resultsMeta) return;
    const totalPages = Math.ceil(list.length / itemsPerPage);
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    resultsGrid.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const pageItems = list.slice(start, start + itemsPerPage);
    resultsMeta.textContent = `${list.length} results found`;

    pageItems.forEach(w => {
      const div = document.createElement('div');
      div.className = 'card clickable-card';
      const tagsHTML = w.tags.slice(0, 10).map((tag, i) => `<span class="tag-pill${i===0?' name-tag':''}">${tag}</span>`).join('');
      div.innerHTML = `
        <h3 class="post-title" style="color: var(--text); text-decoration:none;">${w.title}</h3>
        <p class="muted">${w.platform} | ${w.os} | Difficulty: ${w.difficulty}</p>
        <p>${w.summary}</p>
        <div class="tags-container">${tagsHTML}</div>
      `;
      div.addEventListener('click', () => {
        sessionStorage.setItem('currentWriteup', w.id);
        window.location.href = 'post.html';
      });
      resultsGrid.appendChild(div);
    });

    renderPagination(totalPages, list);
  }

  function renderPagination(totalPages, list) {
    let pagination = document.getElementById('pagination');
    if (!pagination) {
      pagination = document.createElement('div');
      pagination.id = 'pagination';
      pagination.className = 'pagination';
      resultsGrid.after(pagination);
    }
    pagination.innerHTML = '';

    const prev = document.createElement('button');
    prev.textContent = 'Previous';
    prev.disabled = currentPage === 1;
    prev.addEventListener('click', () => { currentPage--; renderWriteupsPaginated(list); });
    pagination.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = i === currentPage ? 'active' : '';
      btn.addEventListener('click', () => { currentPage = i; renderWriteupsPaginated(list); });
      pagination.appendChild(btn);
    }

    const next = document.createElement('button');
    next.textContent = 'Next';
    next.disabled = currentPage === totalPages;
    next.addEventListener('click', () => { currentPage++; renderWriteupsPaginated(list); });
    pagination.appendChild(next);
  }

  function filterWriteups() {
    const q = searchInput.value.toLowerCase();
    const diff = difficultySelect.value;
    const os = osSelect.value;
    const filtered = allWriteups.filter(w => {
      const matchesSearch = w.title.toLowerCase().includes(q) || w.tags.some(t => t.toLowerCase().includes(q));
      const matchesDiff = diff ? w.difficulty === diff : true;
      const matchesOS = os ? w.os === os : true;
      return matchesSearch && matchesDiff && matchesOS;
    });
    currentPage = 1;
    renderWriteupsPaginated(filtered);
  }

  if (searchBtn) searchBtn.addEventListener('click', filterWriteups);
  if (searchInput) searchInput.addEventListener('keyup', e => { if (e.key === 'Enter') filterWriteups(); });
  if (difficultySelect) difficultySelect.addEventListener('change', filterWriteups);
  if (osSelect) osSelect.addEventListener('change', filterWriteups);
  if (clearFilters) clearFilters.addEventListener('click', () => {
    searchInput.value = '';
    difficultySelect.value = '';
    osSelect.value = '';
    currentPage = 1;
    renderWriteupsPaginated(allWriteups);
  });

  // =============================
  // POSTS
  // =============================
  let allPosts = [];

  async function loadPosts() {
    try {
      const res = await fetch('data/post.json?nocache=' + new Date().getTime());
      allPosts = await res.json();
      renderPosts(allPosts);
      updatePostStats();
    } catch (err) {
      console.error('Error loading posts:', err);
      if (resultsMetaPost) resultsMetaPost.textContent = 'Error loading posts.';
    }
  }

  function updatePostStats() {
    if (totalReposEl) totalReposEl.textContent = allPosts.length;
    if (recentReposEl) recentReposEl.textContent = Math.min(5, allPosts.length);
  }

  function renderPosts(list) {
    if (!resultsGridPost || !resultsMetaPost) return;
    resultsGridPost.innerHTML = '';
    resultsMetaPost.textContent = `${list.length} posts found`;

    list.forEach(p => {
      const div = document.createElement('div');
      div.className = 'card clickable-card';
      const tagsHTML = p.tags.slice(0, 10).map(tag => `<span class="tag-pill">${tag}</span>`).join('');
      div.innerHTML = `
        <h3 class="accent post-title" style="color: var(--text); text-decoration:none;">${p.title}</h3>
        <p class="muted">${p.date}</p>
        <p>${p.summary}</p>
        <div class="tags-container">${tagsHTML}</div>
      `;
      div.addEventListener('click', () => {
        if (p.link) window.open(p.link, '_blank');
      });
      resultsGridPost.appendChild(div);
    });
  }

  function filterPosts() {
    const q = searchInputPost.value.toLowerCase();
    const filtered = allPosts.filter(p => p.title.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    renderPosts(filtered);
  }

  if (searchBtnPost) searchBtnPost.addEventListener('click', filterPosts);
  if (searchInputPost) searchInputPost.addEventListener('keyup', e => { if (e.key === 'Enter') filterPosts(); });
  if (clearPostBtn) clearPostBtn.addEventListener('click', () => {
    searchInputPost.value = '';
    renderPosts(allPosts);
  });

  // =============================
  // INITIALIZATION
  // =============================
  loadWriteups();
  loadPosts();

})();

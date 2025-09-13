(function() {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const yearEl = document.getElementById('year');
  const searchInput = document.getElementById('searchPost');
  const resultsContainer = document.getElementById('resultsGridPost');
  const paginationContainer = document.getElementById('pagination');

  if(yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ===== THEME TOGGLE =====
  const userPref = localStorage.getItem('theme');
  const mql = window.matchMedia('(prefers-color-scheme: light)');
  function setTheme(t) {
    if(t === 'light') root.classList.add('light');
    else root.classList.remove('light');
    localStorage.setItem('theme', t);
  }
  setTheme(userPref || (mql.matches ? 'light' : 'dark'));
  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      const next = root.classList.contains('light') ? 'dark' : 'light';
      setTheme(next);
    });
  }

  // ===== PROFILE AVATAR + ACCENT =====
  const headerAvatar = document.getElementById('headerAvatar');
  const avatar = localStorage.getItem('g3k-profile-avatar');
  const accent = localStorage.getItem('g3k-accent');
  if(avatar && headerAvatar) headerAvatar.src = avatar;
  if(accent) document.documentElement.style.setProperty('--acc', accent);

  // ===== POSTS DATA =====
  let posts = [];
  const perPage = 10;
  let currentPage = 1;
  let filteredPosts = [];

  function renderPosts() {
    resultsContainer.innerHTML = '';
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const pagePosts = filteredPosts.slice(start, end);

    if(pagePosts.length === 0) {
      resultsContainer.innerHTML = '<p style="text-align:center;color:var(--muted);padding:2rem;">No results found.</p>';
      paginationContainer.innerHTML = '';
      return;
    }

    pagePosts.forEach(post => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${post.title}</h3>
        <div class="meta">${[post.platform, post.difficulty, new Date(post.date).toLocaleDateString()].filter(Boolean).join(' • ')}</div>
        <p>${post.excerpt || ''}</p>
        <a href="post.html?id=${post.id}" class="card-link">Read more →</a>
      `;
      resultsContainer.appendChild(card);
    });

    renderPagination();
  }

  function renderPagination() {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(filteredPosts.length / perPage);
    if(totalPages <= 1) return;

    const createBtn = (text, page) => {
      const btn = document.createElement('button');
      btn.textContent = text;
      if(page === currentPage) btn.classList.add('active');
      btn.addEventListener('click', ()=> {
        currentPage = page;
        renderPosts();
      });
      return btn;
    }

    // Simple pagination with 1 ... 2 3 ... n
    for(let i = 1; i <= totalPages; i++) {
      if(i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        paginationContainer.appendChild(createBtn(i, i));
      } else if(i === 2 && currentPage > 3) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        paginationContainer.appendChild(dots);
      } else if(i === totalPages - 1 && currentPage < totalPages - 2) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        paginationContainer.appendChild(dots);
      }
    }
  }

  function applySearch() {
    const query = searchInput.value.trim().toLowerCase();
    filteredPosts = posts.filter(p => p.title.toLowerCase().includes(query));
    currentPage = 1;
    renderPosts();
  }

  searchInput.addEventListener('input', applySearch);

  // ===== FETCH POSTS =====
  fetch('/data/writeups.json?nocache=' + new Date().getTime())
    .then(r => r.json())
    .then(list => {
      posts = list;
      filteredPosts = posts;
      renderPosts();
    })
    .catch(err => {
      resultsContainer.innerHTML = '<p style="text-align:center;color:var(--muted);padding:2rem;">Failed to load posts.</p>';
      console.error(err);
    });
})();


(function() {
  const postTitle = document.getElementById('postTitle');
  const postMeta = document.getElementById('postMeta');
  const postContent = document.getElementById('postContent');
  const yearEl = document.getElementById('year');
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  if(yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ===== THEME TOGGLE =====
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

  // ===== GET WRITEUP ID FROM URL =====
  const params = new URLSearchParams(window.location.search);
  const writeupId = params.get('id');
  if(!writeupId){
    postTitle.textContent = 'Writeup not found';
    postContent.textContent = '';
    return;
  }

  // ===== FETCH WRITEUPS =====
  fetch('data/writeups.json?nocache=' + new Date().getTime())
    .then(r => r.json())
    .then(ALL => {
      const w = ALL.find(x => x.id === writeupId);
      if(!w){
        postTitle.textContent = 'Writeup not found';
        postContent.textContent = '';
        return;
      }

      // ===== RENDER WRITEUP =====
      postTitle.textContent = w.title;
      const date = new Date(w.date);
      const dateStr = date.toLocaleDateString(undefined, {year:'numeric', month:'short', day:'2-digit'});
      postMeta.innerHTML = `${w.platform || 'Other'} • ${w.difficulty || 'Unknown'} • ${dateStr} • Tags: ${(w.tags||[]).map(t=>`<span class="tag">${t}</span>`).join(' ')}`;
      postContent.innerHTML = w.content || w.summary || 'No content available';
      document.title = w.title + ' | Writeup';
    })
    .catch(err => {
      console.error(err);
      postTitle.textContent = 'Error loading writeup';
      postContent.textContent = '';
    });
})();


(function() {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const yearEl = document.getElementById('year');
  const postContent = document.getElementById('postContent');
  const postTitle = document.getElementById('postTitle');
  const postMeta = document.getElementById('postMeta');
  const fullWriteupBtn = document.getElementById('fullWriteup');

  if(yearEl) yearEl.textContent = String(new Date().getFullYear());

  // THEME TOGGLE
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

  // Cargar writeup según id
  function getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param);
  }

  const postId = getQueryParam('id');
  if(postId && postContent){
    fetch(`writeups/${postId}`)
      .then(r => r.text())
      .then(html => {
        postContent.innerHTML = html;
        postTitle.textContent = postId.replace('.html','');
        postMeta.textContent = ''; // opcional: agrega plataforma/dificultad si quieres
        if(fullWriteupBtn){
          fullWriteupBtn.href = `writeups/${postId}`;
          fullWriteupBtn.style.display = 'inline-block';
        }
      })
      .catch(err => {
        postContent.innerHTML = '<p style="text-align:center;color:var(--muted);padding:2rem;">Failed to load writeup.</p>';
        console.error(err);
      });
  }
})();


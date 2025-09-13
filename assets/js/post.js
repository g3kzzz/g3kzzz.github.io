(function() {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const yearEl = document.getElementById('year');
  const postContent = document.getElementById('postContent');
  const postTitle = document.getElementById('postTitle');
  const postMeta = document.getElementById('postMeta');
  const fullWriteupBtn = document.getElementById('fullWriteup');

  // --- YEAR ---
  if(yearEl) yearEl.textContent = String(new Date().getFullYear());

  // --- THEME TOGGLE ---
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

  // --- HELPER: GET QUERY PARAM ---
  function getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param);
  }

  const postId = getQueryParam('id');
  if(postId && postContent){
    // Primero cargamos el JSON con metadata
    fetch('/data/writeups.json?nocache=' + new Date().getTime())
      .then(r => r.json())
      .then(list => {
        const w = list.find(x => x.id === postId.replace('.html','') || x.id === postId);
        if(!w){
          postTitle.textContent = postId.replace('.html','');
          postContent.innerHTML = '<p style="text-align:center;color:var(--muted);padding:2rem;">Writeup not found in JSON.</p>';
          return;
        }

        // --- Título real de la máquina ---
        postTitle.textContent = w.title;

        // --- Meta: plataforma, dificultad, fecha ---
        postMeta.textContent = `${w.platform || 'Other'} • ${w.difficulty || 'Unknown'} • ${new Date(w.date).toLocaleDateString()}`;

        // --- Cargar contenido HTML de la writeup ---
        fetch(`writeups/${postId}`)
          .then(r => r.text())
          .then(html => { postContent.innerHTML = html; })
          .catch(err => {
            postContent.innerHTML = '<p style="text-align:center;color:var(--muted);padding:2rem;">Failed to load writeup content.</p>';
            console.error(err);
          });

        // --- Botón "Open Full Writeup" ---
        if(fullWriteupBtn){
          fullWriteupBtn.href = `writeups/${postId}`;
          fullWriteupBtn.style.display = 'inline-block';
        }
      })
      .catch(err => {
        postContent.innerHTML = '<p style="text-align:center;color:var(--muted);padding:2rem;">Failed to load JSON.</p>';
        console.error(err);
      });
  }
})();


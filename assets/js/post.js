
(function(){
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
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

  // Apply profile avatar + accent color if available
  const headerAvatar = document.getElementById('headerAvatar');
  const avatar = localStorage.getItem('g3k-profile-avatar');
  const accent = localStorage.getItem('g3k-accent');
  if(avatar && headerAvatar) headerAvatar.src = avatar;
  if(accent) document.documentElement.style.setProperty('--acc', accent);

  if(!id){
    document.getElementById('postTitle').textContent = 'Not found';
    document.getElementById('postContent').innerHTML = '<p>Missing writeup ID.</p>';
    return;
  }

  fetch('data/writeups.json')
    .then(r => r.json())
    .then(list => {
      const item = list.find(x => x.id === id);
      if(!item){
        document.getElementById('postTitle').textContent = 'Not found';
        document.getElementById('postContent').innerHTML = '<p>Writeup not found.</p>';
        return;
      }
      document.title = item.title + ' • G3K Writeups';
      document.getElementById('postTitle').textContent = item.title;
      document.getElementById('postMeta').textContent = [item.platform, item.difficulty, new Date(item.date).toLocaleDateString()].filter(Boolean).join(' • ');

      // Load HTML content
      fetch(item.file)
        .then(r => r.text())
        .then(html => {
          document.getElementById('postContent').innerHTML = html;
        })
        .catch(err => {
          document.getElementById('postContent').innerHTML = '<p>Failed to load content.</p>';
          console.error(err);
        });
    });
})();

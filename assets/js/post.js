(function(){
  // --- COMMON ELEMENTS ---
  const resultsContainer = document.getElementById('resultsGridPost');
  const resultsMeta = document.getElementById('resultsMetaPost');
  const searchInputPost = document.getElementById('searchInputPost');
  const searchBtnPost = document.getElementById('searchBtnPost');
  const clearPost = document.getElementById('clearPost');
  const paginationContainer = document.getElementById('paginationPost');

  const params = new URLSearchParams(location.search);
  const writeupId = params.get('id'); // Detecta ?id=htb-epsilon

  let POSTS = [];
  let postSearchQuery = '';
  let currentPagePost = 1;
  const POSTS_PER_PAGE = 9;

  // --- ESCAPE FUNCTION ---
  function escapeHTML(s){ 
    return String(s||'').replace(/[&<>"']/g, c => ({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    }[c])); 
  }

  // --- RENDER SINGLE WRITEUP ---
  function renderWriteup(w){
    if(!resultsContainer) return;

    // Si existe un archivo HTML completo, redirigimos automáticamente
    if(w.file){
      window.location.href = w.file;
      return;
    }

    resultsContainer.innerHTML = `
      <article class="card writeup-full">
        <h1>${escapeHTML(w.title)}</h1>
        <div class="meta">${escapeHTML(w.platform || 'Other')} • ${escapeHTML(w.difficulty || 'Unknown')} • ${new Date(w.date).toLocaleDateString()}</div>
        <p>${escapeHTML(w.summary)}</p>
      </article>
    `;
  }

  // --- FETCH AND RENDER WRITEUP IF ID IS PRESENT ---
  if(writeupId){
    fetch('writeups.json?nocache=' + new Date().getTime())
      .then(r => r.json())
      .then(list => {
        const w = list.find(x => x.id === writeupId);
        if(!w){
          resultsContainer.innerHTML = '<p>Writeup not found.</p>';
          return;
        }
        renderWriteup(w);
      })
      .catch(err => {
        console.error(err);
        resultsContainer.innerHTML = '<p>Failed to load writeup.</p>';
      });
    return; // No cargamos posts si es una writeup
  }

  // --- FETCH POSTS ---
  fetch('writeups.json?nocache=' + new Date().getTime())
    .then(r => r.json())
    .then(data => {
      POSTS = data;
      renderPosts(POSTS); // render inicial
    })
    .catch(err => {
      console.error(err);
      if(resultsMeta) resultsMeta.textContent = 'Failed to load posts.';
    });

  // --- RENDER POSTS ---
  function renderPosts(list){
    if(!resultsContainer) return;

    const totalPages = Math.ceil(list.length / POSTS_PER_PAGE);
    if(currentPagePost > totalPages) currentPagePost = totalPages || 1;
    const start = (currentPagePost - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    const pageItems = list.slice(start, end);

    resultsContainer.innerHTML = pageItems.map(toCardHTMLPost).join('');
    if(resultsMeta) resultsMeta.textContent = `${list.length} post(s)`;

    renderPaginationPost(list.length, totalPages);
  }

  // --- CONVERT WRITEUP TO CARD HTML ---
  function toCardHTMLPost(w){
    return `
      <article class="card">
        <h2>${escapeHTML(w.title)}</h2>
        <div class="meta">${escapeHTML(w.platform || 'Other')} • ${escapeHTML(w.difficulty || 'Unknown')} • ${new Date(w.date).toLocaleDateString()}</div>
        <p>${escapeHTML(w.summary)}</p>
        <a href="?id=${w.id}">Read more →</a>
      </article>
    `;
  }

  // --- PAGINATION ---
  function renderPaginationPost(totalItems, totalPages){
    if(!paginationContainer) return;
    paginationContainer.innerHTML = '';

    if(totalPages <= 1) return;

    if(currentPagePost > 1){
      const prev = document.createElement('button');
      prev.textContent = 'Anterior';
      prev.onclick = () => { currentPagePost--; renderPosts(filterPosts()); };
      paginationContainer.appendChild(prev);
    }

    for(let i=1; i<=totalPages; i++){
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.disabled = i===currentPagePost;
      btn.onclick = () => { currentPagePost = i; renderPosts(filterPosts()); };
      paginationContainer.appendChild(btn);
    }

    if(currentPagePost < totalPages){
      const next = document.createElement('button');
      next.textContent = 'Siguiente';
      next.onclick = () => { currentPagePost++; renderPosts(filterPosts()); };
      paginationContainer.appendChild(next);
    }
  }

  // --- FILTERING ---
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

  // --- SEARCH ---
  function doSearchPost(){
    postSearchQuery = (searchInputPost.value || '').trim().toLowerCase();
    currentPagePost = 1;
    renderPosts(filterPosts());
  }

  if(searchBtnPost) searchBtnPost.addEventListener('click', doSearchPost);
  if(searchInputPost) searchInputPost.addEventListener('keydown', e=>{ if(e.key==='Enter') doSearchPost(); });
  if(clearPost) clearPost.addEventListener('click', ()=>{
    postSearchQuery = '';
    currentPagePost = 1;
    if(searchInputPost) searchInputPost.value='';
    renderPosts(POSTS);
  });

})();


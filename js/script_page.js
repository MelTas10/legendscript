(function(){
  function getParam(name){ const url=new URL(window.location.href); return url.searchParams.get(name); }
  function escapeHtml(t){ const d=document.createElement('div'); d.textContent=t||''; return d.innerHTML; }
  function showNotification(msg,type='info'){ const n=document.createElement('div'); n.className=`notification notification-${type}`; n.innerHTML=`<div class="notification-content"><i class="fas fa-${type==='success'?'check-circle':type==='error'?'exclamation-circle':'info-circle'}"></i><span>${escapeHtml(msg)}</span></div><button class="notification-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`; document.body.appendChild(n); setTimeout(()=>n.remove(),5000); }

  function loadScript(){
    const id = Number(getParam('id'));
    const list = JSON.parse(localStorage.getItem('userScripts')||'[]');
    const s = list.find(x=>x.id===id);
    const box = document.getElementById('scriptContainer');
    if (!s){ box.innerHTML = '<div class="no-results"><i class="fas fa-question"></i><h3>Скрипт не найден</h3></div>'; return; }
    // +1 просмотр и сохранить
    s.views = Number(s.views||0)+1;
    const idx = list.findIndex(x=>x.id===s.id);
    if (idx!==-1){ list[idx]=s; localStorage.setItem('userScripts', JSON.stringify(list)); }

    const tags = (s.tags||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('');
    const img = s.image ? `<div style="margin:10px 0;display:flex;justify-content:center"><img src="${s.image}" alt="${escapeHtml(s.name)}" style="max-width:100%;max-height:360px;border-radius:12px;border:1px solid rgba(255,255,255,.12)"/></div>` : '';

    box.innerHTML = `
      <div class="script-details-content" style="background: rgba(255,255,255,.04); border:1px solid rgba(0,212,255,.25); border-radius:16px; padding:20px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <h2 style="margin:0">${escapeHtml(s.name)}</h2>
          <div class="script-rating">${generateStars(s.rating||0)}<span>${Number(s.rating||0).toFixed(1)}</span></div>
        </div>
        ${img}
        <div class="script-meta-info" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:12px 0">
          <div class="meta-item"><i class="fas fa-user"></i><span>Автор: ${escapeHtml(String(s.author||''))}</span></div>
          <div class="meta-item"><i class="fas fa-folder"></i><span>Категория: ${escapeHtml(String(s.category||''))}</span></div>
          <div class="meta-item"><i class="fas fa-calendar"></i><span>Дата: ${new Date(s.createdAt).toLocaleDateString('ru-RU')}</span></div>
          <div class="meta-item"><i class="fas fa-eye"></i><span>Просмотры: ${Number(s.views||0)}</span></div>
        </div>
        <div class="script-description-full"><h3>Описание</h3><p>${escapeHtml(s.description||'')}</p><p style="margin-top:6px; font-size:12px; color:#f59e0b;">Внимание: скрипт не официальный. Используйте с осторожностью.</p></div>
        <div class="script-tags-full"><h3>Теги</h3><div class="tags-container">${tags}</div></div>
        <div class="script-code-section" style="margin-top:16px"><h3>Код</h3>
          <div class="code-container"><pre><code>${escapeHtml(s.code||'')}</code></pre>
            <button class="btn btn-primary copy-btn" id="copyBtn"><i class="fas fa-copy"></i> Копировать</button>
          </div>
        </div>
        <div class="script-comments" style="margin-top:18px">
          <h3>Комментарии (<span id="commentsCount">${(s.comments||[]).length}</span>)</h3>
          <div class="comments-list" id="commentsList"></div>
          <div class="add-comment"><h4>Добавить комментарий</h4>
            <textarea id="commentText" placeholder="Напишите ваш комментарий..." rows="3"></textarea>
            <button class="btn btn-primary" id="addCommentBtn"><i class="fas fa-comment"></i> Отправить</button>
          </div>
        </div>
      </div>`;

    document.getElementById('copyBtn').onclick = ()=>{
      navigator.clipboard.writeText(s.code||'').then(()=>showNotification('Код скопирован!','success'));
    };

    function getUser(){ try { return JSON.parse(localStorage.getItem('userData')||'null'); } catch{ return null; } }
    function saveScript(updated){ const arr = JSON.parse(localStorage.getItem('userScripts')||'[]'); const i = arr.findIndex(x=>x.id===updated.id); if(i!==-1){ arr[i]=updated; localStorage.setItem('userScripts', JSON.stringify(arr)); } }
    function renderComments(){ const listEl = document.getElementById('commentsList'); const me = getUser(); const comments = updated().comments||[]; if (comments.length===0){ listEl.innerHTML = '<p class="no-comments">Комментариев пока нет</p>'; } else { listEl.innerHTML = comments.map(c=>`<div class=\"comment-item\"><div class=\"comment-header\"><span class=\"comment-author\">${escapeHtml(c.author)}</span><span class=\"comment-date\">${new Date(c.createdAt).toLocaleDateString('ru-RU')}</span></div><div class=\"comment-text\">${escapeHtml(c.text)}</div><div class=\"comment-actions\">${me&&me.id===c.authorId?`<button class=\"comment-action\" data-del=\"${c.id}\">Удалить</button>`:''}</div></div>`).join(''); }
      document.getElementById('commentsCount').textContent = String(comments.length);
      listEl.querySelectorAll('[data-del]').forEach(btn=>btn.onclick=()=>{ const id=Number(btn.getAttribute('data-del')); const me=getUser(); const idx=(s.comments||[]).findIndex(c=>c.id===id); if(idx!==-1 && me && s.comments[idx].authorId===me.id){ s.comments.splice(idx,1); saveScript(s); renderComments(); showNotification('Комментарий удален','success'); } });
    }
    function updated(){ const arr = JSON.parse(localStorage.getItem('userScripts')||'[]'); return arr.find(x=>x.id===s.id)||s; }

    document.getElementById('addCommentBtn').onclick = ()=>{
      const me = getUser();
      if (!me) { showNotification('Войдите, чтобы комментировать','error'); return; }
      const textEl = document.getElementById('commentText');
      const text = (textEl.value||'').trim();
      if (!text){ showNotification('Введите текст комментария','error'); return; }
      if (!s.comments) s.comments = [];
      s.comments.push({ id: Date.now(), text, author: me.username, authorId: me.id, createdAt: new Date().toISOString(), scriptId: s.id });
      saveScript(s);
      textEl.value='';
      renderComments();
      showNotification('Комментарий добавлен','success');
    };

    renderComments();
  }

  function generateStars(r){ const full=Math.floor(r); const half=r%1>=0.5; const empty=5-full-(half?1:0); let s=''; for(let i=0;i<full;i++) s+='<i class="fas fa-star"></i>'; if(half) s+='<i class="fas fa-star-half-alt"></i>'; for(let i=0;i<empty;i++) s+='<i class="far fa-star"></i>'; return s; }

  document.addEventListener('DOMContentLoaded', loadScript);
})();



// Система управления скриптами для LegendScript

// Глобальные переменные
let allScripts = [];
let filteredScripts = [];
let currentScript = null;
let liveSuggestionsBox = null;

// Инициализация (надежно для file:// и http://)
function initScriptsModule() {
    try {
        loadAllScripts();
        initializeSearch();
    } catch (e) {
        console.error('Init scripts module error:', e);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScriptsModule);
} else {
    initScriptsModule();
}

// Обновлять при изменениях localStorage из других вкладок
window.addEventListener('storage', (e) => {
    if (e.key === 'userScripts') refreshScripts();
});

// Загрузка всех скриптов
async function loadAllScripts() {
    try {
        const userScripts = JSON.parse(localStorage.getItem('userScripts') || '[]');
        allScripts = [...userScripts];
        // показываем все скрипты; не одобренные пометим бейджем
        filteredScripts = [...allScripts];
        updateScriptsDisplay();
    } catch (error) {
        console.error('Ошибка загрузки скриптов:', error);
    }
}

// Инициализация поиска
function initializeSearch() {
    const searchInput = document.getElementById('scriptSearch');
    if (searchInput) {
        createSuggestionsBox(searchInput);

        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            updateLiveSuggestions(query);
            if (query.length > 0) {
                searchScripts(query);
            } else {
                filteredScripts = [...allScripts];
                updateScriptsDisplay();
            }
        });
        
        // Поиск по Enter с авто-переходом на лучший результат
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.toLowerCase().trim();
                const source = allScripts.filter(s => (s.status || 'approved') === 'approved');
                const results = query ? fuzzyFilterScripts(source, query) : source;
                if (results.length > 0) {
                    // открываем лучшую запись в новой вкладке
                    const best = results[0];
                    window.open(`script.html?id=${best.id}`, '_blank');
                } else {
                    searchScripts(query);
                }
                hideSuggestions();
            }
        });

        document.addEventListener('click', (ev) => {
            if (liveSuggestionsBox && !liveSuggestionsBox.contains(ev.target) && ev.target !== searchInput) {
                hideSuggestions();
            }
        });
    }
}

// Поиск скриптов
function searchScripts(query = null) {
    if (!query) {
        const searchInput = document.getElementById('scriptSearch');
        query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    }
    const source = [...allScripts];
    if (query.length === 0) {
        filteredScripts = [...source];
    } else {
        filteredScripts = fuzzyFilterScripts(source, query);
    }
    updateScriptsDisplay();
    if (query.length > 0) {
        showSearchResults(query, filteredScripts.length);
    }
}

// Фаззи-фильтрация
function fuzzyFilterScripts(list, query) {
    const q = query.toLowerCase();
    const score = (s) => {
        let sc = 0;
        const fields = [s.name, s.description, s.category, s.author].filter(Boolean).map(x => x.toLowerCase());
        const tags = (s.tags || []).map(t => t.toLowerCase());
        fields.forEach(f => { if (f.includes(q)) sc += 3; });
        tags.forEach(t => { if (t.includes(q)) sc += 2; });
        fields.forEach(f => { if (f.startsWith(q)) sc += 2; });
        return sc;
    };
    return [...list]
        .map(s => ({ s, sc: score(s) }))
        .filter(x => x.sc > 0)
        .sort((a, b) => b.sc - a.sc)
        .map(x => x.s);
}

// Подсказки
function createSuggestionsBox(inputEl) {
    if (liveSuggestionsBox) return;
    liveSuggestionsBox = document.createElement('div');
    liveSuggestionsBox.className = 'search-suggestions';
    liveSuggestionsBox.style.cssText = `
        position: absolute; top: 100%; left: 0; right: 0;
        background: rgba(10,10,10,0.95);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 8px; z-index: 1500; display: none;
        max-height: 300px; overflow-y: auto;
    `;
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    inputEl.parentElement.insertBefore(wrapper, inputEl);
    wrapper.appendChild(inputEl);
    wrapper.appendChild(liveSuggestionsBox);
}

function updateLiveSuggestions(query) {
    if (!liveSuggestionsBox) return;
    if (!query) { hideSuggestions(); return; }
    const source = [...allScripts];
    const results = fuzzyFilterScripts(source, query).slice(0, 5);
    if (results.length === 0) { hideSuggestions(); return; }
    liveSuggestionsBox.innerHTML = results.map(s => `
        <div class="suggestion-item" data-id="${s.id}" style="padding:10px; cursor:pointer; display:flex; justify-content:space-between; gap:10px;">
            <span>${escapeHtml(s.name)}</span>
            <span class="tag" style="margin-left:auto;">${escapeHtml(String(s.category || ''))}</span>
        </div>
    `).join('');
    Array.from(liveSuggestionsBox.children).forEach(el => {
        el.addEventListener('click', () => {
            const id = Number(el.getAttribute('data-id'));
            hideSuggestions();
            window.open(`script.html?id=${id}`, '_blank');
        });
    });
    liveSuggestionsBox.style.display = 'block';
}

function hideSuggestions() { if (liveSuggestionsBox) liveSuggestionsBox.style.display = 'none'; }

function refreshScripts() { loadAllScripts(); }
window.refreshScripts = refreshScripts;

function showSearchResults(query, count) {
    const existingResults = document.querySelector('.search-results');
    if (existingResults) existingResults.remove();
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'search-results';
    resultsDiv.innerHTML = `
        <div class="search-results-header">
            <h3>Результаты поиска: "${escapeHtml(query)}"</h3>
            <span class="results-count">Найдено: ${count} скриптов</span>
        </div>
    `;
    resultsDiv.style.cssText = `
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 12px; padding: 20px; margin: 20px 0; backdrop-filter: blur(20px);
    `;
    const scriptsSection = document.getElementById('scripts');
    if (scriptsSection) {
        const scriptsGrid = scriptsSection.querySelector('.scripts-grid');
        if (scriptsGrid) scriptsSection.insertBefore(resultsDiv, scriptsGrid);
    }
}

// Обновление отображения скриптов
function updateScriptsDisplay() {
    const scriptsGrid = document.getElementById('scriptsGrid');
    if (!scriptsGrid) return;
    // Явно показываем контейнер и снимаем возможные overlay-стили
    scriptsGrid.style.display = 'grid';
    scriptsGrid.style.pointerEvents = 'auto';
    scriptsGrid.style.opacity = '1';
    scriptsGrid.innerHTML = '';
    if (filteredScripts.length === 0) {
        scriptsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>Скриптов на данный момент нет</h3>
                <p>Добавьте новый скрипт</p>
                <div style="margin-top:12px">
                    <button class="btn btn-primary" onclick="showUploadScript()"><i class="fas fa-upload"></i> Загрузить скрипт</button>
                </div>
            </div>
        `; return;
    }
    const sortedScripts = [...filteredScripts].sort((a, b) => {
        if (a.rating !== b.rating) return b.rating - a.rating;
        return b.views - a.views;
    });
    sortedScripts.forEach(script => {
        const scriptCard = createScriptCard(script);
        scriptCard.style.visibility = 'visible';
        scriptCard.style.opacity = '1';
        scriptCard.style.pointerEvents = 'auto';
        scriptsGrid.appendChild(scriptCard);
    });
}

// Карточка скрипта с изображением и кнопкой перехода
function createScriptCard(script) {
    const card = document.createElement('div');
    card.className = 'script-card';
    const ratingStars = generateRatingStars(script.rating || 0);
    const img = script.image ? `<div class="script-thumb" style="height:140px;background:#0b0b0b;border:1px solid rgba(255,255,255,.08);border-radius:10px;overflow:hidden;margin-bottom:10px;display:flex;align-items:center;justify-content:center;"><img src="${script.image}" alt="${escapeHtml(script.name)}" style="max-width:100%;max-height:100%;object-fit:cover;"/></div>` : '';
    card.innerHTML = `
        ${img}
        <div class="script-header">
            <div>
                <h3 class="script-title">${escapeHtml(script.name)}</h3>
                <p class="script-author">Автор: ${escapeHtml(String(script.author||''))}</p>
            </div>
            <div class="script-rating">${ratingStars}<span>${(script.rating||0).toFixed(1)}</span></div>
        </div>
        <p class="script-description">${escapeHtml(script.description||'')}</p>
        <p class="script-warning" style="margin:6px 0 0; font-size:12px; color:#f59e0b;">Внимание: скрипт не официальный. Используйте с осторожностью.</p>
        <div class="script-meta">
            <div class="script-views"><i class="fas fa-eye"></i><span>${Number(script.views||0)}</span></div>
            <span class="script-category">${escapeHtml(String(script.category||''))}</span>
        </div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
            <button class="btn btn-secondary" onclick="window.open('script.html?id=${script.id}','_blank')"><i class="fas fa-external-link-alt"></i> Открыть</button>
            <button class="btn btn-secondary" onclick="showScriptDetailsById(${script.id})"><i class="fas fa-eye"></i> Быстрый просмотр</button>
        </div>
    `;
    return card;
}

function showScriptDetailsById(id){
    const s = allScripts.find(x=>x.id===id);
    if (s) showScriptDetails(s);
}

// Рейтинг
function generateRatingStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    let stars = '';
    for (let i=0;i<full;i++) stars += '<i class="fas fa-star"></i>';
    if (half) stars += '<i class="fas fa-star-half-alt"></i>';
    for (let i=0;i<empty;i++) stars += '<i class="far fa-star"></i>';
    return stars;
}

// Детали в модалке (быстрый просмотр)
function showScriptDetails(script) {
    currentScript = script;
    if (!currentScript.comments) currentScript.comments = [];
    const modal = document.createElement('div');
    modal.className = 'modal script-details-modal';
    modal.innerHTML = `
        <div class="modal-content script-details-content">
            <div class="modal-header">
                <h2>${escapeHtml(script.name)}</h2>
                <span class="close" onclick="this.closest('.modal').remove();document.body.style.overflow='auto'">&times;</span>
            </div>
            <div class="modal-body">
                <div class="script-info">
                    ${script.image ? `<div style='margin-bottom:12px;display:flex;justify-content:center'><img src='${script.image}' alt='${escapeHtml(script.name)}' style='max-width:100%;max-height:260px;border-radius:8px;border:1px solid rgba(255,255,255,.1)'/></div>`:''}
                    <div class="script-meta-info" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:12px;">
                        <div class="meta-item"><i class="fas fa-user"></i><span>Автор: ${escapeHtml(String(script.author||''))}</span></div>
                        <div class="meta-item"><i class="fas fa-folder"></i><span>Категория: ${escapeHtml(String(script.category||''))}</span></div>
                        <div class="meta-item"><i class="fas fa-calendar"></i><span>Дата: ${new Date(script.createdAt).toLocaleDateString('ru-RU')}</span></div>
                        <div class="meta-item"><i class="fas fa-eye"></i><span>Просмотры: ${Number(script.views||0)}</span></div>
                    </div>
                    <div class="script-description-full"><h3>Описание</h3><p>${escapeHtml(script.description||'')}</p><p style="margin-top:6px; font-size:12px; color:#f59e0b;">Внимание: скрипт не официальный. Используйте с осторожностью.</p></div>
                </div>
                <div class="script-code-section">
                    <h3>Код скрипта</h3>
                    <div class="code-container"><pre><code>${escapeHtml(script.code||'')}</code></pre>
                        <button class="btn btn-primary copy-btn" onclick="copyScriptCode()"><i class="fas fa-copy"></i> Копировать</button>
                    </div>
                </div>
                <div class="script-comments">
                    <h3>Комментарии (${(script.comments||[]).length})</h3>
                    <div class="comments-list" id="commentsList">${(script.comments||[]).length===0?'<p class="no-comments">Комментариев пока нет</p>':''}</div>
                    <div class="add-comment"><h4>Добавить комментарий</h4>
                        <textarea id="commentText" placeholder="Напишите ваш комментарий..." rows="3"></textarea>
                        <button class="btn btn-primary" onclick="addComment()"><i class="fas fa-comment"></i> Отправить</button>
                    </div>
                </div>
            </div>
        </div>`;
    const styles = document.createElement('style');
    styles.textContent = `.script-details-modal .modal-content{max-width:900px;max-height:90vh}`;
    document.head.appendChild(styles);
    document.body.appendChild(modal);
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    // +1 просмотр и сохранить
    currentScript.views = Number(currentScript.views||0)+1;
    persistCurrentScript();
    updateScriptsDisplay();
    updateCommentsDisplay();
}

function escapeHtml(text){ const div=document.createElement('div'); div.textContent = text||''; return div.innerHTML; }

function copyScriptCode(){ if(!currentScript) return; navigator.clipboard.writeText(currentScript.code||'').then(()=>showNotification('Код скрипта скопирован!','success')).catch(()=>showNotification('Не удалось скопировать','error')); }

// Добавление комментария с сохранением в localStorage
function addComment() {
    if (!currentScript) return;
    const commentTextEl = document.getElementById('commentText');
    const commentText = (commentTextEl?.value||'').trim();
    if (!commentText) { showNotification('Введите текст комментария','error'); return; }
    // Авторизация проверяется в auth.js, но продублируем мягко
    if (typeof isAuthenticated !== 'undefined' && !isAuthenticated) { showNotification('Войдите, чтобы комментировать','error'); return; }
    const author = (typeof currentUser !== 'undefined' && currentUser?.username) ? currentUser.username : 'Аноним';
    const authorId = (typeof currentUser !== 'undefined' && currentUser?.id) ? currentUser.id : 0;
    const comment = { id: Date.now(), text: commentText, author, authorId, createdAt: new Date().toISOString(), scriptId: currentScript.id };
    if (!currentScript.comments) currentScript.comments = [];
    currentScript.comments.push(comment);
    persistCurrentScript();
    updateCommentsDisplay();
    if (commentTextEl) commentTextEl.value = '';
    showNotification('Комментарий добавлен!','success');
}

function updateCommentsDisplay(){
    const list = document.getElementById('commentsList');
    if (!list || !currentScript) return;
    const comments = currentScript.comments||[];
    if (comments.length === 0){ list.innerHTML = '<p class="no-comments">Комментариев пока нет</p>'; return; }
    const uid = (typeof currentUser !== 'undefined' && currentUser?.id) ? currentUser.id : -1;
    list.innerHTML = comments.map(c=>`
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${escapeHtml(c.author)}</span>
                <span class="comment-date">${new Date(c.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
            <div class="comment-text">${escapeHtml(c.text)}</div>
            <div class="comment-actions">
                ${c.authorId===uid?`<button class="comment-action" onclick="deleteComment(${c.id})">Удалить</button>`:''}
            </div>
        </div>`).join('');
}

function deleteComment(id){
    if (!currentScript) return;
    const uid = (typeof currentUser !== 'undefined' && currentUser?.id) ? currentUser.id : -1;
    const idx = (currentScript.comments||[]).findIndex(c=>c.id===id);
    if (idx===-1) return;
    if (currentScript.comments[idx].authorId !== uid){ showNotification('Можно удалить только свой комментарий','error'); return; }
    currentScript.comments.splice(idx,1);
    persistCurrentScript();
    updateCommentsDisplay();
    showNotification('Комментарий удален','success');
}

function persistCurrentScript(){
    const all = JSON.parse(localStorage.getItem('userScripts')||'[]');
    const i = all.findIndex(x=>x.id===currentScript.id);
    if (i!==-1){ all[i]=currentScript; localStorage.setItem('userScripts', JSON.stringify(all)); }
}

// Глобальные функции
window.searchScripts = searchScripts;
window.copyScriptCode = copyScriptCode;
window.addComment = addComment;
window.deleteComment = deleteComment;
window.showScriptDetailsById = showScriptDetailsById;

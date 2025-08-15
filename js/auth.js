// Система авторизации для LegendScript

// Глобальные переменные
let currentUser = null;
let isAuthenticated = false;
let lastGeneratedPassword = '';

// Генерация капчи
function generateCaptcha() {
    const captchaText = document.getElementById('captchaText');
    if (!captchaText) return;
    
    // Генерируем случайную капчу из букв и цифр
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    captchaText.textContent = result;
    
    // Добавляем стили для капчи
    captchaText.style.cssText = `
        font-family: 'Courier New', monospace;
        font-size: 24px;
        font-weight: bold;
        color: var(--primary-color);
        background: rgba(0, 0, 0, 0.3);
        padding: 10px 15px;
        border-radius: 8px;
        letter-spacing: 3px;
        user-select: none;
        text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
    `;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadCategoriesForUpload();
    generateCaptcha(); // Генерируем капчу при загрузке
    // если открыта главная, подстрахуемся и инициируем обновление списка скриптов
    if (typeof window.refreshScripts === 'function') {
        try { window.refreshScripts(); } catch {}
    }
});

// Проверка статуса авторизации
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        try {
            currentUser = JSON.parse(userData);
            isAuthenticated = true;
            showUserProfile();
        } catch (e) {
            console.error('Ошибка парсинга данных пользователя:', e);
            logout();
        }
    }
}

// Показать модальное окно входа
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Показать модальное окно регистрации
function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Закрыть модальное окно
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    // Очистить формы
    if (modalId === 'loginModal') {
        document.getElementById('loginForm').reset();
    } else if (modalId === 'registerModal') {
        document.getElementById('registerForm').reset();
    }
}

// Переключение между модальными окнами
function switchModal(fromModal, toModal) {
    closeModal(fromModal);
    showModal(toModal);
}

// Показать модальное окно
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Обработка входа
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    try {
        // В реальном приложении здесь будет API запрос
        // Пока используем моковые данные
        const userData = {
            id: 1,
            username: username,
            email: username + '@example.com',
            avatar: 'images/default-avatar.png',
            bio: 'Пользователь LegendScript',
            createdAt: new Date().toISOString()
        };
        
        // Сохраняем данные пользователя
        localStorage.setItem('authToken', 'mock-token-' + Date.now());
        localStorage.setItem('userData', JSON.stringify(userData));
        
        currentUser = userData;
        isAuthenticated = true;
        
        closeModal('loginModal');
        showUserProfile();
        showNotification('Успешный вход!', 'success');
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        showNotification('Ошибка входа. Попробуйте еще раз.', 'error');
    }
}

// Обработка регистрации
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const captchaInput = document.getElementById('captchaInput').value.trim();
    const captchaText = document.getElementById('captchaText').textContent;
    
    // Валидация
    if (!username || !email || !password || !passwordConfirm) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    if (username.length < 3 || username.length > 20) {
        showNotification('Имя пользователя должно быть от 3 до 20 символов', 'error');
        return;
    }
    
    if (password !== passwordConfirm) {
        showNotification('Пароли не совпадают', 'error');
        return;
    }
    // Проверка сложности пароля (строгая)
    if (!isPasswordStrong(password)) {
        showNotification('Пароль должен быть не менее 12 символов и содержать строчные, ЗАГЛАВНЫЕ буквы, цифры и спецсимволы', 'error');
        return;
    }
    
    // Проверка капчи
    if (captchaInput !== captchaText) {
        showNotification('Неверная капча. Попробуйте еще раз', 'error');
        generateCaptcha(); // Генерируем новую капчу
        return;
    }
    
    try {
        // В реальном приложении здесь будет API запрос
        // Пока используем моковые данные
        const userData = {
            id: Date.now(),
            username: username,
            email: email,
            avatar: 'images/default-avatar.png',
            bio: 'Новый пользователь LegendScript',
            createdAt: new Date().toISOString()
        };
        
        // Сохраняем данные пользователя
        localStorage.setItem('authToken', 'mock-token-' + Date.now());
        localStorage.setItem('userData', JSON.stringify(userData));
        
        currentUser = userData;
        isAuthenticated = true;
        
        closeModal('registerModal');
        showUserProfile();
        showNotification('Регистрация успешна! Добро пожаловать!', 'success');
        
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showNotification('Ошибка регистрации. Попробуйте еще раз.', 'error');
    }
}

// Проверка пароля на сложность
function isPasswordStrong(pwd) {
    if (!pwd || pwd.length < 12) return false;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9\s]/.test(pwd);
    return hasLower && hasUpper && hasDigit && hasSpecial;
}

// Генерация сильного пароля и автозаполнение
function generateStrongPassword(primaryId = 'registerPassword', confirmId = 'registerPasswordConfirm') {
    const length = 16; // по умолчанию 16
    const lowers = 'abcdefghijkmnopqrstuvwxyz';
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '23456789';
    const specials = '!@#$%^&*()-_=+[]{};:,.?/';
    const all = lowers + uppers + digits + specials;
    function pick(str) { return str[Math.floor(Math.random() * str.length)]; }
    let pwd = pick(lowers) + pick(uppers) + pick(digits) + pick(specials);
    for (let i = pwd.length; i < length; i++) {
        pwd += pick(all);
    }
    // перемешаем
    pwd = pwd.split('').sort(() => Math.random() - 0.5).join('');
    lastGeneratedPassword = pwd;
    const primary = document.getElementById(primaryId);
    const confirm = document.getElementById(confirmId);
    if (primary) primary.value = pwd;
    if (confirm) confirm.value = pwd;
}

// Показать профиль пользователя
function showUserProfile() {
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const username = document.getElementById('username');
    const userAvatar = document.getElementById('userAvatar');
    
    if (isAuthenticated && currentUser) {
        authButtons.style.display = 'none';
        userProfile.style.display = 'block';
        username.textContent = currentUser.username;
        userAvatar.src = currentUser.avatar;
    } else {
        authButtons.style.display = 'flex';
        userProfile.style.display = 'none';
    }
}

// Показать выпадающее меню профиля
function showProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('show');
}

// Скрыть выпадающее меню профиля при клике вне его
document.addEventListener('click', function(event) {
    const profile = document.querySelector('.user-profile');
    const dropdown = document.getElementById('profileDropdown');
    
    if (profile && !profile.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Показать страницу профиля
function showProfilePage() {
    const modal = document.getElementById('profileModal');
    
    // Заполняем поля данными пользователя
    if (currentUser) {
        document.getElementById('profileUsername').value = currentUser.username;
        document.getElementById('profileEmail').value = currentUser.email;
        document.getElementById('profileBio').value = currentUser.bio || '';
        document.getElementById('profileAvatar').src = currentUser.avatar;
    }
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Показать мои скрипты
function showMyScripts() {
    const userScripts = JSON.parse(localStorage.getItem('userScripts') || '[]')
        .filter(s => s.authorId === currentUser?.id);
    
    const modal = document.createElement('div');
    modal.className = 'modal scripts-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 960px;">
            <div class="modal-header">
                <h2>Мои скрипты</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                ${userScripts.length === 0 ? `
                    <div class="no-results" style="text-align:center;">
                        <i class="fas fa-inbox"></i>
                        <h3>У вас пока нет загруженных скриптов</h3>
                    </div>
                ` : `
                <div class="scripts-grid-modal">
                    ${userScripts.map(script => `
                        <div class="script-card-modal" data-id="${script.id}">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
                                <div>
                                    <h3>${escapeHtml(script.name)}</h3>
                                    <p>${escapeHtml(script.description)}</p>
                                </div>
                                <span class="status-badge ${script.status === 'approved' ? 'ok' : 'pending'}">${script.status === 'approved' ? 'Одобрен' : 'На модерации'}</span>
                            </div>
                            <div class="script-meta">
                                <span class="script-category">${escapeHtml(String(script.category || ''))}</span>
                                <span class="script-date">${new Date(script.createdAt).toLocaleDateString('ru-RU')}</span>
                            </div>
                            <div class="script-actions">
                                <button class="btn btn-secondary" onclick="previewMyScript(${script.id})"><i class="fas fa-eye"></i> Предпросмотр</button>
                                <button class="btn btn-secondary" onclick="editMyScript(${script.id})"><i class="fas fa-edit"></i> Редактировать</button>
                                <button class="btn btn-secondary" onclick="toggleStatusMyScript(${script.id})"><i class="fas fa-check-circle"></i> ${script.status === 'approved' ? 'Снять с главной' : 'Опубликовать'}</button>
                                <button class="btn btn-secondary" onclick="duplicateMyScript(${script.id})"><i class="fas fa-copy"></i> Дублировать</button>
                                <button class="btn btn-secondary" onclick="exportMyScript(${script.id})"><i class="fas fa-download"></i> Экспорт</button>
                                <button class="btn btn-secondary" onclick="deleteMyScript(${script.id})"><i class="fas fa-trash"></i> Удалить</button>
                            </div>
                        </div>
                    `).join('')}
                </div>`}
            </div>
        </div>
    `;
    
    attachMyScriptsStyles();
    document.body.appendChild(modal);
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function attachMyScriptsStyles() {
    if (document.getElementById('myscripts-styles')) return;
    const styles = document.createElement('style');
    styles.id = 'myscripts-styles';
    styles.textContent = `
        .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; border:1px solid rgba(255,255,255,0.15); }
        .status-badge.ok { background: rgba(16,185,129,.15); color:#10b981; border-color: rgba(16,185,129,.35); }
        .status-badge.pending { background: rgba(245,158,11,.12); color:#f59e0b; border-color: rgba(245,158,11,.35); }
        .script-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top: 12px; }
    `;
    document.head.appendChild(styles);
}

// Действия в "Моих скриптах"
function getUserScriptsOwned() {
    return JSON.parse(localStorage.getItem('userScripts') || '[]').filter(s => s.authorId === currentUser?.id);
}

function saveUserScripts(list) {
    localStorage.setItem('userScripts', JSON.stringify(list));
    if (window.refreshScripts) window.refreshScripts();
}

function previewMyScript(id) {
    const s = getUserScriptsOwned().find(x => x.id === id);
    if (s) {
        window.open(`script.html?id=${s.id}`, '_blank');
    }
}

function editMyScript(id) {
    const all = JSON.parse(localStorage.getItem('userScripts') || '[]');
    const s = all.find(x => x.id === id && x.authorId === currentUser?.id);
    if (!s) return;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:760px;">
            <div class="modal-header">
                <h2>Редактировать скрипт</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Название</label>
                    <input type="text" id="edit_name" value="${escapeHtml(s.name)}" />
                </div>
                <div class="form-group">
                    <label>Категория</label>
                    <input type="text" id="edit_category" value="${escapeHtml(String(s.category||''))}" />
                </div>
                <div class="form-group">
                    <label>Теги (через запятую)</label>
                    <input type="text" id="edit_tags" value="${escapeHtml((s.tags||[]).join(', '))}" />
                </div>
                <div class="form-group">
                    <label>Описание</label>
                    <textarea id="edit_description" rows="3">${escapeHtml(s.description||'')}</textarea>
                </div>
                <div class="form-group">
                    <label>Изображение</label>
                    <input type="file" id="edit_image_file" accept="image/*" />
                    <div style="margin-top:10px; ${s.image?'' : 'display:none;'}" id="edit_image_preview_wrap">
                        <img id="edit_image_preview" src="${s.image||''}" alt="Превью" style="max-width:100%; max-height:220px; border-radius:8px; border:1px solid rgba(255,255,255,.12);"/>
                    </div>
                </div>
                <div class="form-group">
                    <label>Код</label>
                    <textarea id="edit_code" rows="10">${escapeHtml(s.code||'')}</textarea>
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button class="btn btn-primary" onclick="saveEditMyScript(${s.id})"><i class="fas fa-save"></i> Сохранить</button>
                    <button class="btn btn-secondary" onclick="document.querySelector('.modal.show')?.remove(); document.body.style.overflow='auto';"><i class="fas fa-times"></i> Отмена</button>
                </div>
            </div>
        </div>
    `;
    // обработчик выбора изображения
    setTimeout(()=>{
        const input = document.getElementById('edit_image_file');
        if (input){
            input.onchange = (e)=>{
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 2*1024*1024){ showNotification('Изображение больше 2 МБ','error'); input.value=''; return; }
                const reader = new FileReader();
                reader.onload = (ev)=>{
                    const wrap = document.getElementById('edit_image_preview_wrap');
                    const img = document.getElementById('edit_image_preview');
                    if (wrap) wrap.style.display = 'block';
                    if (img) img.src = ev.target.result;
                    // временно кладем в dataset, сохраним при submit
                    input.dataset.previewData = ev.target.result;
                };
                reader.readAsDataURL(file);
            };
        }
    },0);
    document.body.appendChild(modal);
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function saveEditMyScript(id) {
    const all = JSON.parse(localStorage.getItem('userScripts') || '[]');
    const idx = all.findIndex(x => x.id === id && x.authorId === currentUser?.id);
    if (idx === -1) return;
    const name = document.getElementById('edit_name').value.trim();
    const category = document.getElementById('edit_category').value.trim();
    const tags = document.getElementById('edit_tags').value.trim();
    const description = document.getElementById('edit_description').value.trim();
    const code = document.getElementById('edit_code').value;
    if (!name || !code) { showNotification('Название и код обязательны', 'error'); return; }
    all[idx].name = name;
    all[idx].category = category;
    all[idx].tags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    all[idx].description = description;
    all[idx].code = code;
    // сохраняем изображение если выбрано
    const imgInput = document.getElementById('edit_image_file');
    const picked = imgInput && imgInput.dataset && imgInput.dataset.previewData ? imgInput.dataset.previewData : null;
    if (picked) all[idx].image = picked;
    // После редактирования снова автомодерация
    const moder = moderateScript({ name, description, code, tags });
    all[idx].status = moder.approved ? 'approved' : 'pending';
    all[idx].moderationReport = moder;
    saveUserScripts(all);
    document.querySelector('.modal.show')?.remove();
    document.body.style.overflow = 'auto';
    showNotification('Скрипт сохранен', 'success');
}

function deleteMyScript(id) {
    const all = JSON.parse(localStorage.getItem('userScripts') || '[]');
    const s = all.find(x => x.id === id && x.authorId === currentUser?.id);
    if (!s) return;
    if (!confirm('Удалить скрипт без возможности восстановления?')) return;
    const next = all.filter(x => !(x.id === id && x.authorId === currentUser?.id));
    saveUserScripts(next);
    document.querySelector('.modal.show')?.remove();
    showMyScripts();
    showNotification('Скрипт удален', 'success');
}

function toggleStatusMyScript(id) {
    const all = JSON.parse(localStorage.getItem('userScripts') || '[]');
    const idx = all.findIndex(x => x.id === id && x.authorId === currentUser?.id);
    if (idx === -1) return;
    const current = all[idx].status || 'approved';
    all[idx].status = current === 'approved' ? 'pending' : 'approved';
    saveUserScripts(all);
    document.querySelector('.modal.show')?.remove();
    showMyScripts();
}

function duplicateMyScript(id) {
    const all = JSON.parse(localStorage.getItem('userScripts') || '[]');
    const s = all.find(x => x.id === id && x.authorId === currentUser?.id);
    if (!s) return;
    const copy = { ...s, id: Date.now(), name: `${s.name} (копия)`, createdAt: new Date().toISOString(), status: 'pending' };
    all.push(copy);
    saveUserScripts(all);
    document.querySelector('.modal.show')?.remove();
    showMyScripts();
    showNotification('Скрипт продублирован', 'success');
}

function exportMyScript(id) {
    const s = getUserScriptsOwned().find(x => x.id === id);
    if (!s) return;
    const blob = new Blob([s.code || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${s.name.replace(/[^a-z0-9-_]/gi,'_')}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Показать загрузку скрипта
function showUploadScript() {
    const modal = document.getElementById('uploadScriptModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    // привяжем предпросмотр для загрузки изображения
    const file = document.getElementById('scriptImageFile');
    const wrap = document.getElementById('scriptImagePreviewWrap');
    const img = document.getElementById('scriptImagePreview');
    if (file && wrap && img){
        file.onchange = (e)=>{
            const f = e.target.files[0];
            if (!f) return;
            if (f.size > 2*1024*1024){ showNotification('Изображение больше 2 МБ','error'); file.value=''; return; }
            const reader = new FileReader();
            reader.onload = (ev)=>{ img.src = ev.target.result; wrap.style.display='block'; };
            reader.readAsDataURL(f);
        };
    }
}

// Загрузка категорий для формы загрузки скрипта
function loadCategoriesForUpload() {
    const select = document.getElementById('scriptCategory');
    if (!select) return;
    
    // В реальном приложении здесь будет загрузка категорий из API
    const categories = [
        { id: 1, name: 'Автофарм' },
        { id: 2, name: 'Комбат' },
        { id: 3, name: 'Телепорт' },
        { id: 4, name: 'Визуал' },
        { id: 5, name: 'Утилиты' }
    ];
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

// Обработка загрузки скрипта
async function handleScriptUpload(event) {
    event.preventDefault();
    
    const name = document.getElementById('scriptName').value;
    const categorySelect = document.getElementById('scriptCategory');
    const categoryId = categorySelect ? categorySelect.value : '';
    const categoryName = categorySelect ? categorySelect.options[categorySelect.selectedIndex]?.textContent : '';
    const description = document.getElementById('scriptDescription').value;
    const code = document.getElementById('scriptCode').value;
    const tags = document.getElementById('scriptTags').value;
    const imageInput = document.getElementById('scriptImageFile');
    let imageData = null;
    if (imageInput && imageInput.files && imageInput.files[0]){
        const file = imageInput.files[0];
        if (file.size > 2*1024*1024){ showNotification('Изображение больше 2 МБ','error'); return; }
        imageData = await new Promise((resolve)=>{ const r=new FileReader(); r.onload=(e)=>resolve(e.target.result); r.readAsDataURL(file); });
    }
    
    if (!name || !categoryId || !description || !code) {
        showNotification('Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }
    
    try {
        // Автомодерация
        const moderation = moderateScript({ name, description, code, tags });

        // Данные скрипта
        const scriptData = {
            id: Date.now(),
            name: name,
            categoryId: categoryId,
            category: categoryName || categoryId,
            description: description,
            code: code,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            author: currentUser.username,
            authorId: currentUser.id,
            createdAt: new Date().toISOString(),
            views: 0,
            rating: 0,
            ratingCount: 0,
            status: moderation.approved ? 'approved' : 'pending',
            moderationReport: moderation,
            image: imageData
        };
        
        // Сохраняем скрипт в localStorage (в реальном приложении - в базу данных)
        const scripts = JSON.parse(localStorage.getItem('userScripts') || '[]');
        scripts.push(scriptData);
        localStorage.setItem('userScripts', JSON.stringify(scripts));
        
        closeModal('uploadScriptModal');
        if (moderation.approved) {
            showNotification('Скрипт загружен и одобрен модерацией. Он уже на главной!', 'success');
        } else {
            showNotification('Скрипт отправлен на модерацию. Появится на главной после одобрения.', 'info');
        }
        
        // Очищаем форму
        document.getElementById('uploadScriptForm').reset();
        const wrap = document.getElementById('scriptImagePreviewWrap');
        if (wrap) { wrap.style.display='none'; }

        // Обновляем список скриптов на главной
        if (window.refreshScripts) {
            window.refreshScripts();
        }
        
    } catch (error) {
        console.error('Ошибка загрузки скрипта:', error);
        showNotification('Ошибка загрузки скрипта. Попробуйте еще раз.', 'error');
    }
}

// Простая автомодерация: проверка на мат и подозрительные конструкции
function moderateScript({ name, description, code, tags }) {
    const text = `${name} ${description} ${(tags || '').toString()}`.toLowerCase();
    const codeLower = (code || '').toLowerCase();
    const profanity = [
        'блять','бляд','сука','хуе','пизд','еба','еб@','shit','fuck','bitch','asshole'
    ];
    const suspicious = [
        'loadstring','httpget','httprequest','syn.request','getgenv','getrawmetatable',
        'hookfunction','setreadonly','newcclosure','firetouchinterest','queue_on_teleport',
        'webhook','token','keylogger','clipboard','debug.getupvalue','debug.setupvalue',
        'getfenv','setfenv','writefile','readfile','isfile','appendfile'
    ];
    const urls = /(https?:\/\/|www\.)/i.test(codeLower);

    const hasProfanity = profanity.some(w => text.includes(w));
    let suspiciousHits = 0;
    suspicious.forEach(w => { if (codeLower.includes(w)) suspiciousHits++; });

    const approved = !hasProfanity && suspiciousHits <= 1 && !urls; // базовое правило
    const reasons = [];
    if (hasProfanity) reasons.push('Обнаружена ненормативная лексика');
    if (suspiciousHits > 1) reasons.push('Подозрительные вызовы API в коде');
    if (urls) reasons.push('Сторонние ссылки в коде');

    return { approved, reasons, checkedAt: new Date().toISOString() };
}

// Сохранение профиля
async function saveProfile() {
    const username = document.getElementById('profileUsername').value;
    const email = document.getElementById('profileEmail').value;
    const bio = document.getElementById('profileBio').value;
    
    if (!username || !email) {
        showNotification('Имя пользователя и email обязательны', 'error');
        return;
    }
    
    try {
        // Обновляем данные пользователя
        currentUser.username = username;
        currentUser.email = email;
        currentUser.bio = bio;
        
        // Сохраняем в localStorage
        localStorage.setItem('userData', JSON.stringify(currentUser));
        
        // Обновляем отображение
        document.getElementById('username').textContent = username;
        
        showNotification('Профиль успешно обновлен!', 'success');
        
    } catch (error) {
        console.error('Ошибка сохранения профиля:', error);
        showNotification('Ошибка сохранения профиля', 'error');
    }
}

// Изменение пароля
async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showNotification('Новые пароли не совпадают', 'error');
        return;
    }
    if (!isPasswordStrong(newPassword)) {
        showNotification('Пароль должен быть не менее 12 символов и содержать строчные, ЗАГЛАВНЫЕ буквы, цифры и спецсимволы', 'error');
        return;
    }
    
    try {
        // В реальном приложении здесь будет проверка текущего пароля и обновление
        showNotification('Пароль успешно изменен!', 'success');
        
        // Очищаем поля
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
        
    } catch (error) {
        console.error('Ошибка изменения пароля:', error);
        showNotification('Ошибка изменения пароля', 'error');
    }
}

// Изменение аватара
function changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const avatar = e.target.result;
                currentUser.avatar = avatar;
                
                // Обновляем отображение
                document.getElementById('userAvatar').src = avatar;
                document.getElementById('profileAvatar').src = avatar;
                
                // Сохраняем в localStorage
                localStorage.setItem('userData', JSON.stringify(currentUser));
                
                showNotification('Аватар успешно обновлен!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

// Выход из аккаунта
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    currentUser = null;
    isAuthenticated = false;
    
    showUserProfile();
    showNotification('Вы успешно вышли из аккаунта', 'info');
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Добавляем в DOM
    document.body.appendChild(notification);
    
    // Автоматически удаляем через 5 секунд
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Закрытие модальных окон при клике вне их
document.addEventListener('click', function(event) {
    // Закрываем модальное окно только при клике на фон (.modal), а не на содержимое
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
});

// Закрытие модальных окон по Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = 'auto';
    }
});

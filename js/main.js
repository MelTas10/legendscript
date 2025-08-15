// Основной JavaScript файл для LegendScript

// Глобальные переменные
let categories = [];
let scripts = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Основная функция инициализации
function initializeApp() {
    console.log('🚀 LegendScript - Инициализация приложения');
    
    // Инициализация навигации
    initNavigation();
    
    // Инициализация анимаций
    initAnimations();
    
    // Загрузка данных
    loadCategories();
    loadScripts();
    
    // Инициализация плавной прокрутки
    initSmoothScrolling();
}

// Инициализация навигации
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const links = document.querySelectorAll('.nav-link');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Плавные переходы между "страницами" (внутренние секции как сайты)
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    document.querySelectorAll('section').forEach(sec => sec.classList.remove('active-page'));
                    target.classList.add('active-page');
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
    
    // Изменение навигации при скролле
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Инициализация анимаций
function initAnimations() {
    // Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Наблюдение за элементами
    document.querySelectorAll('.category-card, .script-card, .info-card, .stat-item').forEach(el => {
        observer.observe(el);
    });
}

// Загрузка категорий
async function loadCategories() {
    try {
        console.log('📁 Загрузка категорий...');
        
        // Показываем спиннер
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (!categoriesGrid) return;
        
        // В реальном приложении здесь будет API запрос
        // Пока используем моковые данные
        const mockCategories = [
            {
                id: 1,
                name: 'Автофарм',
                description: 'Автоматический фарм ресурсов и валюты',
                icon: 'fas fa-seedling',
                scriptCount: 45
            },
            {
                id: 2,
                name: 'Комбат',
                description: 'Улучшения для PvP и боевых действий',
                icon: 'fas fa-sword',
                scriptCount: 38
            },
            {
                id: 3,
                name: 'Телепорт',
                description: 'Быстрое перемещение по карте',
                icon: 'fas fa-location-arrow',
                scriptCount: 52
            },
            {
                id: 4,
                name: 'Визуал',
                description: 'Графические улучшения и эффекты',
                icon: 'fas fa-eye',
                scriptCount: 67
            },
            {
                id: 5,
                name: 'Утилиты',
                description: 'Полезные инструменты и функции',
                icon: 'fas fa-tools',
                scriptCount: 89
            },
            {
                id: 6,
                name: 'Эксплойты',
                description: 'Продвинутые возможности',
                icon: 'fas fa-rocket',
                scriptCount: 23
            }
        ];
        
        categories = mockCategories;
        
        // Скрываем спиннер и показываем категории
        setTimeout(() => {
            categoriesGrid.innerHTML = '';
            categories.forEach(category => {
                const categoryCard = createCategoryCard(category);
                categoriesGrid.appendChild(categoryCard);
            });
        }, 1000);
        
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        showError('Не удалось загрузить категории');
    }
}

// Создание карточки категории
function createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.onclick = () => showCategoryScripts(category);
    
    card.innerHTML = `
        <i class="${category.icon}"></i>
        <h3>${category.name}</h3>
        <p>${category.description}</p>
        <div class="category-stats">
            <span class="script-count">${category.scriptCount} скриптов</span>
        </div>
    `;
    
    return card;
}

// Показать скрипты категории
function showCategoryScripts(category) {
    // В реальном приложении здесь будет фильтрация скриптов по категории
    console.log(`Показать скрипты категории: ${category.name}`);
    
    // Прокручиваем к секции скриптов
    const scriptsSection = document.getElementById('scripts');
    if (scriptsSection) {
        scriptsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Фильтруем скрипты по категории
    if (window.searchScripts) {
        window.searchScripts(category.name);
    }
}

// Загрузка скриптов
async function loadScripts() {
    try {
        console.log('📜 Загрузка скриптов...');
        
        // Показываем спиннер
        const scriptsGrid = document.getElementById('scriptsGrid');
        if (!scriptsGrid) return;
        
        // В реальном приложении здесь будет API запрос
        // Скрипты загружаются в scripts.js
        
        // Скрываем спиннер через некоторое время
        setTimeout(() => {
            const spinner = scriptsGrid.querySelector('.loading-spinner');
            if (spinner) {
                spinner.style.display = 'none';
            }
        }, 1500);
        
    } catch (error) {
        console.error('Ошибка загрузки скриптов:', error);
        showError('Не удалось загрузить скрипты');
    }
}

// Плавная прокрутка
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Показать ошибку
function showError(message) {
    console.error('❌ Ошибка:', message);
    
    // Создаем уведомление об ошибке
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
    `;
    
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Автоматически удаляем через 5 секунд
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

// Добавляем CSS для ошибок
const errorStyles = document.createElement('style');
errorStyles.textContent = `
    .error-notification i {
        color: white;
        font-size: 18px;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(errorStyles);

// Экспортируем функции для использования в других модулях
window.showCategoryScripts = showCategoryScripts;
window.showError = showError;

// API интеграция для LegendScript

// Конфигурация API
const API_CONFIG = {
    baseUrl: 'https://api.legendscript.com', // Замените на реальный URL
    timeout: 10000,
    retries: 3
};

// Класс для работы с API
class LegendScriptAPI {
    constructor() {
        this.baseUrl = API_CONFIG.baseUrl;
        this.timeout = API_CONFIG.timeout;
        this.retries = API_CONFIG.retries;
    }

    // Базовый метод для HTTP запросов
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: this.timeout,
            ...options
        };

        let lastError;
        
        for (let attempt = 1; attempt <= this.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                return data;
                
            } catch (error) {
                lastError = error;
                console.warn(`API запрос ${endpoint} попытка ${attempt} не удалась:`, error);
                
                if (attempt === this.retries) {
                    throw new Error(`API запрос не удался после ${this.retries} попыток: ${error.message}`);
                }
                
                // Ждем перед повторной попыткой
                await this.delay(1000 * attempt);
            }
        }
    }

    // Задержка между попытками
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Получение категорий
    async getCategories() {
        try {
            console.log('📁 Запрос категорий из API...');
            const data = await this.request('/api/categories');
            return data.categories || [];
        } catch (error) {
            console.error('❌ Ошибка получения категорий:', error);
            // Возвращаем моковые данные в случае ошибки
            return this.getMockCategories();
        }
    }

    // Получение скриптов
    async getScripts(limit = 10) {
        try {
            console.log('📜 Запрос скриптов из API...');
            const data = await this.request(`/api/scripts?limit=${limit}`);
            return data.scripts || [];
        } catch (error) {
            console.error('❌ Ошибка получения скриптов:', error);
            // Возвращаем моковые данные в случае ошибки
            return this.getMockScripts();
        }
    }

    // Получение статистики
    async getStats() {
        try {
            console.log('📊 Запрос статистики из API...');
            const data = await this.request('/api/stats');
            return data.stats || {};
        } catch (error) {
            console.error('❌ Ошибка получения статистики:', error);
            // Возвращаем моковые данные в случае ошибки
            return this.getMockStats();
        }
    }

    // Получение информации о боте
    async getBotInfo() {
        try {
            console.log('🤖 Запрос информации о боте из API...');
            const data = await this.request('/api/bot-info');
            return data.bot || {};
        } catch (error) {
            console.error('❌ Ошибка получения информации о боте:', error);
            // Возвращаем моковые данные в случае ошибки
            return this.getMockBotInfo();
        }
    }

    // Получение скриптов по категории
    async getScriptsByCategory(categoryId) {
        try {
            console.log(`📜 Запрос скриптов категории ${categoryId} из API...`);
            const data = await this.request(`/api/categories/${categoryId}/scripts`);
            return data.scripts || [];
        } catch (error) {
            console.error('❌ Ошибка получения скриптов категории:', error);
            return [];
        }
    }

    // Поиск скриптов
    async searchScripts(query) {
        try {
            console.log(`🔍 Поиск скриптов: ${query}`);
            const data = await this.request(`/api/search?q=${encodeURIComponent(query)}`);
            return data.scripts || [];
        } catch (error) {
            console.error('❌ Ошибка поиска скриптов:', error);
            return [];
        }
    }

    // Получение популярных скриптов
    async getPopularScripts() {
        try {
            console.log('🔥 Запрос популярных скриптов из API...');
            const data = await this.request('/api/scripts/popular');
            return data.scripts || [];
        } catch (error) {
            console.error('❌ Ошибка получения популярных скриптов:', error);
            return this.getMockPopularScripts();
        }
    }

    // Получение новейших скриптов
    async getLatestScripts() {
        try {
            console.log('🆕 Запрос новейших скриптов из API...');
            const data = await this.request('/api/scripts/latest');
            return data.scripts || [];
        } catch (error) {
            console.error('❌ Ошибка получения новейших скриптов:', error);
            return this.getMockLatestScripts();
        }
    }

    // Моковые данные для категорий
    getMockCategories() {
        return [
            {
                id: 1,
                name: 'Автофарм',
                description: 'Автоматический фарм ресурсов',
                scriptCount: 25,
                views: 1500,
                icon: 'fas fa-robot'
            },
            {
                id: 2,
                name: 'Комбат',
                description: 'Скрипты для боевой системы',
                scriptCount: 18,
                views: 2200,
                icon: 'fas fa-sword'
            },
            {
                id: 3,
                name: 'Телепорт',
                description: 'Телепортация по карте',
                scriptCount: 12,
                views: 800,
                icon: 'fas fa-location-arrow'
            },
            {
                id: 4,
                name: 'Визуал',
                description: 'Визуальные улучшения',
                scriptCount: 30,
                views: 3000,
                icon: 'fas fa-eye'
            },
            {
                id: 5,
                name: 'Утилиты',
                description: 'Полезные инструменты',
                scriptCount: 22,
                views: 1200,
                icon: 'fas fa-tools'
            },
            {
                id: 6,
                name: 'Эксплойты',
                description: 'Эксплойты и читы',
                scriptCount: 15,
                views: 1800,
                icon: 'fas fa-bug'
            }
        ];
    }

    // Моковые данные для скриптов
    getMockScripts() {
        return [
            {
                id: 1,
                name: 'Auto Farm Pro',
                description: 'Продвинутый автофарм с настройками',
                rating: 4.8,
                views: 2500,
                category: 'Автофарм',
                author: 'LegendScript',
                updatedAt: '2025-01-15'
            },
            {
                id: 2,
                name: 'Combat Master',
                description: 'Улучшенная боевая система',
                rating: 4.9,
                views: 3200,
                category: 'Комбат',
                author: 'LegendScript',
                updatedAt: '2025-01-14'
            },
            {
                id: 3,
                name: 'Teleport Hub',
                description: 'Центр телепортации по всем локациям',
                rating: 4.7,
                views: 1800,
                category: 'Телепорт',
                author: 'LegendScript',
                updatedAt: '2025-01-13'
            },
            {
                id: 4,
                name: 'Visual Enhancer',
                description: 'Улучшение графики и эффектов',
                rating: 4.6,
                views: 2100,
                category: 'Визуал',
                author: 'LegendScript',
                updatedAt: '2025-01-12'
            }
        ];
    }

    // Моковые данные для популярных скриптов
    getMockPopularScripts() {
        return [
            {
                id: 1,
                name: 'Auto Farm Pro',
                description: 'Продвинутый автофарм с настройками',
                rating: 4.8,
                views: 2500,
                category: 'Автофарм',
                downloads: 1500
            },
            {
                id: 2,
                name: 'Combat Master',
                description: 'Улучшенная боевая система',
                rating: 4.9,
                views: 3200,
                category: 'Комбат',
                downloads: 2100
            },
            {
                id: 3,
                name: 'Teleport Hub',
                description: 'Центр телепортации по всем локациям',
                rating: 4.7,
                views: 1800,
                category: 'Телепорт',
                downloads: 1200
            }
        ];
    }

    // Моковые данные для новейших скриптов
    getMockLatestScripts() {
        return [
            {
                id: 5,
                name: 'New Script 2025',
                description: 'Новейший скрипт с уникальными возможностями',
                rating: 4.5,
                views: 500,
                category: 'Утилиты',
                createdAt: '2025-01-15'
            },
            {
                id: 6,
                name: 'Latest Update',
                description: 'Обновленная версия популярного скрипта',
                rating: 4.7,
                views: 800,
                category: 'Визуал',
                createdAt: '2025-01-14'
            }
        ];
    }

    // Моковые данные для статистики
    getMockStats() {
        return {
            totalUsers: 99577,
            totalScripts: 500,
            totalCategories: 6,
            totalDownloads: 150000,
            averageRating: 4.7,
            activeUsers: 15000,
            scriptsThisMonth: 25
        };
    }

    // Моковые данные для информации о боте
    getMockBotInfo() {
        return {
            name: 'LegendScript',
            version: '2.0.0',
            description: 'Лучшие скрипты для Roblox',
            owner: '@LegendaPapa1',
            coOwner: '@fgllsx',
            newsChannel: '@xzczxczVxcvdfs',
            mainChannel: '@legendscriptrb',
            chat: '@scriptlegendchat',
            botUsername: '@LegendLink_bot'
        };
    }
}

// Создание экземпляра API
const api = new LegendScriptAPI();

// Экспорт для использования в других модулях
window.LegendScriptAPI = api;

// Функции для интеграции с основным кодом
window.loadCategoriesFromAPI = async function() {
    try {
        const categories = await api.getCategories();
        if (window.renderCategories) {
            window.renderCategories(categories);
        }
        return categories;
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        return [];
    }
};

window.loadScriptsFromAPI = async function() {
    try {
        const scripts = await api.getScripts();
        if (window.renderScripts) {
            window.renderScripts(scripts);
        }
        return scripts;
    } catch (error) {
        console.error('Ошибка загрузки скриптов:', error);
        return [];
    }
};

window.loadStatsFromAPI = async function() {
    try {
        const stats = await api.getStats();
        if (window.updateStats) {
            window.updateStats(stats);
        }
        return stats;
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
        return {};
    }
};

// Инициализация API при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LegendScript API инициализирован');
    
    // Загружаем данные из API
    loadCategoriesFromAPI();
    loadScriptsFromAPI();
    loadStatsFromAPI();
});

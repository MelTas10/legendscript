// Дополнительные анимации для LegendScript

// Класс для управления анимациями
class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.observers = new Map();
        this.init();
    }

    // Инициализация
    init() {
        console.log('🎬 AnimationManager инициализирован');
        this.setupIntersectionObservers();
        this.setupScrollAnimations();
        this.setupParallaxEffects();
        this.setupTypingAnimations();
        this.setupParticleEffects();
    }

    // Настройка Intersection Observer для анимаций появления
    setupIntersectionObservers() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, options);

        // Наблюдение за элементами
        document.querySelectorAll('.category-card, .script-card, .info-card, .stat-item').forEach(el => {
            observer.observe(el);
        });

        this.observers.set('appear', observer);
    }

    // Анимация элемента
    animateElement(element) {
        if (element.classList.contains('animated')) return;

        element.classList.add('animated');
        
        // Добавляем класс анимации в зависимости от типа элемента
        if (element.classList.contains('category-card')) {
            element.classList.add('animate-in');
        } else if (element.classList.contains('script-card')) {
            element.classList.add('animate-scale-in');
        } else if (element.classList.contains('info-card')) {
            element.classList.add('animate-in-left');
        } else if (element.classList.contains('stat-item')) {
            element.classList.add('animate-scale-in');
        }
    }

    // Настройка анимаций при скролле
    setupScrollAnimations() {
        let ticking = false;

        const updateScrollAnimations = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });

            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollAnimations);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick);
    }

    // Настройка параллакс эффектов
    setupParallaxEffects() {
        // Добавляем класс parallax к элементам
        document.querySelectorAll('.hero-content, .floating-card').forEach(el => {
            el.classList.add('parallax');
            el.dataset.speed = '0.3';
        });

        document.querySelectorAll('.stars, .nebula').forEach(el => {
            el.classList.add('parallax');
            el.dataset.speed = '0.1';
        });
    }

    // Настройка анимации печатания
    setupTypingAnimations() {
        const typingElements = document.querySelectorAll('.typing-animation');
        
        typingElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid var(--primary-color)';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                } else {
                    element.style.borderRight = 'none';
                }
            };
            
            // Запускаем анимацию при появлении элемента
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        typeWriter();
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(element);
        });
    }

    // Настройка эффектов частиц
    setupParticleEffects() {
        this.createParticles();
        this.setupMouseTrail();
    }

    // Создание частиц
    createParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        
        document.body.appendChild(particleContainer);

        // Создаем частицы
        for (let i = 0; i < 50; i++) {
            this.createParticle(particleContainer);
        }
    }

    // Создание одной частицы
    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: var(--primary-color);
            border-radius: 50%;
            opacity: 0.6;
            pointer-events: none;
        `;

        // Случайная позиция
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';

        // Анимация
        const animate = () => {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const duration = 3000 + Math.random() * 2000;

            particle.style.transition = `all ${duration}ms ease-in-out`;
            particle.style.left = x + '%';
            particle.style.top = y + '%';
            particle.style.opacity = Math.random() * 0.8 + 0.2;

            setTimeout(animate, duration);
        };

        container.appendChild(particle);
        setTimeout(animate, Math.random() * 2000);
    }

    // След мыши
    setupMouseTrail() {
        let trail = [];
        const maxTrailLength = 20;

        document.addEventListener('mousemove', (e) => {
            const dot = document.createElement('div');
            dot.className = 'mouse-trail';
            dot.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: var(--primary-color);
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                left: ${e.clientX - 2}px;
                top: ${e.clientY - 2}px;
                opacity: 0.8;
                transition: opacity 0.3s ease;
            `;

            document.body.appendChild(dot);
            trail.push(dot);

            // Ограничиваем длину следа
            if (trail.length > maxTrailLength) {
                const oldDot = trail.shift();
                oldDot.style.opacity = '0';
                setTimeout(() => {
                    if (oldDot.parentNode) {
                        oldDot.parentNode.removeChild(oldDot);
                    }
                }, 300);
            }

            // Удаляем точки через некоторое время
            setTimeout(() => {
                if (dot.parentNode) {
                    dot.style.opacity = '0';
                    setTimeout(() => {
                        if (dot.parentNode) {
                            dot.parentNode.removeChild(dot);
                        }
                        trail = trail.filter(d => d !== dot);
                    }, 300);
                }
            }, 1000);
        });
    }

    // Анимация счетчика
    animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        };

        updateCounter();
    }

    // Анимация прогресс-бара
    animateProgressBar(element, percentage, duration = 1000) {
        const progressBar = element.querySelector('.progress-fill') || element;
        progressBar.style.width = '0%';
        progressBar.style.transition = `width ${duration}ms ease-out`;
        
        setTimeout(() => {
            progressBar.style.width = percentage + '%';
        }, 100);
    }

    // Анимация появления с задержкой
    animateWithDelay(elements, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate-in');
            }, index * delay);
        });
    }

    // Анимация тряски
    shake(element, duration = 500) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    // Анимация пульсации
    pulse(element, duration = 1000) {
        element.style.animation = 'pulse 1s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    // Анимация вращения
    rotate(element, duration = 1000) {
        element.style.animation = 'rotate 1s linear';
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    // Анимация масштабирования
    scale(element, scale = 1.1, duration = 300) {
        element.style.transition = `transform ${duration}ms ease-out`;
        element.style.transform = `scale(${scale})`;
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, duration);
    }

    // Анимация слайдера
    setupSlider() {
        const sliders = document.querySelectorAll('.slider');
        
        sliders.forEach(slider => {
            const slides = slider.querySelectorAll('.slide');
            let currentSlide = 0;

            const showSlide = (index) => {
                slides.forEach((slide, i) => {
                    slide.style.transform = `translateX(${(i - index) * 100}%)`;
                });
            };

            const nextSlide = () => {
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            };

            const prevSlide = () => {
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                showSlide(currentSlide);
            };

            // Автоматическое переключение
            setInterval(nextSlide, 5000);

            // Кнопки навигации
            const prevBtn = slider.querySelector('.prev-btn');
            const nextBtn = slider.querySelector('.next-btn');

            if (prevBtn) prevBtn.addEventListener('click', prevSlide);
            if (nextBtn) nextBtn.addEventListener('click', nextSlide);

            showSlide(0);
        });
    }

    // Анимация модального окна
    showModal(modal) {
        modal.style.display = 'flex';
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        }, 10);
    }

    hideModal(modal) {
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // Анимация загрузки
    showLoading(element) {
        element.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Загрузка...</p>
            </div>
        `;
    }

    hideLoading(element) {
        const spinner = element.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.opacity = '0';
            setTimeout(() => {
                if (spinner.parentNode) {
                    spinner.parentNode.removeChild(spinner);
                }
            }, 300);
        }
    }

    // Анимация уведомлений
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Автоматическое удаление
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Очистка всех анимаций
    cleanup() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        this.animations.clear();
    }
}

// Создание экземпляра менеджера анимаций
const animationManager = new AnimationManager();

// Экспорт для использования в других модулях
window.AnimationManager = animationManager;

// Дополнительные CSS анимации
const additionalStyles = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }

    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .parallax {
        transition: transform 0.1s ease-out;
    }

    .typing-animation {
        overflow: hidden;
        white-space: nowrap;
    }

    .particle {
        animation: float 6s ease-in-out infinite;
    }

    .mouse-trail {
        animation: fadeOut 1s ease-out forwards;
    }

    @keyframes fadeOut {
        to { opacity: 0; }
    }

    .slider {
        overflow: hidden;
        position: relative;
    }

    .slide {
        transition: transform 0.5s ease-in-out;
    }

    .modal {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
`;

// Добавление стилей на страницу
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Дополнительные анимации загружены');
    
    // Настройка слайдера
    animationManager.setupSlider();
    
    // Анимация счетчиков в статистике
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/,/g, ''));
        if (!isNaN(target)) {
            animationManager.animateCounter(counter, target);
        }
    });
});

// Очистка при выгрузке страницы
window.addEventListener('beforeunload', function() {
    animationManager.cleanup();
});


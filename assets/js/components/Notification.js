/**
 * Notification Component for H-Calculator
 */

class Notification {
    constructor(options = {}) {
        this.options = {
            position: 'top-right',
            maxVisible: 5,
            duration: 5000,
            theme: 'light',
            showProgressBar: true,
            animationDuration: 300,
            pauseOnHover: true,
            width: 320,
            ...options
        };

        this.container = null;
        this.notifications = [];
        this.init();
    }

    init() {
        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = `h-notification-container h-notification-${this.options.position}`;
        document.body.appendChild(this.container);
    }

    show(content, options = {}) {
        const notificationOptions = {
            ...this.options,
            ...options
        };

        // 최대 표시 개수 체크
        if (this.notifications.length >= notificationOptions.maxVisible) {
            this.removeNotification(this.notifications[0]);
        }

        const notification = this.createNotification(content, notificationOptions);
        this.notifications.push(notification);
        this.container.appendChild(notification);

        // 자동 제거 타이머 설정
        let timeoutId;
        let remainingTime = notificationOptions.duration;
        let startTime = Date.now();

        const startTimer = () => {
            timeoutId = setTimeout(() => {
                this.removeNotification(notification);
            }, remainingTime);
        };

        if (notificationOptions.duration > 0) {
            startTimer();
        }

        // Progress Bar 업데이트
        let progressBar = null;
        let animationFrameId = null;

        if (notificationOptions.showProgressBar && notificationOptions.duration > 0) {
            progressBar = notification.querySelector('.h-notification-progress');
            const updateProgress = () => {
                const elapsedTime = Date.now() - startTime;
                const progress = ((notificationOptions.duration - elapsedTime) / notificationOptions.duration) * 100;
                
                if (progress > 0) {
                    progressBar.style.width = `${progress}%`;
                    animationFrameId = requestAnimationFrame(updateProgress);
                }
            };
            updateProgress();
        }

        // Pause on hover
        if (notificationOptions.pauseOnHover) {
            notification.addEventListener('mouseenter', () => {
                clearTimeout(timeoutId);
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }
                remainingTime -= (Date.now() - startTime);
            });

            notification.addEventListener('mouseleave', () => {
                startTime = Date.now();
                startTimer();
                if (progressBar) {
                    updateProgress();
                }
            });
        }

        return notification;
    }

    createNotification(content, options) {
        const notification = document.createElement('div');
        notification.className = `h-notification h-notification-theme-${options.theme}`;
        notification.style.width = `${options.width}px`;

        // 아이콘 설정
        let icon = '';
        if (options.type) {
            icon = this.getIcon(options.type);
        }

        // HTML 구조
        notification.innerHTML = `
            <div class="h-notification-content">
                ${icon ? `<div class="h-notification-icon">${icon}</div>` : ''}
                <div class="h-notification-message">${content}</div>
                <button class="h-notification-close" aria-label="닫기">
                    <svg viewBox="0 0 24 24" width="14" height="14">
                        <path d="M18 6L6 18M6 6l12 12" 
                              stroke="currentColor" 
                              stroke-width="2" 
                              stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            ${options.showProgressBar ? '<div class="h-notification-progress"></div>' : ''}
        `;

        // 닫기 버튼 이벤트
        notification.querySelector('.h-notification-close')
            .addEventListener('click', () => {
                this.removeNotification(notification);
            });

        // 애니메이션 적용
        requestAnimationFrame(() => {
            notification.classList.add('h-notification-show');
        });

        return notification;
    }

    getIcon(type) {
        const icons = {
            success: `
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M20 6L9 17l-5-5" 
                          stroke="currentColor" 
                          stroke-width="2" 
                          stroke-linecap="round"/>
                </svg>
            `,
            error: `
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M18 6L6 18M6 6l12 12" 
                          stroke="currentColor" 
                          stroke-width="2" 
                          stroke-linecap="round"/>
                </svg>
            `,
            warning: `
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                          stroke="currentColor" 
                          stroke-width="2" 
                          stroke-linecap="round"/>
                </svg>
            `,
            info: `
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                          stroke="currentColor" 
                          stroke-width="2" 
                          stroke-linecap="round"/>
                </svg>
            `
        };

        return icons[type] || '';
    }

    removeNotification(notification) {
        notification.classList.remove('h-notification-show');
        notification.classList.add('h-notification-hide');

        notification.addEventListener('animationend', () => {
            notification.remove();
            this.notifications = this.notifications.filter(n => n !== notification);
        });
    }

    // 유틸리티 메서드
    success(content, options = {}) {
        return this.show(content, { ...options, type: 'success' });
    }

    error(content, options = {}) {
        return this.show(content, { ...options, type: 'error' });
    }

    warning(content, options = {}) {
        return this.show(content, { ...options, type: 'warning' });
    }

    info(content, options = {}) {
        return this.show(content, { ...options, type: 'info' });
    }

    // 모든 알림 제거
    clear() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification);
        });
    }

    // 컴포넌트 제거
    destroy() {
        this.clear();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

export default Notification;
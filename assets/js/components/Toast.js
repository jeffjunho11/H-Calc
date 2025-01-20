/**
 * Toast Notification Component for H-Calculator
 */

class Toast {
    constructor(options = {}) {
        this.options = {
            position: 'bottom-right',
            duration: 3000,
            pauseOnHover: true,
            maxVisible: 3,
            ...options
        };

        this.container = null;
        this.toasts = [];
        this.init();
    }

    init() {
        this.createContainer();
        this.setPosition();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'h-toast-container';
        document.body.appendChild(this.container);
    }

    setPosition() {
        const positions = {
            'top-left': 'h-toast-container--top-left',
            'top-right': 'h-toast-container--top-right',
            'bottom-left': 'h-toast-container--bottom-left',
            'bottom-right': 'h-toast-container--bottom-right',
            'top-center': 'h-toast-container--top-center',
            'bottom-center': 'h-toast-container--bottom-center'
        };

        this.container.classList.add(positions[this.options.position]);
    }

    show(message, type = 'info') {
        if (this.toasts.length >= this.options.maxVisible) {
            this.removeToast(this.toasts[0]);
        }

        const toast = this.createToast(message, type);
        this.toasts.push(toast);
        this.container.appendChild(toast);

        // 자동 제거 타이머 설정
        let timeoutId = setTimeout(() => {
            this.removeToast(toast);
        }, this.options.duration);

        // hover 시 타이머 일시 정지
        if (this.options.pauseOnHover) {
            toast.addEventListener('mouseenter', () => {
                clearTimeout(timeoutId);
            });

            toast.addEventListener('mouseleave', () => {
                timeoutId = setTimeout(() => {
                    this.removeToast(toast);
                }, this.options.duration);
            });
        }

        return toast;
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `h-toast h-toast--${type}`;

        const icon = this.getIcon(type);
        const closeButton = this.createCloseButton();

        toast.innerHTML = `
            <div class="h-toast__icon">${icon}</div>
            <div class="h-toast__content">${message}</div>
        `;
        toast.appendChild(closeButton);

        // 닫기 버튼 이벤트
        closeButton.addEventListener('click', () => {
            this.removeToast(toast);
        });

        // 애니메이션 클래스 추가
        requestAnimationFrame(() => {
            toast.classList.add('h-toast--show');
        });

        return toast;
    }

    getIcon(type) {
        const icons = {
            success: `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `,
            error: `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `,
            warning: `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `,
            info: `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `
        };

        return icons[type] || icons.info;
    }

    createCloseButton() {
        const button = document.createElement('button');
        button.className = 'h-toast__close';
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        return button;
    }

    removeToast(toast) {
        toast.classList.remove('h-toast--show');
        toast.classList.add('h-toast--hide');

        toast.addEventListener('animationend', () => {
            toast.remove();
            this.toasts = this.toasts.filter(t => t !== toast);
        });
    }

    success(message) {
        return this.show(message, 'success');
    }

    error(message) {
        return this.show(message, 'error');
    }

    warning(message) {
        return this.show(message, 'warning');
    }

    info(message) {
        return this.show(message, 'info');
    }

    // 모든 토스트 메시지 제거
    clear() {
        this.toasts.forEach(toast => this.removeToast(toast));
    }
}

export default Toast;
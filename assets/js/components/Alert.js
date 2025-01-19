/**
 * Alert Component for H-Calculator
 */

class Alert {
    constructor(options = {}) {
        this.options = {
            position: 'center',
            overlay: true,
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            animation: true,
            showCloseButton: true,
            closeOnEscape: true,
            closeOnOverlayClick: true,
            width: 400,
            ...options
        };

        this.element = null;
        this.overlay = null;
        this.isOpen = false;

        this.init();
    }

    init() {
        this.createElement();
    }

    createElement() {
        // 오버레이 생성
        if (this.options.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'h-alert-overlay';
            if (this.options.animation) {
                this.overlay.classList.add('h-alert-animated');
            }
        }

        // 알림창 생성
        this.element = document.createElement('div');
        this.element.className = 'h-alert';
        if (this.options.animation) {
            this.element.classList.add('h-alert-animated');
        }

        // 기본 스타일 설정
        this.element.style.width = typeof this.options.width === 'number' 
            ? `${this.options.width}px` 
            : this.options.width;

        // 닫기 버튼 생성
        if (this.options.showCloseButton) {
            const closeButton = document.createElement('button');
            closeButton.className = 'h-alert-close';
            closeButton.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M18 6L6 18M6 6l12 12" 
                          stroke="currentColor" 
                          stroke-width="2" 
                          stroke-linecap="round"/>
                </svg>
            `;
            closeButton.addEventListener('click', () => this.close());
            this.element.appendChild(closeButton);
        }

        // 컨텐츠 컨테이너
        this.content = document.createElement('div');
        this.content.className = 'h-alert-content';
        this.element.appendChild(this.content);

        // 이벤트 리스너 설정
        this.bindEvents();
    }

    bindEvents() {
        // ESC 키로 닫기
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        }

        // 오버레이 클릭으로 닫기
        if (this.options.closeOnOverlayClick && this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });
        }
    }

    show(message, options = {}) {
        const alertOptions = { ...this.options, ...options };

        // 메시지 설정
        this.content.innerHTML = '';
        if (typeof message === 'string') {
            this.content.innerHTML = message;
        } else if (message instanceof Element) {
            this.content.appendChild(message);
        }

        // DOM에 추가
        if (this.overlay) {
            document.body.appendChild(this.overlay);
        }
        document.body.appendChild(this.element);

        // 스크롤 방지
        document.body.style.overflow = 'hidden';

        // 애니메이션
        requestAnimationFrame(() => {
            if (this.overlay) {
                this.overlay.classList.add('show');
            }
            this.element.classList.add('show');
        });

        this.isOpen = true;
        this.emit('open');

        // Promise 반환
        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    close(data) {
        if (!this.isOpen) return;

        this.element.classList.remove('show');
        if (this.overlay) {
            this.overlay.classList.remove('show');
        }

        const cleanup = () => {
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            document.body.style.overflow = '';
            this.isOpen = false;
            this.emit('close');

            if (this.resolvePromise) {
                this.resolvePromise(data);
            }
        };

        if (this.options.animation) {
            this.element.addEventListener('transitionend', cleanup, { once: true });
        } else {
            cleanup();
        }
    }

    emit(eventName) {
        const event = new CustomEvent(`alert:${eventName}`, {
            detail: { alert: this }
        });
        document.dispatchEvent(event);
    }

    // 정적 메서드들
    static success(message, options = {}) {
        return new Alert({
            ...options,
            className: 'h-alert-success'
        }).show(`
            <div class="h-alert-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M20 6L9 17l-5-5" 
                          stroke="currentColor" 
                          stroke-width="2" 
                          stroke-linecap="round"/>
                </svg>
            </div>
            <div class="h-alert-message">${message}</div>
        `);
    }

    static error(message, options = {}) {
        return new Alert({
            ...options,
            className: 'h-alert-error'
        }).show(`
            <div class="h-alert-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M18 6L6 18M6 6l12 12" 
                          stroke="currentColor" 
                          stroke-width="2" 
                          stroke-linecap="round"/>
                </svg>
            </div>
            <div class="h-alert-message">${message}</div>
        `);
    }

    static confirm(message, options = {}) {
        const alert = new Alert({
            ...options,
            closeOnOverlayClick: false,
            closeOnEscape: false
        });

        const content = document.createElement('div');
        content.innerHTML = `
            <div class="h-alert-message">${message}</div>
            <div class="h-alert-buttons">
                <button class="h-button h-button-secondary" data-action="cancel">취소</button>
                <button class="h-button h-button-primary" data-action="confirm">확인</button>
            </div>
        `;

        content.querySelector('[data-action="cancel"]').onclick = () => alert.close(false);
        content.querySelector('[data-action="confirm"]').onclick = () => alert.close(true);

        return alert.show(content);
    }
}

export default Alert;
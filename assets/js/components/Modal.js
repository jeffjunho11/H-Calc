/**
 * Modal Component for H-Calculator
 */

class Modal {
    constructor(options = {}) {
        this.options = {
            closeOnEscape: true,
            closeOnOverlayClick: true,
            showCloseButton: true,
            animation: true,
            width: 'auto',
            height: 'auto',
            ...options
        };

        this.modal = null;
        this.overlay = null;
        this.closeButton = null;
        this.content = null;
        this.isOpen = false;

        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
    }

    createModal() {
        // 오버레이 생성
        this.overlay = document.createElement('div');
        this.overlay.className = 'h-modal-overlay';
        
        // 모달 컨테이너 생성
        this.modal = document.createElement('div');
        this.modal.className = 'h-modal';
        
        // 컨텐츠 컨테이너 생성
        this.content = document.createElement('div');
        this.content.className = 'h-modal-content';

        // 닫기 버튼 생성
        if (this.options.showCloseButton) {
            this.closeButton = document.createElement('button');
            this.closeButton.className = 'h-modal-close';
            this.closeButton.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 18L18 6M6 6l12 12" 
                          stroke-width="2" 
                          stroke-linecap="round" 
                          stroke-linejoin="round"/>
                </svg>
            `;
            this.modal.appendChild(this.closeButton);
        }

        // 모달 조립
        this.modal.appendChild(this.content);
        this.overlay.appendChild(this.modal);

        // 스타일 적용
        if (this.options.width !== 'auto') {
            this.modal.style.width = typeof this.options.width === 'number' 
                ? `${this.options.width}px` 
                : this.options.width;
        }
        if (this.options.height !== 'auto') {
            this.modal.style.height = typeof this.options.height === 'number' 
                ? `${this.options.height}px` 
                : this.options.height;
        }

        // 애니메이션 클래스 추가
        if (this.options.animation) {
            this.overlay.classList.add('h-modal-animated');
            this.modal.classList.add('h-modal-animated');
        }
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
        if (this.options.closeOnOverlayClick) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });
        }

        // 닫기 버튼
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.close());
        }
    }

    open(content) {
        // 컨텐츠 설정
        if (typeof content === 'string') {
            this.content.innerHTML = content;
        } else if (content instanceof Element) {
            this.content.innerHTML = '';
            this.content.appendChild(content);
        }

        // 모달 표시
        document.body.appendChild(this.overlay);
        document.body.style.overflow = 'hidden';

        // 애니메이션
        if (this.options.animation) {
            requestAnimationFrame(() => {
                this.overlay.classList.add('h-modal-show');
                this.modal.classList.add('h-modal-show');
            });
        }

        this.isOpen = true;
        this.emit('open');
    }

    close() {
        if (!this.isOpen) return;

        if (this.options.animation) {
            this.overlay.classList.remove('h-modal-show');
            this.modal.classList.remove('h-modal-show');

            this.overlay.addEventListener('animationend', () => {
                this.cleanup();
            }, { once: true });
        } else {
            this.cleanup();
        }
    }

    cleanup() {
        document.body.removeChild(this.overlay);
        document.body.style.overflow = '';
        this.isOpen = false;
        this.emit('close');
    }

    setContent(content) {
        if (typeof content === 'string') {
            this.content.innerHTML = content;
        } else if (content instanceof Element) {
            this.content.innerHTML = '';
            this.content.appendChild(content);
        }
    }

    setTitle(title) {
        let titleElement = this.modal.querySelector('.h-modal-title');
        if (!titleElement) {
            titleElement = document.createElement('h2');
            titleElement.className = 'h-modal-title';
            this.content.insertBefore(titleElement, this.content.firstChild);
        }
        titleElement.textContent = title;
    }

    emit(eventName) {
        const event = new CustomEvent(`modal:${eventName}`, {
            detail: { modal: this }
        });
        document.dispatchEvent(event);
    }

    // 이벤트 리스너
    on(eventName, handler) {
        document.addEventListener(`modal:${eventName}`, handler);
    }

    off(eventName, handler) {
        document.removeEventListener(`modal:${eventName}`, handler);
    }

    // 정적 메서드: 빠른 모달 생성
    static alert(message, options = {}) {
        const modal = new Modal({
            width: 400,
            closeOnOverlayClick: false,
            ...options
        });

        const content = `
            <div class="h-modal-alert">
                <div class="h-modal-alert-message">${message}</div>
                <button class="h-button h-button-primary h-modal-alert-button">확인</button>
            </div>
        `;

        modal.open(content);

        return new Promise(resolve => {
            const button = modal.content.querySelector('.h-modal-alert-button');
            button.addEventListener('click', () => {
                modal.close();
                resolve();
            });
        });
    }

    static confirm(message, options = {}) {
        const modal = new Modal({
            width: 400,
            closeOnOverlayClick: false,
            closeOnEscape: false,
            ...options
        });

        const content = `
            <div class="h-modal-confirm">
                <div class="h-modal-confirm-message">${message}</div>
                <div class="h-modal-confirm-buttons">
                    <button class="h-button h-button-secondary h-modal-confirm-cancel">취소</button>
                    <button class="h-button h-button-primary h-modal-confirm-ok">확인</button>
                </div>
            </div>
        `;

        modal.open(content);

        return new Promise((resolve) => {
            const okButton = modal.content.querySelector('.h-modal-confirm-ok');
            const cancelButton = modal.content.querySelector('.h-modal-confirm-cancel');

            okButton.addEventListener('click', () => {
                modal.close();
                resolve(true);
            });

            cancelButton.addEventListener('click', () => {
                modal.close();
                resolve(false);
            });
        });
    }
}

export default Modal;
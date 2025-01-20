/**
 * Collapse Component for H-Calculator
 */

class Collapse {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            duration: 300,
            accordion: false,
            defaultOpen: false,
            onToggle: null,
            animation: true,
            ...options
        };

        this.isOpen = this.options.defaultOpen;
        this.isAnimating = false;
        this.init();
    }

    init() {
        this.setupDOM();
        this.bindEvents();
        this.updateAria();

        if (this.isOpen) {
            this.open(false); // 애니메이션 없이 열기
        } else {
            this.content.style.display = 'none';
        }
    }

    setupDOM() {
        // 헤더와 컨텐츠 래퍼 설정
        this.header = this.element.querySelector('[data-collapse-header]');
        this.content = this.element.querySelector('[data-collapse-content]');

        if (!this.header || !this.content) {
            throw new Error('Collapse header or content not found');
        }

        // 기본 클래스 추가
        this.element.classList.add('h-collapse');
        this.header.classList.add('h-collapse-header');
        this.content.classList.add('h-collapse-content');

        // 화살표 아이콘 추가
        const arrow = document.createElement('span');
        arrow.className = 'h-collapse-arrow';
        arrow.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M6 9l6 6 6-6" 
                      stroke="currentColor" 
                      stroke-width="2" 
                      stroke-linecap="round" 
                      fill="none"/>
            </svg>
        `;
        this.header.appendChild(arrow);
    }

    bindEvents() {
        this.header.addEventListener('click', () => this.toggle());
        
        // 키보드 접근성
        this.header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });

        // 아코디언 모드에서 다른 항목 닫기
        if (this.options.accordion) {
            document.addEventListener('collapse:open', (e) => {
                if (e.detail.collapse !== this && 
                    e.detail.collapse.element.parentNode === this.element.parentNode) {
                    this.close();
                }
            });
        }
    }

    updateAria() {
        this.header.setAttribute('role', 'button');
        this.header.setAttribute('aria-expanded', this.isOpen);
        this.header.setAttribute('tabindex', '0');
        this.content.setAttribute('role', 'region');
        this.content.setAttribute('aria-hidden', !this.isOpen);
    }

    async toggle() {
        if (this.isAnimating) return;
        this.isOpen ? this.close() : this.open();
    }

    async open(animate = true) {
        if (this.isOpen || this.isAnimating) return;

        this.isOpen = true;
        this.isAnimating = true;
        this.element.classList.add('h-collapse-opening');
        this.updateAria();

        // 컨텐츠 표시
        this.content.style.display = 'block';
        const height = this.content.scrollHeight;

        if (animate && this.options.animation) {
            this.content.style.height = '0';
            await this.nextFrame();
            this.content.style.height = `${height}px`;
            await this.transitionEnd(this.content);
        }

        this.content.style.height = '';
        this.element.classList.remove('h-collapse-opening');
        this.element.classList.add('h-collapse-open');
        this.isAnimating = false;

        // 이벤트 발생
        this.emit('open');

        // 콜백 실행
        if (typeof this.options.onToggle === 'function') {
            this.options.onToggle(true);
        }
    }

    async close(animate = true) {
        if (!this.isOpen || this.isAnimating) return;

        this.isOpen = false;
        this.isAnimating = true;
        this.element.classList.add('h-collapse-closing');
        this.updateAria();

        if (animate && this.options.animation) {
            const height = this.content.scrollHeight;
            this.content.style.height = `${height}px`;
            await this.nextFrame();
            this.content.style.height = '0';
            await this.transitionEnd(this.content);
        }

        this.content.style.display = 'none';
        this.content.style.height = '';
        this.element.classList.remove('h-collapse-closing', 'h-collapse-open');
        this.isAnimating = false;

        // 이벤트 발생
        this.emit('close');

        // 콜백 실행
        if (typeof this.options.onToggle === 'function') {
            this.options.onToggle(false);
        }
    }

    // 유틸리티 메서드
    nextFrame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    }

    transitionEnd(element) {
        return new Promise(resolve => {
            const duration = this.options.duration;
            const handler = () => {
                element.removeEventListener('transitionend', handler);
                resolve();
            };
            element.addEventListener('transitionend', handler);
            // 폴백 타이머
            setTimeout(handler, duration + 50);
        });
    }

    emit(eventName) {
        const event = new CustomEvent(`collapse:${eventName}`, {
            bubbles: true,
            detail: { collapse: this }
        });
        this.element.dispatchEvent(event);
    }

    // 상태 확인 메서드
    getState() {
        return {
            isOpen: this.isOpen,
            isAnimating: this.isAnimating
        };
    }

    // 컴포넌트 제거
    destroy() {
        // 이벤트 리스너 제거
        this.header.removeEventListener('click', this.toggle);
        this.header.removeEventListener('keydown', this.toggle);

        // 클래스 및 스타일 제거
        this.element.classList.remove('h-collapse', 'h-collapse-open');
        this.header.classList.remove('h-collapse-header');
        this.content.classList.remove('h-collapse-content');
        this.content.style = '';

        // aria 속성 제거
        this.header.removeAttribute('role');
        this.header.removeAttribute('aria-expanded');
        this.header.removeAttribute('tabindex');
        this.content.removeAttribute('role');
        this.content.removeAttribute('aria-hidden');

        // 화살표 아이콘 제거
        const arrow = this.header.querySelector('.h-collapse-arrow');
        if (arrow) {
            arrow.remove();
        }
    }
}

export default Collapse;
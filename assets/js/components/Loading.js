/**
 * Loading Component for H-Calculator
 */

class Loading {
    constructor(options = {}) {
        this.options = {
            text: '로딩 중...',
            spinnerSize: 40,
            overlay: true,
            theme: 'light',
            fullscreen: true,
            ...options
        };

        this.element = null;
        this.spinner = null;
        this.textElement = null;
        this.init();
    }

    init() {
        // 컨테이너 생성
        this.element = document.createElement('div');
        this.element.className = `h-loading ${this.options.theme === 'dark' ? 'h-loading--dark' : ''}`;
        
        if (this.options.fullscreen) {
            this.element.classList.add('h-loading--fullscreen');
        }

        // 오버레이 설정
        if (this.options.overlay) {
            this.element.classList.add('h-loading--overlay');
        }

        // 스피너 생성
        this.spinner = document.createElement('div');
        this.spinner.className = 'h-loading-spinner';
        this.spinner.style.width = `${this.options.spinnerSize}px`;
        this.spinner.style.height = `${this.options.spinnerSize}px`;
        this.spinner.innerHTML = `
            <svg viewBox="0 0 50 50" class="h-loading-spinner__circle">
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5"></circle>
            </svg>
        `;

        // 텍스트 생성
        if (this.options.text) {
            this.textElement = document.createElement('div');
            this.textElement.className = 'h-loading-text';
            this.textElement.textContent = this.options.text;
        }

        // 요소 조립
        this.element.appendChild(this.spinner);
        if (this.textElement) {
            this.element.appendChild(this.textElement);
        }
    }

    show(container = document.body) {
        if (this.options.fullscreen) {
            document.body.appendChild(this.element);
            document.body.style.overflow = 'hidden';
        } else {
            container.appendChild(this.element);
            if (getComputedStyle(container).position === 'static') {
                container.style.position = 'relative';
            }
        }

        // 애니메이션을 위한 지연
        requestAnimationFrame(() => {
            this.element.classList.add('h-loading--show');
        });

        // 이벤트 발생
        this.emit('show');
    }

    hide() {
        this.element.classList.remove('h-loading--show');
        
        this.element.addEventListener('transitionend', () => {
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
                if (this.options.fullscreen) {
                    document.body.style.overflow = '';
                }
            }
            this.emit('hide');
        }, { once: true });
    }

    setText(text) {
        if (this.textElement) {
            this.textElement.textContent = text;
        } else if (text) {
            this.textElement = document.createElement('div');
            this.textElement.className = 'h-loading-text';
            this.textElement.textContent = text;
            this.element.appendChild(this.textElement);
        }
    }

    setProgress(progress) {
        const circle = this.spinner.querySelector('circle');
        if (circle) {
            const circumference = 2 * Math.PI * 20; // r=20
            const offset = circumference - (progress / 100) * circumference;
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = offset;
        }
    }

    emit(eventName) {
        const event = new CustomEvent(`loading:${eventName}`, {
            detail: { loading: this }
        });
        document.dispatchEvent(event);
    }

    // 정적 메서드: 글로벌 로딩
    static instance = null;

    static show(options = {}) {
        if (!Loading.instance) {
            Loading.instance = new Loading({
                fullscreen: true,
                ...options
            });
        }
        Loading.instance.show();
        return Loading.instance;
    }

    static hide() {
        if (Loading.instance) {
            Loading.instance.hide();
        }
    }

    // 유틸리티 메서드: Promise 래핑
    static async wrap(promise, options = {}) {
        const loading = Loading.show(options);
        try {
            const result = await promise;
            loading.hide();
            return result;
        } catch (error) {
            loading.hide();
            throw error;
        }
    }
}

export default Loading;
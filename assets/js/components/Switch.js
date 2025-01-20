/**
 * Switch Component for H-Calculator
 */

class Switch {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            checked: false,
            disabled: false,
            size: 'medium', // small, medium, large
            color: '#1a73e8',
            onChange: null,
            labels: {
                on: '',
                off: ''
            },
            ...options
        };

        this.isChecked = this.options.checked;
        this.init();
    }

    init() {
        this.createSwitch();
        this.bindEvents();
    }

    createSwitch() {
        // 원본 체크박스 숨기기
        if (this.element.tagName === 'INPUT' && this.element.type === 'checkbox') {
            this.element.style.display = 'none';
            this.checkbox = this.element;
        } else {
            this.checkbox = document.createElement('input');
            this.checkbox.type = 'checkbox';
            this.checkbox.style.display = 'none';
            this.element.appendChild(this.checkbox);
        }

        // 스위치 컨테이너 생성
        this.container = document.createElement('div');
        this.container.className = `h-switch h-switch-${this.options.size}`;

        // 스위치 트랙 생성
        this.track = document.createElement('div');
        this.track.className = 'h-switch-track';
        this.track.style.setProperty('--switch-color', this.options.color);

        // 스위치 핸들 생성
        this.handle = document.createElement('div');
        this.handle.className = 'h-switch-handle';

        // 라벨 생성
        if (this.options.labels.on || this.options.labels.off) {
            this.labelOn = document.createElement('span');
            this.labelOn.className = 'h-switch-label h-switch-label-on';
            this.labelOn.textContent = this.options.labels.on;

            this.labelOff = document.createElement('span');
            this.labelOff.className = 'h-switch-label h-switch-label-off';
            this.labelOff.textContent = this.options.labels.off;

            this.track.appendChild(this.labelOn);
            this.track.appendChild(this.labelOff);
        }

        // 조립
        this.track.appendChild(this.handle);
        this.container.appendChild(this.track);
        this.element.appendChild(this.container);

        // 초기 상태 설정
        this.update(this.isChecked);
        if (this.options.disabled) {
            this.disable();
        }
    }

    bindEvents() {
        // 클릭 이벤트
        this.container.addEventListener('click', (e) => {
            if (!this.options.disabled) {
                this.toggle();
            }
        });

        // 키보드 이벤트
        this.container.addEventListener('keydown', (e) => {
            if (!this.options.disabled && (e.key === ' ' || e.key === 'Enter')) {
                e.preventDefault();
                this.toggle();
            }
        });

        // 포커스 관리
        this.container.setAttribute('tabindex', '0');
        this.container.setAttribute('role', 'switch');
    }

    toggle() {
        this.update(!this.isChecked);
    }

    update(checked) {
        this.isChecked = checked;
        this.checkbox.checked = checked;
        this.container.setAttribute('aria-checked', checked);

        if (checked) {
            this.container.classList.add('h-switch-checked');
        } else {
            this.container.classList.remove('h-switch-checked');
        }

        // 콜백 실행
        if (typeof this.options.onChange === 'function') {
            this.options.onChange(checked);
        }

        // 이벤트 발생
        this.emit('change', { checked });
    }

    disable() {
        this.options.disabled = true;
        this.container.classList.add('h-switch-disabled');
        this.container.setAttribute('aria-disabled', 'true');
        this.container.removeAttribute('tabindex');
    }

    enable() {
        this.options.disabled = false;
        this.container.classList.remove('h-switch-disabled');
        this.container.setAttribute('aria-disabled', 'false');
        this.container.setAttribute('tabindex', '0');
    }

    setColor(color) {
        this.options.color = color;
        this.track.style.setProperty('--switch-color', color);
    }

    emit(eventName, detail = {}) {
        const event = new CustomEvent(`switch:${eventName}`, {
            bubbles: true,
            detail: { switch: this, ...detail }
        });
        this.element.dispatchEvent(event);
    }

    destroy() {
        // 이벤트 리스너 제거
        this.container.removeEventListener('click', this.toggle);
        this.container.removeEventListener('keydown', this.toggle);

        // DOM 복원
        if (this.element !== this.checkbox) {
            this.element.appendChild(this.checkbox);
        }
        this.checkbox.style.display = '';
        this.container.remove();
    }
}

export default Switch;
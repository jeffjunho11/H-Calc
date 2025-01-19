/**
 * Slider Component for H-Calculator
 */

class Slider {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            min: 0,
            max: 100,
            step: 1,
            value: 0,
            orientation: 'horizontal',
            tooltip: true,
            tooltipPosition: 'top',
            disabled: false,
            showMarkers: false,
            markerStep: 10,
            showInput: false,
            formatValue: value => value,
            onChange: null,
            ...options
        };

        this.value = this.options.value;
        this.isDragging = false;
        this.init();
    }

    init() {
        this.createSlider();
        this.bindEvents();
        this.updateValue(this.value, false);
    }

    createSlider() {
        // 컨테이너 생성
        this.container = document.createElement('div');
        this.container.className = `h-slider h-slider-${this.options.orientation}`;
        if (this.options.disabled) {
            this.container.classList.add('h-slider-disabled');
        }

        // 트랙 생성
        this.track = document.createElement('div');
        this.track.className = 'h-slider-track';

        // 진행 바 생성
        this.progress = document.createElement('div');
        this.progress.className = 'h-slider-progress';
        this.track.appendChild(this.progress);

        // 핸들 생성
        this.handle = document.createElement('div');
        this.handle.className = 'h-slider-handle';
        this.handle.setAttribute('role', 'slider');
        this.handle.setAttribute('tabindex', '0');
        this.track.appendChild(this.handle);

        // 마커 생성
        if (this.options.showMarkers) {
            this.createMarkers();
        }

        // 툴팁 생성
        if (this.options.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.className = `h-slider-tooltip h-slider-tooltip-${this.options.tooltipPosition}`;
            this.handle.appendChild(this.tooltip);
        }

        // 입력 필드 생성
        if (this.options.showInput) {
            this.input = document.createElement('input');
            this.input.type = 'number';
            this.input.className = 'h-slider-input';
            this.input.min = this.options.min;
            this.input.max = this.options.max;
            this.input.step = this.options.step;
            this.input.value = this.value;
            this.container.appendChild(this.input);
        }

        // DOM에 추가
        this.container.appendChild(this.track);
        this.element.appendChild(this.container);
    }

    createMarkers() {
        this.markers = document.createElement('div');
        this.markers.className = 'h-slider-markers';

        const count = Math.floor((this.options.max - this.options.min) / this.options.markerStep);
        for (let i = 0; i <= count; i++) {
            const marker = document.createElement('div');
            marker.className = 'h-slider-marker';
            marker.style[this.options.orientation === 'horizontal' ? 'left' : 'bottom'] = `${(i / count) * 100}%`;
            
            const value = this.options.min + (i * this.options.markerStep);
            marker.setAttribute('data-value', value);
            
            const label = document.createElement('span');
            label.className = 'h-slider-marker-label';
            label.textContent = this.options.formatValue(value);
            marker.appendChild(label);
            
            this.markers.appendChild(marker);
        }

        this.track.appendChild(this.markers);
    }

    bindEvents() {
        // 마우스/터치 이벤트
        this.track.addEventListener('mousedown', this.startDragging.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.stopDragging.bind(this));

        // 터치 이벤트
        this.track.addEventListener('touchstart', this.startDragging.bind(this));
        document.addEventListener('touchmove', this.drag.bind(this));
        document.addEventListener('touchend', this.stopDragging.bind(this));

        // 키보드 이벤트
        this.handle.addEventListener('keydown', this.handleKeydown.bind(this));

        // 입력 필드 이벤트
        if (this.options.showInput) {
            this.input.addEventListener('change', (e) => {
                this.updateValue(parseFloat(e.target.value));
            });
        }

        // 마커 클릭 이벤트
        if (this.options.showMarkers) {
            this.markers.addEventListener('click', (e) => {
                const marker = e.target.closest('.h-slider-marker');
                if (marker) {
                    const value = parseFloat(marker.getAttribute('data-value'));
                    this.updateValue(value);
                }
            });
        }
    }

    startDragging(e) {
        if (this.options.disabled) return;
        
        e.preventDefault();
        this.isDragging = true;
        this.container.classList.add('h-slider-active');
        
        // 초기 드래그 시 값 업데이트
        this.drag(e);
    }

    drag(e) {
        if (!this.isDragging || this.options.disabled) return;

        e.preventDefault();
        const rect = this.track.getBoundingClientRect();
        const pagePos = e.touches ? e.touches[0] : e;

        let position;
        if (this.options.orientation === 'horizontal') {
            position = (pagePos.clientX - rect.left) / rect.width;
        } else {
            position = 1 - ((pagePos.clientY - rect.top) / rect.height);
        }

        position = Math.max(0, Math.min(1, position));
        const value = this.options.min + (position * (this.options.max - this.options.min));
        this.updateValue(this.roundToStep(value));
    }

    stopDragging() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.container.classList.remove('h-slider-active');
        this.emit('change', this.value);
    }

    handleKeydown(e) {
        if (this.options.disabled) return;

        const step = e.shiftKey ? this.options.step * 10 : this.options.step;
        let newValue = this.value;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowUp':
                newValue += step;
                break;
            case 'ArrowLeft':
            case 'ArrowDown':
                newValue -= step;
                break;
            case 'Home':
                newValue = this.options.min;
                break;
            case 'End':
                newValue = this.options.max;
                break;
            default:
                return;
        }

        e.preventDefault();
        this.updateValue(this.roundToStep(newValue));
        this.emit('change', this.value);
    }

    updateValue(value, triggerChange = true) {
        // 범위 제한
        value = Math.max(this.options.min, Math.min(this.options.max, value));
        
        // 값이 변경되지 않았다면 중단
        if (value === this.value) return;

        this.value = value;
        const position = (value - this.options.min) / (this.options.max - this.options.min);

        // 핸들 위치 업데이트
        if (this.options.orientation === 'horizontal') {
            this.handle.style.left = `${position * 100}%`;
            this.progress.style.width = `${position * 100}%`;
        } else {
            this.handle.style.bottom = `${position * 100}%`;
            this.progress.style.height = `${position * 100}%`;
        }

        // 툴팁 업데이트
        if (this.tooltip) {
            this.tooltip.textContent = this.options.formatValue(value);
        }

        // 입력 필드 업데이트
        if (this.input) {
            this.input.value = value;
        }

        // ARIA 속성 업데이트
        this.handle.setAttribute('aria-valuenow', value);
        this.handle.setAttribute('aria-valuetext', this.options.formatValue(value));

        // 이벤트 발생
        if (triggerChange) {
            if (typeof this.options.onChange === 'function') {
                this.options.onChange(value);
            }
            this.emit('input', value);
        }
    }

    roundToStep(value) {
        const steps = Math.round((value - this.options.min) / this.options.step);
        return this.options.min + (steps * this.options.step);
    }

    emit(eventName, value) {
        const event = new CustomEvent(`slider:${eventName}`, {
            bubbles: true,
            detail: { slider: this, value }
        });
        this.element.dispatchEvent(event);
    }

    // 공개 메서드
    setValue(value, triggerChange = true) {
        this.updateValue(this.roundToStep(value), triggerChange);
    }

    getValue() {
        return this.value;
    }

    enable() {
        this.options.disabled = false;
        this.container.classList.remove('h-slider-disabled');
        this.handle.setAttribute('tabindex', '0');
    }

    disable() {
        this.options.disabled = true;
        this.container.classList.add('h-slider-disabled');
        this.handle.setAttribute('tabindex', '-1');
    }

    destroy() {
        // 이벤트 리스너 제거
        document.removeEventListener('mousemove', this.drag);
        document.removeEventListener('mouseup', this.stopDragging);
        document.removeEventListener('touchmove', this.drag);
        document.removeEventListener('touchend', this.stopDragging);

        // DOM 요소 제거
        this.element.innerHTML = '';
    }
}

export default Slider;
/**
 * Progress Component for H-Calculator
 */

class Progress {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            value: 0,
            min: 0,
            max: 100,
            showValue: true,
            valuePrefix: '',
            valueSuffix: '%',
            thickness: 4,
            color: '#1a73e8',
            backgroundColor: '#e0e0e0',
            rounded: true,
            animation: true,
            animationDuration: 600,
            type: 'line', // line, circle
            size: 120, // circle type에서 사용
            ...options
        };

        this.currentValue = this.options.value;
        this.init();
    }

    init() {
        this.createElement();
        if (this.options.animation) {
            this.animate(this.options.value);
        } else {
            this.setValue(this.options.value);
        }
    }

    createElement() {
        this.element.classList.add('h-progress');
        this.element.classList.add(`h-progress-${this.options.type}`);

        if (this.options.type === 'line') {
            this.createLineProgress();
        } else {
            this.createCircleProgress();
        }
    }

    createLineProgress() {
        // 진행 바 컨테이너
        this.track = document.createElement('div');
        this.track.className = 'h-progress-track';
        this.track.style.height = `${this.options.thickness}px`;
        this.track.style.backgroundColor = this.options.backgroundColor;
        if (this.options.rounded) {
            this.track.style.borderRadius = `${this.options.thickness}px`;
        }

        // 진행 바
        this.bar = document.createElement('div');
        this.bar.className = 'h-progress-bar';
        this.bar.style.backgroundColor = this.options.color;
        if (this.options.rounded) {
            this.bar.style.borderRadius = `${this.options.thickness}px`;
        }

        this.track.appendChild(this.bar);
        this.element.appendChild(this.track);

        // 값 표시
        if (this.options.showValue) {
            this.valueElement = document.createElement('div');
            this.valueElement.className = 'h-progress-value';
            this.element.appendChild(this.valueElement);
        }
    }

    createCircleProgress() {
        // SVG 생성
        const xmlns = 'http://www.w3.org/2000/svg';
        this.svg = document.createElementNS(xmlns, 'svg');
        this.svg.setAttributeNS(null, 'viewBox', '0 0 36 36');
        this.svg.style.width = `${this.options.size}px`;
        this.svg.style.height = `${this.options.size}px`;

        // 배경 원
        this.circleTrack = document.createElementNS(xmlns, 'path');
        this.circleTrack.setAttributeNS(null, 'd', this.getCirclePath());
        this.circleTrack.style.fill = 'none';
        this.circleTrack.style.stroke = this.options.backgroundColor;
        this.circleTrack.style.strokeWidth = this.options.thickness;

        // 진행 원
        this.circleBar = document.createElementNS(xmlns, 'path');
        this.circleBar.setAttributeNS(null, 'd', this.getCirclePath());
        this.circleBar.style.fill = 'none';
        this.circleBar.style.stroke = this.options.color;
        this.circleBar.style.strokeWidth = this.options.thickness;
        this.circleBar.style.strokeLinecap = this.options.rounded ? 'round' : 'butt';

        this.svg.appendChild(this.circleTrack);
        this.svg.appendChild(this.circleBar);
        this.element.appendChild(this.svg);

        // 값 표시
        if (this.options.showValue) {
            this.valueElement = document.createElement('div');
            this.valueElement.className = 'h-progress-value';
            this.valueElement.style.position = 'absolute';
            this.valueElement.style.top = '50%';
            this.valueElement.style.left = '50%';
            this.valueElement.style.transform = 'translate(-50%, -50%)';
            this.element.appendChild(this.valueElement);
        }
    }

    getCirclePath() {
        const radius = 16 - (this.options.thickness / 2);
        const circumference = 2 * Math.PI * radius;
        return `M 18,18 m 0,-${radius} a ${radius},${radius} 0 1 1 0,${2 * radius} a ${radius},${radius} 0 1 1 0,-${2 * radius}`;
    }

    setValue(value) {
        // 값 범위 제한
        value = Math.max(this.options.min, Math.min(this.options.max, value));
        this.currentValue = value;

        // 퍼센트 계산
        const percent = ((value - this.options.min) / (this.options.max - this.options.min)) * 100;

        if (this.options.type === 'line') {
            this.bar.style.width = `${percent}%`;
        } else {
            const radius = 16 - (this.options.thickness / 2);
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (percent / 100 * circumference);
            this.circleBar.style.strokeDasharray = `${circumference} ${circumference}`;
            this.circleBar.style.strokeDashoffset = offset;
        }

        if (this.options.showValue) {
            this.valueElement.textContent = 
                `${this.options.valuePrefix}${value}${this.options.valueSuffix}`;
        }

        this.emit('change', { value });
    }

    animate(targetValue, duration = this.options.animationDuration) {
        const startValue = this.currentValue;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 이징 함수 (easeOutQuad)
            const eased = 1 - (1 - progress) * (1 - progress);
            const currentValue = startValue + (targetValue - startValue) * eased;

            this.setValue(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    emit(eventName, detail = {}) {
        const event = new CustomEvent(`progress:${eventName}`, {
            bubbles: true,
            detail: { progress: this, ...detail }
        });
        this.element.dispatchEvent(event);
    }

    // 공개 메서드
    getValue() {
        return this.currentValue;
    }

    update(value, animate = this.options.animation) {
        if (animate) {
            this.animate(value);
        } else {
            this.setValue(value);
        }
    }

    setColor(color) {
        this.options.color = color;
        if (this.options.type === 'line') {
            this.bar.style.backgroundColor = color;
        } else {
            this.circleBar.style.stroke = color;
        }
    }

    destroy() {
        this.element.innerHTML = '';
        this.element.classList.remove('h-progress', `h-progress-${this.options.type}`);
    }
}

export default Progress;
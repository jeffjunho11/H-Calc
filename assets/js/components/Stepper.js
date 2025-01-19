/**
 * Stepper Component for H-Calculator
 */

class Stepper {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            steps: [],
            currentStep: 0,
            orientation: 'horizontal', // horizontal, vertical
            animation: true,
            allowNavigation: false, // 이전 단계로 이동 허용 여부
            onStepChange: null,
            onComplete: null,
            ...options
        };

        this.currentIndex = this.options.currentStep;
        this.completedSteps = new Set();
        this.init();
    }

    init() {
        this.createStepper();
        this.bindEvents();
    }

    createStepper() {
        this.element.classList.add('h-stepper');
        this.element.classList.add(`h-stepper-${this.options.orientation}`);

        // 단계 목록 생성
        this.stepList = document.createElement('ul');
        this.stepList.className = 'h-stepper-list';

        // 단계들 생성
        this.options.steps.forEach((step, index) => {
            const li = document.createElement('li');
            li.className = 'h-stepper-step';
            li.dataset.step = index;

            // 인디케이터
            const indicator = document.createElement('div');
            indicator.className = 'h-stepper-indicator';
            
            // 번호
            const number = document.createElement('span');
            number.className = 'h-stepper-number';
            number.textContent = index + 1;
            indicator.appendChild(number);
            
            // 체크 아이콘
            const check = document.createElement('span');
            check.className = 'h-stepper-check';
            check.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" 
                          stroke-width="2" stroke-linecap="round" 
                          stroke-linejoin="round" fill="none"/>
                </svg>
            `;
            indicator.appendChild(check);

            // 라벨
            const label = document.createElement('div');
            label.className = 'h-stepper-label';
            label.textContent = step.label;
            
            // 설명
            if (step.description) {
                const description = document.createElement('div');
                description.className = 'h-stepper-description';
                description.textContent = step.description;
                label.appendChild(description);
            }

            // 조립
            li.appendChild(indicator);
            li.appendChild(label);
            this.stepList.appendChild(li);

            // 연결선
            if (index < this.options.steps.length - 1) {
                const connector = document.createElement('div');
                connector.className = 'h-stepper-connector';
                li.appendChild(connector);
            }
        });

        this.element.appendChild(this.stepList);

        // 콘텐츠 영역 생성
        this.content = document.createElement('div');
        this.content.className = 'h-stepper-content';
        this.element.appendChild(this.content);

        // 초기 상태 설정
        this.updateSteps();
        this.showStep(this.currentIndex);
    }

    bindEvents() {
        if (this.options.allowNavigation) {
            this.stepList.addEventListener('click', (e) => {
                const step = e.target.closest('.h-stepper-step');
                if (!step) return;

                const index = parseInt(step.dataset.step);
                if (this.isStepAccessible(index)) {
                    this.goToStep(index);
                }
            });
        }
    }

    isStepAccessible(index) {
        if (!this.options.allowNavigation) return false;
        if (index === this.currentIndex) return false;
        if (index > this.currentIndex) return false;
        return true;
    }

    updateSteps() {
        const steps = this.stepList.children;
        Array.from(steps).forEach((step, index) => {
            step.classList.toggle('active', index === this.currentIndex);
            step.classList.toggle('completed', this.completedSteps.has(index));
            step.classList.toggle('accessible', this.isStepAccessible(index));
        });
    }

    async showStep(index) {
        const step = this.options.steps[index];
        if (!step) return;

        // 이전 콘텐츠 제거
        while (this.content.firstChild) {
            this.content.firstChild.remove();
        }

        // 새 콘텐츠 생성
        let content;
        if (typeof step.content === 'function') {
            content = await step.content();
        } else {
            content = step.content;
        }

        if (typeof content === 'string') {
            this.content.innerHTML = content;
        } else if (content instanceof Element) {
            this.content.appendChild(content);
        }

        // 버튼 생성
        const buttons = document.createElement('div');
        buttons.className = 'h-stepper-buttons';

        // 이전 버튼
        if (index > 0) {
            const backButton = document.createElement('button');
            backButton.className = 'h-stepper-button h-stepper-button-back';
            backButton.textContent = '이전';
            backButton.addEventListener('click', () => this.prev());
            buttons.appendChild(backButton);
        }

        // 다음/완료 버튼
        const nextButton = document.createElement('button');
        nextButton.className = 'h-stepper-button h-stepper-button-next';
        nextButton.textContent = index === this.options.steps.length - 1 ? '완료' : '다음';
        nextButton.addEventListener('click', () => this.next());
        buttons.appendChild(nextButton);

        this.content.appendChild(buttons);
    }

    async goToStep(index) {
        if (index < 0 || index >= this.options.steps.length) return;

        const previousIndex = this.currentIndex;
        this.currentIndex = index;

        if (this.options.animation) {
            this.content.style.opacity = '0';
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        await this.showStep(index);

        if (this.options.animation) {
            this.content.style.opacity = '1';
        }

        this.updateSteps();

        if (typeof this.options.onStepChange === 'function') {
            this.options.onStepChange(index, previousIndex);
        }

        this.emit('change', { currentStep: index, previousStep: previousIndex });
    }

    async next() {
        const currentStep = this.options.steps[this.currentIndex];
        
        // 유효성 검사
        if (currentStep.validate) {
            const isValid = await currentStep.validate();
            if (!isValid) return;
        }

        // 현재 단계 완료 처리
        this.completedSteps.add(this.currentIndex);

        // 다음 단계로 이동
        if (this.currentIndex < this.options.steps.length - 1) {
            await this.goToStep(this.currentIndex + 1);
        } else {
            // 마지막 단계 완료
            if (typeof this.options.onComplete === 'function') {
                this.options.onComplete();
            }
            this.emit('complete');
        }
    }

    async prev() {
        if (this.currentIndex > 0) {
            await this.goToStep(this.currentIndex - 1);
        }
    }

    emit(eventName, detail = {}) {
        const event = new CustomEvent(`stepper:${eventName}`, {
            bubbles: true,
            detail: { stepper: this, ...detail }
        });
        this.element.dispatchEvent(event);
    }

    // 공개 메서드
    getCurrentStep() {
        return {
            index: this.currentIndex,
            ...this.options.steps[this.currentIndex]
        };
    }

    reset() {
        this.currentIndex = 0;
        this.completedSteps.clear();
        this.updateSteps();
        this.showStep(0);
    }

    destroy() {
        this.element.innerHTML = '';
        this.element.classList.remove('h-stepper', `h-stepper-${this.options.orientation}`);
    }
}

export default Stepper;
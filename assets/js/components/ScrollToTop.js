/**
 * Scroll To Top Component for H-Calculator
 */

class ScrollToTop {
    constructor(options = {}) {
        this.options = {
            threshold: 400, // 버튼이 나타나는 스크롤 위치
            scrollDuration: 500, // 스크롤 애니메이션 시간 (ms)
            visibilityDuration: 200, // 버튼 표시/숨김 애니메이션 시간 (ms)
            position: 'right', // 버튼 위치 (right, left)
            offset: 20, // 화면 가장자리로부터의 거리
            size: 40, // 버튼 크기
            backgroundColor: '#1a73e8', // 배경색
            iconColor: '#ffffff', // 아이콘 색상
            ...options
        };

        this.visible = false;
        this.scrolling = false;
        
        this.init();
    }

    init() {
        this.createButton();
        this.bindEvents();
        this.checkPosition();
    }

    createButton() {
        this.button = document.createElement('button');
        this.button.className = 'h-scroll-top';
        this.button.setAttribute('aria-label', '맨 위로 이동');
        this.button.style.cssText = `
            position: fixed;
            bottom: ${this.options.offset}px;
            ${this.options.position}: ${this.options.offset}px;
            width: ${this.options.size}px;
            height: ${this.options.size}px;
            background-color: ${this.options.backgroundColor};
            border: none;
            border-radius: 50%;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all ${this.options.visibilityDuration}ms ease;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 999;
        `;

        this.button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" 
                 fill="none" stroke="${this.options.iconColor}" 
                 stroke-width="2" stroke-linecap="round">
                <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
        `;

        // 호버 효과
        this.button.addEventListener('mouseenter', () => {
            this.button.style.transform = 'translateY(-3px)';
            this.button.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        });

        this.button.addEventListener('mouseleave', () => {
            this.button.style.transform = 'translateY(0)';
            this.button.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        });

        document.body.appendChild(this.button);
    }

    bindEvents() {
        // 스크롤 이벤트
        window.addEventListener('scroll', () => {
            if (!this.scrolling) {
                window.requestAnimationFrame(() => {
                    this.checkPosition();
                    this.scrolling = false;
                });
                this.scrolling = true;
            }
        });

        // 버튼 클릭 이벤트
        this.button.addEventListener('click', () => {
            this.scrollToTop();
        });

        // 리사이즈 이벤트
        window.addEventListener('resize', () => {
            this.checkPosition();
        });
    }

    checkPosition() {
        const shouldBeVisible = window.pageYOffset > this.options.threshold;

        if (shouldBeVisible !== this.visible) {
            this.visible = shouldBeVisible;
            this.button.style.opacity = shouldBeVisible ? '1' : '0';
            this.button.style.visibility = shouldBeVisible ? 'visible' : 'hidden';
        }
    }

    scrollToTop() {
        const startPosition = window.pageYOffset;
        const startTime = performance.now();

        const scroll = (currentTime) => {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / this.options.scrollDuration, 1);

            // 이징 함수 적용 (easeOutQuad)
            const easeProgress = 1 - Math.pow(1 - progress, 2);
            
            window.scrollTo(0, startPosition * (1 - easeProgress));

            if (progress < 1) {
                requestAnimationFrame(scroll);
            }
        };

        requestAnimationFrame(scroll);
    }

    // 스크롤 진행률 표시 기능 추가
    showProgress() {
        if (!this.progressRing) {
            this.progressRing = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.progressRing.setAttribute('class', 'h-scroll-progress');
            this.progressRing.setAttribute('viewBox', '0 0 36 36');
            this.progressRing.innerHTML = `
                <path d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.2)"
                    stroke-width="3"
                    stroke-dasharray="100, 100"/>
                <path d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#fff"
                    stroke-width="3"
                    stroke-dasharray="0, 100"
                    class="progress"/>
            `;
            this.button.appendChild(this.progressRing);
        }

        window.addEventListener('scroll', () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.pageYOffset / maxScroll) * 100;
            const progressPath = this.progressRing.querySelector('.progress');
            progressPath.style.strokeDasharray = `${progress}, 100`;
        });
    }

    // 옵션 업데이트
    updateOptions(newOptions) {
        this.options = {
            ...this.options,
            ...newOptions
        };

        // 스타일 업데이트
        this.button.style.bottom = `${this.options.offset}px`;
        this.button.style[this.options.position] = `${this.options.offset}px`;
        this.button.style.width = `${this.options.size}px`;
        this.button.style.height = `${this.options.size}px`;
        this.button.style.backgroundColor = this.options.backgroundColor;
        
        // 아이콘 색상 업데이트
        const icon = this.button.querySelector('svg');
        if (icon) {
            icon.setAttribute('stroke', this.options.iconColor);
        }
    }

    // 컴포넌트 제거
    destroy() {
        if (this.button && this.button.parentNode) {
            this.button.parentNode.removeChild(this.button);
        }
    }
}

export default ScrollToTop;
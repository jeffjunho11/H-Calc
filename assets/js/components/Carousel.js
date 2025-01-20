/**
 * Carousel Component for H-Calculator
 */

class Carousel {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            autoplay: false,
            interval: 5000,
            duration: 300,
            loop: true,
            navigation: true,
            pagination: true,
            swipe: true,
            threshold: 50, // 스와이프 임계값
            direction: 'horizontal', // horizontal, vertical
            ...options
        };

        this.slides = [];
        this.currentIndex = 0;
        this.isAnimating = false;
        this.autoplayTimer = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchDeltaX = 0;
        this.touchDeltaY = 0;

        this.init();
    }

    init() {
        this.setupCarousel();
        this.setupSlides();
        if (this.options.navigation) this.setupNavigation();
        if (this.options.pagination) this.setupPagination();
        if (this.options.swipe) this.setupSwipe();
        if (this.options.autoplay) this.startAutoplay();
    }

    setupCarousel() {
        this.element.classList.add('h-carousel');
        this.element.classList.add(`h-carousel-${this.options.direction}`);

        // 슬라이드 컨테이너 생성
        this.container = document.createElement('div');
        this.container.className = 'h-carousel-container';

        // 기존 슬라이드 래핑
        Array.from(this.element.children).forEach(child => {
            const slide = document.createElement('div');
            slide.className = 'h-carousel-slide';
            slide.appendChild(child);
            this.container.appendChild(slide);
        });

        this.element.appendChild(this.container);
    }

    setupSlides() {
        this.slides = Array.from(this.container.children);
        if (this.slides.length === 0) return;

        // 초기 위치 설정
        this.slides.forEach((slide, index) => {
            slide.dataset.index = index;
            slide.style.transform = `translate${this.options.direction === 'horizontal' ? 'X' : 'Y'}(${index * 100}%)`;
        });

        // 첫 번째 슬라이드 활성화
        this.slides[0].classList.add('active');
    }

    setupNavigation() {
        // 이전 버튼
        this.prevButton = document.createElement('button');
        this.prevButton.className = 'h-carousel-prev';
        this.prevButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" 
                      stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
        this.prevButton.addEventListener('click', () => this.prev());

        // 다음 버튼
        this.nextButton = document.createElement('button');
        this.nextButton.className = 'h-carousel-next';
        this.nextButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" 
                      stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
        this.nextButton.addEventListener('click', () => this.next());

        this.element.appendChild(this.prevButton);
        this.element.appendChild(this.nextButton);

        this.updateNavigationState();
    }

    setupPagination() {
        this.pagination = document.createElement('div');
        this.pagination.className = 'h-carousel-pagination';

        for (let i = 0; i < this.slides.length; i++) {
            const dot = document.createElement('button');
            dot.className = 'h-carousel-dot';
            dot.addEventListener('click', () => this.goTo(i));
            this.pagination.appendChild(dot);
        }

        this.element.appendChild(this.pagination);
        this.updatePagination();
    }

    setupSwipe() {
        let isTouch = false;

        this.element.addEventListener('touchstart', (e) => {
            isTouch = true;
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.touchDeltaX = 0;
            this.touchDeltaY = 0;
        }, { passive: true });

        this.element.addEventListener('touchmove', (e) => {
            if (!isTouch) return;

            this.touchDeltaX = e.touches[0].clientX - this.touchStartX;
            this.touchDeltaY = e.touches[0].clientY - this.touchStartY;

            if (this.options.direction === 'horizontal') {
                if (Math.abs(this.touchDeltaX) > Math.abs(this.touchDeltaY)) {
                    e.preventDefault();
                    this.container.style.transform = `translateX(${-this.currentIndex * 100 + (this.touchDeltaX / this.element.offsetWidth) * 100}%)`;
                }
            } else {
                if (Math.abs(this.touchDeltaY) > Math.abs(this.touchDeltaX)) {
                    e.preventDefault();
                    this.container.style.transform = `translateY(${-this.currentIndex * 100 + (this.touchDeltaY / this.element.offsetHeight) * 100}%)`;
                }
            }
        }, { passive: false });

        this.element.addEventListener('touchend', () => {
            if (!isTouch) return;
            isTouch = false;

            const delta = this.options.direction === 'horizontal' ? this.touchDeltaX : this.touchDeltaY;
            const size = this.options.direction === 'horizontal' ? this.element.offsetWidth : this.element.offsetHeight;

            if (Math.abs(delta) > this.options.threshold) {
                if (delta > 0) {
                    this.prev();
                } else {
                    this.next();
                }
            } else {
                this.goTo(this.currentIndex);
            }
        }, { passive: true });
    }

    startAutoplay() {
        this.autoplayTimer = setInterval(() => {
            this.next();
        }, this.options.interval);

        // 마우스 오버 시 일시 정지
        this.element.addEventListener('mouseenter', () => {
            clearInterval(this.autoplayTimer);
        });

        this.element.addEventListener('mouseleave', () => {
            if (this.options.autoplay) {
                this.startAutoplay();
            }
        });
    }

    stopAutoplay() {
        clearInterval(this.autoplayTimer);
        this.options.autoplay = false;
    }

    async goTo(index, animate = true) {
        if (this.isAnimating || index === this.currentIndex) return;

        // 범위 체크
        if (!this.options.loop) {
            if (index < 0 || index >= this.slides.length) return;
        } else {
            if (index < 0) {
                index = this.slides.length - 1;
            } else if (index >= this.slides.length) {
                index = 0;
            }
        }

        this.isAnimating = true;
        const prevIndex = this.currentIndex;
        this.currentIndex = index;

        // 슬라이드 이동
        if (animate) {
            this.container.style.transition = `transform ${this.options.duration}ms ease`;
            this.container.style.transform = `translate${this.options.direction === 'horizontal' ? 'X' : 'Y'}(${-index * 100}%)`;

            await new Promise(resolve => {
                setTimeout(resolve, this.options.duration);
            });

            this.container.style.transition = '';
        } else {
            this.container.style.transform = `translate${this.options.direction === 'horizontal' ? 'X' : 'Y'}(${-index * 100}%)`;
        }

        // 활성 슬라이드 업데이트
        this.slides[prevIndex].classList.remove('active');
        this.slides[this.currentIndex].classList.add('active');

        this.updateNavigationState();
        this.updatePagination();
        this.isAnimating = false;

        // 이벤트 발생
        this.emit('change', {
            currentIndex: this.currentIndex,
            previousIndex: prevIndex
        });
    }

    prev() {
        this.goTo(this.currentIndex - 1);
    }

    next() {
        this.goTo(this.currentIndex + 1);
    }

    updateNavigationState() {
        if (!this.options.navigation) return;

        if (!this.options.loop) {
            this.prevButton.disabled = this.currentIndex === 0;
            this.nextButton.disabled = this.currentIndex === this.slides.length - 1;
        }
    }

    updatePagination() {
        if (!this.options.pagination) return;

        const dots = this.pagination.children;
        Array.from(dots).forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    emit(eventName, detail = {}) {
        const event = new CustomEvent(`carousel:${eventName}`, {
            bubbles: true,
            detail: { carousel: this, ...detail }
        });
        this.element.dispatchEvent(event);
    }

    // 공개 메서드
    getCurrentIndex() {
        return this.currentIndex;
    }

    getSlidesCount() {
        return this.slides.length;
    }

    destroy() {
        // 자동 재생 중지
        this.stopAutoplay();

        // 이벤트 리스너 제거
        this.element.removeEventListener('mouseenter', this.startAutoplay);
        this.element.removeEventListener('mouseleave', this.stopAutoplay);

        // DOM 복원
        while (this.container.firstChild) {
            this.element.appendChild(this.container.firstChild.firstChild);
        }

        // 생성된 요소 제거
        this.container.remove();
        if (this.prevButton) this.prevButton.remove();
        if (this.nextButton) this.nextButton.remove();
        if (this.pagination) this.pagination.remove();

        // 클래스 제거
        this.element.classList.remove('h-carousel', `h-carousel-${this.options.direction}`);
    }
}

export default Carousel;
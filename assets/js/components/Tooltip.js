/**
 * Tooltip Component for H-Calculator
 */

class Tooltip {
    constructor(options = {}) {
        this.options = {
            position: 'top', // top, bottom, left, right
            offset: 8, // 타겟으로부터의 거리
            animation: true,
            delay: 200, // 표시 지연 시간
            hideDelay: 0, // 숨김 지연 시간
            theme: 'dark', // dark, light
            maxWidth: 200,
            showOnFocus: true, // 접근성을 위한 포커스 시 표시
            html: false, // HTML 허용 여부
            ...options
        };

        this.tooltips = new Map();
        this.activeTooltip = null;
        this.showTimeout = null;
        this.hideTimeout = null;

        this.init();
    }

    init() {
        // 스타일 생성
        if (!document.getElementById('h-tooltip-styles')) {
            this.createStyles();
        }

        // 이벤트 위임
        document.addEventListener('mouseover', this.handleMouseOver.bind(this));
        document.addEventListener('mouseout', this.handleMouseOut.bind(this));
        document.addEventListener('focusin', this.handleFocusIn.bind(this));
        document.addEventListener('focusout', this.handleFocusOut.bind(this));

        // 스크롤 시 위치 업데이트
        window.addEventListener('scroll', this.handleScroll.bind(this), true);
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    createStyles() {
        const styles = `
            .h-tooltip {
                position: fixed;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 14px;
                line-height: 1.4;
                z-index: 9999;
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transition: opacity 0.2s, transform 0.2s;
            }

            .h-tooltip.h-tooltip-show {
                opacity: 1;
                visibility: visible;
            }

            .h-tooltip-dark {
                background-color: rgba(33, 33, 33, 0.9);
                color: #fff;
            }

            .h-tooltip-light {
                background-color: #fff;
                color: #333;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }

            .h-tooltip-arrow {
                position: absolute;
                width: 8px;
                height: 8px;
                transform: rotate(45deg);
            }

            .h-tooltip-dark .h-tooltip-arrow {
                background-color: rgba(33, 33, 33, 0.9);
            }

            .h-tooltip-light .h-tooltip-arrow {
                background-color: #fff;
            }

            .h-tooltip-top .h-tooltip-arrow {
                bottom: -4px;
            }

            .h-tooltip-bottom .h-tooltip-arrow {
                top: -4px;
            }

            .h-tooltip-left .h-tooltip-arrow {
                right: -4px;
            }

            .h-tooltip-right .h-tooltip-arrow {
                left: -4px;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'h-tooltip-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    create(target, content) {
        // 이미 존재하는 툴팁 체크
        if (this.tooltips.has(target)) {
            const existing = this.tooltips.get(target);
            existing.content = content;
            return existing;
        }

        // 툴팁 생성
        const tooltip = document.createElement('div');
        tooltip.className = `h-tooltip h-tooltip-${this.options.theme}`;
        tooltip.style.maxWidth = `${this.options.maxWidth}px`;

        // 화살표 추가
        const arrow = document.createElement('div');
        arrow.className = 'h-tooltip-arrow';
        tooltip.appendChild(arrow);

        // 컨텐츠 추가
        const contentElement = document.createElement('div');
        contentElement.className = 'h-tooltip-content';
        if (this.options.html) {
            contentElement.innerHTML = content;
        } else {
            contentElement.textContent = content;
        }
        tooltip.appendChild(contentElement);

        // DOM에 추가
        document.body.appendChild(tooltip);

        // 툴팁 정보 저장
        this.tooltips.set(target, {
            element: tooltip,
            arrow,
            content,
            position: target.dataset.tooltipPosition || this.options.position
        });

        return this.tooltips.get(target);
    }

    show(target) {
        clearTimeout(this.showTimeout);
        clearTimeout(this.hideTimeout);

        this.showTimeout = setTimeout(() => {
            if (!target.dataset.tooltip) return;

            const content = target.dataset.tooltip;
            const tooltip = this.create(target, content);
            this.activeTooltip = tooltip;

            tooltip.element.classList.add(`h-tooltip-${tooltip.position}`);
            this.position(target, tooltip);

            requestAnimationFrame(() => {
                tooltip.element.classList.add('h-tooltip-show');
            });
        }, this.options.delay);
    }

    hide(target) {
        clearTimeout(this.showTimeout);
        
        const tooltip = this.tooltips.get(target);
        if (!tooltip) return;

        clearTimeout(this.hideTimeout);
        this.hideTimeout = setTimeout(() => {
            tooltip.element.classList.remove('h-tooltip-show');
            this.activeTooltip = null;
        }, this.options.hideDelay);
    }

    position(target, tooltip) {
        const targetRect = target.getBoundingClientRect();
        const tooltipRect = tooltip.element.getBoundingClientRect();

        let top, left;

        switch (tooltip.position) {
            case 'top':
                top = targetRect.top - tooltipRect.height - this.options.offset;
                left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                tooltip.arrow.style.left = '50%';
                break;

            case 'bottom':
                top = targetRect.bottom + this.options.offset;
                left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                tooltip.arrow.style.left = '50%';
                break;

            case 'left':
                top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                left = targetRect.left - tooltipRect.width - this.options.offset;
                tooltip.arrow.style.top = '50%';
                break;

            case 'right':
                top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                left = targetRect.right + this.options.offset;
                tooltip.arrow.style.top = '50%';
                break;
        }

        // 화면 경계 체크
        const padding = 10;
        top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
        left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

        tooltip.element.style.top = `${top}px`;
        tooltip.element.style.left = `${left}px`;
    }

    handleMouseOver(e) {
        const target = e.target.closest('[data-tooltip]');
        if (target) {
            this.show(target);
        }
    }

    handleMouseOut(e) {
        const target = e.target.closest('[data-tooltip]');
        if (target) {
            this.hide(target);
        }
    }

    handleFocusIn(e) {
        if (!this.options.showOnFocus) return;
        
        const target = e.target.closest('[data-tooltip]');
        if (target) {
            this.show(target);
        }
    }

    handleFocusOut(e) {
        if (!this.options.showOnFocus) return;
        
        const target = e.target.closest('[data-tooltip]');
        if (target) {
            this.hide(target);
        }
    }

    handleScroll() {
        if (this.activeTooltip) {
            const target = Array.from(this.tooltips.entries())
                .find(([_, tooltip]) => tooltip === this.activeTooltip)?.[0];
            
            if (target) {
                this.position(target, this.activeTooltip);
            }
        }
    }

    handleResize() {
        if (this.activeTooltip) {
            const target = Array.from(this.tooltips.entries())
                .find(([_, tooltip]) => tooltip === this.activeTooltip)?.[0];
            
            if (target) {
                this.position(target, this.activeTooltip);
            }
        }
    }

    // 공개 메서드
    updateContent(target, content) {
        const tooltip = this.tooltips.get(target);
        if (tooltip) {
            tooltip.content = content;
            if (this.options.html) {
                tooltip.element.querySelector('.h-tooltip-content').innerHTML = content;
            } else {
                tooltip.element.querySelector('.h-tooltip-content').textContent = content;
            }
        }
    }

    setPosition(target, position) {
        const tooltip = this.tooltips.get(target);
        if (tooltip) {
            tooltip.position = position;
            if (this.activeTooltip === tooltip) {
                this.position(target, tooltip);
            }
        }
    }

    destroy() {
        this.tooltips.forEach(tooltip => {
            tooltip.element.remove();
        });
        this.tooltips.clear();

        const styleSheet = document.getElementById('h-tooltip-styles');
        if (styleSheet) {
            styleSheet.remove();
        }
    }
}

export default Tooltip;
/**
 * Tabs Component for H-Calculator
 */

class Tabs {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            activeTab: 0,
            animation: true,
            onTabChange: null,
            storageKey: null,
            verticalMode: false,
            ...options
        };

        this.tabs = [];
        this.panels = [];
        this.activeIndex = this.options.activeTab;

        this.init();
    }

    init() {
        this.setupDOM();
        this.loadSavedTab();
        this.bindEvents();
        this.activateTab(this.activeIndex);
    }

    setupDOM() {
        // 탭 리스트와 패널 컨테이너 생성
        this.tabList = document.createElement('div');
        this.tabList.className = `h-tabs-list ${
            this.options.verticalMode ? 'h-tabs-list--vertical' : ''
        }`;
        this.tabList.setAttribute('role', 'tablist');

        this.panelContainer = document.createElement('div');
        this.panelContainer.className = 'h-tabs-panels';

        // 기존 내용을 탭으로 변환
        Array.from(this.container.children).forEach((child, index) => {
            // 탭 버튼 생성
            const tab = this.createTab(child.getAttribute('data-tab') || `탭 ${index + 1}`, index);
            this.tabs.push(tab);
            this.tabList.appendChild(tab);

            // 패널 생성
            const panel = this.createPanel(child, index);
            this.panels.push(panel);
            this.panelContainer.appendChild(panel);
        });

        // DOM 재구성
        this.container.innerHTML = '';
        this.container.className = `h-tabs ${
            this.options.verticalMode ? 'h-tabs--vertical' : ''
        }`;
        this.container.appendChild(this.tabList);
        this.container.appendChild(this.panelContainer);
    }

    createTab(title, index) {
        const tab = document.createElement('button');
        tab.className = 'h-tab';
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('aria-controls', `panel-${index}`);
        tab.id = `tab-${index}`;
        
        tab.innerHTML = `
            <span class="h-tab-text">${title}</span>
            ${this.options.animation ? '<span class="h-tab-indicator"></span>' : ''}
        `;

        return tab;
    }

    createPanel(content, index) {
        const panel = document.createElement('div');
        panel.className = 'h-tab-panel';
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', `tab-${index}`);
        panel.id = `panel-${index}`;
        panel.appendChild(content);

        return panel;
    }

    bindEvents() {
        // 탭 클릭 이벤트
        this.tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                this.activateTab(index);
            });

            // 키보드 네비게이션
            tab.addEventListener('keydown', (e) => {
                let targetIndex;

                switch (e.key) {
                    case 'ArrowRight':
                        targetIndex = (index + 1) % this.tabs.length;
                        break;
                    case 'ArrowLeft':
                        targetIndex = (index - 1 + this.tabs.length) % this.tabs.length;
                        break;
                    case 'Home':
                        targetIndex = 0;
                        break;
                    case 'End':
                        targetIndex = this.tabs.length - 1;
                        break;
                    default:
                        return;
                }

                e.preventDefault();
                this.tabs[targetIndex].focus();
                this.activateTab(targetIndex);
            });
        });

        // 리사이즈 이벤트
        if (this.options.animation) {
            window.addEventListener('resize', () => {
                this.updateIndicator();
            });
        }
    }

    activateTab(index) {
        if (index === this.activeIndex) return;

        // 이전 탭 비활성화
        if (this.activeIndex !== null) {
            this.tabs[this.activeIndex].classList.remove('active');
            this.tabs[this.activeIndex].setAttribute('aria-selected', 'false');
            this.panels[this.activeIndex].classList.remove('active');
        }

        // 새 탭 활성화
        this.tabs[index].classList.add('active');
        this.tabs[index].setAttribute('aria-selected', 'true');
        this.panels[index].classList.add('active');

        // 인디케이터 업데이트
        if (this.options.animation) {
            this.updateIndicator(index);
        }

        // 상태 저장
        this.activeIndex = index;
        if (this.options.storageKey) {
            localStorage.setItem(this.options.storageKey, index);
        }

        // 콜백 실행
        if (typeof this.options.onTabChange === 'function') {
            this.options.onTabChange(index, this.tabs[index], this.panels[index]);
        }
    }

    updateIndicator(index = this.activeIndex) {
        const activeTab = this.tabs[index];
        const indicator = activeTab.querySelector('.h-tab-indicator');
        
        if (this.options.verticalMode) {
            indicator.style.top = `${activeTab.offsetTop}px`;
            indicator.style.height = `${activeTab.offsetHeight}px`;
        } else {
            indicator.style.left = `${activeTab.offsetLeft}px`;
            indicator.style.width = `${activeTab.offsetWidth}px`;
        }
    }

    loadSavedTab() {
        if (this.options.storageKey) {
            const savedIndex = localStorage.getItem(this.options.storageKey);
            if (savedIndex !== null) {
                this.activeIndex = parseInt(savedIndex);
            }
        }
    }

    // 공개 메서드
    getActiveTab() {
        return {
            index: this.activeIndex,
            tab: this.tabs[this.activeIndex],
            panel: this.panels[this.activeIndex]
        };
    }

    setActiveTab(index) {
        if (index >= 0 && index < this.tabs.length) {
            this.activateTab(index);
        }
    }

    enableTab(index) {
        if (index >= 0 && index < this.tabs.length) {
            this.tabs[index].disabled = false;
        }
    }

    disableTab(index) {
        if (index >= 0 && index < this.tabs.length) {
            this.tabs[index].disabled = true;
        }
    }

    destroy() {
        // 이벤트 리스너 제거
        this.tabs.forEach(tab => {
            tab.removeEventListener('click', this.activateTab);
        });

        if (this.options.animation) {
            window.removeEventListener('resize', this.updateIndicator);
        }

        // DOM 복원
        this.container.innerHTML = '';
        this.panels.forEach(panel => {
            this.container.appendChild(panel.firstChild);
        });

        // 클래스 제거
        this.container.className = this.container.className
            .replace('h-tabs', '')
            .replace('h-tabs--vertical', '');
    }
}

export default Tabs;
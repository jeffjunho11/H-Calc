/**
 * Dropdown Component for H-Calculator
 */

class Dropdown {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            placement: 'bottom-start',
            offset: 8,
            trigger: 'click', // click, hover
            animation: true,
            closeOnSelect: true,
            closeOnClickOutside: true,
            maxHeight: 300,
            searchable: false,
            multiple: false,
            ...options
        };

        this.isOpen = false;
        this.selectedItems = new Set();
        this.init();
    }

    init() {
        this.setupDOM();
        this.bindEvents();
    }

    setupDOM() {
        // 원본 select 요소 숨기기
        if (this.element.tagName === 'SELECT') {
            this.element.style.display = 'none';
            this.createFromSelect();
        } else {
            this.createFromDiv();
        }
    }

    createFromSelect() {
        this.container = document.createElement('div');
        this.container.className = 'h-dropdown';

        // 트리거 버튼 생성
        this.trigger = document.createElement('button');
        this.trigger.className = 'h-dropdown-trigger';
        this.trigger.setAttribute('type', 'button');
        this.trigger.innerHTML = `
            <span class="h-dropdown-trigger-text"></span>
            <svg class="h-dropdown-trigger-icon" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" 
                      stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;

        // 드롭다운 메뉴 생성
        this.menu = document.createElement('div');
        this.menu.className = 'h-dropdown-menu';
        
        // 검색 입력창 추가
        if (this.options.searchable) {
            const searchContainer = document.createElement('div');
            searchContainer.className = 'h-dropdown-search';
            searchContainer.innerHTML = `
                <input type="text" class="h-dropdown-search-input" 
                       placeholder="검색...">
            `;
            this.menu.appendChild(searchContainer);
        }

        // 옵션 목록 생성
        const optionsList = document.createElement('div');
        optionsList.className = 'h-dropdown-options';
        
        Array.from(this.element.options).forEach(option => {
            const item = document.createElement('div');
            item.className = 'h-dropdown-item';
            item.setAttribute('data-value', option.value);
            item.innerHTML = `
                ${this.options.multiple ? '<input type="checkbox" class="h-dropdown-checkbox">' : ''}
                <span class="h-dropdown-item-text">${option.text}</span>
            `;
            optionsList.appendChild(item);
        });

        this.menu.appendChild(optionsList);

        // 컨테이너에 요소 추가
        this.container.appendChild(this.trigger);
        this.container.appendChild(this.menu);

        // 원본 요소 다음에 삽입
        this.element.parentNode.insertBefore(this.container, this.element.nextSibling);

        // 초기 선택값 설정
        this.updateTriggerText();
    }

    createFromDiv() {
        this.container = this.element;
        this.container.classList.add('h-dropdown');

        // 트리거 버튼 찾기
        this.trigger = this.container.querySelector('[data-dropdown-trigger]');
        if (!this.trigger) {
            throw new Error('Dropdown trigger element not found');
        }
        this.trigger.classList.add('h-dropdown-trigger');

        // 메뉴 찾기
        this.menu = this.container.querySelector('[data-dropdown-menu]');
        if (!this.menu) {
            throw new Error('Dropdown menu element not found');
        }
        this.menu.classList.add('h-dropdown-menu');
    }

    bindEvents() {
        // 트리거 이벤트
        if (this.options.trigger === 'click') {
            this.trigger.addEventListener('click', () => this.toggle());
        } else if (this.options.trigger === 'hover') {
            this.container.addEventListener('mouseenter', () => this.open());
            this.container.addEventListener('mouseleave', () => this.close());
        }

        // 아이템 선택 이벤트
        this.menu.addEventListener('click', e => {
            const item = e.target.closest('.h-dropdown-item');
            if (item) {
                this.selectItem(item);
            }
        });

        // 검색 기능
        if (this.options.searchable) {
            const searchInput = this.menu.querySelector('.h-dropdown-search-input');
            searchInput.addEventListener('input', e => this.handleSearch(e.target.value));
            
            // 검색 입력 시 드롭다운 닫히지 않도록
            searchInput.addEventListener('click', e => e.stopPropagation());
        }

        // 외부 클릭 감지
        if (this.options.closeOnClickOutside) {
            document.addEventListener('click', e => {
                if (!this.container.contains(e.target)) {
                    this.close();
                }
            });
        }
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        if (this.isOpen) return;

        this.menu.style.display = 'block';
        this.setPosition();

        requestAnimationFrame(() => {
            this.menu.classList.add('h-dropdown-menu--show');
            this.trigger.classList.add('h-dropdown-trigger--active');
        });

        this.isOpen = true;
        this.emit('open');
    }

    close() {
        if (!this.isOpen) return;

        this.menu.classList.remove('h-dropdown-menu--show');
        this.trigger.classList.remove('h-dropdown-trigger--active');

        this.menu.addEventListener('transitionend', () => {
            if (!this.isOpen) {
                this.menu.style.display = 'none';
            }
        }, { once: true });

        this.isOpen = false;
        this.emit('close');
    }

    setPosition() {
        const triggerRect = this.trigger.getBoundingClientRect();
        const menuRect = this.menu.getBoundingClientRect();
        
        const positions = {
            'bottom-start': {
                top: triggerRect.bottom + this.options.offset,
                left: triggerRect.left
            },
            'bottom-end': {
                top: triggerRect.bottom + this.options.offset,
                left: triggerRect.right - menuRect.width
            },
            'top-start': {
                top: triggerRect.top - menuRect.height - this.options.offset,
                left: triggerRect.left
            },
            'top-end': {
                top: triggerRect.top - menuRect.height - this.options.offset,
                left: triggerRect.right - menuRect.width
            }
        };

        const pos = positions[this.options.placement];
        Object.assign(this.menu.style, {
            top: pos.top + 'px',
            left: pos.left + 'px'
        });
    }

    selectItem(item) {
        const value = item.getAttribute('data-value');

        if (this.options.multiple) {
            const checkbox = item.querySelector('.h-dropdown-checkbox');
            if (this.selectedItems.has(value)) {
                this.selectedItems.delete(value);
                checkbox.checked = false;
                item.classList.remove('h-dropdown-item--selected');
            } else {
                this.selectedItems.add(value);
                checkbox.checked = true;
                item.classList.add('h-dropdown-item--selected');
            }
        } else {
            this.selectedItems.clear();
            this.selectedItems.add(value);
            
            this.menu.querySelectorAll('.h-dropdown-item').forEach(el => {
                el.classList.remove('h-dropdown-item--selected');
            });
            item.classList.add('h-dropdown-item--selected');

            if (this.options.closeOnSelect) {
                this.close();
            }
        }

        this.updateTriggerText();
        this.updateOriginalElement();
        this.emit('change', Array.from(this.selectedItems));
    }

    updateTriggerText() {
        if (this.element.tagName === 'SELECT') {
            const selectedOptions = Array.from(this.element.options)
                .filter(option => this.selectedItems.has(option.value))
                .map(option => option.text);

            const text = selectedOptions.length > 0 
                ? selectedOptions.join(', ') 
                : this.trigger.getAttribute('data-placeholder') || '선택하세요';

            this.trigger.querySelector('.h-dropdown-trigger-text').textContent = text;
        }
    }

    updateOriginalElement() {
        if (this.element.tagName === 'SELECT') {
            Array.from(this.element.options).forEach(option => {
                option.selected = this.selectedItems.has(option.value);
            });

            // Change 이벤트 발생
            const event = new Event('change', { bubbles: true });
            this.element.dispatchEvent(event);
        }
    }

    handleSearch(query) {
        const items = this.menu.querySelectorAll('.h-dropdown-item');
        const normalizedQuery = query.toLowerCase();

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(normalizedQuery) ? '' : 'none';
        });
    }

    setValue(value) {
        if (Array.isArray(value)) {
            this.selectedItems = new Set(value);
        } else {
            this.selectedItems = new Set([value]);
        }

        this.updateTriggerText();
        this.updateOriginalElement();
    }

    getValue() {
        return this.options.multiple 
            ? Array.from(this.selectedItems)
            : Array.from(this.selectedItems)[0];
    }

    emit(eventName, detail = {}) {
        const event = new CustomEvent(`dropdown:${eventName}`, {
            bubbles: true,
            detail: { dropdown: this, ...detail }
        });
        this.container.dispatchEvent(event);
    }

    destroy() {
        if (this.element.tagName === 'SELECT') {
            this.element.style.display = '';
            this.container.remove();
        } else {
            this.container.classList.remove('h-dropdown');
            this.trigger.classList.remove('h-dropdown-trigger');
            this.menu.classList.remove('h-dropdown-menu');
        }
    }
}

export default Dropdown;
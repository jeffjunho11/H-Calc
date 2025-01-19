/**
 * Table Component for H-Calculator
 */

class Table {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            sortable: true,
            searchable: true,
            pagination: true,
            rowsPerPage: 10,
            selectable: false,
            responsive: true,
            fixedHeader: false,
            exportable: false,
            data: [],
            columns: [],
            ...options
        };

        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.searchQuery = '';
        this.selectedRows = new Set();

        this.init();
    }

    init() {
        this.validateOptions();
        this.createTable();
        this.bindEvents();
        this.render();

        if (this.options.fixedHeader) {
            this.initFixedHeader();
        }
    }

    validateOptions() {
        if (!Array.isArray(this.options.data)) {
            throw new Error('Data must be an array');
        }

        if (!Array.isArray(this.options.columns)) {
            throw new Error('Columns must be an array');
        }

        this.options.columns = this.options.columns.map(column => ({
            sortable: this.options.sortable,
            searchable: true,
            visible: true,
            ...column
        }));
    }

    createTable() {
        this.container = document.createElement('div');
        this.container.className = 'h-table-container';

        // 검색 필드
        if (this.options.searchable) {
            this.createSearchField();
        }

        // 테이블 래퍼
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'h-table-wrapper';
        if (this.options.responsive) {
            this.wrapper.classList.add('h-table-responsive');
        }

        // 테이블 생성
        this.table = document.createElement('table');
        this.table.className = 'h-table';

        // 테이블 헤더
        this.thead = document.createElement('thead');
        this.createHeader();
        this.table.appendChild(this.thead);

        // 테이블 바디
        this.tbody = document.createElement('tbody');
        this.table.appendChild(this.tbody);

        this.wrapper.appendChild(this.table);
        this.container.appendChild(this.wrapper);

        // 페이지네이션
        if (this.options.pagination) {
            this.createPagination();
        }

        // 내보내기 버튼
        if (this.options.exportable) {
            this.createExportButton();
        }

        this.element.appendChild(this.container);
    }

    createHeader() {
        const row = document.createElement('tr');

        // 체크박스 컬럼
        if (this.options.selectable) {
            const th = document.createElement('th');
            th.className = 'h-table-checkbox';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.addEventListener('change', () => this.toggleAllRows(checkbox.checked));
            th.appendChild(checkbox);
            row.appendChild(th);
        }

        // 데이터 컬럼
        this.options.columns.forEach((column, index) => {
            if (!column.visible) return;

            const th = document.createElement('th');
            th.textContent = column.title;

            if (column.sortable) {
                th.classList.add('h-table-sortable');
                th.addEventListener('click', () => this.sort(index));

                // 정렬 아이콘
                const icon = document.createElement('span');
                icon.className = 'h-table-sort-icon';
                th.appendChild(icon);
            }

            if (column.width) {
                th.style.width = column.width;
            }

            row.appendChild(th);
        });

        this.thead.appendChild(row);
    }

    createSearchField() {
        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'h-table-search';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = '검색...';
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.currentPage = 1;
            this.render();
        });

        searchWrapper.appendChild(searchInput);
        this.container.appendChild(searchWrapper);
    }

    createPagination() {
        this.pagination = document.createElement('div');
        this.pagination.className = 'h-table-pagination';
        this.container.appendChild(this.pagination);
    }

    createExportButton() {
        const exportWrapper = document.createElement('div');
        exportWrapper.className = 'h-table-export';

        const exportButton = document.createElement('button');
        exportButton.textContent = '내보내기';
        exportButton.addEventListener('click', () => this.exportToCSV());

        exportWrapper.appendChild(exportButton);
        this.container.appendChild(exportWrapper);
    }

    bindEvents() {
        // 반응형 테이블 스크롤 이벤트
        if (this.options.responsive) {
            this.wrapper.addEventListener('scroll', () => {
                if (this.options.fixedHeader) {
                    this.updateFixedHeader();
                }
            });
        }

        // 윈도우 리사이즈 이벤트
        window.addEventListener('resize', () => {
            if (this.options.fixedHeader) {
                this.updateFixedHeader();
            }
        });
    }

    render() {
        // 데이터 필터링
        let filteredData = this.filterData();

        // 데이터 정렬
        if (this.sortColumn !== null) {
            filteredData = this.sortData(filteredData);
        }

        // 페이지네이션
        let displayData = filteredData;
        if (this.options.pagination) {
            const start = (this.currentPage - 1) * this.options.rowsPerPage;
            displayData = filteredData.slice(start, start + this.options.rowsPerPage);
            this.renderPagination(filteredData.length);
        }

        // 테이블 바디 렌더링
        this.tbody.innerHTML = '';
        displayData.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');

            // 체크박스
            if (this.options.selectable) {
                const td = document.createElement('td');
                td.className = 'h-table-checkbox';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = this.selectedRows.has(rowIndex);
                checkbox.addEventListener('change', () => this.toggleRow(rowIndex));
                td.appendChild(checkbox);
                tr.appendChild(td);
            }

            // 데이터 셀
            this.options.columns.forEach(column => {
                if (!column.visible) return;

                const td = document.createElement('td');
                if (typeof column.render === 'function') {
                    td.innerHTML = column.render(row[column.field], row);
                } else {
                    td.textContent = row[column.field];
                }
                tr.appendChild(td);
            });

            this.tbody.appendChild(tr);
        });
    }

    filterData() {
        if (!this.searchQuery) return [...this.options.data];

        const query = this.searchQuery.toLowerCase();
        return this.options.data.filter(row => {
            return this.options.columns.some(column => {
                if (!column.searchable) return false;
                const value = row[column.field];
                if (value == null) return false;
                return String(value).toLowerCase().includes(query);
            });
        });
    }

    sortData(data) {
        const column = this.options.columns[this.sortColumn];
        const direction = this.sortDirection === 'asc' ? 1 : -1;

        return [...data].sort((a, b) => {
            let valueA = a[column.field];
            let valueB = b[column.field];

            if (typeof column.sort === 'function') {
                return column.sort(valueA, valueB) * direction;
            }

            if (valueA == null) valueA = '';
            if (valueB == null) valueB = '';

            if (typeof valueA === 'string') valueA = valueA.toLowerCase();
            if (typeof valueB === 'string') valueB = valueB.toLowerCase();

            if (valueA < valueB) return -1 * direction;
            if (valueA > valueB) return 1 * direction;
            return 0;
        });
    }

    renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.options.rowsPerPage);
        this.pagination.innerHTML = '';

        // 이전 페이지
        if (this.currentPage > 1) {
            const prev = document.createElement('button');
            prev.textContent = '이전';
            prev.addEventListener('click', () => {
                this.currentPage--;
                this.render();
            });
            this.pagination.appendChild(prev);
        }

        // 페이지 번호
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            if (i === this.currentPage) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                this.currentPage = i;
                this.render();
            });
            this.pagination.appendChild(button);
        }

        // 다음 페이지
        if (this.currentPage < totalPages) {
            const next = document.createElement('button');
            next.textContent = '다음';
            next.addEventListener('click', () => {
                this.currentPage++;
                this.render();
            });
            this.pagination.appendChild(next);
        }
    }

    sort(columnIndex) {
        if (this.sortColumn === columnIndex) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnIndex;
            this.sortDirection = 'asc';
        }

        // 정렬 아이콘 업데이트
        const headers = this.thead.querySelectorAll('th');
        headers.forEach(th => th.classList.remove('asc', 'desc'));
        headers[this.options.selectable ? columnIndex + 1 : columnIndex]
            .classList.add(this.sortDirection);

        this.render();
    }

    toggleRow(rowIndex) {
        if (this.selectedRows.has(rowIndex)) {
            this.selectedRows.delete(rowIndex);
        } else {
            this.selectedRows.add(rowIndex);
        }
        this.emit('selectionChange', Array.from(this.selectedRows));
    }

    toggleAllRows(checked) {
        if (checked) {
            this.options.data.forEach((_, index) => this.selectedRows.add(index));
        } else {
            this.selectedRows.clear();
        }
        this.render();
        this.emit('selectionChange', Array.from(this.selectedRows));
    }

    initFixedHeader() {
        this.thead.classList.add('h-table-fixed-header');
        this.updateFixedHeader();
    }

    updateFixedHeader() {
        const rect = this.wrapper.getBoundingClientRect();
        this.thead.style.transform = `translateY(${this.wrapper.scrollTop}px)`;
        this.thead.style.width = `${rect.width}px`;
    }

    exportToCSV() {
        const headers = this.options.columns
            .filter(column => column.visible)
            .map(column => column.title);

        const rows = this.options.data.map(row =>
            this.options.columns
                .filter(column => column.visible)
                .map(column => row[column.field])
        );

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'export.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    emit(eventName, detail) {
        const event = new CustomEvent(`table:${eventName}`, {
            bubbles: true,
            detail: { table: this, ...detail }
        });
        this.element.dispatchEvent(event);
    }

    // 공개 메서드
    refresh() {
        this.render();
    }

    getSelectedRows() {
        return Array.from(this.selectedRows).map(index => this.options.data[index]);
    }

    updateData(newData) {
        this.options.data = newData;
        this.selectedRows.clear();
        this.currentPage = 1;
        this.render();
    }

    destroy() {
        this.element.innerHTML = '';
    }
}

export default Table;
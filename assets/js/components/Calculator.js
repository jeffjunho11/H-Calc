/**
 * Base Calculator Component for H-Calculator
 */

import EventUtils from '../utils/eventUtils';
import ValidationUtils from '../utils/validationUtils';
import AnalyticsUtils from '../utils/analyticsUtils';
import CalculatorUtils from '../utils/calculatorUtils';

class Calculator {
    /**
     * 계산기 생성자
     * @param {string} id - 계산기 ID
     * @param {Object} options - 계산기 옵션
     */
    constructor(id, options = {}) {
        this.id = id;
        this.options = {
            ...CalculatorUtils.defaultSettings,
            ...options
        };

        this.elements = {};
        this.state = {
            inputs: {},
            results: {},
            isCalculating: false,
            errors: {}
        };

        this.eventHandlers = {};
        this.init();
    }

    /**
     * 초기화
     * @private
     */
    init() {
        this.initElements();
        this.initEventListeners();
        this.loadHistory();
        this.render();
    }

    /**
     * DOM 요소 초기화
     * @private
     */
    initElements() {
        // 기본 요소
        this.elements.container = document.getElementById(this.id);
        if (!this.elements.container) {
            throw new Error(`Calculator container with id "${this.id}" not found`);
        }

        // 입력 필드
        this.elements.inputs = {};
        const inputElements = this.elements.container.querySelectorAll('[data-calculator-input]');
        inputElements.forEach(element => {
            const inputName = element.getAttribute('data-calculator-input');
            this.elements.inputs[inputName] = element;
        });

        // 결과 필드
        this.elements.results = {};
        const resultElements = this.elements.container.querySelectorAll('[data-calculator-result]');
        resultElements.forEach(element => {
            const resultName = element.getAttribute('data-calculator-result');
            this.elements.results[resultName] = element;
        });

        // 오류 메시지 컨테이너
        this.elements.errorContainer = this.elements.container.querySelector('[data-calculator-errors]');

        // 기록 컨테이너
        this.elements.historyContainer = this.elements.container.querySelector('[data-calculator-history]');
    }

    /**
     * 이벤트 리스너 초기화
     * @private
     */
    initEventListeners() {
        // 입력값 변경 이벤트
        Object.entries(this.elements.inputs).forEach(([name, element]) => {
            const handler = EventUtils.debounce(() => {
                this.handleInput(name, element.value);
            }, 300);

            this.eventHandlers[name] = handler;
            element.addEventListener('input', handler);
        });

        // 계산 버튼 클릭 이벤트
        const calculateButton = this.elements.container.querySelector('[data-calculator-calculate]');
        if (calculateButton) {
            calculateButton.addEventListener('click', () => this.calculate());
        }

        // 초기화 버튼 클릭 이벤트
        const resetButton = this.elements.container.querySelector('[data-calculator-reset]');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.reset());
        }
    }

    /**
     * 입력값 처리
     * @param {string} name - 입력 필드 이름
     * @param {string} value - 입력값
     */
    handleInput(name, value) {
        this.state.inputs[name] = CalculatorUtils.normalizeInput(value);
        this.validateInput(name);

        if (this.options.autoCalculate && !this.hasErrors()) {
            this.calculate();
        }
    }

    /**
     * 입력값 검증
     * @param {string} name - 검증할 필드 이름
     */
    validateInput(name) {
        const value = this.state.inputs[name];
        const rules = this.options.validationRules?.[name];

        if (rules) {
            const validation = ValidationUtils.validateNumber(value, rules);
            if (!validation.isValid) {
                this.state.errors[name] = validation.errors;
            } else {
                delete this.state.errors[name];
            }
        }

        this.renderErrors();
    }

    /**
     * 계산 수행
     */
    async calculate() {
        if (this.state.isCalculating || this.hasErrors()) return;

        try {
            this.state.isCalculating = true;
            this.render();

            // 실제 계산 수행 (하위 클래스에서 구현)
            const results = await this.performCalculation();

            // 결과 저장
            this.state.results = results;

            // 계산 기록 저장
            this.saveToHistory();

            // 분석 데이터 기록
            AnalyticsUtils.trackCalculation(this.id, {
                inputs: this.state.inputs,
                results: this.state.results
            });
        } catch (error) {
            console.error('Calculation error:', error);
            this.state.errors.calculation = ['계산 중 오류가 발생했습니다.'];
        } finally {
            this.state.isCalculating = false;
            this.render();
        }
    }

    /**
     * 계산 수행 (하위 클래스에서 구현)
     * @returns {Promise<Object>} 계산 결과
     */
    async performCalculation() {
        throw new Error('performCalculation method must be implemented');
    }

    /**
     * 계산기 초기화
     */
    reset() {
        this.state = {
            inputs: {},
            results: {},
            isCalculating: false,
            errors: {}
        };

        // 입력 필드 초기화
        Object.values(this.elements.inputs).forEach(element => {
            element.value = '';
        });

        this.render();
    }

    /**
     * 기록 저장
     * @private
     */
    saveToHistory() {
        CalculatorUtils.saveCalculation(this.id, {
            inputs: this.state.inputs,
            results: this.state.results
        });
        this.renderHistory();
    }

    /**
     * 기록 로드
     * @private
     */
    loadHistory() {
        this.history = CalculatorUtils.getCalculationHistory(this.id);
        this.renderHistory();
    }

    /**
     * 오류 여부 확인
     * @returns {boolean} 오류 존재 여부
     */
    hasErrors() {
        return Object.keys(this.state.errors).length > 0;
    }

    /**
     * 렌더링
     */
    render() {
        this.renderResults();
        this.renderErrors();
        this.renderHistory();
        this.updateUI();
    }

    /**
     * 결과 렌더링
     * @private
     */
    renderResults() {
        Object.entries(this.elements.results).forEach(([name, element]) => {
            const value = this.state.results[name];
            if (value !== undefined) {
                element.textContent = this.formatResult(name, value);
            }
        });
    }

    /**
     * 오류 렌더링
     * @private
     */
    renderErrors() {
        if (!this.elements.errorContainer) return;

        if (this.hasErrors()) {
            const errorMessages = Object.values(this.state.errors)
                .flat()
                .map(error => `<div class="calculator-error">${error}</div>`)
                .join('');
            this.elements.errorContainer.innerHTML = errorMessages;
            this.elements.errorContainer.style.display = 'block';
        } else {
            this.elements.errorContainer.style.display = 'none';
        }
    }

    /**
     * 기록 렌더링
     * @private
     */
    renderHistory() {
        if (!this.elements.historyContainer) return;

        const historyHTML = this.history
            .map((item, index) => this.renderHistoryItem(item, index))
            .join('');
        this.elements.historyContainer.innerHTML = historyHTML;
    }

    /**
     * UI 업데이트
     * @private
     */
    updateUI() {
        // 로딩 상태 표시
        this.elements.container.classList.toggle('calculating', this.state.isCalculating);

        // 계산 버튼 상태 업데이트
        const calculateButton = this.elements.container.querySelector('[data-calculator-calculate]');
        if (calculateButton) {
            calculateButton.disabled = this.state.isCalculating || this.hasErrors();
        }
    }

    /**
     * 결과값 포맷팅 (하위 클래스에서 구현)
     * @param {string} name - 결과 필드 이름
     * @param {any} value - 결과값
     * @returns {string} 포맷된 결과값
     */
    formatResult(name, value) {
        return value.toString();
    }

    /**
     * 기록 항목 렌더링 (하위 클래스에서 구현)
     * @param {Object} item - 기록 항목
     * @param {number} index - 인덱스
     * @returns {string} 렌더링된 HTML
     */
    renderHistoryItem(item, index) {
        return '';
    }
}

export default Calculator;
/**
 * Calculator Utility Functions for H-Calculator
 */

import MathUtils from './mathUtils';
import ValidationUtils from './validationUtils';
import FormatUtils from './formatUtils';

class CalculatorUtils {
    /**
     * 계산기 타입
     */
    static CALCULATOR_TYPES = {
        FINANCE: 'finance',
        MATH: 'math',
        DATE: 'date',
        UNIT: 'unit',
        HEALTH: 'health',
        GENERAL: 'general'
    };

    /**
     * 기본 계산기 설정
     */
    static defaultSettings = {
        precision: 2,
        maxInputLength: 20,
        maxHistoryItems: 10,
        autoCalculate: true
    };

    /**
     * 계산 기록 저장
     * @param {string} calculatorId - 계산기 ID
     * @param {Object} calculation - 계산 데이터
     */
    static saveCalculation(calculatorId, calculation) {
        try {
            const history = this.getCalculationHistory(calculatorId);
            history.unshift({
                ...calculation,
                timestamp: Date.now()
            });

            // 최대 기록 개수 제한
            if (history.length > this.defaultSettings.maxHistoryItems) {
                history.pop();
            }

            localStorage.setItem(
                `h_calculator_history_${calculatorId}`,
                JSON.stringify(history)
            );
        } catch (error) {
            console.error('Failed to save calculation:', error);
        }
    }

    /**
     * 계산 기록 조회
     * @param {string} calculatorId - 계산기 ID
     * @returns {Array} 계산 기록
     */
    static getCalculationHistory(calculatorId) {
        try {
            const history = localStorage.getItem(`h_calculator_history_${calculatorId}`);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Failed to load calculation history:', error);
            return [];
        }
    }

    /**
     * 계산 기록 삭제
     * @param {string} calculatorId - 계산기 ID
     * @param {number} index - 삭제할 기록 인덱스 (옵션)
     */
    static clearCalculationHistory(calculatorId, index = null) {
        try {
            if (index !== null) {
                const history = this.getCalculationHistory(calculatorId);
                history.splice(index, 1);
                localStorage.setItem(
                    `h_calculator_history_${calculatorId}`,
                    JSON.stringify(history)
                );
            } else {
                localStorage.removeItem(`h_calculator_history_${calculatorId}`);
            }
        } catch (error) {
            console.error('Failed to clear calculation history:', error);
        }
    }

    /**
     * 입력값 검증
     * @param {Object} inputs - 입력값 객체
     * @param {Object} validationRules - 검증 규칙
     * @returns {Object} 검증 결과
     */
    static validateInputs(inputs, validationRules) {
        const results = {
            isValid: true,
            errors: {},
            validatedInputs: {}
        };

        for (const [key, value] of Object.entries(inputs)) {
            const rules = validationRules[key];
            if (!rules) continue;

            const validation = ValidationUtils.validateNumber(value, rules);
            
            if (!validation.isValid) {
                results.isValid = false;
                results.errors[key] = validation.errors;
            } else {
                results.validatedInputs[key] = validation.value;
            }
        }

        return results;
    }

    /**
     * 결과 포맷팅
     * @param {Object} results - 결과값 객체
     * @param {Object} formatRules - 포맷 규칙
     * @returns {Object} 포맷된 결과
     */
    static formatResults(results, formatRules) {
        const formatted = {};

        for (const [key, value] of Object.entries(results)) {
            const rule = formatRules[key];
            if (!rule) {
                formatted[key] = value;
                continue;
            }

            switch (rule.type) {
                case 'currency':
                    formatted[key] = FormatUtils.formatCurrency(value, rule.currency);
                    break;
                case 'percent':
                    formatted[key] = FormatUtils.formatPercent(value, rule.decimals);
                    break;
                case 'number':
                    formatted[key] = FormatUtils.formatNumber(value, rule.decimals);
                    break;
                default:
                    formatted[key] = value;
            }
        }

        return formatted;
    }

    /**
     * 입력값 정규화
     * @param {string|number} value - 입력값
     * @returns {number} 정규화된 값
     */
    static normalizeInput(value) {
        if (typeof value === 'string') {
            // 천단위 구분자 제거
            value = value.replace(/,/g, '');
            // 공백 제거
            value = value.trim();
            // 숫자로 변환
            value = Number(value);
        }
        return value;
    }

    /**
     * 오차 범위 내 반올림
     * @param {number} value - 값
     * @param {number} precision - 정밀도
     * @returns {number} 반올림된 값
     */
    static roundWithPrecision(value, precision = 2) {
        const multiplier = Math.pow(10, precision);
        return Math.round(value * multiplier) / multiplier;
    }
}

export default CalculatorUtils;
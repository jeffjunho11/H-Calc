/**
 * Math Utility Functions for H-Calculator
 */

class MathUtils {
    /**
     * 숫자 포맷팅
     * @param {number} number - 포맷할 숫자
     * @param {number} decimals - 소수점 자리수
     * @param {string} locale - 로케일 (예: 'ko-KR', 'en-US')
     * @returns {string} 포맷된 문자열
     */
    static formatNumber(number, decimals = 2, locale = 'ko-KR') {
        try {
            return new Intl.NumberFormat(locale, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }).format(number);
        } catch (error) {
            console.error('Number formatting error:', error);
            return number.toFixed(decimals);
        }
    }

    /**
     * 통화 포맷팅
     * @param {number} amount - 금액
     * @param {string} currency - 통화 코드 (예: 'KRW', 'USD')
     * @param {string} locale - 로케일
     * @returns {string} 포맷된 통화 문자열
     */
    static formatCurrency(amount, currency = 'KRW', locale = 'ko-KR') {
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency
            }).format(amount);
        } catch (error) {
            console.error('Currency formatting error:', error);
            return `${amount.toLocaleString()} ${currency}`;
        }
    }

    /**
     * 퍼센트 포맷팅
     * @param {number} value - 값 (0-1)
     * @param {number} decimals - 소수점 자리수
     * @param {string} locale - 로케일
     * @returns {string} 포맷된 퍼센트 문자열
     */
    static formatPercent(value, decimals = 1, locale = 'ko-KR') {
        try {
            return new Intl.NumberFormat(locale, {
                style: 'percent',
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }).format(value);
        } catch (error) {
            console.error('Percent formatting error:', error);
            return `${(value * 100).toFixed(decimals)}%`;
        }
    }

    /**
     * 반올림
     * @param {number} value - 값
     * @param {number} precision - 정밀도
     * @returns {number} 반올림된 값
     */
    static round(value, precision = 2) {
        const multiplier = Math.pow(10, precision);
        return Math.round(value * multiplier) / multiplier;
    }

    /**
     * 범위 내 난수 생성
     * @param {number} min - 최소값
     * @param {number} max - 최대값
     * @param {boolean} isInteger - 정수 여부
     * @returns {number} 생성된 난수
     */
    static random(min, max, isInteger = true) {
        const value = Math.random() * (max - min) + min;
        return isInteger ? Math.floor(value) : value;
    }

    /**
     * 단위 변환
     * @param {number} value - 값
     * @param {string} fromUnit - 시작 단위
     * @param {string} toUnit - 목표 단위
     * @param {Object} conversionRates - 변환 비율
     * @returns {number} 변환된 값
     */
    static convert(value, fromUnit, toUnit, conversionRates) {
        if (!conversionRates[fromUnit] || !conversionRates[toUnit]) {
            throw new Error('Invalid units for conversion');
        }
        return (value * conversionRates[fromUnit]) / conversionRates[toUnit];
    }

    /**
     * 평균 계산
     * @param {Array<number>} numbers - 숫자 배열
     * @returns {number} 평균값
     */
    static mean(numbers) {
        if (!numbers.length) return 0;
        return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    }

    /**
     * 중앙값 계산
     * @param {Array<number>} numbers - 숫자 배열
     * @returns {number} 중앙값
     */
    static median(numbers) {
        if (!numbers.length) return 0;
        const sorted = [...numbers].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[middle - 1] + sorted[middle]) / 2
            : sorted[middle];
    }

    /**
     * 표준편차 계산
     * @param {Array<number>} numbers - 숫자 배열
     * @returns {number} 표준편차
     */
    static standardDeviation(numbers) {
        if (!numbers.length) return 0;
        const mean = this.mean(numbers);
        const variance = numbers.reduce((sum, num) => {
            return sum + Math.pow(num - mean, 2);
        }, 0) / numbers.length;
        return Math.sqrt(variance);
    }

    /**
     * 복리 계산
     * @param {number} principal - 원금
     * @param {number} rate - 연이율 (%)
     * @param {number} time - 기간 (년)
     * @param {number} frequency - 연간 복리 횟수
     * @returns {number} 최종 금액
     */
    static compound(principal, rate, time, frequency = 1) {
        return principal * Math.pow(1 + (rate / 100) / frequency, frequency * time);
    }
}

export default MathUtils;
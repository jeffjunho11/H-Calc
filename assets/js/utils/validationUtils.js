/**
 * Validation Utility Functions for H-Calculator
 */

class ValidationUtils {
    /**
     * 숫자 검증
     * @param {any} value - 검증할 값
     * @param {Object} options - 검증 옵션
     * @returns {Object} 검증 결과 객체
     */
    static validateNumber(value, options = {}) {
        const {
            min = -Infinity,
            max = Infinity,
            required = true,
            allowDecimal = true,
            maxDecimalPoints = 2
        } = options;

        // 결과 객체 초기화
        const result = {
            isValid: true,
            value: null,
            errors: []
        };

        // 필수값 체크
        if (!value && required) {
            result.isValid = false;
            result.errors.push('REQUIRED_FIELD');
            return result;
        }

        // 빈 값이고 필수가 아닌 경우
        if (!value && !required) {
            return result;
        }

        // 숫자로 변환
        const numValue = Number(value);

        // 유효한 숫자인지 확인
        if (isNaN(numValue)) {
            result.isValid = false;
            result.errors.push('INVALID_NUMBER');
            return result;
        }

        // 소수점 체크
        if (!allowDecimal && !Number.isInteger(numValue)) {
            result.isValid = false;
            result.errors.push('DECIMAL_NOT_ALLOWED');
            return result;
        }

        // 소수점 자릿수 체크
        if (allowDecimal && maxDecimalPoints >= 0) {
            const decimalPoints = (numValue.toString().split('.')[1] || '').length;
            if (decimalPoints > maxDecimalPoints) {
                result.isValid = false;
                result.errors.push('DECIMAL_POINTS_EXCEEDED');
                return result;
            }
        }

        // 최소값 체크
        if (numValue < min) {
            result.isValid = false;
            result.errors.push('BELOW_MINIMUM');
            return result;
        }

        // 최대값 체크
        if (numValue > max) {
            result.isValid = false;
            result.errors.push('ABOVE_MAXIMUM');
            return result;
        }

        // 유효한 경우 값 설정
        result.value = numValue;
        return result;
    }

    /**
     * 날짜 검증
     * @param {string|Date} value - 검증할 날짜
     * @param {Object} options - 검증 옵션
     * @returns {Object} 검증 결과 객체
     */
    static validateDate(value, options = {}) {
        const {
            minDate = null,
            maxDate = null,
            required = true,
            format = 'YYYY-MM-DD'
        } = options;

        const result = {
            isValid: true,
            value: null,
            errors: []
        };

        // 필수값 체크
        if (!value && required) {
            result.isValid = false;
            result.errors.push('REQUIRED_FIELD');
            return result;
        }

        // 빈 값이고 필수가 아닌 경우
        if (!value && !required) {
            return result;
        }

        // Date 객체로 변환
        let dateValue;
        if (value instanceof Date) {
            dateValue = value;
        } else {
            dateValue = new Date(value);
        }

        // 유효한 날짜인지 확인
        if (isNaN(dateValue.getTime())) {
            result.isValid = false;
            result.errors.push('INVALID_DATE');
            return result;
        }

        // 최소 날짜 체크
        if (minDate && dateValue < new Date(minDate)) {
            result.isValid = false;
            result.errors.push('BEFORE_MIN_DATE');
            return result;
        }

        // 최대 날짜 체크
        if (maxDate && dateValue > new Date(maxDate)) {
            result.isValid = false;
            result.errors.push('AFTER_MAX_DATE');
            return result;
        }

        // 유효한 경우 값 설정
        result.value = dateValue;
        return result;
    }

    /**
     * 이메일 검증
     * @param {string} email - 검증할 이메일
     * @param {boolean} required - 필수값 여부
     * @returns {Object} 검증 결과 객체
     */
    static validateEmail(email, required = true) {
        const result = {
            isValid: true,
            value: null,
            errors: []
        };

        // 필수값 체크
        if (!email && required) {
            result.isValid = false;
            result.errors.push('REQUIRED_FIELD');
            return result;
        }

        // 빈 값이고 필수가 아닌 경우
        if (!email && !required) {
            return result;
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            result.isValid = false;
            result.errors.push('INVALID_EMAIL');
            return result;
        }

        result.value = email;
        return result;
    }

    /**
     * 문자열 길이 검증
     * @param {string} value - 검증할 문자열
     * @param {Object} options - 검증 옵션
     * @returns {Object} 검증 결과 객체
     */
    static validateLength(value, options = {}) {
        const {
            min = 0,
            max = Infinity,
            required = true
        } = options;

        const result = {
            isValid: true,
            value: null,
            errors: []
        };

        // 필수값 체크
        if (!value && required) {
            result.isValid = false;
            result.errors.push('REQUIRED_FIELD');
            return result;
        }

        // 빈 값이고 필수가 아닌 경우
        if (!value && !required) {
            return result;
        }

        const length = String(value).length;

        // 최소 길이 체크
        if (length < min) {
            result.isValid = false;
            result.errors.push('TOO_SHORT');
            return result;
        }

        // 최대 길이 체크
        if (length > max) {
            result.isValid = false;
            result.errors.push('TOO_LONG');
            return result;
        }

        result.value = value;
        return result;
    }
}

export default ValidationUtils;
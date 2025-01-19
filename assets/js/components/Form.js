/**
 * Form Component for H-Calculator
 */

class Form {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            validation: true,
            liveValidation: true,
            submitButton: null,
            resetButton: null,
            autoComplete: false,
            focusFirstField: true,
            scrollToError: true,
            customValidators: {},
            onSubmit: null,
            onReset: null,
            onChange: null,
            onError: null,
            onSuccess: null,
            ...options
        };

        this.fields = new Map();
        this.errors = new Map();
        this.isSubmitting = false;

        this.init();
    }

    init() {
        this.setupForm();
        this.setupFields();
        this.bindEvents();
    }

    setupForm() {
        this.element.classList.add('h-form');
        this.element.noValidate = true;

        if (!this.options.autoComplete) {
            this.element.autocomplete = 'off';
        }

        // 제출 버튼 찾기 or 생성
        this.submitButton = this.options.submitButton 
            ? this.element.querySelector(this.options.submitButton)
            : this.element.querySelector('[type="submit"]');

        // 리셋 버튼 찾기 or 생성
        this.resetButton = this.options.resetButton
            ? this.element.querySelector(this.options.resetButton)
            : this.element.querySelector('[type="reset"]');
    }

    setupFields() {
        // 모든 입력 필드 찾기
        const inputs = this.element.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const field = {
                element: input,
                type: input.type || input.tagName.toLowerCase(),
                validators: this.getValidators(input),
                initialValue: this.getFieldValue(input)
            };

            this.fields.set(input.name, field);
        });

        // 첫 번째 필드에 포커스
        if (this.options.focusFirstField) {
            const firstInput = Array.from(inputs)
                .find(input => !input.disabled && !input.readonly);
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    bindEvents() {
        // 폼 제출
        this.element.addEventListener('submit', this.handleSubmit.bind(this));

        // 리셋
        if (this.resetButton) {
            this.resetButton.addEventListener('click', this.handleReset.bind(this));
        }

        // 실시간 유효성 검사
        if (this.options.liveValidation) {
            this.fields.forEach(field => {
                field.element.addEventListener('input', () => {
                    this.validateField(field);
                });

                field.element.addEventListener('blur', () => {
                    this.validateField(field);
                });
            });
        }

        // 변경 이벤트
        this.fields.forEach(field => {
            field.element.addEventListener('change', (e) => {
                if (this.options.onChange) {
                    this.options.onChange(e.target.name, this.getFieldValue(e.target));
                }
            });
        });
    }

    getValidators(input) {
        const validators = [];

        // HTML5 유효성 검사 속성
        if (input.required) {
            validators.push({
                name: 'required',
                message: '이 필드는 필수입니다.',
                validate: value => value !== '' && value != null
            });
        }

        if (input.pattern) {
            validators.push({
                name: 'pattern',
                message: '올바른 형식이 아닙니다.',
                validate: value => new RegExp(input.pattern).test(value)
            });
        }

        if (input.minLength) {
            validators.push({
                name: 'minLength',
                message: `최소 ${input.minLength}자 이상 입력해주세요.`,
                validate: value => value.length >= input.minLength
            });
        }

        if (input.maxLength) {
            validators.push({
                name: 'maxLength',
                message: `최대 ${input.maxLength}자까지 입력 가능합니다.`,
                validate: value => value.length <= input.maxLength
            });
        }

        if (input.min) {
            validators.push({
                name: 'min',
                message: `${input.min} 이상의 값을 입력해주세요.`,
                validate: value => Number(value) >= Number(input.min)
            });
        }

        if (input.max) {
            validators.push({
                name: 'max',
                message: `${input.max} 이하의 값을 입력해주세요.`,
                validate: value => Number(value) <= Number(input.max)
            });
        }

        // 타입별 검증
        switch (input.type) {
            case 'email':
                validators.push({
                    name: 'email',
                    message: '올바른 이메일 형식이 아닙니다.',
                    validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                });
                break;

            case 'url':
                validators.push({
                    name: 'url',
                    message: '올바른 URL 형식이 아닙니다.',
                    validate: value => {
                        try {
                            new URL(value);
                            return true;
                        } catch {
                            return false;
                        }
                    }
                });
                break;

            case 'number':
                validators.push({
                    name: 'number',
                    message: '숫자만 입력 가능합니다.',
                    validate: value => !isNaN(value) && isFinite(value)
                });
                break;
        }

        // 사용자 정의 검증기
        const customValidator = this.options.customValidators[input.name];
        if (customValidator) {
            validators.push(customValidator);
        }

        return validators;
    }

    async validateField(field) {
        const value = this.getFieldValue(field.element);
        const errors = [];

        for (const validator of field.validators) {
            try {
                const isValid = await validator.validate(value);
                if (!isValid) {
                    errors.push(validator.message);
                }
            } catch (error) {
                errors.push(error.message);
            }
        }

        if (errors.length > 0) {
            this.showFieldError(field.element, errors[0]);
            this.errors.set(field.element.name, errors);
        } else {
            this.clearFieldError(field.element);
            this.errors.delete(field.element.name);
        }

        return errors.length === 0;
    }

    showFieldError(element, message) {
        element.classList.add('h-form-error');

        let errorElement = element.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('h-form-error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'h-form-error-message';
            element.parentNode.insertBefore(errorElement, element.nextSibling);
        }
        errorElement.textContent = message;
    }

    clearFieldError(element) {
        element.classList.remove('h-form-error');

        const errorElement = element.nextElementSibling;
        if (errorElement && errorElement.classList.contains('h-form-error-message')) {
            errorElement.remove();
        }
    }

    getFieldValue(field) {
        if (field.type === 'checkbox') {
            return field.checked;
        }
        if (field.type === 'radio') {
            const checkedRadio = this.element
                .querySelector(`input[name="${field.name}"]:checked`);
            return checkedRadio ? checkedRadio.value : '';
        }
        if (field.type === 'file') {
            return field.files;
        }
        return field.value;
    }

    setFieldValue(name, value) {
        const field = this.fields.get(name);
        if (!field) return;

        if (field.type === 'checkbox') {
            field.element.checked = value;
        } else if (field.type === 'radio') {
            const radio = this.element
                .querySelector(`input[name="${name}"][value="${value}"]`);
            if (radio) {
                radio.checked = true;
            }
        } else {
            field.element.value = value;
        }

        if (this.options.liveValidation) {
            this.validateField(field);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (this.isSubmitting) return;
        this.isSubmitting = true;

        try {
            // 유효성 검사
            if (this.options.validation) {
                const validations = Array.from(this.fields.values())
                    .map(field => this.validateField(field));
                const results = await Promise.all(validations);

                if (results.some(result => !result)) {
                    if (this.options.scrollToError) {
                        const firstError = this.element
                            .querySelector('.h-form-error');
                        if (firstError) {
                            firstError.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                    throw new Error('Validation failed');
                }
            }

            // 폼 데이터 수집
            const formData = new FormData(this.element);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            // 제출 처리
            if (this.options.onSubmit) {
                await this.options.onSubmit(data);
            }

            // 성공 이벤트
            if (this.options.onSuccess) {
                this.options.onSuccess(data);
            }

            this.emit('success', data);
        } catch (error) {
            // 에러 이벤트
            if (this.options.onError) {
                this.options.onError(error);
            }

            this.emit('error', error);
        } finally {
            this.isSubmitting = false;
        }
    }

    handleReset() {
        // 필드 초기값으로 리셋
        this.fields.forEach(field => {
            this.setFieldValue(field.element.name, field.initialValue);
            this.clearFieldError(field.element);
        });

        // 에러 초기화
        this.errors.clear();

        // 리셋 이벤트
        if (this.options.onReset) {
            this.options.onReset();
        }

        this.emit('reset');
    }

    emit(eventName, detail = {}) {
        const event = new CustomEvent(`form:${eventName}`, {
            bubbles: true,
            detail: { form: this, ...detail }
        });
        this.element.dispatchEvent(event);
    }

    // 공개 메서드
    getData() {
        const data = {};
        this.fields.forEach((field, name) => {
            data[name] = this.getFieldValue(field.element);
        });
        return data;
    }

    setData(data) {
        Object.entries(data).forEach(([name, value]) => {
            this.setFieldValue(name, value);
        });
    }

    reset() {
        this.handleReset();
    }

    validate() {
        return Promise.all(
            Array.from(this.fields.values())
                .map(field => this.validateField(field))
        ).then(results => results.every(result => result));
    }

    destroy() {
        this.fields.forEach(field => {
            this.clearFieldError(field.element);
        });
        this.element.classList.remove('h-form');
    }
}

export default Form;
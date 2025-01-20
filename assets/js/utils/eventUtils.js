/**
 * Event Utility Functions for H-Calculator
 */

class EventUtils {
    /**
     * 이벤트 등록된 요소들 저장소
     * @private
     */
    static eventListeners = new Map();

    /**
     * 디바운스 함수 생성
     * @param {Function} func - 실행할 함수
     * @param {number} wait - 대기 시간 (ms)
     * @returns {Function} 디바운스된 함수
     */
    static debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 쓰로틀 함수 생성
     * @param {Function} func - 실행할 함수
     * @param {number} limit - 제한 시간 (ms)
     * @returns {Function} 쓰로틀된 함수
     */
    static throttle(func, limit = 300) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    /**
     * 이벤트 리스너 등록
     * @param {Element} element - DOM 요소
     * @param {string} eventType - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     * @param {Object} options - 이벤트 옵션
     */
    static addEvent(element, eventType, handler, options = {}) {
        const {
            debounce = false,
            debounceWait = 300,
            throttle = false,
            throttleLimit = 300,
            ...eventOptions
        } = options;

        let wrappedHandler = handler;

        if (debounce) {
            wrappedHandler = this.debounce(handler, debounceWait);
        } else if (throttle) {
            wrappedHandler = this.throttle(handler, throttleLimit);
        }

        element.addEventListener(eventType, wrappedHandler, eventOptions);

        // 이벤트 리스너 저장
        if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, new Map());
        }
        const elementListeners = this.eventListeners.get(element);
        if (!elementListeners.has(eventType)) {
            elementListeners.set(eventType, new Set());
        }
        elementListeners.get(eventType).add({
            handler: wrappedHandler,
            originalHandler: handler,
            options: eventOptions
        });
    }

    /**
     * 이벤트 리스너 제거
     * @param {Element} element - DOM 요소
     * @param {string} eventType - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러 (선택적)
     */
    static removeEvent(element, eventType, handler = null) {
        if (!this.eventListeners.has(element)) return;

        const elementListeners = this.eventListeners.get(element);
        if (!elementListeners.has(eventType)) return;

        const listeners = elementListeners.get(eventType);
        if (handler) {
            // 특정 핸들러만 제거
            for (const listener of listeners) {
                if (listener.originalHandler === handler) {
                    element.removeEventListener(eventType, listener.handler, listener.options);
                    listeners.delete(listener);
                }
            }
        } else {
            // 해당 이벤트 타입의 모든 핸들러 제거
            for (const listener of listeners) {
                element.removeEventListener(eventType, listener.handler, listener.options);
            }
            elementListeners.delete(eventType);
        }

        // 요소의 모든 이벤트가 제거되었다면 Map에서 제거
        if (elementListeners.size === 0) {
            this.eventListeners.delete(element);
        }
    }

    /**
     * 요소의 모든 이벤트 리스너 제거
     * @param {Element} element - DOM 요소
     */
    static removeAllEvents(element) {
        if (!this.eventListeners.has(element)) return;

        const elementListeners = this.eventListeners.get(element);
        for (const [eventType, listeners] of elementListeners) {
            for (const listener of listeners) {
                element.removeEventListener(eventType, listener.handler, listener.options);
            }
        }

        this.eventListeners.delete(element);
    }

    /**
     * 이벤트 위임
     * @param {Element} container - 컨테이너 요소
     * @param {string} selector - CSS 선택자
     * @param {string} eventType - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     * @param {Object} options - 이벤트 옵션
     */
    static delegate(container, selector, eventType, handler, options = {}) {
        const wrappedHandler = (event) => {
            const target = event.target.closest(selector);
            if (target && container.contains(target)) {
                handler.call(target, event, target);
            }
        };

        this.addEvent(container, eventType, wrappedHandler, options);
    }

    /**
     * 커스텀 이벤트 발생
     * @param {Element} element - DOM 요소
     * @param {string} eventName - 이벤트 이름
     * @param {Object} detail - 이벤트 데이터
     */
    static trigger(element, eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            bubbles: true,
            cancelable: true,
            detail
        });
        element.dispatchEvent(event);
    }

    /**
     * 모바일 터치 이벤트 지원 확인
     * @returns {boolean} 터치 이벤트 지원 여부
     */
    static isTouchSupported() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
}

export default EventUtils;
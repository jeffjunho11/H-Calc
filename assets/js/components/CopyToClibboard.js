/**
 * Copy To Clipboard Component for H-Calculator
 */

class CopyToClipboard {
    constructor(options = {}) {
        this.options = {
            showFeedback: true,
            feedbackDuration: 2000,
            successText: '복사되었습니다',
            errorText: '복사 실패',
            animation: true,
            className: '',
            ...options
        };

        this.init();
    }

    init() {
        // 스타일 생성
        if (!document.getElementById('h-copy-styles')) {
            this.createStyles();
        }
    }

    createStyles() {
        const styles = `
            .h-copy-button {
                position: relative;
                display: inline-flex;
                align-items: center;
                padding: 8px 12px;
                background: var(--h-bg-card);
                border: 1px solid var(--h-border-light);
                border-radius: var(--h-radius-md);
                color: var(--h-text-primary);
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s ease;
            }

            .h-copy-button:hover {
                background: var(--h-primary-light);
                border-color: var(--h-primary);
            }

            .h-copy-button:active {
                transform: scale(0.98);
            }

            .h-copy-icon {
                margin-right: 6px;
            }

            .h-copy-feedback {
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                padding: 4px 8px;
                background: var(--h-bg-card);
                border-radius: var(--h-radius-sm);
                font-size: 12px;
                color: var(--h-text-primary);
                box-shadow: var(--h-shadow-md);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
            }

            .h-copy-feedback.show {
                opacity: 1;
            }

            .h-copy-success {
                color: var(--h-success);
            }

            .h-copy-error {
                color: var(--h-error);
            }

            @keyframes copyPop {
                0% {
                    transform: translateX(-50%) scale(0.9);
                    opacity: 0;
                }
                70% {
                    transform: translateX(-50%) scale(1.1);
                }
                100% {
                    transform: translateX(-50%) scale(1);
                    opacity: 1;
                }
            }

            .h-copy-animated .h-copy-feedback.show {
                animation: copyPop 0.3s ease;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'h-copy-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    async copy(text, element = null) {
        try {
            await navigator.clipboard.writeText(text);
            
            if (this.options.showFeedback) {
                this.showFeedback(true, element);
            }

            return true;
        } catch (error) {
            console.error('Copy failed:', error);
            
            if (this.options.showFeedback) {
                this.showFeedback(false, element);
            }

            return false;
        }
    }

    showFeedback(success, element) {
        let feedbackElement = document.createElement('div');
        feedbackElement.className = `h-copy-feedback ${success ? 'h-copy-success' : 'h-copy-error'}`;
        feedbackElement.textContent = success ? this.options.successText : this.options.errorText;

        if (this.options.animation) {
            feedbackElement.classList.add('h-copy-animated');
        }

        if (element) {
            element.style.position = 'relative';
            element.appendChild(feedbackElement);
        } else {
            document.body.appendChild(feedbackElement);
            const rect = feedbackElement.getBoundingClientRect();
            feedbackElement.style.position = 'fixed';
            feedbackElement.style.top = '20px';
            feedbackElement.style.left = '50%';
            feedbackElement.style.transform = 'translateX(-50%)';
        }

        setTimeout(() => {
            feedbackElement.classList.add('show');
        }, 0);

        setTimeout(() => {
            feedbackElement.classList.remove('show');
            setTimeout(() => {
                feedbackElement.remove();
            }, 200);
        }, this.options.feedbackDuration);
    }

    createButton(text, options = {}) {
        const button = document.createElement('button');
        button.className = `h-copy-button ${this.options.className} ${options.className || ''}`;
        
        button.innerHTML = `
            <svg class="h-copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>${options.buttonText || '복사'}</span>
        `;

        button.addEventListener('click', async () => {
            await this.copy(text, button);
            if (typeof options.onCopy === 'function') {
                options.onCopy(text);
            }
        });

        return button;
    }

    // 텍스트 영역에 복사 버튼 추가
    addCopyButton(element, options = {}) {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';

        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);

        const button = this.createButton(element.value || element.textContent, options);
        button.style.position = 'absolute';
        button.style.right = '8px';
        button.style.top = '50%';
        button.style.transform = 'translateY(-50%)';

        wrapper.appendChild(button);
        return button;
    }

    destroy() {
        const styleSheet = document.getElementById('h-copy-styles');
        if (styleSheet) {
            styleSheet.remove();
        }
    }
}

export default CopyToClipboard;
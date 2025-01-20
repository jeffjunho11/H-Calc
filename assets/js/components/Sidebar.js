
// assets/js/components/Sidebar.js

class Sidebar {
    constructor() {
        // 사이드바 템플릿 생성 및 삽입
        this.createSidebar();
        // 이벤트 리스너 설정
        this.setupEventListeners();
    }

    createSidebar() {
        const sidebarTemplate = `
            <!-- 사이드바 토글 버튼 -->
            <input type="checkbox" id="menu-toggle" class="hidden">
            <label for="menu-toggle" class="menu-toggle-btn">
                <span class="hamburger"></span>
            </label>

            <!-- 사이드바 -->
            <nav class="sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-title">
                        <a href="/" class="home-link">H-Calculator</a>
                    </div>
                    <div class="sidebar-subtitle">당신의 모든 계산을 도와드립니다</div>
                </div>

                <div class="menu-container">
                    <!-- 생활 계산기 -->
                    <div class="menu-category">생활</div>
                    <ul class="menu-items">
                        <li class="menu-item">
                            <a href="/pages/life/unit.html">
                                <span class="menu-icon">📏</span>
                                <span>단위 변환기</span>
                            </a>
                        </li>
                        <li class="menu-item">
                            <a href="/pages/life/percent.html">
                                <span class="menu-icon">💯</span>
                                <span>퍼센트 계산기</span>
                            </a>
                        </li>
                        <li class="menu-item">
                            <a href="/pages/life/age.html">
                                <span class="menu-icon">👶</span>
                                <span>만 나이 계산기</span>
                            </a>
                        </li>
                        <li class="menu-item">
                            <a href="/pages/life/date.html">
                                <span class="menu-icon">📅</span>
                                <span>날짜 계산기</span>
                            </a>
                        </li>
                        <li class="menu-item">
                            <a href="/pages/life/ovul.html">
                                <span class="menu-icon">🌸</span>
                                <span>배란일 계산기</span>
                            </a>
                        </li>
                        <li class="menu-item">
                            <a href="/pages/life/business.html">
                                <span class="menu-icon">💼</span>
                                <span>영업일 계산기</span>
                            </a>
                        </li>
                    </ul>

                    <!-- 건강 계산기 -->
                    <div class="menu-category">건강</div>
                    <ul class="menu-items">
                        <li class="menu-item">
                            <a href="/pages/health/bmi.html">
                                <span class="menu-icon">⚖️</span>
                                <span>BMI 계산기</span>
                            </a>
                        </li>
                        <li class="menu-item">
                            <a href="/pages/health/kcal.html">
                                <span class="menu-icon">🍎</span>
                                <span>칼로리 계산기</span>
                            </a>
                        </li>
                    </ul>

                    <!-- 금융 계산기 -->
                    <div class="menu-category">금융</div>
                    <ul class="menu-items">
                        <li class="menu-item">
                            <a href="/pages/finance/finance.html">
                                <span class="menu-icon">💰</span>
                                <span>금융 계산기</span>
                            </a>
                        </li>
                        <li class="menu-item">
                            <a href="/pages/finance/retire.html">
                                <span class="menu-icon">💵</span>
                                <span>퇴직금 계산기</span>
                            </a>
                        </li>
                        <!-- 다른 금융 계산기들 -->
                    </ul>

                    <!-- 수학 계산기 -->
                    <div class="menu-category">수학</div>
                    <ul class="menu-items">
                        <li class="menu-item">
                            <a href="/pages/math/Scientific_Calc.html">
                                <span class="menu-icon">🔢</span>
                                <span>공학용 계산기</span>
                            </a>
                        </li>
                        <li class="menu-item">
                            <a href="/pages/math/statistics.html">
                                <span class="menu-icon">📊</span>
                                <span>통계 계산기</span>
                            </a>
                        </li>
                        <li class="menu-item">
                            <a href="/pages/math/matrix.html">
                                <span class="menu-icon">🔲</span>
                                <span>행렬 계산기</span>
                            </a>
                        </li>
                    </ul>

                    <!-- 기타 계산기 -->
                    <div class="menu-category">기타</div>
                    <ul class="menu-items">
                        <li class="menu-item">
                            <a href="/pages/etc/gpa.html">
                                <span class="menu-icon">🎓</span>
                                <span>학점 변환기</span>
                            </a>
                        </li>
                        <li class="menu-item">
                            <a href="/pages/etc/rand.html">
                                <span class="menu-icon">🎲</span>
                                <span>난수 생성기</span>
                            </a>
                        </li>
                        <li class="menu-item">
                            <a href="/pages/etc/discharge.html">
                                <span class="menu-icon">🪖</span>
                                <span>전역일 계산기</span>
                            </a>
                        </li>
                        <li class="menu-item">
                            <a href="/pages/etc/rand_name.html">
                                <span class="menu-icon">👤</span>
                                <span>랜덤이름 생성기</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>

            <!-- 오버레이 -->
            <div class="overlay"></div>
        `;

        // 사이드바를 body의 첫 번째 자식으로 삽입
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sidebarTemplate;
        while (tempDiv.firstChild) {
            document.body.insertBefore(tempDiv.firstChild, document.body.firstChild);
        }

        // 스타일 추가
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .sidebar-title .home-link {
                color: inherit;
                text-decoration: none;
                cursor: pointer;
                transition: color 0.3s ease;
            }
            .sidebar-title .home-link:hover {
                color: #007bff; /* 호버 시 색상 변경 (필요에 따라 조정) */
                text-decoration: none;
            }
        `;
        document.head.appendChild(styleElement);
    }

    setupEventListeners() {
        // 모바일에서 메뉴 선택 시 사이드바 닫기
        document.querySelectorAll('.menu-item a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1024) {
                    document.getElementById('menu-toggle').checked = false;
                }
            });
        });

        // 오버레이 클릭 시 사이드바 닫기
        document.querySelector('.overlay').addEventListener('click', () => {
            document.getElementById('menu-toggle').checked = false;
        });

        // 화면 크기 변경 시 메뉴 상태 초기화
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                document.getElementById('menu-toggle').checked = false;
            }
        });

        // 현재 페이지에 해당하는 메뉴 항목 활성화
        this.highlightCurrentPage();
    }

    highlightCurrentPage() {
        const currentPath = window.location.pathname;
        document.querySelectorAll('.menu-item a').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }
}

const sidebar = new Sidebar();
export default sidebar;

// 특별실 예약 시스템 - 정적 HTML 버전
// Google Sheets API 연동

// 설정
const CONFIG = {
    API_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL', // 실제 배포 시 교체
    PERIODS: ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시']
};

// 전역 상태
const state = {
    rooms: [],
    classes: [],
    reservations: [],
    currentPage: 'dashboard',
    isLoading: false
};

// 앱 초기화
document.addEventListener('DOMContentLoaded', async function() {
    await initializeApp();
});

async function initializeApp() {
    try {
        setLoading(true);
        
        // 아이콘 초기화
        lucide.createIcons();
        
        // 데이터 로드
        await loadAllData();
        
        // UI 설정
        setupUI();
        
        // 기본 페이지 표시
        showPage('dashboard');
        
        console.log('앱이 성공적으로 초기화되었습니다.');
    } catch (error) {
        console.error('앱 초기화 실패:', error);
        showMessage('앱을 초기화하는 중 오류가 발생했습니다.', 'error');
    } finally {
        setLoading(false);
    }
}

// 모든 데이터 로드
async function loadAllData() {
    try {
        // 실제 API가 설정되지 않은 경우 테스트 데이터 사용
        if (CONFIG.API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
            console.log('테스트 데이터를 사용합니다.');
            loadTestData();
            return;
        }
        
        // 실제 API 호출
        state.rooms = await callAPI('getRooms');
        state.classes = await callAPI('getClasses');
        state.reservations = await callAPI('getReservations');
        
        console.log('데이터 로드 완료:', {
            rooms: state.rooms.length,
            classes: state.classes.length,
            reservations: state.reservations.length
        });
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        // 오류 시 테스트 데이터 사용
        loadTestData();
    }
}

// 테스트 데이터 로드
function loadTestData() {
    state.rooms = [
        {id: 1, name: '강당', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
        {id: 2, name: '운동장', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
        {id: 3, name: '풋살장', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
        {id: 4, name: '놀이활동실1', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
        {id: 5, name: '놀이활동실2', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
        {id: 6, name: '표현무용실', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
        {id: 7, name: '야외정원(4층)', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
        {id: 8, name: '시청각실1', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
        {id: 9, name: '시청각실2', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
        {id: 10, name: '제 1 컴퓨터실', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
        {id: 11, name: '제 2 컴퓨터실', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'}
    ];
    
    state.classes = [
        {id: 1, name: '1학년 1반', grade: 1, classNumber: 1, createdAt: '2024-01-01T09:00:00.000Z'},
        {id: 2, name: '1학년 2반', grade: 1, classNumber: 2, createdAt: '2024-01-01T09:00:00.000Z'},
        {id: 3, name: '2학년 1반', grade: 2, classNumber: 1, createdAt: '2024-01-01T09:00:00.000Z'},
        {id: 4, name: '2학년 2반', grade: 2, classNumber: 2, createdAt: '2024-01-01T09:00:00.000Z'},
        {id: 5, name: '3학년 1반', grade: 3, classNumber: 1, createdAt: '2024-01-01T09:00:00.000Z'},
        {id: 6, name: '유치원', grade: 0, classNumber: 1, createdAt: '2024-01-01T09:00:00.000Z'}
    ];
    
    state.reservations = [
        {
            id: 1,
            roomId: 1,
            classId: 1,
            date: new Date().toISOString().split('T')[0],
            periods: ['1교시', '2교시'],
            purpose: '체육 수업',
            notes: '농구 수업',
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            roomId: 8,
            classId: 3,
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            periods: ['3교시'],
            purpose: '영상 시청',
            notes: '',
            createdAt: new Date().toISOString()
        }
    ];
}

// API 호출
async function callAPI(action, data = null) {
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                data: data
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        return result;
    } catch (error) {
        console.error(`API 호출 실패 (${action}):`, error);
        throw error;
    }
}

// UI 설정
function setupUI() {
    setupModalForm();
    setupFilters();
    populateSelects();
    setupEventListeners();
}

// 모달 폼 설정
function setupModalForm() {
    const form = document.getElementById('reservationForm');
    if (form) {
        form.addEventListener('submit', handleReservationSubmit);
    }
    
    // 교시 체크박스 생성
    const periodsGrid = document.getElementById('modalPeriodsGrid');
    if (periodsGrid) {
        periodsGrid.innerHTML = '';
        CONFIG.PERIODS.forEach(period => {
            const label = document.createElement('label');
            label.className = 'flex items-center space-x-2 cursor-pointer';
            label.innerHTML = `
                <input type="checkbox" value="${period}" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <span class="text-sm">${period}</span>
            `;
            periodsGrid.appendChild(label);
        });
    }
    
    // 오늘 날짜를 기본값으로 설정
    const dateInput = document.getElementById('modalDateInput');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
}

// 필터 설정
function setupFilters() {
    const dateFilter = document.getElementById('filterDate');
    const roomFilter = document.getElementById('filterRoom');
    
    if (dateFilter) {
        dateFilter.addEventListener('change', updateReservationsList);
    }
    
    if (roomFilter) {
        roomFilter.addEventListener('change', updateReservationsList);
    }
}

// 드롭다운 채우기
function populateSelects() {
    // 특별실 선택
    const roomSelects = ['modalRoomSelect', 'filterRoom'];
    roomSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            // 기존 옵션 유지하고 새 옵션 추가
            const existingOptions = select.innerHTML;
            state.rooms.forEach(room => {
                const option = document.createElement('option');
                option.value = room.id;
                option.textContent = room.name;
                select.appendChild(option);
            });
        }
    });
    
    // 학급 선택
    const classSelect = document.getElementById('modalClassSelect');
    if (classSelect) {
        state.classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            classSelect.appendChild(option);
        });
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 모달 외부 클릭 시 닫기
    const modal = document.getElementById('reservationModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeReservationModal();
            }
        });
    }
}

// 페이지 표시
function showPage(page) {
    // 모든 페이지 숨기기
    document.querySelectorAll('.page').forEach(p => {
        p.classList.add('hidden');
    });
    
    // 선택된 페이지 표시
    const targetPage = document.getElementById(`${page}-page`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    
    // 네비게이션 상태 업데이트
    updateNavigation(page);
    
    // 페이지 제목 업데이트
    updatePageTitle(page);
    
    // 현재 페이지 저장
    state.currentPage = page;
    
    // 페이지별 데이터 업데이트
    switch(page) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'weekly':
            updateWeeklyView();
            break;
        case 'reservations':
            updateReservationsList();
            break;
        case 'rooms':
            updateRoomsList();
            break;
        case 'statistics':
            updateStatistics();
            break;
    }
    
    // 아이콘 다시 렌더링
    lucide.createIcons();
}

// 네비게이션 상태 업데이트
function updateNavigation(activePage) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('bg-blue-100', 'text-blue-700');
        item.classList.add('text-gray-700');
    });
    
    // 활성 네비게이션 아이템 찾아서 스타일 적용
    const activeButton = document.querySelector(`[onclick="showPage('${activePage}')"]`);
    if (activeButton) {
        activeButton.classList.add('bg-blue-100', 'text-blue-700');
        activeButton.classList.remove('text-gray-700');
    }
}

// 페이지 제목 업데이트
function updatePageTitle(page) {
    const titles = {
        dashboard: '대시보드',
        weekly: '주간 현황',
        reservations: '예약 목록',
        rooms: '특별실 관리',
        statistics: '통계'
    };
    
    const titleElement = document.getElementById('pageTitle');
    if (titleElement) {
        titleElement.textContent = titles[page] || '대시보드';
    }
}

// 대시보드 업데이트
function updateDashboard() {
    // 통계 계산
    const today = new Date().toISOString().split('T')[0];
    const startOfWeek = getStartOfWeek();
    const endOfWeek = getEndOfWeek();
    
    const todayReservations = state.reservations.filter(r => r.date === today).length;
    const weekReservations = state.reservations.filter(r => 
        r.date >= startOfWeek && r.date <= endOfWeek
    ).length;
    
    // 통계 표시
    updateElement('totalRooms', state.rooms.length);
    updateElement('todayReservations', todayReservations);
    updateElement('weekReservations', weekReservations);
    updateElement('totalClasses', state.classes.length);
    
    // 최근 예약 목록 업데이트
    updateRecentReservations();
}

// 최근 예약 업데이트
function updateRecentReservations() {
    const container = document.getElementById('recentReservations');
    if (!container) return;
    
    const recent = state.reservations
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">최근 예약이 없습니다.</p>';
        return;
    }
    
    container.innerHTML = recent.map(reservation => {
        const room = state.rooms.find(r => r.id == reservation.roomId);
        const cls = state.classes.find(c => c.id == reservation.classId);
        const periods = Array.isArray(reservation.periods) ? reservation.periods.join(', ') : reservation.periods;
        
        return `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                    <p class="font-medium text-gray-900">${room?.name || '알 수 없는 특별실'}</p>
                    <p class="text-sm text-gray-600">${cls?.name || '알 수 없는 학급'} • ${formatDate(reservation.date)} • ${periods}</p>
                </div>
                <button onclick="editReservation(${reservation.id})" class="text-blue-600 hover:text-blue-800">
                    <i data-lucide="edit" class="w-4 h-4"></i>
                </button>
            </div>
        `;
    }).join('');
}

// 주간 현황 업데이트
function updateWeeklyView() {
    const container = document.getElementById('weeklyCalendar');
    if (!container) return;
    
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    
    let html = '<div class="grid grid-cols-7 gap-2">';
    
    // 요일 헤더
    days.forEach(day => {
        html += `<div class="text-center font-medium text-gray-600 p-2 border-b">${day}</div>`;
    });
    
    // 각 날짜별 예약 현황
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayReservations = state.reservations.filter(r => r.date === dateStr);
        
        html += `
            <div class="border border-gray-200 rounded-lg p-2 min-h-[120px]">
                <div class="text-sm font-medium text-gray-900 mb-2">${date.getDate()}일</div>
                <div class="space-y-1">
        `;
        
        dayReservations.slice(0, 3).forEach(reservation => {
            const room = state.rooms.find(r => r.id == reservation.roomId);
            html += `
                <div class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate" title="${room?.name || '알 수 없음'}">
                    ${room?.name || '알 수 없음'}
                </div>
            `;
        });
        
        if (dayReservations.length > 3) {
            html += `<div class="text-xs text-gray-500">+${dayReservations.length - 3}개 더</div>`;
        }
        
        html += '</div></div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// 예약 목록 업데이트
function updateReservationsList() {
    const container = document.getElementById('reservationsList');
    if (!container) return;
    
    let filtered = [...state.reservations];
    
    // 날짜 필터 적용
    const dateFilter = document.getElementById('filterDate')?.value;
    if (dateFilter) {
        filtered = filtered.filter(r => r.date === dateFilter);
    }
    
    // 특별실 필터 적용
    const roomFilter = document.getElementById('filterRoom')?.value;
    if (roomFilter) {
        filtered = filtered.filter(r => r.roomId == roomFilter);
    }
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">조건에 맞는 예약이 없습니다.</p>';
        return;
    }
    
    container.innerHTML = filtered
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(reservation => {
            const room = state.rooms.find(r => r.id == reservation.roomId);
            const cls = state.classes.find(c => c.id == reservation.classId);
            const periods = Array.isArray(reservation.periods) ? reservation.periods.join(', ') : reservation.periods;
            
            return `
                <div class="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <p class="font-medium text-gray-900">${room?.name || '알 수 없는 특별실'}</p>
                            <p class="text-sm text-gray-600">${cls?.name || '알 수 없는 학급'}</p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">${formatDate(reservation.date)}</p>
                            <p class="text-sm text-gray-600">${periods}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">${reservation.purpose || '특별실 이용'}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500">${reservation.notes || '-'}</p>
                        </div>
                    </div>
                    <div class="flex space-x-2 ml-4">
                        <button onclick="editReservation(${reservation.id})" class="text-blue-600 hover:text-blue-800" title="수정">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                        </button>
                        <button onclick="deleteReservation(${reservation.id})" class="text-red-600 hover:text-red-800" title="삭제">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
}

// 특별실 목록 업데이트
function updateRoomsList() {
    const container = document.getElementById('roomsList');
    if (!container) return;
    
    container.innerHTML = state.rooms.map(room => {
        const reservationCount = state.reservations.filter(r => r.roomId == room.id).length;
        
        return `
            <div class="card p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-medium text-gray-900">${room.name}</h4>
                    <span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        ${room.isActive ? '활성' : '비활성'}
                    </span>
                </div>
                <div class="space-y-2">
                    <p class="text-sm text-gray-600">총 예약: <span class="font-medium">${reservationCount}건</span></p>
                    <div class="flex space-x-2">
                        <button 
                            onclick="viewRoomSchedule(${room.id})" 
                            class="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                            일정 보기
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 통계 업데이트
function updateStatistics() {
    updateRoomUsageChart();
    updateClassUsageChart();
}

function updateRoomUsageChart() {
    const container = document.getElementById('roomUsageChart');
    if (!container) return;
    
    const usage = state.rooms.map(room => ({
        name: room.name,
        count: state.reservations.filter(r => r.roomId == room.id).length
    })).sort((a, b) => b.count - a.count);
    
    container.innerHTML = createBarChart(usage, '예약 없음');
}

function updateClassUsageChart() {
    const container = document.getElementById('classUsageChart');
    if (!container) return;
    
    const usage = state.classes.map(cls => ({
        name: cls.name,
        count: state.reservations.filter(r => r.classId == cls.id).length
    })).sort((a, b) => b.count - a.count).slice(0, 10);
    
    container.innerHTML = createBarChart(usage, '예약 없음');
}

function createBarChart(data, emptyMessage) {
    if (data.length === 0 || data.every(d => d.count === 0)) {
        return `<p class="text-gray-500 text-center py-8">${emptyMessage}</p>`;
    }
    
    const max = Math.max(...data.map(d => d.count));
    
    return `
        <div class="space-y-3">
            ${data.filter(d => d.count > 0).map(item => `
                <div class="flex items-center space-x-3">
                    <div class="w-24 text-sm text-gray-600 truncate" title="${item.name}">${item.name}</div>
                    <div class="flex-1 bg-gray-200 rounded-full h-6 min-w-[100px]">
                        <div 
                            class="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2" 
                            style="width: ${(item.count / max) * 100}%"
                        >
                            <span class="text-xs text-white font-medium">${item.count}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 예약 모달 관련 함수
function openReservationModal() {
    const modal = document.getElementById('reservationModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeReservationModal() {
    const modal = document.getElementById('reservationModal');
    if (modal) {
        modal.classList.remove('show');
    }
    
    // 폼 리셋
    const form = document.getElementById('reservationForm');
    if (form) {
        form.reset();
        // 체크박스들도 수동으로 해제
        document.querySelectorAll('#modalPeriodsGrid input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
    }
}

// 예약 폼 제출 처리
async function handleReservationSubmit(e) {
    e.preventDefault();
    
    try {
        setLoading(true);
        
        // 폼 데이터 수집
        const formData = {
            roomId: parseInt(document.getElementById('modalRoomSelect').value),
            classId: parseInt(document.getElementById('modalClassSelect').value),
            date: document.getElementById('modalDateInput').value,
            periods: Array.from(document.querySelectorAll('#modalPeriodsGrid input:checked')).map(cb => cb.value),
            purpose: document.getElementById('modalPurposeInput').value || '특별실 이용',
            notes: document.getElementById('modalNotesInput').value || ''
        };
        
        // 유효성 검사
        if (!formData.roomId || !formData.classId || !formData.date) {
            throw new Error('필수 항목을 모두 입력해주세요.');
        }
        
        if (formData.periods.length === 0) {
            throw new Error('교시를 하나 이상 선택해주세요.');
        }
        
        // API 호출 또는 로컬 데이터 추가
        if (CONFIG.API_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
            await callAPI('createReservation', formData);
            await loadAllData();
        } else {
            // 테스트 환경에서는 로컬 데이터에 추가
            const newReservation = {
                id: Math.max(...state.reservations.map(r => r.id), 0) + 1,
                ...formData,
                createdAt: new Date().toISOString()
            };
            state.reservations.push(newReservation);
        }
        
        closeReservationModal();
        showPage(state.currentPage); // 현재 페이지 새로고침
        showMessage('예약이 성공적으로 생성되었습니다.', 'success');
        
    } catch (error) {
        console.error('예약 생성 오류:', error);
        showMessage('예약 생성 중 오류가 발생했습니다: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// 예약 삭제
async function deleteReservation(id) {
    if (!confirm('정말로 이 예약을 삭제하시겠습니까?')) return;
    
    try {
        setLoading(true);
        
        if (CONFIG.API_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
            await callAPI('deleteReservation', { id });
            await loadAllData();
        } else {
            // 테스트 환경에서는 로컬에서 제거
            state.reservations = state.reservations.filter(r => r.id !== id);
        }
        
        showPage(state.currentPage);
        showMessage('예약이 삭제되었습니다.', 'success');
        
    } catch (error) {
        console.error('예약 삭제 오류:', error);
        showMessage('예약 삭제 중 오류가 발생했습니다: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// 유틸리티 함수들
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });
}

function getStartOfWeek() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    return new Date(today.setDate(diff)).toISOString().split('T')[0];
}

function getEndOfWeek() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + 6;
    return new Date(today.setDate(diff)).toISOString().split('T')[0];
}

function setLoading(show) {
    const loading = document.getElementById('globalLoading');
    if (loading) {
        if (show) {
            loading.classList.add('show');
        } else {
            loading.classList.remove('show');
        }
    }
    state.isLoading = show;
}

function showMessage(message, type = 'info') {
    const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    alert(`${emoji} ${message}`);
}

// 미구현 기능들
function editReservation(id) {
    showMessage('예약 수정 기능은 추후 구현 예정입니다.', 'info');
}

function viewRoomSchedule(roomId) {
    const room = state.rooms.find(r => r.id == roomId);
    showMessage(`${room?.name || '특별실'} 상세 일정 보기 기능은 추후 구현 예정입니다.`, 'info');
}

// 개발자 도구 (콘솔에서 사용 가능)
window.specialRoomSystem = {
    setApiUrl: (url) => {
        CONFIG.API_URL = url;
        console.log('API URL이 설정되었습니다:', url);
    },
    getState: () => state,
    loadData: loadAllData,
    showTestData: () => {
        console.log('현재 데이터:', {
            rooms: state.rooms.length,
            classes: state.classes.length,
            reservations: state.reservations.length
        });
    }
};

console.log('특별실 예약 시스템이 로드되었습니다.');
console.log('개발자 도구: window.specialRoomSystem'); 
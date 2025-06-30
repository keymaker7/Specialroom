// 특별실 예약 시스템 - 정적 HTML 버전

// 테스트 데이터
const testData = {
    rooms: [
        {id: 1, name: '강당', isActive: true},
        {id: 2, name: '운동장', isActive: true},
        {id: 3, name: '풋살장', isActive: true},
        {id: 4, name: '놀이활동실1', isActive: true},
        {id: 5, name: '놀이활동실2', isActive: true},
        {id: 6, name: '표현무용실', isActive: true},
        {id: 7, name: '야외정원(4층)', isActive: true},
        {id: 8, name: '시청각실1', isActive: true},
        {id: 9, name: '시청각실2', isActive: true},
        {id: 10, name: '제1컴퓨터실', isActive: true},
        {id: 11, name: '제2컴퓨터실', isActive: true}
    ],
    classes: [
        {id: 1, name: '1학년 1반', grade: 1, classNumber: 1},
        {id: 2, name: '1학년 2반', grade: 1, classNumber: 2},
        {id: 3, name: '1학년 3반', grade: 1, classNumber: 3},
        {id: 4, name: '1학년 4반', grade: 1, classNumber: 4},
        {id: 5, name: '1학년 5반', grade: 1, classNumber: 5},
        {id: 6, name: '1학년 6반', grade: 1, classNumber: 6},
        {id: 7, name: '2학년 1반', grade: 2, classNumber: 1},
        {id: 8, name: '2학년 2반', grade: 2, classNumber: 2},
        {id: 9, name: '2학년 3반', grade: 2, classNumber: 3},
        {id: 10, name: '2학년 4반', grade: 2, classNumber: 4},
        {id: 11, name: '2학년 5반', grade: 2, classNumber: 5},
        {id: 12, name: '2학년 6반', grade: 2, classNumber: 6},
        {id: 13, name: '2학년 7반', grade: 2, classNumber: 7},
        {id: 14, name: '2학년 8반', grade: 2, classNumber: 8},
        {id: 15, name: '유치원', grade: 0, classNumber: 1},
        {id: 16, name: '복합특수', grade: 0, classNumber: 2}
    ],
    reservations: [
        {
            id: 1,
            roomId: 1,
            classId: 1,
            date: new Date().toISOString().split('T')[0],
            periods: ['1교시', '2교시'],
            purpose: '체육 수업',
            notes: '농구 수업'
        },
        {
            id: 2,
            roomId: 8,
            classId: 7,
            date: getTomorrow(),
            periods: ['3교시'],
            purpose: '영상 시청',
            notes: ''
        }
    ]
};

const periods = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시'];
let currentPage = 'dashboard';

// 유틸리티 함수
function getTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 특별실 예약 시스템 시작');
    
    // 아이콘 초기화
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // UI 설정
    setupModal();
    populateSelects();
    updateDashboard();
    
    console.log('✅ 초기화 완료');
});

// 페이지 전환
function showPage(page) {
    currentPage = page;
    
    // 모든 페이지 숨기기
    document.querySelectorAll('.page').forEach(p => {
        p.classList.add('hidden');
    });
    
    // 선택된 페이지 보이기
    const targetPage = document.getElementById(page + '-page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    
    // 네비게이션 업데이트
    updateNavigation(page);
    updatePageTitle(page);
    
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
    
    // 아이콘 다시 생성
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function updateNavigation(activePage) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeButton = document.querySelector(`[onclick="showPage('${activePage}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

function updatePageTitle(page) {
    const titles = {
        'dashboard': '대시보드',
        'weekly': '주간 현황',
        'reservations': '예약 목록',
        'rooms': '특별실 관리',
        'statistics': '통계'
    };
    
    const titleElement = document.getElementById('pageTitle');
    if (titleElement) {
        titleElement.textContent = titles[page] || '대시보드';
    }
}

// 대시보드 업데이트
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const startOfWeek = getStartOfWeek();
    const endOfWeek = getEndOfWeek();
    
    const todayReservations = testData.reservations.filter(r => r.date === today).length;
    const weekReservations = testData.reservations.filter(r => r.date >= startOfWeek && r.date <= endOfWeek).length;
    
    // 통계 업데이트
    updateElement('totalRooms', testData.rooms.length);
    updateElement('todayReservations', todayReservations);
    updateElement('weekReservations', weekReservations);
    updateElement('totalClasses', testData.classes.length);
}

function getStartOfWeek() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(today.setDate(diff)).toISOString().split('T')[0];
}

function getEndOfWeek() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? 0 : 7); // Sunday
    return new Date(today.setDate(diff)).toISOString().split('T')[0];
}

// 주간 현황 업데이트
function updateWeeklyView() {
    const tableBody = document.getElementById('weeklyTableBody');
    if (!tableBody) return;
    
    let html = '';
    periods.forEach(period => {
        html += `<tr>
            <td class="border border-gray-200 p-2 font-medium">${period}</td>
            <td class="border border-gray-200 p-2 text-center">-</td>
            <td class="border border-gray-200 p-2 text-center">-</td>
            <td class="border border-gray-200 p-2 text-center">-</td>
            <td class="border border-gray-200 p-2 text-center">-</td>
            <td class="border border-gray-200 p-2 text-center">-</td>
        </tr>`;
    });
    tableBody.innerHTML = html;
}

// 예약 목록 업데이트
function updateReservationsList() {
    const container = document.getElementById('reservationsList');
    if (!container) return;
    
    let html = '';
    testData.reservations.forEach(reservation => {
        const room = testData.rooms.find(r => r.id === reservation.roomId);
        const className = testData.classes.find(c => c.id === reservation.classId);
        
        html += `
            <div class="card p-4">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <h4 class="font-medium text-gray-900">${room?.name || '특별실'}</h4>
                            <span class="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">${className?.name || '학급'}</span>
                        </div>
                        <p class="text-sm text-gray-600 mb-1">${formatDate(reservation.date)}</p>
                        <p class="text-sm text-gray-600 mb-1">${reservation.periods.join(', ')}</p>
                        <p class="text-sm text-gray-800">${reservation.purpose}</p>
                        ${reservation.notes ? `<p class="text-sm text-gray-500 mt-1">${reservation.notes}</p>` : ''}
                    </div>
                    <button onclick="deleteReservation(${reservation.id})" class="text-red-500 hover:text-red-700 ml-4">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p class="text-gray-500 text-center py-8">예약이 없습니다.</p>';
}

// 특별실 목록 업데이트
function updateRoomsList() {
    const container = document.getElementById('roomsList');
    if (!container) return;
    
    let html = '';
    testData.rooms.forEach(room => {
        const reservationCount = testData.reservations.filter(r => r.roomId === room.id).length;
        
        html += `
            <div class="card p-4">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-medium text-gray-900">${room.name}</h4>
                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                </div>
                <div class="text-sm text-gray-600 mb-3">
                    <p>총 예약: ${reservationCount}건</p>
                </div>
                <button onclick="viewRoomSchedule(${room.id})" class="btn-secondary text-sm w-full">
                    일정 보기
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 통계 업데이트
function updateStatistics() {
    updateRoomUsageChart();
    updateClassUsageChart();
}

function updateRoomUsageChart() {
    const container = document.getElementById('roomUsageChart');
    if (!container) return;
    
    const roomStats = testData.rooms.map(room => ({
        name: room.name,
        count: testData.reservations.filter(r => r.roomId === room.id).length
    }));
    
    const maxCount = Math.max(...roomStats.map(s => s.count), 1);
    
    let html = '<div class="space-y-2">';
    roomStats.forEach(stat => {
        const percentage = (stat.count / maxCount) * 100;
        html += `
            <div class="flex items-center space-x-3">
                <div class="w-20 text-sm text-gray-600 truncate">${stat.name}</div>
                <div class="flex-1 bg-gray-200 rounded-full h-4">
                    <div class="bg-blue-600 h-4 rounded-full flex items-center justify-end pr-2" style="width: ${percentage}%">
                        <span class="text-xs text-white font-medium">${stat.count}</span>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function updateClassUsageChart() {
    const container = document.getElementById('classUsageChart');
    if (!container) return;
    
    const classStats = testData.classes.slice(0, 10).map(cls => ({
        name: cls.name,
        count: testData.reservations.filter(r => r.classId === cls.id).length
    }));
    
    const maxCount = Math.max(...classStats.map(s => s.count), 1);
    
    let html = '<div class="space-y-2">';
    classStats.forEach(stat => {
        const percentage = (stat.count / maxCount) * 100;
        html += `
            <div class="flex items-center space-x-3">
                <div class="w-20 text-sm text-gray-600 truncate">${stat.name}</div>
                <div class="flex-1 bg-gray-200 rounded-full h-4">
                    <div class="bg-green-600 h-4 rounded-full flex items-center justify-end pr-2" style="width: ${percentage}%">
                        <span class="text-xs text-white font-medium">${stat.count}</span>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// 모달 관련
function setupModal() {
    // 교시 체크박스 생성
    const periodsGrid = document.getElementById('modalPeriodsGrid');
    if (periodsGrid) {
        let html = '';
        periods.forEach(period => {
            html += `
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" value="${period}" class="rounded border-gray-300 text-blue-600">
                    <span class="text-sm">${period}</span>
                </label>
            `;
        });
        periodsGrid.innerHTML = html;
    }
    
    // 오늘 날짜 설정
    const dateInput = document.getElementById('modalDateInput');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // 폼 이벤트 리스너
    const form = document.getElementById('reservationForm');
    if (form) {
        form.addEventListener('submit', handleReservationSubmit);
    }
}

function populateSelects() {
    // 특별실 셀렉트
    const roomSelect = document.getElementById('modalRoomSelect');
    if (roomSelect) {
        roomSelect.innerHTML = '<option value="">특별실 선택</option>';
        testData.rooms.forEach(room => {
            roomSelect.innerHTML += `<option value="${room.id}">${room.name}</option>`;
        });
    }
    
    // 학급 셀렉트
    const classSelect = document.getElementById('modalClassSelect');
    if (classSelect) {
        classSelect.innerHTML = '<option value="">학급 선택</option>';
        testData.classes.forEach(cls => {
            classSelect.innerHTML += `<option value="${cls.id}">${cls.name}</option>`;
        });
    }
    
    // 필터용 특별실 셀렉트
    const filterRoom = document.getElementById('filterRoom');
    if (filterRoom) {
        filterRoom.innerHTML = '<option value="">모든 특별실</option>';
        testData.rooms.forEach(room => {
            filterRoom.innerHTML += `<option value="${room.id}">${room.name}</option>`;
        });
    }
}

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
        document.querySelectorAll('#modalPeriodsGrid input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
    }
}

function handleReservationSubmit(e) {
    e.preventDefault();
    
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
        showToast('필수 항목을 모두 입력해주세요.', 'error');
        return;
    }
    
    if (formData.periods.length === 0) {
        showToast('교시를 하나 이상 선택해주세요.', 'error');
        return;
    }
    
    // 새 예약 추가
    const newReservation = {
        id: Math.max(...testData.reservations.map(r => r.id), 0) + 1,
        ...formData
    };
    
    testData.reservations.push(newReservation);
    
    closeReservationModal();
    showPage(currentPage);
    showToast('예약이 성공적으로 생성되었습니다.', 'success');
}

function deleteReservation(id) {
    if (!confirm('정말로 이 예약을 삭제하시겠습니까?')) return;
    
    testData.reservations = testData.reservations.filter(r => r.id !== id);
    showPage(currentPage);
    showToast('예약이 삭제되었습니다.', 'success');
}

// 유틸리티
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function showToast(message, type = 'info') {
    const colors = {
        'success': 'bg-green-500',
        'error': 'bg-red-500',
        'info': 'bg-blue-500'
    };
    
    const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    
    const toast = document.createElement('div');
    toast.className = `toast fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform translate-x-full ${colors[type] || 'bg-blue-500'}`;
    toast.innerHTML = `${emoji} ${message}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 미구현 기능
function viewRoomSchedule(roomId) {
    const room = testData.rooms.find(r => r.id === roomId);
    showToast(`📊 ${room?.name || '특별실'} 상세 일정 보기 기능은 추후 구현 예정입니다.`, 'info');
}

console.log('🎯 특별실 예약 시스템이 로드되었습니다.'); 
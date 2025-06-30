// 🎯 원본과 완전히 동일한 특별실 예약 시스템
// 주간 현황, 달력, 예약 목록의 모든 고급 기능 구현

// 전역 변수
let currentCalendarDate = new Date();
let filteredReservationsData = [];
let currentPage = 'dashboard';
let nextId = 3;
let editingReservationId = null;

// 📚 학년별 정규 시간표 데이터 (요일별, 교시별)
const gradeSchedules = {
    1: {
        '월': ['국어', '수학', '체육', '미술', '창체', '창체'],
        '화': ['국어', '수학', '통합', '통합', '영어', '창체'],
        '수': ['국어', '수학', '체육', '도덕', '창체', '창체'],
        '목': ['국어', '수학', '통합', '통합', '영어', '창체'],
        '금': ['국어', '수학', '음악', '안전', '창체', '창체']
    },
    2: {
        '월': ['국어', '수학', '체육', '미술', '창체', '창체'],
        '화': ['국어', '수학', '통합', '통합', '영어', '창체'],
        '수': ['국어', '수학', '체육', '도덕', '창체', '창체'],
        '목': ['국어', '수학', '통합', '통합', '영어', '창체'],
        '금': ['국어', '수학', '음악', '안전', '창체', '창체']
    },
    3: {
        '월': ['국어', '수학', '사회', '과학', '체육', '창체'],
        '화': ['국어', '수학', '사회', '과학', '영어', '창체'],
        '수': ['국어', '수학', '도덕', '미술', '체육', '창체'],
        '목': ['국어', '수학', '사회', '과학', '영어', '창체'],
        '금': ['국어', '수학', '음악', '체육', '창체', '창체']
    },
    4: {
        '월': ['국어', '수학', '사회', '과학', '체육', '창체'],
        '화': ['국어', '수학', '사회', '과학', '영어', '창체'],
        '수': ['국어', '수학', '도덕', '미술', '체육', '창체'],
        '목': ['국어', '수학', '사회', '과학', '영어', '창체'],
        '금': ['국어', '수학', '음악', '체육', '창체', '창체']
    },
    5: {
        '월': ['국어', '수학', '사회', '과학', '체육', '실과'],
        '화': ['국어', '수학', '사회', '과학', '영어', '창체'],
        '수': ['국어', '수학', '도덕', '미술', '체육', '창체'],
        '목': ['국어', '수학', '사회', '과학', '영어', '창체'],
        '금': ['국어', '수학', '음악', '체육', '실과', '창체']
    },
    6: {
        '월': ['국어', '수학', '사회', '과학', '체육', '실과'],
        '화': ['국어', '수학', '사회', '과학', '영어', '창체'],
        '수': ['국어', '수학', '도덕', '미술', '체육', '창체'],
        '목': ['국어', '수학', '사회', '과학', '영어', '창체'],
        '금': ['국어', '수학', '음악', '체육', '실과', '창체']
    }
};

// 테스트 데이터
const testData = {
    reservations: [
        {
            id: 1,
            roomId: 1,
            classId: 1,
            date: '2025-01-20',
            periods: ['1교시', '2교시'],
            purpose: '체육 수업',
            teacherName: '김선생',
            notes: '농구 수업'
        },
        {
            id: 2,
            roomId: 8,
            classId: 3,
            date: '2025-01-21',
            periods: ['3교시'],
            purpose: '영상 시청',
            teacherName: '이선생',
            notes: '교육영상 시청'
        }
    ],
    rooms: [
        { id: 1, name: '강당', isActive: true, capacity: 500 },
        { id: 2, name: '운동장', isActive: true, capacity: 1000 },
        { id: 3, name: '풋살장', isActive: true, capacity: 100 },
        { id: 4, name: '놀이활동실1', isActive: true, capacity: 30 },
        { id: 5, name: '놀이활동실2', isActive: true, capacity: 30 },
        { id: 6, name: '표현무용실', isActive: true, capacity: 40 },
        { id: 7, name: '야외정원(4층)', isActive: true, capacity: 50 },
        { id: 8, name: '시청각실1', isActive: true, capacity: 60 },
        { id: 9, name: '시청각실2', isActive: true, capacity: 60 },
        { id: 10, name: '제1컴퓨터실', isActive: true, capacity: 30 },
        { id: 11, name: '제2컴퓨터실', isActive: true, capacity: 30 }
    ],
    classes: [
        { id: 1, name: '1학년 1반' },
        { id: 2, name: '1학년 2반' },
        { id: 3, name: '2학년 1반' },
        { id: 4, name: '2학년 2반' },
        { id: 5, name: '유치원' }
    ]
};

// 페이지 제목과 부제목
const pageTitles = { 
    weekly: '이번 주 예약 현황',
    calendar: '예약 달력', 
    reservations: '예약 목록',
    dashboard: '대시보드', 
    rooms: '특별실 이용 계획', 
    stats: '통계 분석',
    settings: '설정'
};

const pageSubtitles = {
    weekly: '이번 주 특별실 이용 현황을 확인하세요',
    calendar: '달력에서 예약 일정을 확인하고 관리하세요',
    reservations: '모든 예약 내역을 관리하세요',
    dashboard: '2025년 1월 23일 • 특별실 예약 현황',
    rooms: '특별실별 이용 계획을 확인하세요',
    stats: '이용 통계를 분석하세요',
    settings: '시스템 설정을 관리하세요'
};

// 1️⃣ 주간 현황 - 수평 카드 뷰 생성
function generateWeeklyCards() {
    const weeklyCards = document.getElementById('weeklyCards');
    if (!weeklyCards) return;

    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    
    let html = '';
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        
        // 해당 날짜의 예약 찾기
        const dayReservations = testData.reservations.filter(r => r.date === dateStr);
        
        html += `
            <div style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); min-width: 280px; flex-shrink: 0;">
                <div style="padding: 16px 20px 8px; text-align: center; border-bottom: 1px solid #f3f4f6;">
                    <div style="margin-bottom: 8px;">
                        <h3 style="font-size: 18px; font-weight: 700; color: ${isToday ? '#2563eb' : '#374151'}; margin: 0;">${dayName}</h3>
                        <p style="font-size: 14px; color: ${isToday ? '#3b82f6' : '#6b7280'}; font-weight: ${isToday ? '500' : 'normal'}; margin: 4px 0 0 0;">${date.getDate()}</p>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 4px;">
                            ${dayReservations.length > 0 ? `
                                <span style="background: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">${dayReservations.length}건</span>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div style="padding: 16px 20px; min-height: 120px;">
                    ${dayReservations.length === 0 ? `
                        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 40px 0;">예약 없음</p>
                    ` : dayReservations.map(reservation => {
                        const room = testData.rooms.find(r => r.id === reservation.roomId);
                        const cls = testData.classes.find(c => c.id === reservation.classId);
                        return `
                            <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 8px; border-left: 3px solid #2563eb;">
                                <div style="display: flex; align-items: start; justify-content: space-between; gap: 8px;">
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                            <span style="background: white; border: 1px solid #e5e7eb; color: #374151; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">${room?.name || '특별실'}</span>
                                            ${reservation.periods ? `
                                                <span style="background: #f3f4f6; color: #6b7280; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${reservation.periods.join(',')}</span>
                                            ` : ''}
                                        </div>
                                        <p style="font-size: 14px; font-weight: 600; color: #111827; margin: 0; line-height: 1.3;">${cls?.name || '학급'}</p>
                                        <p style="font-size: 12px; color: #6b7280; margin: 2px 0 0 0; line-height: 1.3;">${reservation.teacherName || '담당교사 미기재'}</p>
                                        ${reservation.purpose ? `
                                            <p style="font-size: 12px; color: #6b7280; margin: 2px 0 0 0; line-height: 1.3;">${reservation.purpose}</p>
                                        ` : ''}
                                    </div>
                                    <button onclick="deleteReservation(${reservation.id})" style="background: none; border: none; color: #6b7280; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s ease;" onmouseover="this.style.color='#ef4444'; this.style.background='#fef2f2'" onmouseout="this.style.color='#6b7280'; this.style.background='none'">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    weeklyCards.innerHTML = html;
    
    // 주간 요약 업데이트
    const weekReservations = testData.reservations.filter(r => {
        const resDate = new Date(r.date);
        const weekStart = new Date(startOfWeek);
        const weekEnd = new Date(startOfWeek);
        weekEnd.setDate(weekStart.getDate() + 6);
        return resDate >= weekStart && resDate <= weekEnd;
    });
    
    document.getElementById('totalWeekReservations').textContent = weekReservations.length;
    document.getElementById('usedRooms').textContent = new Set(weekReservations.map(r => r.roomId)).size;
    document.getElementById('reservingClasses').textContent = new Set(weekReservations.map(r => r.classId)).size;
    document.getElementById('timeConflicts').textContent = '0';
    
    // 주간 범위 표시
    const weekStart = new Date(startOfWeek);
    const weekEnd = new Date(startOfWeek);
    weekEnd.setDate(weekStart.getDate() + 6);
    document.getElementById('weekRange').textContent = 
        `${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 ~ ${weekEnd.getMonth() + 1}월 ${weekEnd.getDate()}일`;
}

// 2️⃣ 달력 생성 - 월간 뷰 + 네비게이션
function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const calendarTitle = document.getElementById('calendarTitle');
    
    if (!calendarGrid || !calendarTitle) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    calendarTitle.textContent = `${year}년 ${month + 1}월`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    let html = '';
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const isCurrentMonth = date.getMonth() === month;
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        
        const dayReservations = testData.reservations.filter(r => r.date === dateStr);
        
        html += `
            <div style="background: white; min-height: 100px; padding: 8px; position: relative; cursor: pointer; ${isToday ? 'border: 2px solid #2563eb;' : ''}" onclick="selectCalendarDate('${dateStr}')">
                <div style="font-size: 14px; font-weight: ${isToday ? '700' : '500'}; color: ${isCurrentMonth ? (isToday ? '#2563eb' : '#374151') : '#9ca3af'}; margin-bottom: 4px;">
                    ${date.getDate()}
                </div>
                ${dayReservations.slice(0, 3).map(reservation => {
                    const room = testData.rooms.find(r => r.id === reservation.roomId);
                    const cls = testData.classes.find(c => c.id === reservation.classId);
                    const roomColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                    const color = roomColors[reservation.roomId % roomColors.length];
                    return `
                        <div style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; position: relative; group;" title="${room?.name}: ${cls?.name}">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span>${room?.name}: ${cls?.name}</span>
                                <button onclick="event.stopPropagation(); deleteReservation(${reservation.id})" style="background: none; border: none; color: white; opacity: 0; transition: opacity 0.2s; margin-left: 4px; padding: 0; cursor: pointer;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">
                                    🗑️
                                </button>
                            </div>
                            <div style="font-size: 10px; opacity: 90%;">${reservation.periods ? reservation.periods.join(', ') : '시간 미정'}</div>
                        </div>
                    `;
                }).join('')}
                ${dayReservations.length > 3 ? `
                    <div style="color: #6b7280; font-size: 11px;">+${dayReservations.length - 3}개 더</div>
                ` : ''}
            </div>
        `;
    }
    
    calendarGrid.innerHTML = html;
}

// 월 네비게이션
function navigateMonth(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    generateCalendar();
}

// 3️⃣ 예약 목록 - 테이블 + 검색/필터
function generateReservationsList() {
    const tableBody = document.getElementById('reservationsTableBody');
    const countElement = document.getElementById('reservationCount');
    const noReservations = document.getElementById('noReservations');
    
    if (!tableBody) return;

    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const roomFilter = document.getElementById('roomFilter')?.value || '';
    
    filteredReservationsData = testData.reservations.filter(reservation => {
        const room = testData.rooms.find(r => r.id === reservation.roomId);
        const cls = testData.classes.find(c => c.id === reservation.classId);
        
        const matchesSearch = !searchTerm || 
            (room?.name || '').toLowerCase().includes(searchTerm) ||
            (cls?.name || '').toLowerCase().includes(searchTerm) ||
            (reservation.purpose || '').toLowerCase().includes(searchTerm) ||
            (reservation.teacherName || '').toLowerCase().includes(searchTerm);
        
        const matchesRoom = !roomFilter || (room?.name === roomFilter);
        
        return matchesSearch && matchesRoom;
    });
    
    if (countElement) countElement.textContent = filteredReservationsData.length;
    
    if (filteredReservationsData.length === 0) {
        tableBody.innerHTML = '';
        if (noReservations) noReservations.style.display = 'block';
        return;
    }
    
    if (noReservations) noReservations.style.display = 'none';
    
    let html = '';
    filteredReservationsData.forEach(reservation => {
        const room = testData.rooms.find(r => r.id === reservation.roomId);
        const cls = testData.classes.find(c => c.id === reservation.classId);
        const today = new Date().toISOString().split('T')[0];
        
        let statusBadge = '';
        if (reservation.date < today) {
            statusBadge = '<span style="background: #f3f4f6; color: #6b7280; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">완료</span>';
        } else if (reservation.date === today) {
            statusBadge = '<span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">진행 중</span>';
        } else {
            statusBadge = '<span style="background: white; border: 1px solid #e5e7eb; color: #374151; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">예정</span>';
        }
        
        html += `
            <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 16px 24px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #9ca3af; font-size: 14px;">📅</span>
                        ${new Date(reservation.date).toLocaleDateString('ko-KR', {month: 'long', day: 'numeric', weekday: 'short'})}
                    </div>
                </td>
                <td style="padding: 16px 24px;">
                    <span style="background: white; border: 1px solid #e5e7eb; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 13px; font-weight: 500;">${room?.name || '알 수 없는 특별실'}</span>
                </td>
                <td style="padding: 16px 24px;">
                    <div style="font-weight: 500; color: #111827;">${cls?.name || '알 수 없는 학급'}</div>
                </td>
                <td style="padding: 16px 24px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #9ca3af; font-size: 14px;">👤</span>
                        <span style="color: #374151;">${reservation.teacherName || '미기재'}</span>
                    </div>
                </td>
                <td style="padding: 16px 24px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #9ca3af; font-size: 14px;">🕐</span>
                        <span style="color: #374151;">${reservation.periods ? reservation.periods.join(', ') : '미정'}</span>
                    </div>
                </td>
                <td style="padding: 16px 24px;">
                    <div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${reservation.purpose || ''}">
                        ${reservation.purpose || '목적 미기재'}
                    </div>
                </td>
                <td style="padding: 16px 24px;">
                    ${statusBadge}
                </td>
                <td style="padding: 16px 24px; text-align: right;">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px;">
                        <button onclick="editReservation(${reservation.id})" style="background: none; border: none; color: #6b7280; cursor: pointer; padding: 8px; border-radius: 4px; transition: all 0.2s ease;" onmouseover="this.style.color='#2563eb'; this.style.background='#eff6ff'" onmouseout="this.style.color='#6b7280'; this.style.background='none'" title="수정">
                            ✏️
                        </button>
                        <button onclick="deleteReservation(${reservation.id})" style="background: none; border: none; color: #6b7280; cursor: pointer; padding: 8px; border-radius: 4px; transition: all 0.2s ease;" onmouseover="this.style.color='#ef4444'; this.style.background='#fef2f2'" onmouseout="this.style.color='#6b7280'; this.style.background='none'" title="삭제">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// 4️⃣ 검색 및 필터 기능
function filterReservations() {
    generateReservationsList();
}

// 5️⃣ 모달 및 폼 관리
function showAddModal() {
    // 수정 모드 초기화
    editingReservationId = null;
    document.querySelector('.modal-title').textContent = '새 예약';
    document.querySelector('#reservationForm button[type="submit"]').textContent = '예약 생성';
    
    // 날짜 기본값 설정
    const dateInput = document.getElementById('modalDateInput');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    document.getElementById('modal').classList.add('show');
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
    document.getElementById('reservationForm').reset();
    editingReservationId = null;
}

// 달력 날짜 선택
function selectCalendarDate(dateStr) {
    document.getElementById('modalDateInput').value = dateStr;
    showAddModal();
}

// 예약 편집
function editReservation(id) {
    const reservation = testData.reservations.find(r => r.id === id);
    if (!reservation) return;
    
    // 모달에 기존 데이터 채우기
    document.getElementById('modalRoomSelect').value = reservation.roomId;
    document.getElementById('modalClassSelect').value = reservation.classId;
    document.getElementById('modalDateInput').value = reservation.date;
    document.getElementById('modalPurposeInput').value = reservation.purpose || '';
    document.getElementById('modalNotesInput').value = reservation.notes || '';
    
    // 교시 체크박스 설정
    document.querySelectorAll('#modalPeriodsGrid input[type="checkbox"]').forEach(cb => {
        cb.checked = reservation.periods && reservation.periods.includes(cb.value);
    });
    
    // 수정 모드로 설정
    editingReservationId = id;
    document.querySelector('.modal-title').textContent = '예약 수정';
    document.querySelector('#reservationForm button[type="submit"]').textContent = '수정하기';
    
    showAddModal();
}

// 6️⃣ 예약 생성/수정 (중복 검사 + 완전 동기화)
function handleReservationSubmit(e) {
    e.preventDefault();
    
    const formData = {
        roomId: parseInt(document.getElementById('modalRoomSelect').value),
        classId: parseInt(document.getElementById('modalClassSelect').value),
        date: document.getElementById('modalDateInput').value,
        periods: Array.from(document.querySelectorAll('#modalPeriodsGrid input:checked')).map(cb => cb.value),
        purpose: document.getElementById('modalPurposeInput').value || '특별실 이용',
        teacherName: document.getElementById('modalTeacherInput').value || '담당교사 미기재',
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
    
    // 🚨 중복 검사 - 같은 날짜, 같은 특별실, 같은 교시
    const conflicts = testData.reservations.filter(r => {
        if (editingReservationId && r.id === editingReservationId) return false; // 수정 시 자기 자신 제외
        
        return r.date === formData.date && 
               r.roomId === formData.roomId && 
               r.periods.some(period => formData.periods.includes(period));
    });
    
    if (conflicts.length > 0) {
        const conflictRoom = testData.rooms.find(room => room.id === formData.roomId);
        const conflictPeriods = conflicts.flatMap(c => c.periods).filter(p => formData.periods.includes(p));
        const uniqueConflictPeriods = [...new Set(conflictPeriods)];
        
        showToast(`❌ 예약 충돌: ${conflictRoom?.name || '특별실'}의 ${uniqueConflictPeriods.join(', ')}에 이미 다른 예약이 있습니다!`, 'error');
        return;
    }
    
    // 🕒 학년별 시간표 충돌 검사
    const classGrade = getGradeFromClass(formData.classId);
    const timeConflicts = checkGradeScheduleConflict(classGrade, formData.date, formData.periods);
    
    if (timeConflicts.length > 0) {
        showToast(`⚠️ 시간표 충돌: ${classGrade}학년은 ${timeConflicts.join(', ')}에 정규 수업이 있습니다!`, 'warning');
        if (!confirm('시간표와 충돌하지만 예약을 계속 진행하시겠습니까?')) {
            return;
        }
    }
    
    if (editingReservationId) {
        // 수정
        const index = testData.reservations.findIndex(r => r.id === editingReservationId);
        if (index !== -1) {
            testData.reservations[index] = { ...formData, id: editingReservationId };
            showToast('✅ 예약이 성공적으로 수정되었습니다.', 'success');
        }
    } else {
        // 새 예약 추가
        const newReservation = {
            id: Math.max(...testData.reservations.map(r => r.id), 0) + 1,
            ...formData
        };
        testData.reservations.push(newReservation);
        showToast('✅ 예약이 성공적으로 생성되었습니다.', 'success');
    }
    
    closeModal();
    
    // 🔄 모든 페이지 강제 동기화 (왼쪽 탭 1,2,3번 포함)
    setTimeout(() => {
        refreshAllPages();
        
        // 주간 현황, 달력, 예약 목록 특별 동기화
        if (currentPage === 'weekly') generateWeeklyCards();
        if (currentPage === 'calendar') generateCalendar();
        if (currentPage === 'reservations') generateReservationsList();
        
        // 대시보드 카운터도 동기화
        updateDashboardCounters();
        
        console.log('🔄 모든 탭 동기화 완료');
    }, 100);
}

// 7️⃣ 예약 삭제 (완전한 동기화)
function deleteReservation(id) {
    if (confirm('정말로 이 예약을 삭제하시겠습니까?')) {
        const reservation = testData.reservations.find(r => r.id === id);
        const index = testData.reservations.findIndex(r => r.id === id);
        
        if (index !== -1) {
            const room = testData.rooms.find(r => r.id === reservation.roomId);
            testData.reservations.splice(index, 1);
            
            showToast(`✅ ${room?.name || '특별실'} 예약이 삭제되었습니다.`, 'success');
            
            // 🔄 완전한 동기화
            setTimeout(() => {
                refreshAllPages();
                
                // 현재 페이지별 특별 동기화
                if (currentPage === 'weekly') generateWeeklyCards();
                if (currentPage === 'calendar') generateCalendar();
                if (currentPage === 'reservations') generateReservationsList();
                
                updateDashboardCounters();
                console.log('🗑️ 예약 삭제 후 모든 탭 동기화 완료');
            }, 100);
        }
    }
}

// 8️⃣ 전체 페이지 동기화
function refreshAllPages() {
    generateWeeklyCards();
    generateCalendar();
    generateReservationsList();
    updateDashboard();
    updateRooms();
    updateStats();
}

// 9️⃣ 페이지 전환 + 동기화
function showPage(page) {
    currentPage = page;
    
    // 모든 페이지 숨기기
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // 모든 네비게이션 버튼 비활성화
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    // 선택된 페이지 보이기
    document.getElementById(page).classList.add('active');
    
    // 해당 네비게이션 버튼 활성화
    if (event) {
        const navItem = event.target.closest('.nav-item');
        if (navItem) navItem.classList.add('active');
    }
    
    // 헤더 업데이트
    updateHeader(page);
    
    // 페이지별 초기화 및 동기화
    switch(page) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'weekly':
            generateWeeklyCards();
            break;
        case 'calendar':
            generateCalendar();
            break;
        case 'reservations':
            generateReservationsList();
            break;
        case 'rooms':
            updateRooms();
            break;
        case 'stats':
            updateStats();
            break;
    }
}

// 🔟 헤더 업데이트
function updateHeader(page) {
    const titleEl = document.getElementById('pageTitle');
    const subtitleEl = document.getElementById('pageSubtitle');
    
    if (titleEl) titleEl.textContent = pageTitles[page] || '대시보드';
    if (subtitleEl) subtitleEl.textContent = pageSubtitles[page] || '';
}

// 기타 함수들 (대시보드, 특별실, 통계 등)
function updateDashboard() {
    // 대시보드 업데이트 로직
    const todayItems = testData.reservations.filter(r => r.date === new Date().toISOString().split('T')[0]);
    if (document.getElementById('todayCount')) {
        document.getElementById('todayCount').textContent = todayItems.length;
    }
}

function updateRooms() {
    // 특별실 목록 업데이트
    console.log('특별실 목록 업데이트');
}

function updateStats() {
    // 통계 업데이트
    console.log('통계 업데이트');
}

// 📋 학급명에서 학년 추출
function getGradeFromClass(classId) {
    const cls = testData.classes.find(c => c.id === classId);
    if (!cls) return null;
    
    const className = cls.name;
    if (className.includes('유치원')) return 0;
    if (className.includes('복합특수')) return 0;
    
    const match = className.match(/(\d+)학년/);
    return match ? parseInt(match[1]) : null;
}

// 🕒 요일별 교시명을 배열 인덱스로 변환
function periodToIndex(period) {
    const periodMap = {
        '1교시': 0, '2교시': 1, '3교시': 2, 
        '4교시': 3, '5교시': 4, '6교시': 5
    };
    return periodMap[period];
}

// 📅 날짜에서 요일 추출 (한글)
function getKoreanDayOfWeek(dateStr) {
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
}

// ⚠️ 학년별 시간표 충돌 검사
function checkGradeScheduleConflict(grade, dateStr, periods) {
    if (!grade || grade === 0) return []; // 유치원, 복합특수는 시간표 검사 안함
    
    const dayOfWeek = getKoreanDayOfWeek(dateStr);
    const schedule = gradeSchedules[grade]?.[dayOfWeek];
    
    if (!schedule) return [];
    
    const conflicts = [];
    periods.forEach(period => {
        const periodIndex = periodToIndex(period);
        if (periodIndex !== undefined && schedule[periodIndex]) {
            const subject = schedule[periodIndex];
            // 창체(창의적 체험활동)는 유연하게 운영 가능하므로 충돌로 보지 않음
            if (subject !== '창체') {
                conflicts.push(`${period}(${subject})`);
            }
        }
    });
    
    return conflicts;
}

// 📊 대시보드 카운터 업데이트
function updateDashboardCounters() {
    const today = new Date().toISOString().split('T')[0];
    const todayReservations = testData.reservations.filter(r => r.date === today);
    
    // 오늘 예약 수
    const todayCountEl = document.getElementById('todayCount');
    if (todayCountEl) todayCountEl.textContent = todayReservations.length;
    
    // 이번 주 예약 수
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const weekReservations = testData.reservations.filter(r => {
        const resDate = new Date(r.date);
        return resDate >= startOfWeek && resDate <= endOfWeek;
    });
    
    const weekCountEl = document.getElementById('weekCount');
    if (weekCountEl) weekCountEl.textContent = weekReservations.length;
    
    // 이번 달 예약 수
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthReservations = testData.reservations.filter(r => {
        const resDate = new Date(r.date);
        return resDate.getMonth() === currentMonth && resDate.getFullYear() === currentYear;
    });
    
    const monthCountEl = document.getElementById('monthCount');
    if (monthCountEl) monthCountEl.textContent = monthReservations.length;
    
    // 특별실 이용률
    const usedRoomsToday = new Set(todayReservations.map(r => r.roomId)).size;
    const utilizationRate = Math.round((usedRoomsToday / testData.rooms.length) * 100);
    const utilizationEl = document.getElementById('utilizationRate');
    if (utilizationEl) utilizationEl.textContent = utilizationRate;
    
    console.log(`📊 대시보드 업데이트: 오늘 ${todayReservations.length}건, 이번주 ${weekReservations.length}건, 이용률 ${utilizationRate}%`);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 교시 그리드 생성
function setupPeriodsGrid() {
    const periodsGrid = document.getElementById('modalPeriodsGrid');
    if (!periodsGrid) return;
    
    const periods = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시'];
    const times = ['09:00~09:40', '09:50~10:30', '10:40~11:20', '11:30~12:10', '13:10~13:50', '14:00~14:40'];
    
    let html = '';
    periods.forEach((period, index) => {
        html += `
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px; transition: all 0.2s ease;" onmouseover="this.style.borderColor='#2563eb'; this.style.background='#eff6ff'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.background='white'">
                <input type="checkbox" value="${period}" style="margin: 0;">
                <div style="flex: 1;">
                    <div style="font-weight: 500; color: #374151; font-size: 14px;">${period}</div>
                    <div style="color: #6b7280; font-size: 12px;">${times[index]}</div>
                </div>
            </label>
        `;
    });
    
    periodsGrid.innerHTML = html;
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 모달 폼 이벤트 리스너
    const form = document.getElementById('reservationForm');
    if (form) {
        form.addEventListener('submit', handleReservationSubmit);
    }
    
    // 교시 그리드 생성
    setupPeriodsGrid();
    
    // 날짜 입력 기본값
    const dateInput = document.getElementById('modalDateInput');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // 초기 페이지 로드
    refreshAllPages();
    
    console.log('🎯 원본과 완전히 동일한 특별실 예약 시스템이 로드되었습니다!');
}); 
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

// 2️⃣ 달력 생성 - 월간 뷰 + 네비게이션 (완전 개선)
function generateCalendar() {
    console.log('📅 달력 생성 함수 호출됨');
    
    const calendarGrid = document.getElementById('calendarGrid');
    const calendarTitle = document.getElementById('calendarTitle');
    
    if (!calendarGrid || !calendarTitle) {
        console.error('❌ 달력 DOM 요소를 찾을 수 없음:', { 
            calendarGrid: !!calendarGrid, 
            calendarTitle: !!calendarTitle 
        });
        return;
    }
    
    console.log('✅ 달력 DOM 요소 확인됨, 생성 시작');

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
        
        // 🎯 개선된 오늘 날짜 스타일링
        const todayStyle = isToday ? `
            background: linear-gradient(135deg, #eff6ff, #dbeafe) !important;
            border: 2px solid #2563eb !important;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2) !important;
        ` : '';
        
        // 📅 호버 효과
        const hoverStyle = `
            transition: all 0.2s ease;
            border: 1px solid #e5e7eb;
        `;
        
        html += `
            <div 
                class="calendar-day" 
                style="
                    background: white; 
                    min-height: 100px; 
                    padding: 8px; 
                    position: relative; 
                    cursor: pointer; 
                    ${todayStyle} 
                    ${hoverStyle}
                " 
                onclick="selectCalendarDate('${dateStr}')"
                onmouseover="showCalendarTooltip(event, '${dateStr}', ${JSON.stringify(dayReservations).replace(/"/g, '&quot;')})"
                onmouseout="hideCalendarTooltip()"
                onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.1)'"
                onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='${isToday ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'}'"
            >
                <!-- 📅 날짜 표시 (오늘 날짜 강조) -->
                <div style="
                    font-size: 14px; 
                    font-weight: ${isToday ? '700' : '500'}; 
                    color: ${isCurrentMonth ? (isToday ? '#2563eb' : '#374151') : '#9ca3af'}; 
                    margin-bottom: 6px;
                    ${isToday ? 'background: white; padding: 4px 8px; border-radius: 12px; text-align: center; border: 1px solid #2563eb;' : ''}
                ">
                    ${isToday ? '📅 ' : ''}${date.getDate()}${isToday ? ' (오늘)' : ''}
                </div>
                
                <!-- 🏢 예약 항목들 (최대 3개) -->
                ${dayReservations.slice(0, 3).map(reservation => {
                    const room = testData.rooms.find(r => r.id === reservation.roomId);
                    const cls = testData.classes.find(c => c.id === reservation.classId);
                    const roomColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                    const color = roomColors[reservation.roomId % roomColors.length];
                    
                    return `
                        <div 
                            class="reservation-item"
                            style="
                                background: ${color}; 
                                color: white; 
                                padding: 4px 8px; 
                                border-radius: 6px; 
                                font-size: 11px; 
                                margin-bottom: 3px; 
                                white-space: nowrap; 
                                overflow: hidden; 
                                text-overflow: ellipsis; 
                                position: relative;
                                transition: all 0.2s ease;
                                cursor: pointer;
                            " 
                            onclick="event.stopPropagation(); editReservation(${reservation.id})"
                            onmouseover="this.style.transform='scale(1.02)'; this.style.zIndex='10'"
                            onmouseout="this.style.transform='scale(1)'; this.style.zIndex='auto'"
                            title="📋 ${room?.name}: ${cls?.name}
🕐 ${reservation.periods ? reservation.periods.join(', ') : '시간 미정'}
👤 ${reservation.teacherName || '담당교사 미기재'}
📝 ${reservation.purpose || '목적 미기재'}
클릭하여 수정"
                        >
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span style="font-weight: 600;">${room?.name}</span>
                                <button 
                                    onclick="event.stopPropagation(); deleteReservation(${reservation.id})" 
                                    style="
                                        background: none; 
                                        border: none; 
                                        color: white; 
                                        opacity: 0; 
                                        transition: opacity 0.2s; 
                                        margin-left: 4px; 
                                        padding: 2px; 
                                        cursor: pointer;
                                        border-radius: 2px;
                                    " 
                                    onmouseover="this.style.opacity='1'; this.style.background='rgba(255,255,255,0.2)'" 
                                    onmouseout="this.style.opacity='0'; this.style.background='none'"
                                    title="🗑️ 예약 삭제"
                                >
                                    🗑️
                                </button>
                            </div>
                            <div style="font-size: 10px; opacity: 90%; font-weight: 500;">
                                ${cls?.name} | ${reservation.periods ? reservation.periods.join(', ') : '시간 미정'}
                            </div>
                        </div>
                    `;
                }).join('')}
                
                <!-- 📋 추가 예약 개수 표시 -->
                ${dayReservations.length > 3 ? `
                    <div style="
                        color: #6b7280; 
                        font-size: 11px; 
                        background: #f3f4f6; 
                        padding: 2px 6px; 
                        border-radius: 4px; 
                        text-align: center;
                        font-weight: 500;
                    ">
                        +${dayReservations.length - 3}개 더
                    </div>
                ` : ''}
                
                <!-- ➕ 빈 날짜 클릭 안내 -->
                ${dayReservations.length === 0 ? `
                    <div style="
                        position: absolute; 
                        bottom: 8px; 
                        left: 50%; 
                        transform: translateX(-50%); 
                        color: #9ca3af; 
                        font-size: 10px; 
                        opacity: 0; 
                        transition: opacity 0.2s ease;
                    " class="click-hint">
                        클릭하여 예약
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    calendarGrid.innerHTML = html;
    
    console.log(`✅ 달력 HTML 생성 완료: ${html.length}자 (${year}년 ${month + 1}월)`);
    console.log(`📋 예약 데이터: ${testData.reservations.length}건`);
    
    // 💡 빈 날짜 호버 시 힌트 표시
    setTimeout(() => {
        const dayElements = document.querySelectorAll('.calendar-day');
        console.log(`📅 달력 날짜 요소: ${dayElements.length}개`);
        
        dayElements.forEach(day => {
            day.addEventListener('mouseenter', function() {
                const hint = this.querySelector('.click-hint');
                if (hint) hint.style.opacity = '1';
            });
            day.addEventListener('mouseleave', function() {
                const hint = this.querySelector('.click-hint');
                if (hint) hint.style.opacity = '0';
            });
        });
    }, 100);
}

// 📅 달력 툴팁 시스템
function showCalendarTooltip(event, dateStr, reservations) {
    hideCalendarTooltip(); // 기존 툴팁 제거
    
    if (!reservations || reservations.length === 0) return;
    
    const tooltip = document.createElement('div');
    tooltip.id = 'calendar-tooltip';
    tooltip.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        max-width: 320px;
        font-size: 14px;
        backdrop-filter: blur(10px);
        border-top: 3px solid #2563eb;
    `;
    
    const formatDate = new Date(dateStr).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    let tooltipContent = `
        <div style="border-bottom: 1px solid #f3f4f6; padding-bottom: 12px; margin-bottom: 12px;">
            <div style="font-weight: 700; color: #111827; font-size: 16px; margin-bottom: 4px;">
                📅 ${formatDate}
            </div>
            <div style="color: #6b7280; font-size: 13px;">
                📋 총 ${reservations.length}개의 예약
            </div>
        </div>
    `;
    
    reservations.forEach((reservation, index) => {
        const room = testData.rooms.find(r => r.id === reservation.roomId);
        const cls = testData.classes.find(c => c.id === reservation.classId);
        const roomColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const color = roomColors[reservation.roomId % roomColors.length];
        
        tooltipContent += `
            <div style="
                background: linear-gradient(135deg, ${color}15, ${color}08);
                border-left: 3px solid ${color};
                padding: 12px;
                border-radius: 8px;
                margin-bottom: ${index < reservations.length - 1 ? '12px' : '0'};
            ">
                <div style="display: flex; align-items: center; justify-content: between; margin-bottom: 8px;">
                    <div style="
                        background: ${color};
                        color: white;
                        padding: 4px 8px;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 600;
                        margin-right: 8px;
                    ">
                        🏢 ${room?.name || '특별실'}
                    </div>
                    <div style="color: #6b7280; font-size: 12px;">
                        ${reservation.periods ? reservation.periods.join(', ') : '시간 미정'}
                    </div>
                </div>
                
                <div style="margin-bottom: 6px;">
                    <div style="color: #374151; font-weight: 600; font-size: 14px;">
                        👥 ${cls?.name || '알 수 없는 학급'}
                    </div>
                </div>
                
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 4px;">
                    👤 담당교사: ${reservation.teacherName || '미기재'}
                </div>
                
                ${reservation.purpose ? `
                    <div style="color: #6b7280; font-size: 13px; margin-bottom: 8px;">
                        📝 목적: ${reservation.purpose}
                    </div>
                ` : ''}
                
                ${reservation.notes ? `
                    <div style="color: #6b7280; font-size: 12px; font-style: italic;">
                        💬 ${reservation.notes}
                    </div>
                ` : ''}
                
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${color}20;">
                    <button 
                        onclick="editReservation(${reservation.id}); hideCalendarTooltip();" 
                        style="
                            background: none;
                            border: 1px solid ${color};
                            color: ${color};
                            padding: 4px 8px;
                            border-radius: 4px;
                            font-size: 11px;
                            cursor: pointer;
                            margin-right: 6px;
                            transition: all 0.2s;
                        "
                        onmouseover="this.style.background='${color}'; this.style.color='white'"
                        onmouseout="this.style.background='none'; this.style.color='${color}'"
                    >
                        ✏️ 수정
                    </button>
                    <button 
                        onclick="deleteReservation(${reservation.id}); hideCalendarTooltip();" 
                        style="
                            background: none;
                            border: 1px solid #ef4444;
                            color: #ef4444;
                            padding: 4px 8px;
                            border-radius: 4px;
                            font-size: 11px;
                            cursor: pointer;
                            transition: all 0.2s;
                        "
                        onmouseover="this.style.background='#ef4444'; this.style.color='white'"
                        onmouseout="this.style.background='none'; this.style.color='#ef4444'"
                    >
                        🗑️ 삭제
                    </button>
                </div>
            </div>
        `;
    });
    
    tooltipContent += `
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #f3f4f6; text-align: center;">
            <button 
                onclick="selectCalendarDate('${dateStr}'); hideCalendarTooltip();" 
                style="
                    background: linear-gradient(135deg, #2563eb, #3b82f6);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 13px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                "
                onmouseover="this.style.background='linear-gradient(135deg, #1d4ed8, #2563eb)'"
                onmouseout="this.style.background='linear-gradient(135deg, #2563eb, #3b82f6)'"
            >
                ➕ 새 예약 추가
            </button>
        </div>
    `;
    
    tooltip.innerHTML = tooltipContent;
    document.body.appendChild(tooltip);
    
    // 툴팁 위치 계산
    const rect = event.target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    let top = rect.top - tooltipRect.height - 10;
    
    // 화면 경계 확인 및 조정
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
    }
    if (top < 10) {
        top = rect.bottom + 10;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    
    // 애니메이션 효과
    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translateY(10px) scale(0.9)';
    setTimeout(() => {
        tooltip.style.transition = 'all 0.2s ease';
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(0) scale(1)';
    }, 10);
}

function hideCalendarTooltip() {
    const existingTooltip = document.getElementById('calendar-tooltip');
    if (existingTooltip) {
        existingTooltip.style.opacity = '0';
        existingTooltip.style.transform = 'translateY(10px) scale(0.9)';
        setTimeout(() => {
            if (existingTooltip.parentNode) {
                existingTooltip.parentNode.removeChild(existingTooltip);
            }
        }, 200);
    }
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

// 5️⃣ 모달 및 폼 관리 (개선된 버전)
function showAddModal(selectedDate = null) {
    // 수정 모드 초기화
    editingReservationId = null;
    
    const modalTitle = document.querySelector('.modal-title');
    const submitBtn = document.querySelector('#reservationForm button[type="submit"]');
    
    if (selectedDate) {
        // 달력에서 날짜를 선택해서 온 경우
        const formatDate = new Date(selectedDate).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });
        modalTitle.textContent = `새 예약 - ${formatDate}`;
    } else {
        // 일반적인 새 예약 버튼에서 온 경우
        modalTitle.textContent = '새 예약';
    }
    
    if (submitBtn) {
        submitBtn.textContent = '예약 생성';
    }
    
    // 날짜 기본값 설정
    const dateInput = document.getElementById('modalDateInput');
    if (dateInput) {
        if (selectedDate) {
            dateInput.value = selectedDate;
        } else if (!dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }
    
    // 폼 초기화
    const form = document.getElementById('reservationForm');
    if (form) {
        form.reset();
        // 날짜는 다시 설정
        if (dateInput) {
            dateInput.value = selectedDate || new Date().toISOString().split('T')[0];
        }
    }
    
    document.getElementById('modal').classList.add('show');
    
    // 🎯 포커스를 특별실 선택으로 이동
    setTimeout(() => {
        const roomSelect = document.getElementById('modalRoomSelect');
        if (roomSelect) {
            roomSelect.focus();
        }
    }, 300);
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
    document.getElementById('reservationForm').reset();
    editingReservationId = null;
}

// 📅 달력 날짜 선택 (개선된 피드백)
function selectCalendarDate(dateStr) {
    // 툴팁 숨기기
    hideCalendarTooltip();
    
    // 선택된 날짜 피드백 표시
    const selectedDate = new Date(dateStr);
    const formatDate = selectedDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    // 📅 선택 피드백 토스트
    showToast(`📅 ${formatDate} 선택됨 - 새 예약을 생성하세요!`, 'info');
    
    // 🎯 선택된 날짜와 함께 모달 열기
    showAddModal(dateStr);
    
    console.log(`📅 달력에서 날짜 선택: ${formatDate}`);
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
    setTimeout(() => {
        switch(page) {
            case 'dashboard':
                updateDashboard();
                updateDashboardCounters();
                break;
            case 'weekly':
                generateWeeklyCards();
                break;
            case 'calendar':
                rebuildCalendar();
                console.log('📅 달력 페이지 로드 완료');
                break;
            case 'reservations':
                generateReservationsList();
                break;
            case 'rooms':
                updateRooms();
                if (typeof renderRoomsPage === 'function') renderRoomsPage();
                break;
            case 'stats':
                updateStats();
                break;
        }
    }, 50);
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

// 🔄 강제 달력 재생성
function forceRegenerateCalendar() {
    console.log('🔄 달력 강제 재생성 시작');
    
    setTimeout(() => {
        const calendarGrid = document.getElementById('calendarGrid');
        const calendarTitle = document.getElementById('calendarTitle');
        
        if (!calendarGrid || !calendarTitle) {
            console.error('❌ 달력 DOM 요소를 찾을 수 없음:', { calendarGrid: !!calendarGrid, calendarTitle: !!calendarTitle });
            return;
        }
        
        console.log('📅 달력 DOM 요소 확인됨, 생성 시작');
        generateCalendar();
        console.log('✅ 달력 강제 재생성 완료');
    }, 100);
}

// 📅 달력 페이지 활성화 감지 및 자동 재생성
function watchCalendarPage() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const calendarPage = document.getElementById('calendar');
                if (calendarPage && calendarPage.classList.contains('active')) {
                    console.log('📅 달력 페이지 활성화 감지');
                    forceRegenerateCalendar();
                }
            }
        });
    });
    
    const calendarPage = document.getElementById('calendar');
    if (calendarPage) {
        observer.observe(calendarPage, { attributes: true });
    }
}

// 🔧 달력 강제 테스트 함수
function testCalendar() {
    console.log('🔧 달력 테스트 시작');
    
    const calendarGrid = document.getElementById('calendarGrid');
    const calendarTitle = document.getElementById('calendarTitle');
    
    if (!calendarGrid) {
        console.error('❌ calendarGrid 요소가 없음');
        return;
    }
    
    if (!calendarTitle) {
        console.error('❌ calendarTitle 요소가 없음');
        return;
    }
    
    // 기본 테스트 HTML 삽입
    calendarTitle.textContent = '2025년 1월 (테스트)';
    calendarGrid.innerHTML = `
        <div style="background: white; min-height: 100px; padding: 8px; border: 1px solid #e5e7eb; cursor: pointer;" onclick="alert('달력 클릭 테스트 성공!')">
            <div style="font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">1</div>
            <div style="background: #2563eb; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">
                테스트 예약
            </div>
        </div>
        <div style="background: white; min-height: 100px; padding: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 14px; font-weight: 500; color: #374151;">2</div>
        </div>
        <div style="background: white; min-height: 100px; padding: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 14px; font-weight: 500; color: #374151;">3</div>
        </div>
        <div style="background: white; min-height: 100px; padding: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 14px; font-weight: 500; color: #374151;">4</div>
        </div>
        <div style="background: white; min-height: 100px; padding: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 14px; font-weight: 500; color: #374151;">5</div>
        </div>
        <div style="background: white; min-height: 100px; padding: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 14px; font-weight: 500; color: #374151;">6</div>
        </div>
        <div style="background: white; min-height: 100px; padding: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 14px; font-weight: 500; color: #374151;">7</div>
        </div>
    `;
    
    console.log('✅ 달력 테스트 HTML 삽입 완료');
}

// 🎯 달력 완전 재구축
function rebuildCalendar() {
    console.log('🎯 달력 완전 재구축 시작');
    
    setTimeout(() => {
        testCalendar();
        setTimeout(() => {
            generateCalendar();
        }, 500);
    }, 100);
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM 로드 완료, 앱 초기화 시작');
    
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
    
    // 달력 페이지 감시 시작
    watchCalendarPage();
    
    // 🎯 전역 이벤트 리스너 추가
    setupGlobalEventListeners();
    
    // 초기 페이지 로드
    setTimeout(() => {
        refreshAllPages();
        
        // 달력이 현재 활성 페이지인지 확인
        const calendarPage = document.getElementById('calendar');
        if (calendarPage && calendarPage.classList.contains('active')) {
            console.log('📅 초기 로드 시 달력 페이지가 활성화됨');
            forceRegenerateCalendar();
        }
    }, 200);
    
    console.log('🎯 완전히 개선된 특별실 예약 시스템이 로드되었습니다!');
});

// 🎯 전역 이벤트 리스너 설정
function setupGlobalEventListeners() {
    // 📅 달력 툴팁 숨기기 (다른 곳 클릭 시)
    document.addEventListener('click', function(event) {
        const tooltip = document.getElementById('calendar-tooltip');
        if (tooltip && !tooltip.contains(event.target)) {
            // 달력 날짜나 예약 아이템을 클릭한 경우가 아니라면 툴팁 숨기기
            const isCalendarClick = event.target.closest('.calendar-day') || 
                                  event.target.closest('.reservation-item');
            if (!isCalendarClick) {
                hideCalendarTooltip();
            }
        }
    });
    
    // 🔄 페이지 전환 시 툴팁 숨기기
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('nav-item')) {
            hideCalendarTooltip();
        }
    });
    
    // ⌨️ ESC 키로 툴팁 숨기기
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            hideCalendarTooltip();
            closeModal();
            if (typeof closeRoomModal === 'function') closeRoomModal();
        }
    });
    
    // 📱 스크롤 시 툴팁 숨기기
    document.addEventListener('scroll', hideCalendarTooltip);
    
    console.log('🎯 전역 이벤트 리스너 설정 완료');
} 
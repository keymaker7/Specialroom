/**
 * 📊 Google Sheets API 클라이언트
 * Google Apps Script를 통해 Google Sheets와 통신합니다
 */

// Google Sheets를 데이터베이스로 사용하는 API 클라이언트

const API_URL = import.meta.env.VITE_GOOGLE_SHEETS_API_URL;

// API URL이 없으면 테스트 데이터 사용
const USE_TEST_DATA = !API_URL;

// 타입 정의 - 실제 스키마에 맞춤
export interface Room {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface Class {
  id: number;
  name: string;
  grade: number;
  classNumber: number;
  createdAt: string;
}

export interface Reservation {
  id: number;
  roomId: number;
  classId: number;
  date: string; // YYYY-MM-DD
  periods: string[]; // ["1", "2"] for 1교시, 2교시
  purpose: string;
  notes?: string;
  createdAt: string;
}

export interface ReservationWithDetails extends Reservation {
  room: Room;
  class: Class;
}

export interface CreateReservationData {
  roomId: number;
  classId: number;
  date: string;
  periods: string[];
  purpose?: string;
  notes?: string;
}

// 테스트 데이터
const TEST_ROOMS: Room[] = [
  {id: 1, name: '강당', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
  {id: 2, name: '운동장', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
  {id: 3, name: '풋살장', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
  {id: 4, name: '놀이활동실1', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
  {id: 5, name: '놀이활동실2', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
  {id: 6, name: '표현무용실', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
  {id: 7, name: '야외정원(4층)', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
  {id: 8, name: '시청각실1', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
  {id: 9, name: '시청각실2', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
  {id: 10, name: '제1컴퓨터실', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'},
  {id: 11, name: '제2컴퓨터실', isActive: true, createdAt: '2024-01-01T09:00:00.000Z'}
];

const TEST_CLASSES: Class[] = [
  {id: 1, name: '1학년 1반', grade: 1, classNumber: 1, createdAt: '2024-01-01T09:00:00.000Z'},
  {id: 2, name: '1학년 2반', grade: 1, classNumber: 2, createdAt: '2024-01-01T09:00:00.000Z'},
  {id: 3, name: '2학년 1반', grade: 2, classNumber: 1, createdAt: '2024-01-01T09:00:00.000Z'},
  {id: 4, name: '2학년 2반', grade: 2, classNumber: 2, createdAt: '2024-01-01T09:00:00.000Z'},
  {id: 5, name: '3학년 1반', grade: 3, classNumber: 1, createdAt: '2024-01-01T09:00:00.000Z'},
  {id: 6, name: '유치원', grade: 0, classNumber: 1, createdAt: '2024-01-01T09:00:00.000Z'}
];

const TEST_RESERVATIONS: Reservation[] = [
  {
    id: 1,
    roomId: 1,
    classId: 1,
    date: new Date().toISOString().split('T')[0],
    periods: ['1', '2'],
    purpose: '체육 수업',
    notes: '농구 수업',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    roomId: 8,
    classId: 3,
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    periods: ['3'],
    purpose: '영상 시청',
    notes: '',
    createdAt: new Date().toISOString()
  }
];

// API 호출 공통 함수
async function callAPI(action: string, data?: any) {
  if (USE_TEST_DATA) {
    // 테스트 데이터 반환
    console.log(`🧪 테스트 데이터 사용: ${action}`);
    await new Promise(resolve => setTimeout(resolve, 200)); // 로딩 시뮬레이션
    
    switch (action) {
      case 'getRooms': return TEST_ROOMS;
      case 'getClasses': return TEST_CLASSES;
      case 'getReservations': return TEST_RESERVATIONS;
      case 'createReservation': 
        const newReservation = { id: Date.now(), ...data, createdAt: new Date().toISOString() };
        TEST_RESERVATIONS.push(newReservation);
        return newReservation;
      case 'deleteReservation':
        const index = TEST_RESERVATIONS.findIndex(r => r.id === data.id);
        if (index > -1) TEST_RESERVATIONS.splice(index, 1);
        return { success: true };
      default: return {};
    }
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, data }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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

// 특별실 관련 API
export async function getRooms(): Promise<Room[]> {
  return await callAPI('getRooms');
}

export async function getRoom(id: number): Promise<Room | null> {
  const rooms = await getRooms();
  return rooms.find(room => room.id === id) || null;
}

// 학급 관련 API
export async function getClasses(): Promise<Class[]> {
  return await callAPI('getClasses');
}

export async function getClass(id: number): Promise<Class | null> {
  const classes = await getClasses();
  return classes.find(cls => cls.id === id) || null;
}

// 예약 관련 API
export async function getReservations(): Promise<ReservationWithDetails[]> {
  const reservations = await callAPI('getReservations');
  
  // 각 예약에 room과 class 정보 추가
  const rooms = await getRooms();
  const classes = await getClasses();
  
  return reservations.map((reservation: Reservation) => {
    const room = rooms.find(r => r.id === reservation.roomId);
    const cls = classes.find(c => c.id === reservation.classId);
    
    return {
      ...reservation,
      room: room!,
      class: cls!,
    };
  });
}

export async function getReservation(id: number): Promise<ReservationWithDetails | null> {
  const reservations = await getReservations();
  return reservations.find(r => r.id === id) || null;
}

export async function getReservationsByDate(date: string): Promise<ReservationWithDetails[]> {
  const reservations = await getReservations();
  return reservations.filter(r => r.date === date);
}

export async function getReservationsByDateRange(
  startDate: string, 
  endDate: string
): Promise<ReservationWithDetails[]> {
  const reservations = await getReservations();
  return reservations.filter(r => r.date >= startDate && r.date <= endDate);
}

export async function createReservation(data: CreateReservationData): Promise<Reservation> {
  return await callAPI('createReservation', data);
}

export async function updateReservation(
  id: number, 
  data: Partial<CreateReservationData>
): Promise<Reservation> {
  return await callAPI('updateReservation', { id, ...data });
}

export async function deleteReservation(id: number): Promise<{ success: boolean }> {
  return await callAPI('deleteReservation', { id });
}

// 충돌 검사
export async function checkReservationConflict(
  roomId: number,
  date: string,
  periods: string[],
  excludeId?: number
): Promise<boolean> {
  const reservations = await getReservationsByDate(date);
  
  return reservations.some(reservation => {
    // 같은 예약은 제외
    if (excludeId && reservation.id === excludeId) return false;
    
    // 같은 특별실인지 확인
    if (reservation.roomId !== roomId) return false;
    
    // 교시 충돌 확인
    return reservation.periods.some(period => periods.includes(period));
  });
}

// 통계 관련 API
export async function getReservationStats() {
  const reservations = await getReservations();
  const rooms = await getRooms();
  
  const today = new Date().toISOString().split('T')[0];
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const thisWeekReservations = reservations.filter(r => r.date >= oneWeekAgo && r.date <= today);
  
  return {
    totalReservations: reservations.length,
    thisWeekReservations: thisWeekReservations.length,
    totalRooms: rooms.filter(r => r.isActive).length,
    roomUsage: rooms.map(room => ({
      room: room.name,
      count: reservations.filter(r => r.roomId === room.id).length,
    })).sort((a, b) => b.count - a.count),
  };
}

// 특정 날짜/교시의 예약 현황
export async function getTimeSlotAvailability(date: string, period: string) {
  const reservations = await getReservationsByDate(date);
  const rooms = await getRooms();
  
  const occupiedRoomIds = reservations
    .filter(r => r.periods.includes(period))
    .map(r => r.roomId);
  
  return {
    available: rooms.filter(r => r.isActive && !occupiedRoomIds.includes(r.id)),
    occupied: reservations.filter(r => r.periods.includes(period)),
  };
}

// 특별실별 주간 사용 현황
export async function getRoomWeeklyUsage(roomId: number) {
  const room = await getRoom(roomId);
  if (!room) throw new Error('특별실을 찾을 수 없습니다.');
  
  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const startDate = weekStart.toISOString().split('T')[0];
  const endDate = weekEnd.toISOString().split('T')[0];
  
  const reservations = await getReservationsByDateRange(startDate, endDate);
  const roomReservations = reservations.filter(r => r.roomId === roomId);
  
  // 요일별 정리
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const usage = weekDays.map((day, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayReservations = roomReservations.filter(r => r.date === dateStr);
    
    return {
      day,
      date: dateStr,
      reservations: dayReservations,
      totalPeriods: dayReservations.reduce((sum, r) => sum + r.periods.length, 0),
    };
  });
  
  return {
    room,
    weekRange: `${startDate} ~ ${endDate}`,
    usage,
    totalReservations: roomReservations.length,
  };
}

// 학급별 예약 현황
export async function getClassReservations(classId: number) {
  const cls = await getClass(classId);
  if (!cls) throw new Error('학급을 찾을 수 없습니다.');
  
  const reservations = await getReservations();
  const classReservations = reservations.filter(r => r.classId === classId);
  
  return {
    class: cls,
    reservations: classReservations,
    totalCount: classReservations.length,
    roomUsage: classReservations.reduce((acc, r) => {
      const roomName = r.room.name;
      acc[roomName] = (acc[roomName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

// 교시별 예약 현황
export async function getPeriodUsage(date: string) {
  const reservations = await getReservationsByDate(date);
  const rooms = await getRooms();
  
  const periods = ['1', '2', '3', '4', '5', '6', '7'];
  
  return periods.map(period => {
    const periodReservations = reservations.filter(r => r.periods.includes(period));
    
    return {
      period: `${period}교시`,
      reservations: periodReservations,
      occupiedRooms: periodReservations.length,
      availability: `${periodReservations.length}/${rooms.filter(r => r.isActive).length}`,
    };
  });
}

// 예약 검색
export async function searchReservations(query: {
  roomId?: number;
  classId?: number;
  startDate?: string;
  endDate?: string;
  purpose?: string;
}) {
  let reservations = await getReservations();
  
  if (query.roomId) {
    reservations = reservations.filter(r => r.roomId === query.roomId);
  }
  
  if (query.classId) {
    reservations = reservations.filter(r => r.classId === query.classId);
  }
  
  if (query.startDate) {
    reservations = reservations.filter(r => r.date >= query.startDate!);
  }
  
  if (query.endDate) {
    reservations = reservations.filter(r => r.date <= query.endDate!);
  }
  
  if (query.purpose) {
    const purposeLower = query.purpose.toLowerCase();
    reservations = reservations.filter(r => 
      r.purpose.toLowerCase().includes(purposeLower) ||
      (r.notes && r.notes.toLowerCase().includes(purposeLower))
    );
  }
  
  return reservations;
}

// 에러 처리 헬퍼
export class SheetsAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'SheetsAPIError';
  }
} 
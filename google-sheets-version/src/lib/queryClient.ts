import { QueryClient, useQuery } from "@tanstack/react-query";
import * as SheetsAPI from "./google-sheets-api";

// React Query 클라이언트 설정
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Google Sheets API 래퍼 함수들 (기존 API와 동일한 인터페이스)
export async function apiRequest(method: string, url: string, data?: any) {
  const cleanUrl = url.replace('/api/', '');
  
  switch (method) {
    case 'GET':
      if (cleanUrl === 'reservations') {
        return SheetsAPI.getReservations();
      } else if (cleanUrl === 'rooms') {
        return SheetsAPI.getRooms();
      } else if (cleanUrl === 'classes') {
        return SheetsAPI.getClasses();
      } else if (cleanUrl === 'statistics') {
        return SheetsAPI.getReservationStats();
      } else if (cleanUrl.startsWith('reservations/')) {
        const id = cleanUrl.split('/')[1];
        const reservations = await SheetsAPI.getReservations();
        return reservations.find(r => r.id === id);
      }
      break;
      
    case 'POST':
      if (cleanUrl === 'reservations') {
        return SheetsAPI.createReservation(data);
      } else if (cleanUrl === 'rooms') {
        return SheetsAPI.createRoom(data);
      } else if (cleanUrl === 'classes') {
        return SheetsAPI.createClass(data);
      }
      break;
      
    case 'PUT':
      if (cleanUrl.startsWith('reservations/')) {
        const id = cleanUrl.split('/')[1];
        return SheetsAPI.updateReservation(id, data);
      } else if (cleanUrl.startsWith('rooms/')) {
        const id = cleanUrl.split('/')[1];
        return SheetsAPI.updateRoom(id, data);
      } else if (cleanUrl.startsWith('classes/')) {
        const id = cleanUrl.split('/')[1];
        return SheetsAPI.updateClass(id, data);
      }
      break;
      
    case 'DELETE':
      if (cleanUrl.startsWith('reservations/')) {
        const id = cleanUrl.split('/')[1];
        return SheetsAPI.deleteReservation(id);
      } else if (cleanUrl.startsWith('rooms/')) {
        const id = cleanUrl.split('/')[1];
        return SheetsAPI.deleteRoom(id);
      } else if (cleanUrl.startsWith('classes/')) {
        const id = cleanUrl.split('/')[1];
        return SheetsAPI.deleteClass(id);
      }
      break;
  }
  
  throw new Error(`지원되지 않는 API 호출: ${method} ${url}`);
}

// React Query 훅들을 Google Sheets API에 맞게 조정
export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: SheetsAPI.getRooms,
  });
};

export const useClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: SheetsAPI.getClasses,
  });
};

export const useReservations = () => {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: SheetsAPI.getReservations,
  });
};

export const useReservationsByDate = (date: string) => {
  return useQuery({
    queryKey: ['reservations', 'by-date', date],
    queryFn: () => SheetsAPI.getReservationsByDate(date),
    enabled: !!date,
  });
};

export const useReservationStats = () => {
  return useQuery({
    queryKey: ['reservation-stats'],
    queryFn: SheetsAPI.getReservationStats,
  });
};

// 개발 모드에서 API가 설정되지 않은 경우 목 데이터 사용
const isDevelopment = (import.meta.env as any).MODE === 'development';
const apiUrl = import.meta.env.VITE_GOOGLE_SHEETS_API_URL;

export const useMockDataIfNeeded = () => {
  return isDevelopment && !apiUrl;
};

// 목 데이터 반환 함수들
export const getMockRooms = () => Promise.resolve(SheetsAPI.mockData.rooms);
export const getMockClasses = () => Promise.resolve(SheetsAPI.mockData.classes);
export const getMockReservations = () => Promise.resolve(SheetsAPI.mockData.reservations); 
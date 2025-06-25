import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
}

export function formatTime(time: string): string {
  return time.slice(0, 5); // HH:MM format
}

export function getPeriodLabel(period: string): string {
  const periodMap: Record<string, string> = {
    '1': '1교시 (09:00-09:40)',
    '2': '2교시 (09:50-10:30)',
    '3': '3교시 (10:40-11:20)',
    '4': '4교시 (11:30-12:10)',
    '5': '5교시 (13:30-14:10)',
    '6': '6교시 (14:20-15:00)',
  };
  return periodMap[period] || `${period}교시`;
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWeekRange(date: Date = new Date()): { start: string; end: string } {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Monday
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
  
  return {
    start: startOfWeek.toISOString().split('T')[0],
    end: endOfWeek.toISOString().split('T')[0]
  };
}

export function getRoomStatusColor(roomId: number, reservations: any[]): string {
  const today = getToday();
  const currentHour = new Date().getHours();
  
  // Check if room has current reservation
  const hasCurrentReservation = reservations.some(r => 
    r.roomId === roomId && 
    r.date === today &&
    r.periods?.some((p: string) => {
      const periodHour = getPeriodHour(p);
      return currentHour >= periodHour && currentHour < periodHour + 1;
    })
  );
  
  return hasCurrentReservation ? 'occupied' : 'available';
}

function getPeriodHour(period: string): number {
  const periodHours: Record<string, number> = {
    '1': 9,
    '2': 10,
    '3': 11,
    '4': 12,
    '5': 13,
    '6': 14,
  };
  return periodHours[period] || 9;
}

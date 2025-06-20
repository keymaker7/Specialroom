// 기존 계획된 시간대별 학급/학년 이용 시간표
export interface ScheduledUsage {
  room: string;
  timeSlot: string;
  day: string;
  grades: string[];
}

export const PLANNED_SCHEDULE: ScheduledUsage[] = [
  // 놀이활동실1 (1,2층이체육)
  { room: "놀이활동실1", timeSlot: "09:00-09:40", day: "월", grades: ["1학년"] },
  { room: "놀이활동실1", timeSlot: "09:00-09:40", day: "화", grades: ["5학년"] },
  { room: "놀이활동실1", timeSlot: "09:00-09:40", day: "수", grades: ["2학년"] },
  { room: "놀이활동실1", timeSlot: "09:00-09:40", day: "목", grades: ["유치원"] },
  
  { room: "놀이활동실1", timeSlot: "09:50-10:30", day: "월", grades: ["놀(2-1)"] },
  { room: "놀이활동실1", timeSlot: "09:50-10:30", day: "화", grades: ["놀(2-5)"] },
  { room: "놀이활동실1", timeSlot: "09:50-10:30", day: "수", grades: ["놀(1-1)"] },
  { room: "놀이활동실1", timeSlot: "09:50-10:30", day: "목", grades: ["놀(1-4)"] },
  { room: "놀이활동실1", timeSlot: "09:50-10:30", day: "금", grades: ["유치원"] },
  
  { room: "놀이활동실1", timeSlot: "10:40-11:20", day: "월", grades: ["놀(2-9)"] },
  { room: "놀이활동실1", timeSlot: "10:40-11:20", day: "화", grades: ["놀(2-6)"] },
  { room: "놀이활동실1", timeSlot: "10:40-11:20", day: "수", grades: ["놀(1-2)"] },
  { room: "놀이활동실1", timeSlot: "10:40-11:20", day: "목", grades: ["놀(1-5)"] },
  { room: "놀이활동실1", timeSlot: "10:40-11:20", day: "금", grades: ["특별돌봄"] },
  
  { room: "놀이활동실1", timeSlot: "11:30-12:10", day: "월", grades: ["놀(2-3)"] },
  { room: "놀이활동실1", timeSlot: "11:30-12:10", day: "화", grades: ["놀(2-7)"] },
  { room: "놀이활동실1", timeSlot: "11:30-12:10", day: "수", grades: ["놀(1-3)"] },
  { room: "놀이활동실1", timeSlot: "11:30-12:10", day: "목", grades: ["놀(1-6)"] },
  { room: "놀이활동실1", timeSlot: "11:30-12:10", day: "금", grades: ["특별돌봄"] },
  
  { room: "놀이활동실1", timeSlot: "12:10-13:00", day: "수", grades: ["5학년"] },
  { room: "놀이활동실1", timeSlot: "12:10-13:00", day: "목", grades: ["5학년"] },
  { room: "놀이활동실1", timeSlot: "12:10-13:00", day: "금", grades: ["3학년"] },
  
  { room: "놀이활동실1", timeSlot: "13:00-13:40", day: "월", grades: ["놀(2-4)"] },
  { room: "놀이활동실1", timeSlot: "13:00-13:40", day: "화", grades: ["놀(2-8)"] },
  { room: "놀이활동실1", timeSlot: "13:00-13:40", day: "수", grades: ["늘봄"] },
  { room: "놀이활동실1", timeSlot: "13:00-13:40", day: "목", grades: ["5학년"] },
  { room: "놀이활동실1", timeSlot: "13:00-13:40", day: "금", grades: ["늘봄"] },
  
  { room: "놀이활동실1", timeSlot: "13:50-14:30", day: "월", grades: ["늘봄"] },
  { room: "놀이활동실1", timeSlot: "13:50-14:30", day: "화", grades: ["늘봄"] },
  { room: "놀이활동실1", timeSlot: "13:50-14:30", day: "수", grades: ["늘봄"] },
  { room: "놀이활동실1", timeSlot: "13:50-14:30", day: "목", grades: ["늘봄"] },
  { room: "놀이활동실1", timeSlot: "13:50-14:30", day: "금", grades: ["늘봄"] },

  // 놀이활동실2
  { room: "놀이활동실2", timeSlot: "09:00-09:40", day: "월", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "09:00-09:40", day: "화", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "09:00-09:40", day: "수", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "09:00-09:40", day: "목", grades: ["5학년"] },
  { room: "놀이활동실2", timeSlot: "09:00-09:40", day: "금", grades: ["4학년"] },
  
  { room: "놀이활동실2", timeSlot: "09:50-10:30", day: "월", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "09:50-10:30", day: "화", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "09:50-10:30", day: "수", grades: ["5학년"] },
  { room: "놀이활동실2", timeSlot: "09:50-10:30", day: "목", grades: ["5학년"] },
  { room: "놀이활동실2", timeSlot: "09:50-10:30", day: "금", grades: ["4학년"] },
  
  { room: "놀이활동실2", timeSlot: "10:40-11:20", day: "월", grades: ["3학년"] },
  { room: "놀이활동실2", timeSlot: "10:40-11:20", day: "화", grades: ["3학년"] },
  { room: "놀이활동실2", timeSlot: "10:40-11:20", day: "수", grades: ["3학년"] },
  { room: "놀이활동실2", timeSlot: "10:40-11:20", day: "목", grades: ["4학년"] },
  { room: "놀이활동실2", timeSlot: "10:40-11:20", day: "금", grades: ["4학년"] },
  
  { room: "놀이활동실2", timeSlot: "11:30-12:10", day: "월", grades: ["3학년"] },
  { room: "놀이활동실2", timeSlot: "11:30-12:10", day: "화", grades: ["3학년"] },
  { room: "놀이활동실2", timeSlot: "11:30-12:10", day: "수", grades: ["4학년"] },
  { room: "놀이활동실2", timeSlot: "11:30-12:10", day: "목", grades: ["4학년"] },
  { room: "놀이활동실2", timeSlot: "11:30-12:10", day: "금", grades: ["4학년"] },
  
  { room: "놀이활동실2", timeSlot: "12:10-13:00", day: "월", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "12:10-13:00", day: "화", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "12:10-13:00", day: "수", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "12:10-13:00", day: "목", grades: ["4학년"] },
  { room: "놀이활동실2", timeSlot: "12:10-13:00", day: "금", grades: ["5학년"] },
  
  { room: "놀이활동실2", timeSlot: "13:00-13:40", day: "월", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "13:00-13:40", day: "화", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "13:00-13:40", day: "수", grades: ["5학년"] },
  { room: "놀이활동실2", timeSlot: "13:00-13:40", day: "목", grades: ["5학년"] },
  { room: "놀이활동실2", timeSlot: "13:00-13:40", day: "금", grades: ["5학년"] },
  
  { room: "놀이활동실2", timeSlot: "13:50-14:30", day: "화", grades: ["3학년"] },

  // 운동장
  { room: "운동장", timeSlot: "09:00-09:40", day: "월", grades: ["4학년"] },
  { room: "운동장", timeSlot: "09:00-09:40", day: "화", grades: ["4학년"] },
  { room: "운동장", timeSlot: "09:00-09:40", day: "수", grades: ["3학년"] },
  { room: "운동장", timeSlot: "09:00-09:40", day: "목", grades: ["3학년"] },
  { room: "운동장", timeSlot: "09:00-09:40", day: "금", grades: ["3학년"] },
  
  { room: "운동장", timeSlot: "09:50-10:30", day: "월", grades: ["4학년"] },
  { room: "운동장", timeSlot: "09:50-10:30", day: "화", grades: ["4학년"] },
  { room: "운동장", timeSlot: "09:50-10:30", day: "수", grades: ["4학년"] },
  { room: "운동장", timeSlot: "09:50-10:30", day: "목", grades: ["3학년"] },
  { room: "운동장", timeSlot: "09:50-10:30", day: "금", grades: ["3학년"] },
  
  { room: "운동장", timeSlot: "10:40-11:20", day: "월", grades: ["2학년"] },
  { room: "운동장", timeSlot: "10:40-11:20", day: "화", grades: ["2학년"] },
  { room: "운동장", timeSlot: "10:40-11:20", day: "수", grades: ["2학년"] },
  { room: "운동장", timeSlot: "10:40-11:20", day: "목", grades: ["2학년"] },
  { room: "운동장", timeSlot: "10:40-11:20", day: "금", grades: ["2학년"] },
  
  { room: "운동장", timeSlot: "11:30-12:10", day: "월", grades: ["1학년"] },
  { room: "운동장", timeSlot: "11:30-12:10", day: "화", grades: ["1학년"] },
  { room: "운동장", timeSlot: "11:30-12:10", day: "수", grades: ["1학년"] },
  { room: "운동장", timeSlot: "11:30-12:10", day: "목", grades: ["1학년"] },
  { room: "운동장", timeSlot: "11:30-12:10", day: "금", grades: ["1학년"] },
  
  { room: "운동장", timeSlot: "12:10-13:00", day: "월", grades: ["6학년"] },
  { room: "운동장", timeSlot: "12:10-13:00", day: "화", grades: ["6학년"] },
  { room: "운동장", timeSlot: "12:10-13:00", day: "수", grades: ["5학년"] },
  { room: "운동장", timeSlot: "12:10-13:00", day: "목", grades: ["5학년"] },
  { room: "운동장", timeSlot: "12:10-13:00", day: "금", grades: ["5학년"] },
  
  { room: "운동장", timeSlot: "13:00-13:40", day: "월", grades: ["6학년"] },
  { room: "운동장", timeSlot: "13:00-13:40", day: "화", grades: ["6학년"] },
  { room: "운동장", timeSlot: "13:00-13:40", day: "수", grades: ["6학년"] },
  { room: "운동장", timeSlot: "13:00-13:40", day: "목", grades: ["5학년"] },
  { room: "운동장", timeSlot: "13:00-13:40", day: "금", grades: ["5학년"] },
  
  { room: "운동장", timeSlot: "13:50-14:30", day: "월", grades: ["6학년"] },
  { room: "운동장", timeSlot: "13:50-14:30", day: "화", grades: ["6학년"] },
  { room: "운동장", timeSlot: "13:50-14:30", day: "목", grades: ["5학년"] },
  { room: "운동장", timeSlot: "13:50-14:30", day: "금", grades: ["5학년"] },

  // 풋살장
  { room: "풋살장", timeSlot: "09:00-09:40", day: "월", grades: ["4학년"] },
  { room: "풋살장", timeSlot: "09:00-09:40", day: "화", grades: ["4학년"] },
  { room: "풋살장", timeSlot: "09:00-09:40", day: "수", grades: ["특별돌봄"] },
  { room: "풋살장", timeSlot: "09:00-09:40", day: "목", grades: ["3학년"] },
  { room: "풋살장", timeSlot: "09:00-09:40", day: "금", grades: ["유치원"] },
  
  { room: "풋살장", timeSlot: "09:50-10:30", day: "월", grades: ["4학년"] },
  { room: "풋살장", timeSlot: "09:50-10:30", day: "화", grades: ["4학년"] },
  { room: "풋살장", timeSlot: "09:50-10:30", day: "수", grades: ["3학년"] },
  { room: "풋살장", timeSlot: "09:50-10:30", day: "목", grades: ["3학년"] },
  { room: "풋살장", timeSlot: "09:50-10:30", day: "금", grades: ["2학년"] },
  
  { room: "풋살장", timeSlot: "10:40-11:20", day: "월", grades: ["2학년"] },
  { room: "풋살장", timeSlot: "10:40-11:20", day: "화", grades: ["2학년"] },
  { room: "풋살장", timeSlot: "10:40-11:20", day: "수", grades: ["3학년"] },
  { room: "풋살장", timeSlot: "10:40-11:20", day: "목", grades: ["2학년"] },
  { room: "풋살장", timeSlot: "10:40-11:20", day: "금", grades: ["2학년"] },
  
  { room: "풋살장", timeSlot: "11:30-12:10", day: "월", grades: ["1학년"] },
  { room: "풋살장", timeSlot: "11:30-12:10", day: "화", grades: ["1학년"] },
  { room: "풋살장", timeSlot: "11:30-12:10", day: "수", grades: ["1학년"] },
  { room: "풋살장", timeSlot: "11:30-12:10", day: "목", grades: ["1학년"] },
  { room: "풋살장", timeSlot: "11:30-12:10", day: "금", grades: ["1학년"] },
  
  { room: "풋살장", timeSlot: "12:10-13:00", day: "월", grades: ["6학년"] },
  { room: "풋살장", timeSlot: "12:10-13:00", day: "화", grades: ["6학년"] },
  { room: "풋살장", timeSlot: "12:10-13:00", day: "수", grades: ["5학년"] },
  { room: "풋살장", timeSlot: "12:10-13:00", day: "목", grades: ["6학년"] },
  { room: "풋살장", timeSlot: "12:10-13:00", day: "금", grades: ["5학년"] },
  
  { room: "풋살장", timeSlot: "13:00-13:40", day: "월", grades: ["6학년"] },
  { room: "풋살장", timeSlot: "13:00-13:40", day: "화", grades: ["6학년"] },
  { room: "풋살장", timeSlot: "13:00-13:40", day: "수", grades: ["5학년"] },
  { room: "풋살장", timeSlot: "13:00-13:40", day: "목", grades: ["5학년"] },
  { room: "풋살장", timeSlot: "13:00-13:40", day: "금", grades: ["5학년"] },
  
  { room: "풋살장", timeSlot: "13:50-14:30", day: "월", grades: ["6학년"] },
  { room: "풋살장", timeSlot: "13:50-14:30", day: "화", grades: ["아우름"] },
  { room: "풋살장", timeSlot: "13:50-14:30", day: "수", grades: ["아우름"] },
  { room: "풋살장", timeSlot: "13:50-14:30", day: "목", grades: ["아우름"] },
  { room: "풋살장", timeSlot: "13:50-14:30", day: "금", grades: ["5학년"] },
];

export function getPlannedUsageForTimeSlot(room: string, date: string, timeSlot: string): string[] {
  const day = getDayOfWeek(date);
  const usage = PLANNED_SCHEDULE.find(
    s => s.room === room && s.day === day && s.timeSlot === timeSlot
  );
  return usage ? usage.grades : [];
}

export function getDayOfWeek(date: string): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayIndex = new Date(date).getDay();
  return days[dayIndex];
}

export function getTimeSlotFromPeriod(period: string, grade: number): string {
  // Convert period number and grade to actual time slot
  const periodTimes: Record<string, string> = {
    '1': '09:00-09:40',
    '2': '09:50-10:30',
    '3': '10:40-11:20',
    '4': '11:30-12:10',
    '5': '12:10-13:00',
    '6': '13:00-13:40',
    '7': '13:50-14:30',
  };
  
  return periodTimes[period] || '';
}
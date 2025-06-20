// 기존 계획된 시간대별 학급/학년 이용 시간표
export interface ScheduledUsage {
  room: string;
  timeSlot: string;
  day: string;
  grades: string[];
}

export const PLANNED_SCHEDULE: ScheduledUsage[] = [
  // 체육관 (1,2,3,4학년)
  { room: "강당", timeSlot: "09:00-09:40", day: "월", grades: ["체(4-5)", "체(5-1)"] },
  { room: "강당", timeSlot: "09:00-09:40", day: "화", grades: ["체(4-10)", "체(5-6)"] },
  { room: "강당", timeSlot: "09:00-09:40", day: "수", grades: ["체(3-7)", "체(6-1)"] },
  { room: "강당", timeSlot: "09:00-09:40", day: "목", grades: ["체(3-2)", "체(6-6)"] },
  
  { room: "강당", timeSlot: "09:50-10:30", day: "월", grades: ["체(4-6)", "체(5-2)"] },
  { room: "강당", timeSlot: "09:50-10:30", day: "화", grades: ["체(4-11)", "체(5-7)"] },
  { room: "강당", timeSlot: "09:50-10:30", day: "수", grades: ["체(3-6)", "체(6-2)"] },
  { room: "강당", timeSlot: "09:50-10:30", day: "목", grades: ["체(3-1)", "체(6-7)"] },
  
  { room: "강당", timeSlot: "10:40-11:20", day: "월", grades: ["체(4-7)", "체(5-5)"] },
  { room: "강당", timeSlot: "10:40-11:20", day: "화", grades: ["체(4-1)", "체(5-9)"] },
  { room: "강당", timeSlot: "10:40-11:20", day: "수", grades: ["체(3-5)", "체(6-3)"] },
  { room: "강당", timeSlot: "10:40-11:20", day: "목", grades: ["체(4-1)", "체(4-7)"] },
  { room: "강당", timeSlot: "10:40-11:20", day: "금", grades: ["체(4-6)"] },
  
  { room: "강당", timeSlot: "11:30-12:10", day: "월", grades: ["체(4-8)"] },
  { room: "강당", timeSlot: "11:30-12:10", day: "화", grades: ["체(4-2)"] },
  { room: "강당", timeSlot: "11:30-12:10", day: "수", grades: ["체(3-8)"] },
  { room: "강당", timeSlot: "11:30-12:10", day: "목", grades: ["체(3-4)", "체(3-8)"] },
  { room: "강당", timeSlot: "11:30-12:10", day: "금", grades: ["체(3-3)"] },
  
  { room: "강당", timeSlot: "12:20-13:00", day: "월", grades: ["체(4-9)"] },
  { room: "강당", timeSlot: "12:20-13:00", day: "화", grades: ["체(4-3)"] },
  { room: "강당", timeSlot: "12:20-13:00", day: "수", grades: ["체(3-9)"] },
  { room: "강당", timeSlot: "12:20-13:00", day: "목", grades: ["체(4-3)", "체(4-5)"] },
  { room: "강당", timeSlot: "12:20-13:00", day: "금", grades: ["체(3-4)"] },
  
  { room: "강당", timeSlot: "12:10-12:50", day: "월", grades: ["체(5-4)"] },
  { room: "강당", timeSlot: "12:10-12:50", day: "화", grades: ["체(5-8)"] },
  { room: "강당", timeSlot: "12:10-12:50", day: "수", grades: ["체(6-4)"] },
  { room: "강당", timeSlot: "12:10-12:50", day: "금", grades: ["체(6-9)"] },
  
  { room: "강당", timeSlot: "13:00-13:40", day: "월", grades: ["체(5-3)"] },
  { room: "강당", timeSlot: "13:00-13:40", day: "화", grades: ["체(5-10)"] },
  { room: "강당", timeSlot: "13:00-13:40", day: "수", grades: ["체(6-5)", "체(6-8)"] },
  { room: "강당", timeSlot: "13:00-13:40", day: "금", grades: ["체(6-10)"] },
  
  { room: "강당", timeSlot: "13:50-14:30", day: "월", grades: ["체(5-4)"] },
  { room: "강당", timeSlot: "13:50-14:30", day: "화", grades: ["체(5-8)", "체(6-4)"] },
  { room: "강당", timeSlot: "13:50-14:30", day: "수", grades: ["체(6-9)"] },

  // 놀이활동실1 (1,2층이체육)
  { room: "놀이활동실1", timeSlot: "09:00-09:40", day: "월", grades: ["1학년"] },
  { room: "놀이활동실1", timeSlot: "09:00-09:40", day: "화", grades: ["5학년"] },
  { room: "놀이활동실1", timeSlot: "09:00-09:40", day: "수", grades: ["2학년"] },
  { room: "놀이활동실1", timeSlot: "09:00-09:40", day: "목", grades: ["유치원"] },
  
  { room: "놀이활동실1", timeSlot: "09:50-10:29", day: "월", grades: ["놀(2-1)"] },
  { room: "놀이활동실1", timeSlot: "09:50-10:29", day: "화", grades: ["놀(2-5)"] },
  { room: "놀이활동실1", timeSlot: "09:50-10:29", day: "수", grades: ["놀(1-1)"] },
  { room: "놀이활동실1", timeSlot: "09:50-10:29", day: "목", grades: ["놀(1-4)"] },
  { room: "놀이활동실1", timeSlot: "09:50-10:29", day: "금", grades: ["유치원"] },
  
  { room: "놀이활동실1", timeSlot: "10:40-11:19", day: "월", grades: ["놀(2-2)"] },
  { room: "놀이활동실1", timeSlot: "10:40-11:19", day: "화", grades: ["놀(2-6)"] },
  { room: "놀이활동실1", timeSlot: "10:40-11:19", day: "수", grades: ["놀(1-2)"] },
  { room: "놀이활동실1", timeSlot: "10:40-11:19", day: "목", grades: ["놀(1-5)"] },
  { room: "놀이활동실1", timeSlot: "10:40-11:19", day: "금", grades: ["복합특수"] },
  
  { room: "놀이활동실1", timeSlot: "11:30-12:09", day: "월", grades: ["놀(2-3)"] },
  { room: "놀이활동실1", timeSlot: "11:30-12:09", day: "화", grades: ["놀(2-7)"] },
  { room: "놀이활동실1", timeSlot: "11:30-12:09", day: "수", grades: ["놀(1-3)"] },
  { room: "놀이활동실1", timeSlot: "11:30-12:09", day: "목", grades: ["놀(1-6)"] },
  { room: "놀이활동실1", timeSlot: "11:30-12:09", day: "금", grades: ["복합특수"] },
  
  { room: "놀이활동실1", timeSlot: "12:10-12:49", day: "수", grades: ["5학년"] },
  { room: "놀이활동실1", timeSlot: "12:10-12:49", day: "목", grades: ["5학년"] },
  
  { room: "놀이활동실1", timeSlot: "12:20-12:59", day: "금", grades: ["3학년"] },
  
  { room: "놀이활동실1", timeSlot: "13:00-13:39", day: "월", grades: ["놀(2-4)"] },
  { room: "놀이활동실1", timeSlot: "13:00-13:39", day: "화", grades: ["놀(2-8)"] },
  { room: "놀이활동실1", timeSlot: "13:00-13:39", day: "수", grades: ["늘봄"] },
  { room: "놀이활동실1", timeSlot: "13:00-13:39", day: "목", grades: ["5학년"] },
  { room: "놀이활동실1", timeSlot: "13:00-13:39", day: "금", grades: ["늘봄"] },
  
  { room: "놀이활동실1", timeSlot: "13:50-14:29", day: "월", grades: ["늘봄"] },
  { room: "놀이활동실1", timeSlot: "13:50-14:29", day: "화", grades: ["늘봄"] },
  { room: "놀이활동실1", timeSlot: "13:50-14:29", day: "수", grades: ["늘봄"] },
  { room: "놀이활동실1", timeSlot: "13:50-14:29", day: "목", grades: ["늘봄"] },
  { room: "놀이활동실1", timeSlot: "13:50-14:29", day: "금", grades: ["늘봄"] },

  // 놀이활동실2
  { room: "놀이활동실2", timeSlot: "09:00-09:40", day: "월", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "09:00-09:40", day: "화", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "09:00-09:40", day: "수", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "09:00-09:40", day: "목", grades: ["5학년"] },
  { room: "놀이활동실2", timeSlot: "09:00-09:40", day: "금", grades: ["4학년"] },
  
  { room: "놀이활동실2", timeSlot: "09:50-10:29", day: "월", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "09:50-10:29", day: "화", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "09:50-10:29", day: "수", grades: ["5학년"] },
  { room: "놀이활동실2", timeSlot: "09:50-10:29", day: "목", grades: ["5학년"] },
  { room: "놀이활동실2", timeSlot: "09:50-10:29", day: "금", grades: ["4학년"] },
  
  { room: "놀이활동실2", timeSlot: "10:40-11:19", day: "월", grades: ["3학년"] },
  { room: "놀이활동실2", timeSlot: "10:40-11:19", day: "화", grades: ["3학년"] },
  { room: "놀이활동실2", timeSlot: "10:40-11:19", day: "수", grades: ["3학년"] },
  { room: "놀이활동실2", timeSlot: "10:40-11:19", day: "목", grades: ["4학년"] },
  { room: "놀이활동실2", timeSlot: "10:40-11:19", day: "금", grades: ["4학년"] },
  
  { room: "놀이활동실2", timeSlot: "11:30-12:09", day: "월", grades: ["3학년"] },
  { room: "놀이활동실2", timeSlot: "11:30-12:09", day: "화", grades: ["3학년"] },
  { room: "놀이활동실2", timeSlot: "11:30-12:09", day: "수", grades: ["4학년"] },
  { room: "놀이활동실2", timeSlot: "11:30-12:09", day: "목", grades: ["4학년"] },
  { room: "놀이활동실2", timeSlot: "11:30-12:09", day: "금", grades: ["4학년"] },
  
  { room: "놀이활동실2", timeSlot: "12:10-12:49", day: "월", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "12:10-12:49", day: "화", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "12:10-12:49", day: "수", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "12:10-12:49", day: "금", grades: ["5학년"] },
  
  { room: "놀이활동실2", timeSlot: "12:20-12:59", day: "목", grades: ["4학년"] },
  
  { room: "놀이활동실2", timeSlot: "13:00-13:39", day: "월", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "13:00-13:39", day: "화", grades: ["6학년"] },
  { room: "놀이활동실2", timeSlot: "13:00-13:39", day: "수", grades: ["5학년"] },
  { room: "놀이활동실2", timeSlot: "13:00-13:39", day: "목", grades: ["5학년"] },
  { room: "놀이활동실2", timeSlot: "13:00-13:39", day: "금", grades: ["5학년"] },
  
  { room: "놀이활동실2", timeSlot: "13:50-14:29", day: "목", grades: ["3학년"] },

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
  { room: "풋살장", timeSlot: "09:00-09:40", day: "수", grades: ["복합특수"] },
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
  { room: "풋살장", timeSlot: "13:50-14:30", day: "화", grades: ["와우중"] },
  { room: "풋살장", timeSlot: "13:50-14:30", day: "수", grades: ["와우중"] },
  { room: "풋살장", timeSlot: "13:50-14:30", day: "목", grades: ["와우중"] },
  { room: "풋살장", timeSlot: "13:50-14:30", day: "금", grades: ["5학년"] },

  // 제 1 컴퓨터실 (학년별 사전 조정 후 사용)
  { room: "제 1 컴퓨터실", timeSlot: "09:00-09:40", day: "월", grades: ["1학년 (사전 조정 필요)"] },
  { room: "제 1 컴퓨터실", timeSlot: "09:00-09:40", day: "화", grades: ["1학년 (사전 조정 필요)"] },
  { room: "제 1 컴퓨터실", timeSlot: "09:00-09:40", day: "수", grades: ["1학년 (사전 조정 필요)"] },
  { room: "제 1 컴퓨터실", timeSlot: "09:00-09:40", day: "목", grades: ["1학년 (사전 조정 필요)"] },
  { room: "제 1 컴퓨터실", timeSlot: "09:00-09:40", day: "금", grades: ["1학년 (사전 조정 필요)"] },

  // 제 2 컴퓨터실 (학년별 사전 조정 후 사용)
  { room: "제 2 컴퓨터실", timeSlot: "09:00-09:40", day: "월", grades: ["2학년 (사전 조정 필요)"] },
  { room: "제 2 컴퓨터실", timeSlot: "09:00-09:40", day: "화", grades: ["2학년 (사전 조정 필요)"] },
  { room: "제 2 컴퓨터실", timeSlot: "09:00-09:40", day: "수", grades: ["2학년 (사전 조정 필요)"] },
  { room: "제 2 컴퓨터실", timeSlot: "09:00-09:40", day: "목", grades: ["2학년 (사전 조정 필요)"] },
  { room: "제 2 컴퓨터실", timeSlot: "09:00-09:40", day: "금", grades: ["2학년 (사전 조정 필요)"] }
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
  // Convert period number and grade to actual time slot based on grade-specific schedules
  
  // 1-2학년 시간표
  if (grade <= 2) {
    const periodTimes: Record<string, string> = {
      '1': '09:00-09:40',
      '2': '09:50-10:30',
      '3': '10:40-11:20',
      '4': '11:30-12:10',
      '5': '13:00-13:40'
    };
    return periodTimes[period] || '';
  }
  
  // 3-4학년 시간표
  if (grade <= 4) {
    const periodTimes: Record<string, string> = {
      '1': '09:00-09:40',
      '2': '09:50-10:30',
      '3': '10:40-11:20',
      '4': '11:30-12:10',
      '5': '12:20-13:00',
      '6': '13:50-14:30'
    };
    return periodTimes[period] || '';
  }
  
  // 5-6학년 시간표
  const periodTimes: Record<string, string> = {
    '1': '09:00-09:40',
    '2': '09:50-10:30',
    '3': '10:40-11:20',
    '4': '12:10-12:50',
    '5': '13:00-13:40',
    '6': '13:50-14:30'
  };
  
  return periodTimes[period] || '';
}

// Check if two time slots actually overlap (not just adjacent)
export function doTimeSlotsOverlap(timeSlot1: string, timeSlot2: string): boolean {
  const [start1, end1] = timeSlot1.split('-');
  const [start2, end2] = timeSlot2.split('-');
  
  // Convert time strings to minutes for easier comparison
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);
  
  // Check for actual overlap (not just adjacent)
  // Adjacent times (end1 == start2 or end2 == start1) are NOT considered overlapping
  return start1Min < end2Min && start2Min < end1Min;
}
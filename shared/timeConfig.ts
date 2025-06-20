// Grade-specific time schedules based on the school timetable
export interface PeriodTime {
  start: string;
  end: string;
  isBreak?: boolean;
  label?: string;
}

export interface GradeSchedule {
  grade: number;
  periods: Record<string, PeriodTime>;
}

// Default schedules for each grade group based on the timetable image
export const DEFAULT_GRADE_SCHEDULES: GradeSchedule[] = [
  {
    grade: 1, // 1-2학년
    periods: {
      "1": { start: "09:00", end: "09:40", label: "1교시" },
      "break1": { start: "09:40", end: "09:50", isBreak: true, label: "쉬는시간" },
      "2": { start: "09:50", end: "10:29", label: "2교시" },
      "break2": { start: "10:30", end: "10:40", isBreak: true, label: "쉬는시간" },
      "3": { start: "10:40", end: "11:19", label: "3교시" },
      "break3": { start: "11:20", end: "11:30", isBreak: true, label: "쉬는시간" },
      "4": { start: "11:30", end: "12:09", label: "4교시" },
      "lunch": { start: "12:10", end: "13:00", isBreak: true, label: "점심시간" },
      "5": { start: "13:00", end: "13:39", label: "5교시" }
    }
  },
  {
    grade: 3, // 3-4학년
    periods: {
      "1": { start: "09:00", end: "09:40", label: "1교시" },
      "break1": { start: "09:40", end: "09:50", isBreak: true, label: "쉬는시간" },
      "2": { start: "09:50", end: "10:29", label: "2교시" },
      "break2": { start: "10:30", end: "10:40", isBreak: true, label: "쉬는시간" },
      "3": { start: "10:40", end: "11:19", label: "3교시" },
      "break3": { start: "11:20", end: "11:30", isBreak: true, label: "쉬는시간" },
      "4": { start: "11:30", end: "12:09", label: "4교시" },
      "break4": { start: "12:10", end: "12:20", isBreak: true, label: "쉬는시간" },
      "5": { start: "12:20", end: "12:59", label: "5교시" },
      "lunch": { start: "13:00", end: "13:50", isBreak: true, label: "점심시간" },
      "6": { start: "13:50", end: "14:29", label: "6교시" }
    }
  },
  {
    grade: 5, // 5-6학년
    periods: {
      "1": { start: "09:00", end: "09:40", label: "1교시" },
      "break1": { start: "09:40", end: "09:50", isBreak: true, label: "쉬는시간" },
      "2": { start: "09:50", end: "10:29", label: "2교시" },
      "break2": { start: "10:30", end: "10:40", isBreak: true, label: "쉬는시간" },
      "3": { start: "10:40", end: "11:19", label: "3교시" },
      "lunch": { start: "11:20", end: "12:10", isBreak: true, label: "점심시간" },
      "4": { start: "12:10", end: "12:49", label: "4교시" },
      "break4": { start: "12:50", end: "13:00", isBreak: true, label: "쉬는시간" },
      "5": { start: "13:00", end: "13:39", label: "5교시" },
      "break5": { start: "13:40", end: "13:50", isBreak: true, label: "쉬는시간" },
      "6": { start: "13:50", end: "14:29", label: "6교시" }
    }
  }
];

export function getGradeSchedule(grade: number): GradeSchedule {
  if (grade <= 2) return DEFAULT_GRADE_SCHEDULES[0];
  if (grade <= 4) return DEFAULT_GRADE_SCHEDULES[1];
  return DEFAULT_GRADE_SCHEDULES[2];
}

export function getPeriodTime(grade: number, period: string): PeriodTime | null {
  const schedule = getGradeSchedule(grade);
  return schedule.periods[period] || null;
}

export function getAvailablePeriods(grade: number): string[] {
  const schedule = getGradeSchedule(grade);
  return Object.keys(schedule.periods).filter(key => !schedule.periods[key].isBreak);
}

export function formatPeriodLabel(period: string, grade: number): string {
  const periodTime = getPeriodTime(grade, period);
  if (!periodTime) return `${period}교시`;
  return `${period}교시 (${periodTime.start}-${periodTime.end})`;
}
// 특별실별 이용 안내 및 주의사항
export interface RoomGuideline {
  roomName: string;
  description: string;
  usageNotes: string[];
  conflictWarnings: string[];
  recommendedGrades?: number[];
}

export const ROOM_GUIDELINES: RoomGuideline[] = [

  {
    roomName: "표현무용실",
    description: "3,4학년 체육 수업 전용",
    usageNotes: [
      "3,4학년 체육 수업 전용 공간",
      "표현 및 무용 활동에 최적화"
    ],
    conflictWarnings: [
      "3,4학년 정규 체육 시간과 중복 불가",
      "방과후 수업 시간 확인 필요"
    ],
    recommendedGrades: [3, 4]
  },
  {
    roomName: "놀이활동실1",
    description: "1,2학년 놀이체육 전용",
    usageNotes: [
      "1,2학년 놀이체육 전용",
      "유치원 및 복합특수 학급 이용",
      "늘봄 프로그램 운영"
    ],
    conflictWarnings: [
      "1,2학년 정규 놀이체육 시간 확인",
      "유치원 및 복합특수 시간 피해야 함",
      "늘봄 프로그램과 중복 불가"
    ],
    recommendedGrades: [1, 2]
  },
  {
    roomName: "놀이활동실2",
    description: "3-6학년 활동 및 특별 프로그램",
    usageNotes: [
      "3-6학년 다양한 활동 공간",
      "학년별 시간대 배정됨"
    ],
    conflictWarnings: [
      "학년별 정규 이용 시간 확인",
      "기존 배정 시간과 중복 불가"
    ],
    recommendedGrades: [3, 4, 5, 6]
  },
  {
    roomName: "운동장",
    description: "야외 체육 활동 및 놀이",
    usageNotes: [
      "학년별 이용 시간 배정",
      "날씨에 따른 사용 제한"
    ],
    conflictWarnings: [
      "학년별 정규 이용 시간 확인",
      "우천 시 실내 대체 공간 필요"
    ],
    recommendedGrades: [1, 2, 3, 4, 5, 6]
  },
  {
    roomName: "풋살장",
    description: "축구 및 구기 활동",
    usageNotes: [
      "학년별 이용 시간 배정",
      "와우중학교 이용 시간 있음",
      "복합특수 학급 이용"
    ],
    conflictWarnings: [
      "와우중학교 이용 시간 피해야 함",
      "복합특수 시간 확인 필요",
      "학년별 정규 시간과 중복 불가"
    ],
    recommendedGrades: [1, 2, 3, 4, 5, 6]
  },
  {
    roomName: "제1컴퓨터실",
    description: "1학년 컴퓨터 수업 전용",
    usageNotes: [
      "1학년 전용 컴퓨터실",
      "학년별 사전 조정 후 사용",
      "방과후 수업 운영"
    ],
    conflictWarnings: [
      "1학년 정규 컴퓨터 수업과 중복 불가",
      "방과후 수업 시간 확인"
    ],
    recommendedGrades: [1]
  },
  {
    roomName: "제2컴퓨터실",
    description: "2학년 컴퓨터 수업 및 연수",
    usageNotes: [
      "2학년 전용 컴퓨터실",
      "소프트웨어 연수 및 학생동아리 활동",
      "학년별 사전 조정 후 사용"
    ],
    conflictWarnings: [
      "2학년 정규 컴퓨터 수업과 중복 불가",
      "소프트웨어 연수 일정 확인"
    ],
    recommendedGrades: [2]
  },
  {
    roomName: "컴퓨터실",
    description: "일반 컴퓨터 활동실",
    usageNotes: [
      "다목적 컴퓨터 활동 공간",
      "사전 예약 필수"
    ],
    conflictWarnings: [
      "기존 예약과 중복 확인"
    ],
    recommendedGrades: [1, 2, 3, 4, 5, 6]
  },
  {
    roomName: "야외정원(4층)",
    description: "야외 활동 및 휴식 공간",
    usageNotes: [
      "4층 야외 공간",
      "날씨 조건 확인 필요",
      "안전 수칙 준수 필수"
    ],
    conflictWarnings: [
      "우천 시 사용 불가",
      "안전 관리자 동행 권장"
    ],
    recommendedGrades: [1, 2, 3, 4, 5, 6]
  },
  {
    roomName: "시청각실",
    description: "영상 시청 및 발표 활동",
    usageNotes: [
      "프로젝터 및 음향 시설 완비",
      "좌석 수 제한 있음",
      "사전 장비 점검 권장"
    ],
    conflictWarnings: [
      "장비 사용법 숙지 필요",
      "정원 초과 시 사용 제한"
    ],
    recommendedGrades: [1, 2, 3, 4, 5, 6]
  }
];

export function getRoomGuideline(roomName: string): RoomGuideline | undefined {
  return ROOM_GUIDELINES.find(g => g.roomName === roomName);
}

export function getConflictWarnings(roomName: string, grade: number): string[] {
  const guideline = getRoomGuideline(roomName);
  if (!guideline) return [];
  
  const warnings = [...guideline.conflictWarnings];
  
  if (guideline.recommendedGrades && !guideline.recommendedGrades.includes(grade)) {
    warnings.push(`이 특별실은 주로 ${guideline.recommendedGrades.join(', ')}학년에서 사용합니다.`);
  }
  
  return warnings;
}

export function getRoomUsageNotes(roomName: string): string[] {
  const guideline = getRoomGuideline(roomName);
  return guideline?.usageNotes || [];
}
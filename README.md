# 효행초등학교 특별실 예약 관리 시스템

## 프로젝트 개요
효행초등학교를 위한 포괄적인 특별실 예약 관리 시스템입니다.

## 주요 기능
- 12개 특별실 예약 관리
- 학년별 6교시 스케줄링
- 실시간 충돌 감지
- 달력 뷰의 교시 표시
- 모바일 PWA 지원
- 한국어 인터페이스

## 기술 스택
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon-backed)
- **ORM**: Drizzle ORM
- **UI**: shadcn/ui + Tailwind CSS

## 설치 및 실행
```bash
npm install
npm run dev
```

## 데이터베이스 설정
```bash
npm run db:push
```

## 학급 구성
- 1학년: 6개반
- 2학년: 8개반
- 3학년: 9개반
- 4학년: 11개반
- 5학년: 10개반
- 6학년: 10개반
- **총 54개 학급**

## 특별실 목록
1. 강당
2. 풋살장
3. 놀이활동실1
4. 놀이활동실2
5. 표현무용실
6. 운동장
7. 제1컴퓨터실
8. 제2컴퓨터실
9. 야외정원(4층)
10. 시청각실

## 개발자
JongYoon Kim (keymaker7)
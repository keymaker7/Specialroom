# 무료 배포 가이드

## 🚀 추천 방법: Railway + Neon PostgreSQL

### 1단계: Neon PostgreSQL 데이터베이스 생성

1. [Neon](https://neon.tech/)에 가입
2. 새 프로젝트 생성
3. 데이터베이스 연결 문자열 복사 (postgres://...)

### 2단계: Railway 백엔드 배포

1. [Railway](https://railway.app/)에 가입
2. GitHub 저장소 연결
3. 환경 변수 설정:
   - `DATABASE_URL`: Neon에서 복사한 연결 문자열
   - `NODE_ENV`: production

4. 배포 완료 후 도메인 주소 복사

### 3단계: Vercel 프론트엔드 배포

1. [Vercel](https://vercel.com/)에 가입
2. GitHub 저장소 import
3. 빌드 설정:
   - Framework Preset: Vite
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. 환경 변수 설정:
   - `VITE_API_URL`: Railway에서 복사한 백엔드 도메인

### 4단계: 데이터베이스 초기화

Railway 앱이 배포된 후:
```bash
# 로컬에서 실행
npm run db:push
```

## 🔧 대안 방법들

### 옵션 2: Supabase + Vercel
- Supabase에서 PostgreSQL + 백엔드 API
- Vercel에서 프론트엔드만 배포

### 옵션 3: Render + Neon
- Render에서 백엔드 배포
- Neon PostgreSQL 사용

## 💡 무료 tier 제한사항

### Neon PostgreSQL (무료)
- 512MB 스토리지
- 1개 데이터베이스
- 활성화되지 않으면 일시 정지

### Railway (무료)
- 월 $5 크레딧
- 512MB RAM
- 1GB 디스크

### Vercel (무료)
- 100GB 대역폭/월
- 무제한 정적 사이트

## 🚨 주의사항
- 무료 서비스는 일정 시간 비활성 상태 시 슬립 모드로 전환
- 첫 접속 시 로딩 시간이 길 수 있음
- 프로덕션 사용 시 유료 플랜 고려 권장 
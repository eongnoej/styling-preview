# 🛍️ 스타일링 미리보기 앱

29cm 링크를 입력하면 의류 정보를 자동으로 추출하고, 카메라나 갤러리 사진에 의류를 가상으로 입혀서 실시간으로 스타일링을 미리볼 수 있는 웹앱입니다.

**주요 기능:**
- 🔗 29cm 자동 크롤링 (상품명, 가격, 이미지, 카테고리)
- 📸 카메라 실시간 미리보기 & 갤러리 이미지 지원
- 🤖 AI 신체 부위 감지 (TensorFlow.js BlazePose)
- 👕 의류 오버레이 & 체형 맞춤
- 💾 로컬 저장소에 결과 저장
- ☁️ HTTPS/localhost 지원 (iOS 호환)

---

## 🚀 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 터미널 1: Express 크롤링 서버 (포트 3001)
```bash
npm run server
```

출력:
```
✅ Express 서버 시작: http://localhost:3001
📡 크롤링 엔드포인트: POST /api/crawl
```

### 3. 터미널 2: Vite 개발 서버 (포트 5173)
```bash
npm run dev
```

자동으로 브라우저가 열리며 `http://localhost:5173`에 접속합니다.

---

## 📱 사용 방법

### Step 1: 29cm 링크 입력
- 29cm 상품의 상세 페이지 링크를 입력합니다
- 예: `https://29cm.co.kr/products/...`

### Step 2: 카테고리 확인
- 자동으로 추출된 카테고리를 확인합니다
- 필요하면 수정 가능합니다

### Step 3: 신체 정보 입력
- 성별, 체형, 키를 입력합니다
- (선택) 사이즈 정보도 입력 가능합니다

### Step 4: 이미지 소스 선택
- **카메라**: 실시간 미리보기 (권장)
- **갤러리**: 기존 사진 업로드

### Step 5: 실시간 미리보기
- AI가 신체를 감지하여 의류를 자동으로 표시합니다
- 충분한 조명이 있는 곳에서 사용하세요

### Step 6: 저장 & 관리
- 결과 이미지를 저장합니다
- 저장된 미리보기를 조회/삭제할 수 있습니다

---

## 🛠️ 기술 스택

### 프론트엔드
- **React 18** - UI 프레임워크
- **Vite 5** - 번들러 & 개발 서버
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **Zustand** - 상태 관리
- **Dexie.js** - IndexedDB 래퍼

### AI/ML
- **TensorFlow.js** - 신체 감지
- **BlazePose** (lite) - 33개 신체 키포인트
- **face-api.js** - 얼굴 감지 (Phase 3)

### 백엔드
- **Express 5** - 크롤링 프록시 서버
- **Cheerio** - HTML 파싱
- **Axios** - HTTP 클라이언트

### Canvas & 이미지 처리
- **Canvas 2D API** - 실시간 렌더링
- **requestAnimationFrame** - 부드러운 프레임 유지

---

## 📋 프로젝트 구조

```
styling-preview/
├── server/                    # Express 크롤링 서버
│   ├── index.ts              # 메인 서버
│   ├── routes/crawl.ts        # 크롤링 엔드포인트
│   └── parsers/               # HTML 파싱 로직
│
├── src/
│   ├── pages/                 # 6단계 페이지
│   ├── components/            # React 컴포넌트
│   ├── hooks/                 # 커스텀 훅
│   ├── lib/
│   │   ├── ai/               # AI/ML 모듈
│   │   ├── canvas/           # Canvas 렌더링
│   │   ├── crawl/            # 크롤링 클라이언트
│   │   └── storage/          # 저장소 관리
│   ├── store/                # Zustand 상태
│   └── types/                # TypeScript 타입
│
└── public/                    # 정적 파일
```

---

## 🎯 개발 로드맵

### ✅ Phase 1: 기초 인프라 (완료)
- 프로젝트 셋업
- Express 크롤링 서버
- 6단계 페이지 라우팅
- Zustand 상태 관리

### ✅ Phase 2: 카메라 & 의류 오버레이 (완료)
- MediaStream API 카메라 통합
- TensorFlow.js BlazePose 신체 감지
- Canvas 의류 오버레이
- 체형 기반 사이즈 보정
- 실시간 렌더링 루프 (24fps+)

### 🔄 Phase 3: 얼굴 합성
- face-api.js 통합
- 얼굴 감지 & 특징점 추출
- Affine Warp 기반 얼굴 합성
- 모델 착샷 모드

### 📅 Phase 4: 저장 & 최적화
- IndexedDB 저장소 구현
- 저장된 미리보기 관리
- 성능 최적화 (Web Worker)
- iOS/Android 테스트

---

## ⚙️ 설정

### 환경 변수
현재 로컬 개발용이므로 환경 변수 필요 없음

### HTTPS 설정
- **로컬 개발**: `localhost:5173` (HTTP 허용)
- **배포**: SSL 인증서 필수 (iOS 카메라 지원)

---

## 🐛 트러블슈팅

### 카메라가 작동하지 않음
- ✅ HTTPS 또는 localhost 확인
- ✅ 카메라 권한 확인 (iOS/Android)
- ✅ 브라우저 권한 설정 확인

### 포즈 감지가 느림
- ✅ 조명 확인 (밝은 환경 권장)
- ✅ 신체가 프레임에 충분히 보이는지 확인
- ✅ 데스크탑/모바일 성능 확인

### 의류가 겹치지 않음
- ✅ 신체 정보(키, 체형) 정확히 입력
- ✅ 충분한 조명 환경
- ✅ 직립 자세 유지

---

## 📝 라이선스

MIT

---

## 👨‍💻 개발자

Created with ❤️ for 29cm styling preview

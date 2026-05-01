# 배포 가이드 (5분)

## 🔧 Step 1: GitHub 저장소 생성 (1분)

👉 **https://github.com/new** 에서:

1. **Repository name**: `styling-preview`
2. **Description**: `Real-time clothing styling preview with 29cm integration`
3. **Public** 선택
4. **Create repository** 클릭

➡️ 생성 후 다음 URL을 확인하세요: `https://github.com/YOUR_USERNAME/styling-preview`

---

## 🚀 Step 2: 로컬에서 푸시 (1분)

생성한 저장소의 **Quick setup** 섹션에서:

```bash
cd /Users/jeongeon/Desktop/AI/styling-preview

# 저장소 URL 추가 (YOUR_USERNAME을 본인 GitHub username으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/styling-preview.git

# 브랜치명 변경 (GitHub 기본값: main)
git branch -m master main

# 푸시!
git push -u origin main
```

✅ **완료**: GitHub에 업로드됨!

---

## 🎯 Step 3: Vercel에 배포 (2분)

### 3-1. Vercel 접속
👉 **https://vercel.com** → **"Sign up"** → **"Continue with GitHub"** 클릭

### 3-2. 저장소 연결
1. GitHub 계정 인증
2. `styling-preview` 저장소 선택
3. **Import** 클릭

### 3-3. 배포 설정
**Framework**: `Vite` (자동 감지됨)

**Root Directory**: `.`

**Build Command**: `npm run build` (기본값)

**Output Directory**: `dist` (기본값)

**Environment Variables** (선택):
```
NODE_ENV=production
```

### 3-4. 배포!
**Deploy** 클릭 → 완료! 🎉

---

## ✅ 배포 완료!

**생성된 URL**: `https://styling-preview.vercel.app` (예상)

실제 URL은 Vercel 대시보드에서 확인:
- https://vercel.com/dashboard

---

## 🔍 배포 후 확인

```
✅ https://styling-preview.vercel.app 접속
✅ Step 1 (링크 입력) 페이지 열림
✅ "다음" 버튼 클릭 가능
✅ HTTPS 자동 적용 (카메라 권한 ✓)
```

---

## ⚠️ 주의사항

### 1. Express 서버
- 로컬용입니다 (`npm run server`)
- 배포된 앱에서 29cm 크롤링은 **작동 안 함**
- ➡️ 차후에 Serverless Function (Vercel Functions)으로 구현 필요

### 2. 첫 로딩
- AI 모델 다운로드: 10~20초 (CDN)
- 이후는 캐시됨

### 3. iOS 테스트
- HTTPS이므로 iOS Safari에서도 카메라 ✓

---

## 📊 명령어 요약

```bash
# 로컬에서 한 번만 실행:
git remote add origin https://github.com/YOUR_USERNAME/styling-preview.git
git branch -m master main
git push -u origin main

# 이후 수정 후 푸시:
git add .
git commit -m "메시지"
git push
```

---

## 🎨 Vercel 대시보드 관리

배포 후:
- **Domains**: 커스텀 도메인 연결
- **Analytics**: 방문 통계
- **Preview**: PR 자동 배포
- **Logs**: 빌드/실행 로그

---

**완료하신 후 GitHub URL과 Vercel URL을 공유해주세요! 🎉**

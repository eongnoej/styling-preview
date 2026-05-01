# GitHub 업로드 가이드

## 자동 방법 (권장)

### 1. GitHub CLI 설치 (선택)
```bash
# macOS (Homebrew)
brew install gh

# 그 후:
gh repo create styling-preview --source=. --remote=origin --push
```

---

## 수동 방법 (GitHub 웹사이트)

### Step 1: GitHub에서 새 저장소 만들기
1. https://github.com/new 접속
2. **Repository name**: `styling-preview`
3. **Description**: `Real-time clothing styling preview web app with 29cm integration`
4. **Public** 선택 (공개)
5. **.gitignore**: None (이미 있음)
6. **License**: MIT (선택)
7. **Create repository** 클릭

### Step 2: 로컬에서 푸시
GitHub에서 저장소를 만든 후, 다음 명령어를 실행하세요:

```bash
cd /Users/jeongeon/Desktop/AI/styling-preview

# GitHub 저장소 URL (YOUR_USERNAME은 본인 GitHub username으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/styling-preview.git

# master → main으로 브랜치명 변경 (선택)
git branch -m master main

# 푸시
git push -u origin main
# (또는 master를 사용한다면: git push -u origin master)
```

### Step 3: GitHub에서 확인
https://github.com/YOUR_USERNAME/styling-preview 방문해서 업로드 확인

---

## 배포 방법

### 방법 1: Vercel (권장 - 가장 간단)

1. https://vercel.com 접속
2. **"Import Project"** 클릭
3. **GitHub** 선택
4. `styling-preview` 저장소 선택
5. **Deploy** 클릭 (자동 배포)

✅ **장점**: 자동 배포, HTTPS 자동 설정, 빠른 성능

⚠️ **주의**: Express 서버가 있으므로, "serverless functions" 따로 설정 필요

```
# vercel.json 생성 필요
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev"
}
```

---

### 방법 2: Netlify

1. https://netlify.com 접속
2. **"Add new site" → "Import an existing project"**
3. **GitHub** 선택
4. `styling-preview` 저장소 선택
5. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. **Deploy** 클릭

✅ **장점**: UI 간단, 무료 플랜

---

### 방법 3: Railway (Express 서버 포함)

1. https://railway.app 접속
2. **"Start a New Project"**
3. **GitHub** 선택
4. `styling-preview` 저장소 선택
5. Variables 설정:
   - `NODE_ENV=production`
6. **Deploy** 클릭

✅ **장점**: 풀스택 배포 (Express + React), 자유로운 설정

---

## 로컬 테스트

배포하기 전에 **프로덕션 빌드** 테스트:

```bash
# 빌드
npm run build

# 프리뷰
npm run preview
```

http://localhost:4173 에서 확인

---

## ⚠️ 중요: Express 서버 배포

현재 구조:
- **React 앱**: `npm run dev` (Vite)
- **Express 서버**: `npm run server` (로컬만)

**배포 옵션**:

1. **React만 배포** (권장)
   - Vercel/Netlify에 React만 배포
   - API는 로컬 개발 환경에서만 사용
   - 실서버에서는 29cm 크롤링을 서버리스 함수로 구현 필요

2. **풀스택 배포**
   - Railway 또는 Render 사용
   - Express + React 함께 배포
   - 더 복잡하지만 더 강력함

---

## 추천 세팅

**가장 간단한 방법:**

```
1. GitHub에 올리기 (수동)
2. Vercel에 배포 (React만)
3. 29cm 크롤링은 로컬 개발용으로 유지
4. 실제 배포는 차후에 API 게이트웨이로 구현
```

---

## 배포 후 확인 사항

- [ ] 앱이 열리는가?
- [ ] 카메라 권한이 작동하는가? (HTTPS여야 함)
- [ ] 갤러리 선택이 작동하는가?
- [ ] AI 모델이 로드되는가? (느릴 수 있음)
- [ ] 저장 기능이 작동하는가?

---

## 링크

- **GitHub**: https://github.com/YOUR_USERNAME/styling-preview
- **Vercel**: https://styling-preview.vercel.app (예상)
- **Netlify**: https://styling-preview.netlify.app (예상)

---

**도움말**: `gh` CLI 설치하면 한 줄로 끝!
```bash
brew install gh
gh auth login
gh repo create styling-preview --source=. --remote=origin --push
```

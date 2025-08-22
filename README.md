# MBTI 기반 캠핑 스타일 테스트

🏕️ **캠핑을 사랑하는 당신의 MBTI 성향을 알아보세요!**

개인의 MBTI 성향에 따른 캠핑 스타일을 분석하고, 맞춤형 캠핑 장비 할인 쿠폰을 제공하는 웹 애플리케이션입니다.

## 🌟 주요 기능

- **🧠 MBTI 기반 캠핑 스타일 분석**: 16가지 캠핑 스타일 결과 제공
- **📊 실시간 통계**: Google Sheets 기반 실시간 응답자 통계
- **🎟️ 맞춤형 쿠폰 발급**: MBTI 타입별 개인화된 할인 쿠폰
- **📱 반응형 디자인**: 모바일/데스크탑 최적화
- **☁️ 클라우드 연동**: Google Apps Script & Google Sheets 자동 저장

## 🎯 캠핑 스타일 유형

### 📊 16가지 MBTI 캠핑 스타일
- **ENFP**: 열정적 탐험가 🌟
- **ENFJ**: 영감을 주는 가이드 🧭
- **ENTP**: 창의적 실험가 🔬
- **ENTJ**: 완벽주의 리더 캠퍼 👑
- **ESFP**: 자유로운 분위기 메이커 🎪
- **ESFJ**: 따뜻한 케어테이커 🤗
- **ESTP**: 즉흥적 모험가 🏃‍♂️
- **ESTJ**: 체계적 캠핑 마스터 📋
- **INFP**: 감성적 예술가 🎨
- **INFJ**: 신중한 비전 캠퍼 🔮
- **INTP**: 논리적 분석가 🤔
- **INTJ**: 전략적 캠핑 마스터 ♟️
- **ISFP**: 평화로운 자연인 🌿
- **ISFJ**: 신중한 전통주의자 🏛️
- **ISTP**: 실용적 기술자 🔧
- **ISTJ**: 계획적 전통 캠퍼 📚

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Design**: 반응형 웹 디자인, CSS Grid/Flexbox

## 📦 설치 및 설정

### 1단계: 파일 다운로드
```bash
git clone https://github.com/YOUR_USERNAME/mbti-camping-test.git
cd mbti-camping-test
```

### 2단계: Google Sheets 설정
1. [Google Drive](https://drive.google.com)에서 새 스프레드시트 생성
2. 스프레드시트 이름을 "MBTI 캠핑 테스트 결과"로 변경
3. URL에서 스프레드시트 ID 복사
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### 3단계: Google Apps Script 설정
1. [Google Apps Script](https://script.google.com) 접속
2. "새 프로젝트" 생성
3. `google-apps-script.js` 파일의 모든 코드를 복사하여 붙여넣기
4. 8번째 줄의 스프레드시트 ID 교체:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_GOOGLE_SPREADSHEET_ID_HERE';
   ```
5. 프로젝트 이름을 "MBTI 캠핑 스타일 테스트"로 변경

### 4단계: 웹 앱 배포
1. Google Apps Script에서 **"배포" → "새 배포"** 클릭
2. 실행 환경: **"누구나"**
3. 액세스 권한: **"누구나"**
4. **"배포"** 클릭
5. 웹 앱 URL 복사

### 5단계: HTML 파일 설정
1. `simple-camping-test.html` 파일 열기
2. 861번째 줄의 URL 교체:
   ```javascript
   url: 'YOUR_COPIED_WEB_APP_URL_HERE'
   ```

### 6단계: 테스트
1. `simple-camping-test.html` 파일을 브라우저에서 열기
2. 테스트 진행 후 Google Sheets에 데이터 저장 확인

## 🎨 주요 화면

### 메인 화면
- 캠핑 테마의 따뜻한 디자인
- 명확한 CTA 버튼
- 반응형 레이아웃

### 질문 화면
- 프로그레스 바
- 뒤로가기 기능
- 직관적인 선택 버튼

### 결과 화면
- MBTI 타입별 맞춤 결과
- 실시간 통계 정보
- 개인화된 쿠폰 제공
- 결과 이미지 다운로드
- SNS 공유 기능

## 📊 데이터 구조

### 테스트결과 시트
| 열 | 항목 | 설명 |
|---|---|---|
| A | 완료일시 | 테스트 완료 시간 (KST) |
| B | MBTI타입 | 결과 MBTI 타입 (예: ENFP) |
| C | 결과제목 | 캠핑 스타일 제목 |
| D | 캠핑빈도 | 연간 캠핑 횟수 |
| E | 주요동반자 | 주로 함께하는 사람 |
| F | IP주소 | 사용자 식별자 |
| G | 사용자에이전트 | 브라우저 정보 |
| H | 리퍼러 | 유입 경로 |
| I | 전체응답JSON | 모든 답변 데이터 |

### 쿠폰발급 시트
| 열 | 항목 | 설명 |
|---|---|---|
| A | 발급일시 | 쿠폰 발급 시간 (KST) |
| B | 쿠폰코드 | 고유 쿠폰 코드 |
| C | MBTI타입 | 결과 MBTI 타입 |
| D | 할인금액 | 34,000원 고정 |
| E | 사용상태 | 미사용/사용완료 |
| F | IP주소 | 사용자 식별자 |
| G | 사용자에이전트 | 브라우저 정보 |

## 🔧 API 엔드포인트

Google Apps Script에서 제공하는 API:

### GET 요청
- **`?action=ping`**: 연결 테스트
- **`?action=get_stats`**: 실시간 통계 조회

### POST 요청
- **`save_test_result`**: 테스트 결과 저장
- **`issue_coupon`**: 쿠폰 발급

## 🎯 특징

### 🔒 보안
- 민감한 정보는 환경변수로 관리
- 클라이언트 식별을 위한 타임스탬프 기반 ID 사용

### 📈 실시간 통계
- Google Sheets 데이터 기반 실시간 퍼센티지 계산
- 16개 MBTI 타입별 분포 현황

### 🎨 UX/UI
- 캠핑 테마의 일관된 디자인
- 직관적인 사용자 인터페이스
- 모바일 친화적 반응형 디자인

### ⚡ 성능
- 바닐라 JavaScript로 빠른 로딩
- 최적화된 이미지 및 리소스

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 언제든 연락주세요!

---

⭐ **이 프로젝트가 유용했다면 별표를 눌러주세요!**
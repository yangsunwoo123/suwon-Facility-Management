# 수원대학교 교내 시설관리 어플 — CLAUDE.md

## 프로젝트 개요

수원대학교 해커톤용 교내 시설 이상 신고 시스템.  
학생/교직원이 교내 시설 파손·전기·수도 등의 문제를 사진과 위치와 함께 신고하면 담당 구역 관리팀이 수신·처리하는 구조.

**앱 진입점:** `http://localhost:5173`  
**개발 서버 실행:** `cd suwon-facility-app && npm run dev`

---

## 기술 스택

| 항목 | 버전/값 |
|------|---------|
| React | 19 |
| TypeScript | ~6.0 |
| Vite | 8 |
| Tailwind CSS | 3.4 |
| React Router DOM | 7 |
| 패키지 매니저 | npm |

**브랜드 색상**
- `suwon-navy: #003670`
- `suwon-yellow: #E9B800`

---

## 디렉토리 구조

```
suwon-facility-app/
├── public/
│   ├── campus-map.jpg      # 캠퍼스 지도 이미지 (PDF에서 추출한 JPEG)
│   ├── logo-light.jpg      # 수원대 로고 (밝은 배경용)
│   └── logo-dark.jpg       # 수원대 로고 (어두운 배경용, 로그인 화면에 사용)
├── src/
│   ├── App.tsx             # BrowserRouter + 4개 라우트
│   ├── main.tsx
│   ├── apps/
│   │   ├── LandingPage.tsx # 앱 선택 화면 (/, 3개 카드)
│   │   ├── UserApp.tsx     # 학생/교직원 앱 (/user)
│   │   ├── AdminApp.tsx    # 구역 관리자 앱 (/admin)
│   │   └── DevApp.tsx      # 개발자 콘솔 (/dev)
│   ├── components/
│   │   ├── PortalLogin.tsx # 세 앱 공통 포털 로그인 UI
│   │   └── SuwonLogo.tsx   # 로고 이미지 컴포넌트
│   └── data/
│       ├── types.ts        # 공통 타입 (IssueReport, Building, Zone, LogEntry 등)
│       ├── campus.ts       # 26개 건물 좌표·구역, 카테고리, 상태 설정
│       └── mockData.ts     # 8개 신고 Mock + 50개 로그 Mock
└── CLAUDE.md               # 이 파일
```

---

## 라우팅

```
/       → LandingPage  (앱 선택)
/user   → UserApp      (학생/교직원)
/admin  → AdminApp     (구역 관리자)
/dev    → DevApp       (개발자)
*       → /로 리다이렉트
```

---

## 로그인 계정 (데모)

| 앱 | 아이디 | 비밀번호 | 비고 |
|----|--------|----------|------|
| UserApp | 아무 값 | 아무 값 | 항상 통과 |
| AdminApp | `mgr_a` ~ `mgr_f` | `1234` | 각 구역(A~F) 관리자 |
| DevApp | `dev` | `dev2024` | |

AdminApp은 로그인 ID에서 구역을 자동 감지 (`mgr_a` → Zone A).

---

## 각 앱 주요 기능

### UserApp (`/user`)
- 포털 로그인 → 홈(캠퍼스 지도 + 최근 신고) → 신고 작성 → 내 신고 목록 → 신고 상세
- 캠퍼스 지도: `campus-map.jpg` 위에 신고가 있는 건물만 **빨간 텍스트 레이블** 오버레이, 클릭 시 바텀 시트로 해당 건물 전체 신고 목록 표시
- 지도 레이블은 `absolute` 포지셔닝, 각 건물의 `x`, `y` (%) 좌표 사용
- 신고 작성: 카테고리 선택, 건물 선택, 위치·제목·설명 입력, 사진 업로드

### AdminApp (`/admin`)
- 포털 로그인 → 대시보드(내 구역 통계) → 신고 목록 → 신고 상세·상태 변경·댓글
- 로그인 5초 후 푸시 알림 팝업 시뮬레이션
- 상태 변경 버튼: 접수됨 → 처리중 → 완료 / 보류

### DevApp (`/dev`)
- 포털 로그인 → 시스템 대시보드 → 실시간 로그 스트리밍 → 구역 관리
- 5개 마이크로서비스 헬스 모니터링
- 라이브 로그: 2초 간격 스트리밍 모드 토글

---

## 공통 컴포넌트

### PortalLogin
```tsx
<PortalLogin
  appType="user" | "admin" | "dev"
  onLogin={(id, pw) => boolean}   // false 반환 시 에러 표시
/>
```
- `logo-dark.jpg` 헤더
- 학번/아이디 입력, 비밀번호 (show/hide), 아이디 저장 체크박스
- 600ms 네트워크 딜레이 시뮬레이션

### SuwonLogo
```tsx
<SuwonLogo size={40} variant="dark" />
// variant: 'light' | 'dark' → /logo-light.jpg or /logo-dark.jpg
```

---

## 데이터 구조 (types.ts)

```ts
IssueReport {
  id, title, category, description,
  buildingId, buildingName, zone,
  status: '접수됨' | '처리중' | '완료' | '보류',
  reportedBy, reportedAt, updatedAt,
  imageUrl?, location?,
  priority: 'low' | 'medium' | 'high',
  comments: IssueComment[]
}

Building { id, name, nameEn, zone, x, y }  // x,y: 지도 내 % 위치
Zone { id, name, color, buildings[], adminName }
```

---

## 캠퍼스 구역 & 건물 (campus.ts)

| Zone | 이름 | 색상 | 주요 건물 |
|------|------|------|-----------|
| A | 공학관 구역 | #e57c00 | eng1~4, ace, inno |
| B | 혁신·연구 구역 | #7c3aed | future, research |
| C | 중앙·학생 구역 | #0f9d58 | student, library, gym, social |
| D | 예술·문화 구역 | #e91e63 | belcanto, outdoor, music, culture, design, formative |
| E | 인문·글로벌 구역 | #1a73e8 | human, global, lifecare, swfusion, biz |
| F | 본부·행정 구역 | #607d8b | main, dorm, rotc |

전체 26개 건물 — `campus.ts`의 `BUILDINGS` 배열 참고.

---

## 과거에 발생한 버그 & 해결

### React Hooks 규칙 위반 (치명적 버그)
**증상:** 로그인 성공 후 계속 로그인 화면으로 되돌아감.  
**원인:** `UserApp`에서 `const [mapSelected, setMapSelected] = useState(...)` 선언이 `if (screen === 'login') return ...` 조건부 return 이후에 위치 → 로그인 화면 렌더 때 훅이 건너뛰어져 React가 상태를 리셋.  
**해결:** 모든 `useState`를 컴포넌트 함수 최상단(조건문 이전)으로 이동.

### TypeScript TS6133 unused variable
`AdminApp.tsx`에서 리팩터링 후 `ZONES`와 `zone` 변수가 미사용으로 남아 빌드 경고.  
→ import 및 변수 선언 삭제.

---

## 개발 시 주의사항

1. **React Hooks Rules** — 모든 `useState`/`useEffect`는 컴포넌트 최상단에, 조건문·루프·조기 return 이전에 선언.
2. **지도 레이블** — 건물 좌표(x, y)는 `campus-map.jpg` (1200×900 기준) 내 텍스트 레이블 위치(%). 좌표 수정 시 실제 지도 확인 필요.
3. **이미지 파일** — `public/` 폴더의 `campus-map.jpg`, `logo-light.jpg`, `logo-dark.jpg`는 프로젝트 외부 원본(`사진/` 폴더)에서 복사한 것. 삭제하면 재복사 필요.
4. **Mock 데이터** — 실제 DB 없음. 모든 데이터는 `mockData.ts` 인메모리. 새로고침 시 신규 신고 데이터 초기화.

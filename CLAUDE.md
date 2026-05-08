# 수원대학교 교내 시설관리 어플 — CLAUDE.md

## 프로젝트 개요

수원대학교 해커톤용 교내 시설 이상 신고 시스템.  
학생/교직원이 교내 시설 파손·전기·수도 등의 문제를 사진과 위치와 함께 신고하면 담당 구역 관리팀이 수신·처리하는 구조.

**로컬 개발 서버:** `http://localhost:5173`  
**개발 서버 실행:** 프로젝트 루트에서 `npm run dev`  
**배포 URL:** Cloudflare Pages (GitHub `main` 브랜치 자동 배포)  
**GitHub:** `https://github.com/yangsunwoo123/suwon-Facility-Management`

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

---

## 디자인 시스템 — B "클린 거버넌스" (현재 적용)

가장 최근 세션에서 디자인 방향 B를 선정해 전체 앱에 적용함.

| 토큰 | 값 |
|------|----|
| Primary | `#1a56db` (deep blue) |
| Background | `#f8fafc` (near-white) |
| Card | `white` + `border-gray-100` |
| Hero gradient | `#1a56db → #003670` |
| Heading | `font-extrabold`, `color: #0f172a` |
| Sub text | `color: #64748b` |

**앱별 accent 색상 (PortalLogin 및 각 앱 PRIMARY 상수)**

| 앱 | 색상 |
|----|------|
| UserApp | `#1a56db` |
| AdminApp | `#1a56db` (기존 초록에서 변경) |
| DevApp | `#7c3aed` (보라, 다크 터미널 테마 유지) |

**상태 칩 색상**

| 상태 | bg | color |
|------|----|-------|
| 접수됨 | `#f3f4f6` | `#6b7280` |
| 처리중 | `#fef3c7` | `#d97706` |
| 완료 | `#dcfce7` | `#16a34a` |
| 보류 | `#fee2e2` | `#dc2626` |

**구역 색상 (campus.ts `ZONES`)**

| Zone | 이름 | 색상 |
|------|------|------|
| A | 공학관 구역 | `#e57c00` |
| B | 혁신·연구 구역 | `#7c3aed` |
| C | 중앙·학생 구역 | `#0f9d58` |
| D | 예술·문화 구역 | `#e91e63` |
| E | 인문·글로벌 구역 | `#1a73e8` |
| F | 본부·행정 구역 | `#607d8b` |

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
│       ├── mockData.ts     # 8개 신고 Mock + 50개 로그 Mock
│       └── store.ts        # localStorage 기반 신고 저장소 (앱 간 공유)
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
| UserApp | 아무 값 | 아무 값 | `\|\| true` 로 항상 통과 (데모 모드) |
| AdminApp | `mgr_a` ~ `mgr_f` | `1234` | 각 구역(A~F) 관리자 |
| DevApp | `dev` | `dev2024` | |

AdminApp은 로그인 ID에서 구역을 자동 감지 (`mgr_a` → Zone A).

---

## 각 앱 주요 기능 (현재 구현 상태)

### LandingPage (`/`)
- 흰 상단바 + 수원대 로고
- 파란 그라디언트 히어로 카드
- 3개 앱 카드: User(파랑 `#eff6ff`), Admin(초록 `#f0fdf4`), Dev(보라 `#faf5ff`)
- 각 카드에 기능 태그 칩 (feature chips)

### UserApp (`/user`)
- 포털 로그인 → 홈 → 신고 작성 → 내 신고 목록 → 신고 상세
- **홈 화면 구성:**
  1. 흰 sticky 헤더 (이름 인사 + 알림 버튼)
  2. 3개 통계 pill (전체 신고 / 처리중 / 완료)
  3. 파란 그라디언트 공지사항 배너
  4. 4개 빠른 신고 카테고리 아이콘 그리드
  5. **캠퍼스 지도 섹션** (아래 상세 설명)
  6. 최근 신고 목록 (allReports 기준)
- **신고 제출 → localStorage 저장 → AdminApp 실시간 반영** (store.ts 경유)

### UserApp — 캠퍼스 지도 (핵심 개선 완료)

```
[지도 카드]
├── 구역 필터 탭: 전체 / A / B / C / D / E / F
│   └── 탭 클릭 → mapZoneFilter state → 해당 구역 건물만 표시
├── campus-map.jpg 위에 건물 마커 오버레이
│   ├── 모든 건물: zone 색상 dot + 건물명 pill (흰 배경, rounded-full)
│   ├── 신고 있는 건물: zone 색상 테두리 + 빨간 animate-ping 펄스 + 빨간 카운트 배지
│   └── 건물 탭 → 신고 있으면 바텀 시트, 없으면 신고 작성 화면
└── 구역 범례: A~F 색상 도트 (탭하면 필터 동작) + 신고중(빨강)

[바텀 시트]
├── 헤더: 건물명 + 구역 배지 (예: "C 학생복지" 초록)
├── 신고 카드 목록 (카테고리 아이콘, 우선순위 태그, 상태 배지, 위치, 신고자)
└── "이 건물 시설 신고하기" 버튼
```

**관련 state:**
```tsx
const [mapSelected, setMapSelected] = useState<{...} | null>(null);
const [mapZoneFilter, setMapZoneFilter] = useState('ALL');
const reportsByBuilding = useMemo(() => ..., [allReports]); // 완료 제외 활성 신고만
```

### AdminApp (`/admin`)
- 포털 로그인 → 대시보드 → 신고 목록 → 신고 상세
- **흰 sticky 헤더** (구역명 + 로그아웃)
- 4개 통계 pill (전체 / 접수됨 / 처리중 / 완료)
- 긴급 신고 있을 때 빨간 배너 표시
- 2×2 카테고리별 통계 그리드
- 신고 목록: 파란 필터 탭 (전체 / 접수됨 / 처리중 / 완료 / 보류)
- `BackBtn` 헬퍼 컴포넌트: 흰 헤더 + SVG 뒤로가기 버튼 재사용
- 로그인 5초 후 푸시 알림 팝업 시뮬레이션

### DevApp (`/dev`)
- 포털 로그인 → 시스템 대시보드 → 로그 → 신고 현황 → 구역 관리 → 사용자 관리
- **대시보드/로그**: 다크 터미널 테마 (`#0f172a` 배경) 유지
- **서브 화면** (reports/zones/users): 흰 sticky 헤더 + SVG 뒤로가기 버튼
- `BackBtn` 헬퍼: dark/light 모드 prop 지원
- 5개 마이크로서비스 헬스 모니터링
- 라이브 로그: 2초 간격 스트리밍 모드 토글

---

## 공통 컴포넌트

### PortalLogin
```tsx
<PortalLogin
  appType="user" | "admin" | "dev"
  onLogin={(id, pw) => boolean}   // false 반환 시 에러 표시
  onLogoTap?: () => void          // 로고 탭 핸들러 (옵션)
/>
```
- 흰 상단바 (로고 + 앱 타입 배지)
- 파란 그라디언트 히어로 섹션
- 흰 로그인 카드 (appType별 색상 테마)
- 학번/아이디, 비밀번호(show/hide), 아이디 저장 체크박스
- 600ms 네트워크 딜레이 시뮬레이션

### SuwonLogo
```tsx
<SuwonLogo size={40} variant="dark" showText={false} />
// variant: 'light' | 'dark' → /logo-light.jpg or /logo-dark.jpg
// showText: true → 로고 이미지 + "수원대학교 / UNIVERSITY OF SUWON" 텍스트
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

## 데이터 흐름 (store.ts)

```
UserApp 신고 제출
  → storeAddReport(newReport)          // localStorage 저장
  → window.dispatchEvent('storage')    // 이벤트 발생
  → AdminApp useEffect 'storage' 핸들러 → 신고 목록 갱신
```

- `loadReports()`: mockData + localStorage 신고 합쳐서 반환
- 새로고침 시 localStorage 신고는 유지, mockData는 항상 포함

---

## 캠퍼스 구역 & 건물 (campus.ts)

| Zone | 이름 | 색상 | 주요 건물 |
|------|------|------|-----------|
| A | 공학관 구역 | `#e57c00` | eng1~4, ace, inno |
| B | 혁신·연구 구역 | `#7c3aed` | future, research |
| C | 중앙·학생 구역 | `#0f9d58` | student, library, gym, social |
| D | 예술·문화 구역 | `#e91e63` | belcanto, outdoor, music, culture, design, formative |
| E | 인문·글로벌 구역 | `#1a73e8` | human, global, lifecare, swfusion, biz |
| F | 본부·행정 구역 | `#607d8b` | main, dorm, rotc |

전체 26개 건물 — `campus.ts`의 `BUILDINGS` 배열 참고.

---

## 배포 구성

- **플랫폼:** Cloudflare Pages
- **소스:** GitHub `yangsunwoo123/suwon-Facility-Management` `main` 브랜치
- **자동 배포:** `main` 브랜치 push 시 자동 빌드 & 배포
- **빌드 명령:** `npm run build`
- **출력 디렉토리:** `dist`

---

## 최근 세션 변경 이력

### 2026-05-08 — B 디자인 시스템 전면 적용 + 캠퍼스 지도 개선
**커밋:** `1bb5321`

**변경 파일 6개:**

| 파일 | 주요 변경 내용 |
|------|--------------|
| `LandingPage.tsx` | 흰 배경, 파란 히어로 카드, 3앱 카드 (feature chips) |
| `PortalLogin.tsx` | appType별 색상 테마, 파란 그라디언트 히어로 |
| `UserApp.tsx` | 홈 전체 리디자인 + 캠퍼스 지도 구역 마커 개선 |
| `AdminApp.tsx` | 흰 헤더, 파란 필터 탭, BackBtn 컴포넌트, PRIMARY 파랑으로 통일 |
| `DevApp.tsx` | 다크 대시보드/로그 유지, 서브화면 흰 헤더, BackBtn |
| `.gitignore` | `.claude/` 디렉토리 제외 |

---

## 알려진 버그 & 해결된 이슈

### React Hooks 규칙 위반 (해결됨)
**증상:** 로그인 성공 후 계속 로그인 화면으로 되돌아감.  
**원인:** `useState` 선언이 조건부 return 이후에 위치.  
**해결:** 모든 `useState`를 컴포넌트 함수 최상단(조건문 이전)으로 이동.  
**재발 방지:** 새 상태 추가 시 반드시 기존 useState 블록 안에 넣을 것.

### TypeScript TS6133 unused variable (해결됨)
`AdminApp.tsx` 리팩터링 후 `ZONES`, `zone` 미사용 변수 빌드 경고 → import 및 선언 삭제.

---

## 개발 시 주의사항

1. **React Hooks Rules** — 모든 `useState`/`useEffect`는 컴포넌트 최상단에, 조건문·루프·조기 return 이전에 선언.
2. **지도 레이블 좌표** — 건물 `x`, `y`는 `campus-map.jpg` (1200×900 기준) 내 위치(%). 좌표 수정 시 실제 지도 확인 필요.
3. **이미지 파일** — `public/` 폴더의 이미지는 외부 원본에서 복사한 것. 삭제 시 재복사 필요.
4. **Mock 데이터** — 실제 DB 없음. `mockData.ts`는 항상 포함, 신규 신고는 localStorage에 저장. 새로고침 시 신규 신고 초기화.
5. **UserApp 로그인** — 현재 `|| true` 로 어떤 계정도 통과. 데모 목적. 실제 검증 필요 시 제거.
6. **AdminApp PRIMARY** — 기존 `#0f9d58`(초록)에서 `#1a56db`(파랑)으로 변경됨. 초록이 필요한 경우 명시적으로 zone.color 사용.

---

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore

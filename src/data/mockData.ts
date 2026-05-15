import type { IssueReport, LogEntry } from './types';

export const MOCK_REPORTS: IssueReport[] = [
  {
    id: 'RPT-001',
    title: '운동장 농구장 바닥 공사',
    category: '시설파손',
    description: '운동장 농구장 바닥 노후화로 인한 안전 위험 신고. 균열 및 표면 박리 현상 확인.',
    buildingId: '',
    buildingName: '운동장 농구장',
    zone: 'A',
    department: 'general',
    midStatus: '1차승인',
    midManagerName: '일반관리팀 직접 접수',
    midApprovedAt: '2026-04-20T10:00:00',
    status: '완료',
    reportedBy: '재학생',
    reportedAt: '2026-04-20T09:00:00',
    updatedAt: '2026-05-10T17:00:00',
    location: '운동장 농구장 전 구역',
    priority: 'high',
    comments: [
      { id: 'c1', author: '일반관리팀', role: 'admin', text: '바닥 전면 재포장 공사 완료. 2026-05-10 검수 완료되었습니다.', createdAt: '2026-05-10T17:00:00' }
    ]
  },
  {
    id: 'RPT-002',
    title: 'ACE교육관 전등 LED 교체',
    category: '전기/전력',
    description: 'ACE교육관 전 층 형광등을 에너지 절감형 LED 조명으로 교체 공사 진행 중.',
    buildingId: 'ace',
    buildingName: 'ACE교육관',
    zone: 'C',
    department: 'elec',
    midStatus: '1차승인',
    midManagerName: '공학관 교학조교',
    midApprovedAt: '2026-05-01T11:00:00',
    status: '처리중',
    reportedBy: '학생처',
    reportedAt: '2026-05-01T09:00:00',
    updatedAt: '2026-05-12T10:00:00',
    location: '전 층',
    priority: 'low',
    comments: [
      { id: 'c2', author: '전기팀', role: 'admin', text: '층별 순차 교체 중입니다. 5월 말 완료 예정입니다.', createdAt: '2026-05-12T10:00:00' }
    ]
  },
  {
    id: 'RPT-003',
    title: '제1공학관 리모델링 공사',
    category: '시설파손',
    description: '제1공학관 내부 리모델링 공사 진행 중. 강의실 및 복도 전면 개선 작업.',
    buildingId: 'eng1',
    buildingName: '제1공학관',
    zone: 'B',
    department: 'env',
    midStatus: '1차승인',
    midManagerName: '혁신공과대학 교학조교',
    midApprovedAt: '2026-04-28T10:00:00',
    status: '처리중',
    reportedBy: '시설팀',
    reportedAt: '2026-04-28T08:00:00',
    updatedAt: '2026-05-08T09:00:00',
    location: '건물 전체',
    priority: 'medium',
    comments: [
      { id: 'c3', author: '환경관리팀 2구역', role: 'admin', text: '리모델링 공사 기간: 2026-04-28 ~ 2026-06-30. 공사 중 소음 양해 부탁드립니다.', createdAt: '2026-05-08T09:00:00' }
    ]
  },
  {
    id: 'RPT-004',
    title: '사회관 리모델링 공사',
    category: '시설파손',
    description: '사회관 내부 리모델링 공사 진행 중. 강의실 환경 개선 및 설비 교체.',
    buildingId: 'social',
    buildingName: '사회관',
    zone: 'D',
    department: 'env',
    midStatus: '1차승인',
    midManagerName: '도서관·SW 교학조교',
    midApprovedAt: '2026-04-28T10:00:00',
    status: '처리중',
    reportedBy: '시설팀',
    reportedAt: '2026-04-28T08:00:00',
    updatedAt: '2026-05-08T09:00:00',
    location: '건물 전체',
    priority: 'medium',
    comments: [
      { id: 'c4', author: '환경관리팀 4구역', role: 'admin', text: '리모델링 공사 기간: 2026-04-28 ~ 2026-06-30. 이용에 불편을 드려 죄송합니다.', createdAt: '2026-05-08T09:00:00' }
    ]
  },
  {
    id: 'RPT-005',
    title: '경영공학대학 엘리베이터 교체 공사',
    category: '시설파손',
    description: '경영공학대학 노후 엘리베이터 전면 교체 공사 완료.',
    buildingId: 'biz',
    buildingName: '경영공학대학',
    zone: 'E',
    department: 'env',
    midStatus: '1차승인',
    midManagerName: '음악·경영 교학조교',
    midApprovedAt: '2026-04-15T11:00:00',
    status: '완료',
    reportedBy: '재학생',
    reportedAt: '2026-04-15T10:00:00',
    updatedAt: '2026-05-13T15:00:00',
    location: '엘리베이터 전 호기',
    priority: 'high',
    comments: [
      { id: 'c5', author: '환경관리팀 5구역', role: 'admin', text: '엘리베이터 교체 공사 완료. 2026-05-13부터 정상 운행 중입니다.', createdAt: '2026-05-13T15:00:00' }
    ]
  },
];

const now = new Date('2026-05-08T10:00:00');
export const MOCK_LOGS: LogEntry[] = Array.from({ length: 50 }, (_, i) => {
  const levels = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR', 'DEBUG'] as const;
  const services = ['auth-service', 'report-service', 'notification-service', 'file-service', 'api-gateway'];
  const messages = [
    'User login successful',
    'New report submitted: RPT-00' + (i + 1),
    'Admin notification sent to Zone A',
    'Image upload completed',
    'Push notification delivered',
    'Database query executed in 12ms',
    'Cache hit ratio: 94%',
    'Report status updated',
    'WARN: Response time exceeded 500ms',
    'ERROR: Push notification failed for device token',
    'Admin logged in: Zone C',
    'Report assigned to admin team',
  ];
  const d = new Date(now.getTime() - i * 3 * 60 * 1000);
  return {
    id: `LOG-${String(i + 1).padStart(4, '0')}`,
    timestamp: d.toISOString(),
    level: levels[Math.floor(Math.random() * levels.length)],
    service: services[Math.floor(Math.random() * services.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    userId: i % 3 === 0 ? `USR-${String(Math.floor(Math.random() * 200) + 1).padStart(4, '0')}` : undefined,
  };
});

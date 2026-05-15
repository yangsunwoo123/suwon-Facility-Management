import type { IssueReport, LogEntry } from './types';

export const MOCK_REPORTS: IssueReport[] = [
  {
    id: 'RPT-001',
    title: '제1공학관 3층 화장실 수도꼭지 파손',
    category: '수도/위생',
    description: '3층 남자화장실 두 번째 칸 수도꼭지가 돌아가지 않습니다. 물이 계속 흘러 낭비되고 있습니다.',
    buildingId: 'eng1',
    buildingName: '제1공학관',
    zone: 'B',
    department: 'env',
    status: '처리중',
    reportedBy: '김민준',
    reportedAt: '2026-05-05T09:23:00',
    updatedAt: '2026-05-05T11:00:00',
    location: '3층 남자화장실',
    priority: 'high',
    comments: [
      { id: 'c1', author: '환경관리팀 2구역', role: 'admin', text: '확인했습니다. 오늘 오후 수리 예정입니다.', createdAt: '2026-05-05T11:00:00' }
    ]
  },
  {
    id: 'RPT-002',
    title: '중앙도서관 1층 형광등 깜빡임',
    category: '전기/전력',
    description: '열람실 창가 쪽 형광등 3개가 계속 깜빡여서 공부하기 어렵습니다.',
    buildingId: 'library',
    buildingName: '중앙도서관',
    zone: 'D',
    department: 'elec',
    status: '접수됨',
    reportedBy: '이수진',
    reportedAt: '2026-05-05T14:10:00',
    updatedAt: '2026-05-05T14:10:00',
    location: '1층 열람실',
    priority: 'medium',
    comments: []
  },
  {
    id: 'RPT-003',
    title: '학생회관 앞 보도블럭 파손',
    category: '시설파손',
    description: '학생회관 정문 앞 보도블럭이 들려있어 걸려 넘어질 위험이 있습니다.',
    buildingId: 'student',
    buildingName: '학생회관',
    zone: 'C',
    department: 'general',
    status: '완료',
    reportedBy: '박지호',
    reportedAt: '2026-05-04T10:00:00',
    updatedAt: '2026-05-05T16:00:00',
    location: '정문 앞 보도',
    priority: 'high',
    comments: [
      { id: 'c2', author: '일반관리팀', role: 'admin', text: '보도블럭 교체 완료했습니다.', createdAt: '2026-05-05T16:00:00' }
    ]
  },
  {
    id: 'RPT-004',
    title: '미래혁신관 엘리베이터 이상소음',
    category: '시설파손',
    description: '2호 엘리베이터 운행 중 금속 마찰음이 납니다.',
    buildingId: 'future',
    buildingName: '미래혁신관',
    zone: 'A',
    department: 'env',
    status: '접수됨',
    reportedBy: '최현우',
    reportedAt: '2026-05-06T08:30:00',
    updatedAt: '2026-05-06T08:30:00',
    location: '2호 엘리베이터',
    priority: 'high',
    comments: []
  },
  {
    id: 'RPT-005',
    title: '기숙사 1층 세탁기 고장',
    category: '시설파손',
    description: '1층 세탁실 3번 세탁기가 작동하지 않습니다.',
    buildingId: 'dorm',
    buildingName: '기숙사',
    zone: 'E',
    department: 'env',
    status: '처리중',
    reportedBy: '강민서',
    reportedAt: '2026-05-05T20:15:00',
    updatedAt: '2026-05-06T07:00:00',
    location: '1층 세탁실',
    priority: 'medium',
    comments: []
  },
  {
    id: 'RPT-006',
    title: '조형관 앞 가로등 미점등',
    category: '전기/전력',
    description: '야간에 조형관 앞 가로등이 켜지지 않아 어둡습니다.',
    buildingId: 'formative',
    buildingName: '조형관',
    zone: 'C',
    department: 'elec',
    status: '보류',
    reportedBy: '윤아름',
    reportedAt: '2026-05-04T22:00:00',
    updatedAt: '2026-05-05T09:00:00',
    location: '조형관 정문 앞',
    priority: 'medium',
    comments: [
      { id: 'c3', author: '전기팀', role: 'admin', text: '부품 발주 중입니다. 3일 내 처리 예정.', createdAt: '2026-05-05T09:00:00' }
    ]
  },
  {
    id: 'RPT-007',
    title: '혁신공과대학 강의실 냉방 불량',
    category: '전기/전력',
    description: '302호 강의실 에어컨이 작동하지 않아 수업 중 너무 덥습니다.',
    buildingId: 'inno',
    buildingName: '혁신공과대학',
    zone: 'B',
    department: 'elec',
    status: '처리중',
    reportedBy: '정서연',
    reportedAt: '2026-05-07T10:00:00',
    updatedAt: '2026-05-07T13:00:00',
    location: '3층 302호',
    priority: 'high',
    comments: []
  },
  {
    id: 'RPT-008',
    title: '벨칸토아트센터 화장실 청결 불량',
    category: '청결/미화',
    description: '1층 여자화장실 위생 상태가 불량합니다.',
    buildingId: 'belcanto',
    buildingName: '벨칸토아트센터',
    zone: 'D',
    department: 'env',
    status: '접수됨',
    reportedBy: '한지민',
    reportedAt: '2026-05-08T09:00:00',
    updatedAt: '2026-05-08T09:00:00',
    location: '1층 여자화장실',
    priority: 'low',
    comments: []
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

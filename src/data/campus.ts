import type { Building, Zone } from './types';
import type { DepartmentId } from './types';

// ── 환경관리팀 6개 구역 (실제 수원대 관리 구역 기준) ──────────────────
export const ZONES: Zone[] = [
  { id: 'A', name: '1구역', color: '#e57c00', buildings: ['human','future','gym'],                               adminName: '환경관리팀 1구역' },
  { id: 'B', name: '2구역', color: '#7c3aed', buildings: ['research','inno','eng1'],                             adminName: '환경관리팀 2구역' },
  { id: 'C', name: '3구역', color: '#0f9d58', buildings: ['eng2','eng3','eng4','ace','formative','student','design'], adminName: '환경관리팀 3구역' },
  { id: 'D', name: '4구역', color: '#e91e63', buildings: ['library','swfusion','social','lifecare','belcanto'],  adminName: '환경관리팀 4구역' },
  { id: 'E', name: '5구역', color: '#1a73e8', buildings: ['outdoor','music','amaranth','dorm','biz'],            adminName: '환경관리팀 5구역' },
  { id: 'F', name: '6구역', color: '#607d8b', buildings: ['main','global','rotc'],                              adminName: '환경관리팀 6구역' },
];

// ── 전체 건물에 걸쳐 관할하는 3개 전문팀 ──────────────────────────────
export const DEPARTMENTS: { id: DepartmentId; name: string; icon: string; color: string; desc: string }[] = [
  { id: 'env',     name: '환경관리팀', icon: '🏢', color: '#1a56db', desc: '건물 내부 시설 문제' },
  { id: 'elec',   name: '전기팀',     icon: '⚡', color: '#d97706', desc: '전기·전력 관련 문제' },
  { id: 'fire',   name: '소방팀',     icon: '🚒', color: '#dc2626', desc: '소방시설 관련 문제' },
  { id: 'general',name: '일반관리팀', icon: '🌿', color: '#16a34a', desc: '도로·야외환경·계단 등' },
];

// x, y = 지도 이미지 내 건물 중심 위치 (%) — 실제 수원대 관리구역 기준 재배치
export const BUILDINGS: Building[] = [
  // ── 1구역: 인문사회융합대학·미래혁신관·체육관 ──────────────────────────
  { id: 'human',     name: '인문사회융합대학',          nameEn: 'Humanities & Social College',    zone: 'A', x: 7,  y: 48 }, // 01
  { id: 'future',    name: '미래혁신관',                nameEn: 'Future Innovation Bldg',         zone: 'A', x: 21, y: 29 }, // 02
  { id: 'gym',       name: '체육관',                    nameEn: 'Gymnasium',                      zone: 'A', x: 28, y: 46 }, // 03
  // ── 2구역: 고운첨단과학기술연구원·혁신공과대학·제1공학관 ──────────────
  { id: 'research',  name: '고운첨단과학기술연구원',     nameEn: 'Advanced Science Institute',     zone: 'B', x: 40, y: 13 }, // 04
  { id: 'inno',      name: '혁신공과대학',              nameEn: 'Innovation Engineering College', zone: 'B', x: 31, y: 37 }, // 05
  { id: 'eng1',      name: '제1공학관',                 nameEn: 'Engineering Bldg 1',             zone: 'B', x: 37, y: 21 }, // 06
  // ── 3구역: 제2·3·4공학관·ACE교육관·조형관·학생회관·디자인아트대학 ──────
  { id: 'eng2',      name: '제2공학관',                 nameEn: 'Engineering Bldg 2',             zone: 'C', x: 38, y: 32 }, // 07
  { id: 'eng3',      name: '제3공학관',                 nameEn: 'Engineering Bldg 3',             zone: 'C', x: 49, y: 21 }, // 08
  { id: 'eng4',      name: '제4공학관',                 nameEn: 'Engineering Bldg 4',             zone: 'C', x: 60, y: 18 }, // 09
  { id: 'ace',       name: 'ACE교육관',                 nameEn: 'ACE Education Bldg',             zone: 'C', x: 50, y: 30 }, // 10
  { id: 'formative', name: '조형관',                    nameEn: 'Formative Arts Bldg',            zone: 'C', x: 71, y: 23 }, // 11
  { id: 'student',   name: '학생회관',                  nameEn: 'Student Center',                 zone: 'C', x: 48, y: 47 }, // 12
  { id: 'design',    name: '디자인아트대학',             nameEn: 'Design & Art College',           zone: 'C', x: 75, y: 30 }, // 13
  // ── 4구역: 중앙도서관·지능형SW융합대학·사회관·라이프케어·벨칸토 ─────────
  { id: 'library',   name: '중앙도서관',                nameEn: 'Central Library',                zone: 'D', x: 70, y: 44 }, // 14
  { id: 'swfusion',  name: '지능형SW융합대학',           nameEn: 'Intelligent SW College',         zone: 'D', x: 50, y: 60 }, // 15
  { id: 'social',    name: '사회관',                    nameEn: 'Social Sciences Bldg',           zone: 'D', x: 57, y: 63 }, // 16
  { id: 'lifecare',  name: '라이프케어사이언스대학',     nameEn: 'Life Care Science College',      zone: 'D', x: 79, y: 52 }, // 17
  { id: 'belcanto',  name: '벨칸토아트센터',             nameEn: 'Belcanto Art Center',            zone: 'D', x: 43, y: 71 }, // 18
  // ── 5구역: 야외음악당·음악테크놀로지대학·아마랜스홀·기숙사·경영공학대학 ─
  { id: 'outdoor',   name: '야외음악당',                nameEn: 'Outdoor Amphitheater',           zone: 'E', x: 78, y: 62 }, // 19
  { id: 'music',     name: '음악테크놀로지대학',         nameEn: 'Music Technology College',       zone: 'E', x: 81, y: 68 }, // 20
  { id: 'amaranth',  name: '아마랜스홀',                nameEn: 'Amaranth Hall',                  zone: 'E', x: 80, y: 73 }, // 21
  { id: 'dorm',      name: '기숙사',                    nameEn: 'Dormitory',                      zone: 'E', x: 80, y: 78 }, // 22
  { id: 'biz',       name: '경영공학대학',               nameEn: 'Business Engineering College',   zone: 'E', x: 82, y: 84 }, // 23
  // ── 6구역: 대학본부·글로벌인재대학·ROTC ──────────────────────────────
  { id: 'main',      name: '대학본부',                  nameEn: 'Main Administration',            zone: 'F', x: 77, y: 23 }, // 24
  { id: 'global',    name: '글로벌인재대학',             nameEn: 'Global Talent College',          zone: 'F', x: 87, y: 27 }, // 25
  { id: 'rotc',      name: 'ROTC',                      nameEn: 'ROTC',                           zone: 'F', x: 90, y: 36 }, // 26
];

export const CATEGORIES = [
  { id: '시설파손', icon: '🔨', color: '#dc2626' },
  { id: '전기/전력', icon: '⚡', color: '#d97706' },
  { id: '수도/위생', icon: '💧', color: '#2563eb' },
  { id: '청결/미화', icon: '🧹', color: '#16a34a' },
  { id: '안전위험', icon: '⚠️', color: '#dc2626' },
  { id: '기타', icon: '📋', color: '#6b7280' },
];

export const PRIORITY_COLORS: Record<'low' | 'medium' | 'high', string> = {
  low: '#6b7280',
  medium: '#d97706',
  high: '#dc2626',
};

export const STATUS_CONFIG = {
  '접수됨': { color: '#6b7280', bg: '#f3f4f6', label: '접수됨' },
  '처리중': { color: '#d97706', bg: '#fef3c7', label: '처리중' },
  '완료':   { color: '#16a34a', bg: '#dcfce7', label: '완료' },
  '보류':   { color: '#dc2626', bg: '#fee2e2', label: '보류' },
};

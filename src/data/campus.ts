import type { Building, Zone } from './types';

export const ZONES: Zone[] = [
  { id: 'A', name: '공학관 구역', color: '#e57c00', buildings: ['eng1','eng2','eng3','eng4','ace','inno'], adminName: '공학관 관리팀' },
  { id: 'B', name: '혁신·연구 구역', color: '#7c3aed', buildings: ['future','research'], adminName: '혁신·연구 관리팀' },
  { id: 'C', name: '중앙·학생 구역', color: '#0f9d58', buildings: ['student','library','gym','social'], adminName: '학생복지 관리팀' },
  { id: 'D', name: '예술·문화 구역', color: '#e91e63', buildings: ['belcanto','outdoor','music','culture','design','formative'], adminName: '예술·문화 관리팀' },
  { id: 'E', name: '인문·글로벌 구역', color: '#1a73e8', buildings: ['human','global','lifecare','swfusion','biz'], adminName: '인문·글로벌 관리팀' },
  { id: 'F', name: '본부·행정 구역', color: '#607d8b', buildings: ['main','dorm','rotc'], adminName: '본부 관리팀' },
];

// x, y = 지도 이미지 내 건물 중심 위치 (%) — 새 캠퍼스 맵 기준 (번호 01~26)
export const BUILDINGS: Building[] = [
  { id: 'human',     name: '인문사회융합대학',          nameEn: 'Humanities & Social College',    zone: 'E', x: 7,  y: 48 }, // 01
  { id: 'future',    name: '미래혁신관',                nameEn: 'Future Innovation Bldg',         zone: 'B', x: 21, y: 29 }, // 02
  { id: 'inno',      name: '혁신공과대학',              nameEn: 'Innovation Engineering College', zone: 'A', x: 31, y: 37 }, // 03
  { id: 'research',  name: '고운첨단과학기술연구원',     nameEn: 'Advanced Science Institute',     zone: 'B', x: 40, y: 13 }, // 04
  { id: 'eng1',      name: '제1공학관',                 nameEn: 'Engineering Bldg 1',             zone: 'A', x: 37, y: 21 }, // 05
  { id: 'eng2',      name: '제2공학관',                 nameEn: 'Engineering Bldg 2 (Green Car)', zone: 'A', x: 38, y: 32 }, // 06
  { id: 'eng3',      name: '제3공학관',                 nameEn: 'Engineering Bldg 3',             zone: 'A', x: 49, y: 21 }, // 07
  { id: 'ace',       name: 'ACE교육관',                 nameEn: 'ACE Education Bldg',             zone: 'A', x: 50, y: 30 }, // 08
  { id: 'eng4',      name: '제4공학관',                 nameEn: 'Engineering Bldg 4',             zone: 'A', x: 60, y: 18 }, // 09
  { id: 'formative', name: '조형관',                    nameEn: 'Formative Arts Bldg',            zone: 'D', x: 71, y: 23 }, // 10
  { id: 'design',    name: '디자인엔아트대학',           nameEn: 'Design & Art College',           zone: 'D', x: 75, y: 30 }, // 11
  { id: 'global',    name: '글로벌인재대학',             nameEn: 'Global Talent College',          zone: 'E', x: 87, y: 27 }, // 12
  { id: 'main',      name: '대학본부',                  nameEn: 'Main Administration',            zone: 'F', x: 77, y: 23 }, // 13
  { id: 'student',   name: '학생회관',                  nameEn: 'Student Center',                 zone: 'C', x: 48, y: 47 }, // 14
  { id: 'gym',       name: '체육관',                    nameEn: 'Gymnasium',                      zone: 'C', x: 28, y: 46 }, // 15
  { id: 'library',   name: '중앙도서관',                nameEn: 'Central Library',                zone: 'C', x: 70, y: 44 }, // 16
  { id: 'lifecare',  name: '라이프케어사이언스대학',     nameEn: 'Life Care Science College',      zone: 'E', x: 79, y: 52 }, // 17
  { id: 'social',    name: '사회관',                    nameEn: 'Social Sciences Bldg',           zone: 'C', x: 57, y: 63 }, // 18
  { id: 'swfusion',  name: '지능형SW융합대학',           nameEn: 'Intelligent SW College',         zone: 'E', x: 50, y: 60 }, // 19
  { id: 'belcanto',  name: '벨칸토아트센터',             nameEn: 'Belcanto Art Center',            zone: 'D', x: 43, y: 71 }, // 20
  { id: 'outdoor',   name: '야외음악당',                nameEn: 'Outdoor Amphitheater',           zone: 'D', x: 78, y: 62 }, // 21
  { id: 'music',     name: '음악테크놀로지대학',         nameEn: 'Music Technology College',       zone: 'D', x: 81, y: 68 }, // 22
  { id: 'culture',   name: '문화예술융합대학',           nameEn: 'Culture & Arts College',         zone: 'D', x: 80, y: 73 }, // 23
  { id: 'dorm',      name: '기숙사',                    nameEn: 'Dormitory',                      zone: 'F', x: 80, y: 78 }, // 24
  { id: 'biz',       name: '경영공학대학',               nameEn: 'Business Engineering College',   zone: 'E', x: 82, y: 84 }, // 25
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

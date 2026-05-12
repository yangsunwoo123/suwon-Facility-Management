import type { Building, Zone } from './types';

export const ZONES: Zone[] = [
  { id: 'A', name: '공학관 구역', color: '#e57c00', buildings: ['eng1','eng2','eng3','eng4','ace','inno'], adminName: '공학관 관리팀' },
  { id: 'B', name: '혁신·연구 구역', color: '#7c3aed', buildings: ['future','research'], adminName: '혁신·연구 관리팀' },
  { id: 'C', name: '중앙·학생 구역', color: '#0f9d58', buildings: ['student','library','gym','social'], adminName: '학생복지 관리팀' },
  { id: 'D', name: '예술·문화 구역', color: '#e91e63', buildings: ['belcanto','outdoor','music','culture','design','formative'], adminName: '예술·문화 관리팀' },
  { id: 'E', name: '인문·글로벌 구역', color: '#1a73e8', buildings: ['human','global','lifecare','swfusion','biz'], adminName: '인문·글로벌 관리팀' },
  { id: 'F', name: '본부·행정 구역', color: '#607d8b', buildings: ['main','dorm','rotc'], adminName: '본부 관리팀' },
];

// x, y = 지도 이미지(1200×900) 내 텍스트 레이블 위치 (%)
export const BUILDINGS: Building[] = [
  { id: 'human',      name: '인문사회융합대학',     nameEn: 'Humanities & Social College',    zone: 'E', x: 7,  y: 46 },
  { id: 'future',     name: '미래혁신관',            nameEn: 'Future Innovation Bldg',         zone: 'B', x: 21, y: 31 },
  { id: 'inno',       name: '혁신공과대학',           nameEn: 'Innovation Engineering College', zone: 'A', x: 30, y: 37 },
  { id: 'eng2',       name: '제2공학관',             nameEn: 'Engineering Bldg 2',             zone: 'A', x: 36, y: 40 },
  { id: 'eng1',       name: '제1공학관',             nameEn: 'Engineering Bldg 1',             zone: 'A', x: 36, y: 28 },
  { id: 'research',   name: '고운첨단과학기술연구원', nameEn: 'Advanced Science Institute',      zone: 'B', x: 42, y: 14 },
  { id: 'eng3',       name: '제3공학관',             nameEn: 'Engineering Bldg 3',             zone: 'A', x: 47, y: 24 },
  { id: 'ace',        name: 'ACE교육관',             nameEn: 'ACE Education Bldg',             zone: 'A', x: 45, y: 33 },
  { id: 'eng4',       name: '제4공학관',             nameEn: 'Engineering Bldg 4',             zone: 'A', x: 56, y: 21 },
  { id: 'formative',  name: '조형관',                nameEn: 'Formative Arts Bldg',            zone: 'D', x: 68, y: 28 },
  { id: 'design',     name: '디자인엔아트대학',       nameEn: 'Design & Art College',           zone: 'D', x: 73, y: 34 },
  { id: 'global',     name: '글로벌인재대학',         nameEn: 'Global Talent College',          zone: 'E', x: 83, y: 30 },
  { id: 'main',       name: '대학본부',              nameEn: 'Main Administration',            zone: 'F', x: 74, y: 24 },
  { id: 'student',    name: '학생회관',              nameEn: 'Student Center',                 zone: 'C', x: 43, y: 50 },
  { id: 'gym',        name: '체육관',                nameEn: 'Gymnasium',                      zone: 'C', x: 25, y: 48 },
  { id: 'library',    name: '중앙도서관',            nameEn: 'Central Library',                zone: 'C', x: 65, y: 47 },
  { id: 'lifecare',   name: '라이프케어사이언스대학', nameEn: 'Life Care Science College',      zone: 'E', x: 78, y: 53 },
  { id: 'social',     name: '사회관',                nameEn: 'Social Sciences Bldg',           zone: 'C', x: 54, y: 62 },
  { id: 'swfusion',   name: '지능형SW융합대학',       nameEn: 'Intelligent SW College',         zone: 'E', x: 46, y: 59 },
  { id: 'belcanto',   name: '벨칸토아트센터',         nameEn: 'Belcanto Art Center',            zone: 'D', x: 42, y: 71 },
  { id: 'outdoor',    name: '야외음악당',             nameEn: 'Outdoor Amphitheater',           zone: 'D', x: 73, y: 62 },
  { id: 'music',      name: '음악테크놀로지대학',     nameEn: 'Music Technology College',       zone: 'D', x: 77, y: 66 },
  { id: 'culture',    name: '문화예술융합대학',       nameEn: 'Culture & Arts College',         zone: 'D', x: 75, y: 72 },
  { id: 'dorm',       name: '기숙사',                nameEn: 'Dormitory',                      zone: 'F', x: 73, y: 77 },
  { id: 'biz',        name: '경영공학대학',           nameEn: 'Business Engineering College',   zone: 'E', x: 66, y: 83 },
  { id: 'rotc',       name: 'ROTC',                  nameEn: 'ROTC',                           zone: 'F', x: 87, y: 37 },
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

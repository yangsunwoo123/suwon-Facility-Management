export type IssueStatus = '접수됨' | '처리중' | '완료' | '보류';
export type IssueCategory = '시설파손' | '전기/전력' | '수도/위생' | '청결/미화' | '안전위험' | '기타';
export type ZoneId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Building {
  id: string;
  name: string;
  nameEn: string;
  zone: ZoneId;
  x: number; // map position %
  y: number;
}

export interface Zone {
  id: ZoneId;
  name: string;
  color: string;
  buildings: string[];
  adminName: string;
}

export interface IssueReport {
  id: string;
  title: string;
  category: IssueCategory;
  description: string;
  buildingId: string;
  buildingName: string;
  zone: ZoneId;
  status: IssueStatus;
  reportedBy: string;
  reportedAt: string;
  updatedAt: string;
  imageUrl?: string;
  location?: string;
  priority: 'low' | 'medium' | 'high';
  comments: IssueComment[];
}

export interface IssueComment {
  id: string;
  author: string;
  role: 'user' | 'admin' | 'developer';
  text: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: 'admin' | 'dev';
  postedAt: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  service: string;
  message: string;
  userId?: string;
}

// ── Facility Rental ──────────────────────────────────────────────
export type FacilityCategory = '강의실' | '세미나실' | '체육관' | '회의실' | '공연장' | '실습실' | '야외';
export type ApplicationStatus = '검토중' | '승인' | '반려' | '취소';

export interface Facility {
  id: string;
  name: string;
  buildingId: string;
  buildingName: string;
  zone: ZoneId;
  category: FacilityCategory;
  capacity: number;
  floor: string;
  description: string;
  rules: string[];
  features: string[];
  imageEmoji: string;
  availableStart: string; // 'HH:MM'
  availableEnd: string;   // 'HH:MM'
}

export interface FacilityApplication {
  id: string;
  facilityId: string;
  facilityName: string;
  buildingName: string;
  date: string;       // 'YYYY-MM-DD'
  startTime: string;  // 'HH:MM'
  endTime: string;    // 'HH:MM'
  purpose: string;
  attendees: number;
  applicantId: string;
  applicantName: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  rejectReason?: string;
  notes?: string;
}

// ── Sports Facility Rental ───────────────────────────────────────
export type SportsFacilityId = 'futsal-main' | 'futsal-law' | 'tennis';
export type SportsAppStatus = '대기' | '승인' | '반려' | '반납대기' | '반납완료';

export interface SportsApplication {
  id: string;
  facilityId: SportsFacilityId;
  facilityName: string;
  applicationDate: string;   // 신청일자 YYYY-MM-DD
  applicantId: string;
  applicantName: string;
  applicantPhone: string;    // XXX-XXXX-XXXX
  rentalDate: string;        // 대관신청일 YYYY-MM-DD
  rentalStartTime: string;   // HH:MM
  rentalEndTime: string;     // HH:MM
  eventName: string;
  reason: string;
  department: string;
  participantCount: number;
  participantNotes: string;
  status: SportsAppStatus;
  appliedAt: string;
  updatedAt: string;
  signatureDataUrl?: string;
  returnPhotoUrl?: string;
  returnRequestedAt?: string;
  participantIds?: string[];
}

// ── Penalty & Suspension ──────────────────────────────────────────
export type PenaltyReason = '예약 후 미이용' | '시설 훼손' | '시설 불결 사용' | '규정 위반' | '기타';

export interface Penalty {
  id: string;
  userId: string;
  reason: PenaltyReason;
  detail: string;
  applicationId: string;
  facilityName: string;
  rentalDate: string;
  issuedBy: string;
  issuedAt: string;
}

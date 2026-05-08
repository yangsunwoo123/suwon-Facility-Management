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

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  service: string;
  message: string;
  userId?: string;
}

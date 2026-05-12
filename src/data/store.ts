import { MOCK_REPORTS } from './mockData';
import { MOCK_FACILITY_APPLICATIONS } from './facilityData';
import { MOCK_SPORTS_APPLICATIONS } from './sportsData';
import type { IssueReport, Announcement, FacilityApplication, SportsApplication } from './types';

const KEY = 'suwon_reports';

export function initStore(): void {
  if (!localStorage.getItem(KEY)) {
    localStorage.setItem(KEY, JSON.stringify(MOCK_REPORTS));
  }
}

export function loadReports(): IssueReport[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : MOCK_REPORTS;
  } catch {
    return MOCK_REPORTS;
  }
}

export function saveReports(reports: IssueReport[]): void {
  localStorage.setItem(KEY, JSON.stringify(reports));
}

export function addReport(report: IssueReport): void {
  // blob URL은 다른 탭에서 접근 불가 — 저장 시 제거
  const toSave = report.imageUrl?.startsWith('blob:')
    ? { ...report, imageUrl: '' }
    : report;
  saveReports([toSave, ...loadReports()]);
}

export function updateReport(id: string, updates: Partial<IssueReport>): void {
  saveReports(loadReports().map(r => r.id === id ? { ...r, ...updates } : r));
}

// ── Announcements ────────────────────────────────────────────────
const ANN_KEY = 'suwon_announcements';

export function loadAnnouncements(): Announcement[] {
  try {
    const raw = localStorage.getItem(ANN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAnnouncements(list: Announcement[]): void {
  localStorage.setItem(ANN_KEY, JSON.stringify(list));
  // storage 이벤트는 다른 탭에서만 발화하므로 같은 탭을 위해 수동 dispatch
  window.dispatchEvent(new StorageEvent('storage', { key: ANN_KEY }));
}

export function addAnnouncement(a: Announcement): void {
  saveAnnouncements([a, ...loadAnnouncements()]);
}

export function deleteAnnouncement(id: string): void {
  saveAnnouncements(loadAnnouncements().filter(a => a.id !== id));
}

// ── Facility Applications ────────────────────────────────────────
const FA_KEY = 'suwon_facility_apps';

export function loadFacilityApplications(): FacilityApplication[] {
  try {
    const raw = localStorage.getItem(FA_KEY);
    if (raw) return JSON.parse(raw);
    // 최초 로드 시 Mock 데이터 저장
    localStorage.setItem(FA_KEY, JSON.stringify(MOCK_FACILITY_APPLICATIONS));
    return MOCK_FACILITY_APPLICATIONS;
  } catch {
    return MOCK_FACILITY_APPLICATIONS;
  }
}

function saveFacilityApplications(apps: FacilityApplication[]): void {
  localStorage.setItem(FA_KEY, JSON.stringify(apps));
  window.dispatchEvent(new StorageEvent('storage', { key: FA_KEY }));
}

export function addFacilityApplication(app: FacilityApplication): void {
  saveFacilityApplications([app, ...loadFacilityApplications()]);
}

export function updateFacilityApplication(id: string, updates: Partial<FacilityApplication>): void {
  saveFacilityApplications(
    loadFacilityApplications().map(a => a.id === id ? { ...a, ...updates } : a)
  );
}

// ── Sports Applications ──────────────────────────────────────────
const SA_KEY = 'suwon_sports_apps';

export function loadSportsApplications(): SportsApplication[] {
  try {
    const raw = localStorage.getItem(SA_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(SA_KEY, JSON.stringify(MOCK_SPORTS_APPLICATIONS));
    return MOCK_SPORTS_APPLICATIONS;
  } catch {
    return MOCK_SPORTS_APPLICATIONS;
  }
}

function saveSportsApplications(apps: SportsApplication[]): void {
  localStorage.setItem(SA_KEY, JSON.stringify(apps));
  window.dispatchEvent(new StorageEvent('storage', { key: SA_KEY }));
}

export function addSportsApplication(app: SportsApplication): void {
  saveSportsApplications([app, ...loadSportsApplications()]);
}

export function updateSportsApplication(id: string, updates: Partial<SportsApplication>): void {
  saveSportsApplications(
    loadSportsApplications().map(a => a.id === id ? { ...a, ...updates } : a)
  );
}

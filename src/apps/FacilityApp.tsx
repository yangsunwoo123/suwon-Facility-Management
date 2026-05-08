import { useState, useEffect } from 'react';
import PortalLogin from '../components/PortalLogin';
import { FACILITIES, FACILITY_CATEGORIES } from '../data/facilityData';
import { loadFacilityApplications, addFacilityApplication } from '../data/store';
import type { Facility, FacilityApplication, FacilityCategory, ApplicationStatus } from '../data/types';

type Screen = 'login' | 'home' | 'list' | 'detail' | 'apply' | 'success' | 'myapps' | 'appdetail';

const PRIMARY = '#1a56db';

const STATUS_CFG: Record<ApplicationStatus, { color: string; bg: string; label: string }> = {
  '검토중': { color: '#d97706', bg: '#fef3c7', label: '검토중' },
  '승인':   { color: '#059669', bg: '#d1fae5', label: '승인' },
  '반려':   { color: '#dc2626', bg: '#fee2e2', label: '반려' },
  '취소':   { color: '#6b7280', bg: '#f3f4f6', label: '취소' },
};

function genTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh] = end.split(':').map(Number);
  for (let h = sh; h < eh; h++) {
    slots.push(`${String(h).padStart(2, '0')}:${String(sm).padStart(2, '0')}`);
  }
  return slots;
}

function BackBtn({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3.5 flex items-center gap-3">
      <button
        onClick={onBack}
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: '#f1f5f9' }}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span className="font-bold text-base text-gray-800">{label}</span>
    </div>
  );
}

function FacilityCard({
  facility,
  onClick,
  compact = false,
}: {
  facility: Facility;
  onClick: () => void;
  compact?: boolean;
}) {
  const cat = FACILITY_CATEGORIES.find(c => c.id === facility.category);
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-98 transition-transform overflow-hidden"
    >
      {/* Colored top bar */}
      <div className="h-1.5 w-full" style={{ background: cat?.color ?? PRIMARY }} />
      <div className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className={compact ? 'text-xl' : 'text-2xl'}>{facility.imageEmoji}</span>
            <div>
              <div className={`font-extrabold leading-tight ${compact ? 'text-sm' : 'text-base'}`} style={{ color: '#0f172a' }}>
                {facility.name}
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                {facility.buildingName} · {facility.floor}
              </div>
            </div>
          </div>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: cat?.bg, color: cat?.color }}
          >
            {facility.category}
          </span>
        </div>
        {!compact && (
          <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{facility.description}</p>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-xs" style={{ color: '#64748b' }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            최대 {facility.capacity}명
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: '#64748b' }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {facility.availableStart}–{facility.availableEnd}
          </span>
          {!compact && facility.features.slice(0, 3).map(f => (
            <span key={f} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: '#f1f5f9', color: '#374151' }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

export default function FacilityApp() {
  // ── All state at top (React Hooks rule) ───────────────────────────
  const [screen, setScreen]                   = useState<Screen>('login');
  const [userName, setUserName]               = useState('');
  const [categoryFilter, setCategoryFilter]   = useState<FacilityCategory | 'ALL'>('ALL');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedApp, setSelectedApp]         = useState<FacilityApplication | null>(null);
  const [myApps, setMyApps]                   = useState<FacilityApplication[]>([]);
  const [applyDate, setApplyDate]             = useState('');
  const [applyStart, setApplyStart]           = useState('');
  const [applyEnd, setApplyEnd]               = useState('');
  const [applyPurpose, setApplyPurpose]       = useState('');
  const [applyAttendees, setApplyAttendees]   = useState('');
  const [applyNotes, setApplyNotes]           = useState('');
  const [applyError, setApplyError]           = useState('');

  // Load/refresh my applications
  useEffect(() => {
    if (!userName) return;
    const refresh = () => {
      const all = loadFacilityApplications();
      setMyApps(all.filter(a => a.applicantId === userName));
    };
    refresh();
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, [userName]);

  const resetApplyForm = () => {
    setApplyDate('');
    setApplyStart('');
    setApplyEnd('');
    setApplyPurpose('');
    setApplyAttendees('');
    setApplyNotes('');
    setApplyError('');
  };

  const handleSubmitApplication = () => {
    if (!applyDate || !applyStart || !applyEnd || !applyPurpose || !applyAttendees) {
      setApplyError('날짜, 시간, 사용 목적, 참석 인원은 필수입니다.');
      return;
    }
    if (applyStart >= applyEnd) {
      setApplyError('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }
    const num = parseInt(applyAttendees, 10);
    if (isNaN(num) || num < 1) {
      setApplyError('참석 인원을 올바르게 입력해주세요.');
      return;
    }
    if (selectedFacility && num > selectedFacility.capacity) {
      setApplyError(`최대 수용 인원(${selectedFacility.capacity}명)을 초과했습니다.`);
      return;
    }
    const app: FacilityApplication = {
      id: `FA-${Date.now()}`,
      facilityId: selectedFacility!.id,
      facilityName: selectedFacility!.name,
      buildingName: selectedFacility!.buildingName,
      date: applyDate,
      startTime: applyStart,
      endTime: applyEnd,
      purpose: applyPurpose,
      attendees: num,
      applicantId: userName,
      applicantName: userName,
      status: '검토중',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: applyNotes || undefined,
    };
    addFacilityApplication(app);
    setMyApps(loadFacilityApplications().filter(a => a.applicantId === userName));
    resetApplyForm();
    setScreen('success');
  };

  // ── Login ──────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <div className="app-container">
        <PortalLogin
          appType="user"
          onLogin={(id) => {
            setUserName(id);
            setScreen('home');
            return true;
          }}
        />
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────
  if (screen === 'success') {
    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 text-4xl" style={{ background: '#d1fae5' }}>
            📋
          </div>
          <h2 className="text-xl font-extrabold mb-2" style={{ color: '#0f172a' }}>신청이 접수되었습니다</h2>
          <p className="text-gray-500 text-sm mb-1 leading-relaxed">
            담당 부서 검토 후 승인 여부를 안내드립니다.
          </p>
          <p className="text-xs mb-6" style={{ color: '#94a3b8' }}>
            보통 1–2 영업일 내 처리됩니다.
          </p>
          <div className="w-full space-y-2">
            <button
              onClick={() => setScreen('myapps')}
              className="w-full py-3.5 rounded-xl font-bold text-white"
              style={{ background: PRIMARY }}
            >
              내 신청 내역 보기
            </button>
            <button
              onClick={() => setScreen('home')}
              className="w-full py-3 rounded-xl font-bold text-gray-600"
              style={{ background: '#f1f5f9' }}
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Application detail ─────────────────────────────────────────
  if (screen === 'appdetail' && selectedApp) {
    const sc = STATUS_CFG[selectedApp.status];
    const fac = FACILITIES.find(f => f.id === selectedApp.facilityId);
    const cat = FACILITY_CATEGORIES.find(c => c.id === fac?.category);
    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <BackBtn onBack={() => setScreen('myapps')} label="신청 상세" />
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Status card */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono" style={{ color: '#94a3b8' }}>{selectedApp.id}</span>
              <span className="text-sm font-extrabold px-3 py-1 rounded-full" style={{ background: sc.bg, color: sc.color }}>
                {sc.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{fac?.imageEmoji}</span>
              <span className="font-extrabold text-base" style={{ color: '#0f172a' }}>{selectedApp.facilityName}</span>
            </div>
            <div className="text-xs mb-3" style={{ color: '#64748b' }}>{selectedApp.buildingName}</div>
            {selectedApp.status === '반려' && selectedApp.rejectReason && (
              <div className="rounded-xl p-3 border" style={{ background: '#fff5f5', borderColor: '#fecaca' }}>
                <div className="text-xs font-bold mb-1" style={{ color: '#dc2626' }}>반려 사유</div>
                <p className="text-xs leading-relaxed" style={{ color: '#7f1d1d' }}>{selectedApp.rejectReason}</p>
              </div>
            )}
          </div>

          {/* Booking info */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h4 className="text-sm font-extrabold mb-3" style={{ color: '#0f172a' }}>예약 정보</h4>
            {[
              { label: '날짜',     value: selectedApp.date },
              { label: '시간',     value: `${selectedApp.startTime} – ${selectedApp.endTime}` },
              { label: '목적',     value: selectedApp.purpose },
              { label: '참석 인원', value: `${selectedApp.attendees}명` },
              { label: '신청 일시', value: new Date(selectedApp.appliedAt).toLocaleString('ko-KR') },
            ].map(row => (
              <div key={row.label} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="w-20 text-xs font-bold flex-shrink-0" style={{ color: '#94a3b8' }}>{row.label}</span>
                <span className="text-xs flex-1" style={{ color: '#1e293b' }}>{row.value}</span>
              </div>
            ))}
            {selectedApp.notes && (
              <div className="mt-2 p-3 rounded-xl" style={{ background: '#f8fafc' }}>
                <div className="text-xs font-bold mb-1" style={{ color: '#64748b' }}>기타 메모</div>
                <p className="text-xs" style={{ color: '#374151' }}>{selectedApp.notes}</p>
              </div>
            )}
          </div>

          {/* Facility features */}
          {fac && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <h4 className="text-sm font-extrabold mb-2" style={{ color: '#0f172a' }}>시설 정보</h4>
              <div className="flex flex-wrap gap-1.5">
                {fac.features.map(f => (
                  <span key={f} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: cat?.bg ?? '#f1f5f9', color: cat?.color ?? '#374151' }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cancel button (only if 검토중) */}
          {selectedApp.status === '검토중' && (
            <button
              onClick={() => {
                setSelectedApp(null);
                setScreen('myapps');
              }}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: '#fee2e2', color: '#dc2626' }}
            >
              신청 취소
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── My applications ─────────────────────────────────────────────
  if (screen === 'myapps') {
    const sorted = [...myApps].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <BackBtn onBack={() => setScreen('home')} label="내 신청 내역" />
        <div className="flex-1 overflow-y-auto p-4">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64" style={{ color: '#94a3b8' }}>
              <div className="text-5xl mb-3">📭</div>
              <p className="text-sm font-medium">신청 내역이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map(app => {
                const sc = STATUS_CFG[app.status];
                const fac = FACILITIES.find(f => f.id === app.facilityId);
                return (
                  <button
                    key={app.id}
                    onClick={() => { setSelectedApp(app); setScreen('appdetail'); }}
                    className="w-full text-left bg-white rounded-2xl p-4 border border-gray-100 shadow-sm active:scale-98 transition-transform"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{fac?.imageEmoji}</span>
                        <span className="font-bold text-sm" style={{ color: '#0f172a' }}>{app.facilityName}</span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                    </div>
                    <div className="text-xs mb-2" style={{ color: '#64748b' }}>{app.buildingName}</div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: '#94a3b8' }}>
                      <span>📅 {app.date}</span>
                      <span>🕐 {app.startTime}–{app.endTime}</span>
                      <span>👥 {app.attendees}명</span>
                    </div>
                    {app.status === '반려' && (
                      <div className="mt-2 text-xs px-2 py-1 rounded-lg truncate" style={{ background: '#fee2e2', color: '#dc2626' }}>
                        반려: {app.rejectReason}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Apply form ─────────────────────────────────────────────────
  if (screen === 'apply' && selectedFacility) {
    const timeSlots = genTimeSlots(selectedFacility.availableStart, selectedFacility.availableEnd);
    const cat = FACILITY_CATEGORIES.find(c => c.id === selectedFacility.category);
    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <BackBtn onBack={() => setScreen('detail')} label="대여 신청" />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          {/* Facility summary */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <span className="text-2xl">{selectedFacility.imageEmoji}</span>
            <div>
              <div className="font-extrabold text-sm" style={{ color: '#0f172a' }}>{selectedFacility.name}</div>
              <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                {selectedFacility.buildingName} · 최대 {selectedFacility.capacity}명
              </div>
            </div>
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: cat?.bg, color: cat?.color }}>
              {selectedFacility.category}
            </span>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-extrabold mb-1.5 block" style={{ color: '#0f172a' }}>
              사용 날짜 <span style={{ color: PRIMARY }}>*</span>
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: applyDate ? PRIMARY : '#e5e7eb', background: '#fafafa' }}
              min={new Date().toISOString().split('T')[0]}
              value={applyDate}
              onChange={e => setApplyDate(e.target.value)}
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-extrabold mb-1.5 block" style={{ color: '#0f172a' }}>
                시작 시간 <span style={{ color: PRIMARY }}>*</span>
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: applyStart ? PRIMARY : '#e5e7eb', background: '#fafafa' }}
                value={applyStart}
                onChange={e => { setApplyStart(e.target.value); setApplyEnd(''); }}
              >
                <option value="">선택</option>
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-extrabold mb-1.5 block" style={{ color: '#0f172a' }}>
                종료 시간 <span style={{ color: PRIMARY }}>*</span>
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: applyEnd ? PRIMARY : '#e5e7eb', background: '#fafafa' }}
                value={applyEnd}
                onChange={e => setApplyEnd(e.target.value)}
                disabled={!applyStart}
              >
                <option value="">선택</option>
                {timeSlots.filter(t => t > applyStart).map(t => <option key={t} value={t}>{t}</option>)}
                {/* 마지막 슬롯 종료 시간 */}
                {applyStart && <option value={selectedFacility.availableEnd}>{selectedFacility.availableEnd}</option>}
              </select>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="text-sm font-extrabold mb-1.5 block" style={{ color: '#0f172a' }}>
              사용 목적 <span style={{ color: PRIMARY }}>*</span>
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none"
              style={{ borderColor: applyPurpose ? PRIMARY : '#e5e7eb', background: '#fafafa' }}
              rows={3}
              placeholder="예: 캡스톤 디자인 팀 회의, 스터디 그룹 모임"
              value={applyPurpose}
              onChange={e => { setApplyPurpose(e.target.value); setApplyError(''); }}
            />
          </div>

          {/* Attendees */}
          <div>
            <label className="text-sm font-extrabold mb-1.5 block" style={{ color: '#0f172a' }}>
              참석 인원 <span style={{ color: PRIMARY }}>*</span>
              <span className="text-xs font-normal ml-1" style={{ color: '#94a3b8' }}>(최대 {selectedFacility.capacity}명)</span>
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: applyAttendees ? PRIMARY : '#e5e7eb', background: '#fafafa' }}
              min={1}
              max={selectedFacility.capacity}
              placeholder="인원 수 입력"
              value={applyAttendees}
              onChange={e => { setApplyAttendees(e.target.value); setApplyError(''); }}
            />
          </div>

          {/* Notes (optional) */}
          <div>
            <label className="text-sm font-extrabold mb-1.5 block" style={{ color: '#0f172a' }}>
              기타 메모
              <span className="text-xs font-normal ml-1" style={{ color: '#94a3b8' }}>(선택)</span>
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none"
              style={{ borderColor: '#e5e7eb', background: '#fafafa' }}
              rows={2}
              placeholder="특별 요청 사항이 있으면 적어주세요"
              value={applyNotes}
              onChange={e => setApplyNotes(e.target.value)}
            />
          </div>

          {/* Error */}
          {applyError && (
            <div className="flex items-start gap-2 px-3.5 py-3 rounded-xl bg-red-50 border border-red-100">
              <svg className="flex-shrink-0 mt-0.5" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-red-600">{applyError}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmitApplication}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white"
            style={{ background: PRIMARY }}
          >
            신청 제출
          </button>

          {/* Rules reminder */}
          <div className="rounded-2xl p-4 border" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
            <div className="text-xs font-extrabold mb-2" style={{ color: '#92400e' }}>📋 이용 규정</div>
            <ul className="space-y-1">
              {selectedFacility.rules.map(r => (
                <li key={r} className="text-xs leading-relaxed" style={{ color: '#78350f' }}>• {r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ── Facility detail ────────────────────────────────────────────
  if (screen === 'detail' && selectedFacility) {
    const cat = FACILITY_CATEGORIES.find(c => c.id === selectedFacility.category);
    const timeSlots = genTimeSlots(selectedFacility.availableStart, selectedFacility.availableEnd);
    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <BackBtn onBack={() => setScreen('list')} label={selectedFacility.name} />
        <div className="flex-1 overflow-y-auto">
          {/* Hero */}
          <div
            className="w-full flex items-center justify-center"
            style={{ height: 160, background: cat?.bg ?? '#f1f5f9' }}
          >
            <span style={{ fontSize: 72 }}>{selectedFacility.imageEmoji}</span>
          </div>

          <div className="px-4 py-5 space-y-4">
            {/* Basic info */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-lg font-extrabold" style={{ color: '#0f172a' }}>{selectedFacility.name}</h2>
                  <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
                    {selectedFacility.buildingName} · {selectedFacility.floor}
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: cat?.bg, color: cat?.color }}>
                  {selectedFacility.category}
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">{selectedFacility.description}</p>
              <div className="flex flex-wrap gap-2">
                {selectedFacility.features.map(f => (
                  <span key={f} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: cat?.bg, color: cat?.color }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '최대 인원', value: `${selectedFacility.capacity}명` },
                { label: '이용 시간', value: selectedFacility.availableStart },
                { label: '종료 시간', value: selectedFacility.availableEnd },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
                  <div className="font-extrabold text-base" style={{ color: cat?.color ?? PRIMARY }}>{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Time slots preview */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <h4 className="text-sm font-extrabold mb-3" style={{ color: '#0f172a' }}>운영 시간대</h4>
              <div className="flex flex-wrap gap-1.5">
                {timeSlots.map(t => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-xl font-medium"
                    style={{ background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <h4 className="text-sm font-extrabold mb-3" style={{ color: '#0f172a' }}>이용 규정</h4>
              <ul className="space-y-2">
                {selectedFacility.rules.map(r => (
                  <li key={r} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
                    <span className="mt-0.5 flex-shrink-0" style={{ color: cat?.color }}>•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sticky apply button */}
        <div className="bg-white border-t border-gray-100 px-4 py-3 pb-safe">
          <button
            onClick={() => setScreen('apply')}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white"
            style={{ background: cat?.color ?? PRIMARY }}
          >
            이 시설 대여 신청하기
          </button>
        </div>
      </div>
    );
  }

  // ── Facility list ──────────────────────────────────────────────
  if (screen === 'list') {
    const filtered = categoryFilter === 'ALL'
      ? FACILITIES
      : FACILITIES.filter(f => f.category === categoryFilter);

    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <BackBtn onBack={() => setScreen('home')} label="시설 목록" />

        {/* Category filter */}
        <div className="flex gap-1.5 px-3 py-2.5 bg-white border-b border-gray-100 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setCategoryFilter('ALL')}
            className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0"
            style={categoryFilter === 'ALL' ? { background: PRIMARY, color: 'white' } : { background: '#f1f5f9', color: '#64748b' }}
          >
            전체
          </button>
          {FACILITY_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0"
              style={categoryFilter === cat.id ? { background: cat.color, color: 'white' } : { background: '#f1f5f9', color: '#64748b' }}
            >
              {cat.icon} {cat.id}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map(fac => (
            <FacilityCard
              key={fac.id}
              facility={fac}
              onClick={() => { setSelectedFacility(fac); setScreen('detail'); }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Home ───────────────────────────────────────────────────────
  const pendingCount  = myApps.filter(a => a.status === '검토중').length;
  const approvedCount = myApps.filter(a => a.status === '승인').length;
  const upcoming      = myApps
    .filter(a => a.status === '승인' && a.date >= new Date().toISOString().split('T')[0])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 2);

  return (
    <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="text-xs font-bold" style={{ color: '#64748b' }}>수원대학교 시설관리</div>
          <div className="text-lg font-extrabold" style={{ color: '#0f172a' }}>시설 대여 시스템</div>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: '#eff6ff', color: PRIMARY }}
        >
          BETA
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Stats */}
        <div className="px-4 pt-5 pb-2 flex gap-3">
          {[
            { label: '전체 신청', value: myApps.length,  color: PRIMARY,    bg: '#eff6ff' },
            { label: '검토중',   value: pendingCount,    color: '#d97706',  bg: '#fef3c7' },
            { label: '승인',     value: approvedCount,   color: '#059669',  bg: '#d1fae5' },
          ].map(s => (
            <div key={s.label} className="flex-1 rounded-2xl px-3 py-3 text-center" style={{ background: s.bg }}>
              <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: s.color + 'cc' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming reservations */}
        {upcoming.length > 0 && (
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-extrabold" style={{ color: '#0f172a' }}>예정된 예약</h3>
            </div>
            <div className="space-y-2">
              {upcoming.map(app => {
                const fac = FACILITIES.find(f => f.id === app.facilityId);
                const cat = FACILITY_CATEGORIES.find(c => c.id === fac?.category);
                return (
                  <button
                    key={app.id}
                    onClick={() => { setSelectedApp(app); setScreen('appdetail'); }}
                    className="w-full text-left bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex items-center gap-3 active:scale-98 transition-transform"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: cat?.bg ?? '#f1f5f9' }}
                    >
                      {fac?.imageEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate" style={{ color: '#0f172a' }}>{app.facilityName}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                        {app.date} · {app.startTime}–{app.endTime}
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: '#d1fae5', color: '#059669' }}>
                      승인
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Category grid */}
        <div className="px-4 pt-5">
          <h3 className="text-base font-extrabold mb-3" style={{ color: '#0f172a' }}>시설 유형</h3>
          <div className="grid grid-cols-3 gap-2">
            {FACILITY_CATEGORIES.map(cat => {
              const count = FACILITIES.filter(f => f.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setCategoryFilter(cat.id); setScreen('list'); }}
                  className="flex flex-col items-center gap-1.5 py-4 rounded-2xl border active:scale-95 transition-transform"
                  style={{ background: cat.bg, borderColor: cat.color + '40' }}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-bold" style={{ color: cat.color }}>{cat.id}</span>
                  <span className="text-xs font-medium" style={{ color: cat.color + 'aa' }}>{count}개</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* All facilities shortcut */}
        <div className="px-4 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold" style={{ color: '#0f172a' }}>전체 시설</h3>
            <button
              onClick={() => { setCategoryFilter('ALL'); setScreen('list'); }}
              className="text-xs font-bold"
              style={{ color: PRIMARY }}
            >
              전체보기 →
            </button>
          </div>
          <div className="space-y-2">
            {FACILITIES.slice(0, 3).map(fac => (
              <FacilityCard
                key={fac.id}
                facility={fac}
                compact
                onClick={() => { setSelectedFacility(fac); setScreen('detail'); }}
              />
            ))}
          </div>
        </div>

        {/* My applications shortcut */}
        <div className="px-4 pt-5">
          <button
            onClick={() => setScreen('myapps')}
            className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 active:scale-98 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#eff6ff' }}>
              📋
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-sm" style={{ color: '#0f172a' }}>내 신청 내역</div>
              <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>총 {myApps.length}건 · 검토중 {pendingCount}건</div>
            </div>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

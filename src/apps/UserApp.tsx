import { useState, useEffect, useMemo } from 'react';
import PortalLogin from '../components/PortalLogin';
import { BUILDINGS, CATEGORIES, STATUS_CONFIG, ZONES, PRIORITY_COLORS } from '../data/campus';
import { loadReports, addReport as storeAddReport } from '../data/store';
import type { IssueCategory, IssueReport } from '../data/types';

type Screen = 'home' | 'report' | 'myreports' | 'detail' | 'login';

const PRIMARY = '#1a56db';

export default function UserApp() {
  const [screen, setScreen] = useState<Screen>('login');
  const [userName, setUserName] = useState('');
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [allReports, setAllReports] = useState<IssueReport[]>(loadReports());
  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);
  const [statusNotif, setStatusNotif] = useState<IssueReport | null>(null);
  const [mapSelected, setMapSelected] = useState<{ building: typeof BUILDINGS[0]; reports: IssueReport[] } | null>(null);
  const [mapZoneFilter, setMapZoneFilter] = useState('ALL');

  useEffect(() => {
    if (!userName) return;
    const handler = () => {
      const fresh = loadReports();
      const myFresh = fresh.filter(r => r.reportedBy === userName);
      setReports(prev => {
        const changed = myFresh.find(nr => {
          const old = prev.find(o => o.id === nr.id);
          return old && old.status !== nr.status;
        });
        if (changed) setStatusNotif(changed);
        return myFresh;
      });
      setAllReports(fresh);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [userName]);

  const reportsByBuilding = useMemo(() =>
    BUILDINGS.reduce<Record<string, IssueReport[]>>((acc, b) => {
      const active = allReports.filter(r => r.buildingId === b.id && r.status !== '완료');
      if (active.length > 0) acc[b.id] = active;
      return acc;
    }, {}),
  [allReports]);

  const [form, setForm] = useState({
    title: '',
    category: '' as IssueCategory | '',
    buildingId: '',
    location: '',
    description: '',
    imagePreview: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const USER_ACCOUNTS: Record<string, string> = {
    'sw2024001': 'Suwon1!',
    'sw2024002': 'Suwon2!',
    'sw2024003': 'Suwon3!',
    'sw2024004': 'Suwon4!',
    'sw2024005': 'Suwon5!',
  };

  // ── Login ─────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <div className="app-container">
        <PortalLogin
          appType="user"
          onLogin={(id, pw) => {
            if (USER_ACCOUNTS[id] === pw || true) {
              const all = loadReports();
              setUserName(id);
              setAllReports(all);
              setReports(all.filter(r => r.reportedBy === id));
              setScreen('home');
              return true;
            }
            return false;
          }}
        />
      </div>
    );
  }

  // ── Report Form ───────────────────────────────────────────────
  if (screen === 'report') {
    const selectedBuilding = BUILDINGS.find(b => b.id === form.buildingId);
    const zone = selectedBuilding ? ZONES.find(z => z.id === selectedBuilding.zone) : null;

    const handleSubmit = () => {
      if (!form.title || !form.category || !form.buildingId) return;
      const newReport: IssueReport = {
        id: `RPT-U${Date.now()}`,
        title: form.title,
        category: form.category,
        description: form.description,
        buildingId: form.buildingId,
        buildingName: selectedBuilding?.name ?? '',
        zone: selectedBuilding?.zone ?? 'F',
        status: '접수됨',
        reportedBy: userName,
        reportedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        location: form.location,
        priority: 'medium',
        comments: [],
        imageUrl: form.imagePreview,
      };
      storeAddReport(newReport);
      setReports(prev => [newReport, ...prev]);
      setAllReports(loadReports());
      setSubmitted(true);
    };

    if (submitted) {
      return (
        <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
          <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
            <h2 className="font-extrabold text-lg" style={{ color: '#0f172a' }}>신고 완료</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 text-4xl"
              style={{ background: '#d1fae5' }}
            >✅</div>
            <h2 className="text-xl font-extrabold mb-2" style={{ color: '#0f172a' }}>신고가 접수되었습니다</h2>
            <p className="text-gray-500 text-sm mb-3 leading-relaxed">
              해당 구역 관리팀에게 자동으로 전달됩니다.
            </p>
            {zone && (
              <div
                className="px-4 py-2 rounded-full text-sm font-bold text-white mb-6"
                style={{ background: zone.color }}
              >
                담당: {zone.adminName}
              </div>
            )}
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({ title: '', category: '', buildingId: '', location: '', description: '', imagePreview: '' });
                setScreen('home');
              }}
              className="w-full py-3.5 rounded-xl font-bold text-white"
              style={{ background: PRIMARY }}
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={() => setScreen('home')}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#f1f5f9' }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-extrabold text-lg" style={{ color: '#0f172a' }}>시설 문제 신고</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          {/* Category */}
          <div>
            <label className="text-sm font-extrabold mb-2 block" style={{ color: '#0f172a' }}>
              문제 유형 <span style={{ color: PRIMARY }}>*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setForm(f => ({ ...f, category: cat.id as IssueCategory }))}
                  className="py-3 px-2 rounded-2xl border-2 text-center transition"
                  style={
                    form.category === cat.id
                      ? { borderColor: PRIMARY, background: '#eff6ff' }
                      : { borderColor: '#e2e8f0', background: 'white' }
                  }
                >
                  <div className="text-xl mb-1">{cat.icon}</div>
                  <div
                    className="text-xs font-bold"
                    style={{ color: form.category === cat.id ? PRIMARY : '#6b7280' }}
                  >
                    {cat.id}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-extrabold mb-1.5 block" style={{ color: '#0f172a' }}>
              제목 <span style={{ color: PRIMARY }}>*</span>
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition"
              style={{ borderColor: form.title ? PRIMARY : '#e2e8f0', background: 'white' }}
              placeholder="예) 3층 화장실 수도꼭지 파손"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Building */}
          <div>
            <label className="text-sm font-extrabold mb-1.5 block" style={{ color: '#0f172a' }}>
              건물 선택 <span style={{ color: PRIMARY }}>*</span>
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition bg-white"
              style={{ borderColor: form.buildingId ? PRIMARY : '#e2e8f0' }}
              value={form.buildingId}
              onChange={e => setForm(f => ({ ...f, buildingId: e.target.value }))}
            >
              <option value="">건물을 선택하세요</option>
              {ZONES.map(z => (
                <optgroup key={z.id} label={`구역 ${z.id}: ${z.name}`}>
                  {BUILDINGS.filter(b => b.zone === z.id).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {zone && (
              <div
                className="mt-2 text-xs px-3 py-2 rounded-xl font-medium"
                style={{ background: zone.color + '15', color: zone.color }}
              >
                📍 담당: {zone.adminName}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-extrabold mb-1.5 block" style={{ color: '#0f172a' }}>상세 위치</label>
            <input
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition"
              style={{ borderColor: form.location ? PRIMARY : '#e2e8f0', background: 'white' }}
              placeholder="예) 3층 남자화장실 입구 앞"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-extrabold mb-1.5 block" style={{ color: '#0f172a' }}>상세 설명</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition resize-none"
              style={{ borderColor: form.description ? PRIMARY : '#e2e8f0', background: 'white' }}
              placeholder="문제 상황을 자세히 설명해주세요..."
              rows={4}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Photo */}
          <div>
            <label className="text-sm font-extrabold mb-1.5 block" style={{ color: '#0f172a' }}>사진 첨부</label>
            {form.imagePreview ? (
              <div className="relative">
                <img src={form.imagePreview} alt="첨부 사진" className="w-full h-44 object-cover rounded-2xl" />
                <button
                  onClick={() => setForm(f => ({ ...f, imagePreview: '' }))}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold"
                >✕</button>
              </div>
            ) : (
              <label className="block w-full h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition"
                style={{ borderColor: '#bfdbfe', background: '#f8fafc' }}>
                <div className="text-3xl mb-1.5">📸</div>
                <div className="text-sm font-medium" style={{ color: '#64748b' }}>사진을 첨부하세요</div>
                <div className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>탭하여 갤러리에서 선택</div>
                <input
                  type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setForm(f => ({ ...f, imagePreview: URL.createObjectURL(file) }));
                  }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="px-4 py-4 bg-white border-t border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={!form.title || !form.category || !form.buildingId}
            className="w-full py-3.5 rounded-xl font-extrabold text-base transition active:scale-95 disabled:opacity-40 text-white"
            style={{ background: PRIMARY }}
          >
            신고 접수하기
          </button>
        </div>
      </div>
    );
  }

  // ── My Reports ────────────────────────────────────────────────
  if (screen === 'myreports') {
    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={() => setScreen('home')}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#f1f5f9' }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-extrabold text-lg" style={{ color: '#0f172a' }}>내 신고 내역</h2>
          <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#eff6ff', color: PRIMARY }}>
            총 {reports.length}건
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64" style={{ color: '#94a3b8' }}>
              <div className="text-5xl mb-3">📭</div>
              <p className="text-sm font-medium">신고 내역이 없습니다</p>
              <p className="text-xs mt-1">시설 문제를 발견하면 신고해주세요</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {reports.map(report => {
                const sc = STATUS_CONFIG[report.status];
                const cat = CATEGORIES.find(c => c.id === report.category);
                return (
                  <button
                    key={report.id}
                    onClick={() => { setSelectedReport(report); setScreen('detail'); }}
                    className="w-full text-left bg-white rounded-2xl p-4 border border-gray-100 shadow-sm active:scale-98 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cat?.icon}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: '#f1f5f9', color: '#374151' }}>
                          {report.category}
                        </span>
                      </div>
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-bold"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {report.status}
                      </span>
                    </div>
                    <div className="font-bold text-sm mb-1" style={{ color: '#0f172a' }}>{report.title}</div>
                    <div className="text-xs" style={{ color: '#64748b' }}>
                      {report.buildingName}{report.location && ` · ${report.location}`}
                    </div>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-xs" style={{ color: '#94a3b8' }}>
                        {new Date(report.reportedAt).toLocaleDateString('ko-KR')}
                      </span>
                      {report.comments.length > 0 && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-lg"
                          style={{ background: '#eff6ff', color: PRIMARY }}
                        >
                          💬 답변 {report.comments.length}개
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Detail ────────────────────────────────────────────────────
  if (screen === 'detail' && selectedReport) {
    const r = reports.find(r => r.id === selectedReport.id) ?? selectedReport;
    const sc = STATUS_CONFIG[r.status];
    const cat = CATEGORIES.find(c => c.id === r.category);
    const zone = ZONES.find(z => z.id === r.zone);
    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={() => setScreen('myreports')}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#f1f5f9' }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-extrabold text-lg" style={{ color: '#0f172a' }}>신고 상세</h2>
          <span
            className="ml-auto text-xs px-2.5 py-1 rounded-full font-bold"
            style={{ background: sc.bg, color: sc.color }}
          >
            {r.status}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {r.imageUrl && (
            <img src={r.imageUrl} alt="신고 사진" className="w-full h-48 object-cover rounded-2xl" />
          )}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{cat?.icon}</span>
              <span
                className="text-xs px-2.5 py-1 rounded-lg text-white font-bold"
                style={{ background: cat?.color }}
              >
                {r.category}
              </span>
            </div>
            <h3 className="font-extrabold mb-3" style={{ color: '#0f172a' }}>{r.title}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3">
                <span className="w-14 text-xs font-bold" style={{ color: '#94a3b8' }}>건물</span>
                <span className="font-medium" style={{ color: '#1e293b' }}>{r.buildingName}</span>
              </div>
              {r.location && (
                <div className="flex gap-3">
                  <span className="w-14 text-xs font-bold" style={{ color: '#94a3b8' }}>위치</span>
                  <span style={{ color: '#1e293b' }}>{r.location}</span>
                </div>
              )}
              {zone && (
                <div className="flex gap-3">
                  <span className="w-14 text-xs font-bold" style={{ color: '#94a3b8' }}>담당</span>
                  <span className="font-bold" style={{ color: zone.color }}>{zone.adminName}</span>
                </div>
              )}
              <div className="flex gap-3">
                <span className="w-14 text-xs font-bold" style={{ color: '#94a3b8' }}>접수일</span>
                <span style={{ color: '#1e293b' }}>{new Date(r.reportedAt).toLocaleString('ko-KR')}</span>
              </div>
            </div>
            {r.description && (
              <p className="mt-3 text-sm rounded-xl p-3" style={{ background: '#f8fafc', color: '#475569' }}>{r.description}</p>
            )}
          </div>

          {r.comments.length > 0 && (
            <div>
              <h4 className="text-sm font-extrabold mb-2" style={{ color: '#0f172a' }}>관리팀 답변</h4>
              {r.comments.map(c => (
                <div key={c.id} className="bg-white rounded-2xl p-4 border border-blue-100 mb-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-extrabold" style={{ color: PRIMARY }}>{c.author}</span>
                    <span className="text-xs" style={{ color: '#94a3b8' }}>
                      {new Date(c.createdAt).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: '#374151' }}>{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Home ──────────────────────────────────────────────────────
  const myCount = reports.length;
  const inProgressCount = reports.filter(r => r.status === '처리중').length;
  const completedCount = reports.filter(r => r.status === '완료').length;

  const QUICK_CATS = [
    { id: '전기', icon: '⚡', bg: '#fef9c3', label: '전기 문제' },
    { id: '수도', icon: '🚿', bg: '#dbeafe', label: '수도 문제' },
    { id: '파손', icon: '🔨', bg: '#fee2e2', label: '시설 파손' },
    { id: '기타', icon: '📋', bg: '#f3f4f6', label: '기타' },
  ];

  return (
    <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
      {/* 처리 알림 배너 */}
      {statusNotif && (
        <div
          className="fixed top-4 left-4 right-4 z-50 rounded-2xl p-4 shadow-xl border-l-4 bg-white flex items-start gap-3"
          style={{ borderLeftColor: '#0f9d58' }}
        >
          <span className="text-2xl">✅</span>
          <div className="flex-1">
            <div className="font-extrabold text-sm" style={{ color: '#0f172a' }}>신고가 처리됐습니다!</div>
            <div className="text-xs mt-0.5 truncate" style={{ color: '#64748b' }}>{statusNotif.title}</div>
            <div className="text-xs font-bold mt-1" style={{ color: '#0f9d58' }}>상태: {statusNotif.status}</div>
          </div>
          <button onClick={() => setStatusNotif(null)} className="text-gray-400 text-lg">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="text-xs font-bold" style={{ color: '#64748b' }}>수원대학교 시설관리</div>
          <div className="text-lg font-extrabold" style={{ color: '#0f172a' }}>안녕하세요, {userName} 님</div>
        </div>
        <div className="relative">
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#f1f5f9' }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {statusNotif && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-extrabold flex items-center justify-center text-white"
                style={{ background: '#ef4444' }}
              >1</span>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pt-5 pb-2">
        <div className="flex gap-3">
          {[
            { label: '전체 신고', value: myCount,         color: '#1a56db', bg: '#eff6ff' },
            { label: '처리중',   value: inProgressCount,  color: '#d97706', bg: '#fef3c7' },
            { label: '완료',     value: completedCount,   color: '#059669', bg: '#d1fae5' },
          ].map(s => (
            <div key={s.label} className="flex-1 rounded-2xl px-3 py-3 text-center" style={{ background: s.bg }}>
              <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: s.color + 'cc' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcement banner */}
      <div className="px-4 pt-4">
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a56db, #003670)' }}
        >
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-20">📢</div>
          <div className="text-xs font-extrabold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>공지사항</div>
          <div className="text-sm font-bold text-white leading-snug">
            시설 신고는 앱에서 바로 접수 가능합니다.<br />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>처리 현황을 실시간으로 확인하세요.</span>
          </div>
        </div>
      </div>

      {/* Quick category */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold" style={{ color: '#0f172a' }}>빠른 신고</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_CATS.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setForm(f => ({ ...f, category: cat.id as IssueCategory }));
                setScreen('report');
              }}
              className="flex flex-col items-center gap-2 active:scale-95 transition"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: cat.bg }}
              >
                {cat.icon}
              </div>
              <div className="text-xs font-bold text-center leading-tight" style={{ color: '#374151' }}>
                {cat.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Campus map */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold" style={{ color: '#0f172a' }}>캠퍼스 신고 현황</h3>
          {Object.keys(reportsByBuilding).length > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#fee2e2', color: '#dc2626' }}>
              신고 {Object.keys(reportsByBuilding).length}건
            </span>
          )}
        </div>
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">

          {/* Zone filter tabs */}
          <div className="flex gap-1.5 px-2.5 py-2 border-b border-gray-50 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {(['ALL', ...ZONES.map(z => z.id)]).map(zid => {
              const zone = ZONES.find(z => z.id === zid);
              const isActive = mapZoneFilter === zid;
              return (
                <button
                  key={zid}
                  onClick={() => setMapZoneFilter(zid)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 active:scale-95"
                  style={
                    isActive
                      ? { background: zid === 'ALL' ? PRIMARY : zone!.color, color: 'white' }
                      : { background: '#f1f5f9', color: '#64748b' }
                  }
                >
                  {zone && (
                    <span
                      className="rounded-full flex-shrink-0"
                      style={{ width: 6, height: 6, background: isActive ? 'rgba(255,255,255,0.7)' : zone.color }}
                    />
                  )}
                  {zid === 'ALL' ? '전체' : zid}
                </button>
              );
            })}
          </div>

          {/* Map */}
          <div className="relative w-full overflow-x-auto" style={{ touchAction: 'pan-x' }}>
            <div className="relative" style={{ width: '100%', minWidth: 320 }}>
              <img src="/campus-map.jpg" alt="수원대학교 캠퍼스 지도" className="w-full block" draggable={false} />
              {BUILDINGS
                .filter(b => mapZoneFilter === 'ALL' || b.zone === mapZoneFilter)
                .map(b => {
                  const active = reportsByBuilding[b.id];
                  const hasReports = !!active;
                  const zone = ZONES.find(z => z.id === b.zone)!;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        if (hasReports) {
                          setMapSelected({ building: b, reports: active });
                        } else {
                          setForm(f => ({ ...f, buildingId: b.id }));
                          setScreen('report');
                        }
                      }}
                      className="absolute active:scale-95 transition-transform"
                      style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <span className="relative inline-flex items-center justify-center">
                        {/* Pulse ring for buildings with active reports */}
                        {hasReports && (
                          <span
                            className="absolute rounded-full animate-ping"
                            style={{ width: 10, height: 10, background: '#ef4444', opacity: 0.35 }}
                          />
                        )}
                        {/* Zone-colored pill */}
                        <span
                          className="relative flex items-center gap-1 font-bold whitespace-nowrap"
                          style={{
                            fontSize: 8.5,
                            background: 'white',
                            borderRadius: 20,
                            padding: '2px 6px 2px 4px',
                            color: hasReports ? zone.color : '#374151',
                            border: hasReports ? `1.5px solid ${zone.color}` : '1px solid rgba(0,0,0,0.1)',
                            boxShadow: hasReports
                              ? `0 1px 5px rgba(0,0,0,0.18)`
                              : '0 1px 3px rgba(0,0,0,0.1)',
                          }}
                        >
                          <span
                            className="rounded-full flex-shrink-0"
                            style={{ width: 6, height: 6, background: zone.color }}
                          />
                          {b.name}
                          {hasReports && (
                            <span
                              className="inline-flex items-center justify-center rounded-full text-white font-extrabold flex-shrink-0"
                              style={{
                                width: 14, height: 14,
                                background: '#ef4444',
                                fontSize: 7,
                                border: '1.5px solid white',
                                marginLeft: 1,
                              }}
                            >
                              {active.length}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Zone legend — tap to filter */}
          <div
            className="px-3 py-2 flex items-center gap-3 border-t border-gray-50 overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {ZONES.map(z => (
              <button
                key={z.id}
                onClick={() => setMapZoneFilter(prev => prev === z.id ? 'ALL' : z.id)}
                className="flex items-center gap-1 flex-shrink-0 active:scale-95 transition-transform"
              >
                <span className="rounded-full" style={{ width: 8, height: 8, background: z.color }} />
                <span
                  className="text-xs font-medium"
                  style={{ color: mapZoneFilter === z.id ? z.color : '#94a3b8' }}
                >
                  {z.name.split('·')[0].replace(' 구역', '').trim()}
                </span>
              </button>
            ))}
            <div className="flex items-center gap-1 ml-auto flex-shrink-0">
              <span className="rounded-full" style={{ width: 8, height: 8, background: '#ef4444' }} />
              <span className="text-xs font-medium" style={{ color: '#ef4444' }}>신고중</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom sheet */}
      {mapSelected && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setMapSelected(null)} />
          <div
            className="fixed bottom-0 left-1/2 z-50 bg-white rounded-t-3xl shadow-2xl"
            style={{ width: '100%', maxWidth: 390, transform: 'translateX(-50%)' }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
              <div>
                <h3 className="font-extrabold" style={{ color: '#0f172a' }}>{mapSelected.building.name}</h3>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>신고 {mapSelected.reports.length}건 처리중</p>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const z = ZONES.find(z => z.id === mapSelected.building.zone);
                  return z ? (
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full text-white flex-shrink-0"
                      style={{ background: z.color }}
                    >
                      {z.id} {z.name.split('·')[0].replace(' 구역', '').trim()}
                    </span>
                  ) : null;
                })()}
                <button
                  onClick={() => setMapSelected(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 text-sm flex-shrink-0"
                  style={{ background: '#f1f5f9' }}
                >✕</button>
              </div>
            </div>
            <div className="overflow-y-auto px-4 py-3 space-y-2" style={{ maxHeight: 320 }}>
              {mapSelected.reports.map(r => {
                const sc = STATUS_CONFIG[r.status];
                const cat = CATEGORIES.find(c => c.id === r.category);
                const priorityColor = PRIORITY_COLORS[r.priority];
                return (
                  <div key={r.id} className="rounded-2xl p-3.5 border" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{cat?.icon}</span>
                        <span className="text-xs font-bold" style={{ color: '#374151' }}>{r.category}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: priorityColor, background: priorityColor + '15' }}>
                          {r.priority === 'high' ? '긴급' : r.priority === 'medium' ? '보통' : '낮음'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: sc.bg, color: sc.color }}>{r.status}</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold mb-1" style={{ color: '#0f172a' }}>{r.title}</p>
                    {r.location && <p className="text-xs" style={{ color: '#94a3b8' }}>📍 {r.location}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs" style={{ color: '#94a3b8' }}>신고자: {r.reportedBy}</span>
                      <span className="text-xs" style={{ color: '#94a3b8' }}>{new Date(r.reportedAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-4 border-t border-gray-100">
              <button
                onClick={() => { setMapSelected(null); setScreen('report'); }}
                className="w-full py-3 rounded-xl text-sm font-extrabold text-white"
                style={{ background: PRIMARY }}
              >
                이 건물 시설 신고하기
              </button>
            </div>
          </div>
        </>
      )}

      {/* Recent reports */}
      <div className="px-4 pt-5 pb-28">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold" style={{ color: '#0f172a' }}>최근 신고 현황</h3>
          <button
            onClick={() => setScreen('myreports')}
            className="text-xs font-bold"
            style={{ color: PRIMARY }}
          >
            전체보기 →
          </button>
        </div>
        <div className="space-y-2">
          {allReports.slice(0, 4).map(r => {
            const sc = STATUS_CONFIG[r.status];
            const cat = CATEGORIES.find(c => c.id === r.category);
            return (
              <div key={r.id} className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: '#f1f5f9' }}
                >
                  {cat?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: '#0f172a' }}>{r.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>{r.buildingName}</div>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0"
                  style={{ background: sc.bg, color: sc.color }}
                >
                  {r.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setScreen('report')}
        className="fixed bottom-6 right-4 flex items-center gap-2 px-5 py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-lg active:scale-95 transition z-30"
        style={{ background: PRIMARY, boxShadow: '0 8px 24px rgba(26,86,219,0.4)' }}
      >
        <span className="text-lg">+</span>
        신고하기
      </button>
    </div>
  );
}

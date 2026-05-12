import { useState, useEffect, useRef } from 'react';
import PortalLogin from '../components/PortalLogin';
import { MOCK_LOGS } from '../data/mockData';
import { MOCK_REPORTS } from '../data/mockData';
import { ZONES, CATEGORIES, STATUS_CONFIG, PRIORITY_COLORS } from '../data/campus';
import { loadAnnouncements, addAnnouncement, loadSportsApplications } from '../data/store';
import type { LogEntry, Announcement, SportsApplication } from '../data/types';

type Screen = 'login' | 'dashboard' | 'logs' | 'reports' | 'users' | 'zones' | 'rentals';

const PRIMARY = '#7c3aed';

const ADMIN_USERS = [
  { zone: 'A', name: '공학관 관리팀',      status: '온라인',   lastLogin: '10분 전' },
  { zone: 'B', name: '혁신·연구 관리팀',   status: '오프라인', lastLogin: '2시간 전' },
  { zone: 'C', name: '학생복지 관리팀',    status: '온라인',   lastLogin: '5분 전' },
  { zone: 'D', name: '예술·문화 관리팀',   status: '온라인',   lastLogin: '30분 전' },
  { zone: 'E', name: '인문·글로벌 관리팀', status: '오프라인', lastLogin: '1일 전' },
  { zone: 'F', name: '본부 관리팀',        status: '온라인',   lastLogin: '방금' },
];

const logLevelColor: Record<string, { text: string; bg: string }> = {
  INFO:  { text: '#2563eb', bg: '#eff6ff' },
  WARN:  { text: '#d97706', bg: '#fffbeb' },
  ERROR: { text: '#dc2626', bg: '#fef2f2' },
  DEBUG: { text: '#6b7280', bg: '#f3f4f6' },
};

const RENTAL_STATUS_CFG: Record<string, { color: string; bg: string }> = {
  '대기':    { color: '#d97706', bg: '#fef3c7' },
  '승인':    { color: '#059669', bg: '#d1fae5' },
  '반려':    { color: '#dc2626', bg: '#fee2e2' },
  '반납대기': { color: '#7c3aed', bg: '#f5f3ff' },
  '반납완료': { color: '#6b7280', bg: '#f1f5f9' },
};

function BackBtn({ onBack, label, dark = false }: { onBack: () => void; label: string; dark?: boolean }) {
  return (
    <div
      className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3.5 border-b"
      style={dark
        ? { background: '#1e293b', borderColor: '#2d3748' }
        : { background: '#fff', borderColor: '#f1f5f9' }
      }
    >
      <button
        onClick={onBack}
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={dark ? { background: '#0f172a' } : { background: '#f1f5f9' }}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={dark ? '#94a3b8' : '#374151'} strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span className={`font-bold text-base ${dark ? 'text-white' : 'text-gray-800'}`}>{label}</span>
    </div>
  );
}

export default function DevApp() {
  const [screen, setScreen]       = useState<Screen>('login');
  const [logs, setLogs]           = useState<LogEntry[]>(MOCK_LOGS);
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'>('ALL');
  const [liveMode, setLiveMode]   = useState(false);
  const [uptime]                  = useState('7d 14h 23m');
  const logsEndRef                = useRef<HTMLDivElement>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>(loadAnnouncements());
  const [annTitle, setAnnTitle]   = useState('');
  const [annContent, setAnnContent] = useState('');
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [sportsApps, setSportsApps] = useState<SportsApplication[]>(() => loadSportsApplications());
  const [rentalFilter, setRentalFilter] = useState('ALL');

  const postAnnouncement = () => {
    if (!annTitle.trim() || !annContent.trim()) return;
    addAnnouncement({
      id: `ANN-${Date.now()}`,
      title: annTitle.trim(),
      content: annContent.trim(),
      author: 'Developer',
      authorRole: 'dev',
      postedAt: new Date().toISOString(),
    });
    setAnnouncements(loadAnnouncements());
    setAnnTitle('');
    setAnnContent('');
    setShowAnnForm(false);
  };

  useEffect(() => {
    const handler = () => {
      setAnnouncements(loadAnnouncements());
      setSportsApps(loadSportsApplications());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useEffect(() => {
    if (!liveMode) return;
    const services = ['auth-service', 'report-service', 'notification-service', 'api-gateway'];
    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: `LOG-LIVE-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: Math.random() > 0.85 ? (Math.random() > 0.5 ? 'ERROR' : 'WARN') : 'INFO',
        service: services[Math.floor(Math.random() * services.length)],
        message: [
          'API request processed in 42ms',
          'Push notification sent successfully',
          'User session validated',
          'Report status updated to 처리중',
          'Database connection pool: 8/20',
          'Cache invalidated for zone-C reports',
          'File upload completed: 2.3MB',
          'Admin zone-A logged in',
          'Sports rental application submitted: 풋살장(대운동장)',
          'Rental approved: tennis court reservation',
          'Return photo uploaded by applicant',
          'Sports return confirmed by 시설 대관팀',
        ][Math.floor(Math.random() * 12)],
      };
      setLogs(prev => [newLog, ...prev.slice(0, 99)]);
    }, 2000);
    return () => clearInterval(interval);
  }, [liveMode]);

  useEffect(() => {
    if (liveMode && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, liveMode]);

  const handleDevLogin = (id: string, pw: string): boolean => {
    if ((id === 'dev' || id === 'developer') && (pw === 'dev2024' || pw === 'admin')) {
      setScreen('dashboard');
      return true;
    }
    return false;
  };

  const filteredLogs = logFilter === 'ALL' ? logs : logs.filter(l => l.level === logFilter);
  const reportsByZone = ZONES.map(z => ({
    zone: z,
    count: MOCK_REPORTS.filter(r => r.zone === z.id).length,
    completed: MOCK_REPORTS.filter(r => r.zone === z.id && r.status === '완료').length,
  }));

  // ── Login ───────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <div className="app-container">
        <PortalLogin appType="dev" onLogin={handleDevLogin} />
      </div>
    );
  }

  // ── Logs ────────────────────────────────────────────────────────
  if (screen === 'logs') {
    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#0f172a' }}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3.5 border-b" style={{ background: '#1e293b', borderColor: '#2d3748' }}>
          <button
            onClick={() => setScreen('dashboard')}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#0f172a' }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-bold text-base text-white font-mono">System Logs</span>
          <div className="ml-auto">
            <button
              onClick={() => setLiveMode(l => !l)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition font-mono"
              style={liveMode
                ? { background: '#16a34a20', color: '#4ade80', border: '1px solid #16a34a' }
                : { background: '#ffffff10', color: '#9ca3af', border: '1px solid #374151' }
              }
            >
              {liveMode && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
              {liveMode ? 'LIVE' : 'LIVE OFF'}
            </button>
          </div>
        </div>

        {/* Level filter */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto border-b" style={{ borderColor: '#ffffff0d' }}>
          {(['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => setLogFilter(lvl)}
              className="px-3 py-1 rounded text-xs font-mono font-bold whitespace-nowrap"
              style={logFilter === lvl
                ? { background: lvl === 'ALL' ? PRIMARY : logLevelColor[lvl]?.bg, color: lvl === 'ALL' ? '#fff' : logLevelColor[lvl]?.text }
                : { background: '#1e293b', color: '#64748b' }
              }
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Log entries */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredLogs.map(log => {
            const lc = logLevelColor[log.level];
            return (
              <div key={log.id} className="rounded-xl p-2.5 border" style={{ background: '#1e293b', borderColor: '#2d3748' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold font-mono px-1.5 py-0.5 rounded" style={{ background: lc.bg, color: lc.text }}>
                    {log.level}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{log.service}</span>
                  <span className="ml-auto text-xs text-slate-600 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-mono leading-relaxed">{log.message}</p>
                {log.userId && <span className="text-xs font-mono" style={{ color: '#a78bfa' }}>uid:{log.userId}</span>}
              </div>
            );
          })}
          <div ref={logsEndRef} />
        </div>
      </div>
    );
  }

  // ── Reports overview ─────────────────────────────────────────────
  if (screen === 'reports') {
    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <BackBtn onBack={() => setScreen('dashboard')} label="전체 신고 현황" />
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {MOCK_REPORTS.map(r => {
            const sc = STATUS_CONFIG[r.status];
            const cat = CATEGORIES.find(c => c.id === r.category);
            const zone = ZONES.find(z => z.id === r.zone);
            return (
              <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat?.icon}</span>
                    <span className="font-mono text-xs text-gray-400">{r.id}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-xs px-1.5 py-0.5 rounded font-bold text-white" style={{ background: PRIORITY_COLORS[r.priority] }}>
                      {r.priority === 'high' ? 'HIGH' : r.priority === 'medium' ? 'MED' : 'LOW'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: sc.bg, color: sc.color }}>{r.status}</span>
                  </div>
                </div>
                <div className="font-semibold text-gray-800 text-sm mb-1">{r.title}</div>
                <div className="flex gap-2 text-xs text-gray-400 flex-wrap">
                  <span>{r.buildingName}</span>
                  <span>·</span>
                  <span style={{ color: zone?.color }}>{zone?.name}</span>
                  <span>·</span>
                  <span>by {r.reportedBy}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <span>{new Date(r.reportedAt).toLocaleString('ko-KR')}</span>
                  <span>{r.comments.length} comments</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Zones management ─────────────────────────────────────────────
  if (screen === 'zones') {
    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <BackBtn onBack={() => setScreen('dashboard')} label="구역 관리" />
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {reportsByZone.map(({ zone, count, completed }) => {
            const admin = ADMIN_USERS.find(a => a.zone === zone.id);
            const pending = count - completed;
            const completion = count > 0 ? Math.round((completed / count) * 100) : 0;
            return (
              <div key={zone.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: zone.color }}>
                      {zone.id}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{zone.name}</div>
                      <div className="text-xs text-gray-500">{zone.adminName}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${admin?.status === '온라인' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {admin?.status || '—'}
                  </span>
                </div>
                <div className="flex gap-4 text-sm mb-3">
                  <div className="text-center">
                    <div className="font-bold text-gray-800">{count}</div>
                    <div className="text-xs text-gray-400">전체</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold" style={{ color: '#d97706' }}>{pending}</div>
                    <div className="text-xs text-gray-400">미완료</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold" style={{ color: '#16a34a' }}>{completed}</div>
                    <div className="text-xs text-gray-400">완료</div>
                  </div>
                  <div className="text-center ml-auto">
                    <div className="font-bold text-gray-800">{completion}%</div>
                    <div className="text-xs text-gray-400">처리율</div>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${completion}%`, background: zone.color }} />
                </div>
                {admin && (
                  <div className="mt-2 text-xs text-gray-400">마지막 접속: {admin.lastLogin}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Users ───────────────────────────────────────────────────────
  if (screen === 'users') {
    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <BackBtn onBack={() => setScreen('dashboard')} label="사용자 관리" />
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Admin accounts */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h4 className="text-sm font-bold text-gray-700 mb-3">관리자 계정</h4>
            {ADMIN_USERS.map(admin => {
              const zone = ZONES.find(z => z.id === admin.zone);
              return (
                <div key={admin.zone} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: zone?.color }}>
                    {admin.zone}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800">{admin.name}</div>
                    <div className="text-xs text-gray-400">{admin.lastLogin} 접속</div>
                  </div>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${admin.status === '온라인' ? 'bg-green-400' : 'bg-gray-300'}`} />
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h4 className="text-sm font-bold text-gray-700 mb-3">시스템 통계</h4>
            {[
              { label: '총 신고자 수',    value: '87명',   icon: '👤' },
              { label: '오늘 신규 신고',  value: '4건',    icon: '📊' },
              { label: '이번 주 신고',    value: '23건',   icon: '📅' },
              { label: '평균 처리 시간',  value: '4.2시간', icon: '⏱' },
              { label: '처리 완료율',     value: '72%',    icon: '✅' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </div>
                <span className="font-bold text-gray-800 text-sm">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Rentals ─────────────────────────────────────────────────────
  if (screen === 'rentals') {
    const rentalStats = [
      { label: '전체',    count: sportsApps.length,                                       color: '#64748b', key: 'ALL' },
      { label: '대기',    count: sportsApps.filter(a => a.status === '대기').length,      color: '#d97706', key: '대기' },
      { label: '승인',    count: sportsApps.filter(a => a.status === '승인').length,      color: '#059669', key: '승인' },
      { label: '반납대기', count: sportsApps.filter(a => a.status === '반납대기').length,  color: '#7c3aed', key: '반납대기' },
      { label: '반납완료', count: sportsApps.filter(a => a.status === '반납완료').length,  color: '#6b7280', key: '반납완료' },
      { label: '반려',    count: sportsApps.filter(a => a.status === '반려').length,      color: '#dc2626', key: '반려' },
    ];
    const filtered = rentalFilter === 'ALL' ? sportsApps : sportsApps.filter(a => a.status === rentalFilter);

    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <BackBtn onBack={() => setScreen('dashboard')} label="시설 대관 현황" />

        {/* Stats grid */}
        <div className="px-4 pt-4 grid grid-cols-3 gap-2">
          {rentalStats.map(s => (
            <button
              key={s.key}
              onClick={() => setRentalFilter(s.key)}
              className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm text-center transition active:scale-95"
              style={rentalFilter === s.key ? { borderColor: s.color, boxShadow: `0 0 0 2px ${s.color}30` } : {}}
            >
              <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.count}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Application list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 mt-2">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400">신청 내역이 없습니다.</div>
          ) : (
            filtered.map(app => {
              const sc = RENTAL_STATUS_CFG[app.status] ?? { color: '#6b7280', bg: '#f1f5f9' };
              return (
                <div key={app.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{app.facilityName}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{app.id}</div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>
                      {app.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 text-xs text-gray-500 mt-1">
                    <div>신청자: <span className="text-gray-700 font-medium">{app.applicantName}</span></div>
                    <div>소속: <span className="text-gray-700 font-medium">{app.department}</span></div>
                    <div className="col-span-2 mt-1">대관일: <span className="text-gray-700">{app.rentalDate} {app.rentalStartTime}~{app.rentalEndTime}</span></div>
                    <div className="col-span-2">행사명: <span className="text-gray-700">{app.eventName}</span></div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-2">
                    <span>신청: {new Date(app.appliedAt).toLocaleDateString('ko-KR')}</span>
                    {app.returnRequestedAt && (
                      <span style={{ color: '#7c3aed' }}>반납신청: {new Date(app.returnRequestedAt).toLocaleDateString('ko-KR')}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // ── Dashboard ───────────────────────────────────────────────────
  const errorCount = logs.filter(l => l.level === 'ERROR').length;
  const warnCount  = logs.filter(l => l.level === 'WARN').length;
  const totalReports     = MOCK_REPORTS.length;
  const completedReports = MOCK_REPORTS.filter(r => r.status === '완료').length;
  const onlineAdmins     = ADMIN_USERS.filter(a => a.status === '온라인').length;
  const pendingRentals   = sportsApps.filter(a => a.status === '대기').length;

  return (
    <div className="app-container flex flex-col min-h-screen" style={{ background: '#0f172a' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-dark.jpg"
              alt="수원대학교"
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div className="text-white font-extrabold text-sm leading-tight">수원대학교</div>
              <div className="text-xs font-mono" style={{ color: '#64748b' }}>Developer Console</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: '#16a34a18', border: '1px solid #16a34a40' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-mono font-bold">ONLINE</span>
            </div>
            <button
              onClick={() => setScreen('login')}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#1e293b' }}
              title="로그아웃"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
        <h1 className="text-white text-xl font-extrabold">시스템 대시보드</h1>
        <p className="text-slate-500 text-xs font-mono mt-1">Uptime: {uptime} · v2.4.1</p>
      </div>

      {/* System stats */}
      <div className="px-4 mt-4">
        <div className="rounded-2xl p-4 grid grid-cols-3 gap-3" style={{ background: '#1e293b', border: '1px solid #2d3748' }}>
          {[
            { label: 'Total Reports', value: String(totalReports),     sub: '전체 신고',    color: PRIMARY },
            { label: 'Resolved',      value: String(completedReports), sub: '처리 완료',    color: '#10b981' },
            { label: 'Errors (24h)',  value: String(errorCount),       sub: '에러 로그',    color: errorCount > 5 ? '#ef4444' : '#f59e0b' },
            { label: 'Admins Online', value: `${onlineAdmins}/6`,      sub: '온라인 관리자', color: '#3b82f6' },
            { label: 'Rentals (대기)', value: String(pendingRentals),   sub: '대관 승인대기', color: '#7c3aed' },
            { label: 'Total Rentals', value: String(sportsApps.length), sub: '전체 대관신청', color: '#64748b' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3" style={{ background: '#0f172a' }}>
              <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-slate-400 mt-0.5 font-mono">{s.label}</div>
              <div className="text-xs text-slate-600">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* System health */}
      <div className="px-4 mt-4">
        <div className="rounded-2xl p-4" style={{ background: '#1e293b', border: '1px solid #2d3748' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-300 text-sm font-bold font-mono">System Health</h3>
            <span className="text-xs text-slate-500 font-mono">5 services</span>
          </div>
          {[
            { name: 'API Gateway',            status: 'healthy', latency: '28ms',  uptime: '99.9%' },
            { name: 'Auth Service',           status: 'healthy', latency: '12ms',  uptime: '100%' },
            { name: 'Report Service',         status: 'healthy', latency: '45ms',  uptime: '99.8%' },
            { name: 'Notification Service',   status: warnCount > 3 ? 'warning' : 'healthy', latency: '89ms', uptime: '98.2%' },
            { name: 'File Service',           status: 'healthy', latency: '120ms', uptime: '99.5%' },
          ].map(svc => (
            <div key={svc.name} className="flex items-center gap-2 py-2 border-b last:border-0" style={{ borderColor: '#ffffff0d' }}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${svc.status === 'healthy' ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="text-slate-300 text-xs font-mono flex-1">{svc.name}</span>
              <span className="text-slate-500 text-xs font-mono">{svc.latency}</span>
              <span className="text-slate-500 text-xs font-mono">{svc.uptime}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        {[
          { screen: 'logs'    as Screen, icon: '📊', title: 'System Logs',  sub: '실시간 로그',   badge: errorCount > 0 ? String(errorCount) : null, badgeColor: 'bg-red-500' },
          { screen: 'reports' as Screen, icon: '📋', title: 'All Reports',  sub: '전체 신고 현황', badge: null, badgeColor: '' },
          { screen: 'zones'   as Screen, icon: '🗺️', title: 'Zone Manager', sub: '구역 관리',     badge: null, badgeColor: '' },
          { screen: 'users'   as Screen, icon: '👥', title: 'Users',        sub: '사용자 관리',   badge: null, badgeColor: '' },
        ].map(item => (
          <button
            key={item.screen}
            onClick={() => setScreen(item.screen)}
            className="rounded-2xl p-4 text-left transition active:scale-95 relative"
            style={{ background: '#1e293b', border: '1px solid #2d3748' }}
          >
            {item.badge && (
              <div className={`absolute top-3 right-3 w-5 h-5 rounded-full ${item.badgeColor} text-white text-xs flex items-center justify-center font-bold font-mono`}>
                {item.badge}
              </div>
            )}
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="text-slate-200 font-bold text-sm">{item.title}</div>
            <div className="text-slate-500 text-xs font-mono mt-0.5">{item.sub}</div>
          </button>
        ))}
      </div>
      {/* Rentals card — full width */}
      <div className="px-4 mt-3">
        <button
          onClick={() => setScreen('rentals')}
          className="w-full rounded-2xl p-4 text-left transition active:scale-95 relative flex items-center gap-4"
          style={{ background: '#1e293b', border: '1px solid #2d3748' }}
        >
          {pendingRentals > 0 && (
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold font-mono" style={{ background: '#7c3aed' }}>
              {pendingRentals}
            </div>
          )}
          <div className="text-2xl">🏃</div>
          <div>
            <div className="text-slate-200 font-bold text-sm">Rentals</div>
            <div className="text-slate-500 text-xs font-mono">시설 대관 현황 · 전체 {sportsApps.length}건</div>
          </div>
        </button>
      </div>

      {/* Recent logs preview */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-slate-300 text-sm font-bold font-mono">Recent Logs</h3>
          <button onClick={() => setScreen('logs')} className="text-xs font-mono" style={{ color: '#a78bfa' }}>
            View all →
          </button>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: '#1e293b', border: '1px solid #2d3748' }}>
          {logs.slice(0, 5).map((log, i) => {
            const lc = logLevelColor[log.level];
            return (
              <div
                key={log.id}
                className="px-3 py-2 flex items-center gap-2"
                style={i < 4 ? { borderBottom: '1px solid #ffffff0d' } : {}}
              >
                <span
                  className="text-xs font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                  style={{ background: lc.bg, color: lc.text, minWidth: 40, textAlign: 'center' }}
                >
                  {log.level}
                </span>
                <span className="text-xs text-slate-400 font-mono flex-1 truncate">{log.message}</span>
                <span className="text-xs text-slate-600 font-mono flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Announcements */}
      <div className="px-4 mt-4 pb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-slate-300 text-sm font-bold font-mono">Announcements</h3>
          <button
            onClick={() => setShowAnnForm(v => !v)}
            className="text-xs font-mono px-3 py-1.5 rounded-full font-bold transition"
            style={{ background: showAnnForm ? '#374151' : PRIMARY + '30', color: showAnnForm ? '#94a3b8' : '#a78bfa', border: `1px solid ${showAnnForm ? '#374151' : PRIMARY + '60'}` }}
          >
            {showAnnForm ? '취소' : '+ 공지 작성'}
          </button>
        </div>

        {showAnnForm && (
          <div className="rounded-2xl p-4 mb-3 space-y-3" style={{ background: '#1e293b', border: '1px solid #2d3748' }}>
            <input
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none font-mono"
              style={{ background: '#0f172a', borderColor: annTitle ? PRIMARY : '#374151', color: '#e2e8f0' }}
              placeholder="공지 제목"
              value={annTitle}
              onChange={e => setAnnTitle(e.target.value)}
            />
            <textarea
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-none font-mono"
              style={{ background: '#0f172a', borderColor: annContent ? PRIMARY : '#374151', color: '#e2e8f0' }}
              placeholder="공지 내용을 입력하세요..."
              rows={3}
              value={annContent}
              onChange={e => setAnnContent(e.target.value)}
            />
            <button
              onClick={postAnnouncement}
              disabled={!annTitle.trim() || !annContent.trim()}
              className="w-full py-2.5 rounded-xl font-bold text-sm font-mono transition disabled:opacity-40"
              style={{ background: PRIMARY, color: '#fff' }}
            >
              공지 게시
            </button>
          </div>
        )}

        <div className="space-y-2">
          {announcements.length === 0 ? (
            <div className="text-center py-5 text-xs font-mono" style={{ color: '#475569' }}>No announcements posted</div>
          ) : (
            announcements.slice(0, 5).map(a => (
              <div key={a.id} className="rounded-2xl p-3.5" style={{ background: '#1e293b', border: '1px solid #2d3748' }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-bold text-sm text-slate-200">{a.title}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded font-mono font-bold flex-shrink-0"
                    style={{ background: a.authorRole === 'dev' ? PRIMARY + '30' : '#1a56db30', color: a.authorRole === 'dev' ? '#a78bfa' : '#60a5fa' }}
                  >
                    {a.authorRole === 'dev' ? 'DEV' : 'ADMIN'}
                  </span>
                </div>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: '#94a3b8' }}>{a.content}</p>
                <div className="text-xs font-mono" style={{ color: '#475569' }}>
                  {a.author} · {new Date(a.postedAt).toLocaleDateString('ko-KR')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

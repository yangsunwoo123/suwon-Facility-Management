import { useState, useEffect, useMemo } from 'react';
import PortalLogin from '../components/PortalLogin';
import { CATEGORIES, STATUS_CONFIG, PRIORITY_COLORS } from '../data/campus';
import { loadReports, updateReport as storeUpdateReport } from '../data/store';
import type { IssueReport, IssueStatus, ZoneId } from '../data/types';

type Screen = 'login' | 'dashboard' | 'list' | 'detail';

const PRIMARY = '#1a56db';

const ADMIN_ACCOUNTS: { id: string; zone: ZoneId; name: string }[] = [
  { id: 'mgr_a', zone: 'A', name: '공학관 관리팀' },
  { id: 'mgr_b', zone: 'B', name: '혁신·연구 관리팀' },
  { id: 'mgr_c', zone: 'C', name: '학생복지 관리팀' },
  { id: 'mgr_d', zone: 'D', name: '예술·문화 관리팀' },
  { id: 'mgr_e', zone: 'E', name: '인문·글로벌 관리팀' },
  { id: 'mgr_f', zone: 'F', name: '본부 관리팀' },
];

export default function AdminApp() {
  const [screen, setScreen] = useState<Screen>('login');
  const [selectedZone, setSelectedZone] = useState<ZoneId>('C');
  const [adminName, setAdminName] = useState('');
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);
  const [replyText, setReplyText] = useState('');
  const [notification, setNotification] = useState<{ visible: boolean; report: IssueReport | null }>({ visible: false, report: null });
  const [filterStatus, setFilterStatus] = useState<IssueStatus | 'all'>('all');

  useEffect(() => {
    if (screen === 'login') return;
    const handler = () => {
      const fresh = loadReports().filter(r => r.zone === selectedZone);
      setReports(prev => {
        const newOnes = fresh.filter(nr => !prev.find(p => p.id === nr.id));
        if (newOnes.length > 0) setNotification({ visible: true, report: newOnes[0] });
        return fresh;
      });
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [screen, selectedZone]);

  const handleAdminLogin = (id: string, pw: string): boolean => {
    const account = ADMIN_ACCOUNTS.find(a => a.id === id.toLowerCase());
    if (!account || (pw !== '1234' && pw !== 'admin')) return false;
    setSelectedZone(account.zone);
    setAdminName(account.name);
    setReports(loadReports().filter(r => r.zone === account.zone));
    setScreen('dashboard');
    return true;
  };

  const updateStatus = (reportId: string, status: IssueStatus) => {
    const updated = { status, updatedAt: new Date().toISOString() };
    storeUpdateReport(reportId, updated);
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, ...updated } : r));
    if (selectedReport?.id === reportId) setSelectedReport(prev => prev ? { ...prev, ...updated } : null);
  };

  const addReply = (reportId: string) => {
    if (!replyText.trim()) return;
    const comment = {
      id: `c-${Date.now()}`,
      author: adminName,
      role: 'admin' as const,
      text: replyText,
      createdAt: new Date().toISOString(),
    };
    const target = reports.find(r => r.id === reportId);
    if (target) {
      const newComments = [...target.comments, comment];
      storeUpdateReport(reportId, { comments: newComments, updatedAt: new Date().toISOString() });
    }
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, comments: [...r.comments, comment] } : r));
    if (selectedReport?.id === reportId) setSelectedReport(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null);
    setReplyText('');
  };

  const filteredReports = filterStatus === 'all' ? reports : reports.filter(r => r.status === filterStatus);

  const statusCounts = useMemo(() => ({
    '접수됨': reports.filter(r => r.status === '접수됨').length,
    '처리중': reports.filter(r => r.status === '처리중').length,
    '완료':   reports.filter(r => r.status === '완료').length,
    '보류':   reports.filter(r => r.status === '보류').length,
  }), [reports]);

  const BackBtn = ({ to }: { to: Screen }) => (
    <button
      onClick={() => setScreen(to)}
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: '#f1f5f9' }}
    >
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );

  // ── Login ─────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <div className="app-container">
        <PortalLogin appType="admin" onLogin={handleAdminLogin} />
      </div>
    );
  }

  // ── Detail ────────────────────────────────────────────────────
  if (screen === 'detail' && selectedReport) {
    const r = reports.find(r => r.id === selectedReport.id) || selectedReport;
    const sc = STATUS_CONFIG[r.status];
    const cat = CATEGORIES.find(c => c.id === r.category);

    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
          <BackBtn to="list" />
          <h2 className="font-extrabold text-lg flex-1" style={{ color: '#0f172a' }}>신고 상세</h2>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#f1f5f9', color: '#64748b' }}>{r.id}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Info card */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#f1f5f9' }}>
                {cat?.icon}
              </div>
              <div className="flex-1">
                <div className="font-extrabold" style={{ color: '#0f172a' }}>{r.title}</div>
                <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>{r.buildingName}{r.location && ` · ${r.location}`}</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mb-3">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: sc.bg, color: sc.color }}>{r.status}</span>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold text-white" style={{ background: PRIORITY_COLORS[r.priority] }}>
                {r.priority === 'high' ? '🔴 긴급' : r.priority === 'medium' ? '🟡 보통' : '🟢 낮음'}
              </span>
            </div>
            {r.description && (
              <p className="text-sm rounded-xl p-3 mb-3" style={{ background: '#f8fafc', color: '#475569' }}>{r.description}</p>
            )}
            <div className="text-xs space-y-1" style={{ color: '#94a3b8' }}>
              <div>신고자: {r.reportedBy}</div>
              <div>접수: {new Date(r.reportedAt).toLocaleString('ko-KR')}</div>
              <div>업데이트: {new Date(r.updatedAt).toLocaleString('ko-KR')}</div>
            </div>
          </div>

          {/* Status change */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h4 className="text-sm font-extrabold mb-3" style={{ color: '#0f172a' }}>상태 변경</h4>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(STATUS_CONFIG) as IssueStatus[]).map(s => {
                const sc2 = STATUS_CONFIG[s];
                const isActive = r.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => updateStatus(r.id, s)}
                    className="py-3 rounded-xl text-sm font-bold border-2 transition active:scale-95"
                    style={isActive
                      ? { borderColor: sc2.color, background: sc2.bg, color: sc2.color }
                      : { borderColor: '#e2e8f0', background: '#f8fafc', color: '#64748b' }
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h4 className="text-sm font-extrabold mb-3" style={{ color: '#0f172a' }}>
              메시지 <span className="font-medium text-gray-400">({r.comments.length})</span>
            </h4>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {r.comments.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: '#94a3b8' }}>아직 메시지가 없습니다</p>
              ) : (
                r.comments.map(c => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl text-sm"
                    style={c.role === 'admin'
                      ? { background: '#eff6ff', border: '1px solid #bfdbfe' }
                      : { background: '#f8fafc', border: '1px solid #e2e8f0' }
                    }
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-extrabold text-xs" style={{ color: c.role === 'admin' ? PRIMARY : '#6b7280' }}>
                        {c.author}
                      </span>
                      <span className="text-xs" style={{ color: '#94a3b8' }}>
                        {new Date(c.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ color: '#374151' }}>{c.text}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition"
                style={{ borderColor: replyText ? PRIMARY : '#e2e8f0', background: '#fafafa' }}
                placeholder="답변을 입력하세요..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addReply(r.id)}
              />
              <button
                onClick={() => addReply(r.id)}
                className="px-4 py-2.5 rounded-xl text-white text-sm font-extrabold"
                style={{ background: PRIMARY }}
              >
                전송
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── List ──────────────────────────────────────────────────────
  if (screen === 'list') {
    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        {notification.visible && notification.report && (
          <div className="absolute top-4 left-4 right-4 z-50 rounded-2xl p-4 shadow-xl border-l-4 bg-white flex items-start gap-3"
            style={{ borderLeftColor: '#ef4444' }}>
            <span className="text-2xl">🔔</span>
            <div className="flex-1">
              <div className="font-extrabold text-sm" style={{ color: '#0f172a' }}>새 신고 접수!</div>
              <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>{notification.report.title}</div>
            </div>
            <button onClick={() => setNotification({ visible: false, report: null })} className="text-gray-400 text-lg">✕</button>
          </div>
        )}

        <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
          <BackBtn to="dashboard" />
          <h2 className="font-extrabold text-lg flex-1" style={{ color: '#0f172a' }}>신고 목록</h2>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#eff6ff', color: PRIMARY }}>
            구역 {selectedZone}
          </span>
        </div>

        {/* Filter */}
        <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex gap-2 overflow-x-auto">
          {(['all', '접수됨', '처리중', '완료', '보류'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition"
              style={filterStatus === s
                ? { background: PRIMARY, color: '#fff' }
                : { background: '#f1f5f9', color: '#64748b' }
              }
            >
              {s === 'all' ? `전체 (${reports.length})` : `${s} (${statusCounts[s as IssueStatus] || 0})`}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48" style={{ color: '#94a3b8' }}>
              <div className="text-5xl mb-3">📭</div>
              <p className="text-sm font-medium">해당 신고가 없습니다</p>
            </div>
          ) : (
            filteredReports.map(report => {
              const sc = STATUS_CONFIG[report.status];
              const cat = CATEGORIES.find(c => c.id === report.category);
              return (
                <button
                  key={report.id}
                  onClick={() => { setSelectedReport(report); setScreen('detail'); }}
                  className="w-full text-left bg-white rounded-2xl p-4 border border-gray-100 shadow-sm transition active:scale-98"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat?.icon}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg text-white" style={{ background: cat?.color }}>
                        {report.category}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {report.priority === 'high' && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-bold text-white" style={{ background: PRIORITY_COLORS.high }}>긴급</span>
                      )}
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold" style={{ background: sc.bg, color: sc.color }}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                  <div className="font-bold text-sm mb-1" style={{ color: '#0f172a' }}>{report.title}</div>
                  <div className="text-xs" style={{ color: '#64748b' }}>
                    {report.buildingName}{report.location && ` · ${report.location}`}
                  </div>
                  <div className="flex items-center justify-between mt-2.5">
                    <div className="text-xs" style={{ color: '#94a3b8' }}>신고자: {report.reportedBy}</div>
                    <div className="text-xs" style={{ color: '#94a3b8' }}>{new Date(report.reportedAt).toLocaleDateString('ko-KR')}</div>
                  </div>
                  {report.comments.length === 0 && report.status === '접수됨' && (
                    <div className="mt-2 text-xs px-2 py-1 rounded-lg font-medium" style={{ background: '#fee2e2', color: '#dc2626' }}>
                      ⚠ 미답변
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────
  const urgentCount = reports.filter(r => r.priority === 'high' && r.status !== '완료').length;
  const pendingCount = statusCounts['접수됨'];

  return (
    <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
      {notification.visible && notification.report && (
        <div className="absolute top-4 left-4 right-4 z-50 rounded-2xl p-4 shadow-xl border-l-4 bg-white flex items-start gap-3"
          style={{ borderLeftColor: '#ef4444' }}>
          <span className="text-2xl">🔔</span>
          <div className="flex-1">
            <div className="font-extrabold text-sm" style={{ color: '#0f172a' }}>새 신고 접수!</div>
            <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>{notification.report.title}</div>
          </div>
          <button onClick={() => setNotification({ visible: false, report: null })} className="text-gray-400 text-lg">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="text-xs font-bold" style={{ color: '#64748b' }}>관리자 대시보드 · 구역 {selectedZone}</div>
          <div className="text-lg font-extrabold" style={{ color: '#0f172a' }}>{adminName}</div>
        </div>
        <button
          onClick={() => setScreen('list')}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: '#f1f5f9' }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-extrabold flex items-center justify-center text-white" style={{ background: '#ef4444' }}>
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="px-4 pt-5 pb-2">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '전체',   value: reports.length,      color: PRIMARY,    bg: '#eff6ff' },
            { label: '미처리', value: statusCounts['접수됨'], color: '#6b7280',  bg: '#f1f5f9' },
            { label: '처리중', value: statusCounts['처리중'], color: '#d97706',  bg: '#fef3c7' },
            { label: '완료',   value: statusCounts['완료'],  color: '#059669',  bg: '#d1fae5' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl py-3 px-2 text-center" style={{ background: s.bg }}>
              <div className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: s.color + 'cc' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Urgent banner */}
      {urgentCount > 0 && (
        <div className="px-4 pt-3">
          <div
            className="rounded-2xl p-4 flex items-center gap-3 border"
            style={{ background: '#fff5f5', borderColor: '#fecaca' }}
          >
            <span className="text-2xl animate-pulse">🔴</span>
            <div className="flex-1">
              <div className="font-extrabold text-sm" style={{ color: '#dc2626' }}>긴급 처리 필요 {urgentCount}건</div>
              <div className="text-xs mt-0.5" style={{ color: '#ef4444' }}>즉시 확인이 필요한 신고가 있습니다</div>
            </div>
            <button
              onClick={() => setScreen('list')}
              className="text-xs font-bold px-3 py-1.5 rounded-xl text-white"
              style={{ background: '#dc2626' }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* Category stats */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold" style={{ color: '#0f172a' }}>유형별 현황</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.slice(0, 4).map(cat => {
            const catCount = reports.filter(r => r.category === cat.id).length;
            const pending = reports.filter(r => r.category === cat.id && r.status === '접수됨').length;
            return (
              <button
                key={cat.id}
                onClick={() => setScreen('list')}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-left active:scale-98 transition"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2"
                  style={{ background: cat.color + '20' }}
                >
                  {cat.icon}
                </div>
                <div className="font-bold text-sm" style={{ color: '#0f172a' }}>{cat.id}</div>
                <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                  총 {catCount}건
                  {pending > 0 && <span className="ml-1.5 font-bold" style={{ color: '#dc2626' }}>미처리 {pending}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent reports */}
      <div className="px-4 pt-5 pb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold" style={{ color: '#0f172a' }}>최근 신고</h3>
          <button onClick={() => setScreen('list')} className="text-xs font-bold" style={{ color: PRIMARY }}>
            전체보기 →
          </button>
        </div>
        <div className="space-y-2">
          {reports.slice(0, 5).map(r => {
            const sc = STATUS_CONFIG[r.status];
            const cat = CATEGORIES.find(c => c.id === r.category);
            return (
              <button
                key={r.id}
                onClick={() => { setSelectedReport(r); setScreen('detail'); }}
                className="w-full text-left bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex items-center gap-3 active:scale-98 transition"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: '#f1f5f9' }}>
                  {cat?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: '#0f172a' }}>{r.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>{r.buildingName}</div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>
                  {r.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

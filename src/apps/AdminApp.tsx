import { useState, useEffect, useMemo } from 'react';
import SuwonLogo from '../components/SuwonLogo';
import PortalLogin from '../components/PortalLogin';
import { CATEGORIES, STATUS_CONFIG, PRIORITY_COLORS } from '../data/campus';
import { loadReports, updateReport as storeUpdateReport } from '../data/store';
import type { IssueReport, IssueStatus, ZoneId } from '../data/types';

type Screen = 'login' | 'dashboard' | 'list' | 'detail';

// 관리자 계정: 포털 ID 형식 (mgr_a ~ mgr_f), 비밀번호: 1234
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

  // 다른 탭(사용자 앱)에서 새 신고 접수 시 실시간 반영
  useEffect(() => {
    if (screen === 'login') return;
    const handler = () => {
      const fresh = loadReports().filter(r => r.zone === selectedZone);
      setReports(prev => {
        const newOnes = fresh.filter(nr => !prev.find(p => p.id === nr.id));
        if (newOnes.length > 0) {
          setNotification({ visible: true, report: newOnes[0] });
        }
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
    storeUpdateReport(reportId, updated);                 // localStorage 저장
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, ...updated } : r));
    if (selectedReport?.id === reportId) {
      setSelectedReport(prev => prev ? { ...prev, ...updated } : null);
    }
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
      storeUpdateReport(reportId, { comments: newComments, updatedAt: new Date().toISOString() }); // localStorage 저장
    }
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, comments: [...r.comments, comment] } : r));
    if (selectedReport?.id === reportId) {
      setSelectedReport(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null);
    }
    setReplyText('');
  };

  const filteredReports = filterStatus === 'all' ? reports : reports.filter(r => r.status === filterStatus);

  const statusCounts = useMemo(() => ({
    '접수됨': reports.filter(r => r.status === '접수됨').length,
    '처리중': reports.filter(r => r.status === '처리중').length,
    '완료': reports.filter(r => r.status === '완료').length,
    '보류': reports.filter(r => r.status === '보류').length,
  }), [reports]);

  // ── Login ────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <div className="app-container">
        <PortalLogin appType="admin" onLogin={handleAdminLogin} />
      </div>
    );
  }

  // ── Detail ──────────────────────────────────────────────────────
  if (screen === 'detail' && selectedReport) {
    const sc = STATUS_CONFIG[selectedReport.status];
    const cat = CATEGORIES.find(c => c.id === selectedReport.category);
    const r = reports.find(r => r.id === selectedReport.id) || selectedReport;

    return (
      <div className="app-container flex flex-col min-h-screen bg-gray-50">
        <div className="flex items-center gap-3 px-4 py-4" style={{ background: '#0f9d58' }}>
          <button onClick={() => setScreen('list')} className="text-white text-xl">←</button>
          <h2 className="text-white font-bold text-lg">신고 상세</h2>
          <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium bg-white/20 text-white">{r.id}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Status & category */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{cat?.icon}</span>
              <div>
                <div className="font-bold text-gray-800">{r.title}</div>
                <div className="text-xs text-gray-400">{r.buildingName} {r.location && `· ${r.location}`}</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: sc.bg, color: sc.color }}>{r.status}</span>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium text-white" style={{ background: PRIORITY_COLORS[r.priority] }}>
                {r.priority === 'high' ? '🔴 긴급' : r.priority === 'medium' ? '🟡 보통' : '🟢 낮음'}
              </span>
            </div>
            {r.description && <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{r.description}</p>}
            <div className="mt-3 text-xs text-gray-400 space-y-1">
              <div>신고자: {r.reportedBy}</div>
              <div>접수: {new Date(r.reportedAt).toLocaleString('ko-KR')}</div>
              <div>최종업데이트: {new Date(r.updatedAt).toLocaleString('ko-KR')}</div>
            </div>
          </div>

          {/* Status change */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h4 className="text-sm font-bold text-gray-700 mb-3">상태 변경</h4>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(STATUS_CONFIG) as IssueStatus[]).map(s => {
                const sc2 = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => updateStatus(r.id, s)}
                    className="py-2.5 rounded-xl text-sm font-medium border-2 transition active:scale-95"
                    style={r.status === s
                      ? { borderColor: sc2.color, background: sc2.bg, color: sc2.color }
                      : { borderColor: '#e5e7eb', background: '#f9fafb', color: '#6b7280' }
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h4 className="text-sm font-bold text-gray-700 mb-3">메시지 ({r.comments.length})</h4>
            <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
              {r.comments.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">아직 메시지가 없습니다</p>
              ) : (
                r.comments.map(c => (
                  <div key={c.id} className={`p-3 rounded-xl text-sm ${c.role === 'admin' ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-xs" style={{ color: c.role === 'admin' ? '#0f9d58' : '#6b7280' }}>{c.author}</span>
                      <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-gray-700">{c.text}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400"
                placeholder="답변을 입력하세요..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addReply(r.id)}
              />
              <button
                onClick={() => addReply(r.id)}
                className="px-4 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ background: '#0f9d58' }}
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
      <div className="app-container flex flex-col min-h-screen bg-gray-50">
        {/* Notification popup */}
        {notification.visible && notification.report && (
          <div
            className="absolute top-4 left-4 right-4 z-50 rounded-2xl p-4 shadow-lg border-l-4"
            style={{ background: '#fff', borderLeftColor: '#dc2626' }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔔</span>
              <div className="flex-1">
                <div className="font-bold text-sm text-gray-800">새 신고 접수!</div>
                <div className="text-xs text-gray-600 mt-0.5">{notification.report.title}</div>
                <div className="text-xs text-gray-400">{notification.report.buildingName} · {notification.report.location}</div>
              </div>
              <button onClick={() => setNotification({ visible: false, report: null })} className="text-gray-400 text-lg">✕</button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 px-4 py-4" style={{ background: '#0f9d58' }}>
          <button onClick={() => setScreen('dashboard')} className="text-white text-xl">←</button>
          <h2 className="text-white font-bold text-lg">신고 목록</h2>
          <span className="ml-auto text-white text-sm opacity-80">구역 {selectedZone}</span>
        </div>

        {/* Filter tabs */}
        <div className="bg-white border-b px-4 py-2 flex gap-2 overflow-x-auto">
          {(['all', '접수됨', '처리중', '완료', '보류'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition"
              style={filterStatus === s
                ? { background: '#0f9d58', color: '#fff' }
                : { background: '#f3f4f6', color: '#6b7280' }
              }
            >
              {s === 'all' ? `전체 (${reports.length})` : `${s} (${statusCounts[s] || 0})`}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm">해당 신고가 없습니다</p>
            </div>
          ) : (
            filteredReports.map(report => {
              const sc = STATUS_CONFIG[report.status];
              const cat = CATEGORIES.find(c => c.id === report.category);
              return (
                <button
                  key={report.id}
                  onClick={() => { setSelectedReport(report); setScreen('detail'); }}
                  className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100 transition active:scale-98"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat?.icon}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ background: cat?.color }}>
                        {report.category}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {report.priority === 'high' && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium text-white" style={{ background: PRIORITY_COLORS.high }}>긴급</span>
                      )}
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: sc.bg, color: sc.color }}>{report.status}</span>
                    </div>
                  </div>
                  <div className="font-semibold text-gray-800 text-sm mb-1">{report.title}</div>
                  <div className="text-xs text-gray-500">{report.buildingName} {report.location && `· ${report.location}`}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-400">신고자: {report.reportedBy}</div>
                    <div className="text-xs text-gray-400">{new Date(report.reportedAt).toLocaleDateString('ko-KR')}</div>
                  </div>
                  {report.comments.length === 0 && report.status === '접수됨' && (
                    <div className="mt-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded-lg">⚠ 아직 답변이 없습니다</div>
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

  return (
    <div className="app-container flex flex-col min-h-screen bg-gray-50">
      {/* Notification popup */}
      {notification.visible && notification.report && (
        <div
          className="absolute top-4 left-4 right-4 z-50 rounded-2xl p-4 shadow-lg border-l-4"
          style={{ background: '#fff', borderLeftColor: '#dc2626' }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔔</span>
            <div className="flex-1">
              <div className="font-bold text-sm text-gray-800">새 신고 접수!</div>
              <div className="text-xs text-gray-600 mt-0.5">{notification.report.title}</div>
              <div className="text-xs text-gray-400">{notification.report.buildingName}</div>
            </div>
            <button onClick={() => setNotification({ visible: false, report: null })} className="text-gray-400 text-lg">✕</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-12 pb-6" style={{ background: 'linear-gradient(135deg, #0f9d58 0%, #007a40 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <SuwonLogo size={36} variant="dark" showText />
          <div className="flex items-center gap-2">
            {urgentCount > 0 && (
              <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                🔴 긴급 {urgentCount}건
              </div>
            )}
            <button
              onClick={() => setScreen('list')}
              className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-lg"
            >
              🔔
              {statusCounts['접수됨'] > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: '#E9B800', color: '#003670' }}>
                  {statusCounts['접수됨']}
                </span>
              )}
            </button>
          </div>
        </div>
        <p className="text-green-200 text-sm mb-0.5">관리자 대시보드</p>
        <h1 className="text-white text-xl font-bold">{adminName}</h1>
        <div className="mt-1 flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="text-green-200 text-xs">구역 {selectedZone} 담당</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-4 gap-2">
          {[
            { label: '전체', value: reports.length, color: '#003670' },
            { label: '미처리', value: statusCounts['접수됨'], color: '#6b7280' },
            { label: '처리중', value: statusCounts['처리중'], color: '#d97706' },
            { label: '완료', value: statusCounts['완료'], color: '#16a34a' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Urgent reports */}
      {urgentCount > 0 && (
        <div className="px-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-700">🔴 긴급 처리 필요</h3>
          </div>
          <div className="space-y-2">
            {reports.filter(r => r.priority === 'high' && r.status !== '완료').map(r => {
              const cat = CATEGORIES.find(c => c.id === r.category);
              return (
                <button
                  key={r.id}
                  onClick={() => { setSelectedReport(r); setScreen('detail'); }}
                  className="w-full text-left bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3 active:scale-98 transition"
                >
                  <span className="text-xl">{cat?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{r.title}</div>
                    <div className="text-xs text-gray-500">{r.buildingName}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">{r.status}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent reports */}
      <div className="px-4 mt-4 pb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700">최근 신고</h3>
          <button onClick={() => setScreen('list')} className="text-xs font-medium" style={{ color: '#0f9d58' }}>전체 보기</button>
        </div>
        <div className="space-y-2">
          {reports.slice(0, 4).map(r => {
            const sc = STATUS_CONFIG[r.status];
            const cat = CATEGORIES.find(c => c.id === r.category);
            return (
              <button
                key={r.id}
                onClick={() => { setSelectedReport(r); setScreen('detail'); }}
                className="w-full text-left bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 active:scale-98 transition"
              >
                <span className="text-lg">{cat?.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{r.title}</div>
                  <div className="text-xs text-gray-400">{r.buildingName}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>{r.status}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

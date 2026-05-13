import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLogin from '../components/PortalLogin';
import { CATEGORIES, STATUS_CONFIG, PRIORITY_COLORS } from '../data/campus';
import { loadReports, updateReport as storeUpdateReport, loadAnnouncements, addAnnouncement, loadSportsApplications, updateSportsApplication, addPenalty, getUserPenalties, isUserSuspended, suspendUser, unsuspendUser } from '../data/store';
import type { IssueReport, IssueStatus, ZoneId, Announcement, SportsApplication, Penalty, PenaltyReason } from '../data/types';
import { SPORTS_FACILITIES } from '../data/sportsData';

type AdminType = 'maintenance' | 'rental';
type Screen = 'login' | 'dashboard' | 'list' | 'detail' | 'rental-dashboard' | 'rental-detail';

const PRIMARY = '#1a56db';

const RENTAL_STATUS_CFG: Record<string, { color: string; bg: string }> = {
  '대기':    { color: '#d97706', bg: '#fef3c7' },
  '승인':    { color: '#059669', bg: '#d1fae5' },
  '반려':    { color: '#dc2626', bg: '#fee2e2' },
  '반납대기': { color: '#7c3aed', bg: '#f5f3ff' },
  '반납완료': { color: '#6b7280', bg: '#f1f5f9' },
};

const ADMIN_ACCOUNTS: { id: string; zone: ZoneId; name: string }[] = [
  { id: 'mgr_a', zone: 'A', name: '공학관 관리팀' },
  { id: 'mgr_b', zone: 'B', name: '혁신·연구 관리팀' },
  { id: 'mgr_c', zone: 'C', name: '학생복지 관리팀' },
  { id: 'mgr_d', zone: 'D', name: '예술·문화 관리팀' },
  { id: 'mgr_e', zone: 'E', name: '인문·글로벌 관리팀' },
  { id: 'mgr_f', zone: 'F', name: '본부 관리팀' },
];

export default function AdminApp() {
  const navigate = useNavigate();
  const logoTapTimesRef = useRef<number[]>([]);

  const [screen, setScreen] = useState<Screen>('login');
  const [selectedZone, setSelectedZone] = useState<ZoneId>('C');
  const [adminName, setAdminName] = useState('');
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);
  const [replyText, setReplyText] = useState('');
  const [notification, setNotification] = useState<{ visible: boolean; report: IssueReport | null }>({ visible: false, report: null });
  const [filterStatus, setFilterStatus] = useState<IssueStatus | 'all'>('all');
  const [announcements, setAnnouncements] = useState<Announcement[]>(loadAnnouncements());
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [showAnnForm, setShowAnnForm] = useState(false);
  // Rental team state
  const [adminType, setAdminType] = useState<AdminType>('maintenance');
  const [sportsApps, setSportsApps] = useState<SportsApplication[]>([]);
  const [selectedSportsApp, setSelectedSportsApp] = useState<SportsApplication | null>(null);
  const [rentalTab, setRentalTab] = useState<'pending' | 'return' | 'history'>('pending');
  // Penalty / suspension state
  const [userPenalties, setUserPenalties] = useState<Penalty[]>([]);
  const [showPenaltyForm, setShowPenaltyForm] = useState(false);
  const [penaltyReason, setPenaltyReason] = useState<PenaltyReason>('예약 후 미이용');
  const [penaltyDetail, setPenaltyDetail] = useState('');
  const [appUserSuspended, setAppUserSuspended] = useState(false);

  useEffect(() => {
    if (screen === 'login') return;
    const handler = () => {
      if (adminType === 'rental') {
        setSportsApps(loadSportsApplications());
      } else {
        const fresh = loadReports().filter(r => r.zone === selectedZone);
        setReports(prev => {
          const newOnes = fresh.filter(nr => !prev.find(p => p.id === nr.id));
          if (newOnes.length > 0) setNotification({ visible: true, report: newOnes[0] });
          return fresh;
        });
      }
      setAnnouncements(loadAnnouncements());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [screen, selectedZone, adminType]);

  useEffect(() => {
    if (!selectedSportsApp) return;
    setUserPenalties(getUserPenalties(selectedSportsApp.applicantId));
    setAppUserSuspended(isUserSuspended(selectedSportsApp.applicantId));
    setShowPenaltyForm(false);
    setPenaltyDetail('');
    setPenaltyReason('예약 후 미이용');
  }, [selectedSportsApp?.id]);

  const handleAdminLogin = (id: string, pw: string): boolean => {
    // 시설 대관팀 계정
    const rentalId = id.toLowerCase();
    if ((rentalId === 'rental' || rentalId === 'rental1' || rentalId === 'rental2') && (pw === '1234' || pw === 'admin')) {
      setAdminType('rental');
      setAdminName('시설 대관팀');
      setSportsApps(loadSportsApplications());
      setScreen('rental-dashboard');
      return true;
    }
    // 시설보수관리팀 계정
    const account = ADMIN_ACCOUNTS.find(a => a.id === rentalId);
    if (!account || (pw !== '1234' && pw !== 'admin')) return false;
    setAdminType('maintenance');
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

  const handleLogoTap = () => {
    const now = Date.now();
    const recent = [...logoTapTimesRef.current.filter(t => now - t < 5000), now];
    logoTapTimesRef.current = recent;
    if (recent.length >= 5) {
      logoTapTimesRef.current = [];
      navigate('/dev');
    }
  };

  const postAnnouncement = () => {
    if (!annTitle.trim() || !annContent.trim()) return;
    addAnnouncement({
      id: `ANN-${Date.now()}`,
      title: annTitle.trim(),
      content: annContent.trim(),
      author: adminName,
      authorRole: 'admin',
      postedAt: new Date().toISOString(),
    });
    setAnnouncements(loadAnnouncements());
    setAnnTitle('');
    setAnnContent('');
    setShowAnnForm(false);
  };

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

  // ── Rental Detail ────────────────────────────────────────────
  if (screen === 'rental-detail' && adminType === 'rental' && selectedSportsApp) {
    const app = sportsApps.find(a => a.id === selectedSportsApp.id) ?? selectedSportsApp;
    const fac = SPORTS_FACILITIES.find(f => f.id === app.facilityId);
    const sc = RENTAL_STATUS_CFG[app.status] ?? RENTAL_STATUS_CFG['대기'];

    const doApprove = () => {
      updateSportsApplication(app.id, { status: '승인', updatedAt: new Date().toISOString() });
      const updated = loadSportsApplications();
      setSportsApps(updated);
      setSelectedSportsApp(updated.find(a => a.id === app.id) ?? null);
    };
    const doReject = () => {
      updateSportsApplication(app.id, { status: '반려', updatedAt: new Date().toISOString() });
      const updated = loadSportsApplications();
      setSportsApps(updated);
      setSelectedSportsApp(updated.find(a => a.id === app.id) ?? null);
    };
    const doApproveReturn = () => {
      updateSportsApplication(app.id, { status: '반납완료', updatedAt: new Date().toISOString() });
      const updated = loadSportsApplications();
      setSportsApps(updated);
      setSelectedSportsApp(updated.find(a => a.id === app.id) ?? null);
    };

    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
          <BackBtn to="rental-dashboard" />
          <h2 className="font-extrabold text-lg flex-1" style={{ color: '#0f172a' }}>대관 신청 상세</h2>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.color }}>
            {app.status}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{fac?.emoji}</span>
              <div>
                <div className="font-extrabold text-base" style={{ color: '#0f172a' }}>{app.facilityName}</div>
                <div className="text-xs font-mono" style={{ color: '#94a3b8' }}>{app.id}</div>
              </div>
            </div>
            {([
              ['신청일자', app.applicationDate],
              ['신청자', app.applicantName],
              ['연락처', app.applicantPhone],
              ['단체명', app.teamName],
              ['소속 학과/부서', app.department],
              ['대관일', app.rentalDate],
              ['시간', `${app.rentalStartTime} ~ ${app.rentalEndTime}`],
              ['행사명', app.eventName],
              ['신청사유', app.reason],
              ['참가인원', `${app.participantCount}명`],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="flex gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <span className="w-20 text-xs font-bold flex-shrink-0" style={{ color: '#94a3b8' }}>{label}</span>
                <span className="text-xs flex-1" style={{ color: '#1e293b' }}>{value}</span>
              </div>
            ))}
          </div>

          {app.returnPhotoUrl && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <h4 className="text-sm font-extrabold mb-3" style={{ color: '#0f172a' }}>반납 현장 사진</h4>
              <img src={app.returnPhotoUrl} alt="반납 현장 사진" className="w-full rounded-xl object-cover" style={{ maxHeight: 260 }} />
              {app.returnRequestedAt && (
                <div className="text-xs mt-2" style={{ color: '#94a3b8' }}>
                  반납 신청: {new Date(app.returnRequestedAt).toLocaleString('ko-KR')}
                </div>
              )}
            </div>
          )}

          {app.status === '대기' && (
            <div className="space-y-2">
              <button onClick={doApprove} className="w-full py-4 rounded-xl font-extrabold text-white text-base" style={{ background: '#059669' }}>
                ✅ 대관 승인
              </button>
              <button onClick={doReject} className="w-full py-3.5 rounded-xl font-extrabold text-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>
                ✕ 반려
              </button>
            </div>
          )}
          {app.status === '반납대기' && (
            <button onClick={doApproveReturn} className="w-full py-4 rounded-xl font-extrabold text-white text-base" style={{ background: '#7c3aed' }}>
              ✅ 반납 승인
            </button>
          )}
          {(app.status === '승인' || app.status === '반납완료' || app.status === '반려') && (
            <div className="py-3 rounded-xl text-center text-sm font-bold" style={{ background: sc.bg, color: sc.color }}>
              {app.status === '승인' ? '✅ 승인된 신청 (사용 중 또는 반납 대기)' : app.status === '반납완료' ? '✅ 반납 처리 완료' : '✕ 반려된 신청'}
            </div>
          )}

          {/* 제재 관리 section */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-extrabold" style={{ color: '#0f172a' }}>제재 현황</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: userPenalties.length >= 3 ? '#fee2e2' : userPenalties.length > 0 ? '#fef3c7' : '#f0fdf4',
                    color: userPenalties.length >= 3 ? '#dc2626' : userPenalties.length > 0 ? '#d97706' : '#059669',
                  }}>
                  제재 {userPenalties.length}회
                </span>
                {appUserSuspended && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#fee2e2', color: '#dc2626' }}>
                    🚫 이용정지
                  </span>
                )}
              </div>
            </div>

            {/* Suspension controls */}
            {appUserSuspended ? (
              <button
                onClick={() => {
                  unsuspendUser(app.applicantId);
                  setAppUserSuspended(false);
                }}
                className="w-full py-2.5 rounded-xl text-sm font-bold mb-3"
                style={{ background: '#f1f5f9', color: '#059669' }}
              >
                ✅ 이용정지 해제
              </button>
            ) : userPenalties.length >= 3 ? (
              <button
                onClick={() => {
                  suspendUser(app.applicantId, adminName);
                  setAppUserSuspended(true);
                }}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white mb-3"
                style={{ background: '#dc2626' }}
              >
                🚫 이용정지 부여
              </button>
            ) : null}

            {/* Penalty list */}
            {userPenalties.length > 0 && (
              <div className="space-y-2 mb-3">
                {userPenalties.map((p, idx) => (
                  <div key={p.id} className="rounded-xl px-3 py-2 text-xs" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                    <div className="flex justify-between mb-0.5">
                      <span className="font-bold" style={{ color: '#dc2626' }}>제재 {idx + 1}회 · {p.reason}</span>
                      <span style={{ color: '#94a3b8' }}>{new Date(p.issuedAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                    {p.detail && <p style={{ color: '#374151' }}>{p.detail}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Issue penalty form toggle */}
            <button
              onClick={() => setShowPenaltyForm(v => !v)}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition"
              style={showPenaltyForm
                ? { background: '#f1f5f9', color: '#64748b' }
                : { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }
              }
            >
              {showPenaltyForm ? '취소' : '⚠️ 제재 부여'}
            </button>

            {/* Penalty form */}
            {showPenaltyForm && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: '#0f172a' }}>제재 사유</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: '#e5e7eb', background: '#fafafa' }}
                    value={penaltyReason}
                    onChange={e => setPenaltyReason(e.target.value as PenaltyReason)}
                  >
                    {(['예약 후 미이용', '시설 훼손', '시설 불결 사용', '규정 위반', '기타'] as PenaltyReason[]).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: '#0f172a' }}>상세 내용</label>
                  <textarea
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-none"
                    style={{ borderColor: penaltyDetail ? '#dc2626' : '#e5e7eb', background: '#fafafa' }}
                    rows={2}
                    placeholder="제재 상세 내용을 입력하세요..."
                    value={penaltyDetail}
                    onChange={e => setPenaltyDetail(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => {
                    const newPenalty: Penalty = {
                      id: `PEN-${Date.now()}`,
                      userId: app.applicantId,
                      reason: penaltyReason,
                      detail: penaltyDetail,
                      applicationId: app.id,
                      facilityName: app.facilityName,
                      rentalDate: app.rentalDate,
                      issuedBy: adminName,
                      issuedAt: new Date().toISOString(),
                    };
                    addPenalty(newPenalty);
                    setUserPenalties(getUserPenalties(app.applicantId));
                    setShowPenaltyForm(false);
                    setPenaltyDetail('');
                    setPenaltyReason('예약 후 미이용');
                  }}
                  className="w-full py-3 rounded-xl font-bold text-white text-sm"
                  style={{ background: '#dc2626' }}
                >
                  제재 부여 확정
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Rental Dashboard ──────────────────────────────────────────
  if (screen === 'rental-dashboard' && adminType === 'rental') {
    const pendingApps = sportsApps.filter(a => a.status === '대기');
    const returnApps  = sportsApps.filter(a => a.status === '반납대기');
    const historyApps = sportsApps.filter(a => ['승인', '반려', '반납완료'].includes(a.status));
    const currentApps = rentalTab === 'pending' ? pendingApps : rentalTab === 'return' ? returnApps : historyApps;

    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="text-xs font-bold" style={{ color: '#64748b' }}>관리자 대시보드</div>
            <div className="text-lg font-extrabold" style={{ color: '#0f172a' }}>시설 대관팀</div>
          </div>
          <button
            onClick={() => { localStorage.removeItem('portal_autologin_admin'); setScreen('login'); setAdminName(''); setSportsApps([]); setAdminType('maintenance'); }}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#f1f5f9' }}
            title="로그아웃"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        <div className="px-4 pt-5 pb-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '승인 대기', value: pendingApps.length, color: '#d97706', bg: '#fef3c7' },
              { label: '반납 확인', value: returnApps.length,  color: '#7c3aed', bg: '#f5f3ff' },
              { label: '처리 완료', value: historyApps.length, color: '#059669', bg: '#d1fae5' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl py-3 px-2 text-center" style={{ background: s.bg }}>
                <div className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs font-medium mt-0.5" style={{ color: s.color + 'cc' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 pb-3 flex gap-2">
          {([
            ['pending', '승인 대기', pendingApps.length],
            ['return',  '반납 확인', returnApps.length],
            ['history', '완료 내역', historyApps.length],
          ] as const).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setRentalTab(key)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold relative"
              style={rentalTab === key ? { background: PRIMARY, color: 'white' } : { background: '#f1f5f9', color: '#64748b' }}
            >
              {label}
              {count > 0 && rentalTab !== key && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-extrabold flex items-center justify-center text-white"
                  style={{ background: '#ef4444', fontSize: 9 }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
          {currentApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48" style={{ color: '#94a3b8' }}>
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm font-medium">
                {rentalTab === 'pending' ? '대기 중인 신청이 없습니다' : rentalTab === 'return' ? '반납 확인 요청이 없습니다' : '완료된 내역이 없습니다'}
              </p>
            </div>
          ) : (
            currentApps.map(app => {
              const fac = SPORTS_FACILITIES.find(f => f.id === app.facilityId);
              const sc = RENTAL_STATUS_CFG[app.status] ?? RENTAL_STATUS_CFG['대기'];
              return (
                <button
                  key={app.id}
                  onClick={() => { setSelectedSportsApp(app); setScreen('rental-detail'); }}
                  className="w-full text-left bg-white rounded-2xl p-4 border border-gray-100 shadow-sm active:scale-98 transition"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{fac?.emoji}</span>
                      <span className="font-bold text-sm" style={{ color: '#0f172a' }}>{app.facilityName}</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>
                      {app.status}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: '#64748b' }}>
                    📅 {app.rentalDate} · {app.rentalStartTime}~{app.rentalEndTime}
                  </div>
                  <div className="text-xs mt-0.5 flex gap-2" style={{ color: '#94a3b8' }}>
                    <span>{app.applicantName}</span><span>·</span>
                    <span>{app.department}</span><span>·</span>
                    <span>{app.participantCount}명</span>
                  </div>
                  {app.status === '반납대기' && (
                    <div className="mt-2 text-xs px-2 py-1 rounded-lg inline-block" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                      📸 반납 사진 확인 필요
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

  // ── Login ─────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <div className="app-container">
        <PortalLogin appType="admin" onLogin={handleAdminLogin} onLogoTap={handleLogoTap} />
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
        <div className="flex items-center gap-2">
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
          <button
            onClick={() => { localStorage.removeItem('portal_autologin_admin'); setScreen('login'); setAdminName(''); setReports([]); setAdminType('maintenance'); }}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#f1f5f9' }}
            title="로그아웃"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
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
      <div className="px-4 pt-5">
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

      {/* Announcements */}
      <div className="px-4 pt-5 pb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold" style={{ color: '#0f172a' }}>공지사항 관리</h3>
          <button
            onClick={() => setShowAnnForm(v => !v)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl text-white"
            style={{ background: PRIMARY }}
          >
            {showAnnForm ? '취소' : '+ 공지 작성'}
          </button>
        </div>

        {showAnnForm && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-3 space-y-3">
            <input
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition"
              style={{ borderColor: annTitle ? PRIMARY : '#e2e8f0', background: '#fafafa' }}
              placeholder="공지 제목"
              value={annTitle}
              onChange={e => setAnnTitle(e.target.value)}
            />
            <textarea
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition resize-none"
              style={{ borderColor: annContent ? PRIMARY : '#e2e8f0', background: '#fafafa' }}
              placeholder="공지 내용을 입력하세요..."
              rows={3}
              value={annContent}
              onChange={e => setAnnContent(e.target.value)}
            />
            <button
              onClick={postAnnouncement}
              disabled={!annTitle.trim() || !annContent.trim()}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition disabled:opacity-50"
              style={{ background: PRIMARY }}
            >
              공지 게시
            </button>
          </div>
        )}

        <div className="space-y-2">
          {announcements.length === 0 ? (
            <div className="text-center py-6 text-sm" style={{ color: '#94a3b8' }}>게시된 공지사항이 없습니다</div>
          ) : (
            announcements.slice(0, 5).map(a => (
              <div key={a.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-bold text-sm" style={{ color: '#0f172a' }}>{a.title}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                    style={{ background: a.authorRole === 'dev' ? '#faf5ff' : '#eff6ff', color: a.authorRole === 'dev' ? '#7c3aed' : PRIMARY }}
                  >
                    {a.authorRole === 'dev' ? '개발자' : '관리자'}
                  </span>
                </div>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: '#475569' }}>{a.content}</p>
                <div className="text-xs" style={{ color: '#94a3b8' }}>
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

import { useState, useEffect, useMemo } from 'react';
import SuwonLogo from '../components/SuwonLogo';
import PortalLogin from '../components/PortalLogin';
import { BUILDINGS, CATEGORIES, STATUS_CONFIG, ZONES, PRIORITY_COLORS } from '../data/campus';
import { loadReports, addReport as storeAddReport } from '../data/store';
import type { IssueCategory, IssueReport } from '../data/types';

type Screen = 'home' | 'report' | 'myreports' | 'detail' | 'login';

export default function UserApp() {
  const [screen, setScreen] = useState<Screen>('login');
  const [userName, setUserName] = useState('');
  const [reports, setReports] = useState<IssueReport[]>([]);       // 내 신고
  const [allReports, setAllReports] = useState<IssueReport[]>(loadReports()); // 전체 (지도용)
  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);
  const [statusNotif, setStatusNotif] = useState<IssueReport | null>(null); // 관리자 처리 알림
  const [mapSelected, setMapSelected] = useState<{ building: typeof BUILDINGS[0]; reports: IssueReport[] } | null>(null);

  // 다른 탭(관리자 앱)에서 상태 변경 시 반영
  useEffect(() => {
    if (!userName) return;
    const handler = () => {
      const fresh = loadReports();
      const myFresh = fresh.filter(r => r.reportedBy === userName);
      // 상태가 바뀐 내 신고 찾아 알림 표시
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

  // New report form state
  const [form, setForm] = useState({
    title: '',
    category: '' as IssueCategory | '',
    buildingId: '',
    location: '',
    description: '',
    imagePreview: '',
  });
  const [submitted, setSubmitted] = useState(false);

  // ── Login ────────────────────────────────────────────────────
  const USER_ACCOUNTS: Record<string, string> = {
    'sw2024001': 'Suwon1!',
    'sw2024002': 'Suwon2!',
    'sw2024003': 'Suwon3!',
    'sw2024004': 'Suwon4!',
    'sw2024005': 'Suwon5!',
  };

  if (screen === 'login') {
    return (
      <div className="app-container">
        <PortalLogin
          appType="user"
          onLogin={(id, pw) => {
            if (USER_ACCOUNTS[id] === pw) {
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

  // ── Report form ───────────────────────────────────────────────
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
      storeAddReport(newReport);                          // localStorage에 저장
      setReports(prev => [newReport, ...prev]);           // 내 신고 목록 갱신
      setAllReports(loadReports());                       // 지도 데이터 갱신
      setSubmitted(true);
    };

    if (submitted) {
      return (
        <div className="app-container flex flex-col items-center justify-center min-h-screen px-8 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 text-4xl" style={{ background: '#dcfce7' }}>✅</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">신고가 접수되었습니다</h2>
          <p className="text-gray-500 text-sm mb-2">해당 구역 관리팀에게<br />자동으로 전달됩니다.</p>
          {zone && (
            <div className="mt-2 px-4 py-2 rounded-full text-sm font-medium text-white mb-6" style={{ background: zone.color }}>
              → {zone.adminName}
            </div>
          )}
          <button
            onClick={() => { setSubmitted(false); setForm({ title:'',category:'',buildingId:'',location:'',description:'',imagePreview:'' }); setScreen('home'); }}
            className="w-full py-3.5 rounded-xl font-bold text-white"
            style={{ background: '#003670' }}
          >
            홈으로 돌아가기
          </button>
        </div>
      );
    }

    return (
      <div className="app-container flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ background: '#003670' }}>
          <button onClick={() => setScreen('home')} className="text-white text-xl">←</button>
          <h2 className="text-white font-bold text-lg">시설 문제 신고</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Category */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">문제 유형 *</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setForm(f => ({ ...f, category: cat.id as IssueCategory }))}
                  className={`py-2 px-1 rounded-xl border-2 text-center transition ${form.category === cat.id ? 'border-current' : 'border-gray-200 bg-gray-50'}`}
                  style={form.category === cat.id ? { borderColor: cat.color, background: cat.color + '15' } : {}}
                >
                  <div className="text-xl mb-0.5">{cat.icon}</div>
                  <div className="text-xs font-medium" style={form.category === cat.id ? { color: cat.color } : { color: '#6b7280' }}>{cat.id}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">제목 *</label>
            <input
              className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm"
              placeholder="예) 3층 화장실 수도꼭지 파손"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Building */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">건물 선택 *</label>
            <select
              className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm bg-white"
              value={form.buildingId}
              onChange={e => setForm(f => ({ ...f, buildingId: e.target.value }))}
            >
              <option value="">건물을 선택하세요</option>
              {ZONES.map(zone => (
                <optgroup key={zone.id} label={`구역 ${zone.id}: ${zone.name}`}>
                  {BUILDINGS.filter(b => b.zone === zone.id).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {zone && (
              <div className="mt-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: zone.color + '20', color: zone.color }}>
                📍 담당: {zone.adminName}
              </div>
            )}
          </div>

          {/* Location detail */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">상세 위치</label>
            <input
              className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm"
              placeholder="예) 3층 남자화장실 입구 앞"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">상세 설명</label>
            <textarea
              className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm resize-none"
              placeholder="문제 상황을 자세히 설명해주세요..."
              rows={4}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">사진 첨부</label>
            {form.imagePreview ? (
              <div className="relative">
                <img src={form.imagePreview} alt="첨부 사진" className="w-full h-40 object-cover rounded-xl" />
                <button
                  onClick={() => setForm(f => ({ ...f, imagePreview: '' }))}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                >✕</button>
              </div>
            ) : (
              <label className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition">
                <div className="text-3xl mb-1">📸</div>
                <div className="text-sm text-gray-500">사진을 첨부하세요</div>
                <div className="text-xs text-gray-400 mt-0.5">탭하여 갤러리에서 선택</div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setForm(f => ({ ...f, imagePreview: url }));
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="px-4 py-4 border-t bg-white">
          <button
            onClick={handleSubmit}
            disabled={!form.title || !form.category || !form.buildingId}
            className="w-full py-3.5 rounded-xl font-bold text-base transition active:scale-95 disabled:opacity-40"
            style={{ background: '#003670', color: '#fff' }}
          >
            신고 접수하기
          </button>
        </div>
      </div>
    );
  }

  // ── My Reports ─────────────────────────────────────────────────
  if (screen === 'myreports') {
    return (
      <div className="app-container flex flex-col min-h-screen">
        <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ background: '#003670' }}>
          <button onClick={() => setScreen('home')} className="text-white text-xl">←</button>
          <h2 className="text-white font-bold text-lg">내 신고 내역</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm">신고 내역이 없습니다</p>
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
                    className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-98 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-lg">{cat?.icon}</span>
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: sc.bg, color: sc.color }}>{report.status}</span>
                    </div>
                    <div className="font-semibold text-gray-800 text-sm mb-1">{report.title}</div>
                    <div className="text-xs text-gray-500">{report.buildingName} {report.location && `· ${report.location}`}</div>
                    <div className="text-xs text-gray-400 mt-2">{new Date(report.reportedAt).toLocaleDateString('ko-KR')}</div>
                    {report.comments.length > 0 && (
                      <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        💬 관리팀 답변이 있습니다
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

  // ── Detail ──────────────────────────────────────────────────────
  if (screen === 'detail' && selectedReport) {
    // reports 상태(localStorage 갱신 반영)에서 최신 버전을 가져옴
    const r = reports.find(r => r.id === selectedReport.id) ?? selectedReport;
    const sc = STATUS_CONFIG[r.status];
    const cat = CATEGORIES.find(c => c.id === r.category);
    const zone = ZONES.find(z => z.id === r.zone);
    return (
      <div className="app-container flex flex-col min-h-screen">
        <div className="flex items-center gap-3 px-4 py-4" style={{ background: '#003670' }}>
          <button onClick={() => setScreen('myreports')} className="text-white text-xl">←</button>
          <h2 className="text-white font-bold text-lg">신고 상세</h2>
          <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: sc.bg, color: sc.color }}>{r.status}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {r.imageUrl && (
            <img src={r.imageUrl} alt="신고 사진" className="w-full h-48 object-cover rounded-2xl" />
          )}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{cat?.icon}</span>
              <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ background: cat?.color }}>{r.category}</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-3">{r.title}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex gap-2"><span className="text-gray-400 w-16">건물</span><span className="font-medium">{r.buildingName}</span></div>
              {r.location && <div className="flex gap-2"><span className="text-gray-400 w-16">위치</span><span>{r.location}</span></div>}
              {zone && <div className="flex gap-2"><span className="text-gray-400 w-16">담당</span><span className="font-medium" style={{ color: zone.color }}>{zone.adminName}</span></div>}
              <div className="flex gap-2"><span className="text-gray-400 w-16">접수일</span><span>{new Date(r.reportedAt).toLocaleString('ko-KR')}</span></div>
            </div>
            {r.description && (
              <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{r.description}</p>
            )}
          </div>

          {r.comments.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-2">관리팀 답변</h4>
              {r.comments.map(c => (
                <div key={c.id} className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-700">{c.author}</span>
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString('ko-KR')}</span>
                  </div>
                  <p className="text-sm text-gray-700">{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Home ───────────────────────────────────────────────────────
  const myCount = reports.length;
  const inProgressCount = reports.filter(r => r.status === '처리중').length;
  const completedCount = reports.filter(r => r.status === '완료').length;

  return (
    <div className="app-container flex flex-col min-h-screen bg-gray-50">
      {/* 관리자 처리 알림 배너 */}
      {statusNotif && (
        <div className="fixed top-4 left-4 right-4 z-50 rounded-2xl p-4 shadow-lg border-l-4 bg-white flex items-start gap-3"
          style={{ borderLeftColor: '#0f9d58' }}>
          <span className="text-2xl">✅</span>
          <div className="flex-1">
            <div className="font-bold text-sm text-gray-800">신고가 처리됐습니다!</div>
            <div className="text-xs text-gray-600 mt-0.5 truncate">{statusNotif.title}</div>
            <div className="text-xs font-medium mt-1" style={{ color: '#0f9d58' }}>상태: {statusNotif.status}</div>
          </div>
          <button onClick={() => setStatusNotif(null)} className="text-gray-400 text-lg">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-12 pb-6" style={{ background: 'linear-gradient(135deg, #003670 0%, #004a99 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <SuwonLogo size={36} variant="dark" showText />
          <div className="relative">
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-lg">🔔</button>
            {statusNotif && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ background: '#E9B800', color: '#003670' }}>1</span>
            )}
          </div>
        </div>
        <p className="text-blue-200 text-sm mb-1">안녕하세요,</p>
        <h1 className="text-white text-2xl font-bold">{userName} 님</h1>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-3 gap-3">
          {[
            { label: '전체 신고', value: myCount, color: '#003670' },
            { label: '처리중', value: inProgressCount, color: '#d97706' },
            { label: '완료', value: completedCount, color: '#16a34a' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main actions */}
      <div className="px-4 mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => setScreen('report')}
          className="rounded-2xl p-5 text-left shadow-sm transition active:scale-95"
          style={{ background: '#003670' }}
        >
          <div className="text-3xl mb-3">📸</div>
          <div className="text-white font-bold">시설 신고</div>
          <div className="text-blue-200 text-xs mt-1">사진과 위치 첨부</div>
        </button>
        <button
          onClick={() => setScreen('myreports')}
          className="rounded-2xl p-5 text-left shadow-sm transition active:scale-95 bg-white border border-gray-100"
        >
          <div className="text-3xl mb-3">📋</div>
          <div className="font-bold text-gray-800">내 신고 내역</div>
          <div className="text-gray-400 text-xs mt-1">진행 상황 확인</div>
        </button>
      </div>

      {/* Campus map — 신고 건물 이름 텍스트 오버레이 */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700">캠퍼스 신고 현황</h3>
          {Object.keys(reportsByBuilding).length > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: '#fee2e2', color: '#dc2626' }}>
              {Object.keys(reportsByBuilding).length}개 시설 신고 접수 중
            </span>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          {/* 지도 이미지 + 건물명 텍스트 오버레이 */}
          <div
            className="relative w-full overflow-x-auto overflow-y-hidden"
            style={{ touchAction: 'pan-x' }}
          >
            {/* 지도는 고정 너비로 가로 스크롤 가능 */}
            <div className="relative" style={{ width: '100%', minWidth: 320 }}>
              <img
                src="/campus-map.jpg"
                alt="수원대학교 캠퍼스 지도"
                className="w-full block"
                draggable={false}
              />
              {/* 모든 건물 텍스트 레이블 — 신고 있으면 빨간색, 없으면 검정색 */}
              {BUILDINGS.map(b => {
                const active = reportsByBuilding[b.id];
                const hasReports = !!active;
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
                    className="absolute active:opacity-60 transition-opacity"
                    style={{
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <span
                      className="font-bold leading-tight whitespace-nowrap flex items-center gap-0.5"
                      style={{
                        fontSize: 9,
                        color: hasReports ? '#dc2626' : '#1a1a1a',
                        background: 'rgba(255,255,255,0.93)',
                        borderRadius: 3,
                        padding: '1px 4px',
                        boxShadow: hasReports
                          ? '0 0 0 1.2px #dc262650'
                          : '0 0 0 1px rgba(0,0,0,0.12)',
                        display: 'flex',
                      }}
                    >
                      {b.name}
                      {hasReports && (
                        <span
                          className="inline-flex items-center justify-center rounded-full text-white font-bold ml-0.5"
                          style={{ width: 12, height: 12, background: '#dc2626', fontSize: 7, flexShrink: 0 }}
                        >
                          {active.length}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* 안내 텍스트 */}
          <div className="px-4 py-2.5 flex items-center gap-3 border-t border-gray-50">
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm" style={{ background: '#dc2626' }} />
              <span className="text-xs text-gray-400">신고 있음</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm" style={{ background: '#1a1a1a' }} />
              <span className="text-xs text-gray-400">신고 없음 (탭하여 신고)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 바텀시트 — 선택 건물 신고 현황 */}
      {mapSelected && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setMapSelected(null)}
          />
          {/* 슬라이드업 시트 */}
          <div
            className="fixed bottom-0 left-1/2 z-50 bg-white rounded-t-3xl shadow-2xl"
            style={{ width: '100%', maxWidth: 390, transform: 'translateX(-50%)' }}
          >
            {/* 핸들 */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            {/* 헤더 */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800">{mapSelected.building.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">신고 {mapSelected.reports.length}건 접수 중</p>
              </div>
              <button
                onClick={() => setMapSelected(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm"
              >✕</button>
            </div>
            {/* 신고 목록 */}
            <div className="overflow-y-auto px-4 py-3 space-y-2" style={{ maxHeight: 320 }}>
              {mapSelected.reports.map(r => {
                const sc = STATUS_CONFIG[r.status];
                const cat = CATEGORIES.find(c => c.id === r.category);
                const priorityLabel = r.priority === 'high' ? '긴급' : r.priority === 'medium' ? '보통' : '낮음';
                const priorityColor = PRIORITY_COLORS[r.priority];
                return (
                  <div
                    key={r.id}
                    className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{cat?.icon}</span>
                        <span className="text-xs font-semibold text-gray-600">{r.category}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: priorityColor, background: priorityColor + '15' }}>{priorityLabel}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: sc.bg, color: sc.color }}>{r.status}</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">{r.title}</p>
                    {r.location && <p className="text-xs text-gray-400">📍 {r.location}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">신고자: {r.reportedBy}</span>
                      <span className="text-xs text-gray-400">{new Date(r.reportedAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                    {r.comments.length > 0 && (
                      <div className="mt-2 text-xs px-2 py-1 rounded-lg" style={{ background: '#eff6ff', color: '#2563eb' }}>
                        💬 관리팀 답변 있음
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* 하단 버튼 */}
            <div className="px-4 py-4 border-t border-gray-100">
              <button
                onClick={() => { setMapSelected(null); setScreen('report'); }}
                className="w-full py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: '#003670' }}
              >
                이 건물 시설 신고하기
              </button>
            </div>
          </div>
        </>
      )}

      {/* Recent reports */}
      <div className="px-4 mt-4 pb-8">
        <h3 className="text-sm font-bold text-gray-700 mb-2">최근 신고 현황</h3>
        <div className="space-y-2">
          {allReports.slice(0, 3).map(r => {
            const sc = STATUS_CONFIG[r.status];
            const cat = CATEGORIES.find(c => c.id === r.category);
            return (
              <div key={r.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3">
                <span className="text-lg">{cat?.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{r.title}</div>
                  <div className="text-xs text-gray-400">{r.buildingName}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>{r.status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

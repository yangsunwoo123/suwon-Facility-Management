import { useState, useEffect } from 'react';
import PortalLogin from '../components/PortalLogin';
import { BUILDINGS, ZONES } from '../data/campus';
import { loadReports, updateReport as storeUpdateReport } from '../data/store';
import type { IssueReport, ZoneId, MidApprovalStatus } from '../data/types';

type Screen = 'login' | 'dashboard' | 'detail' | 'document';
type DocTab = 'gongmun' | 'form';

interface MidAccount {
  id: string;
  zone: ZoneId;
  name: string;
  title: string;
}

const MID_ACCOUNTS: MidAccount[] = [
  { id: 'mid_1', zone: 'A', name: '1구역 중간관리자', title: '인문사회융합대학 교학조교' },
  { id: 'mid_2', zone: 'B', name: '2구역 중간관리자', title: '혁신공과대학 교학조교' },
  { id: 'mid_3', zone: 'C', name: '3구역 중간관리자', title: '공학관 교학조교' },
  { id: 'mid_4', zone: 'D', name: '4구역 중간관리자', title: '도서관·SW 교학조교' },
  { id: 'mid_5', zone: 'E', name: '5구역 중간관리자', title: '음악·경영 교학조교' },
  { id: 'mid_6', zone: 'F', name: '6구역 중간관리자', title: '대학본부 담당자' },
];

const PRIMARY = '#7c3aed';

function buildGongmunHtml(report: IssueReport, managerTitle: string, managerName: string): string {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const zone = ZONES.find(z => z.id === report.zone);
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: '맑은 고딕', 'Malgun Gothic', sans-serif; font-size: 11pt; color: #000; background: #fff; }
  .page { width: 210mm; min-height: 297mm; padding: 25mm 20mm 20mm 30mm; position: relative; }
  .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20mm; }
  .header-table td { border: 1px solid #000; padding: 4px 8px; font-size: 10pt; vertical-align: middle; }
  .header-table .label { background: #f0f0f0; font-weight: bold; width: 80px; text-align: center; }
  .vertical-title { writing-mode: vertical-rl; text-orientation: upright; font-size: 22pt; font-weight: 900; letter-spacing: 4px; color: #003670; position: absolute; left: 5mm; top: 25mm; }
  .doc-title { text-align: center; font-size: 20pt; font-weight: 900; margin-bottom: 8mm; letter-spacing: 2px; }
  .stamp-grid { float: right; border: 1px solid #000; border-collapse: collapse; margin-bottom: 6mm; }
  .stamp-grid td { border: 1px solid #000; width: 28mm; height: 20mm; text-align: center; vertical-align: middle; font-size: 9pt; }
  .stamp-grid .stamp-header { background: #f0f0f0; font-weight: bold; font-size: 9pt; height: 10mm; }
  .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 8mm; clear: both; }
  .meta-table td { border: 1px solid #000; padding: 5px 10px; font-size: 10.5pt; vertical-align: top; }
  .meta-table .lbl { background: #f0f0f0; font-weight: bold; width: 100px; text-align: center; }
  .body-title { font-size: 13pt; font-weight: 900; margin: 6mm 0 4mm 0; text-align: center; text-decoration: underline; }
  .body-content { line-height: 2.2; font-size: 11pt; }
  .body-content ol { padding-left: 20px; }
  .body-content li { margin-bottom: 2mm; }
  .seal-area { margin-top: 10mm; text-align: right; font-size: 11pt; line-height: 2; }
  .seal-box { display: inline-block; width: 25mm; height: 25mm; border: 2px solid #cc0000; border-radius: 50%; line-height: 25mm; text-align: center; font-size: 9pt; color: #cc0000; font-weight: bold; margin-left: 5mm; vertical-align: middle; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="vertical-title">수원대학교</div>
  <div style="margin-left: 18mm;">
    <div class="doc-title">시 설 보 수 공 문</div>

    <table class="stamp-grid">
      <tr>
        <td class="stamp-header">담당</td>
        <td class="stamp-header">팀장</td>
        <td class="stamp-header">학과장</td>
      </tr>
      <tr>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    </table>

    <table class="meta-table">
      <tr>
        <td class="lbl">문서번호</td>
        <td>${report.id}-${new Date().getFullYear()}</td>
        <td class="lbl">시행일자</td>
        <td>${today}</td>
      </tr>
      <tr>
        <td class="lbl">수 신</td>
        <td colspan="3">수원대학교 환경관리과 ${zone?.adminName ?? ''}</td>
      </tr>
      <tr>
        <td class="lbl">발 신</td>
        <td colspan="3">${managerTitle} (${managerName})</td>
      </tr>
      <tr>
        <td class="lbl">제 목</td>
        <td colspan="3">${report.title} 시설보수 요청</td>
      </tr>
    </table>

    <div class="body-title">- 아 래 -</div>
    <div class="body-content">
      <ol>
        <li>귀 과의 노고에 감사드립니다.</li>
        <li>아래와 같이 시설보수를 요청하오니 조치하여 주시기 바랍니다.</li>
        <li>
          <strong>보수 요청 내용</strong><br>
          &nbsp;&nbsp;- 위 &nbsp;치: ${report.buildingName}${report.location ? ' ' + report.location : ''}<br>
          &nbsp;&nbsp;- 문제유형: ${report.category}<br>
          &nbsp;&nbsp;- 신고일자: ${new Date(report.reportedAt).toLocaleDateString('ko-KR')}<br>
          &nbsp;&nbsp;- 우선순위: ${report.priority === 'high' ? '긴급' : report.priority === 'medium' ? '보통' : '낮음'}<br>
          &nbsp;&nbsp;- 상세내용: ${report.description || '별첨 참고'}
        </li>
        <li>상기 사항에 대한 신속한 처리를 부탁드립니다.</li>
      </ol>
    </div>

    <div class="seal-area">
      ${today}<br>
      수원대학교 ${managerTitle}<br>
      담당자: ${managerName} <span class="seal-box">직인</span>
    </div>
  </div>
</div>
</body>
</html>`;
}

function buildFormHtml(report: IssueReport, managerTitle: string, managerName: string): string {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: '맑은 고딕', 'Malgun Gothic', sans-serif; font-size: 11pt; color: #000; background: #fff; }
  .page { width: 210mm; min-height: 297mm; padding: 20mm; }
  h1 { text-align: center; font-size: 18pt; font-weight: 900; letter-spacing: 3px; margin-bottom: 8mm; border-top: 3px solid #000; border-bottom: 3px solid #000; padding: 4mm 0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 5mm; }
  td { border: 1px solid #000; padding: 5px 8px; font-size: 10.5pt; vertical-align: middle; }
  .lbl { background: #f0f0f0; font-weight: bold; width: 110px; text-align: center; }
  .section-title { font-size: 12pt; font-weight: 900; margin: 6mm 0 3mm 0; }
  .sign-table td { height: 30mm; vertical-align: bottom; text-align: center; font-size: 10pt; padding-bottom: 4px; }
  .sign-table .sign-header { background: #f0f0f0; font-weight: bold; height: auto; padding: 5px; }
  .notice { margin-top: 4mm; font-size: 9pt; color: #555; line-height: 1.8; border: 1px solid #ccc; padding: 4mm; background: #fafafa; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <h1>시 설 보 수 신 청 서</h1>

  <div class="section-title">■ 신청 기본 정보</div>
  <table>
    <tr><td class="lbl">신청일자</td><td>${today}</td><td class="lbl">문서번호</td><td>${report.id}</td></tr>
    <tr><td class="lbl">신청부서</td><td colspan="3">${managerTitle}</td></tr>
    <tr><td class="lbl">신청담당자</td><td>${managerName}</td><td class="lbl">연락처</td><td></td></tr>
  </table>

  <div class="section-title">■ 보수 요청 내용</div>
  <table>
    <tr><td class="lbl">보수 건명</td><td colspan="3">${report.title}</td></tr>
    <tr><td class="lbl">보수 위치</td><td>${report.buildingName}</td><td class="lbl">세부 위치</td><td>${report.location || '-'}</td></tr>
    <tr><td class="lbl">문제 유형</td><td>${report.category}</td><td class="lbl">우선순위</td><td>${report.priority === 'high' ? '긴급' : report.priority === 'medium' ? '보통' : '낮음'}</td></tr>
    <tr><td class="lbl">최초 신고일</td><td>${new Date(report.reportedAt).toLocaleDateString('ko-KR')}</td><td class="lbl">신고자</td><td>${report.reportedBy}</td></tr>
    <tr><td class="lbl">상세 내용</td><td colspan="3" style="height:40mm;vertical-align:top;padding:6px;">${report.description || ''}</td></tr>
  </table>

  <div class="section-title">■ 서명란</div>
  <table class="sign-table">
    <tr>
      <td class="sign-header">신청자</td>
      <td class="sign-header">중간관리자 확인</td>
      <td class="sign-header">환경관리팀 접수</td>
      <td class="sign-header">처리 담당자</td>
    </tr>
    <tr>
      <td></td>
      <td>(인)</td>
      <td></td>
      <td></td>
    </tr>
  </table>

  <div class="notice">
    ※ 작성 안내<br>
    1. 본 신청서는 시설보수 요청을 위한 공식 서류입니다.<br>
    2. 긴급한 경우 환경관리과에 직접 유선 연락 후 본 서류를 제출하세요.<br>
    3. 사진 자료가 있을 경우 별지로 첨부하시기 바랍니다.
  </div>
</div>
</body>
</html>`;
}

function downloadDoc(html: string, filename: string) {
  const blob = new Blob(
    [`<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>${html}</html>`],
    { type: 'application/msword' }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function printDoc(html: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

export default function MiddleAdminApp() {
  const [screen, setScreen] = useState<Screen>('login');
  const [account, setAccount] = useState<MidAccount | null>(null);
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);
  const [tab, setTab] = useState<MidApprovalStatus | '검토대기'>('검토대기');
  const [note, setNote] = useState('');
  const [docTab, setDocTab] = useState<DocTab>('gongmun');

  useEffect(() => {
    if (!account) return;
    const handler = () => refreshReports();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const getZoneBuildings = (acc: MidAccount) =>
    BUILDINGS.filter(b => b.zone === acc.zone).map(b => b.id);

  const refreshReports = () => {
    if (!account) return;
    const zb = getZoneBuildings(account);
    const all = loadReports();
    setReports(all.filter(r => zb.includes(r.buildingId) || r.zone === account.zone));
  };

  const handleLogin = (id: string, pw: string): boolean => {
    if (pw !== '1234') return false;
    const acc = MID_ACCOUNTS.find(a => a.id === id.toLowerCase());
    if (!acc) return false;
    setAccount(acc);
    const zb = getZoneBuildings(acc);
    const all = loadReports();
    setReports(all.filter(r => zb.includes(r.buildingId) || r.zone === acc.zone));
    setScreen('dashboard');
    return true;
  };

  const handleApprove = () => {
    if (!selectedReport || !account) return;
    storeUpdateReport(selectedReport.id, {
      midStatus: '1차승인',
      midManagerName: account.title,
      midApprovedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    // saveReports already dispatches StorageEvent — refreshReports picks it up
    refreshReports();
    setNote('');
    setScreen('dashboard');
  };

  const handleReject = () => {
    if (!selectedReport || !note.trim()) return;
    storeUpdateReport(selectedReport.id, {
      midStatus: '반려',
      midManagerNote: note,
      status: '보류',
      updatedAt: new Date().toISOString(),
    });
    refreshReports();
    setNote('');
    setScreen('dashboard');
  };

  // ── Login ─────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <div className="app-container">
        <PortalLogin appType="admin" onLogin={handleLogin} />
      </div>
    );
  }

  const zoneBuildings = account ? getZoneBuildings(account) : [];
  const pendingReports = reports.filter(r => r.midStatus === '검토중' || !r.midStatus);
  const approvedReports = reports.filter(r => r.midStatus === '1차승인');
  const rejectedReports = reports.filter(r => r.midStatus === '반려');
  const currentReports =
    tab === '검토대기' ? pendingReports :
    tab === '1차승인' ? approvedReports : rejectedReports;
  const zone = account ? ZONES.find(z => z.id === account.zone) : null;

  // ── Document ──────────────────────────────────────────────────
  if (screen === 'document' && selectedReport && account) {
    const gongmunHtml = buildGongmunHtml(selectedReport, account.title, account.name);
    const formHtml = buildFormHtml(selectedReport, account.title, account.name);
    const currentHtml = docTab === 'gongmun' ? gongmunHtml : formHtml;
    const filename = docTab === 'gongmun'
      ? `공문_${selectedReport.id}.doc`
      : `시설보수신청서_${selectedReport.id}.doc`;

    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={() => setScreen('detail')}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#f1f5f9' }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-extrabold text-lg flex-1" style={{ color: '#0f172a' }}>문서 생성</h2>
        </div>

        <div className="px-4 pt-4 flex gap-2">
          {([['gongmun', '📄 공문'], ['form', '📝 시설보수신청서']] as [DocTab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDocTab(key)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition"
              style={docTab === key ? { background: PRIMARY, color: 'white' } : { background: '#f1f5f9', color: '#64748b' }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden px-4 pt-3">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
            <iframe
              srcDoc={currentHtml}
              title="문서 미리보기"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>

        <div className="px-4 py-4 space-y-2">
          <button
            onClick={() => printDoc(currentHtml)}
            className="w-full py-3.5 rounded-xl font-extrabold text-white text-sm"
            style={{ background: PRIMARY }}
          >
            🖨️ 인쇄 / PDF 저장
          </button>
          <button
            onClick={() => downloadDoc(currentHtml, filename)}
            className="w-full py-3 rounded-xl font-bold text-sm"
            style={{ background: '#f1f5f9', color: '#374151' }}
          >
            💾 Word 파일 다운로드 (.doc)
          </button>
        </div>
      </div>
    );
  }

  // ── Detail ────────────────────────────────────────────────────
  if (screen === 'detail' && selectedReport) {
    const r = reports.find(rep => rep.id === selectedReport.id) ?? selectedReport;
    const isPending = r.midStatus === '검토중' || !r.midStatus;
    const isApproved = r.midStatus === '1차승인';

    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={() => setScreen('dashboard')}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#f1f5f9' }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-extrabold text-lg flex-1" style={{ color: '#0f172a' }}>신고 검토</h2>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-bold"
            style={
              isApproved
                ? { background: '#d1fae5', color: '#059669' }
                : r.midStatus === '반려'
                ? { background: '#fee2e2', color: '#dc2626' }
                : { background: '#fef3c7', color: '#d97706' }
            }
          >
            {r.midStatus ?? '검토중'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="font-extrabold text-base mb-3" style={{ color: '#0f172a' }}>{r.title}</div>
            <div className="space-y-2">
              {([
                ['건물', r.buildingName],
                ['위치', r.location || '-'],
                ['카테고리', r.category],
                ['우선순위', r.priority === 'high' ? '긴급' : r.priority === 'medium' ? '보통' : '낮음'],
                ['신고자', r.reportedBy],
                ['신고일', new Date(r.reportedAt).toLocaleString('ko-KR')],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="w-16 text-xs font-bold flex-shrink-0" style={{ color: '#94a3b8' }}>{label}</span>
                  <span className="text-sm" style={{ color: '#1e293b' }}>{value}</span>
                </div>
              ))}
            </div>
            {r.description && (
              <p className="mt-3 text-sm rounded-xl p-3" style={{ background: '#f8fafc', color: '#475569' }}>
                {r.description}
              </p>
            )}
          </div>

          {isApproved && (
            <button
              onClick={() => { setSelectedReport(r); setScreen('document'); }}
              className="w-full py-3.5 rounded-xl font-extrabold text-white text-sm"
              style={{ background: PRIMARY }}
            >
              📄 공문·시설보수신청서 생성
            </button>
          )}

          {isPending && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
              <h4 className="text-sm font-extrabold" style={{ color: '#0f172a' }}>검토 의견 (반려 시 필수)</h4>
              <textarea
                className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none"
                style={{ borderColor: note ? PRIMARY : '#e2e8f0', background: '#fafafa' }}
                rows={3}
                placeholder="반려 사유 또는 검토 의견을 입력하세요..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
              <button
                onClick={handleApprove}
                className="w-full py-4 rounded-xl font-extrabold text-white text-base"
                style={{ background: '#059669' }}
              >
                ✅ 1차 승인 — 환경관리팀에 전달
              </button>
              <button
                onClick={handleReject}
                disabled={!note.trim()}
                className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-40"
                style={{ background: '#fee2e2', color: '#dc2626' }}
              >
                ✕ 반려
              </button>
            </div>
          )}

          {r.midStatus === '반려' && r.midManagerNote && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <h4 className="text-sm font-extrabold mb-2" style={{ color: '#dc2626' }}>반려 사유</h4>
              <p className="text-sm" style={{ color: '#374151' }}>{r.midManagerNote}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────
  return (
    <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="text-xs font-bold" style={{ color: '#64748b' }}>중간관리자 대시보드</div>
          <div className="text-lg font-extrabold" style={{ color: '#0f172a' }}>{account?.title ?? ''}</div>
        </div>
        <button
          onClick={() => { setScreen('login'); setAccount(null); setReports([]); }}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: '#f1f5f9' }}
          title="로그아웃"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {zone && (
        <div className="px-4 pt-4">
          <div
            className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: zone.color + '18', border: `1.5px solid ${zone.color}40` }}
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0"
              style={{ background: zone.color }}
            >
              {zone.id}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold" style={{ color: zone.color }}>{zone.name} 담당 건물</div>
              <div className="text-xs mt-0.5 truncate" style={{ color: '#64748b' }}>
                {BUILDINGS.filter(b => zoneBuildings.includes(b.id)).map(b => b.name).join(' · ')}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-4 pb-2">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '검토대기', value: pendingReports.length, color: '#d97706', bg: '#fef3c7' },
            { label: '1차승인', value: approvedReports.length, color: '#059669', bg: '#d1fae5' },
            { label: '반려',   value: rejectedReports.length, color: '#dc2626', bg: '#fee2e2' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl py-3 px-2 text-center" style={{ background: s.bg }}>
              <div className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: s.color + 'cc' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-3 flex gap-2">
        {(['검토대기', '1차승인', '반려'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition"
            style={tab === t ? { background: PRIMARY, color: 'white' } : { background: '#f1f5f9', color: '#64748b' }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
        {currentReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48" style={{ color: '#94a3b8' }}>
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm font-medium">해당 신고가 없습니다</p>
          </div>
        ) : (
          currentReports.map(r => (
            <button
              key={r.id}
              onClick={() => { setSelectedReport(r); setNote(''); setScreen('detail'); }}
              className="w-full text-left bg-white rounded-2xl p-4 border border-gray-100 shadow-sm active:scale-98 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: '#f1f5f9', color: '#374151' }}>
                  {r.category}
                </span>
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                  style={
                    r.midStatus === '1차승인'
                      ? { background: '#d1fae5', color: '#059669' }
                      : r.midStatus === '반려'
                      ? { background: '#fee2e2', color: '#dc2626' }
                      : { background: '#fef3c7', color: '#d97706' }
                  }
                >
                  {r.midStatus ?? '검토중'}
                </span>
              </div>
              <div className="font-bold text-sm mb-1" style={{ color: '#0f172a' }}>{r.title}</div>
              <div className="text-xs" style={{ color: '#64748b' }}>
                {r.buildingName}{r.location && ` · ${r.location}`}
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-xs" style={{ color: '#94a3b8' }}>신고자: {r.reportedBy}</span>
                <span className="text-xs" style={{ color: '#94a3b8' }}>{new Date(r.reportedAt).toLocaleDateString('ko-KR')}</span>
              </div>
              {(r.midStatus === '검토중' || !r.midStatus) && (
                <div className="mt-2 text-xs px-2 py-1 rounded-lg font-medium inline-block" style={{ background: '#fef3c7', color: '#d97706' }}>
                  ⏳ 검토 필요
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

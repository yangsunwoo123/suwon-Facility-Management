import { useState, useEffect, useRef, useCallback } from 'react';
import { loadSportsApplications, addSportsApplication, updateSportsApplication } from '../data/store';
import { SPORTS_FACILITIES } from '../data/sportsData';
import type { SportsApplication, SportsFacilityId } from '../data/types';

type Screen = 'calendar' | 'apply' | 'myapps' | 'appdetail' | 'sign' | 'return';

const PRIMARY = '#1a56db';

const STATUS_CFG: Record<string, { color: string; bg: string }> = {
  '대기':    { color: '#d97706', bg: '#fef3c7' },
  '승인':    { color: '#059669', bg: '#d1fae5' },
  '반려':    { color: '#dc2626', bg: '#fee2e2' },
  '반납대기': { color: '#7c3aed', bg: '#f5f3ff' },
  '반납완료': { color: '#6b7280', bg: '#f1f5f9' },
};

// ── Time helpers ──────────────────────────────────────────────────
function timeToMin(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let min = 9 * 60; min <= 21 * 60; min += 30) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return slots;
}
const TIME_SLOTS = generateTimeSlots();

// ── Calendar helpers ──────────────────────────────────────────────
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDow(y: number, m: number) { return new Date(y, m, 1).getDay(); }
const DOW = ['일', '월', '화', '수', '목', '금', '토'];

// ── PDF print ────────────────────────────────────────────────────
function printPDF(app: SportsApplication, sig: string) {
  const fac = SPORTS_FACILITIES.find(f => f.id === app.facilityId);
  const win = window.open('', '_blank');
  if (!win) { alert('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.'); return; }
  win.document.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>스포츠 시설 대관 신청서</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Malgun Gothic','Apple SD Gothic Neo',sans-serif;padding:20mm 18mm;color:#000;font-size:10pt}
h1{text-align:center;font-size:18pt;font-weight:bold;margin-bottom:4mm}
.sub{text-align:center;font-size:9pt;color:#555;margin-bottom:8mm}
.notice{background:#fffbe6;border:1px solid #f59e0b;padding:3mm 5mm;font-size:8.5pt;margin-bottom:6mm;border-radius:3px}
table{width:100%;border-collapse:collapse;margin-bottom:8mm}
th,td{border:1px solid #555;padding:3mm 4mm;vertical-align:top}
th{background:#f3f4f6;font-weight:bold;width:32%;white-space:nowrap}
td{word-break:break-all}
.notes-td{min-height:25mm;white-space:pre-wrap}
.sign-row{margin-top:12mm;display:flex;justify-content:flex-end;align-items:flex-end;gap:8mm}
.sign-box{text-align:center}
.sign-box img{width:55mm;height:22mm;border:1px solid #999;display:block;object-fit:contain;background:#fff}
.sign-label{font-size:9pt;margin-top:2mm}
.logo{text-align:center;margin-bottom:6mm}
.logo-title{font-size:14pt;font-weight:bold;color:#1a56db;letter-spacing:1px}
.logo-sub{font-size:9pt;color:#666;margin-top:1mm}
.print-btn{display:block;margin:10mm auto 0;padding:6px 20px;background:#1a56db;color:#fff;border:none;border-radius:5px;font-size:10pt;cursor:pointer}
@media print{.print-btn{display:none}body{padding:12mm}}
</style></head><body>
<div class="logo"><div class="logo-title">THE UNIVERSITY OF SUWON</div><div class="logo-sub">수원대학교</div></div>
<h1>스포츠 시설 대관 신청서</h1>
<div class="sub">신청번호: ${app.id}</div>
<div class="notice">※ 1일 2시간 이상 신청할 수 없으며, 사용시간은 09:00 ~ 21:00 까지입니다.</div>
<table>
<tr><th>운동장 구분</th><td>${fac?.emoji ?? ''} ${app.facilityName}</td><th>신청일자</th><td>${app.applicationDate}</td></tr>
<tr><th>신청자</th><td>${app.applicantName}</td><th>신청번호</th><td>${app.id}</td></tr>
<tr><th>신청자 연락처</th><td colspan="3">${app.applicantPhone}</td></tr>
<tr><th>대관 신청일</th><td colspan="3">${app.rentalDate}</td></tr>
<tr><th>대관 신청시간</th><td colspan="3">${app.rentalStartTime} ~ ${app.rentalEndTime}</td></tr>
<tr><th>행사명</th><td colspan="3">${app.eventName}</td></tr>
<tr><th>신청사유</th><td colspan="3">${app.reason}</td></tr>
<tr><th>소속 학과/부서명</th><td colspan="3">${app.department}</td></tr>
<tr><th>참가 인원수</th><td colspan="3">${app.participantCount}명</td></tr>
<tr><th>참가자 명단 및 비고사항</th><td colspan="3" class="notes-td">${app.participantNotes.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td></tr>
</table>
<div class="sign-row">
  <div class="sign-box">
    <div class="sign-label">신청인: ${app.applicantName}</div>
    <img src="${sig}" alt="서명"/>
    <div class="sign-label">(서명 또는 날인)</div>
  </div>
</div>
<div style="text-align:center;margin-top:10mm;font-size:8.5pt;color:#666">수원대학교 시설관리처 · 031-220-2000</div>
<button class="print-btn" onclick="window.print()">출력 / PDF 저장</button>
</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

// ── BackBtn ───────────────────────────────────────────────────────
function BackBtn({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3.5 flex items-center gap-3">
      <button onClick={onBack} className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f1f5f9' }}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span className="font-bold text-base" style={{ color: '#0f172a' }}>{label}</span>
    </div>
  );
}

// ── Signature Pad ─────────────────────────────────────────────────
function SignaturePad({ onSave, onCancel }: { onSave: (dataUrl: string) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [isEmpty, setIsEmpty] = useState(true);

  const getXY = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = true;
    lastPos.current = getXY(e);
    setIsEmpty(false);
  };

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getXY(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  }, []);

  const endDraw = () => { drawing.current = false; };

  const clear = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsEmpty(true);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-center" style={{ color: '#64748b' }}>
        아래 서명란에 손가락 또는 마우스로 서명하세요
      </p>
      <div className="relative w-full rounded-2xl overflow-hidden border-2" style={{ borderColor: PRIMARY }}>
        <canvas
          ref={canvasRef}
          width={680}
          height={200}
          className="w-full touch-none"
          style={{ background: '#fafcff', cursor: 'crosshair' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <div className="absolute bottom-2 right-3 text-xs" style={{ color: '#c7d2fe' }}>서명</div>
      </div>
      <div className="flex gap-2 w-full">
        <button onClick={clear} className="flex-1 py-2.5 rounded-xl text-sm font-bold" style={{ background: '#f1f5f9', color: '#64748b' }}>
          다시 서명
        </button>
        <button
          onClick={() => !isEmpty && onSave(canvasRef.current!.toDataURL())}
          className="flex-2 flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: isEmpty ? '#94a3b8' : PRIMARY, flex: 2 }}
        >
          서명 완료 → 신청서 출력
        </button>
      </div>
      <button onClick={onCancel} className="text-xs" style={{ color: '#94a3b8' }}>취소</button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function SportsBookingApp({ onBack, userName }: { onBack: () => void; userName: string }) {
  // All state at top (React Hooks rule)
  const [screen, setScreen]           = useState<Screen>('calendar');
  const [apps, setApps]               = useState<SportsApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<SportsApplication | null>(null);
  const [calYear, setCalYear]         = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth]       = useState(() => new Date().getMonth());
  const [calFacilityFilter, setCalFacilityFilter] = useState<SportsFacilityId | 'ALL'>('ALL');
  const [calSelectedDate, setCalSelectedDate] = useState<string | null>(null);

  // Apply form fields
  const [fFacility, setFFacility]     = useState<SportsFacilityId | ''>('');
  const [fPhone, setFPhone]           = useState('');
  const [fRentalDate, setFRentalDate] = useState('');
  const [fStartTime, setFStartTime]   = useState('');
  const [fEndTime, setFEndTime]       = useState('');
  const [fEventName, setFEventName]   = useState('');
  const [fReason, setFReason]         = useState('');
  const [fDept, setFDept]             = useState('');
  const [fCount, setFCount]           = useState('');
  const [fNotes, setFNotes]           = useState('');
  const [fError, setFError]           = useState('');
  const [returnPhotoUrl, setReturnPhotoUrl] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Load / listen for changes
  useEffect(() => {
    const refresh = () => setApps(loadSportsApplications());
    refresh();
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const myApps = apps.filter(a => a.applicantId === userName);

  // ── Phone auto-format ──────────────────────────────────────────
  const handlePhone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    let formatted = d;
    if (d.length > 7) formatted = `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
    else if (d.length > 3) formatted = `${d.slice(0,3)}-${d.slice(3)}`;
    setFPhone(formatted);
  };

  // ── Open apply pre-filled with date ──────────────────────────
  const openApply = (date?: string) => {
    setFRentalDate(date ?? '');
    setFStartTime('');
    setFEndTime('');
    setFError('');
    setScreen('apply');
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!fFacility || !fPhone || !fRentalDate || !fStartTime || !fEndTime || !fEventName || !fReason || !fDept || !fCount) {
      setFError('모든 필수 항목을 입력해주세요.');
      return;
    }
    if (fStartTime >= fEndTime) {
      setFError('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }
    const dur = timeToMin(fEndTime) - timeToMin(fStartTime);
    if (dur > 120) {
      setFError('1일 2시간 이상 신청할 수 없습니다.');
      return;
    }
    const cnt = parseInt(fCount, 10);
    if (isNaN(cnt) || cnt < 1) {
      setFError('참가 인원을 올바르게 입력해주세요.');
      return;
    }
    const fac = SPORTS_FACILITIES.find(f => f.id === fFacility)!;
    const newApp: SportsApplication = {
      id: `SA-${Date.now()}`,
      facilityId: fFacility as SportsFacilityId,
      facilityName: fac.name,
      applicationDate: today,
      applicantId: userName,
      applicantName: userName,
      applicantPhone: fPhone,
      rentalDate: fRentalDate,
      rentalStartTime: fStartTime,
      rentalEndTime: fEndTime,
      eventName: fEventName,
      reason: fReason,
      department: fDept,
      participantCount: cnt,
      participantNotes: fNotes,
      status: '대기',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addSportsApplication(newApp);
    setApps(loadSportsApplications());
    setSelectedApp(newApp);
    setScreen('appdetail');
  };

  // ── Calendar data ──────────────────────────────────────────────
  const filteredApps = calFacilityFilter === 'ALL'
    ? apps
    : apps.filter(a => a.facilityId === calFacilityFilter);

  const reservedDates: Record<string, { fac: typeof SPORTS_FACILITIES[0]; status: string }[]> = {};
  filteredApps.forEach(a => {
    if (a.status === '반려' || a.status === '반납완료') return;
    if (!reservedDates[a.rentalDate]) reservedDates[a.rentalDate] = [];
    const fac = SPORTS_FACILITIES.find(f => f.id === a.facilityId)!;
    reservedDates[a.rentalDate].push({ fac, status: a.status });
  });

  const selectedDateApps = calSelectedDate
    ? apps.filter(a => a.rentalDate === calSelectedDate && a.status !== '반려')
    : [];

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDow = getFirstDow(calYear, calMonth);
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;

  const monthLabel = `${calYear}년 ${calMonth + 1}월`;
  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
    setCalSelectedDate(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
    setCalSelectedDate(null);
  };

  // ── Screen: Apply ──────────────────────────────────────────────
  if (screen === 'apply') {
    const appNum = `SA-${Date.now().toString().slice(-6)}`;
    const endOptions = fStartTime
      ? TIME_SLOTS.filter(t => t > fStartTime && timeToMin(t) - timeToMin(fStartTime) <= 120)
      : [];

    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <BackBtn onBack={() => setScreen('calendar')} label="대관 신청" />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 pb-10">

          {/* 신청 정보 (읽기전용) */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
            <Row label="신청일자" value={today} />
            <Row label="신청자" value={userName} />
            <Row label="신청번호" value={appNum} />
          </div>

          {/* 운동장 구분 */}
          <Field label="운동장 구분" required>
            <select
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: fFacility ? PRIMARY : '#e5e7eb', background: '#fafafa' }}
              value={fFacility}
              onChange={e => setFFacility(e.target.value as SportsFacilityId)}
            >
              <option value="">- 선택 -</option>
              {SPORTS_FACILITIES.map(f => (
                <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>
              ))}
            </select>
          </Field>

          {/* 신청자 연락처 */}
          <Field label="신청자 연락처" required hint="예: 010-1234-5678">
            <input
              type="tel"
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: fPhone ? PRIMARY : '#e5e7eb', background: '#fafafa' }}
              placeholder="010-XXXX-XXXX"
              value={fPhone}
              onChange={e => handlePhone(e.target.value)}
            />
          </Field>

          {/* 안내 */}
          <div className="px-4 py-3 rounded-xl text-xs leading-relaxed" style={{ background: '#fffbeb', color: '#92400e' }}>
            ※ 1일 2시간 이상 신청할 수 없으며 사용시간은 09:00 ~ 21:00 까지 입니다.
          </div>

          {/* 대관신청일 */}
          <Field label="대관신청일" required>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: fRentalDate ? PRIMARY : '#e5e7eb', background: '#fafafa' }}
                min={today}
                value={fRentalDate}
                onChange={e => setFRentalDate(e.target.value)}
              />
              <button
                onClick={() => { setCalSelectedDate(fRentalDate || null); setScreen('calendar'); }}
                className="px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0"
                style={{ background: '#eff6ff', color: PRIMARY }}
              >
                예약현황보기
              </button>
            </div>
          </Field>

          {/* 대관신청시간 */}
          <Field label="대관신청시간" required hint="최대 2시간">
            <div className="flex items-center gap-2">
              <select
                className="flex-1 px-3 py-3 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: fStartTime ? PRIMARY : '#e5e7eb', background: '#fafafa' }}
                value={fStartTime}
                onChange={e => { setFStartTime(e.target.value); setFEndTime(''); }}
              >
                <option value="">시작</option>
                {TIME_SLOTS.slice(0, -1).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className="text-gray-400 font-bold">~</span>
              <select
                className="flex-1 px-3 py-3 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: fEndTime ? PRIMARY : '#e5e7eb', background: '#fafafa' }}
                value={fEndTime}
                onChange={e => setFEndTime(e.target.value)}
                disabled={!fStartTime}
              >
                <option value="">종료</option>
                {endOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </Field>

          {/* 행사명 */}
          <Field label="행사명" required>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: fEventName ? PRIMARY : '#e5e7eb', background: '#fafafa' }}
              placeholder="행사 또는 활동 이름"
              value={fEventName}
              onChange={e => { setFEventName(e.target.value); setFError(''); }}
            />
          </Field>

          {/* 신청사유 */}
          <Field label="신청사유" required>
            <textarea
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none"
              style={{ borderColor: fReason ? PRIMARY : '#e5e7eb', background: '#fafafa' }}
              rows={2}
              placeholder="사용 목적 및 사유"
              value={fReason}
              onChange={e => { setFReason(e.target.value); setFError(''); }}
            />
          </Field>

          {/* 소속학과/부서명 */}
          <Field label="소속학과/부서명" required>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: fDept ? PRIMARY : '#e5e7eb', background: '#fafafa' }}
              placeholder="학과 또는 부서 이름"
              value={fDept}
              onChange={e => setFDept(e.target.value)}
            />
          </Field>

          {/* 참가인원수 */}
          <Field label="참가인원수" required>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: fCount ? PRIMARY : '#e5e7eb', background: '#fafafa' }}
              min={1}
              placeholder="명"
              value={fCount}
              onChange={e => setFCount(e.target.value)}
            />
          </Field>

          {/* 참가자 명단 및 비고사항 */}
          <Field label="참가자 명단 및 비고사항">
            <textarea
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none"
              style={{ borderColor: '#e5e7eb', background: '#fafafa' }}
              rows={4}
              placeholder={'이름, 학번 등 참가자 명단 또는 비고 사항을 입력하세요.\n예) 홍길동(20240001), 김철수(20240002)'}
              value={fNotes}
              onChange={e => setFNotes(e.target.value)}
            />
          </Field>

          {fError && (
            <div className="flex items-start gap-2 px-3.5 py-3 rounded-xl" style={{ background: '#fff5f5', border: '1px solid #fecaca' }}>
              <span className="text-red-500 font-bold flex-shrink-0">!</span>
              <p className="text-xs text-red-600">{fError}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm"
            style={{ background: PRIMARY }}
          >
            신청 제출
          </button>
        </div>
      </div>
    );
  }

  // ── Screen: Sign ───────────────────────────────────────────────
  if (screen === 'sign' && selectedApp) {
    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <BackBtn onBack={() => setScreen('appdetail')} label="서명" />
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {/* Consent */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
            <h3 className="font-extrabold text-base" style={{ color: '#0f172a' }}>서명 및 개인정보 이용 동의</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
              본인은 위의 내용으로 스포츠 시설 대관을 신청하며, 시설 이용 규정을 준수하고
              신청 정보가 시설 관리 목적으로 사용됨에 동의합니다.
            </p>
            <div className="rounded-xl p-3 text-xs" style={{ background: '#f0fdf4', color: '#166534' }}>
              ✓ 이용 규정 준수 동의&nbsp;&nbsp;✓ 개인정보 수집·이용 동의
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <SignaturePad
              onSave={sig => {
                updateSportsApplication(selectedApp.id, { signatureDataUrl: sig });
                printPDF({ ...selectedApp, signatureDataUrl: sig }, sig);
                setSelectedApp(prev => prev ? { ...prev, signatureDataUrl: sig } : null);
                setApps(loadSportsApplications());
              }}
              onCancel={() => setScreen('appdetail')}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Screen: Return ────────────────────────────────────────────
  if (screen === 'return' && selectedApp) {
    const handleReturnSubmit = () => {
      updateSportsApplication(selectedApp.id, {
        status: '반납대기',
        returnPhotoUrl,
        returnRequestedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setApps(loadSportsApplications());
      setSelectedApp(prev => prev ? { ...prev, status: '반납대기', returnPhotoUrl } : null);
      setReturnPhotoUrl('');
      setScreen('appdetail');
    };

    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <BackBtn onBack={() => setScreen('appdetail')} label="시설 반납" />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-extrabold text-base mb-2" style={{ color: '#0f172a' }}>시설 반납 사진 촬영</h3>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#64748b' }}>
              시설 이용 후 현재 상태를 사진으로 남겨주세요. 관리팀이 확인 후 반납을 승인합니다.
            </p>
            <div className="rounded-xl p-3 text-xs leading-relaxed" style={{ background: '#fef3c7', color: '#92400e' }}>
              ⚠️ <strong>현장에서 카메라로 직접 촬영</strong>해야 합니다.<br />갤러리에서 기존 사진을 불러올 수 없습니다.
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            {returnPhotoUrl ? (
              <div className="relative">
                <img src={returnPhotoUrl} alt="반납 현장 사진" className="w-full rounded-xl object-cover" style={{ maxHeight: 300 }} />
                <button
                  onClick={() => setReturnPhotoUrl('')}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: '#ef4444' }}
                >✕</button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center rounded-2xl cursor-pointer py-10"
                style={{ border: '2px dashed #bfdbfe', background: '#f8fafc' }}>
                <div className="text-5xl mb-3">📷</div>
                <div className="font-bold text-sm mb-1" style={{ color: PRIMARY }}>카메라로 촬영하기</div>
                <div className="text-xs text-center" style={{ color: '#94a3b8' }}>
                  갤러리 선택 불가<br />현장에서 직접 촬영만 가능
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => setReturnPhotoUrl(reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            )}
          </div>

          {returnPhotoUrl && (
            <button
              onClick={handleReturnSubmit}
              className="w-full py-4 rounded-xl font-extrabold text-white text-base"
              style={{ background: '#7c3aed' }}
            >
              반납 신청하기
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Screen: App Detail ─────────────────────────────────────────
  if (screen === 'appdetail' && selectedApp) {
    const sc = STATUS_CFG[selectedApp.status];
    const fac = SPORTS_FACILITIES.find(f => f.id === selectedApp.facilityId);
    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <BackBtn onBack={() => setScreen('myapps')} label="신청 상세" />
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Status card */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono" style={{ color: '#94a3b8' }}>{selectedApp.id}</span>
              <span className="font-extrabold text-sm px-3 py-1 rounded-full" style={{ background: sc.bg, color: sc.color }}>
                {selectedApp.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{fac?.emoji}</span>
              <span className="font-extrabold text-base" style={{ color: '#0f172a' }}>{selectedApp.facilityName}</span>
            </div>
          </div>

          {/* Detail table */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
            {[
              ['신청일자', selectedApp.applicationDate],
              ['신청자', selectedApp.applicantName],
              ['연락처', selectedApp.applicantPhone],
              ['대관 신청일', selectedApp.rentalDate],
              ['대관 시간', `${selectedApp.rentalStartTime} ~ ${selectedApp.rentalEndTime}`],
              ['행사명', selectedApp.eventName],
              ['신청사유', selectedApp.reason],
              ['소속', selectedApp.department],
              ['참가인원', `${selectedApp.participantCount}명`],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <span className="w-24 text-xs font-bold flex-shrink-0" style={{ color: '#94a3b8' }}>{label}</span>
                <span className="text-xs flex-1" style={{ color: '#1e293b' }}>{value}</span>
              </div>
            ))}
            {selectedApp.participantNotes && (
              <div className="pt-2">
                <div className="text-xs font-bold mb-1" style={{ color: '#94a3b8' }}>참가자 명단 및 비고</div>
                <p className="text-xs whitespace-pre-wrap" style={{ color: '#374151' }}>{selectedApp.participantNotes}</p>
              </div>
            )}
          </div>

          {/* Sign & print button (승인된 경우) */}
          {selectedApp.status === '승인' && (
            <button
              onClick={() => setScreen('sign')}
              className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2"
              style={{ background: '#059669' }}
            >
              <span>✍️</span> 서명 후 신청서 출력 (PDF)
            </button>
          )}
          {selectedApp.status === '승인' && selectedApp.signatureDataUrl && (
            <button
              onClick={() => printPDF(selectedApp, selectedApp.signatureDataUrl!)}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: '#d1fae5', color: '#059669' }}
            >
              🖨️ 서명된 신청서 다시 출력
            </button>
          )}
          {/* Return button (승인 후 반납) */}
          {selectedApp.status === '승인' && (
            <button
              onClick={() => setScreen('return')}
              className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2"
              style={{ background: '#7c3aed' }}
            >
              <span>📸</span> 시설 반납하기
            </button>
          )}
          {/* Return status display */}
          {(selectedApp.status === '반납대기' || selectedApp.status === '반납완료') && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <h4 className="text-sm font-extrabold mb-2" style={{ color: '#0f172a' }}>반납 사진</h4>
              {selectedApp.returnPhotoUrl && (
                <img src={selectedApp.returnPhotoUrl} alt="반납 현장 사진" className="w-full rounded-xl object-cover mb-2" style={{ maxHeight: 200 }} />
              )}
              <div className="text-xs font-bold px-3 py-2 rounded-lg text-center"
                style={{ background: STATUS_CFG[selectedApp.status].bg, color: STATUS_CFG[selectedApp.status].color }}>
                {selectedApp.status === '반납대기' ? '⏳ 반납 승인 대기 중' : '✅ 반납 완료'}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Screen: My Apps ────────────────────────────────────────────
  if (screen === 'myapps') {
    const sorted = [...myApps].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
    return (
      <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        <BackBtn onBack={() => setScreen('calendar')} label="내 신청 내역" />
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
                const fac = SPORTS_FACILITIES.find(f => f.id === app.facilityId);
                return (
                  <button
                    key={app.id}
                    onClick={() => { setSelectedApp(app); setScreen('appdetail'); }}
                    className="w-full text-left bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{fac?.emoji}</span>
                        <span className="font-bold text-sm" style={{ color: '#0f172a' }}>{app.facilityName}</span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-xs mt-1 flex gap-3" style={{ color: '#64748b' }}>
                      <span>📅 {app.rentalDate}</span>
                      <span>🕐 {app.rentalStartTime}~{app.rentalEndTime}</span>
                    </div>
                    <div className="text-xs mt-0.5 truncate" style={{ color: '#94a3b8' }}>{app.eventName}</div>
                    {app.status === '승인' && !app.signatureDataUrl && (
                      <div className="mt-2 text-xs px-2 py-1 rounded-lg inline-block" style={{ background: '#d1fae5', color: '#059669' }}>
                        ✍️ 서명 후 출력 가능
                      </div>
                    )}
                    {app.status === '반납대기' && (
                      <div className="mt-2 text-xs px-2 py-1 rounded-lg inline-block" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                        ⏳ 반납 승인 대기중
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

  // ── Screen: Calendar (default) ─────────────────────────────────
  return (
    <div className="app-container flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f1f5f9' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-bold text-base flex-1" style={{ color: '#0f172a' }}>스포츠 시설 대관</span>
        <button
          onClick={() => setScreen('myapps')}
          className="text-xs font-bold px-3 py-1.5 rounded-xl"
          style={{ background: '#eff6ff', color: PRIMARY }}
        >
          내 신청
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Facility filter tabs */}
        <div className="flex gap-1.5 px-3 py-2.5 bg-white border-b border-gray-100 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setCalFacilityFilter('ALL')}
            className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0"
            style={calFacilityFilter === 'ALL' ? { background: PRIMARY, color: 'white' } : { background: '#f1f5f9', color: '#64748b' }}
          >
            전체
          </button>
          {SPORTS_FACILITIES.map(f => (
            <button
              key={f.id}
              onClick={() => setCalFacilityFilter(f.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0"
              style={calFacilityFilter === f.id ? { background: f.color, color: 'white' } : { background: '#f1f5f9', color: '#64748b' }}
            >
              {f.emoji} {f.name}
            </button>
          ))}
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={prevMonth} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#f1f5f9' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-extrabold text-base" style={{ color: '#0f172a' }}>{monthLabel}</span>
          <button onClick={nextMonth} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#f1f5f9' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar grid */}
        <div className="mx-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Day of week header */}
          <div className="grid grid-cols-7">
            {DOW.map((d, i) => (
              <div key={d} className="py-2 text-center text-xs font-bold"
                style={{ color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : '#374151' }}>
                {d}
              </div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 border-t border-gray-100">
            {Array.from({ length: totalCells }, (_, i) => {
              const dayNum = i - firstDow + 1;
              if (dayNum < 1 || dayNum > daysInMonth) {
                return <div key={i} className="h-14 border-b border-r border-gray-50 last:border-r-0" />;
              }
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
              const dots = reservedDates[dateStr] ?? [];
              const isToday = dateStr === today;
              const isPast = dateStr < today;
              const isSelected = dateStr === calSelectedDate;
              const dow = (firstDow + dayNum - 1) % 7;

              return (
                <button
                  key={i}
                  onClick={() => setCalSelectedDate(prev => prev === dateStr ? null : dateStr)}
                  className="h-14 flex flex-col items-center pt-1.5 border-b border-r border-gray-50 last:border-r-0 relative"
                  style={isSelected ? { background: '#eff6ff' } : isPast ? { background: '#fafafa' } : {}}
                >
                  <span
                    className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold"
                    style={
                      isToday
                        ? { background: PRIMARY, color: 'white' }
                        : { color: isPast ? '#cbd5e1' : dow === 0 ? '#ef4444' : dow === 6 ? '#3b82f6' : '#374151' }
                    }
                  >
                    {dayNum}
                  </span>
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {dots.slice(0, 3).map((d, j) => (
                      <span key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: d.fac.color }} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mx-3 mt-3 flex gap-3 flex-wrap">
          {SPORTS_FACILITIES.map(f => (
            <div key={f.id} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: f.color }} />
              <span className="text-xs" style={{ color: '#64748b' }}>{f.name}</span>
            </div>
          ))}
        </div>

        {/* Selected date panel */}
        {calSelectedDate && (
          <div className="mx-3 mt-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-extrabold text-sm" style={{ color: '#0f172a' }}>{calSelectedDate} 예약 현황</span>
              <button
                onClick={() => openApply(calSelectedDate)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl text-white"
                style={{ background: PRIMARY }}
              >
                + 이 날 신청
              </button>
            </div>
            {selectedDateApps.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm" style={{ color: '#94a3b8' }}>예약 없음 — 신청 가능합니다</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {selectedDateApps.map(a => {
                  const fac = SPORTS_FACILITIES.find(f => f.id === a.facilityId)!;
                  const sc = STATUS_CFG[a.status];
                  return (
                    <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                      <span className="text-lg">{fac.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate" style={{ color: '#0f172a' }}>{fac.name}</div>
                        <div className="text-xs" style={{ color: '#64748b' }}>
                          {a.rentalStartTime}~{a.rentalEndTime} · {a.eventName}
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>
                        {a.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => openApply()}
        className="fixed bottom-6 right-4 flex items-center gap-2 px-5 py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-lg z-30"
        style={{ background: PRIMARY, boxShadow: '0 8px 24px rgba(26,86,219,0.4)' }}
      >
        <span className="text-lg">+</span>
        대관 신청
      </button>
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────
function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-extrabold mb-1.5 block" style={{ color: '#0f172a' }}>
        {label}
        {required && <span style={{ color: PRIMARY }}> *</span>}
        {hint && <span className="text-xs font-normal ml-1" style={{ color: '#94a3b8' }}>({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-1 border-b border-gray-50 last:border-0">
      <span className="w-20 text-xs font-bold flex-shrink-0" style={{ color: '#94a3b8' }}>{label}</span>
      <span className="text-xs" style={{ color: '#374151' }}>{value}</span>
    </div>
  );
}

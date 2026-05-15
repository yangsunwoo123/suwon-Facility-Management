import { ZONES } from '../data/campus';
import type { IssueReport } from '../data/types';

export function buildGongmunHtml(
  report: IssueReport,
  managerTitle: string,
  managerName: string,
): string {
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
  .vertical-title { writing-mode: vertical-rl; text-orientation: upright; font-size: 22pt; font-weight: 900; letter-spacing: 4px; color: #003670; position: absolute; left: 5mm; top: 25mm; }
  .doc-title { text-align: center; font-size: 20pt; font-weight: 900; margin-bottom: 8mm; letter-spacing: 2px; }
  .stamp-grid { float: right; border: 1px solid #000; border-collapse: collapse; margin-bottom: 6mm; }
  .stamp-grid td { border: 1px solid #000; width: 28mm; height: 20mm; text-align: center; vertical-align: middle; font-size: 9pt; }
  .stamp-grid .sh { background: #f0f0f0; font-weight: bold; height: 10mm; }
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
      <tr><td class="sh">담당</td><td class="sh">팀장</td><td class="sh">학과장</td></tr>
      <tr><td></td><td></td><td></td></tr>
    </table>
    <table class="meta-table">
      <tr>
        <td class="lbl">문서번호</td><td>${report.id}-${new Date().getFullYear()}</td>
        <td class="lbl">시행일자</td><td>${today}</td>
      </tr>
      <tr><td class="lbl">수 신</td><td colspan="3">수원대학교 환경관리과 ${zone?.adminName ?? ''}</td></tr>
      <tr><td class="lbl">발 신</td><td colspan="3">${managerTitle} (${managerName})</td></tr>
      <tr><td class="lbl">제 목</td><td colspan="3">${report.title} 시설보수 요청</td></tr>
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

export function buildFormHtml(
  report: IssueReport,
  managerTitle: string,
  managerName: string,
): string {
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
  .sign-table .sh { background: #f0f0f0; font-weight: bold; height: auto; padding: 5px; }
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
      <td class="sh">신청자</td><td class="sh">중간관리자 확인</td>
      <td class="sh">환경관리팀 접수</td><td class="sh">처리 담당자</td>
    </tr>
    <tr><td></td><td>(인)</td><td></td><td></td></tr>
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

export function printDoc(html: string): void {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

export function downloadDoc(html: string, filename: string): void {
  const blob = new Blob(
    [`<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>${html}</html>`],
    { type: 'application/msword' },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

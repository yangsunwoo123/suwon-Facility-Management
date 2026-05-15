import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const apps = [
    {
      path: '/user',
      icon: '📱',
      title: '사용자',
      subtitle: 'USER',
      description: '시설 파손·전기·수도 등 이상을 신고하고, 체육시설 대관도 한 곳에서 신청하세요.',
      features: ['시설 이상 신고', '체육시설 대관 신청', '처리 현황 추적', '대관 일정 확인'],
      color: '#1a56db',
      bg: '#eff6ff',
      border: '#bfdbfe',
    },
    {
      path: '/midadmin',
      icon: '📋',
      title: '중간관리자',
      subtitle: 'MID-ADMIN',
      description: '학과·건물 담당 조교/학과장이 학생 신고를 검토하고, 공문·시설보수신청서를 생성해 구역 관리팀에 전달하세요.',
      features: ['신고 1차 검토·승인', '공문 자동 생성', '시설보수신청서 출력', '반려 및 메모 기능'],
      color: '#7c3aed',
      bg: '#faf5ff',
      border: '#ddd6fe',
    },
    {
      path: '/admin',
      icon: '🛠',
      title: '관리자',
      subtitle: 'ADMIN',
      description: '구역별 시설 신고를 접수·처리하고, 체육시설 대관 신청을 승인·관리하세요.',
      features: ['시설 신고 실시간 접수', '대관 신청 승인 처리', '반납 확인 관리', '이용자 제재 관리'],
      color: '#0f9d58',
      bg: '#f0fdf4',
      border: '#bbf7d0',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <img
            src="/logo-light.jpg"
            alt="수원대학교 로고"
            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div className="font-extrabold text-base leading-tight" style={{ color: '#0f172a' }}>수원대학교</div>
            <div className="text-xs font-semibold tracking-widest" style={{ color: '#64748b' }}>교내 시설관리 시스템</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-green-600 font-medium">운영중</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="px-5 pt-8 pb-6 max-w-md mx-auto w-full">
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: 'linear-gradient(135deg, #1a56db, #003670)' }}
        >
          <div className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-1">Campus Facility Management</div>
          <h1 className="text-white text-xl font-extrabold leading-tight mb-2">교내 시설 통합<br />관리 시스템</h1>
          <p className="text-blue-200 text-sm leading-relaxed">
            시설 이상 신고부터 체육시설 대관까지, 교내 시설 서비스를 한 곳에서 이용하세요.
          </p>
        </div>

        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">앱 선택</p>

        {/* App cards */}
        <div className="space-y-3">
          {apps.map(app => (
            <button
              key={app.path}
              onClick={() => navigate(app.path)}
              className="w-full text-left rounded-2xl border transition-all duration-150 active:scale-98 hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: app.bg, borderColor: app.border }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-2xl mb-2">{app.icon}</div>
                    <div
                      className="text-xs font-bold tracking-widest mb-0.5"
                      style={{ color: app.color }}
                    >
                      {app.subtitle}
                    </div>
                    <div className="text-base font-extrabold" style={{ color: '#0f172a' }}>{app.title}</div>
                  </div>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base mt-1 flex-shrink-0"
                    style={{ background: app.color }}
                  >
                    →
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3 leading-relaxed">{app.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {app.features.map(f => (
                    <span
                      key={f}
                      className="text-xs px-2 py-1 rounded-lg font-medium"
                      style={{ background: 'white', color: '#374151', border: `1px solid ${app.border}` }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pb-8 text-center text-xs text-gray-400">
        <p>© 2026 University of Suwon — Hackathon Project</p>
      </div>
    </div>
  );
}

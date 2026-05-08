import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const apps = [
    {
      path: '/user',
      icon: '📱',
      title: '사용자 앱',
      subtitle: 'USER APP',
      description: '시설 문제를 사진과 위치와 함께 신고하고 처리 현황을 실시간으로 확인하세요.',
      features: ['사진으로 간편 신고', '건물 · 위치 선택', '처리 현황 추적', '신고 이력 조회'],
      color: '#1a56db',
      bg: '#eff6ff',
      border: '#bfdbfe',
    },
    {
      path: '/admin',
      icon: '🛠',
      title: '관리자 앱',
      subtitle: 'ADMIN APP',
      description: '담당 구역 신고를 접수하고 처리 상태를 관리하며 신고자에게 답변하세요.',
      features: ['구역 신고 실시간 수신', '상태 업데이트 처리', '신고자 답변 기능', '처리 현황 대시보드'],
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
          <h1 className="text-white text-xl font-extrabold leading-tight mb-2">교내 시설 이상<br />신고 시스템</h1>
          <p className="text-blue-200 text-sm leading-relaxed">
            시설 파손·전기·수도 등의 문제를 신고하면 담당 관리팀이 즉시 처리합니다.
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

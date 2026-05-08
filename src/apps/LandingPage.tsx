import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const apps = [
    {
      path: '/user',
      icon: '📱',
      title: '사용자 앱',
      subtitle: 'User App',
      description: '시설 문제 신고 및 처리 현황 확인',
      features: ['📸 사진으로 신고', '📍 건물/위치 선택', '🔔 처리 알림', '📋 신고 이력 조회'],
      gradient: 'linear-gradient(135deg, #003670 0%, #004a99 100%)',
      accent: '#E9B800',
      textColor: '#fff',
    },
    {
      path: '/admin',
      icon: '🛠',
      title: '관리자 앱',
      subtitle: 'Admin App',
      description: '구역별 신고 접수 및 처리 관리',
      features: ['🔔 구역 알림 수신', '✅ 상태 업데이트', '💬 신고자 답변', '📊 처리 현황 대시보드'],
      gradient: 'linear-gradient(135deg, #0f9d58 0%, #007a40 100%)',
      accent: '#E9B800',
      textColor: '#fff',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-10 px-4" style={{ background: 'linear-gradient(160deg, #f0f4f8 0%, #e8eef5 100%)' }}>
      {/* Header */}
      <div className="w-full max-w-md mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-light.jpg"
              alt="수원대학교 로고"
              style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 12px rgba(0,54,112,0.15)' }}
            />
            <div className="text-left">
              <div className="font-extrabold text-xl leading-tight" style={{ color: '#003670' }}>수원대학교</div>
              <div className="text-xs font-semibold tracking-wider" style={{ color: '#b8960c' }}>UNIVERSITY OF SUWON</div>
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">교내 시설관리 시스템</h1>
        <p className="text-gray-500 text-sm">Campus Facility Management</p>
        <div className="mt-3 flex items-center justify-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-green-600 font-medium">서비스 운영 중</span>
        </div>
      </div>

      {/* App cards */}
      <div className="w-full max-w-md space-y-4">
        {apps.map(app => (
          <button
            key={app.path}
            onClick={() => navigate(app.path)}
            className="w-full text-left rounded-3xl overflow-hidden shadow-lg transition-all duration-200 active:scale-98 hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="p-6" style={{ background: app.gradient }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-4xl mb-2">{app.icon}</div>
                  <div className="text-white/60 text-xs font-semibold tracking-widest uppercase">{app.subtitle}</div>
                  <div className="text-white text-xl font-bold">{app.title}</div>
                </div>
                <div className="mt-1 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <span className="text-white text-xl">→</span>
                </div>
              </div>
              <p className="text-white/80 text-sm mb-4">{app.description}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {app.features.map(f => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-white/70">
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-1 w-full" style={{ background: app.accent }} />
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-400 space-y-1">
        <p>수원대학교 교내 시설관리 어플</p>
        <p>© 2026 University of Suwon. Hackathon Project.</p>
      </div>
    </div>
  );
}

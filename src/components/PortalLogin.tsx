import { useState } from 'react';

interface Props {
  appType: 'user' | 'admin' | 'dev';
  onLogin: (id: string, password: string) => boolean; // returns false if login fails
}

const APP_LABELS = {
  user: { title: '시설관리 신고', badge: '학생/교직원', badgeColor: '#003670' },
  admin: { title: '시설관리 관리자', badge: '관리자 전용', badgeColor: '#0f9d58' },
  dev: { title: '시설관리 개발자', badge: 'Developer', badgeColor: '#7c3aed' },
};

export default function PortalLogin({ appType, onLogin }: Props) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [saveId, setSaveId] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const label = APP_LABELS[appType];

  const handleLogin = async () => {
    if (!userId.trim() || !password.trim()) {
      setError('아이디(학번)와 비밀번호를 입력하세요.');
      return;
    }
    setLoading(true);
    setError('');
    // Simulate network delay
    await new Promise(r => setTimeout(r, 600));
    const ok = onLogin(userId.trim(), password.trim());
    if (!ok) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.\n입력하신 내용을 다시 확인해 주세요.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#003670' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-dark.jpg"
            alt="수원대학교 로고"
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div className="text-white text-sm font-bold leading-tight">수원대학교</div>
            <div className="text-blue-300 text-xs leading-tight tracking-wide">UNIVERSITY OF SUWON</div>
          </div>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
          style={{ background: label.badgeColor, opacity: 0.9 }}
        >
          {label.badge}
        </span>
      </div>

      {/* Hero section */}
      <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
        <img
          src="/logo-dark.jpg"
          alt="수원대학교 로고"
          style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', marginBottom: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
        />
        <h1 className="text-white text-lg font-bold mb-0.5">통합 포털 로그인</h1>
        <p className="text-blue-300 text-sm">{label.title}</p>
      </div>

      {/* Login card */}
      <div className="flex-1 mx-4 mb-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Card header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full" style={{ background: '#E9B800' }} />
            <span className="text-sm font-bold text-gray-700">포털 계정으로 로그인</span>
          </div>

          <div className="px-5 py-5 space-y-4">
            {/* 학번/아이디 */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block tracking-wide uppercase">학번 / 아이디</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm focus:outline-none transition"
                  style={{ borderColor: userId ? '#003670' : '#e5e7eb', background: '#fafafa' }}
                  placeholder="학번 또는 아이디 입력"
                  value={userId}
                  onChange={e => { setUserId(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block tracking-wide uppercase">비밀번호</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full pl-9 pr-10 py-3 rounded-xl border text-sm focus:outline-none transition"
                  style={{ borderColor: password ? '#003670' : '#e5e7eb', background: '#fafafa' }}
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Save ID */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setSaveId(v => !v)}
                className="w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0"
                style={{
                  width: 18, height: 18,
                  borderColor: saveId ? '#003670' : '#d1d5db',
                  background: saveId ? '#003670' : '#fff',
                }}
              >
                {saveId && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#E9B800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-600">아이디 저장</span>
            </label>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 px-3.5 py-3 rounded-xl bg-red-50 border border-red-100">
                <svg className="flex-shrink-0 mt-0.5" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-red-600 leading-relaxed whitespace-pre-line">{error}</p>
              </div>
            )}

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: '#003670', color: '#fff' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  로그인 중...
                </>
              ) : '로그인'}
            </button>
          </div>

          {/* Footer links */}
          <div className="px-5 pb-5 pt-1">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
              <button className="hover:text-gray-600 transition py-1 px-2">아이디 찾기</button>
              <span>|</span>
              <button className="hover:text-gray-600 transition py-1 px-2">비밀번호 찾기</button>
              <span>|</span>
              <button className="hover:text-gray-600 transition py-1 px-2">계정 문의</button>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom safe area */}
      <div className="pb-6 text-center">
        <p className="text-blue-400/60 text-xs">© 2026 University of Suwon</p>
      </div>
    </div>
  );
}

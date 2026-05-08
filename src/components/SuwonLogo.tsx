interface Props {
  size?: number;
  variant?: 'light' | 'dark'; // light = white bg logo, dark = navy bg logo
  showText?: boolean;
  className?: string;
}

export default function SuwonLogo({ size = 48, variant = 'light', showText = false, className = '' }: Props) {
  const src = variant === 'dark' ? '/logo-dark.jpg' : '/logo-light.jpg';

  if (showText) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img
          src={src}
          alt="수원대학교 로고"
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
        <div className="leading-tight">
          <div style={{ color: '#003670', fontSize: size * 0.33, fontWeight: 800, letterSpacing: '-0.5px' }}>수원대학교</div>
          <div style={{ color: '#b8960c', fontSize: size * 0.2, fontWeight: 600, letterSpacing: '0.5px' }}>UNIVERSITY OF SUWON</div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="수원대학교 로고"
      className={className}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
    />
  );
}

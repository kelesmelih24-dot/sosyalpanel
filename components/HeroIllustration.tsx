export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 480" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hero-blob" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE4EE" />
          <stop offset="100%" stopColor="#FBD0E0" />
        </linearGradient>
        <linearGradient id="hero-phone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A2438" />
          <stop offset="100%" stopColor="#171224" />
        </linearGradient>
        <linearGradient id="hero-brand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF4FA0" />
          <stop offset="100%" stopColor="#E6106B" />
        </linearGradient>
        <linearGradient id="hero-violet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9B7BFF" />
          <stop offset="100%" stopColor="#7A5CFF" />
        </linearGradient>
        <linearGradient id="hero-cyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3FE0FF" />
          <stop offset="100%" stopColor="#00C2E0" />
        </linearGradient>
      </defs>

      {/* Background blob */}
      <ellipse cx="240" cy="250" rx="200" ry="190" fill="url(#hero-blob)" />

      {/* Phone / device */}
      <rect x="165" y="110" width="150" height="280" rx="28" fill="url(#hero-phone)" />
      <rect x="178" y="130" width="124" height="220" rx="10" fill="#FDF2F5" />
      {/* Feed lines */}
      <circle cx="200" cy="155" r="10" fill="#F3B6CE" />
      <rect x="216" y="149" width="60" height="6" rx="3" fill="#F3B6CE" />
      <rect x="216" y="160" width="40" height="5" rx="2.5" fill="#F6D3E2" />
      <rect x="188" y="180" width="102" height="70" rx="8" fill="#F6D3E2" />
      <rect x="188" y="262" width="102" height="6" rx="3" fill="#F3B6CE" />
      <rect x="188" y="274" width="70" height="5" rx="2.5" fill="#F6D3E2" />
      <rect x="188" y="288" width="102" height="6" rx="3" fill="#F3B6CE" />
      <rect x="188" y="300" width="55" height="5" rx="2.5" fill="#F6D3E2" />

      {/* Home indicator */}
      <rect x="222" y="362" width="36" height="5" rx="2.5" fill="#E9A6C2" />

      {/* Floating badge: heart (brand pink) */}
      <g>
        <circle cx="95" cy="150" r="34" fill="url(#hero-brand)" />
        <path
          d="M95 165c-14-9-24-18-24-29a13 13 0 0 1 24-8 13 13 0 0 1 24 8c0 11-10 20-24 29Z"
          fill="white"
        />
      </g>

      {/* Floating badge: plus/follow (violet) */}
      <g>
        <circle cx="380" cy="140" r="30" fill="url(#hero-violet)" />
        <circle cx="373" cy="132" r="8" fill="white" />
        <path d="M357 152c3-9 9-13 16-13s13 4 16 13" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M389 128h10M394 123v10" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      </g>

      {/* Floating badge: comment (cyan) */}
      <g>
        <circle cx="400" cy="290" r="32" fill="url(#hero-cyan)" />
        <path
          d="M385 278h30a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6h-16l-10 9v-9h-4a6 6 0 0 1-6-6v-14a6 6 0 0 1 6-6Z"
          fill="white"
        />
      </g>

      {/* Floating badge: play (brand pink, smaller) */}
      <g>
        <circle cx="110" cy="340" r="26" fill="url(#hero-brand)" />
        <path d="M102 328v24l20-12Z" fill="white" />
      </g>

      {/* Small decorative dots */}
      <circle cx="60" cy="240" r="5" fill="#F3A9CB" />
      <circle cx="420" cy="200" r="4" fill="#B9A3FF" />
      <circle cx="150" cy="90" r="4" fill="#7CE3F5" />
    </svg>
  );
}

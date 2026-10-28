import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number | string;
  withShadow?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 40,
  withShadow = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={`shrink-0 ${withShadow ? 'drop-shadow-md' : ''} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Logo Meu Dinheiro em Dia"
    >
      <defs>
        <linearGradient id="logoOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF7500" />
          <stop offset="100%" stopColor="#E85D00" />
        </linearGradient>
        <linearGradient id="logoGreenGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2ED573" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {/* Orange Squircle Background */}
      <rect width="512" height="512" rx="136" fill="#FF6B00" />

      {/* 3 Growth Bar Columns */}
      <rect x="195" y="220" width="44" height="66" rx="12" fill="#FFFFFF" />
      <rect x="251" y="200" width="44" height="86" rx="12" fill="#FFFFFF" />
      <rect x="307" y="172" width="44" height="114" rx="12" fill="#FFFFFF" />

      {/* White Wallet Silhouette */}
      <path
        d="M 172 248
           C 152 248, 140 262, 140 282
           L 140 375
           C 140 398, 158 412, 185 412
           L 322 412
           C 349 412, 368 398, 368 375
           L 368 300
           C 368 285, 356 275, 342 275
           L 205 275
           C 192 275, 186 248, 172 248 Z"
        fill="#FFFFFF"
      />

      {/* Wallet Flap on Right */}
      <path
        d="M 314 300
           C 298 300, 287 312, 287 335
           C 287 358, 298 370, 314 370
           L 366 370
           C 376 370, 380 362, 380 350
           L 380 320
           C 380 308, 376 300, 366 300 Z"
        fill="#FFFFFF"
      />

      {/* Orange Circle Clasp on Flap */}
      <circle cx="328" cy="335" r="14" fill="#FF6B00" />

      {/* Green Growth Arrow Sweeping Upward */}
      <path
        d="M 168 220
           C 215 212, 268 185, 322 136"
        fill="none"
        stroke="url(#logoGreenGrad)"
        strokeWidth="24"
        strokeLinecap="round"
      />
      {/* Arrowhead */}
      <polygon points="302,96 366,146 326,150 318,128" fill="url(#logoGreenGrad)" />
      <path d="M 302 96 L 366 146 L 342 148 Z" fill="url(#logoGreenGrad)" />
    </svg>
  );
};

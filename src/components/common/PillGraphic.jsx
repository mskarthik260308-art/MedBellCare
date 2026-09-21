import React, { useId } from 'react';

// Color map for vibrant gradients
const COLOR_MAP = {
  emerald: { bg1: '#10b981', bg2: '#059669', glow: 'rgba(16, 185, 129, 0.4)' },
  cyan: { bg1: '#06b6d4', bg2: '#0891b2', glow: 'rgba(6, 182, 212, 0.4)' },
  crimson: { bg1: '#f43f5e', bg2: '#e11d48', glow: 'rgba(244, 63, 94, 0.4)' },
  amber: { bg1: '#f59e0b', bg2: '#d97706', glow: 'rgba(245, 158, 11, 0.4)' },
  purple: { bg1: '#a855f7', bg2: '#7e22ce', glow: 'rgba(168, 85, 247, 0.4)' },
  pink: { bg1: '#ec4899', bg2: '#be185d', glow: 'rgba(236, 72, 153, 0.4)' },
  blue: { bg1: '#3b82f6', bg2: '#1d4ed8', glow: 'rgba(59, 130, 246, 0.4)' },
  silver: { bg1: '#e2e8f0', bg2: '#94a3b8', glow: 'rgba(226, 232, 240, 0.4)' }
};

const STRIPE_COLOR_MAP = {
  cyan: '#06b6d4',
  emerald: '#10b981',
  crimson: '#f43f5e',
  amber: '#f59e0b',
  white: '#ffffff',
  yellow: '#fde047',
  orange: '#f97316',
  pink: '#f472b6'
};

export const PillGraphic = ({
  shape = 'capsule',
  color = 'emerald',
  stripeColor = 'cyan',
  size = 48,
  className = ''
}) => {
  const primary = COLOR_MAP[color] || COLOR_MAP.emerald;
  const secondaryColor = STRIPE_COLOR_MAP[stripeColor] || '#ffffff';

  // useId keeps SVG gradient references stable between renders while still
  // making every pill instance independent.
  const instanceId = useId().replace(/:/g, '');
  const gradientId = `pill-grad-${color}-${instanceId}`;
  const secondaryGradId = `pill-sec-grad-${stripeColor}-${instanceId}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primary.bg1} />
            <stop offset="100%" stopColor={primary.bg2} />
          </linearGradient>
          <linearGradient id={secondaryGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {shape === 'capsule' && (
          <g transform="rotate(-30 32 32)">
            {/* Left half capsule */}
            <path
              d="M16 32 C16 23.16 23.16 16 32 16 L32 48 C23.16 48 16 40.84 16 32 Z"
              fill={`url(#${gradientId})`}
            />
            {/* Right half capsule */}
            <path
              d="M32 16 L32 48 C40.84 48 48 40.84 48 32 C48 23.16 40.84 16 32 16 Z"
              fill={`url(#${secondaryGradId})`}
            />
            {/* Glossy sheen */}
            <ellipse cx="26" cy="22" rx="8" ry="3" fill="#ffffff" fillOpacity="0.35" transform="rotate(-15 26 22)" />
            <line x1="32" y1="16" x2="32" y2="48" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
          </g>
        )}

        {shape === 'tablet' && (
          <g>
            <circle cx="32" cy="32" r="22" fill={`url(#${gradientId})`} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            {/* Center score line */}
            <line x1="32" y1="14" x2="32" y2="50" stroke="rgba(0,0,0,0.2)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="32" y1="14" x2="32" y2="50" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round" />
            {/* Glossy curve */}
            <path d="M 18 24 A 18 18 0 0 1 46 24" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" fill="none" />
          </g>
        )}

        {shape === 'oval' && (
          <g transform="rotate(-20 32 32)">
            <rect x="14" y="22" width="36" height="20" rx="10" fill={`url(#${gradientId})`} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            {/* Stripe accent */}
            <rect x="28" y="22" width="8" height="20" fill={`url(#${secondaryGradId})`} fillOpacity="0.9" />
            <ellipse cx="24" cy="27" rx="6" ry="2" fill="#ffffff" fillOpacity="0.4" />
          </g>
        )}

        {shape === 'hexagon' && (
          <g>
            <polygon points="32,10 50,20 50,44 32,54 14,44 14,20" fill={`url(#${gradientId})`} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            <circle cx="32" cy="32" r="8" fill="none" stroke={secondaryColor} strokeWidth="2" strokeOpacity="0.8" />
          </g>
        )}

        {shape === 'liquid' && (
          <g>
            {/* Syrup bottle */}
            <rect x="22" y="10" width="20" height="8" rx="2" fill="#64748b" />
            <rect x="26" y="18" width="12" height="6" fill="#94a3b8" />
            <rect x="16" y="24" width="32" height="34" rx="6" fill="#1e293b" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            <rect x="18" y="32" width="28" height="24" rx="4" fill={`url(#${gradientId})`} />
            <text x="32" y="46" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">Rx</text>
          </g>
        )}

        {shape === 'injection' && (
          <g transform="rotate(-45 32 32)">
            {/* Syringe barrel */}
            <rect x="26" y="14" width="12" height="32" rx="2" fill="rgba(255,255,255,0.85)" stroke="#64748b" strokeWidth="1.5" />
            <rect x="28" y="22" width="8" height="20" rx="1" fill={`url(#${gradientId})`} />
            <line x1="32" y1="46" x2="32" y2="58" stroke="#cbd5e1" strokeWidth="2.5" />
            <rect x="22" y="10" width="20" height="4" fill="#64748b" rx="1" />
          </g>
        )}

        {shape === 'drops' && (
          <g>
            {/* Drop bottle */}
            <path d="M 32 10 L 22 26 L 22 48 C 22 53.5 26.5 58 32 58 C 37.5 58 42 53.5 42 48 L 42 26 Z" fill={`url(#${gradientId})`} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            <rect x="26" y="8" width="12" height="8" rx="2" fill="#e2e8f0" />
            <circle cx="32" cy="42" r="4" fill="#ffffff" fillOpacity="0.7" />
          </g>
        )}

        {shape === 'inhaler' && (
          <g>
            {/* Inhaler shape */}
            <path d="M 20 12 L 36 12 L 36 38 L 48 38 L 48 52 L 20 52 Z" fill={`url(#${gradientId})`} rx="4" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            <circle cx="28" cy="22" r="4" fill={secondaryColor} />
          </g>
        )}

        {shape === 'patch' && (
          <g transform="rotate(15 32 32)">
            <rect x="14" y="18" width="36" height="28" rx="4" fill={`url(#${gradientId})`} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="3 2" />
            <rect x="20" y="24" width="24" height="16" rx="2" fill="rgba(255,255,255,0.2)" />
          </g>
        )}
      </svg>
    </div>
  );
};

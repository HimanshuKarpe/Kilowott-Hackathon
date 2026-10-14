import React from 'react';

interface MerchlineLogoProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withBadge?: boolean;
  color?: string;
}

export const MerchlineLogo: React.FC<MerchlineLogoProps> = ({
  size = 'md',
  className = '',
  withBadge = true,
  color = '#2563EB',
}) => {
  const pixelSizes = {
    sm: 24,
    md: 34,
    lg: 44,
    xl: 56,
  };

  const dim = typeof size === 'number' ? size : pixelSizes[size] || 34;
  const innerDim = withBadge ? Math.round(dim * 0.72) : dim;

  const symbol = (
    <svg
      viewBox="0 0 64 64"
      width={innerDim}
      height={innerDim}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      {/* Top Node: Pill Capsule */}
      <rect
        x="22"
        y="11"
        width="20"
        height="12"
        rx="6"
        stroke={color}
        strokeWidth="4"
        fill="#FFFFFF"
      />

      {/* Circuit Branching Lines with 90-degree rounded corners */}
      <path
        d="M 14 41 V 34 C 14 30.5 16.5 28 20 28 H 44 C 47.5 28 50 30.5 50 34 V 41"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Central Trunk Line */}
      <path
        d="M 32 23 V 41"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Bottom 3 Ring Nodes */}
      <circle cx="14" cy="46" r="5" stroke={color} strokeWidth="4" fill="#FFFFFF" />
      <circle cx="32" cy="46" r="5" stroke={color} strokeWidth="4" fill="#FFFFFF" />
      <circle cx="50" cy="46" r="5" stroke={color} strokeWidth="4" fill="#FFFFFF" />
    </svg>
  );

  if (!withBadge) {
    return <span className={`inline-flex items-center justify-center ${className}`}>{symbol}</span>;
  }

  return (
    <div
      style={{ width: dim, height: dim }}
      className={`rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 ${className}`}
    >
      {symbol}
    </div>
  );
};

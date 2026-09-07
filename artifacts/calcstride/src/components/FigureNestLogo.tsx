import type { HTMLAttributes } from 'react';

type FigureNestLogoProps = HTMLAttributes<HTMLSpanElement> & {
  compact?: boolean;
};

export function FigureNestLogo({ compact = false, className = '', ...props }: FigureNestLogoProps) {
  const isHidden = props['aria-hidden'] === true || props['aria-hidden'] === 'true';
  return (
    <span
      {...props}
      className={`figurenest-logo${compact ? ' figurenest-logo-compact' : ''}${className ? ` ${className}` : ''}`}
      role={isHidden ? undefined : 'img'}
      aria-label={isHidden ? undefined : (props['aria-label'] ?? 'FigureNest')}
    >
      <svg className="figurenest-logo-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <rect className="logo-mark-back" x="7" y="6" width="50" height="52" rx="14" />
          <path className="logo-mark-leaf" d="M13 29c-6-1-9-5-9-10 6 0 11 3 13 8M51 29c6-1 9-5 9-10-6 0-11 3-13 8" />
          <path className="logo-mark-nest" d="M4 37c4-13 15-22 28-22s24 9 28 22M8 48c6-8 14-12 24-12s18 4 24 12" />
        <rect className="logo-mark-calculator" x="20" y="17" width="24" height="32" rx="5" />
        <rect className="logo-mark-screen" x="25" y="22" width="14" height="6" rx="2" />
        <circle className="logo-mark-key" cx="26" cy="35" r="2" />
        <circle className="logo-mark-key" cx="32" cy="35" r="2" />
        <circle className="logo-mark-key" cx="38" cy="35" r="2" />
        <circle className="logo-mark-key" cx="26" cy="42" r="2" />
        <circle className="logo-mark-key" cx="32" cy="42" r="2" />
          <path className="logo-mark-accent" d="M36 40h4v4h-4z" />
      </svg>
      {!compact && (
        <span className="figurenest-logo-wordmark" aria-hidden="true">
          <span>Figure</span><span>Nest</span>
        </span>
      )}
    </span>
  );
}
import React from 'react';

interface AlertBadgeProps {
  severity: string;
}

const CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  CRITICAL: { label: 'CRITICAL', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.35)', dot: '#f43f5e' },
  HIGH:     { label: 'HIGH',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', dot: '#f59e0b' },
  MEDIUM:   { label: 'MEDIUM',   color: '#eab308', bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.35)',  dot: '#eab308' },
  LOW:      { label: 'LOW',      color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)',  dot: '#10b981' },
};

export const AlertBadge: React.FC<AlertBadgeProps> = ({ severity }) => {
  const cfg = CONFIG[severity?.toUpperCase()] || CONFIG.LOW;

  return (
    <span
      className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[9px] font-mono-code font-bold uppercase tracking-wider"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: cfg.dot,
          boxShadow: `0 0 6px ${cfg.dot}`,
          animation: severity === 'CRITICAL' ? 'dot-blink 0.8s ease-in-out infinite' : undefined,
        }}
      />
      <span>{cfg.label}</span>
    </span>
  );
};

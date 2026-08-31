import React, { useEffect, useRef, useState } from 'react';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'cyan' | 'amber' | 'rose' | 'emerald' | 'indigo' | 'purple';
  trend?: number;
  index?: number;
}

const COLOR_MAP: Record<string, { text: string; border: string; bg: string; glow: string; gradient: string }> = {
  cyan:    { text: '#06b6d4', border: 'rgba(6,182,212,0.25)',   bg: 'rgba(6,182,212,0.08)',   glow: 'rgba(6,182,212,0.15)',   gradient: 'from-cyan-500/20 to-cyan-500/0' },
  amber:   { text: '#f59e0b', border: 'rgba(245,158,11,0.25)',  bg: 'rgba(245,158,11,0.08)',  glow: 'rgba(245,158,11,0.15)',  gradient: 'from-amber-500/20 to-amber-500/0' },
  rose:    { text: '#f43f5e', border: 'rgba(244,63,94,0.25)',   bg: 'rgba(244,63,94,0.08)',   glow: 'rgba(244,63,94,0.15)',   gradient: 'from-rose-500/20 to-rose-500/0' },
  emerald: { text: '#10b981', border: 'rgba(16,185,129,0.25)',  bg: 'rgba(16,185,129,0.08)',  glow: 'rgba(16,185,129,0.15)',  gradient: 'from-emerald-500/20 to-emerald-500/0' },
  indigo:  { text: '#6366f1', border: 'rgba(99,102,241,0.25)',  bg: 'rgba(99,102,241,0.08)',  glow: 'rgba(99,102,241,0.15)',  gradient: 'from-indigo-500/20 to-indigo-500/0' },
  purple:  { text: '#a855f7', border: 'rgba(168,85,247,0.25)', bg: 'rgba(168,85,247,0.08)', glow: 'rgba(168,85,247,0.15)', gradient: 'from-purple-500/20 to-purple-500/0' },
};

function useCountUp(target: number, duration = 800): number {
  const [count, setCount] = useState(0);
  const frame = useRef<number>(0);
  const start = useRef<number | null>(null);

  useEffect(() => {
    if (typeof target !== 'number') return;
    start.current = null;
    const animate = (timestamp: number) => {
      if (!start.current) start.current = timestamp;
      const progress = Math.min((timestamp - start.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame.current = requestAnimationFrame(animate);
    };
    frame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return count;
}

export const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, icon: Icon, color = 'cyan', trend, index = 0
}) => {
  const [visible, setVisible] = useState(false);
  const c = COLOR_MAP[color];
  const numericValue = typeof value === 'number' ? value : parseInt(value as string, 10) || 0;
  const displayCount = useCountUp(visible ? numericValue : 0, 900);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className="relative rounded-2xl overflow-hidden group cursor-default"
      style={{
        background: 'rgba(8, 12, 22, 0.85)',
        border: `1px solid ${c.border}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: `opacity 0.4s ease ${index * 80}ms, transform 0.4s ease ${index * 80}ms, box-shadow 0.25s ease, border-color 0.25s ease`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${c.border}, 0 0 20px ${c.glow}`;
        (e.currentTarget as HTMLDivElement).style.borderColor = c.text + '50';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)`;
        (e.currentTarget as HTMLDivElement).style.borderColor = c.border;
      }}
    >
      {/* Top accent gradient */}
      <div
        className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${c.gradient}`}
      />

      {/* Background glow blob */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ background: c.glow }}
      />

      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="section-label text-[9px] mb-2">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p
                className="font-display font-black text-3xl text-white leading-none"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {typeof value === 'number' ? displayCount : value}
              </p>
              {trend !== undefined && (
                <div className={`flex items-center space-x-1 text-[10px] font-mono-code ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                  <span>{Math.abs(trend)}%</span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-600 mt-1.5 truncate">{subtitle}</p>
            )}
          </div>

          {/* Icon */}
          <div
            className="p-3 rounded-xl shrink-0 ml-3 transition-transform duration-200 group-hover:scale-110"
            style={{ background: c.bg, border: `1px solid ${c.border}` }}
          >
            <Icon className="w-5 h-5" style={{ color: c.text }} />
          </div>
        </div>
      </div>
    </div>
  );
};

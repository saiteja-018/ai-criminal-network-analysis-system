import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, ArrowRight, Lock, User as UserIcon,
  Fingerprint, Zap, Globe, Eye, EyeOff
} from 'lucide-react';

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 4,
}));

const DEMO_USERS = [
  { label: 'Investigator', username: 'investigator', password: 'Investigator@123', color: '#06b6d4', role: 'INVESTIGATOR' },
  { label: 'Admin',        username: 'admin',         password: 'Admin@123',        color: '#f59e0b', role: 'ADMIN' },
  { label: 'Analyst',     username: 'analyst',       password: 'Analyst@123',      color: '#a855f7', role: 'ANALYST' },
  { label: 'Viewer',      username: 'viewer',        password: 'Viewer@123',       color: '#10b981', role: 'VIEWER' },
];

export const Login: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('investigator');
  const [password, setPassword] = useState('Investigator@123');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scanLine, setScanLine] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setScanLine(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#04070f] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Animated grid */}
      <div className="absolute inset-0 bg-grid opacity-50" />

      {/* Radial ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_90%,rgba(99,102,241,0.08),transparent)]" />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-cyan-400/30"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Scan line */}
      {scanLine && (
        <div
          className="absolute left-0 right-0 h-px pointer-events-none z-10"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.4), transparent)',
            animation: 'scan-line 6s linear infinite',
          }}
        />
      )}

      {/* Left decorative panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-96 h-auto mr-12 relative"
        style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease, transform 0.6s ease', transform: mounted ? 'translateX(0)' : 'translateX(-30px)' }}
      >
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/15 animate-pulse-glow">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="font-display font-black text-xl text-white tracking-tight">Crime Intelligence</div>
              <div className="text-[10px] font-mono-code text-cyan-500 uppercase tracking-[0.15em]">Criminal Network Analysis</div>
            </div>
          </div>

          <h2 className="font-display text-4xl font-black text-white leading-tight mb-4">
            Uncover Hidden<br />
            <span className="text-white/80">Connections</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            AI-powered intelligence platform for law enforcement. Map criminal networks, detect anomalous patterns, and resolve entities across multi-source data.
          </p>

          {/* Feature pills */}
          {[
            { icon: Globe, text: 'Graph Network Analysis', color: '#e5e7eb' },
            { icon: Zap, text: 'Real-time Anomaly Detection', color: '#d4d4d4' },
            { icon: Fingerprint, text: 'Entity Resolution Engine', color: '#f5f5f5' },
          ].map(({ icon: Icon, text, color }, i) => (
            <div
              key={text}
              className="flex items-center space-x-3 mb-3 p-3 glass rounded-xl"
              style={{ animationDelay: `${i * 100}ms`, opacity: mounted ? 1 : 0, transition: `all 0.5s ease ${i * 100 + 200}ms` }}
            >
              <div className="p-1.5 rounded-lg" style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-sm text-slate-300 font-medium">{text}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-dot-blink" />
          <span className="text-xs text-slate-500 font-mono-code">System Operational · All Services Running</span>
        </div>
      </div>

      {/* Login Card */}
      <div
        className="w-full max-w-md relative"
        style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s', transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}
      >
        {/* Card glow border */}
<div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

        <div className="relative glass-elevated rounded-2xl p-8 shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="lg:hidden flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg bg-white/5 border border-white/15">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display font-black text-base text-white">Crime Intelligence</div>
              <div className="text-[9px] font-mono-code text-cyan-500 uppercase tracking-wider">Criminal Network Analysis System</div>
            </div>
          </div>

          <div className="mb-7">
            <h3 className="font-display text-2xl font-bold text-white">Secure Access</h3>
            <p className="text-slate-500 text-xs mt-1">Enter your authorized credentials to proceed</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 animate-scale-in">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 animate-pulse" />
              <p className="text-xs text-rose-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="section-label mb-2 block">Officer ID / Username</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="input-nexus pl-11"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="section-label mb-2 block">Authentication Code</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input-nexus pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition-all duration-200 hover:brightness-110"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Access Intelligence System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo presets */}
          <div className="mt-7 pt-6 border-t border-white/[0.05]">
            <p className="section-label mb-3 text-center">Demo Quick-Access Presets</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.username}
                  id={`preset-${u.username}`}
                  onClick={() => { setUsername(u.username); setPassword(u.password); }}
                  className="group p-2.5 rounded-xl glass border transition-all duration-200 text-left hover:scale-[1.02] active:scale-100"
                  style={{
                    borderColor: username === u.username ? `${u.color}50` : 'rgba(255,255,255,0.05)',
                    background: username === u.username ? `${u.color}10` : undefined
                  }}
                >
                  <div className="font-display font-semibold text-xs" style={{ color: u.color }}>{u.label}</div>
                  <div className="text-[10px] text-slate-600 font-mono-code mt-0.5">{u.role}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-[10px] text-slate-700 mt-5 font-mono-code">
            Crime Intelligence v2.0 · Law Enforcement DSS · Authorized Access Only
          </p>
        </div>
      </div>
    </div>
  );
};

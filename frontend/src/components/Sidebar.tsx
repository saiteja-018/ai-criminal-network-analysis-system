import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert, LayoutDashboard, FolderGit2, Network,
  AlertTriangle, UploadCloud, GitCompare, Clock,
  ShieldCheck, BarChart3, LogOut
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Intelligence',
    items: [
      { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/investigations', label: 'Investigations', icon: FolderGit2 },
      { to: '/explorer', label: 'Network', icon: Network },
    ]
  },
  {
    label: 'Analysis',
    items: [
      { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
      { to: '/resolution', label: 'Entity Match', icon: GitCompare },
      { to: '/timeline', label: 'Timeline', icon: Clock },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    ]
  },
  {
    label: 'Data',
    items: [
      { to: '/ingestion', label: 'Ingestion', icon: UploadCloud },
      { to: '/audit', label: 'Audit', icon: ShieldCheck },
    ]
  },
];

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  return (
    <aside className="sidebar-shell w-72 flex shrink-0 flex-col overflow-hidden border-r border-white/5 bg-[#0b1220]/90 backdrop-blur-xl">
      <div className="flex h-20 items-center border-b border-white/5 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 shadow-[0_0_18px_rgba(255,255,255,0.08)]">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-[0.08em] text-slate-100">CRIME</h1>
            <p className="text-[9px] uppercase tracking-[0.24em] text-slate-500">INTELLIGENCE</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto px-4 py-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {section.label}
            </p>
            <div className="space-y-1.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={(item as any).end}
                    className={({ isActive }) =>
                      `nav-item flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'active-nav-item'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-200' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/5 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

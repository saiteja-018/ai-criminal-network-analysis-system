import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, X, ChevronDown } from 'lucide-react';
import { entitiesApi, alertsApi } from '../api/client';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    alertsApi.list().then((data: any[]) => {
      setAlertCount(data.filter((a) => a.status === 'NEW').length);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      const data = await entitiesApi.globalSearch(searchTerm);
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (!val.trim()) setSearchResults(null);
  };

  return (
    <header className="relative z-30 h-20 shrink-0 border-b border-white/5 bg-[#09131f]/80 px-6 backdrop-blur-xl sm:px-8">
      <div className="flex h-full items-center justify-between gap-6">
        <div className="flex-1" />

        <div ref={searchRef} className="relative flex w-full max-w-xl justify-center">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="global-search"
                type="text"
                placeholder="Search entities, cases, phones, accounts..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-[#111111] py-2.5 pl-11 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-white/30 focus:ring-2 focus:ring-white/10"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(''); setSearchResults(null); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isSearching && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-300" />
                </div>
              )}
            </div>
          </form>

          {searchResults && (
            <div className="absolute left-1/2 top-14 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0e1726] shadow-2xl shadow-slate-950/50">
              <div className="flex items-center justify-between border-b border-white/5 p-4">
                <span className="text-xs text-slate-400">
                  Results for "<span className="text-slate-200">{searchResults.query}</span>"
                </span>
                <button onClick={() => setSearchResults(null)} className="text-slate-500 hover:text-slate-200">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {searchResults.entities?.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Entities</p>
                    {searchResults.entities.map((e: any) => (
                      <button
                        key={e.id}
                        onClick={() => { navigate(`/entities/${e.id}`); setSearchResults(null); setSearchTerm(''); }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                      >
                        <span className="text-sm font-medium text-slate-200">{e.name}</span>
                        <span className="rounded-md border border-white/10 bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-400">{e.entity_type}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.investigations?.length > 0 && (
                  <div>
                    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Cases</p>
                    {searchResults.investigations.map((inv: any) => (
                      <button
                        key={inv.id}
                        onClick={() => { navigate(`/investigations/${inv.id}`); setSearchResults(null); setSearchTerm(''); }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                      >
                        <span className="text-sm font-medium text-slate-200">{inv.title}</span>
                        <span className="text-xs text-slate-500">{inv.case_number}</span>
                      </button>
                    ))}
                  </div>
                )}
                {(!searchResults.entities?.length && !searchResults.investigations?.length) && (
                  <p className="py-8 text-center text-sm text-slate-500">No matching records found.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <button
            onClick={() => navigate('/alerts')}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-[#0f1726] text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
          >
            <Bell className="h-4 w-4" />
            {alertCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-[#0b1220]">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </button>

          <div className="relative flex items-center gap-3 rounded-full border border-white/10 bg-[#111111] p-1.5 pr-4 shadow-[0_0_20px_rgba(255,255,255,0.04)]">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-white to-zinc-500 text-sm font-bold text-black">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex min-w-0 flex-col justify-center pr-2">
              <span className="truncate text-[13px] font-medium capitalize text-slate-100">{user?.username}</span>
              <span className="truncate text-[10px] uppercase tracking-[0.12em] text-slate-500">{user?.role}</span>
            </div>
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="text-slate-500 transition-colors hover:text-slate-200">
              <ChevronDown className="h-4 w-4" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-14 w-48 overflow-hidden rounded-2xl border border-white/10 bg-[#101d2a] p-2 shadow-2xl shadow-slate-950/60">
                <button onClick={() => navigate('/audit')} className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white">Audit Logs</button>
                <button className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-rose-300 transition-colors hover:bg-rose-500/10">Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

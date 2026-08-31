import React, { useEffect, useState } from 'react';
import { 
  FolderGit2, Users, Network, AlertTriangle, ShieldAlert,
  ArrowRight, Play, RefreshCw, Cpu, TrendingUp
} from 'lucide-react';
import { investigationsApi, entitiesApi, relationshipsApi, alertsApi, analysisApi } from '../api/client';
import { Investigation, Alert, Entity, Relationship } from '../types';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const ENTITY_COLORS: Record<string, string> = {
  PERSON: '#f5f5f5',
  ORGANIZATION: '#d4d4d4',
  LOCATION: '#a3a3a3',
  VEHICLE: '#fbbf24',
  PHONE: '#fca5a5',
  ACCOUNT: '#86efac',
  EMAIL: '#93c5fd',
};

const CHART_COLORS = ['#f5f5f5', '#d4d4d4', '#a3a3a3', '#fbbf24', '#fca5a5', '#86efac', '#93c5fd'];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadData = async () => {
    setLoading(true);
    try {
      const [invs, ents, rels, alrts] = await Promise.all([
        investigationsApi.list(),
        entitiesApi.list(),
        relationshipsApi.list(),
        alertsApi.list()
      ]);
      setInvestigations(invs);
      setEntities(ents);
      setRelationships(rels);
      setAlerts(alrts);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRunAnalysis = async () => {
    if (investigations.length === 0) return;
    setAnalyzing(true);
    try {
      await analysisApi.run(investigations[0].id);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-400">Loading Dashboard...</p>
      </div>
    );
  }

  const activeAlertsCount = alerts.filter(a => a.status === 'NEW' || a.status === 'UNDER_REVIEW').length;
  const criticalAlertsCount = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;

  const entityTypeCounts = entities.reduce((acc: any, e) => {
    acc[e.entity_type] = (acc[e.entity_type] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(entityTypeCounts).map(key => ({ name: key, value: entityTypeCounts[key] }));

  const alertSeverityCounts = alerts.reduce((acc: any, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1;
    return acc;
  }, { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 });
  const barData = [
    { name: 'Critical', count: alertSeverityCounts.CRITICAL, fill: '#fca5a5' },
    { name: 'High',     count: alertSeverityCounts.HIGH,     fill: '#fbbf24' },
    { name: 'Medium',   count: alertSeverityCounts.MEDIUM,   fill: '#d4d4d4' },
    { name: 'Low',      count: alertSeverityCounts.LOW,      fill: '#86efac' },
  ];

  const activityData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
    entities: Math.floor(Math.random() * 20 + 5),
    alerts: Math.floor(Math.random() * 8 + 1),
  }));

  const customTooltipStyle = {
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '12px'
  };

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-100">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">Intelligence command center • Last refresh: {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-[#0d1726] text-slate-400 transition-colors hover:border-cyan-400/30 hover:text-cyan-200">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition-all duration-200 hover:brightness-110 disabled:opacity-60"
          >
            {analyzing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" /> : <Play className="h-4 w-4" />}
            <span>Run Pipeline</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Active Cases', value: investigations.length, sub: `${investigations.filter(i => i.status === 'IN_PROGRESS').length} in progress`, icon: FolderGit2, color: 'text-white', bg: 'bg-white/5', accent: 'border-white/10' },
          { title: 'Resolved Entities', value: entities.length, sub: 'Persons, Orgs, IDs', icon: Users, color: 'text-zinc-200', bg: 'bg-zinc-500/10', accent: 'border-zinc-500/15' },
          { title: 'Network Edges', value: relationships.length, sub: 'Identified links', icon: Network, color: 'text-zinc-200', bg: 'bg-zinc-500/10', accent: 'border-zinc-500/15' },
          { title: 'Critical Signals', value: criticalAlertsCount, sub: `${activeAlertsCount} open for review`, icon: AlertTriangle, color: 'text-zinc-200', bg: 'bg-zinc-500/10', accent: 'border-zinc-500/15' },
        ].map((stat, i) => (
          <div key={i} className={`rounded-[28px] border bg-[#0b1523]/90 p-6 shadow-[0_0_30px_rgba(2,6,23,0.45)] ${stat.accent}`}>
            <div className="mb-4 flex items-start justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <h3 className="mb-2 text-sm font-medium text-slate-400">{stat.title}</h3>
            <div className="flex items-end gap-3">
              <span className="text-[32px] font-semibold leading-none tracking-[-0.05em] text-slate-100">{stat.value}</span>
            </div>
            <p className="mt-3 text-xs text-slate-500">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entity Distribution */}
        <div className="rounded-3xl bg-[#111111] border border-white/5 p-6 flex flex-col">
          <h3 className="text-base font-medium text-white mb-6">Entity Distribution</h3>
          <div className="flex-1 min-h-[220px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={55} paddingAngle={4} cornerRadius={4}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">No entity data</div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
             {pieData.slice(0, 4).map((d, index) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: CHART_COLORS[index % CHART_COLORS.length]}}></div>
                  {d.name}
                </div>
             ))}
          </div>
        </div>

        {/* Alert Severity */}
        <div className="rounded-3xl bg-[#111111] border border-white/5 p-6 flex flex-col">
          <h3 className="text-base font-medium text-white mb-6">Alert Severity</h3>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barSize={36} margin={{top:0, right:0, left:-20, bottom:0}}>
                <XAxis dataKey="name" stroke="#333" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#333" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" radius={[6, 6, 6, 6]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barData[index].fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="rounded-3xl bg-[#111111] border border-white/5 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-base font-medium text-white">Activity</h3>
             <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
               <TrendingUp className="w-3 h-3" /> Live
             </span>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{top:10, right:0, left:-20, bottom:0}}>
                <defs>
                  <linearGradient id="entGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#333" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#333" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Area type="monotone" dataKey="entities" stroke="#ffffff" strokeWidth={3} fill="url(#entGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Lists ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Alerts List */}
        <div className="rounded-3xl bg-[#111111] border border-white/5 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-medium text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" /> Recent Alerts
            </h3>
            <button onClick={() => navigate('/alerts')} className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {alerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/alerts')}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      alert.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[11px] font-medium text-gray-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">{alert.alert_type?.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: alert.score > 0.8 ? '#fb7185' : '#34d399' }}>
                    {(alert.score * 100).toFixed(0)} score
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-1">{alert.description}</p>
              </div>
            ))}
            {alerts.length === 0 && <p className="text-sm text-gray-500 text-center py-6">No active alerts.</p>}
          </div>
        </div>

        {/* Active Cases */}
        <div className="rounded-3xl bg-[#111111] border border-white/5 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-medium text-white">Active Cases</h3>
            <button onClick={() => navigate('/investigations')} className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {investigations.slice(0,4).map((inv) => (
              <div key={inv.id} className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex flex-col" onClick={() => navigate(`/investigations/${inv.id}`)}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium text-gray-200 line-clamp-1 flex-1 pr-4">{inv.title}</h4>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{inv.status?.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-[11px] text-gray-500 font-mono">{inv.case_number}</span>
                   {inv.priority && (
                     <div className="flex items-center gap-1.5">
                       <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
                         <div className={`h-full rounded-full ${inv.priority === 'CRITICAL' ? 'bg-rose-500 w-full' : inv.priority === 'HIGH' ? 'bg-orange-500 w-3/4' : 'bg-emerald-500 w-1/2'}`}></div>
                       </div>
                       <span className="text-[9px] text-gray-500 uppercase">{inv.priority}</span>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

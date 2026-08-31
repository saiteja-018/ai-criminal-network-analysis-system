import React, { useEffect, useState } from 'react';
import { analysisApi, investigationsApi } from '../api/client';
import { BarChart3, Users, Network, Activity } from 'lucide-react';
import { EntityBadge } from '../components/EntityBadge';

export const SystemAnalyticsPage: React.FC = () => {
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [selectedInvId, setSelectedInvId] = useState<number | undefined>();
  const [centralityData, setCentralityData] = useState<any[]>([]);
  const [communityData, setCommunityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    investigationsApi.list().then(invs => {
      setInvestigations(invs);
      if (invs.length > 0) setSelectedInvId(invs[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedInvId) return;
    setLoading(true);
    Promise.all([
      analysisApi.getCentrality(selectedInvId),
      analysisApi.getCommunities(selectedInvId)
    ]).then(([cent, comm]) => {
      setCentralityData(cent.results || []);
      setCommunityData(comm.communities || []);
      setLoading(false);
    });
  }, [selectedInvId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>GRAPH NETWORK ANALYTICS</span>
          </h1>
          <p className="text-xs text-slate-400">Algorithmic centrality metrics (Degree, Betweenness, PageRank) & Louvain modularity community clusters.</p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Select Case:</span>
          <select
            value={selectedInvId || ''}
            onChange={(e) => setSelectedInvId(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500 focus:outline-none"
          >
            {investigations.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.case_number} - {inv.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Centrality Ranking */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Highest Centrality Entities</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {centralityData.slice(0, 8).map((c) => (
              <div key={c.entity_id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-100 font-sans text-sm">{c.name}</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <EntityBadge type={c.entity_type} />
                    <span className="text-[10px] text-slate-500">Comm ID: #{c.community}</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-cyan-400 font-bold">Deg: {c.degree_centrality.toFixed(3)}</div>
                  <div className="text-amber-400 text-[10px]">Between: {c.betweenness_centrality.toFixed(3)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Communities */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Detected Community Clusters</span>
          </h3>

          <div className="space-y-4">
            {communityData.map((comm) => (
              <div key={comm.community_id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-indigo-400 font-mono">Community Cluster #{comm.community_id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono">
                    {comm.members_count} Members
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {comm.entities.map((m: any) => (
                    <span key={m.id} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-200 font-medium">
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

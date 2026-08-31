import React, { useEffect, useState } from 'react';
import { entitiesApi } from '../api/client';
import { GitCompare, Check, X, ShieldAlert } from 'lucide-react';
import { EntityBadge } from '../components/EntityBadge';

export const EntityResolutionPage: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await entitiesApi.listMergeCandidates();
      setCandidates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await entitiesApi.approveMerge(id);
      loadCandidates();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await entitiesApi.rejectMerge(id);
      loadCandidates();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <GitCompare className="w-5 h-5 text-cyan-400" />
          <span>ENTITY RESOLUTION & DEDUPLICATION</span>
        </h1>
        <p className="text-xs text-slate-400">Review fuzzy-matched duplicate candidate entities across multi-source intelligence feeds.</p>
      </div>

      <div className="space-y-4">
        {candidates.map((c) => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <EntityBadge type={c.source_entity_detail.entity_type} />
                <h4 className="font-bold text-sm text-slate-100 mt-1">{c.source_entity_detail.name}</h4>
                <p className="text-[10px] text-slate-500 font-mono">Source: {c.source_entity_detail.source}</p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <EntityBadge type={c.target_entity_detail.entity_type} />
                <h4 className="font-bold text-sm text-slate-100 mt-1">{c.target_entity_detail.name}</h4>
                <p className="text-[10px] text-slate-500 font-mono">Source: {c.target_entity_detail.source}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right font-mono">
                <div className="text-xs text-slate-400">Match Confidence</div>
                <div className="text-lg font-bold text-cyan-400">{(c.match_score * 100).toFixed(0)}%</div>
                <div className="text-[10px] text-slate-500">{c.match_reason}</div>
              </div>

              {c.status === 'PENDING' ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(c.id)}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition flex items-center space-x-1 text-xs font-semibold"
                  >
                    <Check className="w-4 h-4" />
                    <span>Merge</span>
                  </button>
                  <button
                    onClick={() => handleReject(c.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition flex items-center space-x-1 text-xs font-semibold"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              ) : (
                <span className="px-3 py-1 bg-slate-950 text-slate-400 border border-slate-800 rounded text-xs font-mono">
                  {c.status}
                </span>
              )}
            </div>
          </div>
        ))}

        {candidates.length === 0 && !loading && (
          <p className="text-xs text-slate-500 italic p-6 text-center bg-slate-900 border border-slate-800 rounded-xl">
            No pending duplicate merge candidates found.
          </p>
        )}
      </div>
    </div>
  );
};

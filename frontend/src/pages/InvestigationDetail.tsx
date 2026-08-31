import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { investigationsApi, entitiesApi, relationshipsApi, alertsApi } from '../api/client';
import { Investigation, Entity, Relationship, Alert } from '../types';
import { EntityBadge } from '../components/EntityBadge';
import { AlertBadge } from '../components/AlertBadge';
import { Network, Users, AlertTriangle, FileText, ArrowLeft, ExternalLink } from 'lucide-react';

export const InvestigationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invId = Number(id);

  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'entities' | 'relationships' | 'alerts'>('entities');

  useEffect(() => {
    if (!invId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [inv, ents, rels, alrts] = await Promise.all([
          investigationsApi.get(invId),
          entitiesApi.list(invId),
          relationshipsApi.list(invId),
          alertsApi.list(invId)
        ]);
        setInvestigation(inv);
        setEntities(ents);
        setRelationships(rels);
        setAlerts(alrts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [invId]);

  if (loading || !investigation) {
    return <div className="text-slate-400 font-mono text-xs">Loading case file...</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/investigations')}
        className="flex items-center space-x-2 text-xs text-slate-400 hover:text-cyan-400 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Case Management</span>
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              {investigation.case_number}
            </span>
            <span className="text-xs font-bold text-amber-400 uppercase font-mono">{investigation.priority} PRIORITY</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">{investigation.title}</h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">{investigation.description}</p>
        </div>

        <button
          onClick={() => navigate(`/explorer?investigation=${invId}`)}
          className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-2 transition shadow-lg shadow-cyan-500/20"
        >
          <Network className="w-4 h-4" />
          <span>LAUNCH GRAPH EXPLORER</span>
        </button>
      </div>

      {/* Tabs Header */}
      <div className="flex space-x-4 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('entities')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
            activeTab === 'entities' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Entities ({entities.length})
        </button>
        <button
          onClick={() => setActiveTab('relationships')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
            activeTab === 'relationships' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Relationships ({relationships.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
            activeTab === 'alerts' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Alerts ({alerts.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'entities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entities.map((e) => (
            <div
              key={e.id}
              onClick={() => navigate(`/entities/${e.id}`)}
              className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-xl cursor-pointer transition flex justify-between items-start"
            >
              <div>
                <EntityBadge type={e.entity_type} />
                <h4 className="font-bold text-sm text-slate-100 mt-2">{e.name}</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Source: {e.source}</p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {((e.confidence || 0.95) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'relationships' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Source Entity</th>
                <th className="p-3">Relationship Type</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {relationships.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40">
                  <td className="p-3 text-cyan-400 font-semibold">{r.source_entity_detail?.name || `ID:${r.source_entity}`}</td>
                  <td className="p-3 font-bold text-slate-200">{r.relationship_type}</td>
                  <td className="p-3 text-cyan-400 font-semibold">{r.target_entity_detail?.name || `ID:${r.target_entity}`}</td>
                  <td className="p-3 text-slate-400 italic font-sans">{r.evidence || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <AlertBadge severity={a.severity} />
                  <span className="font-mono text-xs font-bold text-cyan-400">{a.alert_type}</span>
                </div>
                <p className="text-xs text-slate-200 font-medium">{a.description}</p>
              </div>
              <span className="font-mono text-xs text-amber-400 font-bold">Score: {(a.score * 100).toFixed(0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

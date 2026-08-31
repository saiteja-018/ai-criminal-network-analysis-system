import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { entitiesApi } from '../api/client';
import { Entity } from '../types';
import { EntityBadge } from '../components/EntityBadge';
import { User, Network, Clock, ArrowLeft, ShieldCheck, FileText, Activity } from 'lucide-react';

export const EntityProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const entityId = Number(id);

  const [entity, setEntity] = useState<Entity | null>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId) return;
    const load = async () => {
      setLoading(true);
      try {
        const entData = await entitiesApi.get(entityId);
        const timeData = await entitiesApi.getTimeline(entityId);
        setEntity(entData);
        setTimeline(timeData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [entityId]);

  if (loading || !entity) {
    return <div className="text-slate-400 font-mono text-xs">Loading entity profile...</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-xs text-slate-400 hover:text-cyan-400 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Previous View</span>
      </button>

      {/* Entity Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex justify-between items-start">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <EntityBadge type={entity.entity_type} />
            <span className="font-mono text-xs text-slate-500">ID: #{entity.id}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">{entity.name}</h1>
          <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
            <span>Confidence: <strong className="text-emerald-400">{((entity.confidence || 0.95) * 100).toFixed(0)}%</strong></span>
            <span>Source: <strong className="text-cyan-400">{entity.source}</strong></span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/explorer?investigation=${entity.investigation}`)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-2 transition shadow-lg shadow-cyan-500/20"
          >
            <Network className="w-4 h-4" />
            <span>VIEW IN GRAPH MAP</span>
          </button>
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Metadata & Identifiers</span>
          </h3>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Normalized Key:</span>
              <span className="text-slate-200">{entity.normalized_name}</span>
            </div>
            {entity.external_reference && (
              <div className="flex justify-between">
                <span className="text-slate-500">Ext Ref:</span>
                <span className="text-cyan-400">{entity.external_reference}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">First Ingested:</span>
              <span className="text-slate-400">{new Date(entity.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Timeline Events for Entity */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Chronological Intelligence Activity</span>
          </h3>

          {timeline && timeline.events && timeline.events.length > 0 ? (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {timeline.events.map((ev: any) => (
                <div key={ev.id} className="relative group">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-slate-900 shadow-sm" />
                  <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200">{ev.title}</span>
                      <span className="font-mono text-[10px] text-slate-500">{new Date(ev.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Type: <span className="text-cyan-400">{ev.event_type}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No historical communication or transaction events logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

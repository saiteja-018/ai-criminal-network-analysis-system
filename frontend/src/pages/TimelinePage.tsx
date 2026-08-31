import React, { useEffect, useState } from 'react';
import { entitiesApi } from '../api/client';
import { Entity } from '../types';
import { Clock, Search, Activity, FileText } from 'lucide-react';
import { EntityBadge } from '../components/EntityBadge';

export const TimelinePage: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<number | undefined>();
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    entitiesApi.list().then(ents => {
      setEntities(ents);
      if (ents.length > 0) setSelectedEntityId(ents[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedEntityId) return;
    setLoading(true);
    entitiesApi.getTimeline(selectedEntityId).then(data => {
      setTimeline(data);
      setLoading(false);
    });
  }, [selectedEntityId]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span>CHRONOLOGICAL TIMELINE RECONSTRUCTION</span>
          </h1>
          <p className="text-xs text-slate-400">Reconstruct multi-channel communications, transfers, and location movements for a suspect.</p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Select Entity:</span>
          <select
            value={selectedEntityId || ''}
            onChange={(e) => setSelectedEntityId(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500 focus:outline-none"
          >
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.entity_type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-xs font-mono text-cyan-400">LOADING TIMELINE EVENTS...</div>
      ) : timeline && timeline.events && timeline.events.length > 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative pl-8 space-y-8 before:absolute before:left-6 before:top-6 before:bottom-6 before:w-0.5 before:bg-slate-800">
          {timeline.events.map((ev: any) => (
            <div key={ev.id} className="relative group">
              <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-cyan-400 border-4 border-slate-900 shadow-md" />
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-100">{ev.title}</span>
                  <span className="font-mono text-xs text-slate-500">{new Date(ev.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                    {ev.event_type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-slate-500 italic">
          No recorded events or transactions found for this entity.
        </div>
      )}
    </div>
  );
};

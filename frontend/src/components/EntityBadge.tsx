import React from 'react';
import { EntityType } from '../types';

interface EntityBadgeProps {
  type: EntityType;
}

export const EntityBadge: React.FC<EntityBadgeProps> = ({ type }) => {
  const typeColors: Record<string, string> = {
    PERSON: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    ORGANIZATION: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    LOCATION: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    VEHICLE: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    PHONE: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    EMAIL: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    ACCOUNT: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    CASE: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    EVENT: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  };

  const style = typeColors[type] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider ${style}`}>
      {type}
    </span>
  );
};

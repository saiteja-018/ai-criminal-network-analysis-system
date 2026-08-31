import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Filter, Eye } from 'lucide-react';
import { EntityType } from '../types';

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onReset: () => void;
  selectedEntityTypes: EntityType[];
  onToggleEntityType: (type: EntityType) => void;
}

const ALL_TYPES: EntityType[] = [
  'PERSON', 'ORGANIZATION', 'LOCATION', 'VEHICLE', 'PHONE', 'ACCOUNT', 'EMAIL', 'EVENT'
];

export const GraphControls: React.FC<GraphControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFit,
  onReset,
  selectedEntityTypes,
  onToggleEntityType
}) => {
  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col space-y-2">
      <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-1.5 flex space-x-1 shadow-lg">
        <button
          onClick={onZoomIn}
          className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={onFit}
          className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
          title="Fit Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={onReset}
          className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
          title="Reset Layout"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Type Filter Pills */}
      <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2 shadow-lg max-w-xs">
        <div className="flex items-center space-x-1 mb-1.5 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
          <Filter className="w-3 h-3 text-cyan-400" />
          <span>Entity Filters</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {ALL_TYPES.map((type) => {
            const isSelected = selectedEntityTypes.length === 0 || selectedEntityTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => onToggleEntityType(type)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                    : 'bg-slate-950 text-slate-500 border-slate-800 opacity-60'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

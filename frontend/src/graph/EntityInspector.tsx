import React from 'react';
import { X, ExternalLink, Activity, Network, FileText, AlertTriangle } from 'lucide-react';
import { EntityBadge } from '../components/EntityBadge';
import { useNavigate } from 'react-router-dom';

interface EntityInspectorProps {
  selectedNode: any | null;
  selectedEdge: any | null;
  onClose: () => void;
  onExpandNeighbors?: (entityId: number) => void;
}

export const EntityInspector: React.FC<EntityInspectorProps> = ({
  selectedNode,
  selectedEdge,
  onClose,
  onExpandNeighbors
}) => {
  const navigate = useNavigate();

  if (!selectedNode && !selectedEdge) return null;

  return (
    <div className="absolute top-4 right-4 bottom-4 w-96 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl shadow-2xl p-5 z-20 flex flex-col justify-between overflow-y-auto">
      <div>
        <div className="flex justify-between items-start pb-3 border-b border-slate-800">
          <div>
            <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest">
              {selectedNode ? 'Entity Inspector' : 'Relationship Evidence'}
            </p>
            <h3 className="font-bold text-lg text-slate-100 mt-0.5">
              {selectedNode ? selectedNode.label : selectedEdge.label}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {selectedNode && (
          <div className="mt-4 space-y-4 text-xs">
            <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-medium">Entity Classification</span>
              <EntityBadge type={selectedNode.type} />
            </div>

            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Entity ID:</span>
                <span className="text-slate-200">{selectedNode.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Confidence Score:</span>
                <span className="text-emerald-400 font-semibold">{((selectedNode.confidence || 0.95) * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Network Degree:</span>
                <span className="text-cyan-400">{selectedNode.degree ? selectedNode.degree.toFixed(3) : 'N/A'}</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => navigate(`/entities/${selectedNode.id}`)}
                className="flex-1 py-2 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg flex items-center justify-center space-x-2 font-semibold transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Full Profile</span>
              </button>
              {onExpandNeighbors && (
                <button
                  onClick={() => onExpandNeighbors(Number(selectedNode.id))}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center justify-center space-x-2 font-semibold transition"
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Expand Radius</span>
                </button>
              )}
            </div>
          </div>
        )}

        {selectedEdge && (
          <div className="mt-4 space-y-4 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Relationship Type:</span>
                <span className="text-cyan-400 font-bold">{selectedEdge.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Source Entity ID:</span>
                <span className="text-slate-200">{selectedEdge.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Entity ID:</span>
                <span className="text-slate-200">{selectedEdge.target}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center space-x-1">
                <FileText className="w-3 h-3 text-cyan-400" />
                <span>Supporting Evidence</span>
              </p>
              <p className="text-slate-300 italic text-xs leading-relaxed">
                "{selectedEdge.evidence || 'Intercepted call detail record / surveillance log entry.'}"
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 flex items-center space-x-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>Analytical lead only. Verification against official agency records mandatory.</span>
      </div>
    </div>
  );
};

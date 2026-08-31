import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { entitiesApi, investigationsApi } from '../api/client';
import { CytoscapeGraph } from '../graph/CytoscapeGraph';
import { GraphControls } from '../graph/GraphControls';
import { EntityInspector } from '../graph/EntityInspector';
import { GraphData, EntityType, Investigation } from '../types';
import { Network, Search, Layers, RefreshCw, Activity } from 'lucide-react';
import cytoscape from 'cytoscape';

export const NetworkExplorer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialInvId = searchParams.get('investigation');

  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selectedInvId, setSelectedInvId] = useState<number | undefined>(
    initialInvId ? Number(initialInvId) : undefined
  );

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [depth, setDepth] = useState(2);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<any | null>(null);
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<EntityType[]>([]);
  const [searchNodeQuery, setSearchNodeQuery] = useState('');

  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    investigationsApi.list().then(invs => {
      setInvestigations(invs);
      if (!selectedInvId && invs.length > 0) {
        setSelectedInvId(invs[0].id);
      }
    });
  }, []);

  const loadGraph = async () => {
    if (!selectedInvId) return;
    setLoading(true);
    try {
      // Find first entity in investigation or fetch network
      const ents = await entitiesApi.list(selectedInvId);
      if (ents.length > 0) {
        const data = await entitiesApi.getNetwork(ents[0].id, depth);
        setGraphData(data);
      } else {
        setGraphData({ nodes: [], edges: [] });
      }
    } catch (err) {
      console.error('Failed to load network graph:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, [selectedInvId, depth]);

  const handleToggleEntityType = (type: EntityType) => {
    if (selectedEntityTypes.includes(type)) {
      setSelectedEntityTypes(selectedEntityTypes.filter(t => t !== type));
    } else {
      setSelectedEntityTypes([...selectedEntityTypes, type]);
    }
  };

  const handleExpandNeighbors = async (entityId: number) => {
    try {
      const data = await entitiesApi.getNetwork(entityId, depth + 1);
      setGraphData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cyRef.current || !searchNodeQuery.trim()) return;
    const query = searchNodeQuery.toLowerCase();
    const found = cyRef.current.nodes().filter((n) => n.data('label').toLowerCase().includes(query));
    if (found.length > 0) {
      cyRef.current.animate({
        center: { eles: found },
        zoom: 1.5
      });
      found.select();
      setSelectedNode(found[0].data());
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      {/* Explorer Header */}
      <div className="flex flex-wrap items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <Network className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 uppercase tracking-wider">GRAPH EXPLORER WORKSPACE</h1>
            <p className="text-[11px] text-slate-400">Interactive Cytoscape topology canvas & multi-hop Link Analysis.</p>
          </div>
        </div>

        {/* Case selector & depth control */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearchNode} className="relative w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find node on map..."
              value={searchNodeQuery}
              onChange={(e) => setSearchNodeQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </form>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Case File:</span>
            <select
              value={selectedInvId || ''}
              onChange={(e) => setSelectedInvId(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 font-medium focus:border-cyan-500 focus:outline-none"
            >
              {investigations.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.case_number} - {inv.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Hop Radius:</span>
            <select
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-cyan-400 rounded-lg px-2 py-1.5 font-mono font-bold focus:border-cyan-500 focus:outline-none"
            >
              <option value={1}>1-Hop</option>
              <option value={2}>2-Hops</option>
              <option value={3}>3-Hops</option>
            </select>
          </div>

          <button
            onClick={loadGraph}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
            title="Reload Network"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas View */}
      <div className="flex-1 relative min-h-0 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs font-mono text-cyan-400 space-x-2">
            <Activity className="w-4 h-4 animate-spin" />
            <span>SYNCHRONIZING GRAPH TOPOLOGY...</span>
          </div>
        ) : graphData && graphData.nodes.length > 0 ? (
          <>
            <CytoscapeGraph
              data={graphData}
              selectedEntityTypes={selectedEntityTypes}
              onNodeSelect={(nodeId, data) => {
                setSelectedNode(data);
                setSelectedEdge(null);
              }}
              onEdgeSelect={(edgeId, data) => {
                setSelectedEdge(data);
                setSelectedNode(null);
              }}
              cyRef={cyRef}
            />

            <GraphControls
              onZoomIn={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)}
              onZoomOut={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)}
              onFit={() => cyRef.current?.fit()}
              onReset={() => cyRef.current?.layout({ name: 'cose', animate: true }).run()}
              selectedEntityTypes={selectedEntityTypes}
              onToggleEntityType={handleToggleEntityType}
            />

            <EntityInspector
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              onClose={() => {
                setSelectedNode(null);
                setSelectedEdge(null);
              }}
              onExpandNeighbors={handleExpandNeighbors}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
            <Layers className="w-8 h-8 mb-2 text-slate-700" />
            <span>No network nodes found for this case. Try importing data.</span>
          </div>
        )}
      </div>
    </div>
  );
};

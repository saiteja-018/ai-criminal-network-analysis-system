import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { GraphData, EntityType } from '../types';

try {
  cytoscape.use(dagre);
} catch (e) {
  // Ignore if already registered
}

interface CytoscapeGraphProps {
  data: GraphData;
  onNodeSelect?: (nodeId: string, nodeData: any) => void;
  onEdgeSelect?: (edgeId: string, edgeData: any) => void;
  selectedEntityTypes?: EntityType[];
  cyRef?: React.MutableRefObject<cytoscape.Core | null>;
}

const TYPE_COLORS: Record<string, string> = {
  PERSON: '#06b6d4',       // cyan
  ORGANIZATION: '#f59e0b', // amber
  LOCATION: '#10b981',     // emerald
  VEHICLE: '#a855f7',      // purple
  PHONE: '#3b82f6',        // blue
  EMAIL: '#6366f1',        // indigo
  ACCOUNT: '#e11d48',      // rose
  CASE: '#14b8a6',         // teal
  EVENT: '#f97316',        // orange
  DEFAULT: '#64748b'       // slate
};

export const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({
  data,
  onNodeSelect,
  onEdgeSelect,
  selectedEntityTypes,
  cyRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalCyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Filter nodes by selected entity types if provided
    const filteredNodes = selectedEntityTypes && selectedEntityTypes.length > 0
      ? data.nodes.filter(n => selectedEntityTypes.includes(n.type))
      : data.nodes;

    const allowedNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = data.edges.filter(e => allowedNodeIds.has(e.source) && allowedNodeIds.has(e.target));

    const elements = [
      ...filteredNodes.map(n => ({
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          color: TYPE_COLORS[n.type] || TYPE_COLORS.DEFAULT,
          degree: n.degree_centrality || 0.1,
          isCenter: n.is_center ? 'true' : 'false'
        }
      })),
      ...filteredEdges.map(e => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          confidence: e.confidence
        }
      }))
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'color': '#f8fafc',
            'font-size': '11px',
            'font-weight': '600',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'width': 'mapData(degree, 0, 1, 30, 60)',
            'height': 'mapData(degree, 0, 1, 30, 60)',
            'border-width': 2,
            'border-color': '#1e293b',
            'transition-property': 'background-color, border-color, border-width',
            'transition-duration': 0.2
          }
        },
        {
          selector: 'node[isCenter = "true"]',
          style: {
            'border-width': 4,
            'border-color': '#22d3ee',
            'shadow-blur': 15,
            'shadow-color': '#22d3ee'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#ffffff',
            'background-color': '#38bdf8'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#334155',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'color': '#94a3b8',
            'font-size': '9px',
            'text-rotation': 'autorotate',
            'text-margin-y': -8
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 3,
            'line-color': '#38bdf8',
            'target-arrow-color': '#38bdf8',
            'color': '#38bdf8'
          }
        }
      ],
      layout: {
        name: 'cose',
        animate: false,
        padding: 50
      }
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      if (onNodeSelect) {
        onNodeSelect(node.id(), node.data());
      }
    });

    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      if (onEdgeSelect) {
        onEdgeSelect(edge.id(), edge.data());
      }
    });

    internalCyRef.current = cy;
    if (cyRef) {
      cyRef.current = cy;
    }

    return () => {
      cy.destroy();
    };
  }, [data, selectedEntityTypes]);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-950/80 rounded-xl relative overflow-hidden" />
  );
};

import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import { DataNode } from './DataNode';
import { CloudProvider, PipelineTemplate, NodeRole } from '../../types';
import {
  Sparkles,
  RefreshCw,
  Zap,
  Target,
  Lightbulb,
  Ban,
  Layers,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Map,
  ArrowDown,
} from 'lucide-react';

const nodeTypes = {
  dataNode: DataNode,
};

interface PipelineCanvasProps {
  currentCloud: CloudProvider;
  currentTemplate: PipelineTemplate;
  onSelectTemplate: (templateId: string) => void;
  templates: PipelineTemplate[];
  selectedRole: NodeRole;
  onSelectRole: (role: NodeRole) => void;
  highlightStatus?: {
    status: 'optimal' | 'error' | 'warning' | 'neutral';
    affectedNodes: string[];
    statusMsg?: string;
  };
  onReset: () => void;
}

export const PipelineCanvas: React.FC<PipelineCanvasProps> = ({
  currentCloud,
  currentTemplate,
  onSelectTemplate,
  templates,
  selectedRole,
  onSelectRole,
  highlightStatus,
  onReset,
}) => {
  const [mobileViewMode, setMobileViewMode] = useState<'canvas' | 'stepper'>('stepper');
  const [isStoryExpanded, setIsStoryExpanded] = useState<boolean>(false);

  const cloudData = currentTemplate.clouds[currentCloud];

  // Ordered roles for the pipeline
  const pipelineRoles: NodeRole[] = ['ingestion', 'compute', 'storage', 'warehouse'];

  // Generate React Flow nodes dynamically based on current template & cloud with spacing for 360px cards
  const nodes: Node[] = useMemo(() => {
    const rolesWithPositions: { role: NodeRole; x: number; y: number }[] = [
      { role: 'ingestion', x: 40, y: 120 },
      { role: 'compute', x: 460, y: 120 },
      { role: 'storage', x: 880, y: 120 },
      { role: 'warehouse', x: 1300, y: 120 },
    ];

    return rolesWithPositions.map(({ role, x, y }) => {
      const nodeSpec = cloudData.nodes[role];
      const isAffected = highlightStatus?.affectedNodes.includes(role);

      let status: 'optimal' | 'error' | 'warning' | 'neutral' = 'neutral';
      if (isAffected && highlightStatus) {
        status = highlightStatus.status;
      }

      return {
        id: role,
        type: 'dataNode',
        position: { x, y },
        data: {
          id: role,
          label: nodeSpec?.serviceName || role,
          role,
          provider: currentCloud,
          serviceName: nodeSpec?.serviceName || 'Service',
          subText: nodeSpec?.subText || '',
          icon: nodeSpec?.icon || '⚙️',
          latency: nodeSpec?.latency || 'N/A',
          throughput: nodeSpec?.throughput,
          purpose: nodeSpec?.purpose,
          whySelected: nodeSpec?.whySelected,
          whyAlternativeFailed: nodeSpec?.whyAlternativeFailed,
          costHint: nodeSpec?.costHint,
          protocol: nodeSpec?.protocol,
          status,
          statusMsg: highlightStatus?.statusMsg,
          onSelect: () => onSelectRole(role),
        },
      };
    });
  }, [currentCloud, currentTemplate, highlightStatus, onSelectRole]);

  // Generate connecting animated edges with informative labels
  const edges: Edge[] = useMemo(() => {
    const edgeColor =
      currentCloud === 'aws'
        ? '#f59e0b'
        : currentCloud === 'gcp'
        ? '#3b82f6'
        : currentCloud === 'azure'
        ? '#06b6d4'
        : '#10b981';

    const edgeLabels = currentTemplate.edgeLabels || [
      'Protokol & Akış',
      'Micro-batch / Dönüşüm',
      'ACID Depolama',
    ];

    return [
      {
        id: 'e-ingest-compute',
        source: 'ingestion',
        target: 'compute',
        animated: true,
        label: edgeLabels[0],
        style: { stroke: edgeColor, strokeWidth: 2.5 },
        labelStyle: { fill: '#cbd5e1', fontWeight: 700, fontSize: 11 },
        labelBgStyle: { fill: '#090d16', stroke: '#1e293b', strokeWidth: 1.5, rx: 6, ry: 6 },
        labelBgPadding: [8, 4] as [number, number],
        markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
      },
      {
        id: 'e-compute-storage',
        source: 'compute',
        target: 'storage',
        animated: true,
        label: edgeLabels[1],
        style: { stroke: edgeColor, strokeWidth: 2.5 },
        labelStyle: { fill: '#cbd5e1', fontWeight: 700, fontSize: 11 },
        labelBgStyle: { fill: '#090d16', stroke: '#1e293b', strokeWidth: 1.5, rx: 6, ry: 6 },
        labelBgPadding: [8, 4] as [number, number],
        markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
      },
      {
        id: 'e-storage-warehouse',
        source: 'storage',
        target: 'warehouse',
        animated: true,
        label: edgeLabels[2],
        style: { stroke: edgeColor, strokeWidth: 2.5 },
        labelStyle: { fill: '#cbd5e1', fontWeight: 700, fontSize: 11 },
        labelBgStyle: { fill: '#090d16', stroke: '#1e293b', strokeWidth: 1.5, rx: 6, ry: 6 },
        labelBgPadding: [8, 4] as [number, number],
        markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
      },
    ];
  }, [currentCloud, currentTemplate]);

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
      
      {/* Top Controls Bar */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-3 sm:px-5 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 z-10">
        
        {/* Template Selector */}
        <div className="flex items-center gap-2 max-w-full">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 shrink-0">Şablon:</span>
          <select
            value={currentTemplate.id}
            onChange={(e) => onSelectTemplate(e.target.value)}
            className="text-[11px] sm:text-xs bg-slate-950 border border-slate-750 text-slate-100 rounded-xl px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm truncate max-w-[200px] sm:max-w-none"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* View Switcher (Mobile) + Actions */}
        <div className="flex items-center gap-2 text-xs">
          {/* Mobile Mode Switcher (Visible on mobile/tablet) */}
          <div className="flex md:hidden items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
            <button
              onClick={() => setMobileViewMode('stepper')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-all ${
                mobileViewMode === 'stepper'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              Liste
            </button>
            <button
              onClick={() => setMobileViewMode('canvas')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-all ${
                mobileViewMode === 'canvas'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3 h-3" />
              Tuval
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-[11px] sm:text-xs">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Tahmini: <b className="text-emerald-400 font-bold">${cloudData.baseCost}/ay</b></span>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg border border-slate-750 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-[11px] sm:text-xs"
            title="Tuvali Sıfırla"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Sıfırla</span>
          </button>
        </div>
      </div>

      {/* Self-Explanatory Architectural Story Banner */}
      <div className="bg-slate-950/95 border-b border-slate-800/80 px-3 sm:px-5 py-2.5 sm:py-3 z-10">
        
        {/* Mobile Accordion Header */}
        <div
          onClick={() => setIsStoryExpanded(!isStoryExpanded)}
          className="flex md:hidden items-center justify-between cursor-pointer py-0.5 text-xs font-semibold text-slate-300"
        >
          <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
            <Target className="w-3.5 h-3.5" />
            <span>Mimari Hedef & Çözüm Özeti</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>{isStoryExpanded ? 'Daralt' : 'Genişlet'}</span>
            {isStoryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Story Grid (Always visible on desktop, collapsible on mobile) */}
        <div className={`${isStoryExpanded ? 'grid' : 'hidden md:grid'} grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs mt-2 md:mt-0`}>
          
          {/* Ne Yapılıyor? */}
          <div className="p-2.5 rounded-xl bg-blue-950/20 border border-blue-900/40">
            <div className="flex items-center gap-1.5 font-bold text-blue-400 uppercase tracking-wider text-[10px] mb-1">
              <Target className="w-3.5 h-3.5 shrink-0" />
              <span>1. Hedef (Ne Yapılıyor?)</span>
            </div>
            <p className="text-slate-200 leading-snug font-medium text-[11px] sm:text-xs">
              {currentTemplate.flowGoal}
            </p>
          </div>

          {/* Ne İçin Yapılıyor? */}
          <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-900/40">
            <div className="flex items-center gap-1.5 font-bold text-indigo-400 uppercase tracking-wider text-[10px] mb-1">
              <Lightbulb className="w-3.5 h-3.5 shrink-0" />
              <span>2. Gerekçe (Ne İçin Yapılıyor?)</span>
            </div>
            <p className="text-slate-200 leading-snug font-medium text-[11px] sm:text-xs">
              {currentTemplate.flowMotivation}
            </p>
          </div>

          {/* Çözüm Stratejisi */}
          <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400 uppercase tracking-wider text-[10px] mb-1">
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>3. Çözüm (Nasıl Çözüldü?)</span>
            </div>
            <p className="text-emerald-200 leading-snug font-medium text-[11px] sm:text-xs">
              {currentTemplate.flowSolution}
            </p>
          </div>

          {/* Elenen Yanlışlar */}
          <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-900/40">
            <div className="flex items-center gap-1.5 font-bold text-red-400 uppercase tracking-wider text-[10px] mb-1">
              <Ban className="w-3.5 h-3.5 shrink-0" />
              <span>4. Elenen Yanlışlar (Anti-Patterns)</span>
            </div>
            <p className="text-red-200 leading-snug font-medium text-[11px] sm:text-xs">
              {currentTemplate.flowAntiPatterns}
            </p>
          </div>

        </div>
      </div>

      {/* Main Flow Content Area: Dual Mode (Mobile Vertical Stepper vs Desktop React Flow) */}
      <div className="relative flex-1 min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] w-full bg-slate-950">
        
        {/* MODE A: Mobile Vertical Stepper View (Shown on small screens when selected) */}
        <div className={`${mobileViewMode === 'stepper' ? 'flex md:hidden' : 'hidden'} flex-col gap-3 p-3.5 sm:p-4 overflow-y-auto max-h-[600px]`}>
          <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
            <span>Dikey Adım Adım Akış:</span>
            <span className="text-blue-400 font-semibold">Düğüme dokunarak detayları inceleyin</span>
          </div>

          {pipelineRoles.map((role, idx) => {
            const nodeSpec = cloudData.nodes[role];
            const isAffected = highlightStatus?.affectedNodes.includes(role);
            const edgeLabel = currentTemplate.edgeLabels[idx];

            let status: 'optimal' | 'error' | 'warning' | 'neutral' = 'neutral';
            if (isAffected && highlightStatus) {
              status = highlightStatus.status;
            }

            return (
              <React.Fragment key={role}>
                <div className="w-full">
                  <DataNode
                    data={{
                      id: role,
                      label: nodeSpec?.serviceName || role,
                      role,
                      provider: currentCloud,
                      serviceName: nodeSpec?.serviceName || 'Service',
                      subText: nodeSpec?.subText || '',
                      icon: nodeSpec?.icon || '⚙️',
                      latency: nodeSpec?.latency || 'N/A',
                      throughput: nodeSpec?.throughput,
                      purpose: nodeSpec?.purpose,
                      whySelected: nodeSpec?.whySelected,
                      whyAlternativeFailed: nodeSpec?.whyAlternativeFailed,
                      costHint: nodeSpec?.costHint,
                      protocol: nodeSpec?.protocol,
                      status,
                      statusMsg: highlightStatus?.statusMsg,
                      isStepper: true,
                      onSelect: () => onSelectRole(role),
                    }}
                  />
                </div>

                {/* Vertical Downward Edge Connector between nodes */}
                {idx < pipelineRoles.length - 1 && (
                  <div className="flex flex-col items-center justify-center my-1 py-1">
                    <div className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 shadow-md flex items-center gap-1.5">
                      <ArrowDown className="w-3 h-3 text-blue-400 animate-bounce" />
                      <span>{edgeLabel}</span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* MODE B: Full React Flow Canvas (Always on desktop, togglable on mobile) */}
        <div className={`${mobileViewMode === 'canvas' ? 'block' : 'hidden md:block'} w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]`}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.3}
            maxZoom={1.6}
            className="bg-slate-950"
          >
            <Background color="#1e293b" gap={24} size={1.5} />
            <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300 !left-2 !bottom-2 sm:!left-4 sm:!bottom-4" />
            <MiniMap
              nodeColor={(node) => {
                if (node.data.status === 'optimal') return '#10b981';
                if (node.data.status === 'error') return '#ef4444';
                return '#3b82f6';
              }}
              maskColor="rgba(15, 23, 42, 0.75)"
              className="!bg-slate-900 !border-slate-800 !hidden sm:!block"
            />
          </ReactFlow>

          {/* Quick Hint Overlay */}
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:left-4 sm:right-auto z-10 pointer-events-none">
            <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md text-[10px] sm:text-[11px] text-slate-300 flex items-center gap-1.5 sm:gap-2 shadow-lg">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-none">Düğümlerin üstünde <b>Ne Yapıldığı</b> ve <b>Gerekçesi</b> yazmaktadır.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
    </ReactFlowProvider>
  );
};

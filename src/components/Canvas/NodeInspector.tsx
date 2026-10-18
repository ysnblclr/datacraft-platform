import React from 'react';
import { NodeRole, CloudProvider } from '../../types';
import { rosettaMatrix } from '../../data/rosettaMatrix';
import { Info, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface NodeInspectorProps {
  selectedRole: NodeRole;
  currentCloud: CloudProvider;
  currentServiceName: string;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  selectedRole,
  currentCloud,
  currentServiceName,
}) => {
  // Find matching tool in rosetta matrix
  const tool =
    rosettaMatrix.find(
      (t) => t.role === selectedRole && t.provider === currentCloud
    ) ||
    rosettaMatrix.find((t) => t.role === selectedRole) ||
    rosettaMatrix[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Bileşen Analizi & Rosetta Stone
            </h4>
          </div>
          <span className="text-[10px] font-bold text-blue-400 uppercase px-2 py-0.5 rounded bg-blue-950/60 border border-blue-900/60">
            {selectedRole}
          </span>
        </div>

        {/* Current Active Tool Info */}
        <div className="mb-4">
          <div className="text-sm font-bold text-slate-100 mb-0.5">
            {currentServiceName}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {tool.shortDesc}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-[11px]">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Gecikme Profili:</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">{tool.latencyProfile}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Maliyet Modeli:</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">{tool.costModel}</span>
          </div>
        </div>

        {/* 1:1 Cloud Equivalents List */}
        <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 mb-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Diğer Bulutlardaki Birebir Karşılıkları:
          </span>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-semibold">AWS:</span>
              <span className="text-slate-200 font-mono text-[11px]">{tool.equivalents.aws || 'Amazon Kinesis'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-400 font-semibold">GCP:</span>
              <span className="text-slate-200 font-mono text-[11px]">{tool.equivalents.gcp || 'Cloud Pub/Sub'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-semibold">Azure:</span>
              <span className="text-slate-200 font-mono text-[11px]">{tool.equivalents.azure || 'Azure Event Hubs'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-semibold">Open Source:</span>
              <span className="text-slate-200 font-mono text-[11px]">{tool.equivalents.oss || 'Apache Kafka'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Certification Tip Card */}
      <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-900/50 text-xs text-amber-300 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <b>Sertifikasyon İpucu: </b>
          <span className="text-slate-300">{tool.certGotchas}</span>
        </div>
      </div>
    </div>
  );
};

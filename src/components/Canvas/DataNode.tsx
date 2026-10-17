import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { PipelineNodeData } from '../../types';
import { CheckCircle2, XCircle, Zap, Target, Lightbulb, Ban } from 'lucide-react';

interface DataNodeProps {
  data: PipelineNodeData;
}

export const DataNode: React.FC<DataNodeProps> = ({ data }) => {
  const getProviderBorder = () => {
    switch (data.provider) {
      case 'aws':
        return 'border-amber-500/50 hover:border-amber-400 bg-slate-900/95';
      case 'gcp':
        return 'border-blue-500/50 hover:border-blue-400 bg-slate-900/95';
      case 'azure':
        return 'border-cyan-500/50 hover:border-cyan-400 bg-slate-900/95';
      case 'oss':
        return 'border-emerald-500/50 hover:border-emerald-400 bg-slate-900/95';
      default:
        return 'border-slate-700 bg-slate-900/95';
    }
  };

  const getStatusBorder = () => {
    if (data.status === 'optimal') {
      return 'border-emerald-500 ring-2 ring-emerald-500/40 bg-slate-900 shadow-emerald-500/20';
    }
    if (data.status === 'error') {
      return 'border-red-500 ring-2 ring-red-500/50 bg-slate-900 shadow-red-500/20 animate-pulse';
    }
    if (data.status === 'warning') {
      return 'border-amber-500 ring-2 ring-amber-500/40 bg-slate-900 shadow-amber-500/20';
    }
    return getProviderBorder();
  };

  const getProviderBadge = () => {
    switch (data.provider) {
      case 'aws':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'gcp':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'azure':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'oss':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div
      onClick={data.onSelect}
      className={`w-full max-w-[360px] sm:min-w-[310px] rounded-2xl border-2 p-3 sm:p-4 shadow-xl backdrop-blur-md transition-all cursor-pointer ${getStatusBorder()}`}
    >
      {!data.isStepper && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-slate-400 !w-3 !h-3 sm:!w-3.5 sm:!h-3.5 !border-2 !border-slate-900"
        />
      )}

      {/* Role & Provider Header */}
      <div className="flex items-center justify-between gap-1.5 mb-2 sm:mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-lg sm:text-xl">{data.icon}</span>
          <span className="text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase text-slate-300 px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
            {data.role}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className={`text-[9px] sm:text-[10px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded border ${getProviderBadge()}`}>
            {data.provider}
          </span>
          {data.protocol && (
            <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 truncate max-w-[90px] sm:max-w-[120px]">
              {data.protocol}
            </span>
          )}
        </div>
      </div>

      {/* Service Name & Subtitle */}
      <div className="mb-2 sm:mb-2.5">
        <h4 className="text-xs sm:text-sm font-black text-white tracking-tight">
          {data.serviceName}
        </h4>
        <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5 line-clamp-1">
          {data.subText}
        </p>
      </div>

      {/* 1. GÖREVİ (NE YAPIYOR?) */}
      {data.purpose && (
        <div className="mb-1.5 sm:mb-2 p-1.5 sm:p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px] sm:text-[11px] leading-snug">
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">
            <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
            <span>Görevi (Ne Yapıyor?)</span>
          </div>
          <p className="text-slate-300">{data.purpose}</p>
        </div>
      )}

      {/* 2. NEDEN SEÇİLDİ? (GEREKÇE) */}
      {data.whySelected && (
        <div className="mb-1.5 sm:mb-2 p-1.5 sm:p-2 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-[10px] sm:text-[11px] leading-snug">
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
            <Lightbulb className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
            <span>Neden Bu Araç Seçildi?</span>
          </div>
          <p className="text-emerald-200">{data.whySelected}</p>
        </div>
      )}

      {/* 3. ELENEN ALTERNATİF (ANTİ-PATTERN) */}
      {data.whyAlternativeFailed && (
        <div className="mb-2 p-1.5 sm:p-2 rounded-xl bg-red-950/20 border border-red-900/30 text-[10px] sm:text-[11px] leading-snug">
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-red-400 uppercase tracking-wider mb-0.5">
            <Ban className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
            <span>Elenen Alternatif & Nedeni</span>
          </div>
          <p className="text-red-200">{data.whyAlternativeFailed}</p>
        </div>
      )}

      {/* Latency & Metrics Footer */}
      <div className="pt-1.5 sm:pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] sm:text-[11px]">
        <div className="flex items-center gap-1 text-slate-400">
          <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
          <span>Gecikme:</span>
          <b className="text-slate-200">{data.latency}</b>
        </div>

        {data.throughput && (
          <span className="text-[9px] sm:text-[10px] text-indigo-300 font-bold px-1.5 sm:px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/50">
            {data.throughput}
          </span>
        )}
      </div>

      {/* Status Alert Overlay */}
      {data.status === 'error' && (
        <div className="mt-2 pt-1.5 border-t border-red-500/40 flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-red-400">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="line-clamp-1">{data.statusMsg || 'Anti-Pattern: Bu Seçenek Elenir'}</span>
        </div>
      )}

      {data.status === 'optimal' && (
        <div className="mt-2 pt-1.5 border-t border-emerald-500/40 flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Optimal Mimari Tasarım</span>
        </div>
      )}

      {!data.isStepper && (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-slate-400 !w-3 !h-3 sm:!w-3.5 sm:!h-3.5 !border-2 !border-slate-900"
        />
      )}
    </div>
  );
};

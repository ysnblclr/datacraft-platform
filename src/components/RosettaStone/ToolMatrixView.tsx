import React, { useState } from 'react';
import { ToolItem, NodeRole } from '../../types';
import { Search, Filter, AlertTriangle, CheckCircle, ExternalLink, ShieldAlert } from 'lucide-react';

interface ToolMatrixViewProps {
  tools: ToolItem[];
}

export const ToolMatrixView: React.FC<ToolMatrixViewProps> = ({ tools }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const filteredTools = tools.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === 'ALL' || t.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-5 md:p-6">
      
      {/* Header & Search */}
      <div className="border-b border-slate-800 pb-5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
            🗺️ Çapraz Bulut Rosetta Stone Matrisi
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            AWS, GCP, Azure ve Açık Kaynak veri araçlarının 1:1 eşdeğerleri, gecikme profilleri ve sınav tuzakları
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-auto sm:min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Araç, servis veya kavram ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-750 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-750 text-slate-100 rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto"
          >
            <option value="ALL">Tüm Katmanlar</option>
            <option value="ingestion">Ingestion & Streaming</option>
            <option value="compute">Compute & Transform</option>
            <option value="storage">Storage & Lakehouse</option>
            <option value="warehouse">Warehouse & Serving</option>
          </select>
        </div>
      </div>

      {/* Tools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[640px] pr-1">
        {filteredTools.map((tool) => {
          const providerBadge =
            tool.provider === 'aws'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : tool.provider === 'gcp'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              : tool.provider === 'azure'
              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

          return (
            <div
              key={tool.id}
              className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
            >
              <div>
                {/* Provider & Role Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${providerBadge}`}>
                    {tool.provider}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {tool.category}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-100 mb-1">
                  {tool.name}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {tool.shortDesc}
                </p>

                {/* Metrics */}
                <div className="space-y-1.5 mb-3 text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gecikme:</span>
                    <span className="font-semibold text-slate-200">{tool.latencyProfile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Maliyet Modeli:</span>
                    <span className="font-semibold text-slate-200 line-clamp-1">{tool.costModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ölçekleme:</span>
                    <span className="font-semibold text-slate-200 line-clamp-1">{tool.scalingMechanism}</span>
                  </div>
                </div>

                {/* Sınav Tuzağı & Gotcha */}
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/40 text-[11px] text-amber-300 mb-3 flex items-start gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <b>Sınav Tuzağı: </b>
                    <span>{tool.certGotchas}</span>
                  </div>
                </div>
              </div>

              {/* Cross-Cloud Equivalents Footer */}
              <div className="pt-2.5 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400 font-semibold block mb-1">1:1 Eşdeğer Servisler:</span>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <span className="text-amber-400 truncate">AWS: {tool.equivalents.aws || '-'}</span>
                  <span className="text-blue-400 truncate">GCP: {tool.equivalents.gcp || '-'}</span>
                  <span className="text-cyan-400 truncate">Azure: {tool.equivalents.azure || '-'}</span>
                  <span className="text-emerald-400 truncate">OSS: {tool.equivalents.oss || '-'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

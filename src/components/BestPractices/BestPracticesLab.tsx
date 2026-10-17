import React, { useState } from 'react';
import { ProductionBestPractice, BestPracticeCategory } from '../../types';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  Code2,
  TrendingDown,
  Building2,
  Sparkles,
} from 'lucide-react';

interface BestPracticesLabProps {
  practices: ProductionBestPractice[];
}

export const BestPracticesLab: React.FC<BestPracticesLabProps> = ({ practices }) => {
  const [selectedPracticeId, setSelectedPracticeId] = useState<string>(practices[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('list');

  // Filter
  const filteredPractices = practices.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.provenance.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const activePractice =
    practices.find((p) => p.id === selectedPracticeId) || practices[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activePractice.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectPractice = (id: string) => {
    setSelectedPracticeId(id);
    setMobileTab('detail');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-5 md:p-6">
      
      {/* Top Banner: Real World Distinction */}
      <div className="border-b border-slate-800 pb-5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
              🏆
            </span>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Gerçek Dünya Best Practice & Production Mimarileri
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Sınav Dışı · Gerçek Sektör Deneyimi
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Netflix, Uber, Airbnb, Stripe ve Databricks mühendislik blogları ile GitHub açık kaynak depolarından derlenen canlı mimari desenler.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-auto sm:min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Şirket, araç veya desen ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-750 text-white rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
          >
            <option value="ALL">Tüm Kategoriler ({practices.length})</option>
            <option value="lakehouse">Lakehouse & Compaction</option>
            <option value="orchestration">Orkestrasyon & Backfill</option>
            <option value="contracts">Veri Sözleşmeleri</option>
            <option value="streaming">Streaming & DLQ</option>
            <option value="cdc">CDC & Outbox</option>
            <option value="finops">FinOps & Maliyet</option>
          </select>
        </div>
      </div>

      {/* Mobile Tab Switcher (< lg screens) */}
      <div className="lg:hidden flex items-center p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-4 gap-1">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'list'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>📋 Desenler</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900 border border-slate-700">
            {filteredPractices.length}
          </span>
        </button>
        <button
          onClick={() => setMobileTab('detail')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'detail'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>📖 Detay & Kod</span>
          <span className="text-[10px] font-mono text-emerald-200">
            ({activePractice.provenance.split(' ')[0]})
          </span>
        </button>
      </div>

      {/* Main Grid: Left List (4 cols) & Right Detailed View (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Patterns Directory List */}
        <div className={`lg:col-span-4 flex flex-col gap-2.5 max-h-[720px] overflow-y-auto pr-1 ${mobileTab === 'detail' ? 'hidden lg:flex' : 'flex'}`}>
          {filteredPractices.map((practice) => {
            const isSelected = practice.id === activePractice.id;
            return (
              <div
                key={practice.id}
                onClick={() => handleSelectPractice(practice.id)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-900/40">
                      {practice.categoryLabel}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      {practice.provenance.split(' ')[0]}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug mb-1">
                    {practice.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {practice.problemSummary}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-medium truncate max-w-[170px]">
                    Etki: <b className="text-emerald-400 font-normal">{practice.impactMetrics.split(',')[0]}</b>
                  </span>
                  <span className="text-slate-500 font-mono">Detay →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Detailed Production Blueprint */}
        <div className={`lg:col-span-8 flex flex-col gap-5 bg-slate-950/90 border border-slate-800 rounded-3xl p-4 sm:p-5 md:p-6 shadow-xl ${mobileTab === 'list' ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Mobile Back Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileTab('list')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800/60 px-3 py-1.5 rounded-xl transition-all"
            >
              <span>← Tüm Desenler Listesine Dön</span>
            </button>
          </div>

          {/* Header Info */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {activePractice.categoryLabel}
                </span>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  {activePractice.provenance}
                </span>
              </div>

              {activePractice.githubSource && (
                <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3 text-indigo-400" />
                  {activePractice.githubSource}
                </span>
              )}
            </div>

            <h2 className="text-base md:text-lg font-bold text-white mb-2">
              {activePractice.title}
            </h2>

            {/* Impact Metric Badge */}
            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-900/40 text-xs text-emerald-300 flex items-start gap-2 mb-4">
              <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <b>Ölçülebilir Prodüksiyon Etkisi (ROI): </b>
                <span>{activePractice.impactMetrics}</span>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="mb-4 text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="font-bold text-white block mb-1">🚨 Karşılaşılan Gerçek Hayat Problemi:</span>
              {activePractice.problemSummary}
            </div>
          </div>

          {/* Architecture Diagram / Flow */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Mimari Akış Şeması (Architecture Topology)
            </h4>
            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 font-mono text-[11px] text-blue-300 overflow-x-auto whitespace-pre leading-snug">
              {activePractice.architectureFlow}
            </div>
          </div>

          {/* Code Snippet Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                {activePractice.codeTitle}
              </h4>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kodu Kopyala</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[300px] leading-relaxed">
                <code>{activePractice.codeSnippet}</code>
              </pre>
            </div>
          </div>

          {/* Do's and Don'ts Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Do's */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/30">
              <h5 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Üretimde Yapılması Gerekenler (Do's)
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activePractice.dos.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Don'ts */}
            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/30">
              <h5 className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                Kaçınılması Gereken Hatalar (Don'ts)
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activePractice.donts.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Anti-Pattern Warning */}
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-900/40 text-xs text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <b>⚠️ Anti-Pattern Tuzağı: </b>
              <span className="text-slate-300">{activePractice.antiPatternWarning}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 mr-1">Etiketler:</span>
            {activePractice.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800"
              >
                #{tag}
              </span>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { ExamToolDeepDive, CloudProvider } from '../../types';
import {
  Search,
  BookOpen,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Layers,
  ArrowRight,
  TrendingDown,
  Building2,
  DollarSign,
  ShieldCheck,
  Zap,
  Filter,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface ToolEncyclopediaProps {
  tools: ExamToolDeepDive[];
  onNavigateToExam?: (cloud: CloudProvider) => void;
}

export const ToolEncyclopedia: React.FC<ToolEncyclopediaProps> = ({
  tools,
  onNavigateToExam,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<string>(tools[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('ALL');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Filter logic
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesProvider =
        selectedProvider === 'ALL' || tool.provider === selectedProvider;

      const matchesCategory =
        selectedCategory === 'ALL' || tool.category === selectedCategory;

      const matchesExam =
        selectedExamFilter === 'ALL' ||
        tool.examAppearances.some((app) =>
          app.exam.toLowerCase().includes(selectedExamFilter.toLowerCase())
        );

      const matchesSearch =
        !searchTerm ||
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.coreFeatures.some((f) => f.toLowerCase().includes(searchTerm.toLowerCase())) ||
        tool.examAppearances.some(
          (app) =>
            app.typicalQuestion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.whenItIsCorrect.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.keyHeuristic.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return matchesProvider && matchesCategory && matchesExam && matchesSearch;
    });
  }, [tools, searchTerm, selectedProvider, selectedCategory, selectedExamFilter]);

  const activeTool =
    tools.find((t) => t.id === selectedToolId) || filteredTools[0] || tools[0];

  const handleSelectTool = (id: string) => {
    setSelectedToolId(id);
    setMobileView('detail');
  };

  const getProviderBadge = (provider: CloudProvider) => {
    switch (provider) {
      case 'aws':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'gcp':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'azure':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'oss':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-5 md:p-6">
      
      {/* Top Banner: Encyclopedia Header */}
      <div className="border-b border-slate-800 pb-5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
              📖
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              Sınav Araçları & Tool Ansiklopedisi
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-300 border border-purple-500/20">
              AWS · GCP · Azure · Databricks
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Sorularda çıkan tüm veri araçlarının ne işe yaradığı, temel mimari özellikleri, sınavda ne zaman DOĞRU cevap olduğu, ne zaman elendiği ve sınav altın kuralları (heuristics).
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            Toplam <b className="text-purple-400">{tools.length}</b> Kritik Servis
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 mb-5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
        
        {/* Search Input (5 cols) */}
        <div className="sm:col-span-2 lg:col-span-4 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Araç adı, özellik, sınav sorusu veya kavram ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Cloud Provider Filter (3 cols) */}
        <div className="lg:col-span-3">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">Tüm Bulutlar (AWS, GCP, Azure, OSS)</option>
            <option value="aws">Amazon Web Services (AWS)</option>
            <option value="gcp">Google Cloud Platform (GCP)</option>
            <option value="azure">Microsoft Azure</option>
            <option value="oss">Databricks / Açık Kaynak</option>
          </select>
        </div>

        {/* Category Filter (3 cols) */}
        <div className="lg:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">Tüm Mimari Katmanlar</option>
            <option value="Streaming & Ingestion">Streaming & Ingestion</option>
            <option value="Storage & Lakehouse">Storage & Lakehouse</option>
            <option value="Compute & Transform">Compute & Transform</option>
            <option value="Warehouse & Serving">Warehouse & Serving</option>
            <option value="Orchestration & Governance">Orchestration & Governance</option>
            <option value="NoSQL & Operational">NoSQL & Operational</option>
          </select>
        </div>

        {/* Exam Specific Filter (2 cols) */}
        <div className="lg:col-span-2">
          <select
            value={selectedExamFilter}
            onChange={(e) => setSelectedExamFilter(e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-2 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
          >
            <option value="ALL">Tüm Sınavlar</option>
            <option value="DEA-C01">AWS DEA-C01</option>
            <option value="PDE">GCP PDE</option>
            <option value="DP-700">Azure DP-700</option>
            <option value="Databricks">Databricks DE</option>
          </select>
        </div>

      </div>

      {/* Mobile Tab Switcher (< lg screens) */}
      <div className="lg:hidden flex items-center p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-4 gap-1">
        <button
          onClick={() => setMobileView('list')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileView === 'list'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>📋 Araç Listesi</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900 border border-slate-700">
            {filteredTools.length}
          </span>
        </button>
        <button
          onClick={() => setMobileView('detail')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileView === 'detail'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>📖 Seçili Araç Detayı</span>
          <span className="text-[10px] font-mono text-purple-200">
            ({activeTool?.name.split(' ')[0]})
          </span>
        </button>
      </div>

      {/* Main Grid: Left Side Directory (4 cols) & Right Side Deep-Dive (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Tool Directory List */}
        <div
          className={`lg:col-span-4 flex flex-col gap-2.5 max-h-[760px] overflow-y-auto pr-1 ${
            mobileView === 'detail' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {filteredTools.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
              Arama kriterlerine uygun araç bulunamadı.
            </div>
          ) : (
            filteredTools.map((tool) => {
              const isSelected = tool.id === activeTool.id;
              return (
                <div
                  key={tool.id}
                  onClick={() => handleSelectTool(tool.id)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Header: Provider badge & Category */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getProviderBadge(
                          tool.provider
                        )}`}
                      >
                        {tool.provider} · {tool.badge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {tool.category.split(' ')[0]}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100 leading-snug mb-1">
                      {tool.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {tool.summary}
                    </p>
                  </div>

                  {/* Sınav Frekansı */}
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">
                      Sınav Frekansı:{' '}
                      <b
                        className={
                          tool.examAppearances[0]?.frequency === 'Çok Yüksek'
                            ? 'text-amber-400'
                            : 'text-purple-400'
                        }
                      >
                        {tool.examAppearances[0]?.frequency || 'Yüksek'}
                      </b>
                    </span>
                    <span className="text-purple-400 font-mono font-semibold flex items-center gap-0.5">
                      İncele →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Tool Deep-Dive Analysis */}
        <div
          className={`lg:col-span-8 flex flex-col gap-5 bg-slate-950/95 border border-slate-800 rounded-3xl p-4 sm:p-5 md:p-6 shadow-xl ${
            mobileView === 'list' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Mobile Back Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileView('list')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 bg-purple-950/50 hover:bg-purple-900/50 border border-purple-800/60 px-3 py-1.5 rounded-xl transition-all"
            >
              <span>← Tüm Araçlar Listesine Dön</span>
            </button>
          </div>

          {/* Header & Badges */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${getProviderBadge(
                    activeTool.provider
                  )}`}
                >
                  {activeTool.provider} · {activeTool.badge}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                  {activeTool.category}
                </span>
              </div>

              {onNavigateToExam && (
                <button
                  onClick={() => onNavigateToExam(activeTool.provider)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
                >
                  <span>Sınav Sorularında Çöz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-100 mb-2">
              {activeTool.name}
            </h2>

            {/* Summary Box */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-slate-100 block mb-1">📌 Ne İşe Yarar? (Genel Tanım):</span>
              {activeTool.summary}
            </div>
          </div>

          {/* SECTION 1: Sınavlarda Nasıl Çıkar? (CRITICAL FOR EXAMS) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/20 border-2 border-purple-500/40">
            <div className="flex items-center justify-between mb-3 border-b border-purple-900/40 pb-2.5">
              <h4 className="text-xs sm:text-sm font-bold text-purple-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                🎯 Sertifikasyon Sınavlarında Nasıl Sorulur? (Exam Analysis)
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/60 text-purple-200 border border-purple-700/50">
                Frekans: {activeTool.examAppearances[0]?.frequency || 'Yüksek'}
              </span>
            </div>

            {activeTool.examAppearances.map((app, idx) => (
              <div key={idx} className="space-y-3">
                <div className="text-[11px] font-mono text-purple-400 font-semibold">
                  İlgili Sınav: <b>{app.exam}</b>
                </div>

                {/* Tipik Senaryo */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="font-bold text-amber-300 block mb-1">
                    📝 Tipik Sınav Senaryo Kökü (Scenario Archetype):
                  </span>
                  <p className="text-slate-300 leading-relaxed">{app.typicalQuestion}</p>
                </div>

                {/* İkili Karşılaştırma: Ne Zaman Doğru? / Ne Zaman Elenir? */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Ne Zaman Doğru? */}
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Ne Zaman DOĞRU Cevaptır?
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {app.whenItIsCorrect}
                    </p>
                  </div>

                  {/* Ne Zaman Elenir? */}
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-xs">
                    <span className="font-bold text-red-400 flex items-center gap-1.5 mb-1.5">
                      <XCircle className="w-4 h-4" />
                      Ne Zaman ELENİR? (Anti-Pattern)
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {app.whenItFails}
                    </p>
                  </div>
                </div>

                {/* Sınav Altın Kuralı / Heuristic */}
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/60 flex items-start gap-2.5 text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <b className="text-indigo-300 block mb-0.5">💡 Sınav Altın Kuralı (Heuristic):</b>
                    <span className="text-slate-200 leading-relaxed">{app.keyHeuristic}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SECTION 2: Core Architecture Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Temel Mimari Özellikleri & Parametreleri
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {activeTool.coreFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5"></span>
                  <span className="leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Cross-Cloud Alternatives Comparison */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              Diğer Bulutlardaki Eşdeğerleri & Farkları
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {activeTool.alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-100 text-[11px]">{alt.name}</span>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold border ${getProviderBadge(
                          alt.provider
                        )}`}
                      >
                        {alt.provider}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{alt.comparison}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: FinOps & Pricing Tip */}
          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-300 flex items-start gap-2.5">
            <DollarSign className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <b className="text-amber-200">💰 FinOps & Sınav Maliyet İpucu: </b>
              <span className="text-slate-300">{activeTool.pricingTip}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

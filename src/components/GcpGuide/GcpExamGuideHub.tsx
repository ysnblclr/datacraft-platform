import React, { useState, useMemo } from 'react';
import {
  gcpPdeExamTrends,
  gcpPdeServiceGuides,
  gcpDecisionScenarios,
  gcpPublicationReviews,
} from '../../data/gcpPdeGuideData';
import { GcpServiceCategory } from '../../types';
import {
  Compass,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Database,
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface GcpExamGuideHubProps {
  onNavigateToExam?: () => void;
}

export const GcpExamGuideHub: React.FC<GcpExamGuideHubProps> = ({ onNavigateToExam }) => {
  const [activeSubTab, setActiveSubTab] = useState<'trends' | 'decisions' | 'services' | 'publications'>('trends');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(gcpPdeServiceGuides[0].id);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(gcpDecisionScenarios[0].id);

  // Filtered services
  const filteredServices = useMemo(() => {
    return gcpPdeServiceGuides.filter((svc) => {
      const matchesCat = selectedCategory === 'ALL' || svc.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        svc.name.toLowerCase().includes(q) ||
        svc.summary.toLowerCase().includes(q) ||
        svc.goldenHeuristic.toLowerCase().includes(q) ||
        svc.examTraps.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeService = useMemo(() => {
    return (
      filteredServices.find((s) => s.id === selectedServiceId) ||
      filteredServices[0] ||
      gcpPdeServiceGuides[0]
    );
  }, [filteredServices, selectedServiceId]);

  const activeScenario = useMemo(() => {
    return gcpDecisionScenarios.find((s) => s.id === selectedScenarioId) || gcpDecisionScenarios[0];
  }, [selectedScenarioId]);

  const categories: { key: string; label: string }[] = [
    { key: 'ALL', label: 'Tüm Servisler' },
    { key: 'storage_formats', label: 'Depolama & Formatlar' },
    { key: 'databases', label: 'Veritabanları & NoSQL' },
    { key: 'warehouse_analytics', label: 'Veri Ambarı & Analitik' },
    { key: 'streaming_processing', label: 'Akış & Hesaplama' },
    { key: 'governance_security', label: 'Yönetişim & Güvenlik' },
    { key: 'migration_ops', label: 'Taşıma & Operasyon' },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/30 p-5 sm:p-7 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>GCP PDE Master Hub (2024 · 2025 · 2026 Güncel)</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Google Cloud Professional Data Engineer Sınav Portalı
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-blue-400">Janaom</span> kapsamlı sınav hazırlık notları ve{' '}
              <span className="font-semibold text-indigo-400">Sathish VJ</span> küratörlüğündeki 2024-2025 PDE
              yayınlarının (Carmel Wenga, Manojkumar Vadivel, David Regalado) sentezi. Sınav kararları, 19 servisin
              derinlemesine cheat sheet'leri ve sınav altın kuralları tek bir merkezde.
            </p>
          </div>

          {onNavigateToExam && (
            <button
              onClick={onNavigateToExam}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all shrink-0 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              GCP Sorularını Çöz
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setActiveSubTab('trends')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeSubTab === 'trends'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            2024-2026 Sınav Trendleri & Domainler
          </button>

          <button
            onClick={() => setActiveSubTab('decisions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeSubTab === 'decisions'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            İnteraktif Karar Simülatörü
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px]">
              Soru Çözücü
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('services')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeSubTab === 'services'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            19 Servis Cheat Sheet (Janaom)
            <span className="px-1.5 py-0.2 rounded-full bg-purple-400/20 text-purple-300 text-[10px]">
              Derin Notlar
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('publications')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeSubTab === 'publications'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            2024-2025 Yayınları & Taktikler (Sathish VJ)
          </button>
        </div>
      </div>

      {/* =========================================================================
          SUB-TAB 1: 2024-2026 EXAM TRENDS & DOMAIN BREAKDOWN
          ========================================================================= */}
      {activeSubTab === 'trends' && (
        <div className="flex flex-col gap-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 font-medium">Sınav Süresi</span>
              <span className="text-base sm:text-lg font-bold text-white">{gcpPdeExamTrends.examLength}</span>
              <span className="text-[10px] text-blue-400 font-medium">Soru Başına ~2.2 Dk</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 font-medium">Soru Adedi</span>
              <span className="text-base sm:text-lg font-bold text-white">{gcpPdeExamTrends.questionCount}</span>
              <span className="text-[10px] text-emerald-400 font-medium">Çoktan Seçmeli / Senaryo</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 font-medium">Geçme Notu</span>
              <span className="text-base sm:text-lg font-bold text-white">Geçti / Kaldı</span>
              <span className="text-[10px] text-amber-400 font-medium">Tahmini ~%70 Eşik</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 font-medium">Sınav Dili</span>
              <span className="text-base sm:text-lg font-bold text-white">İngilizce / Japonca</span>
              <span className="text-[10px] text-purple-400 font-medium">Kryterion / Webassessor</span>
            </div>
          </div>

          {/* Major Shifts (Neler Değişti?) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                2024 / 2025 / 2026 Sınavında Neler Değişti? (Kritik Paradigma Kayması)
              </h3>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Sathish VJ & Carmel Wenga & Manojkumar Sentezi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {gcpPdeExamTrends.majorShifts.map((shift, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-750 bg-slate-950/70 p-4 flex flex-col gap-2 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {shift.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-7.5">
                    {shift.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Official Domain Breakdown */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Resmi Sınav Müfredatı & Soru Ağırlıkları
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gcpPdeExamTrends.domains.map((dom, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-750 bg-slate-950/60 p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{dom.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-extrabold text-xs">
                      {dom.weight}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                      style={{ width: dom.weight }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {dom.topics.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-slate-850 border border-slate-750 text-slate-300 text-[11px]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: INTERACTIVE DECISION SIMULATOR (KARAR MOTORU)
          ========================================================================= */}
      {activeSubTab === 'decisions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Scenario Selector (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="text-xs font-semibold text-slate-400">
              Sınav Senaryosunu Seçin:
            </div>
            <div className="flex flex-col gap-2.5">
              {gcpDecisionScenarios.map((sc, idx) => (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    selectedScenarioId === sc.id
                      ? 'border-indigo-500 bg-indigo-950/40 shadow-md shadow-indigo-500/10'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Senaryo {idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {sc.serviceCategory}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-2">
                    {sc.criteriaBadge}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {sc.scenario}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Detailed Decision Breakdown (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4 sticky top-20">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 flex flex-col gap-5 shadow-xl">
              {/* Question Statement */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-indigo-400 tracking-wider uppercase">
                  Sınav Senaryosu
                </span>
                <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
                  "{activeScenario.scenario}"
                </p>
              </div>

              {/* Correct Choice Card */}
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                      Doğru Mimari Çözüm
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-white px-2.5 py-1 rounded-lg bg-emerald-600/80 shadow-sm">
                    {activeScenario.chosenService}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeScenario.whyCorrect}
                </p>
              </div>

              {/* Golden Heuristic Rule */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-amber-300">
                    Sınav Altın Kuralı (2 Saniyede Çözüm)
                  </span>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {activeScenario.goldenRule}
                  </p>
                </div>
              </div>

              {/* Why Distractors Failed (Anti-Patterns) */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-red-400" />
                  Diğer Şıklar Neden Elendi? (Distractor Analizi)
                </span>
                <div className="flex flex-col gap-2">
                  {activeScenario.distractors.map((dis, dIdx) => (
                    <div
                      key={dIdx}
                      className="rounded-lg border border-slate-750 bg-slate-950/60 p-3 flex flex-col gap-1"
                    >
                      <span className="text-xs font-bold text-red-300">
                        ❌ {dis.service}
                      </span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {dis.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: 19 SERVICE CHEAT SHEETS (JANAOM NOTES)
          ========================================================================= */}
      {activeSubTab === 'services' && (
        <div className="flex flex-col gap-5">
          {/* Category Filter Pills & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Servis adı, özellik, limit veya sınav kuralı ara..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* Category Select Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === c.key
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Master Detail Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left List (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-2 max-h-[750px] overflow-y-auto pr-1">
              <span className="text-xs text-slate-400 font-semibold mb-1">
                Bulunan Servisler ({filteredServices.length})
              </span>
              {filteredServices.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => setSelectedServiceId(svc.id)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                    activeService.id === svc.id
                      ? 'border-blue-500 bg-blue-950/40 shadow-sm'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white line-clamp-1">
                      {svc.name}
                    </span>
                    <span className="text-[10px] text-blue-400 font-medium">
                      {svc.categoryLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {svc.summary}
                  </p>
                </button>
              ))}
            </div>

            {/* Right Detailed Panel (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-5 sticky top-20">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 flex flex-col gap-6 shadow-xl">
                {/* Title & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-500/30">
                        {activeService.categoryLabel}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {activeService.name}
                    </h3>
                  </div>

                  <a
                    href={activeService.officialDocLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-750 bg-slate-950 text-xs font-semibold text-slate-300 hover:text-white hover:border-blue-500 transition-all shrink-0"
                  >
                    Resmi Doküman
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  {activeService.summary}
                </p>

                {/* Golden Heuristic Banner */}
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wide">
                      Sınav Altın Kuralı (Heuristic)
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                      {activeService.goldenHeuristic}
                    </p>
                  </div>
                </div>

                {/* Deep Dive Sections (Janaom RP Content) */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Derin Teknik İnceleme & Mimari Detaylar
                  </h4>
                  {activeService.deepDiveSections.map((sec, sIdx) => (
                    <div
                      key={sIdx}
                      className="rounded-xl border border-slate-750 bg-slate-950/60 p-4 flex flex-col gap-2.5"
                    >
                      <h5 className="text-xs font-bold text-blue-400">
                        {sec.title}
                      </h5>
                      <ul className="flex flex-col gap-1.5">
                        {sec.points.map((pt, pIdx) => (
                          <li
                            key={pIdx}
                            className="text-xs text-slate-300 leading-relaxed flex items-start gap-2"
                          >
                            <span className="text-blue-500 font-bold">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>

                      {sec.gotchasOrLimitations && sec.gotchasOrLimitations.length > 0 && (
                        <div className="mt-2 p-2.5 rounded-lg border border-red-500/30 bg-red-950/20 flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-red-300 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Kritik Sınav Limiti / Gotcha:
                          </span>
                          {sec.gotchasOrLimitations.map((lim, lIdx) => (
                            <p key={lIdx} className="text-[11px] text-red-200/90 leading-relaxed">
                              {lim}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Exam Traps (Tuzaklar) */}
                <div className="flex flex-col gap-2.5">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Sınav Tuzakları & Dikkat Edilmesi Gerekenler
                  </h4>
                  <div className="flex flex-col gap-2">
                    {activeService.examTraps.map((trap, tIdx) => (
                      <div
                        key={tIdx}
                        className="rounded-lg border border-red-500/30 bg-red-950/15 p-3 text-xs text-slate-200 leading-relaxed"
                      >
                        {trap}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2024 / 2025 Updates */}
                {activeService.year20242025Updates.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      2024 - 2025 Güncellemeleri
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeService.year20242025Updates.map((upd, uIdx) => (
                        <div
                          key={uIdx}
                          className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-xs text-emerald-200"
                        >
                          {upd}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 4: 2024-2025 PUBLICATIONS & STRATEGIES (SATHISH VJ)
          ========================================================================= */}
      {activeSubTab === 'publications' && (
        <div className="flex flex-col gap-5">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Sathish VJ Küratörlüğündeki 2024-2025 PDE Yayın İncelemeleri
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Yakın zamanda yeni sınavı veya Renewal sınavını geçmiş veri mimarlarının deneyimleri ve stratejik tavsiyeleri.
              </p>
            </div>
            <a
              href="https://github.com/sathishvj/awesome-gcp-certifications/blob/master/professional-data-engineer.md"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-750 bg-slate-950 text-xs font-semibold text-slate-300 hover:text-white shrink-0"
            >
              Awesome GCP PDE
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gcpPublicationReviews.map((pub) => (
              <div
                key={pub.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between gap-4 hover:border-slate-700 transition-all shadow-md"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                      {pub.focusArea}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {pub.date}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {pub.title}
                  </h4>
                  <span className="text-xs text-indigo-400 font-semibold">
                    Yazar: {pub.author}
                  </span>

                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    {pub.summary}
                  </p>

                  {/* Actionable Exam Tips */}
                  <div className="mt-2 rounded-xl border border-slate-750 bg-slate-950/70 p-3.5 flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                      Altın Tavsiyeler:
                    </span>
                    <ul className="flex flex-col gap-1">
                      {pub.actionableExamTips.map((tip, tIdx) => (
                        <li key={tIdx} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <a
                  href={pub.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-750 bg-slate-950 text-xs font-bold text-blue-400 hover:text-white hover:bg-blue-600 transition-all"
                >
                  Makalenin Tamamını Oku
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

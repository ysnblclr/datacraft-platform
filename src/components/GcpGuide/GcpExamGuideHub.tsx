import React, { useState, useMemo } from 'react';
import {
  gcpPdeExamTrends,
  gcpPdeServiceGuides,
  gcpDecisionScenarios,
  gcpPublicationReviews,
} from '../../data/gcpPdeGuideData';
import {
  janaomFullChapters,
  janaomPreamble,
  JanaomChapter,
} from '../../data/janaomFullText';
import {
  sathishvjAllPosts,
  sathishvjBooks,
  sathishvjTrainings,
  sathishvjQwiklabs,
  sathishvjFullRawText,
} from '../../data/sathishvjFullText';
import {
  Compass,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Search,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
  FileText,
  Code2,
  Bookmark,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';

interface GcpExamGuideHubProps {
  onNavigateToExam?: () => void;
}

// Simple inline markdown parser for rich display of raw repo contents
function FormattedMarkdown({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="flex flex-col gap-2 text-xs text-slate-300 leading-relaxed font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1.5" />;

        // H1
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className="text-lg sm:text-xl font-black text-white mt-3 pb-1 border-b border-slate-800">
              {trimmed.replace('# ', '')}
            </h2>
          );
        }
        // H2
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-sm sm:text-base font-bold text-blue-400 mt-2.5">
              {trimmed.replace('## ', '')}
            </h3>
          );
        }
        // H3
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-xs sm:text-sm font-semibold text-indigo-300 mt-2">
              {trimmed.replace('### ', '')}
            </h4>
          );
        }
        // Bullet list
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const text = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-blue-500 font-bold mt-0.5">•</span>
              <span className="flex-1">{renderInlineLinksAndBold(text)}</span>
            </div>
          );
        }
        // Numbered list
        if (/^\d+\.\s/.test(trimmed)) {
          const numMatch = trimmed.match(/^(\d+\.)\s+(.*)$/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2 my-0.5">
                <span className="text-blue-400 font-mono font-bold text-[11px] shrink-0 mt-0.5">{numMatch[1]}</span>
                <span className="flex-1">{renderInlineLinksAndBold(numMatch[2])}</span>
              </div>
            );
          }
        }
        // Indented list / note
        if (line.startsWith('    ')) {
          return (
            <div key={idx} className="pl-6 border-l-2 border-slate-750 text-slate-300 text-xs py-0.5 my-0.5">
              {renderInlineLinksAndBold(trimmed)}
            </div>
          );
        }
        // Images markdown ![alt](url)
        if (trimmed.startsWith('![') || trimmed.startsWith('<img')) {
          return (
            <div key={idx} className="p-2.5 my-1 rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Görsel Şema / Mimari Diyagram (Orijinal GitHub Deposunda)</span>
            </div>
          );
        }

        // Standard paragraph
        return <p key={idx}>{renderInlineLinksAndBold(trimmed)}</p>;
      })}
    </div>
  );
}

// Helper to render markdown links [text](url), **bold**, and `code`
function renderInlineLinksAndBold(text: string): React.ReactNode {
  // Regex to match [text](url), **bold**, or `code`
  const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a
            key={i}
            href={match[2]}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:text-blue-300 underline font-medium inline-flex items-center gap-0.5 mx-0.5"
          >
            {match[1]}
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        );
      }
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700/60 text-blue-300 font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export const GcpExamGuideHub: React.FC<GcpExamGuideHubProps> = ({ onNavigateToExam }) => {
  const [activeSubTab, setActiveSubTab] = useState<'janaom_full' | 'sathishvj_full' | 'decisions' | 'trends'>('janaom_full');
  const [selectedChapterId, setSelectedChapterId] = useState<string>(janaomFullChapters[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRawMarkdown, setShowRawMarkdown] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(gcpDecisionScenarios[0].id);
  const [postSearchQuery, setPostSearchQuery] = useState<string>('');
  const [postYearFilter, setPostYearFilter] = useState<string>('ALL');

  // Filtered chapters for Janaom full text
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return janaomFullChapters;
    const q = searchQuery.toLowerCase().trim();
    return janaomFullChapters.filter(
      (c) => c.title.toLowerCase().includes(q) || c.content.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeChapter = useMemo(() => {
    return (
      filteredChapters.find((c) => c.id === selectedChapterId) ||
      filteredChapters[0] ||
      janaomFullChapters[0]
    );
  }, [filteredChapters, selectedChapterId]);

  // Filtered posts for Sathish VJ full archive
  const filteredPosts = useMemo(() => {
    return sathishvjAllPosts.filter((p) => {
      const matchesYear =
        postYearFilter === 'ALL' || (p.date && p.date.startsWith(postYearFilter));
      const q = postSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.date.toLowerCase().includes(q);
      return matchesYear && matchesSearch;
    });
  }, [postSearchQuery, postYearFilter]);

  const activeScenario = useMemo(() => {
    return gcpDecisionScenarios.find((s) => s.id === selectedScenarioId) || gcpDecisionScenarios[0];
  }, [selectedScenarioId]);

  const handleCopyCurrentChapter = () => {
    if (activeChapter) {
      navigator.clipboard.writeText(activeChapter.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/30 p-5 sm:p-7 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>GCP PDE Master Hub (2024 · 2025 · 2026 Eksiksiz Kaynak)</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Google Cloud Professional Data Engineer Tam Bilgi Bankası
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-blue-400">janaom/gcp-professional-data-engineer-exam-prep-guide</span> (941 satır, 19 bölüm) ve{' '}
              <span className="font-semibold text-indigo-400">sathishvj/awesome-gcp-certifications</span> (39 makale, 16 laboratuvar, kitaplar ve tüm yayınlar) depolarındaki
              <strong> tüm veriler eksiksiz olarak</strong> buraya taşındı.
            </p>
          </div>

          {onNavigateToExam && (
            <button
              onClick={onNavigateToExam}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all shrink-0 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              GCP Sınav Simülatörü
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 4 Main Nav Tabs */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setActiveSubTab('janaom_full')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeSubTab === 'janaom_full'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Janaom Tam Rehberi (19 Bölüm Eksiksiz)
            <span className="px-1.5 py-0.2 rounded-full bg-blue-400/20 text-blue-300 text-[10px]">
              941 Satır
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('sathishvj_full')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeSubTab === 'sathishvj_full'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Sathish VJ Tüm Kaynaklar & 2024-2025 Arşivi
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-400/20 text-indigo-300 text-[10px]">
              39 Makale + 16 Lab
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('decisions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeSubTab === 'decisions'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
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
            onClick={() => setActiveSubTab('trends')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeSubTab === 'trends'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            2024-2026 Sınav Trendleri & Domainler
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: JANAOM FULL TEXT READER (19 CHAPTERS - 100% UNABRIDGED)
          ========================================================================= */}
      {activeSubTab === 'janaom_full' && (
        <div className="flex flex-col gap-4">
          {/* Top Search & Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/70">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tüm 19 bölüm içinde ara (örn: Autoclass, Avro, Spanner, Dead-Letter, Policy Tags)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowRawMarkdown(!showRawMarkdown)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-750 bg-slate-950 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5 text-blue-400" />
                {showRawMarkdown ? 'Biçimlendirilmiş Görünüm' : 'Orijinal Markdown'}
              </button>

              <button
                onClick={handleCopyCurrentChapter}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-750 bg-slate-950 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Kopyalandı' : 'Bölümü Kopyala'}
              </button>
            </div>
          </div>

          {/* Master Detail Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Chapters Table of Contents (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-1.5 max-h-[750px] overflow-y-auto pr-1">
              <div className="text-xs font-bold text-slate-400 mb-1 flex items-center justify-between">
                <span>Bölümler (19 Konu)</span>
                <span className="text-[11px] text-blue-400">{filteredChapters.length} Eşleşen</span>
              </div>

              {filteredChapters.map((chap) => (
                <button
                  key={chap.id}
                  onClick={() => setSelectedChapterId(chap.id)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    activeChapter.id === chap.id
                      ? 'border-blue-500 bg-blue-950/40 shadow-sm font-bold text-white'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono flex items-center justify-center shrink-0">
                      {chap.chapterNumber}
                    </span>
                    <span className="text-xs line-clamp-1">{chap.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {Math.round(chap.content.length / 1024)} KB
                  </span>
                </button>
              ))}
            </div>

            {/* Right Column: Full Chapter Text (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-4 sticky top-20">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 flex flex-col gap-4 shadow-xl max-h-[800px] overflow-y-auto">
                {/* Chapter Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                      Bölüm {activeChapter.chapterNumber} / 19
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {activeChapter.title}
                    </h3>
                  </div>

                  <a
                    href="https://github.com/janaom/gcp-professional-data-engineer-exam-prep-guide"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white"
                  >
                    Orijinal Repo
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Content View: Formatted Markdown or Raw Text */}
                {showRawMarkdown ? (
                  <pre className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {activeChapter.content}
                  </pre>
                ) : (
                  <FormattedMarkdown content={activeChapter.content} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: SATHISH VJ FULL ARCHIVE (ALL 39 POSTS, 16 LABS, BOOKS, TRAININGS)
          ========================================================================= */}
      {activeSubTab === 'sathishvj_full' && (
        <div className="flex flex-col gap-6">
          {/* Sathish VJ Stats & Official Exam Info */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-indigo-400" />
                  Sathish VJ — Awesome GCP Certifications: PDE Eksiksiz Arşivi
                </h3>
                <p className="text-xs text-slate-400">
                  Resmi sınav parametreleri, 39 farklı sektör yayını, 16 Qwiklabs görevi ve önerilen kitaplar.
                </p>
              </div>
              <a
                href="https://github.com/sathishvj/awesome-gcp-certifications/blob/master/professional-data-engineer.md"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-750 bg-slate-950 text-xs font-semibold text-slate-300 hover:text-white shrink-0"
              >
                GitHub Sayfası
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Official Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              <div className="p-3 rounded-xl border border-slate-750 bg-slate-950/70 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Sınav Süresi</span>
                <span className="font-bold text-white">2 Saat</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-750 bg-slate-950/70 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Soru Sayısı</span>
                <span className="font-bold text-white">~50+ Soru</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-750 bg-slate-950/70 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Sertifika Türü</span>
                <span className="font-bold text-white">Specialization</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-750 bg-slate-950/70 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Deneyim</span>
                <span className="font-bold text-white">Professional</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-750 bg-slate-950/70 flex flex-col gap-1 col-span-2">
                <span className="text-[10px] text-slate-400">Resmi Deneme Sınavı</span>
                <a
                  href="https://cloud.google.com/certification/practice-exam/data-engineer"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-400 hover:underline flex items-center gap-1"
                >
                  Official Practice Exam
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Table of All 39 Posts */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Tüm Yayınlar & Deneyim Raporları (2017 - 2026 Arası 39 Makale)
              </h3>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={postYearFilter}
                  onChange={(e) => setPostYearFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-750 bg-slate-950 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="ALL">Tüm Yıllar</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                  <option value="2019">2019</option>
                </select>

                <input
                  type="text"
                  value={postSearchQuery}
                  onChange={(e) => setPostSearchQuery(e.target.value)}
                  placeholder="Başlık veya yazar ara..."
                  className="px-3 py-1.5 rounded-lg border border-slate-750 bg-slate-950 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
                    <th className="py-2.5 px-3">Tarih</th>
                    <th className="py-2.5 px-3">Makale / Kaynak Başlığı</th>
                    <th className="py-2.5 px-3">Yazar</th>
                    <th className="py-2.5 px-3 text-right">Bağlantı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPosts.map((post, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                          {post.date || '—'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">
                        {post.title}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {post.author || 'Anonim'}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        {post.url ? (
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold text-xs"
                          >
                            Oku
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Qwiklabs & Books Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 16 Qwiklabs Hands-on Quests */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col gap-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Resmi Qwiklabs Hands-On Görevleri (16 Laboratuvar)
              </h4>
              <div className="flex flex-col gap-1.5 max-h-[350px] overflow-y-auto pr-1">
                {sathishvjQwiklabs.map((ql, idx) => (
                  <a
                    key={idx}
                    href={ql.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-slate-750 bg-slate-950/60 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-xs text-slate-300 hover:text-white flex items-center justify-between transition-all"
                  >
                    <span>{ql.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                  </a>
                ))}
              </div>
            </div>

            {/* Books & Official Guides */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col gap-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                Önerilen Kitaplar & Eğitim Kaynakları
              </h4>
              <div className="flex flex-col gap-2">
                {sathishvjBooks.map((bk, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-750 bg-slate-950/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{bk.title}</span>
                      <span className="text-[11px] text-slate-400">Yazar: {bk.author}</span>
                    </div>
                    {bk.url && (
                      <a
                        href={bk.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        İncele
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: INTERACTIVE DECISION SIMULATOR (KARAR MOTORU)
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
          VIEW 4: 2024-2026 EXAM TRENDS & DOMAIN BREAKDOWN
          ========================================================================= */}
      {activeSubTab === 'trends' && (
        <div className="flex flex-col gap-6">
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

          {/* Major Shifts */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              2024 / 2025 / 2026 Sınavında Neler Değişti? (Kritik Paradigma Kayması)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {gcpPdeExamTrends.majorShifts.map((shift, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-750 bg-slate-950/70 p-4 flex flex-col gap-2"
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
    </div>
  );
};

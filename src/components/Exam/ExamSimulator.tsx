import React, { useState, useMemo } from 'react';
import { CertificationQuestion, QuestionOption, ExamCode, CloudProvider } from '../../types';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Award,
  Lightbulb,
  ChevronRight,
  Search,
  ListFilter,
  Shuffle,
  Grid,
  Check,
  HelpCircle,
  Layers,
  X,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExamSimulatorProps {
  questions: CertificationQuestion[];
  onOptionSelected: (
    option: QuestionOption,
    question: CertificationQuestion
  ) => void;
  onQuestionChanged: (question: CertificationQuestion) => void;
  onSetCloud: (cloud: CloudProvider) => void;
}

export const ExamSimulator: React.FC<ExamSimulatorProps> = ({
  questions,
  onOptionSelected,
  onQuestionChanged,
  onSetCloud,
}) => {
  const [selectedExam, setSelectedExam] = useState<string>('ALL');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  
  // Track answered questions across the session
  const [userAnswers, setUserAnswers] = useState<
    Record<string, { selectedOptionId: string; isCorrect: boolean }>
  >({});

  // Question Navigator State
  const [isNavigatorOpen, setIsNavigatorOpen] = useState<boolean>(false);
  const [navSearch, setNavSearch] = useState<string>('');
  const [navDifficulty, setNavDifficulty] = useState<string>('ALL');
  const [matrixPage, setMatrixPage] = useState<number>(0); // 50 questions per block
  const [jumpInput, setJumpInput] = useState<string>('');

  // Filter questions by exam
  const filteredQuestions = useMemo(() => {
    return questions.filter(
      (q) => selectedExam === 'ALL' || q.exam === selectedExam
    );
  }, [questions, selectedExam]);

  // Statistics
  const stats = useMemo(() => {
    const total = questions.length;
    const aws = questions.filter((q) => q.exam === 'AWS_DEA_C01').length;
    const gcp = questions.filter((q) => q.exam === 'GCP_PDE').length;
    const azure = questions.filter((q) => q.exam === 'AZURE_DP_700').length;
    const dbx = questions.filter((q) => q.exam === 'DATABRICKS_DE_ASSOC').length;

    const answeredList = Object.values(userAnswers);
    const correctCount = answeredList.filter((a) => a.isCorrect).length;
    const wrongCount = answeredList.filter((a) => !a.isCorrect).length;
    const remaining = total - answeredList.length;

    return { total, aws, gcp, azure, dbx, correctCount, wrongCount, remaining };
  }, [questions, userAnswers]);

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0] || questions[0];

  // Jump to specific question
  const jumpToQuestionIndex = (index: number) => {
    if (index >= 0 && index < filteredQuestions.length) {
      setCurrentIndex(index);
      const targetQ = filteredQuestions[index];
      setSelectedOptionId(userAnswers[targetQ.id]?.selectedOptionId || null);
      onQuestionChanged(targetQ);
      onSetCloud(targetQ.cloudTarget);
    }
  };

  const handleSelectOption = (option: QuestionOption) => {
    setSelectedOptionId(option.id);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        selectedOptionId: option.id,
        isCorrect: option.isCorrect,
      },
    }));

    onOptionSelected(option, currentQ);

    if (option.isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      jumpToQuestionIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      jumpToQuestionIndex(currentIndex - 1);
    }
  };

  const handleRandomQuestion = () => {
    const randomIdx = Math.floor(Math.random() * filteredQuestions.length);
    jumpToQuestionIndex(randomIdx);
  };

  const handleFilterChange = (exam: string) => {
    setSelectedExam(exam);
    setCurrentIndex(0);
    setMatrixPage(0);
    const newFiltered = questions.filter(
      (q) => exam === 'ALL' || q.exam === exam
    );
    if (newFiltered.length > 0) {
      setSelectedOptionId(userAnswers[newFiltered[0].id]?.selectedOptionId || null);
      onQuestionChanged(newFiltered[0]);
      onSetCloud(newFiltered[0].cloudTarget);
    }
  };

  const handleDirectJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(jumpInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= filteredQuestions.length) {
      jumpToQuestionIndex(parsed - 1);
      setJumpInput('');
      setIsNavigatorOpen(false);
    }
  };

  // Filtered list for the Navigator
  const navigatorQuestions = useMemo(() => {
    return filteredQuestions
      .map((q, originalIdx) => ({ question: q, index: originalIdx }))
      .filter(({ question }) => {
        const matchesSearch =
          !navSearch ||
          question.scenario.toLowerCase().includes(navSearch.toLowerCase()) ||
          question.domain.toLowerCase().includes(navSearch.toLowerCase()) ||
          question.primaryServices.some((s) =>
            s.toLowerCase().includes(navSearch.toLowerCase())
          );
        const matchesDiff =
          navDifficulty === 'ALL' || question.difficulty === navDifficulty;
        return matchesSearch && matchesDiff;
      });
  }, [filteredQuestions, navSearch, navDifficulty]);

  const selectedOpt = currentQ.options.find((o) => o.id === selectedOptionId);

  // Pagination for 50-item blocks in the Question Matrix
  const pageSize = 50;
  const totalMatrixPages = Math.ceil(filteredQuestions.length / pageSize);
  const matrixSliceStart = matrixPage * pageSize;
  const currentMatrixSlice = filteredQuestions.slice(
    matrixSliceStart,
    matrixSliceStart + pageSize
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-5 md:p-6 relative">
      
      {/* Header & Filter Pills */}
      <div className="border-b border-slate-800 pb-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Sertifikasyon Soru & Senaryo Laboratuvarı
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white">
                {stats.total.toLocaleString('tr-TR')} Soru
              </span>
            </div>
            <p className="text-xs text-slate-400">
              AWS DEA-C01, GCP PDE, Azure DP-700 & Databricks senaryoları ve mimari çeldirici analizleri
            </p>
          </div>
        </div>

        {/* Action Controls & Navigator Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsNavigatorOpen(!isNavigatorOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
              isNavigatorOpen
                ? 'bg-indigo-600 text-white shadow-indigo-600/30 ring-2 ring-indigo-400'
                : 'bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-indigo-500/30'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Soru Gezgini ({filteredQuestions.length})</span>
          </button>

          <button
            onClick={handleRandomQuestion}
            title="Rastgele Bir Soruya Atla"
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center gap-1 border border-slate-700"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Rastgele</span>
          </button>
        </div>
      </div>

      {/* Filter Buttons & Live Score Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-800/80">
        
        {/* Filter Buttons (Horizontally swipable on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full sm:w-auto">
          {[
            { id: 'ALL', label: `Tümü (${stats.total})` },
            { id: 'AWS_DEA_C01', label: `AWS (${stats.aws})` },
            { id: 'GCP_PDE', label: `GCP (${stats.gcp})` },
            { id: 'AZURE_DP_700', label: `Azure (${stats.azure})` },
            { id: 'DATABRICKS_DE_ASSOC', label: `Databricks (${stats.dbx})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                selectedExam === f.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-slate-800/90 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Live Score Counter */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 self-end sm:self-center shrink-0">
          <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded-lg">
            ✓ {stats.correctCount} Doğru
          </span>
          <span className="text-red-400 font-bold bg-red-950/40 border border-red-900/50 px-2 py-0.5 rounded-lg">
            ✗ {stats.wrongCount} Yanlış
          </span>
        </div>
      </div>

      {/* QUESTION NAVIGATOR DRAWER (Collapsible) */}
      {isNavigatorOpen && (
        <div className="mb-5 bg-slate-950 border-2 border-indigo-500/40 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                1.000+ Soru Kütüphanesi & Hızlı Gezgin
              </h4>
              <span className="text-[10px] text-slate-400">
                (Seçili Sınavda {filteredQuestions.length} Soru)
              </span>
            </div>
            <button
              onClick={() => setIsNavigatorOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search & Jump Tools */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mb-4">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Konu, servis veya senaryoda ara (ör: Kinesis, Iceberg, BigLake, Auto Loader)..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="sm:col-span-3">
              <select
                value={navDifficulty}
                onChange={(e) => setNavDifficulty(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Tüm Zorluklar</option>
                <option value="Temel">Temel Seviye</option>
                <option value="Orta">Orta Seviye</option>
                <option value="İleri Seviye">İleri Seviye</option>
              </select>
            </div>

            {/* Direct Jump Input */}
            <form onSubmit={handleDirectJumpSubmit} className="sm:col-span-3 flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={filteredQuestions.length}
                placeholder={`1 - ${filteredQuestions.length}`}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0"
              >
                Git
              </button>
            </form>
          </div>

          {/* Matrix Page Switcher (50 questions per tab) */}
          {!navSearch && totalMatrixPages > 1 && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-2 mb-2 border-b border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-mono mr-1">Blok:</span>
              {Array.from({ length: totalMatrixPages }).map((_, pIdx) => {
                const startNum = pIdx * pageSize + 1;
                const endNum = Math.min((pIdx + 1) * pageSize, filteredQuestions.length);
                return (
                  <button
                    key={pIdx}
                    onClick={() => setMatrixPage(pIdx)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-all ${
                      matrixPage === pIdx
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {startNum}-{endNum}
                  </button>
                );
              })}
            </div>
          )}

          {/* Visual Matrix Grid of Question Numbers */}
          {!navSearch && (
            <div className="mb-3">
              <div className="grid grid-cols-10 sm:grid-cols-25 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                {currentMatrixSlice.map((q, localIdx) => {
                  const globalIdx = matrixSliceStart + localIdx;
                  const isCurrent = globalIdx === currentIndex;
                  const ans = userAnswers[q.id];

                  let colorClass = 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white';
                  if (ans) {
                    colorClass = ans.isCorrect
                      ? 'bg-emerald-600 border-emerald-500 text-white font-bold'
                      : 'bg-red-600 border-red-500 text-white font-bold';
                  }
                  if (isCurrent) {
                    colorClass = 'bg-indigo-600 border-white text-white font-black ring-2 ring-indigo-400 shadow-md';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        jumpToQuestionIndex(globalIdx);
                        setIsNavigatorOpen(false);
                      }}
                      title={`Soru #${globalIdx + 1}: ${q.scenario.substring(0, 80)}...`}
                      className={`h-7 rounded-lg border text-[11px] font-mono flex items-center justify-center transition-all ${colorClass}`}
                    >
                      {globalIdx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-600 ring-1 ring-white"></span>
                  Aktif Soru
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span>
                  Doğru Çözüldü
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-red-600"></span>
                  Hatalı Çözüldü
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-slate-900 border border-slate-700"></span>
                  Çözülmedi
                </span>
              </div>
            </div>
          )}

          {/* Search Results List View (when searching) */}
          {navSearch && (
            <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
              <div className="text-[11px] text-slate-400 mb-1">
                Arama Sonucu: <b>{navigatorQuestions.length} soru bulundu</b>
              </div>
              {navigatorQuestions.map(({ question: q, index }) => (
                <div
                  key={q.id}
                  onClick={() => {
                    jumpToQuestionIndex(index);
                    setIsNavigatorOpen(false);
                  }}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:border-indigo-500 cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 truncate">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-indigo-400 text-[11px]">
                        Soru #{index + 1}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300">
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {q.domain}
                      </span>
                    </div>
                    <p className="text-slate-300 truncate text-[11px]">{q.scenario}</p>
                  </div>
                  <button className="px-2 py-1 rounded bg-indigo-600 text-white text-[11px] font-bold shrink-0">
                    Soruya Git →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Question Details Banner */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {currentQ.examTitle}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {currentQ.domain}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[11px]">
              Zorluk: {currentQ.difficulty}
            </span>
            <span className="text-slate-300 font-mono font-bold text-[11px] bg-indigo-950/60 border border-indigo-900/40 px-2 py-0.5 rounded-lg">
              Soru {currentIndex + 1} / {filteredQuestions.length}
            </span>
          </div>
        </div>

        {/* Scenario Text */}
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-3">
          {currentQ.scenario}
        </p>

        {/* Prompt */}
        <p className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" />
          {currentQ.prompt}
        </p>
      </div>

      {/* Options List */}
      <div className="space-y-2.5 mb-5 flex-1">
        {currentQ.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          let borderClass = 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300';

          if (isSelected) {
            borderClass = opt.isCorrect
              ? 'border-emerald-500 bg-emerald-950/30 text-white ring-2 ring-emerald-500/30'
              : 'border-red-500 bg-red-950/30 text-white ring-2 ring-red-500/30';
          }

          return (
            <div
              key={opt.id}
              onClick={() => handleSelectOption(opt)}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${borderClass}`}
            >
              <div
                className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected
                    ? opt.isCorrect
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-red-500 text-white'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {opt.letter}
              </div>

              <div className="flex-1 text-xs md:text-sm leading-snug">
                <span>{opt.text}</span>

                {isSelected && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 text-xs">
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      {opt.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">Doğru Mimari Çözüm</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400">
                            Anti-Pattern / Hatalı Seçenek
                            {opt.antiPatternType && opt.antiPatternType !== 'none' && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-red-900/60 text-red-300 uppercase font-mono">
                                {opt.antiPatternType.replace('_', ' ')}
                              </span>
                            )}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-slate-400 leading-relaxed text-xs">
                      {opt.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trade-off Breakdown & Key Takeaway (Rendered when option selected) */}
      {selectedOpt && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
            <span>⚖️ Mimari Trade-Off Analizi</span>
            <span className="text-[10px] text-indigo-400 font-semibold">Gecikme vs Maliyet vs Bakım</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Gecikme (Latency):</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block">{selectedOpt.tradeoffs.latency}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Maliyet Etkisi:</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block">{selectedOpt.tradeoffs.cost}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Operasyonel Yük:</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block">{selectedOpt.tradeoffs.ops}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Ölçeklenebilirlik:</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block">{selectedOpt.tradeoffs.scalability}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-900/50 flex items-start gap-2 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <b className="text-indigo-300">Sınav Altın Kuralı (Heuristic): </b>
              <span className="text-slate-300">{currentQ.keyTakeaway}</span>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls & Direct Jump */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Önceki Soru
        </button>

        {/* Center: Direct Jump Counter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span>Soru</span>
          <form
            onSubmit={handleDirectJumpSubmit}
            className="inline-flex items-center gap-1"
          >
            <input
              type="number"
              min={1}
              max={filteredQuestions.length}
              value={jumpInput || String(currentIndex + 1)}
              onFocus={() => setJumpInput(String(currentIndex + 1))}
              onChange={(e) => setJumpInput(e.target.value)}
              className="w-14 px-1.5 py-1 rounded-lg bg-slate-950 border border-slate-750 text-center font-mono font-bold text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </form>
          <span>/ {filteredQuestions.length.toLocaleString('tr-TR')}</span>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === filteredQuestions.length - 1}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/30"
        >
          Sonraki Soru
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};

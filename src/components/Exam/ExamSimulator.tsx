import React, { useState } from 'react';
import { CertificationQuestion, QuestionOption, ExamCode, CloudProvider } from '../../types';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, ArrowLeft, Award, Lightbulb, ChevronRight } from 'lucide-react';
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

  // Filter questions by exam
  const filteredQuestions = questions.filter(
    (q) => selectedExam === 'ALL' || q.exam === selectedExam
  );

  const currentQ = filteredQuestions[currentIndex] || questions[0];

  const handleSelectOption = (option: QuestionOption) => {
    setSelectedOptionId(option.id);
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
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedOptionId(null);
      const nextQ = filteredQuestions[nextIdx];
      onQuestionChanged(nextQ);
      onSetCloud(nextQ.cloudTarget);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setSelectedOptionId(null);
      const prevQ = filteredQuestions[prevIdx];
      onQuestionChanged(prevQ);
      onSetCloud(prevQ.cloudTarget);
    }
  };

  const handleFilterChange = (exam: string) => {
    setSelectedExam(exam);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    const newFiltered = questions.filter(
      (q) => exam === 'ALL' || q.exam === exam
    );
    if (newFiltered.length > 0) {
      onQuestionChanged(newFiltered[0]);
      onSetCloud(newFiltered[0].cloudTarget);
    }
  };

  const selectedOpt = currentQ.options.find((o) => o.id === selectedOptionId);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-5 md:p-6">
      
      {/* Header & Filter Pills */}
      <div className="border-b border-slate-800 pb-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
            🎓
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Sertifikasyon Soru & Senaryo Laboratuvarı
            </h3>
            <p className="text-xs text-slate-400">
              Gerçek sınav senaryoları, mimari çeldirici analizleri ve anlık tuval reaksiyonu
            </p>
          </div>
        </div>

        {/* Filter Buttons (Horizontally swipable on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'Tümü (1.000+)' },
            { id: 'AWS_DEA_C01', label: 'AWS DEA-C01' },
            { id: 'GCP_PDE', label: 'GCP PDE' },
            { id: 'AZURE_DP_700', label: 'Azure DP-700' },
            { id: 'DATABRICKS_DE_ASSOC', label: 'Databricks DE' },
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
      </div>

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
            <span className="text-slate-500 font-mono font-medium text-[11px]">
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
          <ChevronRight className="w-4 h-4 text-indigo-400" />
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Önceki Soru
        </button>

        <span className="text-xs text-slate-400 font-medium">
          {currentIndex + 1} / {filteredQuestions.length} Senaryo
        </span>

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

import React from 'react';
import { CloudProvider, AppTheme } from '../types';
import { Layers, HelpCircle, Table2, Sliders, Terminal, Award, BookOpen, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentCloud: CloudProvider;
  onSelectCloud: (cloud: CloudProvider) => void;
  activeTab: 'canvas' | 'exam' | 'rosetta' | 'whatif' | 'workbench' | 'practices' | 'tools';
  onSelectTab: (tab: 'canvas' | 'exam' | 'rosetta' | 'whatif' | 'workbench' | 'practices' | 'tools') => void;
  score: { correct: number; total: number };
  theme: AppTheme;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCloud,
  onSelectCloud,
  activeTab,
  onSelectTab,
  score,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 w-full">
      <div className="w-full flex flex-col gap-2.5 sm:gap-3 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Top Mobile Bar: Brand (Left) + Cloud Switcher (Right) */}
        <div className="flex items-center justify-between gap-3">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-md shadow-indigo-500/25 shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  DataCraft
                  <span className="text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    DE Studio
                  </span>
                </h1>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-1">
                AWS · GCP · Azure · Databricks | Çapraz Bulut Mimari & Sınav Laboratuvarı
              </p>
            </div>
          </div>

          {/* Cloud Provider Switcher (Compact on mobile) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="inline-flex rounded-xl border border-slate-750 bg-slate-950 p-0.5 sm:p-1 shadow-inner">
              <button
                onClick={() => onSelectCloud('aws')}
                className={`px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  currentCloud === 'aws'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-amber-400'
                }`}
              >
                AWS
              </button>
              <button
                onClick={() => onSelectCloud('gcp')}
                className={`px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  currentCloud === 'gcp'
                    ? 'bg-blue-500 text-white shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-blue-400'
                }`}
              >
                GCP
              </button>
              <button
                onClick={() => onSelectCloud('azure')}
                className={`px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  currentCloud === 'azure'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-cyan-400'
                }`}
              >
                Azure
              </button>
              <button
                onClick={() => onSelectCloud('oss')}
                className={`px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  currentCloud === 'oss'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                OSS
              </button>
            </div>

            {/* Theme Toggle Button (Koyu / Krem) */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Krem Temaya Geç (Sıcak Paper/Sepia)' : 'Koyu Temaya Geç'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-750 bg-slate-950 hover:border-amber-400/50 transition-all text-slate-300 shadow-inner shrink-0 cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline font-medium">Krem Tema</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline font-medium text-slate-800">Koyu Tema</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Smooth touch horizontal scrollbar on mobile) */}
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0 -mx-1 px-1">
          <button
            onClick={() => onSelectTab('canvas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'canvas'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Mimari Tuval
          </button>

          <button
            onClick={() => onSelectTab('practices')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'practices'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            Best Practices
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold">
              PROD
            </span>
          </button>

          <button
            onClick={() => onSelectTab('exam')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'exam'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Sınav Simülatörü
            {score.total > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {score.correct}/{score.total}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('tools')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'tools'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            Sınav Araçları
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
              30 DE
            </span>
          </button>

          <button
            onClick={() => onSelectTab('rosetta')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'rosetta'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            Rosetta Matrisi
          </button>

          <button
            onClick={() => onSelectTab('whatif')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'whatif'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-500/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            What-If
          </button>

          <button
            onClick={() => onSelectTab('workbench')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'workbench'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            SQL Workbench
          </button>
        </nav>

      </div>
    </header>
  );
};

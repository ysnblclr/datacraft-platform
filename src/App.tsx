import React, { useState } from 'react';
import { CloudProvider, NodeRole, QuestionOption, CertificationQuestion } from './types';
import { pipelineTemplates } from './data/pipelineTemplates';
import { certificationQuestions } from './data/questionsData';
import { rosettaMatrix } from './data/rosettaMatrix';
import { Header } from './components/Header';
import { PipelineCanvas } from './components/Canvas/PipelineCanvas';
import { NodeInspector } from './components/Canvas/NodeInspector';
import { ExamSimulator } from './components/Exam/ExamSimulator';
import { ToolMatrixView } from './components/RosettaStone/ToolMatrixView';
import { WhatIfLab } from './components/Simulator/WhatIfLab';
import { SqlWorkbench } from './components/Workbench/SqlWorkbench';
import { BestPracticesLab } from './components/BestPractices/BestPracticesLab';
import { productionBestPractices } from './data/bestPracticesData';

export function App() {
  const [currentCloud, setCurrentCloud] = useState<CloudProvider>('aws');
  const [activeTab, setActiveTab] = useState<'canvas' | 'exam' | 'rosetta' | 'whatif' | 'workbench' | 'practices'>('canvas');
  const [currentTemplateId, setCurrentTemplateId] = useState<string>(pipelineTemplates[0].id);
  const [selectedRole, setSelectedRole] = useState<NodeRole>('ingestion');
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  const [highlightStatus, setHighlightStatus] = useState<{
    status: 'optimal' | 'error' | 'warning' | 'neutral';
    affectedNodes: string[];
    statusMsg?: string;
  }>({
    status: 'neutral',
    affectedNodes: [],
  });

  const currentTemplate =
    pipelineTemplates.find((t) => t.id === currentTemplateId) || pipelineTemplates[0];

  const currentServiceName =
    currentTemplate.clouds[currentCloud]?.nodes[selectedRole]?.serviceName || 'Service';

  const handleOptionSelected = (
    option: QuestionOption,
    question: CertificationQuestion
  ) => {
    setScore((prev) => ({
      correct: prev.correct + (option.isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    setHighlightStatus({
      status: option.isCorrect ? 'optimal' : 'error',
      affectedNodes: option.affectedNodes || ['compute'],
      statusMsg: option.isCorrect
        ? 'Optimal Mimari Tasarım'
        : `Anti-Pattern: ${option.antiPatternType?.toUpperCase() || 'Hatalı Seçenek'}`,
    });
  };

  const handleQuestionChanged = (question: CertificationQuestion) => {
    if (question.pipelineTemplateId) {
      setCurrentTemplateId(question.pipelineTemplateId);
    }
    setHighlightStatus({
      status: 'neutral',
      affectedNodes: [],
    });
  };

  const handleResetCanvas = () => {
    setHighlightStatus({
      status: 'neutral',
      affectedNodes: [],
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        currentCloud={currentCloud}
        onSelectCloud={setCurrentCloud}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        score={score}
      />

      <main className="flex-1 w-full p-2.5 sm:p-4 lg:p-6 xl:p-8 flex flex-col gap-4 sm:gap-6">
        
        {/* VIEW 1: Mimari Tuval & Laboratuvar */}
        {activeTab === 'canvas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Canvas (8 cols) */}
            <div className="lg:col-span-8 flex flex-col min-h-[550px]">
              <PipelineCanvas
                currentCloud={currentCloud}
                currentTemplate={currentTemplate}
                onSelectTemplate={setCurrentTemplateId}
                templates={pipelineTemplates}
                selectedRole={selectedRole}
                onSelectRole={setSelectedRole}
                highlightStatus={highlightStatus}
                onReset={handleResetCanvas}
              />
            </div>

            {/* Sidecar: Node Inspector & Rosetta Stone (4 cols) */}
            <div className="lg:col-span-4 flex flex-col min-h-[550px]">
              <NodeInspector
                selectedRole={selectedRole}
                currentCloud={currentCloud}
                currentServiceName={currentServiceName}
              />
            </div>

            {/* Bottom: Quick What-If Capacity & Cost Calculator */}
            <div className="lg:col-span-12">
              <WhatIfLab />
            </div>
          </div>
        )}

        {/* VIEW 2: Sınav Simülatörü & Mimari Reaksiyon */}
        {activeTab === 'exam' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Exam Question Simulator (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              <ExamSimulator
                questions={certificationQuestions}
                onOptionSelected={handleOptionSelected}
                onQuestionChanged={handleQuestionChanged}
                onSetCloud={setCurrentCloud}
              />
            </div>

            {/* Live Reacting Canvas (5 cols) */}
            <div className="lg:col-span-5 flex flex-col min-h-[550px]">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-white">Canlı Mimari Reaksiyonu:</span>
                <span>Seçilen şıkka göre düğümler anlık güncellenir</span>
              </div>
              <div className="flex-1">
                <PipelineCanvas
                  currentCloud={currentCloud}
                  currentTemplate={currentTemplate}
                  onSelectTemplate={setCurrentTemplateId}
                  templates={pipelineTemplates}
                  selectedRole={selectedRole}
                  onSelectRole={setSelectedRole}
                  highlightStatus={highlightStatus}
                  onReset={handleResetCanvas}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW: Gerçek Dünya Best Practices & Production Patterns (Ayrı Bölüm) */}
        {activeTab === 'practices' && (
          <div className="w-full">
            <BestPracticesLab practices={productionBestPractices} />
          </div>
        )}

        {/* VIEW 3: Rosetta Stone Karşılık Matrisi */}
        {activeTab === 'rosetta' && (
          <div className="w-full">
            <ToolMatrixView tools={rosettaMatrix} />
          </div>
        )}

        {/* VIEW 4: What-If Maliyet & Kapasite Simülatörü */}
        {activeTab === 'whatif' && (
          <div className="w-full">
            <WhatIfLab />
          </div>
        )}

        {/* VIEW 5: SQL & Lakehouse Workbench */}
        {activeTab === 'workbench' && (
          <div className="w-full">
            <SqlWorkbench />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        DataCraft · Multi-Cloud Data Engineering Playground & Certification Simulator · AWS DEA-C01 · GCP PDE · Azure DP-700 · Databricks DE
      </footer>
    </div>
  );
}

export default App;

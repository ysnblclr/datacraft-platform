export type CloudProvider = 'aws' | 'gcp' | 'azure' | 'oss';

export type NodeRole = 
  | 'ingestion'
  | 'compute'
  | 'storage'
  | 'warehouse'
  | 'orchestrator'
  | 'governance';

export type ExamCode = 
  | 'AWS_DEA_C01'
  | 'GCP_PDE'
  | 'AZURE_DP_700'
  | 'DATABRICKS_DE_ASSOC';

export interface ToolItem {
  id: string;
  name: string;
  provider: CloudProvider;
  role: NodeRole;
  category: string;
  shortDesc: string;
  latencyProfile: string;
  costModel: string;
  scalingMechanism: string;
  strengths: string[];
  antiPatterns: string[];
  certGotchas: string;
  equivalents: {
    aws?: string;
    gcp?: string;
    azure?: string;
    oss?: string;
  };
}

export interface PipelineNodeData {
  id: string;
  label: string;
  role: NodeRole;
  provider: CloudProvider;
  serviceName: string;
  subText: string;
  icon: string;
  latency: string;
  status?: 'optimal' | 'warning' | 'error' | 'neutral';
  statusMsg?: string;
  throughput?: string;
  purpose?: string;
  whySelected?: string;
  whyAlternativeFailed?: string;
  costHint?: string;
  protocol?: string;
  onSelect?: () => void;
  [key: string]: unknown;
}

export interface PipelineTemplate {
  id: string;
  title: string;
  description: string;
  domain: string;
  defaultCloud: CloudProvider;
  flowGoal: string;              // Ne Yapılıyor? (Hedef)
  flowMotivation: string;        // Ne İçin Yapılıyor? (Gerekçe & SLA)
  flowSolution: string;          // Nasıl Çözüldü? (Mimari Strateji)
  flowAntiPatterns: string;      // Hangi Yanlış Yaklaşımlar Elendi?
  edgeLabels: string[];          // Bağlantı üzerindeki protokol / veri bilgisi
  clouds: Record<CloudProvider, {
    badge: string;
    description: string;
    baseCost: number;
    costPer10kEps: number;
    nodes: Record<string, {
      serviceName: string;
      subText: string;
      icon: string;
      latency: string;
      throughput: string;
      purpose: string;
      whySelected: string;
      whyAlternativeFailed: string;
      costHint: string;
      protocol: string;
    }>;
  }>;
}

export interface QuestionTradeoff {
  latency: string;
  cost: string;
  ops: string;
  scalability: string;
}

export interface QuestionOption {
  id: string;
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
  isCorrect: boolean;
  explanation: string;
  antiPatternType?: 'small_files' | 'hot_shard' | 'cost_explosion' | 'manual_devops' | 'oom_crash' | 'none';
  tradeoffs: QuestionTradeoff;
  affectedNodes?: string[];
}

export interface CertificationQuestion {
  id: string;
  exam: ExamCode;
  examTitle: string;
  domain: string;
  difficulty: 'Temel' | 'Orta' | 'İleri Seviye';
  cloudTarget: CloudProvider;
  scenario: string;
  prompt: string;
  options: QuestionOption[];
  keyTakeaway: string;
  primaryServices: string[];
  pipelineTemplateId: string;
}

export interface SimulationParams {
  throughputEps: number;
  payloadSizeKb: number;
  batchIntervalSec: number;
  retentionDays: number;
}

export type BestPracticeCategory = 
  | 'lakehouse'
  | 'orchestration'
  | 'contracts'
  | 'streaming'
  | 'finops'
  | 'cdc';

export interface ProductionBestPractice {
  id: string;
  title: string;
  category: BestPracticeCategory;
  categoryLabel: string;
  provenance: string; // e.g., 'Netflix Data Platform', 'Airbnb Engineering', 'Stripe / Bitol ODCS'
  githubSource?: string;
  problemSummary: string;
  impactMetrics: string; // e.g., '99% faster query planning, 80% lower S3 API bill'
  architectureFlow: string;
  codeSnippet: string;
  codeLanguage: 'python' | 'sql' | 'yaml' | 'json';
  codeTitle: string;
  dos: string[];
  donts: string[];
  antiPatternWarning: string;
  tags: string[];
}

export interface ExamToolDeepDive {
  id: string;
  name: string;
  provider: CloudProvider;
  category: 'Streaming & Ingestion' | 'Storage & Lakehouse' | 'Compute & Transform' | 'Warehouse & Serving' | 'Orchestration & Governance' | 'NoSQL & Operational';
  badge: string;
  summary: string;
  coreFeatures: string[];
  examAppearances: {
    exam: string;
    frequency: 'Çok Yüksek' | 'Yüksek' | 'Orta';
    typicalQuestion: string;
    whenItIsCorrect: string;
    whenItFails: string;
    keyHeuristic: string;
  }[];
  alternatives: {
    name: string;
    provider: CloudProvider;
    comparison: string;
  }[];
  primaryUseCases: string[];
  pricingTip: string;
}

export type AppTheme = 'dark' | 'cream';


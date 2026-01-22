export interface TitleBlock {
  title: string;
}

export interface HookBlock extends TitleBlock {
  text: string;
}

export interface ScriptBlock extends TitleBlock {
  steps: string[];
}

export interface StoryboardBlock extends TitleBlock {
  frames: string[];
}

export interface TechTipsBlock extends TitleBlock {
  tips: string[];
}

export interface HashtagsBlock extends TitleBlock {
  tags: string[];
}

export interface MetricsBlock extends TitleBlock {
  engagement: string;          // "7.5-9.0%"
  views: string;               // "10,000-15,000"
  successProbability: string;  // "80-90%"
}

export interface BestPostingTimeBlock extends TitleBlock {
  text: string;
}


export interface VideoAnalysis {
  hook: HookBlock;
  script: ScriptBlock;
  storyboard: StoryboardBlock;
  techTips: TechTipsBlock;
  hashtags: HashtagsBlock;
  metrics: MetricsBlock;
  bestPostingTime: BestPostingTimeBlock;

  isAiGenerated: boolean;
  generatedBy: "gemini" | "openai" | "claude";
}


export interface IAnalysis {
  _id: string;
  success: boolean;

  videoId: string;
  platform: "instagram" | "tiktok" | "youtube";
  provider: "gemini" | "openai" | "claude";

  analyzedAt: string;      // ISO date
  analysisTime: string;    // "12831ms"

  analysis: VideoAnalysis;
}

// Типы для задачи анализа
export type AnalysisTaskStatus = 'pending' | 'parsing' | 'analysis' | 'completed' | 'failed';

export interface IAnalysisTask {
  _id: string;
  videoId: string;
  companyId: string;
  status: AnalysisTaskStatus;
  isProcessing: boolean;
  message: string;
  analysis?: any;
  createdAt?: string;
  updatedAt?: string;
}

// Payload для WebSocket событий анализа
export interface IAnalysisWebSocketPayload {
  taskId: string;
  videoId: string;
  companyId: string;
  status: AnalysisTaskStatus;
  analysis?: any;
  createdAt?: string;
  updatedAt?: string;
}
export interface Tool {
  id: string;
  name: string;
  url: string;
  category: string;
  microSummary: string;
  description: string;
  features: string[];
  solvedProblems: string[];
  systemRequirements: string;
  ogImage: string;
  createdAt: string;
  clicks: number;
  // Advanced Copywriter fields
  hook_intro?: string;
  core_concept?: string;
  workflow_steps?: string[];
  comparative_analysis?: {
    without_tool: string;
    with_tool: string;
  };
  key_advantages?: string[];
  technical_ecosystem?: string[];
  call_to_action?: string;
  poster_headline?: string;
}

export interface UserLifecycleState {
  favorites: string[]; // List of tool IDs
  inUse: string[];     // List of tool IDs
  later: string[];     // List of tool IDs
  viewed: string[];    // List of tool IDs
}

export type LifecycleType = 'favorites' | 'inUse' | 'later' | 'viewed';

export interface ScrapeRequest {
  url: string;
}

export interface ScrapeResponse {
  success: boolean;
  tool?: Partial<Tool>;
  error?: string;
}

export interface PublishRequest {
  tool: Omit<Tool, 'id' | 'createdAt' | 'clicks'>;
}

export interface PublishResponse {
  success: boolean;
  tool?: Tool;
  telegramSent: boolean;
  telegramError?: string;
  error?: string;
}

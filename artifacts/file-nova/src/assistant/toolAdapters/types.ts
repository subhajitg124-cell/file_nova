export interface ToolContext {
  id: string;
  name: string;
  description: string;
  category: 'pdf' | 'image' | 'video' | 'office' | 'ai';
  quickTips: string[];
  settingsGuide: Record<string, string>;
  suggestedFollowUps: string[];
}

export interface ToolGuidance {
  key: string;
  description: string;
}
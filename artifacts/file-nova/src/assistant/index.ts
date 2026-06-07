export { SmartAssistant } from './components/SmartAssistant';
export { useAssistantContext } from './hooks/useAssistantContext';
export { getContext, setContext, setCurrentTool, addSessionAction, getSessionHistory } from './context/types';
export type { AssistantContext, FileContext, SessionAction } from './context/types';
export { getToolAdapter, getToolSettingsGuide, getSuggestedWorkflow } from './toolAdapters/pdfTools';
export type { ToolContext, ToolGuidance } from './toolAdapters/types';
export { askAssistant } from './services/assistantService';
export type { AssistantResponse } from './services/assistantService';
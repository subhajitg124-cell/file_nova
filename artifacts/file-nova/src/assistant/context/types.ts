import { FileRecord, OperationType } from '@/store/useFileStore';

export interface AssistantContext {
  currentTool: string | null;
  currentPage: string;
  files: FileContext[];
  selectedOperation: OperationType | null;
  operationOptions: Record<string, any>;
  isProcessing: boolean;
  progress: number;
  sessionHistory: SessionAction[];
}

export interface FileContext {
  type: string;
  size: number;
  name: string;
  pageCount?: number;
  dimensions?: { width: number; height: number };
}

export interface SessionAction {
  tool: string;
  timestamp: number;
  options?: Record<string, any>;
}

const context: AssistantContext = {
  currentTool: null,
  currentPage: '/',
  files: [],
  selectedOperation: null,
  operationOptions: {},
  isProcessing: false,
  progress: 0,
  sessionHistory: [],
};

export const getContext = (): AssistantContext => ({ ...context });

export const setContext = (updates: Partial<AssistantContext>) => {
  Object.assign(context, updates);
};

export const getCurrentTool = (): string | null => {
  return context.currentTool;
};

export const setCurrentTool = (tool: string | null) => {
  context.currentTool = tool;
};

export const getPageContext = (): string => {
  return context.currentPage;
};

export const setPageContext = (page: string) => {
  context.currentPage = page;
};

export const getFileContext = (): FileContext[] => {
  return context.files.map(f => ({ ...f }));
};

export const setFileContext = (files: FileRecord[]) => {
  context.files = files.map(f => ({
    type: f.type,
    size: f.size,
    name: f.name,
    pageCount: f.tempFilename?.includes('.pdf') ? undefined : undefined,
    dimensions: undefined,
  }));
};

export const getOperationContext = () => ({
  operation: context.selectedOperation,
  options: { ...context.operationOptions },
  isProcessing: context.isProcessing,
});

export const setOperationContext = (updates: { operation?: OperationType | null; options?: Record<string, any>; isProcessing?: boolean; progress?: number }) => {
  if (updates.operation !== undefined) context.selectedOperation = updates.operation;
  if (updates.options) context.operationOptions = { ...context.operationOptions, ...updates.options };
  if (updates.isProcessing !== undefined) context.isProcessing = updates.isProcessing;
  if (updates.progress !== undefined) context.progress = updates.progress;
};

export const addSessionAction = (action: SessionAction) => {
  context.sessionHistory.push(action);
  if (context.sessionHistory.length > 20) {
    context.sessionHistory = context.sessionHistory.slice(-20);
  }
};

export const getSessionHistory = (): SessionAction[] => [...context.sessionHistory];

export const getSuggestedFollowUp = (): string | null => {
  const last = context.sessionHistory[context.sessionHistory.length - 1];
  if (!last) return null;

  if (last.tool === 'merge') return 'compress';
  if (last.tool === 'compress') return 'protect';
  if (last.tool === 'remove_bg') return 'resize';
  return null;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export const getFileSummary = (): string => {
  if (context.files.length === 0) return 'No files uploaded';
  const first = context.files[0];
  const summary = [];
  if (first.type?.includes('pdf')) summary.push('PDF');
  else if (first.type?.startsWith('image/')) summary.push('Image');
  else if (first.type?.startsWith('video/')) summary.push('Video');
  else summary.push('Document');
  summary.push(formatFileSize(first.size));
  if (context.files.length > 1) summary.push(`${context.files.length} files`);
  return summary.join(' • ');
};

export default context;
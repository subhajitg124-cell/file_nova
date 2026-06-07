import { useState, useRef, useEffect, useCallback } from 'react';
import { useFileStore } from '@/store/useFileStore';
import { getContext, setContext, addSessionAction, getSessionHistory } from '../context/types';
import { getToolAdapter } from '../toolAdapters/pdfTools';
import { askAssistant, AssistantResponse } from '../services/assistantService';

export function useAssistantContext() {
  const { files, selectedOperation, operationOptions, isProcessing, progress } = useFileStore();

  useEffect(() => {
    setContext({
      files: files.map(f => ({ type: f.type, size: f.size, name: f.name })),
      selectedOperation,
      operationOptions,
      isProcessing,
      progress,
    });
  }, [files, selectedOperation, operationOptions, isProcessing, progress]);

  const getContextualHelp = useCallback(async (query: string): Promise<AssistantResponse> => {
    const context = getContext();
    const history = getSessionHistory().map(a => ({
      role: 'user' as const,
      text: a.tool,
    }));
    return askAssistant(query, context, history);
  }, []);

  return { getContextualHelp };
}
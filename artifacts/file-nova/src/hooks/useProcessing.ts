import { useState, useCallback } from 'react';

export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

export interface UseProcessingReturn {
  status: ProcessingStatus;
  progress: number;
  statusMessage: string;
  result: any;
  error: string | null;
  startProcessing: (fn: () => Promise<any>, message?: string) => Promise<void>;
  reset: () => void;
}

export function useProcessing(initialMessage = '') {
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(initialMessage);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const startProcessing = useCallback(async (fn: () => Promise<any>, message = 'Processing...') => {
    setStatus('processing');
    setProgress(0);
    setStatusMessage(message);
    setError(null);
    setResult(null);
    try {
      const res = await fn();
      setResult(res);
      setStatus('done');
      setProgress(100);
      setStatusMessage('Complete');
    } catch (err: any) {
      setError(err?.message || 'Processing failed');
      setStatus('error');
      setStatusMessage('Failed');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setStatusMessage(initialMessage);
    setResult(null);
    setError(null);
  }, [initialMessage]);

  return { status, progress, statusMessage, result, error, startProcessing, reset };
}

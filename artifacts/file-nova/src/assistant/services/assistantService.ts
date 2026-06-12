import { AssistantContext } from '../context/types';
import { buildToolPrompt, buildWorkflowPrompt, buildFileAnalysisPrompt } from '../prompts/toolPrompts';
import { BACKEND_URL } from '../../lib/api';

const MAX_HISTORY = 8;
const MAX_RETRIES = 3;

export interface AssistantResponse {
  text: string;
  intent: 'guidance' | 'workflow' | 'analysis' | 'error';
  followUpTools?: string[];
}

export async function askAssistant(
  query: string,
  context: AssistantContext,
  messageHistory: { role: 'user' | 'model'; text: string }[]
): Promise<AssistantResponse> {
  const trimmedQuery = query.toLowerCase().trim();

  const offlineResponses: Record<string, AssistantResponse> = {
    'merge': {
      text: 'Merge PDFs combines multiple files into one. Files are processed in order shown - drag them to reorder before merging.',
      intent: 'guidance',
      followUpTools: ['compress', 'protect'],
    },
    'compress': {
      text: 'For a 10MB PDF, try targeting 2-3MB with medium compression. Text-heavy PDFs usually compress better than image-heavy ones.',
      intent: 'guidance',
      followUpTools: ['protect', 'split'],
    },
    'resize': {
      text: 'Common web sizes: 800x600px (0.5MP) or 1024x768px (0.8MP). For PAN card: 160x120px works well.',
      intent: 'guidance',
      followUpTools: ['compress', 'remove_bg'],
    },
    'ocr': {
      text: 'Select the document language for accuracy. Clean, high-DPI scans (300+) work best. Processing takes 10-30 seconds.',
      intent: 'guidance',
      followUpTools: ['pdf_to_docx'],
    },
    'remove_bg': {
      text: 'Background removal uses AI to create transparent PNGs. Best results with clear subject boundaries and solid backgrounds.',
      intent: 'guidance',
      followUpTools: ['resize', 'convert_format'],
    },
  };

  for (const key of Object.keys(offlineResponses)) {
    if (trimmedQuery.includes(key)) {
      return offlineResponses[key];
    }
  }

  const history = messageHistory.slice(-MAX_HISTORY).map(m => ({
    role: m.role,
    text: m.text,
  }));

  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      const prompt = buildToolPrompt(query, context, history);

      const res = await fetch(`${BACKEND_URL}/api/v1/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, context, prompt }),
      });

      if (!res.ok) {
        if (retries === MAX_RETRIES - 1) throw new Error('Rate limited');
        retries++;
        await new Promise(r => setTimeout(r, 1000 * retries));
        continue;
      }

      const data = await res.json();
      const followUps = getSuggestedTools(query, data.response);

      return {
        text: data.response || extractOfflineHelp(query),
        intent: 'guidance',
        followUpTools: followUps,
      };
    } catch {
      if (retries === MAX_RETRIES - 1) {
        return {
          text: extractOfflineHelp(query),
          intent: 'guidance',
        };
      }
      retries++;
    }
  }

  return { text: extractOfflineHelp(query), intent: 'guidance' };
}

function extractOfflineHelp(query: string): string {
  const low = query.toLowerCase();
  if (low.includes('merge')) return 'Use Merge PDFs to combine documents. Files merge in sequence shown.';
  if (low.includes('compress')) return 'Try medium compression for 10-30% file size reduction.';
  if (low.includes('resize') || low.includes('dimension')) return 'Set target pixels in Width/Height fields.';
  if (low.includes('background') || low.includes('remove bg')) return 'Remove Background creates transparent PNGs.';
  if (low.includes('ocr') || low.includes('text')) return 'OCR extracts text from scanned PDFs.';
  return "I'm here to help with FileNova tools. Try asking about a specific tool.";
}

function getSuggestedTools(query: string, response: string): string[] {
  const low = query.toLowerCase();
  if (low.includes('merge')) return ['compress', 'protect'];
  if (low.includes('compress')) return ['protect', 'split'];
  if (low.includes('resize')) return ['compress', 'remove_bg'];
  if (low.includes('background')) return ['resize', 'convert_format'];
  return [];
}
import { AssistantContext } from '../context/types';
import { TOOL_ADAPTERS, getSuggestedWorkflow } from '../toolAdapters/pdfTools';
import { getFileSummary, formatFileSize } from '../context/types';

export function buildToolPrompt(
  userQuery: string,
  context: AssistantContext,
  recentMessages: { role: 'user' | 'model'; text: string }[]
): string {
  const { currentTool, files, selectedOperation, operationOptions } = context;

  let prompt = `You are FileNova Assistant, an AI guide for the FileNova file processing platform.

Current Context:
- Current Tool: ${currentTool || 'None selected'}
- Operation: ${selectedOperation || 'None'}
- Files: ${files.map(f => f.name).join(', ') || 'No files uploaded'}
- File Summary: ${getFileSummary()}
- Progress: ${context.isProcessing ? `${context.progress}%` : 'Idle'}

User Question: ${userQuery}

`;

  if (currentTool && TOOL_ADAPTERS[currentTool]) {
    const adapter = TOOL_ADAPTERS[currentTool];
    prompt += `Tool Information:
- Tool: ${adapter.name}
- Description: ${adapter.description}
- Quick Tips: ${adapter.quickTips.join(' ')}

`;
  }

  prompt += `Instructions:
- Give specific, actionable guidance for FileNova tools.
- Do not suggest features that don't exist.
- Focus on the user's actual file context.
- Keep responses concise (2-3 sentences max).
- If suggesting settings, be specific (e.g., "Try quality=15 for good OCR").
`;

  return prompt;
}

export function buildWorkflowPrompt(toolId: string, context: AssistantContext): string {
  const workflow = getSuggestedWorkflow(toolId);
  return `After ${toolId}, users often need: ${workflow.join(', ')}. Suggest these tools.`;
}

export function buildFileAnalysisPrompt(files: { type: string; size: number; name: string }[]): string {
  const fileInfo = files.map(f => `${f.name} (${formatFileSize(f.size)}, ${f.type})`).join('\n');
  return `Analyze these files and suggest optimal processing:

Files:
${fileInfo}

Suggest:
1. Best compression settings
2. Alternative tools to consider
3. Size targets for their use case`;
}
# FileNova — AI Assistant Guide

**Purpose:** Complete architecture and development guide for FileNova's AI assistant features.

---

## 1. Architecture Overview

FileNova has **two AI assistants** serving different purposes:

### 1.1 FileNovaAssistant (General Helpdesk)
- **File:** `artifacts/file-nova/src/components/FileNovaAssistant.tsx`
- **Purpose:** General customer support chatbot
- **Trigger:** Floating button, `openAIAssistant` custom event
- **Context:** General FileNova knowledge (not tool-specific)
- **Audience:** New users, support seekers

### 1.2 SmartAssistant (Workspace Assistant)
- **File:** `artifacts/file-nova/src/assistant/components/SmartAssistant.tsx`
- **Purpose:** Context-aware workspace assistant
- **Trigger:** Integrated into workspace, floating button
- **Context:** Current tool, uploaded files, operation options
- **Audience:** Active users mid-workflow

---

## 2. FileNovaAssistant (General Helpdesk)

### 2.1 Component Structure
```
artifacts/file-nova/src/components/FileNovaAssistant.tsx
├── State: messages[], inputVal, isTyping
├── Effects: auto-scroll, mount welcome message
├── Handlers: handleSendMessage
│   ├── Add user message
│   ├── Call backend /api/v1/ai/chat
│   ├── Parse streaming response
│   └── Add bot message
└── Render
    ├── Header (title, close button)
    ├── Message list
    │   ├── Bot messages (markdown rendered)
    │   └── User messages
    ├── Preset prompts (4 quick actions)
    └── Input (text field + send button)
```

### 2.2 Props
```ts
interface FileNovaAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}
```

### 2.3 Preset Prompts
```ts
const PRESET_PROMPTS = [
  { text: "How to mask Aadhaar card?", icon: <ShieldCheck /> },
  { text: "How to compress PDF?", icon: <FileDown /> },
  { text: "Crop photo & signature?", icon: <Sparkles /> },
  { text: "Is my data stored securely?", icon: <HelpCircle /> },
];
```

### 2.4 Backend API Call
```ts
const res = await fetch(`${BACKEND_URL}/api/v1/ai/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: trimmed,
    history: messages.slice(-5),
  }),
});
```

---

## 3. SmartAssistant (Context-Aware)

### 3.1 Component Structure
```
artifacts/file-nova/src/assistant/
├── index.ts                    # Public exports
├── components/SmartAssistant.tsx
│   ├── State: messages[], inputVal, isTyping
│   ├── Context: reads from useFileStore
│   ├── Effects: setContext, welcome message
│   └── Render: similar to FileNovaAssistant
├── context/types.ts            # Context management
│   ├── FileContext: { type, size, name }[]
│   ├── SessionAction: { tool, action, timestamp }
│   ├── AssistantContext: { files, operation, options, isProcessing }
│   ├── getContext() / setContext() / addSessionAction()
│   └── getSessionHistory() / getSuggestedFollowUp()
├── services/assistantService.ts
│   └── askAssistant(messages, context, history): Promise<stream>
├── hooks/useAssistantContext.ts
├── prompts/toolPrompts.ts      # Tool-specific prompt templates
└── toolAdapters/
    └── pdfTools.ts
        ├── TOOL_ADAPTERS: Record<string, ToolAdapter>
        ├── getToolAdapter(toolId): ToolAdapter | null
        ├── getToolSettingsGuide(toolId): string[]
        └── getSuggestedWorkflow(toolId): string[]
```

### 3.2 Tool Adapters
Each adapter provides context-aware guidance for a specific tool:

```ts
interface ToolAdapter {
  name: string;
  description: string;
  quickTips: string[];
  settingsGuide: string[];
  suggestedNextTools: string[];
}
```

**Example:**
```ts
{
  name: "Compress PDF",
  description: "Reduce PDF file size while preserving quality.",
  quickTips: [
    "Use 'Low' compression for text-heavy documents",
    "Use 'High' compression for images/scan-heavy PDFs",
    "Aim for under 200KB for most government portals",
  ],
  settingsGuide: [
    "Select compression level: Low (best quality), Medium (balanced), High (smallest)",
    "Check estimated output size before downloading",
  ],
  suggestedNextTools: ["split-pdf", "pdf-to-word", "ocr"],
}
```

### 3.3 Context System
The assistant maintains context about the current workspace state:

```ts
interface AssistantContext {
  files: FileContext[]; // { type, size, name }[]
  selectedOperation: string | null;
  operationOptions: Record<string, any>;
  isProcessing: boolean;
}
```

Updated via `setContext()` whenever file store changes.

### 3.4 Streaming Responses
Both assistants support streaming responses (future enhancement):
```ts
const response = await askAssistant(messages, context, history);
// Response is streamed chunk by chunk
```

---

## 4. AI Providers

### 4.1 Google Gemini (Primary)
- **SDK:** `@google/genai`
- **Model:** `gemini-2.0-flash` (fast, cost-effective)
- **Use case:** General chat, tool guidance, document summarization
- **API Key:** `GEMINI_API_KEY` environment variable

### 4.2 Anthropic Claude (Secondary)
- **SDK:** `@anthropic-ai/sdk`
- **Model:** `claude-3-5-sonnet`
- **Use case:** Complex reasoning, long documents
- **API Key:** `ANTHROPIC_API_KEY` environment variable

### 4.3 Fallback Strategy
1. Try Gemini
2. If unavailable, try Claude
3. If no backend, return mock response
4. Always return helpful, non-error responses to users

---

## 5. Backend AI Routes

### 5.1 Chat Endpoint
```
POST /api/v1/ai/chat
Request: { messages: string, history?: Message[] }
Response: { response: string } (streaming)
Auth: Optional
Rate Limit: 20 req/15min
```

---

## 6. Adding New Tool Adapters

### 6.1 Steps
1. Open `artifacts/file-nova/src/assistant/toolAdapters/pdfTools.ts`
2. Add adapter to `TOOL_ADAPTERS` map:
```ts
'new-tool-id': {
  name: 'New Tool Name',
  description: 'What this tool does.',
  quickTips: ['Tip 1', 'Tip 2'],
  settingsGuide: ['Guide step 1'],
  suggestedNextTools: ['related-tool-1', 'related-tool-2'],
}
```
3. Update `getSuggestedWorkflow()` if tool is part of workflow chain

### 6.2 Checklist
- [ ] Adapter name matches tool name
- [ ] Descriptions are concise and helpful
- [ ] Quick tips are actionable
- [ ] Suggested next tools are logical workflow steps

---

## 7. Conversation Design

### 7.1 Welcome Message Pattern
SmartAssistant generates a dynamic welcome based on context:
```ts
let welcomeText = "Hi! I'm your FileNova Assistant. I can help with any file tool.\n\n";
if (currentTool && !isProcessing) {
  const adapter = getToolAdapter(currentTool);
  if (adapter) {
    welcomeText += `You're using **${adapter.name}**. ${adapter.quickTips[0]}`;
  }
}
```

### 7.2 Preset Prompts
Preset prompts provide quick-start options:
- Tool-specific help
- Setting recommendations
- Workflow suggestions
- Security/privacy questions

### 7.3 Follow-up Suggestions
After each response, suggest next actions:
```ts
const followUps = getSuggestedFollowUp(lastTool);
// Examples: "Need to split this PDF?", "Want to compress the result?"
```

---

## 8. Prompt Engineering

### 8.1 System Prompt Template
```
You are FileNova Assistant, helping users with document processing tools.

Context:
- Current tool: {toolName}
- Files uploaded: {fileList}
- Operation: {operation}
- Options: {options}

Guidelines:
1. Be concise (max 3 sentences per response)
2. Reference specific file names when relevant
3. Suggest next logical steps
4. Use markdown for formatting
5. Never apologize excessively
6. If unsure, say so honestly
```

### 8.2 Tool-Specific Prompts
Located in `assistant/prompts/toolPrompts.ts`:
- `getCompressPrompt()` — quality comparison tips
- `getMergePrompt()` — page ordering advice
- `getAadhaarMaskPrompt()` — security warnings
- `getScholarshipZipPrompt()` — document compilation advice

---

## 9. Future Enhancements

### 9.1 Planned
- [ ] Document Q&A (upload PDF, ask questions)
- [ ] Voice input + output
- [ ] Multi-turn conversation memory (persistent)
- [ ] Workflow auto-suggest (complete multi-step workflow)
- [ ] A/B testing for response quality
- [ ] RAG with tool documentation

### 9.2 Considerations
- **Cost:** Gemini/Claude API costs per token
- **Latency:** Target < 2s first token
- **Caching:** Cache common Q&A pairs
- **Privacy:** Don't send sensitive file content to AI (summaries only)

---

## 10. Testing AI Features

### 10.1 Manual Testing
- [ ] Chat opens and closes
- [ ] Preset prompts work
- [ ] Responses are coherent
- [ ] Markdown renders correctly
- [ ] Context is accurate (SmartAssistant)
- [ ] Streaming works (if enabled)
- [ ] Error states show gracefully

### 10.2 Quality Checks
- [ ] Responses are helpful (not generic)
- [ ] No hallucinated features
- [ ] Tone is professional but friendly
- [ ] Indian context understood (CSC, scholarships, etc.)
- [ ] Tool recommendations are logical

---

## 11. Monitoring AI Usage

### 11.1 Metrics to Track
- Messages per session
- Response time (p50, p95, p99)
- Token usage per request
- User satisfaction (thumbs up/down — future)
- Fallback rate (when primary provider fails)

### 11.2 Cost Management
```ts
// Track token usage
const usage = response.usage;
await analytics.logEvent('ai', 'chat_completed', {
  promptTokens: usage.promptTokens,
  completionTokens: usage.completionTokens,
  model: 'gemini-2.0-flash',
});
```

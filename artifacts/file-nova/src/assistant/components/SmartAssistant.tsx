import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import { useFileStore } from "@/store/useFileStore";
import { getContext, setContext, addSessionAction, getSuggestedFollowUp } from "@/assistant/context/types";
import { getToolAdapter } from "@/assistant/toolAdapters/pdfTools";
import { askAssistant } from "@/assistant/services/assistantService";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  followUpTools?: string[];
}

interface SmartAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_PROMPTS = [
  { text: "Help me compress this PDF", icon: Lightbulb, key: "compress-help" },
  { text: "Best settings for merge?", icon: Sparkles, key: "merge-help" },
  { text: "Explain this tool", icon: HelpCircle, key: "explain-tool" },
  { text: "What tool next?", icon: RefreshCw, key: "next-tool" },
];

export function SmartAssistant({ isOpen, onClose }: SmartAssistantProps) {
  const { tText } = useTranslation();
  const { files, selectedOperation, operationOptions, isProcessing } = useFileStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContext({
      files: files.map(f => ({ type: f.type, size: f.size, name: f.name })),
      selectedOperation,
      operationOptions,
      isProcessing,
    });
  }, [files, selectedOperation, operationOptions, isProcessing]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const currentTool = selectedOperation;
      let welcomeText = "Hi! I'm your FileNova Assistant. I can help with any file tool.\n\n";
      if (currentTool && !isProcessing) {
        const adapter = getToolAdapter(currentTool);
        if (adapter) {
          welcomeText += `You're using **${adapter.name}**. ${adapter.quickTips[0] || adapter.description}`;
        }
      }
      setMessages([{
        id: "welcome",
        sender: "bot",
        text: welcomeText,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, selectedOperation, isProcessing]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      sender: "user",
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    try {
      const context = getContext();
      const history = messages.slice(-4).map(m => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text,
      }));

      const response = await askAssistant(trimmed, context, history);

      const botMsg: Message = {
        id: Math.random().toString(36).substring(7),
        sender: "bot",
        text: response.text,
        timestamp: new Date(),
        followUpTools: response.followUpTools,
      };
      setMessages((prev) => [...prev, botMsg]);
      addSessionAction({ tool: trimmed, timestamp: Date.now() });
    } catch {
      toast.error("Assistant temporarily unavailable");
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const context = getContext();
    let query = "";

    switch (action) {
      case "compress-help":
        if (context.files.some(f => f.type?.includes('pdf'))) {
          query = "What compression settings should I use for this PDF?";
        } else {
          query = "How do I compress files?";
        }
        break;
      case "merge-help":
        query = "How should I order my PDF files for merging?";
        break;
      case "explain-tool":
        query = `Explain how to use ${selectedOperation || "this tool"}`;
        break;
      case "next-tool":
        query = "What tool should I use next?";
        break;
    }

    if (query) handleSendMessage(query);
  };

  const formatText = (text: string) => {
    return text.split("\n\n").map((paragraph, pIdx) => {
      if (paragraph.startsWith("- ")) {
        return (
          <ul key={pIdx} className="list-disc pl-4 mb-2 space-y-1 text-slate-300 text-xs">
            {paragraph.split("\n").map((li, lIdx) => (
              <li key={lIdx}>{li.replace("- ", "")}</li>
            ))}
          </ul>
        );
      }
      const parts = paragraph.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={pIdx} className="mb-2 text-slate-200 leading-relaxed text-xs">
          {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part))}
        </p>
      );
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          className="fixed bottom-24 right-4 sm:right-6 z-[120] w-[92vw] sm:w-[380px] h-[55vh] sm:h-[480px] rounded-3xl border border-border bg-card/80 backdrop-blur-xl shadow-premium overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{tText("FileNova Assistant")}</h3>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-xl hover:bg-secondary flex items-center justify-center">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-2 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                  m.sender === "user" ? "bg-secondary" : "bg-primary/10"
                }`}>
                  {m.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                </div>
                <div className={`max-w-[75%] rounded-xl p-3 text-xs ${
                  m.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border"
                }`}>
                  {m.sender === "user" ? m.text : formatText(m.text)}
                  {m.followUpTools && m.followUpTools.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border">
                      {m.followUpTools.map((tool) => (
                        <button key={tool} onClick={() => handleSendMessage(`Tell me about ${tool}`)}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition">
                          {tool}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <div className="flex gap-1 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.15s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-border bg-muted/30 flex flex-wrap gap-1.5">
            {PRESET_PROMPTS.map((pr) => (
              <button key={pr.key} onClick={() => handleQuickAction(pr.key)}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] bg-card border border-border hover:border-primary/30 transition">
                <pr.icon className="h-3 w-3" />
                {tText(pr.text)}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputVal); }}
            className="p-3 border-t border-border flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask for help..."
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs"
            />
            <button type="submit" disabled={!inputVal.trim() || isTyping}
              className="h-9 w-9 rounded-lg bg-primary text-primary-foreground disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SmartAssistant;
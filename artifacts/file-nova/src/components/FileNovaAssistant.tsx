/**
 * File Nova Assistant - Interactive AI Helping Bot for Document Processing,
 * Admissions, Fees, and SVMCM Scholarships.
 * Incorporates a premium glassmorphic UI, responsive controls, and active translations.
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  GraduationCap,
  ShieldCheck,
  FileDown,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface FileNovaAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_PROMPTS = [
  { text: "How to mask Aadhaar card?", icon: <ShieldCheck className="h-3 w-3 text-emerald-400" /> },
  { text: "How to compress PDF?", icon: <FileDown className="h-3 w-3 text-amber-400" /> },
  { text: "Crop photo & signature?", icon: <Sparkles className="h-3 w-3 text-indigo-400" /> },
  { text: "Is my data stored securely?", icon: <HelpCircle className="h-3 w-3 text-sky-400" /> }
];

export function FileNovaAssistant({ isOpen, onClose }: FileNovaAssistantProps) {
  const { tText } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Welcome to **FileNova AI Helpdesk**! I'm your **File Nova Assistant**.\n\nI can help you navigate **FileNova's secure browser-based document tools**. Ask me how to mask Aadhaar cards, crop signatures, resize passport photos, compress PDFs, extract text (OCR), compile application ZIP files, or how our privacy-first local processing works! How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      sender: "user",
      text: trimmed,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    try {
      // Build history for context
      const history = messages.slice(-5).map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text
      }));

      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: trimmed,
          history
        })
      });

      if (!res.ok) {
        throw new Error("Failed to communicate with AI");
      }

      const data = await res.json();
      
      const botMsg: Message = {
        id: Math.random().toString(36).substring(7),
        sender: "bot",
        text: data.reply || "I didn't capture that. Could you please rephrase?",
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error("AI Error:", err);
      toast.error("Network latency detected. Reverting to offline compiler knowledge base.");
      
      // Offline fallback reply helper
      const simulatedReply = getOfflineReply(trimmed);
      const botMsg: Message = {
        id: Math.random().toString(36).substring(7),
        sender: "bot",
        text: simulatedReply,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const getOfflineReply = (query: string): string => {
    const low = query.toLowerCase();
    if (low.includes("aadhaar") || low.includes("aadhar") || low.includes("mask")) {
      return "Our **Aadhaar Masking** tool blanks out the first 8 digits of your Aadhaar card for privacy compliance. This runs 100% locally in your browser using canvas APIs; your card is never uploaded to any server. To use it, select it from the Shortcuts or Tools list, upload your image/PDF, draw or auto-redact, and download the masked version.";
    }
    if (low.includes("compress") || low.includes("size") || low.includes("limit") || low.includes("kb")) {
      return "FileNova offers a **PDF Compressor** tool to shrink documents under portal limits (like 100KB or 300KB). You can choose between Low, Medium, or High compression. For images, use the **Passport Photo Resize** tool to scale to exact dimensions and target file sizes.";
    }
    if (low.includes("crop") || low.includes("photo") || low.includes("signature") || low.includes("resize")) {
      return "Use the **Passport Photo Resize** and **Signature Crop** tools in the *Advanced Tools Suite*. They let you adjust aspect ratios, clean up scanning noise, and crop to precise requirements with a live visual preview in our **Editing Window** before saving.";
    }
    if (low.includes("privacy") || low.includes("secure") || low.includes("store") || low.includes("server") || low.includes("save")) {
      return "Privacy is our core principle! All core tools (Aadhaar masking, cropping, image compression) execute **locally in your web browser**. If you use advanced cloud features, files are encrypted in transit, and are immediately deleted from our servers the moment you download them or after 1 hour.";
    }
    if (low.includes("merge") || low.includes("combine") || low.includes("zip") || low.includes("package")) {
      return "You can merge multiple PDFs using our **PDF Merge** tool. If you are preparing scholarship/admission documents, use our **ZIP Compiler** to bundle all required files (marksheet, income certificate, masked ID) into a single optimized ZIP folder.";
    }
    if (low.includes("voice") || low.includes("speech") || low.includes("mic")) {
      return "Click the **Voice** button or mic icon. You can speak commands like *'compress PDF'*, *'mask Aadhaar'*, or *'crop signature'* to instantly trigger and launch the corresponding tool.";
    }
    return "I am the **File Nova Assistant**. I help you use FileNova's secure browser-based tools: Aadhaar masking, PDF compression/merge, passport photo resizing, signature cropping, text OCR, and secure WhatsApp file sharing. Ask me how to use any of these!";
  };

  const formatText = (text: string) => {
    // Process markdown headers and lists beautifully
    return text.split("\n\n").map((paragraph, pIdx) => {
      // List detection
      if (paragraph.startsWith("- ")) {
        return (
          <ul key={pIdx} className="list-disc pl-5 mb-2.5 space-y-1 text-slate-300">
            {paragraph.split("\n").map((li, lIdx) => (
              <li key={lIdx}>{li.replace("- ", "").replace(/\*\*(.*?)\*\*/g, "$1")}</li>
            ))}
          </ul>
        );
      }
      if (paragraph.startsWith("1. ")) {
        return (
          <ol key={pIdx} className="list-decimal pl-5 mb-2.5 space-y-1 text-slate-300">
            {paragraph.split("\n").map((li, lIdx) => (
              <li key={lIdx}>{li.substring(3).replace(/\*\*(.*?)\*\*/g, "$1")}</li>
            ))}
          </ol>
        );
      }
      
      // Inline bold tags (**word**)
      const parts = paragraph.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={pIdx} className="mb-2 text-slate-200 leading-relaxed text-xs">
          {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-white font-extrabold">{part}</strong> : part))}
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
          transition={{ duration: 0.28, ease: "easeOut" }}
          id="filenova-bot-window"
          className="fixed bottom-24 right-4 sm:right-6 z-[120] w-[92vw] sm:w-[410px] h-[60vh] sm:h-[530px] rounded-3xl border border-white/10 bg-slate-950/60 text-white backdrop-blur-2xl shadow-premium overflow-hidden flex flex-col font-sans"
        >
          {/* Header */}
          <div className="p-4 bg-transparent border-b border-white/[0.08] flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/15 shadow-inner">
                <Bot className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white tracking-wide">{tText("File Nova Assistant")}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block -ml-2" />
                  <p className="text-[10px] text-white/80 font-bold">{tText("Online • Ready to help")}</p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition cursor-pointer"
              aria-label="Close assistant"
              title="Close Assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Message log */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 items-start ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold ${
                    m.sender === "user"
                      ? "bg-slate-800 border-slate-700 text-slate-200"
                      : "bg-primary/20 border-primary/35 text-primary"
                  }`}
                >
                  {m.sender === "user" ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
                </div>
                <div className="max-w-[75%] space-y-1">
                  <div
                    className={`rounded-2xl p-3 shadow-panel text-xs ${
                      m.sender === "user"
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-slate-900/90 border border-slate-800"
                    }`}
                  >
                    {m.sender === "user" ? <p>{m.text}</p> : formatText(m.text)}
                  </div>
                  <span className="text-[9px] text-muted-foreground block px-1">
                    {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 text-primary">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 flex items-center gap-1.5 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Preset Prompts Container */}
          <div className="px-4 py-2 border-t border-white/[0.06] bg-slate-950/30 flex flex-wrap gap-1.5 overflow-x-auto select-none">
            {PRESET_PROMPTS.map((pr) => (
              <button
                key={pr.text}
                onClick={() => handleSendMessage(pr.text)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:text-white hover:border-primary/50 transition cursor-pointer shrink-0"
              >
                {pr.icon}
                <span>{tText(pr.text)}</span>
              </button>
            ))}
          </div>

          {/* Chat Form Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputVal);
            }}
            className="p-3 border-t border-white/[0.08] bg-slate-950/50 backdrop-blur-md flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={tText("Type your message…")}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-primary/60 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none placeholder:text-slate-500 transition"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isTyping}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition cursor-pointer"
              aria-label="Send message"
              title="Send Message"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Credit Footer */}
          <div className="bg-slate-950/60 py-1.5 border-t border-white/[0.04] text-center text-[10px] text-slate-500 select-none">
            Powered by AI &bull; {tText("FileNova AI")}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

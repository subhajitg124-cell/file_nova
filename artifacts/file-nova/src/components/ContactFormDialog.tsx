import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { apiClient, HAS_BACKEND } from "@/lib/api";

interface ContactFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
  prefilledEmail?: string;
}

export const ContactFormDialog: React.FC<ContactFormDialogProps> = ({
  isOpen,
  onClose,
  initialSubject = "",
  prefilledEmail = "",
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(prefilledEmail);
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      if (!name.trim()) { setError("Name is required"); setSending(false); return; }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Valid email is required"); setSending(false); return; }
      if (!subject.trim()) { setError("Subject is required"); setSending(false); return; }
      if (!message.trim()) { setError("Message is required"); setSending(false); return; }
      if (message.length > 2000) { setError("Message too long (max 2000 chars)"); setSending(false); return; }

      if (HAS_BACKEND) {
        await apiClient.request("/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
        });
      } else {
        // Fallback: use mailto link
        const mailtoUrl = `mailto:subhajiteditz90@gmail.com?subject=${encodeURIComponent(`[FileNova Contact] ${subject.trim()}`)}&body=${encodeURIComponent(`Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`)}`;
        window.open(mailtoUrl, "_blank");
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSent(false);
    setError("");
    onClose();
  };

  const inputClass = "w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 focus:shadow-glow-sm transition";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Contact FileNova</h2>
                  <p className="text-[11px] text-muted-foreground">We'll get back to you within 24 hours</p>
                </div>
              </div>
              <button onClick={handleClose} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition cursor-pointer" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              {sent ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8 space-y-3">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold text-foreground">Message Sent!</p>
                  <p className="text-xs text-muted-foreground">Thank you for reaching out. We'll get back to you at <span className="font-semibold text-foreground">{email}</span> within 24 hours.</p>
                  <button onClick={handleClose} className="mt-2 px-6 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition cursor-pointer">Done</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1 block">Name *</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} maxLength={100} />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1 block">Email *</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} maxLength={200} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1 block">Subject *</label>
                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" className={inputClass} maxLength={200} />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1 block">Message *</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us more..." rows={4} className={`${inputClass} resize-none`} maxLength={2000} />
                    <p className="text-[10px] text-muted-foreground/60 mt-1 text-right">{message.length}/2000</p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/20">
                      <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                      <p className="text-[11px] text-destructive font-bold">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={sending}
                    className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition cursor-pointer">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactFormDialog;

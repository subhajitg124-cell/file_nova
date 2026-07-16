import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import { Lock, Mail, MessageCircle, MessageSquare, Code2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { ContactFormDialog } from "@/components/ContactFormDialog";

const TelegramSupport: React.FC = () => {
  const { user } = useAuthStore();
  const isProOrHigher = user?.premiumTier === 'pro' || user?.premiumTier === 'elite';

  if (!isProOrHigher) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden transition-all duration-300"
      >
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
          PRO+
        </div>
        <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mb-4 relative">
          <Lock className="h-8 w-8 text-primary/50" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Telegram Support</h3>
        <p className="text-muted-foreground mb-4">Instant support for PRO users</p>
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-sm font-bold text-primary bg-card/80 px-3 py-1 rounded-lg flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Upgrade to PRO for Telegram Support
            </span>
          </div>
          <button
            disabled
            className="block w-full bg-primary/50 text-primary-foreground/50 text-center py-3 rounded-lg font-semibold cursor-not-allowed blur-[1px]"
          >
            Message on Telegram
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-card border border-border hover:border-primary/35 rounded-2xl p-6 relative overflow-hidden transition-all duration-300"
    >
      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
        PRO+
      </div>
      <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mb-4">
        <MessageCircle className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">Telegram Support</h3>
      <p className="text-muted-foreground mb-4">Instant support for PRO users</p>
      <a
        href="https://t.me/filenova_assistant"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-primary text-primary-foreground text-center py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
      >
        Message on Telegram
      </a>
      <p className="text-sm text-muted-foreground mt-2 text-center">
        @filenova_assistant
      </p>
    </motion.div>
  );
};

const WhatsAppSupport: React.FC<{ onContactOpen: () => void }> = ({ onContactOpen }) => {
  const { user } = useAuthStore();
  const isEliteUser = user?.premiumTier === 'elite';

  if (!isEliteUser) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden transition-all duration-300"
      >
        <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          ELITE ONLY
        </div>
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-4 relative">
          <Lock className="h-8 w-8 text-emerald-500/50" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">WhatsApp Support</h3>
        <p className="text-muted-foreground mb-4">Priority support for Elite users</p>
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-sm font-bold text-amber-500 bg-card/80 px-3 py-1 rounded-lg flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Upgrade to Elite for WhatsApp Support
            </span>
          </div>
          <button
            disabled
            className="block w-full bg-emerald-600/50 text-white/50 text-center py-3 rounded-lg font-semibold cursor-not-allowed blur-[1px]"
          >
            Chat on WhatsApp
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="bg-card border border-border hover:border-emerald-500/35 rounded-2xl p-6 relative overflow-hidden transition-all duration-300"
    >
      <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
        ELITE ONLY
      </div>
      <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="h-8 w-8 text-emerald-500" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">WhatsApp Support</h3>
      <p className="text-muted-foreground mb-4">Priority support for Elite users</p>
      <button
        onClick={onContactOpen}
        className="block w-full bg-emerald-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-emerald-500 transition cursor-pointer"
      >
        Chat with us
      </button>
      <p className="text-sm text-muted-foreground mt-2 text-center">
        We'll connect you directly
      </p>
    </motion.div>
  );
};

const Contact: React.FC = () => {
  const [contactOpen, setContactOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans py-12 px-4 relative">
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_60%)] pointer-events-none z-0" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_right,_rgba(168,85,247,0.08),_transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-black text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            We're here to help! Choose your preferred way to connect with the FileNova team.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Email Support */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border hover:border-primary/35 rounded-2xl p-6 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Email Support</h3>
            <p className="text-muted-foreground mb-4">For all users — Free & Premium</p>
            <button
              onClick={() => setContactOpen(true)}
              className="block w-full bg-primary text-primary-foreground text-center py-3 rounded-lg font-semibold hover:bg-primary/90 transition cursor-pointer"
            >
              Send Message
            </button>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              We reply within 24 hours
            </p>
          </motion.div>

          {/* Telegram Support with Premium Gate */}
          <TelegramSupport />

          {/* WhatsApp Support with Premium Gate */}
          <WhatsAppSupport onContactOpen={() => setContactOpen(true)} />
        </div>

        {/* Support Details & Business Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border rounded-2xl p-6 mb-8 text-left"
        >
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">Support & Business Hours</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><strong>Business Hours:</strong> Monday - Saturday (9:00 AM - 8:00 PM IST)</li>
              <li><strong>Email Response Time:</strong> Within 12-24 hours for standard accounts</li>
              <li><strong>Premium Priority:</strong> Instant routing via Telegram & WhatsApp</li>
              <li><strong>Office Location:</strong> West Bengal, India</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">Billing & Template Inquiries</h3>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <li><strong>Payment Queries:</strong> If subscription is delayed, email transaction IDs through the contact form. We resolve all billing checks within 1 hour.</li>
              <li><strong>Portal Presets:</strong> If an Indian portal changes dimensions, contact us to request new layout crops or document compression specifications.</li>
            </ul>
          </div>
        </motion.div>

        {/* Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SocialMediaLinks />
        </motion.div>

        {/* Developer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            Meet the Developer
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              SG
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Subhajit Ghosh</p>
              <p className="text-muted-foreground">Founder & Developer, FileNova</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.instagram.com/subhajit.tells?igsh=MTFqcm1ycDk1OHQ5eA=="
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
              Instagram (Developer)
            </a>
            <a
              href="https://www.facebook.com/share/18ypRATS29/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.236.195 2.236.195v2.46h-1.26c-1.243 0-1.634.771-1.634 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
              Facebook
            </a>
            <a
              href="https://www.linkedin.com/in/subhajit-ghosh-634968349?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M20.447 20.452h-3.554v-5.528c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.746v5.865H9.351V9h3.414v1.561h.046c.747-.145 1.438-.252 2.123-.252 2.292 0 2.895 1.439 2.895 3.317v6.163zM5.337 7.433c-.783 0-1.303-.617-1.303-1.385 0-.771.52-1.384 1.303-1.384.781 0 1.303.613 1.303 1.384 0 .768-.522 1.385-1.303 1.385zm1.777 13.019H3.555V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.207 24 24 23.227 24 22.271V1.729C24 .774 23.203 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </motion.div>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors">
            ← Back to Home
          </Link>
        </div>

        <ContactFormDialog isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      </div>
    </div>
  );
};

export default Contact;

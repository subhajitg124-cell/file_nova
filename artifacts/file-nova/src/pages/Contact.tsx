import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import { Lock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const WhatsAppSupport: React.FC = () => {
  const { user } = useAuthStore();
  const isPremiumUser = user?.premiumTier === 'pro' || user?.premiumTier === 'elite';

  if (!isPremiumUser) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 relative overflow-hidden transition-all duration-300"
      >
        <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
          PREMIUM ONLY
        </div>
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-4 relative">
          <Lock className="h-8 w-8 text-emerald-500/50" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">WhatsApp Support</h3>
        <p className="text-slate-400 mb-4">Priority support for premium users</p>
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-sm font-bold text-yellow-400 bg-slate-900/80 px-3 py-1 rounded-lg">🔒 Premium Feature - Upgrade to Unlock</span>
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
      transition={{ delay: 0.2 }}
      className="bg-slate-900/40 border border-slate-900 hover:border-emerald-500/35 rounded-2xl p-6 relative overflow-hidden transition-all duration-300"
    >
      <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
        PREMIUM ONLY
      </div>
      <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-3xl mb-4">
        💬
      </div>
      <h3 className="text-xl font-bold text-white mb-2">WhatsApp Support</h3>
      <p className="text-slate-400 mb-4">Priority support for premium users</p>
      <a
        href="https://wa.me/919064560741?text=Hi! I am a FileNova Premium user and need assistance with..."
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-emerald-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-emerald-500 transition"
      >
        Chat on WhatsApp
      </a>
      <p className="text-sm text-slate-500 mt-2 text-center">
        +91 9064560741
      </p>
    </motion.div>
  );
};

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-12 px-4 relative">
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_60%)] pointer-events-none z-0" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_right,_rgba(168,85,247,0.08),_transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-black text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            We're here to help! Choose your preferred way to connect with the FileNova team.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Email Support */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/40 border border-slate-900 hover:border-indigo-500/35 rounded-2xl p-6 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center text-3xl mb-4">
              📧
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Email Support</h3>
            <p className="text-slate-400 mb-4">For all users — Free & Premium</p>
            <a
              href="mailto:subhajiteditz90@gmail.com?subject=FileNova Support Request&body=Hi, I need help with..."
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-500 transition"
            >
              Send Email
            </a>
            <p className="text-sm text-slate-500 mt-2 text-center">
              subhajiteditz90@gmail.com
            </p>
          </motion.div>

          {/* WhatsApp Support with Premium Gate */}
          <WhatsAppSupport />
        </div>

        {/* Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SocialMediaLinks />
        </motion.div>

        {/* Developer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-slate-900/40 border border-slate-900 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>👨‍💻</span>
            Meet the Developer
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              SG
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Subhajit Ghosh</p>
              <p className="text-slate-400">Founder & Developer, FileNova</p>
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
                <path d="M12 2.163c3.204 0 3.595.012 4.85.07 1.206.06 2.178.256 2.924.499.875.292 1.554.654 2.29.999.397-.345.78-.707 1.172-1.074a7.954 7.954 0 00-.999-2.29 7.978 7.978 0 00-.499-1.043c-.243-.437-.516-.85-.818-1.245-.301-.396-.643-.764-1.015-1.096-.372-.332-.78-.62-1.217-.885-.437-.265-.91-.468-1.415-.624a7.84 7.84 0 00-1.57-.21C15.638 2.174 15.244 2.163 12 2.163zm0-2.163C8.741 0 8.337.014 7.052.072a10.076 10.076 0 00-2.494.422 10.115 10.115 0 00-2.153 1.012A10.115 10.115 0 000 4.921a10.076 10.076 0 00-.422 2.494C.014 7.663 0 8.068 0 11.327c0 3.259.014 3.663.072 4.948a10.076 10.076 0 00.422 2.494 10.115 10.115 0 001.012 2.153 10.115 10.115 0 001.096 2.153.711.464 1.322.829.384.446.384.97.253 1.485.436 2.173.391.347.306.756.293 1.309.26.5.243.604a7.99 7.99 0 00.915 3.595C2.172 21.401.062 21.818.07 19.617.06 16.422.07 16.03.07 12.837.07 9.592c0-3.245.012-3.636.07-6.831a7.99 7.99 0 00-.26-1.309 7.99 7.99 0 00-.306-.347 7.99 7.99 0 00-.756-.384A7.99 7.99 0 00-.8.436 7.99 7.99 0 00-1.096-.391 7.99 7.99 0 00-1.485-.436 7.99 7.99 0 00-1.8-.422C5.663.014 5.259.0 1.037.0 1zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 00-6.162-6.162zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.882 1.44 1.44 0 00-1.44-1.44z" />
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
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Contact;

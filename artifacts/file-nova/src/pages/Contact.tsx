import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import SocialMediaLinks from "@/components/SocialMediaLinks";

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

          {/* WhatsApp Support */}
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
              className="px-4 py-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              📷 Instagram
            </a>
            <a
              href="https://www.facebook.com/share/18ypRATS29/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              📘 Facebook
            </a>
            <a
              href="https://www.linkedin.com/in/subhajit-ghosh-634968349?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              💼 LinkedIn
            </a>
          </div>
        </motion.div>

        <div className="mt-8 text-center">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              ← Back to Home
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Contact;

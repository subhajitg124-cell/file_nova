import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ShieldCheck, Heart, Users, Target, Rocket, Calendar, Code, Server, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function About() {
  const { tText } = useTranslation();

  const achievements = [
    { icon: <Target className="h-6 w-6 text-indigo-500" />, count: "20K+", label: tText("Active Monthly Users") },
    { icon: <Users className="h-6 w-6 text-emerald-500" />, count: "100K+", label: tText("Documents Processed") },
    { icon: <ShieldCheck className="h-6 w-6 text-amber-500" />, count: "100%", label: tText("Privacy Protected") },
  ];

  const timeline = [
    { year: "2024", title: tText("The Spark"), desc: tText("FileNova was conceived to solve slow government portal submissions for common Indian users.") },
    { year: "2025", title: tText("Local Processing Era"), desc: tText("Migrated heavy PDF tasks directly to the client's browser using WebAssembly to eliminate server uploads.") },
    { year: "2026", title: tText("AI Automation"), desc: tText("Introduced generative features like AI PPT Maker and AI Document Summarizers to boost operator productivity.") },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans py-16 px-4 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_60%)] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.06),_transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <Rocket className="h-3.5 w-3.5" />
            {tText("About FileNova")}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            {tText("India's Premium Document Platform")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            {tText("We build fast, secure, and keyboard-efficient web utilities to help students, cyber café owners, and CSC operators process documents in seconds.")}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {achievements.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card border border-border p-6 rounded-2xl text-center backdrop-blur-md relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-muted border border-border rounded-xl flex items-center justify-center mx-auto mb-4">
                {item.icon}
              </div>
              <h3 className="text-3xl font-black text-foreground mb-1">{item.count}</h3>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border p-8 rounded-3xl"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Target className="h-6 w-6 text-indigo-500" />
              {tText("Our Mission")}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {tText("To democratize premium document processing by providing reliable, watermark-free tools that work entirely locally in the browser. We aim to support everyday Indian digital workers by eliminating steep subscription costs and long server upload queues.")}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border p-8 rounded-3xl"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Heart className="h-6 w-6 text-rose-500" />
              {tText("Our Vision")}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {tText("A secure, digital India where anyone—regardless of internet speed or technical literacy—can format, convert, and protect their certificates, application forms, and ID cards with absolute confidence and zero privacy risk.")}
            </p>
          </motion.div>
        </div>

        {/* Meet the Founder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-tr from-indigo-500/5 via-primary/5 to-emerald-500/5 border border-primary/10 rounded-3xl p-8 mb-16 backdrop-blur-sm"
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            👤 {tText("Meet the Founder")}
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-extrabold shadow-lg shrink-0">
              SG
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Subhajit Ghosh</h3>
              <p className="text-xs text-primary font-bold uppercase tracking-wider mb-3">{tText("Founder & Lead Developer")}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {tText("Subhajit established FileNova to bridge the gap between heavy desktop applications and clunky government portals. By leveraging modern client-side technologies, FileNova provides cyber cafes and CSC kiosks with the speed and reliability they need to serve citizens efficiently.")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Technology Stack & Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Code className="h-6 w-6 text-indigo-500" />
              {tText("Technology Stack")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {tText("We believe in using the fastest, most robust modern frameworks to build efficient client-side interfaces.")}
            </p>
            <ul className="space-y-2 text-sm font-medium text-foreground">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> React + Vite (Fast rendering & bundling)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Radix UI primitives (Accessible, aria-compliant)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> WebAssembly (Client-side fast PDF compilation)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Express + Drizzle ORM (Robust backend & PostgreSQL db)</li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Server className="h-6 w-6 text-emerald-500" />
              {tText("Privacy & Security Commitments")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {tText("FileNova is built on privacy-first principles. We do not sell or store your files.")}
            </p>
            <ul className="space-y-2 text-sm font-medium text-foreground">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Zero Upload options (Tasks run offline in browser)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Automatic delete (Any uploaded file is deleted in 2h)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> SSL 256-bit encryption for all transit files</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> AdSense policy compliant & clean ad layouts</li>
            </ul>
          </motion.div>
        </div>

        {/* Timeline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3 justify-center">
            <Calendar className="h-6 w-6 text-amber-500" />
            {tText("Our Journey")}
          </h2>
          <div className="relative border-l-2 border-border pl-6 space-y-8 ml-4">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[35px] top-1.5 bg-primary text-primary-foreground text-[10px] font-bold py-0.5 px-2 rounded-full border border-background shadow-sm">
                  {item.year}
                </span>
                <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Back Button */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold transition-colors">
            ← {tText("Back to Home")}
          </Link>
        </div>

      </div>
    </div>
  );
}

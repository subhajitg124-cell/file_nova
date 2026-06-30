import React, { useEffect, useMemo, useCallback, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useCommandPalette } from "@/store/useCommandPalette";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/hooks/useTheme";
import {
  Search, Hash, FileText, Image, BrainCircuit, ScanLine, Shield, Settings,
  Palette, Globe, LogOut, Sun, Moon, Contrast, LayoutDashboard, Workflow, BarChart3,
  Bug, Puzzle, ToggleLeft, Package, Zap, Cpu, Database, Route, FlaskConical,
  Activity, Terminal, Home, CreditCard, BookOpen, Mail, Gift, Users, Star,
  Clock, Command as CommandIcon, Sparkles, ChevronRight, PanelLeft, Bot, Code,
  Scissors, FileArchive, RotateCw, Lock, Unlock, IdCard, Fingerprint,
  GraduationCap, FileCheck2, FileUp, type LucideIcon, X, Bell,
} from "lucide-react";
type CmdCategory = 'tool' | 'page' | 'command' | 'developer' | 'setting' | 'blog' | 'workflow';

interface CmdEntry {
  id: string;
  label: string;
  description?: string;
  route?: string;
  action?: () => void;
  icon: LucideIcon;
  category: CmdCategory;
  keywords: string[];
  badge?: string;
}

type TabId = 'all' | 'tools' | 'pages' | 'commands' | 'developer' | 'settings' | 'recent' | 'favorites';

interface TabDef {
  id: TabId;
  label: string;
  icon: LucideIcon;
  requireDev?: boolean;
}

const TABS: TabDef[] = [
  { id: 'all', label: 'All', icon: Hash },
  { id: 'tools', label: 'Tools', icon: FileText },
  { id: 'pages', label: 'Pages', icon: Globe },
  { id: 'commands', label: 'Commands', icon: Terminal },
  { id: 'developer', label: 'Developer', icon: Code, requireDev: true },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'favorites', label: 'Favorites', icon: Star },
];

function buildEntries(
  setLocation: (path: string) => void,
  setTheme: (theme: "dark" | "light" | "contrast") => void,
  theme: string,
  userRole: string | undefined,
  isDev: boolean,
  logout: () => void,
  openAIAssistant: () => void,
): CmdEntry[] {
  const entries: CmdEntry[] = [];

  // ---- Tools ----
  const toolEntries: CmdEntry[] = [
    { id: 'merge-pdf', label: 'Merge PDF', description: 'Combine multiple PDFs into one', route: '/merge-pdf', icon: Hash, category: 'tool', keywords: ['combine', 'join', 'union', 'pdf merge'] },
    { id: 'split-pdf', label: 'Split PDF', description: 'Extract specific pages', route: '/split-pdf', icon: Scissors, category: 'tool', keywords: ['divide', 'extract', 'cut', 'separate'] },
    { id: 'compress-pdf', label: 'Compress PDF', description: 'Reduce PDF file size', route: '/compress-pdf', icon: FileArchive, category: 'tool', keywords: ['reduce', 'shrink', 'optimize', 'small', 'size'] },
    { id: 'rotate-pdf', label: 'Rotate PDF', description: 'Fix page orientation', route: '/rotate-pdf', icon: RotateCw, category: 'tool', keywords: ['orientation', 'turn', 'flip'] },
    { id: 'protect-pdf', label: 'Protect PDF', description: 'Password-lock your PDF', route: '/protect-pdf', icon: Lock, category: 'tool', keywords: ['password', 'secure', 'encrypt', 'lock'] },
    { id: 'unlock-pdf', label: 'Unlock PDF', description: 'Remove PDF password', route: '/unlock-pdf', icon: Unlock, category: 'tool', keywords: ['remove password', 'decrypt', 'unlock', 'open'] },
    { id: 'pdf-to-word', label: 'PDF to Word', description: 'Convert PDF to editable DOCX', route: '/pdf-to-word', icon: FileText, category: 'tool', keywords: ['docx', 'convert', 'document', 'word'] },
    { id: 'word-to-pdf', label: 'Word to PDF', description: 'Convert DOC/DOCX to PDF', route: '/word-to-pdf', icon: FileText, category: 'tool', keywords: ['doc', 'docx', 'convert'] },
    { id: 'pdf-to-jpg', label: 'PDF to JPG', description: 'Convert PDF pages to images', route: '/pdf-to-jpg', icon: Image, category: 'tool', keywords: ['image', 'photo', 'extract', 'jpeg'] },
    { id: 'jpg-to-pdf', label: 'JPG to PDF', description: 'Convert images to PDF', route: '/jpg-to-pdf', icon: Image, category: 'tool', keywords: ['image', 'photo', 'convert', 'picture'] },
    { id: 'compress-image', label: 'Compress Image', description: 'Reduce image file size', route: '/compress-image', icon: Image, category: 'tool', keywords: ['reduce', 'shrink', 'optimize image', 'photo size'] },
    { id: 'resize-image', label: 'Resize Image', description: 'Change image dimensions', route: '/resize-image', icon: Image, category: 'tool', keywords: ['photo', 'dimensions', 'width', 'height', 'scale'] },
    { id: 'resize-photo', label: 'Resize Photo', description: 'Resize photos to spec', route: '/resize-photo', icon: Image, category: 'tool', keywords: ['photo size', 'passport', 'dimensions'] },
    { id: 'ocr', label: 'OCR Scanner', description: 'Extract text from scans', route: '/ocr', icon: ScanLine, category: 'tool', keywords: ['scan', 'text', 'image to text', 'hindi ocr', 'bengali ocr'] },
    { id: 'remove-background', label: 'Remove Background', description: 'AI background removal', route: '/remove-background', icon: Image, category: 'tool', keywords: ['bg remove', 'transparent', 'background eraser', 'cut out'] },
    { id: 'pan-card-resize', label: 'PAN Card Resize', description: 'Exact gov-spec dimensions', route: '/pan-card-resize', icon: IdCard, category: 'tool', keywords: ['pan card', 'nsdl', 'utiitsl', 'pan resize', 'tax'] },
    { id: 'aadhaar-mask-pdf', label: 'Aadhaar Mask PDF', description: 'Hide Aadhaar number safely', route: '/aadhaar-mask-pdf', icon: Fingerprint, category: 'tool', keywords: ['uidai', 'mask', 'redact', 'aadhaar card', 'secure'] },
    { id: 'scholarship-zip', label: 'Scholarship ZIP', description: 'Compile portal ZIPs fast', route: '/scholarship-zip', icon: GraduationCap, category: 'tool', keywords: ['scholarship', 'zip', 'portal', 'documents'] },
    { id: 'government-form-fill', label: 'Govt Form Fill', description: 'Auto-fill common forms', route: '/government-form-fill', icon: FileCheck2, category: 'tool', keywords: ['government', 'form', 'auto-fill', 'portal'] },
    { id: 'compress-pdf-for-upload', label: 'Compress for Upload', description: 'Fit portal upload limits', route: '/compress-pdf-for-upload', icon: FileUp, category: 'tool', keywords: ['upload', 'portal', 'government', 'under 100kb'] },
    { id: 'ai-pdf-summary', label: 'AI PDF Summary', description: 'Summarize PDFs with AI', route: '/ai-pdf-summary', icon: BrainCircuit, category: 'tool', keywords: ['summarize', 'bullet points', 'ai summary', 'gemini'] },
    // { id: 'ai-ppt-maker', label: 'AI PPT Maker', description: 'Generate presentations with AI', route: '/ai-ppt-maker', icon: Presentation, category: 'tool', keywords: ['powerpoint', 'slides', 'presentation', 'ai slides'] },
    { id: 'exam-toolkit', label: 'Exam Toolkit', description: 'Exam preparation tools', route: '/exam-toolkit', icon: GraduationCap, category: 'tool', keywords: ['exam', 'study', 'practice', 'test'] },
    { id: 'compress-doc', label: 'Compress Doc', description: 'Reduce DOC/DOCX file size', route: '/tools/compress-doc', icon: FileArchive, category: 'tool', keywords: ['word', 'reduce', 'office', 'shrink'] },
    { id: 'pdf-annotate', label: 'PDF Annotate', description: 'Add notes to PDFs', route: '/tools/pdf-annotate', icon: FileText, category: 'tool', keywords: ['comment', 'highlight', 'markup', 'note'] },
    { id: 'pdf-sign', label: 'PDF Sign', description: 'Sign PDF documents', route: '/tools/pdf-sign', icon: FileText, category: 'tool', keywords: ['signature', 'sign', 'digital', 'e-sign'] },
    { id: 'passport-photo', label: 'Passport Photo', description: 'Create passport-size photos', route: '/tools/passport-photo', icon: Image, category: 'tool', keywords: ['photo', 'passport', 'visa', 'id photo'] },
    { id: 'watermark', label: 'Watermark PDF', description: 'Add watermarks to documents', route: '/tools/pdf-watermark', icon: FileText, category: 'tool', keywords: ['watermark', 'stamp', 'brand'] },
    { id: 'pdf-to-excel', label: 'PDF to Excel', description: 'Convert PDF tables to Excel', route: '/tools/pdf-to-excel', icon: FileText, category: 'tool', keywords: ['xlsx', 'csv', 'table', 'spreadsheet'] },
    { id: 'pdf-to-pptx', label: 'PDF to PPT', description: 'Convert PDF to PowerPoint', route: '/tools/pdf-to-pptx', icon: FileText, category: 'tool', keywords: ['powerpoint', 'slides', 'presentation'] },
  ];

  for (const t of toolEntries) {
    entries.push(t);
  }

  // ---- Pages ----
  const pageEntries: CmdEntry[] = [
    { id: 'page-home', label: 'Home', description: 'Go to homepage', route: '/', icon: Home, category: 'page', keywords: ['home', 'main', 'start'] },
    { id: 'page-dashboard', label: 'Dashboard', description: 'Your activity overview', route: '/dashboard', icon: LayoutDashboard, category: 'page', keywords: ['dashboard', 'activity', 'overview', 'stats'] },
    { id: 'page-tools', label: 'All Tools', description: 'Browse all document tools', route: '/tools', icon: Hash, category: 'page', keywords: ['all tools', 'browse', 'directory'] },
    { id: 'page-pricing', label: 'Pricing', description: 'View plans & pricing', route: '/pricing', icon: CreditCard, category: 'page', keywords: ['plans', 'pricing', 'premium', 'upgrade', 'pro', 'elite'] },
    { id: 'page-workspace', label: 'Workspace', description: 'Your document workspace', route: '/workspace', icon: PanelLeft, category: 'page', keywords: ['workspace', 'documents', 'files'] },
    { id: 'page-workflows', label: 'Workflows', description: 'Automated document workflows', route: '/workflows', icon: Workflow, category: 'page', keywords: ['workflow', 'automation', 'pipeline'] },
    { id: 'page-blog', label: 'Blog', description: 'Tips, guides & updates', route: '/blog', icon: BookOpen, category: 'page', keywords: ['blog', 'articles', 'guides', 'tips'] },
    { id: 'page-contact', label: 'Contact', description: 'Get in touch with us', route: '/contact', icon: Mail, category: 'page', keywords: ['contact', 'support', 'help', 'email'] },
    { id: 'page-referral', label: 'Referral', description: 'Invite friends & earn rewards', route: '/referral', icon: Gift, category: 'page', keywords: ['refer', 'invite', 'share', 'rewards'] },
    { id: 'page-pdf-tools', label: 'PDF Tools', description: 'All PDF tools in one place', route: '/pdf-tools', icon: FileText, category: 'page', keywords: ['pdf tools', 'pdf'] },
    { id: 'page-image-tools', label: 'Image Tools', description: 'All image editing tools', route: '/image-tools', icon: Image, category: 'page', keywords: ['image tools', 'photo'] },
    { id: 'page-video-tools', label: 'Video Tools', description: 'Video processing tools', route: '/video-tools', icon: FileText, category: 'page', keywords: ['video', 'tools'] },
    { id: 'page-india-tools', label: 'India Tools', description: 'India-specific document tools', route: '/india-tools', icon: Shield, category: 'page', keywords: ['india', 'government', 'aadhaar', 'pan'] },
    { id: 'page-student-offer', label: 'Student Offer', description: 'Special pricing for students', route: '/student-offer', icon: GraduationCap, category: 'page', keywords: ['student', 'discount', 'offer'] },
    { id: 'page-resources', label: 'Resources', description: 'Helpful resources & guides', route: '/resources', icon: BookOpen, category: 'page', keywords: ['resources', 'help', 'guides'] },
    { id: 'page-privacy', label: 'Privacy Policy', description: 'How we handle your data', route: '/privacy', icon: Shield, category: 'page', keywords: ['privacy', 'data', 'gdpr'] },
    { id: 'page-terms', label: 'Terms of Service', description: 'Terms & conditions', route: '/terms', icon: FileText, category: 'page', keywords: ['terms', 'legal', 'conditions'] },
    { id: 'page-premium', label: 'Premium Suite', description: 'Access premium features', route: '/premium-suite', icon: Sparkles, category: 'page', keywords: ['premium', 'suite', 'features'] },
  ];

  for (const p of pageEntries) {
    entries.push(p);
  }

  // ---- Commands ----
  const commandEntries: CmdEntry[] = [
    {
      id: 'cmd-theme-dark',
      label: 'Theme: Dark',
      description: 'Switch to dark theme',
      icon: Moon,
      category: 'command',
      action: () => setTheme('dark'),
      keywords: ['theme', 'dark', 'mode', 'night'],
    },
    {
      id: 'cmd-theme-light',
      label: 'Theme: Light',
      description: 'Switch to light theme',
      icon: Sun,
      category: 'command',
      action: () => setTheme('light'),
      keywords: ['theme', 'light', 'mode', 'day'],
    },
    {
      id: 'cmd-theme-contrast',
      label: 'Theme: High Contrast',
      description: 'Switch to high contrast theme',
      icon: Contrast,
      category: 'command',
      action: () => setTheme('contrast'),
      keywords: ['theme', 'contrast', 'accessibility', 'black'],
    },
    {
      id: 'cmd-lang',
      label: 'Change Language',
      description: 'Switch interface language',
      icon: Globe,
      category: 'command',
      action: () => {},
      keywords: ['language', 'lang', 'hindi', 'bengali', 'translation'],
    },
    {
      id: 'cmd-ai-assistant',
      label: 'Open AI Assistant',
      description: 'Get AI-powered help',
      icon: Bot,
      category: 'command',
      action: openAIAssistant,
      keywords: ['ai', 'assistant', 'help', 'chat', 'bot'],
    },
    {
      id: 'cmd-logout',
      label: 'Log Out',
      description: 'Sign out of your account',
      icon: LogOut,
      category: 'command',
      action: logout,
      keywords: ['logout', 'sign out', 'exit', 'log out'],
    },
    {
      id: 'cmd-upgrade',
      label: 'Upgrade Plan',
      description: 'View premium plans & upgrade',
      route: '/pricing',
      icon: CreditCard,
      category: 'command',
      keywords: ['upgrade', 'premium', 'pro', 'elite', 'plan'],
    },
  ];

  for (const c of commandEntries) {
    entries.push(c);
  }

  // ---- Developer Commands ----
  if (isDev) {
    const devEntries: CmdEntry[] = [
      { id: 'dev-workspace', label: 'Developer Workspace', description: 'Full developer dashboard', route: '/dev', icon: Code, category: 'developer', keywords: ['dev', 'developer', 'dashboard', 'workspace'] },
      { id: 'dev-beta', label: 'Beta Testing Zone', description: 'Test experimental features', route: '/beta-testing', icon: FlaskConical, category: 'developer', keywords: ['beta', 'experimental', 'testing'] },
      { id: 'dev-seo', label: 'SEO Inspector', description: 'Inspect page SEO metadata', icon: Search, category: 'developer', action: () => {}, keywords: ['seo', 'metadata', 'inspect'] },
      { id: 'dev-bundle', label: 'Bundle Analyzer', description: 'Analyze JS bundle size', icon: Package, category: 'developer', action: () => {}, keywords: ['bundle', 'size', 'js', 'analyzer'] },
      { id: 'dev-feature-flags', label: 'Feature Flags', description: 'Toggle feature toggles', icon: ToggleLeft, category: 'developer', action: () => {}, keywords: ['features', 'flags', 'toggles'] },
      { id: 'dev-perf', label: 'Performance Dashboard', description: 'Monitor app performance', icon: Activity, category: 'developer', action: () => {}, keywords: ['performance', 'monitor', 'speed'] },
      { id: 'dev-api', label: 'API Explorer', description: 'Test API endpoints', icon: Terminal, category: 'developer', action: () => {}, keywords: ['api', 'endpoints', 'test'] },
      { id: 'dev-theme-lab', label: 'Theme Lab', description: 'Preview & customize themes', icon: Palette, category: 'developer', action: () => {}, keywords: ['theme', 'preview', 'customize'] },
      { id: 'dev-plugins', label: 'Plugin Manager', description: 'Manage tool plugins', icon: Puzzle, category: 'developer', action: () => {}, keywords: ['plugins', 'extensions', 'addons'] },
      { id: 'dev-errors', label: 'Error Logs', description: 'View application errors', icon: Bug, category: 'developer', action: () => {}, keywords: ['errors', 'logs', 'debug'] },
      { id: 'dev-workers', label: 'Worker Monitor', description: 'Monitor background workers', icon: Cpu, category: 'developer', action: () => {}, keywords: ['workers', 'background', 'jobs'] },
      { id: 'dev-storage', label: 'Storage Inspector', description: 'View localStorage data', icon: Database, category: 'developer', action: () => {}, keywords: ['storage', 'local', 'data'] },
      { id: 'dev-routes', label: 'Route Explorer', description: 'View all app routes', icon: Route, category: 'developer', action: () => {}, keywords: ['routes', 'paths', 'navigation'] },
      { id: 'dev-sitemap', label: 'Sitemap Viewer', description: 'Browse site structure', icon: Globe, category: 'developer', action: () => {}, keywords: ['sitemap', 'structure', 'pages'] },
      { id: 'dev-cache', label: 'Clear Cache', description: 'Clear application cache', icon: Zap, category: 'developer', action: () => {}, keywords: ['cache', 'clear', 'reset'] },
      { id: 'dev-analytics', label: 'Analytics Dashboard', description: 'Usage metrics & trends', icon: BarChart3, category: 'developer', action: () => {}, keywords: ['analytics', 'metrics', 'usage'] },
    ];

    for (const d of devEntries) {
      entries.push(d);
    }
  }

  // ---- Settings ----
  const settingsEntries: CmdEntry[] = [
    { id: 'set-profile', label: 'Profile Settings', description: 'Manage your profile', route: '/profile', icon: Users, category: 'setting', keywords: ['profile', 'name', 'email', 'phone'] },
    { id: 'set-language', label: 'Language', description: 'Change interface language', icon: Globe, category: 'setting', action: () => {}, keywords: ['language', 'lang', 'hindi'] },
    { id: 'set-theme-dark', label: 'Theme: Dark', description: 'Switch to dark theme', icon: Moon, category: 'setting', action: () => setTheme('dark'), keywords: ['theme', 'dark', 'mode', 'night'] },
    { id: 'set-theme-light', label: 'Theme: Light', description: 'Switch to light theme', icon: Sun, category: 'setting', action: () => setTheme('light'), keywords: ['theme', 'light', 'mode', 'day'] },
    { id: 'set-theme-contrast', label: 'Theme: High Contrast', description: 'Switch to high contrast theme', icon: Contrast, category: 'setting', action: () => setTheme('contrast'), keywords: ['theme', 'contrast', 'accessibility', 'black'] },
    { id: 'set-notifications', label: 'Notifications', description: 'View your notifications', route: '/profile', icon: Bell, category: 'setting', keywords: ['notifications', 'alerts', 'bell', 'messages'] },
  ];

  for (const s of settingsEntries) {
    entries.push(s);
  }

  // ---- Blog ----
  const blogEntries: CmdEntry[] = [
    { id: 'blog-compress-pdf', label: 'Blog: Compress PDF Guide', description: 'How to compress PDF files online', route: '/blog/compress-pdf-free-online', icon: BookOpen, category: 'blog', keywords: ['blog', 'compress', 'guide'] },
    { id: 'blog-merge-pdf', label: 'Blog: Merge PDF Guide', description: 'How to merge PDF files online', route: '/blog/merge-pdf-files-online', icon: BookOpen, category: 'blog', keywords: ['blog', 'merge', 'guide'] },
    { id: 'blog-image-to-pdf', label: 'Blog: Image to PDF Guide', description: 'Convert images to PDF on mobile', route: '/blog/image-to-pdf-mobile', icon: BookOpen, category: 'blog', keywords: ['blog', 'image', 'pdf', 'mobile'] },
    { id: 'blog-pdf-tools', label: 'Blog: Free PDF Tools for Students', description: 'Best free PDF tools for Indian students', route: '/blog/free-pdf-tools-students-india', icon: BookOpen, category: 'blog', keywords: ['blog', 'pdf tools', 'students', 'india'] },
    { id: 'blog-aadhaar', label: 'Blog: Aadhaar Masking Guide', description: 'Privacy guide for Aadhaar masking', route: '/blog/aadhaar-masking-privacy-india', icon: BookOpen, category: 'blog', keywords: ['blog', 'aadhaar', 'masking', 'privacy'] },
  ];

  for (const b of blogEntries) {
    entries.push(b);
  }

  return entries;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]) + 1;
    }
  }
  return dp[m][n];
}

const NATURAL_LANG_MAP: Record<string, string[]> = {
  'compress my': ['compress-pdf', 'compress-image', 'compress-pdf-for-upload'],
  'compress a': ['compress-pdf', 'compress-image'],
  'reduce size': ['compress-pdf', 'compress-image'],
  'make smaller': ['compress-pdf', 'compress-image'],
  'shrink': ['compress-pdf', 'compress-image'],
  'merge': ['merge-pdf'],
  'combine': ['merge-pdf'],
  'join': ['merge-pdf'],
  'split': ['split-pdf'],
  'extract': ['split-pdf'],
  'divide': ['split-pdf'],
  'rotate': ['rotate-pdf'],
  'flip': ['rotate-pdf'],
  'turn': ['rotate-pdf'],
  'protect': ['protect-pdf'],
  'password': ['protect-pdf'],
  'lock': ['protect-pdf'],
  'encrypt': ['protect-pdf'],
  'unlock': ['unlock-pdf'],
  'decrypt': ['unlock-pdf'],
  'remove password': ['unlock-pdf'],
  'aadhaar': ['aadhaar-mask-pdf'],
  'hide': ['aadhaar-mask-pdf'],
  'mask': ['aadhaar-mask-pdf'],
  'uidai': ['aadhaar-mask-pdf'],
  'pan': ['pan-card-resize'],
  'pan card': ['pan-card-resize'],
  'pancard': ['pan-card-resize'],
  'nsdl': ['pan-card-resize'],
  'scan': ['ocr'],
  'ocr': ['ocr'],
  'extract text': ['ocr'],
  'image to text': ['ocr'],
  'scholarship': ['scholarship-zip'],
  'resume': ['word-to-pdf', 'pdf-to-word'],
  'sign': ['pdf-sign'],
  'signature': ['pdf-sign'],
  'watermark': ['watermark'],
  'annotate': ['pdf-annotate'],
  'highlight': ['pdf-annotate'],
  'photo': ['passport-photo', 'resize-photo', 'resize-image'],
  'passport': ['passport-photo'],
  'convert to word': ['pdf-to-word'],
  'convert to pdf': ['word-to-pdf', 'jpg-to-pdf'],
  'convert to jpg': ['pdf-to-jpg'],
  'word to pdf': ['word-to-pdf'],
  'pdf to word': ['pdf-to-word'],
  'jpg to pdf': ['jpg-to-pdf'],
  'pdf to jpg': ['pdf-to-jpg'],
  'resize': ['resize-image', 'resize-photo', 'pan-card-resize'],
  'background': ['remove-background'],
  'bg remove': ['remove-background'],
  'transparent': ['remove-background'],
  'ai': ['ai-pdf-summary', 'remove-background'],
  'summarize': ['ai-pdf-summary'],
  'summary': ['ai-pdf-summary'],
  // 'ppt': ['ai-ppt-maker'],
  // 'presentation': ['ai-ppt-maker'],
  // 'powerpoint': ['ai-ppt-maker'],
  // 'slides': ['ai-ppt-maker'],
  'government': ['government-form-fill', 'compress-pdf-for-upload'],
  'portal': ['compress-pdf-for-upload', 'government-form-fill'],
  'form': ['government-form-fill'],
  'exam': ['exam-toolkit'],
  'student': ['student-offer', 'scholarship-zip'],
  'pricing': ['page-pricing'],
  'plans': ['page-pricing'],
  'upgrade': ['page-pricing', 'cmd-upgrade'],
  'premium': ['page-pricing', 'page-premium'],
  'dashboard': ['page-dashboard'],
  'tools': ['page-tools'],
  'blog': ['page-blog', 'blog-compress-pdf', 'blog-merge-pdf'],
  'dark': ['cmd-theme'],
  'light': ['cmd-theme'],
  'theme': ['cmd-theme', 'set-theme'],
  'language': ['cmd-lang', 'set-language'],
  'logout': ['cmd-logout'],
  'sign out': ['cmd-logout'],
  'help': ['cmd-ai-assistant'],
  'developer': ['dev-workspace'],
  'dev': ['dev-workspace'],
};

function smartSearch(query: string, entries: CmdEntry[]): CmdEntry[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return entries;

  const queryWords = trimmed.split(/\s+/).filter(Boolean);

  // 1. Check natural language map
  const matchedIds = new Set<string>();
  for (const [phrase, ids] of Object.entries(NATURAL_LANG_MAP)) {
    if (trimmed.includes(phrase)) {
      for (const id of ids) matchedIds.add(id);
    }
  }

  // 2. Score each entry
  const scored: { entry: CmdEntry; score: number }[] = [];

  for (const entry of entries) {
    let score = 0;
    const searchTargets = [
      entry.label.toLowerCase(),
      entry.id.toLowerCase(),
      ...entry.keywords.map((k) => k.toLowerCase()),
    ];
    if (entry.description) searchTargets.push(entry.description.toLowerCase());

    // Priority boost from NL match
    if (matchedIds.has(entry.id)) {
      score += 50;
    }

    for (const target of searchTargets) {
      // Exact match
      if (target === trimmed) {
        score += 100;
        break;
      }
      // Starts with
      if (target.startsWith(trimmed)) {
        score += 80;
        break;
      }
      // Contains
      if (target.includes(trimmed)) {
        score += 60;
        break;
      }
      // Word match
      for (const word of queryWords) {
        if (target.includes(word)) {
          score += 30;
        }
        // Fuzzy word match (levenshtein <= 2)
        if (word.length >= 3 && target.split(/\s+/).some((tw) => levenshtein(word, tw) <= 2)) {
          score += 20;
        }
      }
    }

    // Favorite boost
    if (entry.id.startsWith('fav:')) {
      score += 15;
    }

    if (score > 0) {
      scored.push({ entry, score });
    }
  }

  // Sort by score descending, then by label length (shorter = better)
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.entry.label.length - b.entry.label.length;
  });

  return scored.slice(0, 20).map((s) => s.entry);
}

function matchQuery(query: string, label: string, description?: string, keywords?: string[]): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const targets = [label.toLowerCase(), ...(keywords || []).map((k) => k.toLowerCase())];
  if (description) targets.push(description.toLowerCase());
  return targets.some((t) => t.includes(q) || q.includes(t) || levenshtein(q.substring(0, Math.min(q.length, 5)), t.substring(0, Math.min(t.length, 5))) <= 2);
}

function getCategoryIcon(cat: CmdCategory): LucideIcon {
  switch (cat) {
    case 'tool': return Hash;
    case 'page': return Globe;
    case 'command': return Terminal;
    case 'developer': return Code;
    case 'setting': return Settings;
    case 'blog': return BookOpen;
    case 'workflow': return Workflow;
    default: return Hash;
  }
}

export function GlobalCommandPalette() {
  const { open, setOpen, recent, favorites, addRecent, toggleFavorite, isFavorite } = useCommandPalette();
  const { user } = useAuthStore();
  const { setTheme, theme } = useTheme();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const isDev = user?.role === 'developer' || user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleOpenAIAssistant = useCallback(() => {
    window.dispatchEvent(new Event('openAIAssistant'));
    setOpen(false);
  }, [setOpen]);

  const handleLogout = useCallback(() => {
    useAuthStore.getState().logout();
    setOpen(false);
    setLocation('/');
  }, [setOpen, setLocation]);

  const entries = useMemo(
    () => buildEntries(setLocation, setTheme, theme, user?.role, isDev, handleLogout, handleOpenAIAssistant),
    [setLocation, setTheme, theme, user?.role, isDev, handleLogout, handleOpenAIAssistant]
  );

  const recentEntries = useMemo(
    () => recent.map((id) => entries.find((e) => e.id === id)).filter(Boolean) as CmdEntry[],
    [recent, entries]
  );

  const favoriteList = useMemo(
    () => favorites.map((id) => entries.find((e) => e.id === id)).filter(Boolean) as CmdEntry[],
    [favorites, entries]
  );

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) {
      if (activeTab === 'recent') return recentEntries;
      if (activeTab === 'favorites') return favoriteList;
      // Show all entries grouped by tab
      let all = entries;
      if (activeTab === 'tools') all = entries.filter((e) => e.category === 'tool');
      else if (activeTab === 'pages') all = entries.filter((e) => e.category === 'page');
      else if (activeTab === 'commands') all = entries.filter((e) => e.category === 'command');
      else if (activeTab === 'developer' && isDev) all = entries.filter((e) => e.category === 'developer');
      else if (activeTab === 'settings') all = entries.filter((e) => e.category === 'setting');
      return all.slice(0, 30);
    }
    return smartSearch(q, entries).slice(0, 20);
  }, [searchQuery, entries, activeTab, isDev, recentEntries, favoriteList]);

  const handleSelect = (entry: CmdEntry) => {
    addRecent(entry.id);
    setOpen(false);
    if (entry.route) {
      setLocation(entry.route);
    } else if (entry.action) {
      entry.action();
    }
  };

  const handleSelectNewTab = (entry: CmdEntry) => {
    addRecent(entry.id);
    setOpen(false);
    if (entry.route) {
      window.open(entry.route, '_blank', 'noopener,noreferrer');
    } else if (entry.action) {
      entry.action();
    }
  };

  const visibleTabs = TABS.filter((tab) => !tab.requireDev || isDev);

  // Keyboard shortcut listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === 'K' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'p' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === '/' && !open && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  // Focus input when opening
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  // Reset tab on close
  useEffect(() => {
    if (!open) setActiveTab('all');
  }, [open]);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={reducedMotion ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-h-[85vh] bg-background rounded-t-2xl border border-border shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <MobileContent
                entries={entries}
                filteredEntries={filteredEntries}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                visibleTabs={visibleTabs}
               handleSelect={handleSelect}
               handleSelectNewTab={handleSelectNewTab}
               isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
                setOpen={setOpen}
                isDev={isDev}
                inputRef={inputRef}
                recentEntries={recentEntries}
                favoriteList={favoriteList}
                reducedMotion={reducedMotion}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[10vh]"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -10 }}
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 350, mass: 0.8 }}
            className="w-full max-w-2xl bg-background/90 backdrop-blur-2xl border border-border/80 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <DesktopContent
              entries={entries}
              filteredEntries={filteredEntries}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              visibleTabs={visibleTabs}
                handleSelect={handleSelect}
                handleSelectNewTab={handleSelectNewTab}
                isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
              setOpen={setOpen}
              isDev={isDev}
              inputRef={inputRef}
              recentEntries={recentEntries}
              favoriteList={favoriteList}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ContentProps {
  entries: CmdEntry[];
  filteredEntries: CmdEntry[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTab: TabId;
  setActiveTab: (t: TabId) => void;
  visibleTabs: TabDef[];
  handleSelect: (entry: CmdEntry) => void;
  handleSelectNewTab: (entry: CmdEntry) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  setOpen: (o: boolean) => void;
  isDev: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  recentEntries: CmdEntry[];
  favoriteList: CmdEntry[];
  reducedMotion?: boolean;
}

function DesktopContent({
  filteredEntries, searchQuery, setSearchQuery, activeTab, setActiveTab, visibleTabs,
  handleSelect, handleSelectNewTab, isFavorite, toggleFavorite, inputRef, entries, recentEntries, favoriteList,
}: ContentProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (listRef.current) {
      setShowScrollTop(listRef.current.scrollTop > 100);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const grouped = useMemo(() => {
    if (searchQuery.trim()) {
      return { Results: filteredEntries };
    }
    if (activeTab === 'recent') {
      const r = filteredEntries.length > 0 ? { Recent: filteredEntries } : {};
      const f = favoriteList.length > 0 ? { Favorites: favoriteList } : {};
      return { ...r, ...f };
    }
    if (activeTab === 'favorites') {
      return filteredEntries.length > 0 ? { Favorites: filteredEntries } : { 'No favorites yet': [] };
    }
    const groups: Record<string, CmdEntry[]> = {};
    for (const entry of filteredEntries) {
      const key = entry.category.charAt(0).toUpperCase() + entry.category.slice(1) + 's';
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    }
    return groups;
  }, [filteredEntries, activeTab, searchQuery, favoriteList]);

  return (
    <>
      {/* Search Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/60">
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search everything — tools, pages, commands..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none border-none"
          aria-label="Search command palette"
        />
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted/50 border border-border/50 rounded-md">
          <CommandIcon className="h-3 w-3" />K
        </kbd>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-0.5 px-4 py-2 border-b border-border/40 overflow-x-auto scrollbar-none"
        role="tablist"
        aria-label="Search categories"
      >
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          let count = 0;
          if (tab.id === 'recent') count = recentEntries.length;
          else if (tab.id === 'favorites') count = favoriteList.length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              {...(isActive ? { "aria-selected": "true" } : { "aria-selected": "false" })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {count > 0 && (
                <span className={`ml-0.5 text-[9px] font-mono ${isActive ? 'text-primary/60' : 'text-muted-foreground/60'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin"
      >
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center" role="status">
            <Search className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold text-foreground">No results found</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Try a different search term or browse categories above
            </p>
          </div>
        ) : null}

        {Object.entries(grouped).map(([groupName, groupEntries]) =>
          groupEntries.length > 0 ? (
            <div key={groupName} className="mb-1">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  {groupName === 'Results' && searchQuery.trim() ? `Results (${groupEntries.length})` : groupName}
                </span>
                <div className="flex-1 h-px bg-border/50" />
              </div>
              <div role="listbox" aria-label={groupName} className="space-y-0.5">
                {groupEntries.map((entry: CmdEntry) => {
                  const Icon = entry.icon;
                  const fav = isFavorite(entry.id);
                  return (
                    <button
                      key={entry.id}
                      onClick={(ev: React.MouseEvent) => { (ev.ctrlKey || ev.metaKey ? handleSelectNewTab : handleSelect)(entry); }}
                      onMouseDown={(ev: React.MouseEvent) => {
                        if (ev.button === 1) {
                          ev.preventDefault();
                          toggleFavorite(entry.id);
                        }
                      }}
                      onContextMenu={(ev: React.MouseEvent) => {
                        ev.preventDefault();
                        toggleFavorite(entry.id);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/60 hover:border-border/60 transition-all border border-transparent group cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
                      role="option"
                      aria-selected="false"
                      tabIndex={0}
                      onKeyDown={(ev: React.KeyboardEvent) => {
                        if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
                          ev.preventDefault();
                          handleSelectNewTab(entry);
                        } else if (ev.key === 'Enter') {
                          handleSelect(entry);
                        } else if (ev.key === ' ') {
                          ev.preventDefault();
                          handleSelect(entry);
                        } else if (ev.key === 'Delete' || ev.key === 'Backspace') {
                          ev.preventDefault();
                          toggleFavorite(entry.id);
                        }
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted/60 border border-border/40 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-foreground/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground truncate">{entry.label}</span>
                          {entry.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                              {entry.badge}
                            </span>
                          )}
                        </div>
                        {entry.description && (
                          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{entry.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(entry.id);
                          }}
                          className={`p-1 rounded-md transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-muted cursor-pointer ${
                            fav ? 'text-amber-400 opacity-100' : 'text-muted-foreground'
                          }`}
                          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
                          role="img"
                        >
                          <Star className={`h-3.5 w-3.5 ${fav ? 'fill-amber-400' : ''}`} />
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-2.5 border-t border-border/40 bg-muted/20">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
          <span className="hidden sm:inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-border/50 bg-muted/50 font-mono text-[9px]">↑↓</kbd> Navigate
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-border/50 bg-muted/50 font-mono text-[9px]">Enter</kbd> Open
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-border/50 bg-muted/50 font-mono text-[9px]">Esc</kbd> Close
          </span>
          <span className="hidden md:inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-border/50 bg-muted/50 font-mono text-[9px]">Tab</kbd> Switch tab
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-border/50 bg-muted/50 font-mono text-[9px]">⌘Enter</kbd> New tab
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-border/50 bg-muted/50 font-mono text-[9px]">⌘K</kbd> Toggle
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary/40" />
          <span className="text-[9px] text-muted-foreground/40 font-mono">
            {filteredEntries.length} results
          </span>
        </div>
      </div>
    </>
  );
}

function MobileContent({
  filteredEntries, searchQuery, setSearchQuery, activeTab, setActiveTab, visibleTabs,
  handleSelect, handleSelectNewTab, isFavorite, toggleFavorite, setOpen, inputRef, recentEntries, favoriteList, reducedMotion,
}: ContentProps) {
  const grouped = useMemo(() => {
    if (searchQuery.trim()) {
      return { Results: filteredEntries };
    }
    if (activeTab === 'recent') {
      const r = filteredEntries.length > 0 ? { Recent: filteredEntries } : {};
      const f = favoriteList.length > 0 ? { Favorites: favoriteList } : {};
      return { ...r, ...f };
    }
    if (activeTab === 'favorites') {
      return filteredEntries.length > 0 ? { Favorites: filteredEntries } : { 'No favorites yet': [] };
    }
    const groups: Record<string, CmdEntry[]> = {};
    for (const entry of filteredEntries) {
      const key = entry.category.charAt(0).toUpperCase() + entry.category.slice(1) + 's';
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    }
    return groups;
  }, [filteredEntries, activeTab, searchQuery, favoriteList]);

  return (
    <>
      {/* Mobile handle */}
      <div className="flex justify-center pt-2 pb-1">
        <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tools, pages..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none border-none"
          aria-label="Search command palette"
        />
        <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-muted cursor-pointer" aria-label="Close">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-none border-b border-border/30">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          let count = 0;
          if (tab.id === 'recent') count = recentEntries.length;
          else if (tab.id === 'favorites') count = favoriteList.length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground border border-transparent'
              }`}
            >
              <Icon className="h-3 w-3" />
              {tab.label}
              {count > 0 && <span className="text-[8px] text-muted-foreground/60">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto py-1 px-2 pb-4">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Search className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs font-semibold text-foreground">No results found</p>
          </div>
        ) : null}
        {Object.entries(grouped).map(([groupName, groupEntries]) =>
          groupEntries.length > 0 ? (
            <div key={groupName} className="mb-1">
              <div className="px-3 py-1.5">
                <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
                  {groupName}
                </span>
              </div>
              {groupEntries.map((entry: CmdEntry) => {
                const Icon = entry.icon;
                const fav = isFavorite(entry.id);
                return (
                  <button
                    key={entry.id}
                    onClick={(ev: React.MouseEvent) => { (ev.ctrlKey || ev.metaKey ? handleSelectNewTab : handleSelect)(entry); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent/50 transition-all cursor-pointer text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-muted/60 border border-border/30 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-foreground/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{entry.label}</div>
                      {entry.description && (
                        <p className="text-[10px] text-muted-foreground/70 truncate">{entry.description}</p>
                      )}
                    </div>
                    <button
                      onClick={(ev: React.MouseEvent) => {
                        ev.stopPropagation();
                        toggleFavorite(entry.id);
                      }}
                      className={`p-1 rounded-md ${fav ? 'text-amber-400' : 'text-muted-foreground'}`}
                      aria-label={fav ? 'Unfavorite' : 'Favorite'}
                    >
                      <Star className={`h-3.5 w-3.5 ${fav ? 'fill-amber-400' : ''}`} />
                    </button>
                  </button>
                );
              })}
            </div>
          ) : null
        )}
      </div>
    </>
  );
}

export function MobileSearchFab() {
  const { open, setOpen } = useCommandPalette();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!isMobile || open) return null;

  return (
    <button
      onClick={() => setOpen(true)}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 active:scale-95 sm:hidden"
      aria-label="Open search"
    >
      <Search className="h-4 w-4" />
      <span className="text-sm font-semibold">Search tools...</span>
    </button>
  );
}

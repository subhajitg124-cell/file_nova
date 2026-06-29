import React, { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Merge, Scissors, FileDown, FileKey, FileUp, HelpCircle, ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function Help() {
  const { tText } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const guides = [
    {
      id: "merge",
      category: "merge",
      title: tText("How to Merge PDF files"),
      icon: <Merge className="h-5 w-5 text-indigo-500" />,
      steps: [
        tText("Navigate to our Merge PDF tool page."),
        tText("Click the upload area or drag and drop up to 5 PDF files you want to combine."),
        tText("Once uploaded, drag and drop the file cards to arrange them in your preferred sequence."),
        tText("Click the 'Merge PDF' button to start client-side/server-side joining."),
        tText("Download your newly consolidated PDF file instantly.")
      ],
      tips: tText("Make sure to check file names before merging to organize your chapters or records easily.")
    },
    {
      id: "compress",
      category: "compress",
      title: tText("How to Compress PDF files"),
      icon: <FileDown className="h-5 w-5 text-emerald-500" />,
      steps: [
        tText("Go to the Compress PDF tool."),
        tText("Upload your PDF file. FileNova supports compression for PDFs up to 50MB."),
        tText("Select your desired compression level: High (smallest size, standard quality) or Medium (moderate size, high quality)."),
        tText("Click 'Compress' to start size optimization."),
        tText("Download the optimized file. The interface will show you the exact percentage size reduction.")
      ],
      tips: tText("Medium compression is recommended for passport applications and government portal uploads to keep images readable.")
    },
    {
      id: "split",
      category: "split",
      title: tText("How to Split PDF files"),
      icon: <Scissors className="h-5 w-5 text-rose-500" />,
      steps: [
        tText("Open the Split PDF tool."),
        tText("Upload the multi-page PDF document you want to extract pages from."),
        tText("Choose your splitting method: 'Split by page range' (e.g., pages 1-3) or 'Extract all pages'."),
        tText("Click 'Split PDF' to execute the page extraction."),
        tText("Download the resulting pages as separate files or a combined ZIP archive.")
      ],
      tips: tText("Use Split PDF to extract specific pages of Aadhaar letters or bank statements before sharing.")
    },
    {
      id: "sign",
      category: "security",
      title: tText("How to Protect or Sign PDF files"),
      icon: <FileKey className="h-5 w-5 text-amber-500" />,
      steps: [
        tText("Navigate to the Protect PDF tool."),
        tText("Upload the PDF document you want to restrict access to."),
        tText("Enter a secure password in the password fields."),
        tText("Click 'Encrypt PDF' to secure the file with 128-bit AES encryption."),
        tText("Download your password-protected PDF file.")
      ],
      tips: tText("Always remember your password as protected files cannot be recovered without it for safety reasons.")
    },
    {
      id: "convert",
      category: "convert",
      title: tText("How to Convert PDF to Word/Image"),
      icon: <FileUp className="h-5 w-5 text-purple-500" />,
      steps: [
        tText("Select 'PDF to Word' or 'PDF to JPG' from our list of conversion tools."),
        tText("Upload your PDF file into the processing zone."),
        tText("Click 'Convert' to trigger our high-fidelity layout reconstruction engine."),
        tText("Download your converted docx or images zip folder once ready.")
      ],
      tips: tText("Our conversion engine retains original tables, styling, and text flows without introducing visual bugs.")
    }
  ];

  const categories = [
    { id: "all", label: tText("All Guides") },
    { id: "merge", label: tText("Merging") },
    { id: "compress", label: tText("Compression") },
    { id: "split", label: tText("Splitting") },
    { id: "security", label: tText("Security & Passwords") },
    { id: "convert", label: tText("Conversion") }
  ];

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = activeCategory === "all" || guide.category === activeCategory;
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          guide.steps.some(step => step.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans py-16 px-4 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 left-0 h-[450px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_65%)] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <BookOpen className="h-3.5 w-3.5" />
            {tText("Help Center")}
          </div>
          <h1 className="text-4xl font-black text-foreground mb-4">
            {tText("How can we help you?")}
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            {tText("Find step-by-step documentation and optimization tips for managing and converting your document files on FileNova.")}
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={tText("Search guides (e.g. 'merge pdf', 'compress quality')...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-2xl py-3.5 pl-12 pr-4 text-sm text-foreground focus:outline-none focus:border-primary/50 shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                activeCategory === cat.id
                  ? "bg-primary border-primary text-primary-foreground shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Guides List */}
        <div className="space-y-6 mb-16">
          <AnimatePresence mode="popLayout">
            {filteredGuides.length > 0 ? (
              filteredGuides.map((guide, idx) => (
                <motion.div
                  key={guide.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-card border border-border rounded-3xl p-6 md:p-8 backdrop-blur-md"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-muted border border-border rounded-xl flex items-center justify-center">
                      {guide.icon}
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{guide.title}</h2>
                  </div>

                  {/* Steps */}
                  <div className="space-y-4 mb-6">
                    {guide.steps.map((step, sIdx) => (
                      <div key={sIdx} className="flex gap-4 items-start">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <p className="text-muted-foreground text-sm leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tip Alert */}
                  {guide.tips && (
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3 items-start">
                      <span className="text-sm">💡</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">{tText("Pro Tip:")}</strong> {guide.tips}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <HelpCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-1">{tText("No guides found")}</h3>
                <p className="text-muted-foreground text-sm">{tText("Try adjusting your keywords or clearing the category filter.")}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold transition-colors">
            ← {tText("Back to Home")}
          </Link>
        </div>

      </div>
    </div>
  );
}

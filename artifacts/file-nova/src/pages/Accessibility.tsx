import React from "react";
import { Link } from "wouter";
import { Accessibility as AccessibilityIcon, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Accessibility: React.FC = () => {
  const { tText } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--fn-bg)] text-[var(--fn-text-primary)] transition-colors duration-300">
      <Navbar showSearch={false} />
      
      <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shadow-glow">
              <AccessibilityIcon className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl mt-4">
              {tText("Accessibility Statement")}
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">
              {tText("Last Updated: June 30, 2026")}
            </p>
          </div>

          <div className="border-t border-border/40 pt-8 space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground">
            
            {/* General Commitment */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">1.</span> {tText("Our Commitment")}
              </h2>
              <p>
                {tText("FileNova is dedicated to making document automation accessible to all users, including students, CSC operators, cyber cafe owners, and individuals with visual, auditory, motor, or cognitive disabilities. We are continuously improving the user experience for everyone and applying the relevant accessibility standards to achieve Level AA compliance under WCAG 2.1 (Web Content Accessibility Guidelines).")}
              </p>
            </section>

            {/* Current Conformity Status */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">2.</span> {tText("Conformance Status")}
              </h2>
              <p>
                {tText("The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. FileNova is partially conformant with WCAG 2.1 Level AA, meaning that some parts of the content do not fully conform to the accessibility standard yet, but we are actively debugging and resolving them.")}
              </p>
            </section>

            {/* Accessibility Features */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">3.</span> {tText("Implemented Features")}
              </h2>
              <p>
                {tText("To make our browser-local workspaces accessible, we have built the following capabilities:")}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div className="p-5 rounded-2xl border border-border bg-background/50 flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground text-sm">{tText("Keyboard-Accessible Navigation")}</h4>
                    <p className="text-xs leading-normal">
                      {tText("All critical navbar menus, popular tools shortcuts, and settings panels can be opened, navigated, and closed using standard keyboard commands (Tab, Enter, Space, Escape).")}
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-background/50 flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground text-sm">{tText("Screen Reader Optimizations")}</h4>
                    <p className="text-xs leading-normal">
                      {tText("Using Radix UI primitives and semantic landmarks, we provide explicit ARIA roles, labels, states, and focus ring styling to assist screen reader users.")}
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-background/50 flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground text-sm">{tText("Contrast Alignment")}</h4>
                    <p className="text-xs leading-normal">
                      {tText("We have raised contrast ratios for tertiary text labels, placeholders, and interactive status chips to align with Level AA requirements in both light and dark themes.")}
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-background/50 flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground text-sm">{tText("No Distracting Animations")}</h4>
                    <p className="text-xs leading-normal">
                      {tText("FileNova respects the system setting for reduced motion. All micro-animations and panel transitions are automatically scaled down or disabled.")}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Known Limitations */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">4.</span> {tText("Known Limitations")}
              </h2>
              <p>
                {tText("Despite our best efforts, some elements of our document workspaces might have accessibility limitations. These can include:")}
              </p>
              <ul className="list-disc pl-6 space-y-2 font-medium">
                <li>
                  <strong className="text-foreground">{tText("Canvas and Image Previews:")}</strong> {tText(" In image cropping, Aadhaar masking, and signature draw boxes, content is rendered inside HTML Canvas elements. Screen readers cannot describe visual changes in real-time. We are looking into alternative text output readbacks.")}
                </li>
                <li>
                  <strong className="text-foreground">{tText("Dynamic Drag and Drop:")}</strong> {tText(" Dragging files to reorder merge priority is easier with a mouse. We provide fallback keyboard list order buttons, but they are still undergoing refinement.")}
                </li>
              </ul>
            </section>

            {/* Grievance & Feedback */}
            <section className="space-y-4 pt-4 border-t border-border/40">
              <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-base">
                  <AlertCircle className="h-5 w-5" />
                  <h3>{tText("Have Accessibility Feedback?")}</h3>
                </div>
                <p className="text-sm font-medium">
                  {tText("We welcome your feedback on FileNova's accessibility. If you run into issues filling out forms, resizing documents, or downloading output packs, please write to us. We will address accessibility gaps in our updates.")}
                </p>
                <div className="flex items-center gap-2 pt-2 text-indigo-400 font-bold text-xs">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:subhajiteditz90@gmail.com" className="hover:underline">subhajiteditz90@gmail.com</a>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Accessibility;

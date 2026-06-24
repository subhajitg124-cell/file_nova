import React from "react";
import { Link } from "wouter";
import { AlertTriangle, Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6 bg-mesh relative font-sans">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-card border border-border/80 rounded-3xl shadow-premium p-8 text-center space-y-6 relative animate-scale-in">
        <div className="mx-auto h-16 w-16 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex items-center justify-center animate-float-sm">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-foreground">404 - Page Not Found</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The page you are looking for doesn't exist, was removed, or had its route path updated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background hover:bg-muted py-3 text-xs font-bold text-foreground transition cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            href="/premium"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-black text-primary-foreground shadow-glow transition hover:opacity-90 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            Try Our Tools
          </Link>
        </div>
      </div>
    </main>
  );
}

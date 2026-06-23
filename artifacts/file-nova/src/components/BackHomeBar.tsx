import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export function BackHomeBar() {
  return (
    <Link
      href="/"
      className="fn-glass rounded-full px-4 py-2 text-sm text-[var(--fn-text-primary)] hover:bg-[var(--fn-surface-elevated)] transition-colors flex items-center gap-2 cursor-pointer font-medium select-none w-fit"
    >
      <ArrowLeft className="h-4 w-4" />
      Home
    </Link>
  );
}

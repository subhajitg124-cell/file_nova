import React from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { Lock } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const socialLinks = [
  {
    platform: "Instagram (Developer)",
    username: "@subhajit.tells",
    url: "https://www.instagram.com/subhajit.tells?igsh=MTFqcm1ycDk1OHQ5eA==",
    color: "from-[#f58529] via-[#dd2a7b] to-[#8134af]",
    label: "Developer Instagram",
    iconSvg: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    requiresTier: null,
  },
  {
    platform: "Instagram (Website)",
    username: "@filenova.in",
    url: "https://www.instagram.com/filenova.in?igsh=MWt2NG1udjRyZXlnYg==",
    color: "from-[#f58529] via-[#dd2a7b] to-[#8134af]",
    label: "FileNova Instagram",
    iconSvg: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    requiresTier: null,
  },
  {
    platform: "Facebook",
    username: "Subhajit Ghosh",
    url: "https://www.facebook.com/share/18ypRATS29/",
    color: "from-[#1877F2] to-[#1877F2]",
    label: "Facebook Profile",
    iconSvg: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h2V2h-3c-3 0-4 2-4 4v2z" />
      </svg>
    ),
    requiresTier: null,
  },
  {
    platform: "LinkedIn",
    username: "Subhajit Ghosh",
    url: "https://www.linkedin.com/in/subhajit-ghosh-634968349?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    color: "from-[#0077B5] to-[#0077B5]",
    label: "LinkedIn Profile",
    iconSvg: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M20.447 20.452h-3.554v-5.528c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.746v5.865H9.351V9h3.414v1.561h.046c.747-.145 1.438-.252 2.123-.252 2.292 0 2.895 1.439 2.895 3.317v6.163zM5.337 7.433c-.783 0-1.303-.617-1.303-1.385 0-.771.52-1.384 1.303-1.384.781 0 1.303.613 1.303 1.384 0 .768-.522 1.385-1.303 1.385zm1.777 13.019H3.555V9h3.554v11.452z" />
      </svg>
    ),
    requiresTier: null,
  },
  {
    platform: "Telegram Support",
    username: "@filenova_assistant",
    url: "https://t.me/filenova_assistant",
    color: "from-[#229ED9] to-[#229ED9]",
    label: "Telegram Support (PRO+)",
    iconSvg: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M21.9 2.19a1 1 0 0 0-.99-.08l-19 8a1 1 0 0 0-.1 1.82l4.9 2.2 2.9 6.8a1 1 0 0 0 1.87-.1l2.2-5.1 5.4 3.9a1 1 0 0 0 1.56-.6l3.5-16.5a1 1 0 0 0-.34-.94zM7.77 13.06l9.66-5.76-7.38 7.38v2.7z" />
      </svg>
    ),
    requiresTier: "pro",
  },
];

export function SocialMediaLinks() {
  const { user } = useAuthStore();
  const { tText } = useTranslation();
  const isProOrHigher = user?.premiumTier === 'pro' || user?.premiumTier === 'elite';

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
      <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
        <span>🌐</span>
        {tText("Connect With Us")}
      </h3>

      <div className="flex flex-col gap-3">
        {socialLinks.map((link, index) => {
          const isLocked = link.requiresTier && !isProOrHigher;
          
          return (
            <motion.a
              key={index}
              href={isLocked ? undefined : link.url}
              target={isLocked ? undefined : "_blank"}
              rel={isLocked ? undefined : "noopener noreferrer"}
              whileHover={isLocked ? {} : { scale: 1.02, x: 4 }}
              className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/40 transition-colors duration-200 relative group min-w-0 ${isLocked ? "opacity-60 cursor-pointer" : "cursor-pointer"}`}
            >
              {/* Rounded Square Icon matching attached reference images */}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${link.color} flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-black/20 group-hover:scale-105 transition duration-200`}>
                {link.iconSvg}
              </div>

              {/* Text detail placed horizontally to prevent squishing and overflow */}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-200 text-xs truncate leading-tight">{tText(link.platform)}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5 leading-none">{link.username}</p>
              </div>

              {link.requiresTier && (
                <span className="text-[9px] bg-yellow-400 text-gray-900 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0">
                  PRO+
                </span>
              )}

              {isLocked && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/50">
                  <Lock className="h-3 w-3 text-yellow-400" />
                </div>
              )}
            </motion.a>
          );
        })}
      </div>

      <p className="mt-4 text-[10px] text-slate-500 text-center font-medium">
        {tText("Follow us for updates, tips & tricks! 🚀")}
      </p>
    </div>
  );
}

export default SocialMediaLinks;

import React from "react";
import { Link } from "wouter";
import SocialMediaLinks from "./SocialMediaLinks";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "@/lib/i18n";
import { createUpiLink } from "@/lib/upi";
import { UpiSupportModal } from "./UpiSupportModal";

const TelegramContact: React.FC = () => {
  const { user } = useAuthStore();
  const { tText } = useTranslation();
  const isProOrHigher = user?.premiumTier === 'pro' || user?.premiumTier === 'elite';

  if (!isProOrHigher) {
    return (
      <li className="flex items-center gap-2">
        <span>📱</span>
        <span className="text-slate-500">{tText("Telegram:")} </span>
        <span className="text-slate-500">🔒 {tText("Upgrade to PRO")}</span>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2">
      <span>📱</span>
      <a
        href="https://t.me/filenova_assistant"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-indigo-400 transition-colors"
      >
        Telegram: @filenova_assistant
      </a>
    </li>
  );
};

const WhatsAppContact: React.FC = () => {
  const { user } = useAuthStore();
  const { tText } = useTranslation();
  const isEliteUser = user?.premiumTier === 'elite';

  if (!isEliteUser) {
    return (
      <li className="flex items-center gap-2">
        <span>💬</span>
        <span className="text-slate-500">{tText("WhatsApp:")} </span>
        <span className="text-slate-500">🔒 {tText("Upgrade to Elite")}</span>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2">
      <span>💬</span>
      <a
        href="https://wa.me/919064560741?text=Hi! I am a FileNova Elite user and need assistance with..."
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-indigo-400 transition-colors"
      >
        WhatsApp: +91 9064560741
      </a>
      <span className="text-xs bg-yellow-400 text-gray-900 px-2 py-0.5 rounded font-semibold">
        Elite
      </span>
    </li>
  );
};

const Footer: React.FC = () => {
  const { tText } = useTranslation();
  const [upiOpen, setUpiOpen] = React.useState(false);
  const [upiAmount, setUpiAmount] = React.useState(10);
  const [upiNote, setUpiNote] = React.useState("Chai for FileNova");

  const triggerUpi = (e: React.MouseEvent, amount: number, note: string) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      e.preventDefault();
      setUpiAmount(amount);
      setUpiNote(note);
      setUpiOpen(true);
    }
  };

  return (
    <footer className="bg-slate-900 text-white relative z-10">
      <div className="max-w-6xl mx-auto px-4 py-16">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="FileNova" className="w-9 h-9 rounded-xl" />
              <span className="text-white font-bold text-lg">FileNova</span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              {tText("India's most trusted document automation platform.")}
              <br />
              {tText("Made with ❤️ for students & CSC operators.")}
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/filenova.in?igsh=MWt2NG1udjRyZXlnYg=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] rounded-xl flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25 transition duration-300"
                title="FileNova Instagram"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/share/18ypRATS29/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#1877F2] rounded-xl flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-[#1877F2]/25 transition duration-300"
                title="Facebook"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-white">
                  <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h2V2h-3c-3 0-4 2-4 4v2z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/subhajit-ghosh-634968349?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#0077B5] rounded-xl flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-[#0077B5]/25 transition duration-300"
                title="LinkedIn"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-white">
                  <path d="M20.447 20.452h-3.554v-5.528c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.746v5.865H9.351V9h3.414v1.561h.046c.747-.145 1.438-.252 2.123-.252 2.292 0 2.895 1.439 2.895 3.317v6.163zM5.337 7.433c-.783 0-1.303-.617-1.303-1.385 0-.771.52-1.384 1.303-1.384.781 0 1.303.613 1.303 1.384 0 .768-.522 1.385-1.303 1.385zm1.777 13.019H3.555V9h3.554v11.452z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">{tText("Quick Links")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tools" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  {tText("All Tools")}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  {tText("Pricing")}
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  {tText("Resources")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  {tText("Contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn & Earn */}
          <div>
            <h4 className="font-semibold mb-4 text-white">{tText("Resources & Blog")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  {tText("Latest Blog & News")}
                </Link>
              </li>
              <li>
                <Link href="/referral" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  {tText("Referral Program")}
                </Link>
              </li>
              <li>
                <Link href="/student-offer" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  {tText("Student Offers")}
                </Link>
              </li>
            </ul>
          </div>


          {/* Contact & Social */}
          <div>
            <h4 className="font-semibold mb-4 text-white">{tText("Contact & Support")}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span>📧</span>
                <a
                  href="mailto:subhajiteditz90@gmail.com"
                  className="hover:text-indigo-400 transition-colors"
                >
                  subhajiteditz90@gmail.com
                </a>
              </li>
              <TelegramContact />
              <WhatsAppContact />
            </ul>

            <div className="mt-4">
              <SocialMediaLinks />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} FileNova.in - All rights reserved</p>
          <p className="mt-2">
            Made with ❤️ by <span className="text-purple-400">Subhajit Ghosh</span>
          </p>
          
          <div className="mt-6 flex flex-col items-center justify-center gap-3">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{tText("Support FileNova Development")}</p>
            <div className="flex gap-4">
              <a
                href={createUpiLink(10, "Chai for FileNova")}
                onClick={(e) => triggerUpi(e, 10, "Chai for FileNova")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-lg transition duration-200 transform hover:scale-105 active:scale-95"
              >
                {tText("☕ Chai (₹10)")}
              </a>
              <a
                href={createUpiLink(50, "Support FileNova")}
                onClick={(e) => triggerUpi(e, 50, "Support FileNova")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-650 text-white rounded-xl text-xs font-black shadow-lg transition duration-200 transform hover:scale-105 active:scale-95 border border-indigo-500/20"
              >
                {tText("💖 Support (₹50)")}
              </a>
            </div>
          </div>

          <UpiSupportModal
            isOpen={upiOpen}
            onClose={() => setUpiOpen(false)}
            amount={upiAmount}
            note={upiNote}
          />

          <div className="flex justify-center gap-4 mt-6 text-xs flex-wrap">
            <Link href="/privacy" className="hover:text-white transition-colors">
              {tText("Privacy Policy")}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {tText("Terms of Service")}
            </Link>
            <Link href="/cookie-policy" className="hover:text-white transition-colors">
              {tText("Cookie Policy")}
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              {tText("Contact Us")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
export default Footer;

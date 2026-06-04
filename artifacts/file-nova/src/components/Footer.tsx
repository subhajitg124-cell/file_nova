import React from "react";
import { Link } from "wouter";
import SocialMediaLinks from "./SocialMediaLinks";
import { useAuthStore } from "@/store/useAuthStore";

const WhatsAppContact: React.FC = () => {
  const { user } = useAuthStore();
  const isPremiumUser = user?.premiumTier === 'pro' || user?.premiumTier === 'elite';

  if (!isPremiumUser) {
    return (
      <li className="flex items-center gap-2">
        <span>💬</span>
        <span className="text-slate-500">WhatsApp: </span>
        <span className="text-slate-500">🔒 Premium Feature - Upgrade to Unlock</span>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2">
      <span>💬</span>
      <a
        href="https://wa.me/919064560741?text=Hi! I am a FileNova Premium user and need assistance with..."
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-indigo-400 transition-colors"
      >
        WhatsApp: +91 9064560741
      </a>
      <span className="text-xs bg-yellow-400 text-gray-900 px-2 py-0.5 rounded font-semibold">
        Premium
      </span>
    </li>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white relative z-10">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">
                FN
              </div>
              <span className="text-2xl font-bold">FileNova</span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              India's most trusted document automation platform.
              Made with ❤️ for students & CSC operators.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/subhajit.tells?igsh=MTFqcm1ycDk1OHQ5eA=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-full flex items-center justify-center hover:scale-110 transition"
                title="Developer Instagram"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M12 2.163c3.204 0 3.595.012 4.85.07 1.206.06 2.178.256 2.924.499.875.292 1.554.654 2.29.999.397-.345.78-.707 1.172-1.074a7.954 7.954 0 00-.999-2.29 7.978 7.978 0 00-.499-1.043c-.243-.437-.516-.85-.818-1.245-.301-.396-.643-.764-1.015-1.096-.372-.332-.78-.62-1.217-.885-.437-.265-.91-.468-1.415-.624a7.84 7.84 0 00-1.57-.21C15.638 2.174 15.244 2.163 12 2.163zm0-2.163C8.741 0 8.337.014 7.052.072a10.076 10.076 0 00-2.494.422 10.115 10.115 0 00-2.153 1.012A10.115 10.115 0 000 4.921a10.076 10.076 0 00.422 2.494C.014 7.663 0 8.068 0 11.327c0 3.259.014 3.663.072 4.948a10.076 10.076 0 00.422 2.494 10.115 10.115 0 001.012 2.153 10.115 10.115 0 001.096 2.153.711.464 1.322.829.384.446.384.97.253 1.485.436 2.173.391.347.306.756.293 1.309.26.5.243.604a7.99 7.99 0 00.915 3.595C2.172 21.401.062 21.818.07 19.617.06 16.422.07 16.03.07 12.837.07 9.592c0-3.245.012-3.636.07-6.831a7.99 7.99 0 00-.26-1.309 7.99 7.99 0 00-.306-.347 7.99 7.99 0 00-.756-.384A7.99 7.99 0 00-.8.436 7.99 7.99 0 00-1.096-.391 7.99 7.99 0 00-1.485-.436 7.99 7.99 0 00-1.8-.422C5.663.014 5.259.0 1.037.0 1zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 00-6.162-6.162zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.882 1.44 1.44 0 00-1.44-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/filenova.in?igsh=MWt2NG1udjRyZXlnYg=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-full flex items-center justify-center hover:scale-110 transition"
                title="FileNova Instagram"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M12 2.163c3.204 0 3.595.012 4.85.07 1.206.06 2.178.256 2.924.499.875.292 1.554.654 2.29.999.397-.345.78-.707 1.172-1.074a7.954 7.954 0 00-.999-2.29 7.978 7.978 0 00-.499-1.043c-.243-.437-.516-.85-.818-1.245-.301-.396-.643-.764-1.015-1.096-.372-.332-.78-.62-1.217-.885-.437-.265-.91-.468-1.415-.624a7.84 7.84 0 00-1.57-.21C15.638 2.174 15.244 2.163 12 2.163zm0-2.163C8.741 0 8.337.014 7.052.072a10.076 10.076 0 00-2.494.422 10.115 10.115 0 00-2.153 1.012A10.115 10.115 0 000 4.921a10.076 10.076 0 00.422 2.494C.014 7.663 0 8.068 0 11.327c0 3.259.014 3.663.072 4.948a10.076 10.076 0 00.422 2.494 10.115 10.115 0 001.012 2.153 10.115 10.115 0 001.096 2.153.711.464 1.322.829.384.446.384.97.253 1.485.436 2.173.391.347.306.756.293 1.309.26.5.243.604a7.99 7.99 0 00.915 3.595C2.172 21.401.062 21.818.07 19.617.06 16.422.07 16.03.07 12.837.07 9.592c0-3.245.012-3.636.07-6.831a7.99 7.99 0 00-.26-1.309 7.99 7.99 0 00-.306-.347 7.99 7.99 0 00-.756-.384A7.99 7.99 0 00-.8.436 7.99 7.99 0 00-1.096-.391 7.99 7.99 0 00-1.485-.436 7.99 7.99 0 00-1.8-.422C5.663.014 5.259.0 1.037.0 1zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 00-6.162-6.162zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.882 1.44 1.44 0 00-1.44-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/share/18ypRATS29/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition"
                title="Facebook"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.236.195 2.236.195v2.46h-1.26c-1.243 0-1.634.771-1.634 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/subhajit-ghosh-634968349?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:scale-110 transition"
                title="LinkedIn"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M20.447 20.452h-3.554v-5.528c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.746v5.865H9.351V9h3.414v1.561h.046c.747-.145 1.438-.252 2.123-.252 2.292 0 2.895 1.439 2.895 3.317v6.163zM5.337 7.433c-.783 0-1.303-.617-1.303-1.385 0-.771.52-1.384 1.303-1.384.781 0 1.303.613 1.303 1.384 0 .768-.522 1.385-1.303 1.385zm1.777 13.019H3.555V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.207 24 24 23.227 24 22.271V1.729C24 .774 23.203 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tools">
                  <a className="text-slate-400 hover:text-indigo-400 transition-colors">All Tools</a>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <a className="text-slate-400 hover:text-indigo-400 transition-colors">Pricing</a>
                </Link>
              </li>
              <li>
                <Link href="/resources">
                  <a className="text-slate-400 hover:text-indigo-400 transition-colors">Resources</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-slate-400 hover:text-indigo-400 transition-colors">Contact</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Popular Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tools/pdf-merge">
                  <a className="text-slate-400 hover:text-indigo-400 transition-colors">Merge PDF</a>
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf-compress">
                  <a className="text-slate-400 hover:text-indigo-400 transition-colors">Compress PDF</a>
                </Link>
              </li>
              <li>
                <Link href="/tools/image-resize">
                  <a className="text-slate-400 hover:text-indigo-400 transition-colors">Resize Photo</a>
                </Link>
              </li>
              <li>
                <Link href="/tools/scholarship-zip">
                  <a className="text-slate-400 hover:text-indigo-400 transition-colors">Scholarship ZIP</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Contact & Support</h4>
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
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Support FileNova Development</p>
            <div className="flex gap-4">
              <a
                href="upi://pay?pa=subhajitgho123-1@oksbi&pn=Subhajit%20Ghosh&am=10&cu=INR&tn=Buy%20Chai"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-lg transition duration-200 transform hover:scale-105 active:scale-95"
              >
                ☕ Chai (₹10)
              </a>
              <a
                href="upi://pay?pa=subhajitgho123-1@oksbi&pn=Subhajit%20Ghosh&am=50&cu=INR&tn=Support%20FileNova"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-650 text-white rounded-xl text-xs font-black shadow-lg transition duration-200 transform hover:scale-105 active:scale-95 border border-indigo-500/20"
              >
                💖 Support (₹50)
              </a>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6 text-xs flex-wrap">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <Link href="/contact">
              <a className="hover:text-white transition-colors">Contact Us</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
export default Footer;

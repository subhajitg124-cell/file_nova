import React from "react";
import { Link } from "wouter";
import SocialMediaLinks from "./SocialMediaLinks";

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
                className="w-10 h-10 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-full flex items-center justify-center hover:scale-110 transition text-lg"
                title="Developer Instagram"
              >
                📷
              </a>
              <a
                href="https://www.instagram.com/filenova.in?igsh=MWt2NG1udjRyZXlnYg=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-full flex items-center justify-center hover:scale-110 transition text-lg"
                title="FileNova Instagram"
              >
                📷
              </a>
              <a
                href="https://www.facebook.com/share/18ypRATS29/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition text-lg"
                title="Facebook"
              >
                📘
              </a>
              <a
                href="https://www.linkedin.com/in/subhajit-ghosh-634968349?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:scale-110 transition text-lg"
                title="LinkedIn"
              >
                💼
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
              <li className="flex items-center gap-2">
                <span>💬</span>
                <span>WhatsApp: +91 9064560741</span>
                <span className="text-xs bg-yellow-400 text-gray-900 px-2 py-0.5 rounded font-semibold">
                  Premium
                </span>
              </li>
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

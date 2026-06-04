import React from "react";
import { motion } from "framer-motion";

const socialLinks = [
  {
    platform: "Instagram (Developer)",
    username: "@subhajit.tells",
    url: "https://www.instagram.com/subhajit.tells?igsh=MTFqcm1ycDk1OHQ5eA==",
    color: "from-pink-500 via-red-500 to-yellow-500",
    label: "Developer Instagram",
    iconSvg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M12 2.163c3.204 0 3.595.012 4.85.07 1.206.06 2.178.256 2.924.499.875.292 1.554.654 2.29.999.397-.345.78-.707 1.172-1.074a7.954 7.954 0 00-.999-2.29 7.978 7.978 0 00-.499-1.043c-.243-.437-.516-.85-.818-1.245-.301-.396-.643-.764-1.015-1.096-.372-.332-.78-.62-1.217-.885-.437-.265-.91-.468-1.415-.624a7.84 7.84 0 00-1.57-.21C15.638 2.174 15.244 2.163 12 2.163zm0-2.163C8.741 0 8.337.014 7.052.072a10.076 10.076 0 00-2.494.422 10.115 10.115 0 00-2.153 1.012A10.115 10.115 0 000 4.921a10.076 10.076 0 00-.422 2.494C.014 7.663 0 8.068 0 11.327c0 3.259.014 3.663.072 4.948a10.076 10.076 0 00.422 2.494 10.115 10.115 0 001.012 2.153 10.115 10.115 0 001.096 2.153.711.464 1.322.829.384.446.384.97.253 1.485.436 2.173.391.347.306.756.293 1.309.26.5.243.604a7.99 7.99 0 00.915 3.595C2.172 21.401.062 21.818.07 19.617.06 16.422.07 16.03.07 12.837.07 9.592c0-3.245.012-3.636.07-6.831a7.99 7.99 0 00-.26-1.309 7.99 7.99 0 00-.306-.347 7.99 7.99 0 00-.756-.384A7.99 7.99 0 00-1.485-.436 7.99 7.99 0 00-2.173-.391 7.99 7.99 0 00-2.494-.422C5.663.014 5.259.0 1.037.0 1zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 00-6.162-6.162zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.882 1.44 1.44 0 00-1.44-1.44z" />
      </svg>
    ),
  },
  {
    platform: "Instagram (Website)",
    username: "@filenova.in",
    url: "https://www.instagram.com/filenova.in?igsh=MWt2NG1udjRyZXlnYg==",
    color: "from-pink-500 via-red-500 to-yellow-500",
    label: "FileNova Instagram",
    iconSvg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M12 2.163c3.204 0 3.595.012 4.85.07 1.206.06 2.178.256 2.924.499.875.292 1.554.654 2.29.999.397-.345.78-.707 1.172-1.074a7.954 7.954 0 00-.999-2.29 7.978 7.978 0 00-.499-1.043c-.243-.437-.516-.85-.818-1.245-.301-.396-.643-.764-1.015-1.096-.372-.332-.78-.62-1.217-.885-.437-.265-.91-.468-1.415-.624a7.84 7.84 0 00-1.57-.21C15.638 2.174 15.244 2.163 12 2.163zm0-2.163C8.741 0 8.337.014 7.052.072a10.076 10.076 0 00-2.494.422 10.115 10.115 0 00-2.153 1.012A10.115 10.115 0 000 4.921a10.076 10.076 0 00-.422 2.494C.014 7.663 0 8.068 0 11.327c0 3.259.014 3.663.072 4.948a10.076 10.076 0 00.422 2.494 10.115 10.115 0 001.012 2.153 10.115 10.115 0 001.096 2.153.711.464 1.322.829.384.446.384.97.253 1.485.436 2.173.391.347.306.756.293 1.309.26.5.243.604a7.99 7.99 0 00.915 3.595C2.172 21.401.062 21.818.07 19.617.06 16.422.07 16.03.07 12.837.07 9.592c0-3.245.012-3.636.07-6.831a7.99 7.99 0 00-.26-1.309 7.99 7.99 0 00-.306-.347 7.99 7.99 0 00-.756-.384A7.99 7.99 0 00-1.485-.436 7.99 7.99 0 00-2.173-.391 7.99 7.99 0 00-2.494-.422C5.663.014 5.259.0 1.037.0 1zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 00-6.162-6.162zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.882 1.44 1.44 0 00-1.44-1.44z" />
      </svg>
    ),
  },
  {
    platform: "Facebook",
    username: "Subhajit Ghosh",
    url: "https://www.facebook.com/share/18ypRATS29/",
    color: "from-blue-600 to-blue-800",
    label: "Facebook Profile",
    iconSvg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.236.195 2.236.195v2.46h-1.26c-1.243 0-1.634.771-1.634 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
  {
    platform: "LinkedIn",
    username: "Subhajit Ghosh",
    url: "https://www.linkedin.com/in/subhajit-ghosh-634968349?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    color: "from-blue-700 to-blue-900",
    label: "LinkedIn Profile",
    iconSvg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M20.447 20.452h-3.554v-5.528c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.746v5.865H9.351V9h3.414v1.561h.046c.747-.145 1.438-.252 2.123-.252 2.292 0 2.895 1.439 2.895 3.317v6.163zM5.337 7.433c-.783 0-1.303-.617-1.303-1.385 0-.771.52-1.384 1.303-1.384.781 0 1.303.613 1.303 1.384 0 .768-.522 1.385-1.303 1.385zm1.777 13.019H3.555V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.207 24 24 23.227 24 22.271V1.729C24 .774 23.207 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export function SocialMediaLinks() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>🌐</span>
        Connect With Us
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {socialLinks.map((link, index) => (
          <motion.a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -3 }}
            className={`relative p-4 rounded-xl bg-gradient-to-r ${link.color} text-white overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow duration-300`}
          >
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8">
                {link.iconSvg}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{link.platform}</p>
                <p className="text-xs opacity-90">{link.username}</p>
              </div>
            </div>

            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
          </motion.a>
        ))}
      </div>

      <p className="mt-4 text-sm text-gray-600 text-center">
        Follow us for updates, tips & tricks! 🚀
      </p>
    </div>
  );
}

export default SocialMediaLinks;

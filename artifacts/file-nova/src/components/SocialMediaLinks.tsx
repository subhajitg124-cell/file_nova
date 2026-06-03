import React from "react";
import { motion } from "framer-motion";

const socialLinks = [
  {
    platform: "Instagram (Developer)",
    username: "@subhajit.tells",
    url: "https://www.instagram.com/subhajit.tells?igsh=MTFqcm1ycDk1OHQ5eA==",
    icon: "📷",
    color: "from-pink-500 via-red-500 to-yellow-500",
    label: "Developer Instagram",
  },
  {
    platform: "Instagram (Website)",
    username: "@filenova.in",
    url: "https://www.instagram.com/filenova.in?igsh=MWt2NG1udjRyZXlnYg==",
    icon: "📷",
    color: "from-pink-500 via-red-500 to-yellow-500",
    label: "FileNova Instagram",
  },
  {
    platform: "Facebook",
    username: "Subhajit Ghosh",
    url: "https://www.facebook.com/share/18ypRATS29/",
    icon: "📘",
    color: "from-blue-600 to-blue-800",
    label: "Facebook Profile",
  },
  {
    platform: "LinkedIn",
    username: "Subhajit Ghosh",
    url: "https://www.linkedin.com/in/subhajit-ghosh-634968349?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    icon: "💼",
    color: "from-blue-700 to-blue-900",
    label: "LinkedIn Profile",
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
            className={`relative p-4 rounded-xl bg-gradient-to-r ${link.color} text-white overflow-hidden group cursor-pointer hover:shadow-lg`}
          >
            <div className="relative z-10 flex items-center gap-3">
              <span className="text-3xl">{link.icon}</span>
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

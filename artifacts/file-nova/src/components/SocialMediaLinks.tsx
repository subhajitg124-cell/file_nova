import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { ChevronDown, Facebook, Globe2, Instagram, Linkedin, Send } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const socialLinks = [
  {
    platform: "Instagram (Website)",
    handle: "@filenova.in",
    url: "https://www.instagram.com/filenova.in?igsh=MWt2NG1udjRyZXlnYg==",
    icon: Instagram,
    colorClass: "social-color-instagram",
  },
  {
    platform: "Facebook",
    handle: "Subhajit Ghosh",
    url: "https://www.facebook.com/share/18ypRATS29/",
    icon: Facebook,
    colorClass: "social-color-facebook",
  },
  {
    platform: "LinkedIn",
    handle: "Subhajit Ghosh",
    url: "https://www.linkedin.com/in/subhajit-ghosh-634968349?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    icon: Linkedin,
    colorClass: "social-color-linkedin",
  },
  {
    platform: "Telegram Support",
    handle: "@filenova_assistant",
    url: "https://t.me/filenova_assistant",
    icon: Send,
    colorClass: "social-color-telegram",
    requiresTier: "PRO",
  },
];

export function SocialMediaLinks() {
  const { user } = useAuthStore();
  const { tText } = useTranslation();
  const isProOrHigher = user?.premiumTier === "pro" || user?.premiumTier === "elite";
  const [isOpen, setIsOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setIsOpen(false), 180);
    setHoverTimeout(timeout);
  };

  return (
    <div className="social-links-container">
      <div
        className="contact-trigger-wrapper"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        <button
          className="contact-trigger-button"
          type="button"
          {...(isOpen ? { "aria-expanded": true } : { "aria-expanded": false })}
        >
          <Globe2 className="h-4 w-4 text-sky-300" />
          <span>{tText("Connect With Us")}</span>
          <ChevronDown className={`dropdown-arrow h-3.5 w-3.5 ${isOpen ? "open" : ""}`} />
        </button>

        <div className={`social-dropdown ${isOpen ? "open" : ""}`}>
          <div className="dropdown-header">
            <h3>{tText("Connect With Us")}</h3>
            <p>{tText("Follow us for updates, tips and tricks.")}</p>
          </div>

          <div className="social-links-grid">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              const locked = social.requiresTier && !isProOrHigher;
              return (
                <a
                  key={social.platform}
                  href={locked ? "/pricing" : social.url}
                  target={locked ? undefined : "_blank"}
                  rel={locked ? undefined : "noopener noreferrer"}
                  className={`social-link-card ${social.colorClass}`}
                >
                  <div className="social-icon-wrapper">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="social-info">
                    <span className="social-platform">{social.platform}</span>
                    <span className="social-handle">{social.handle}</span>
                  </div>
                  {social.requiresTier && <span className="tier-badge">{locked ? "PRO+" : "PRO"}</span>}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocialMediaLinks;

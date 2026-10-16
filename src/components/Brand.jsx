import { useId } from "react";
import { Mail } from "lucide-react";

/* Logo and the author's links (shown in the sidebar and Settings > About). */

export function LogoMark({ size = 36, className }) {
  // Each logo needs its own gradient id: with a shared one, a hidden copy
  // (e.g. the desktop sidebar on phones) leaves the visible logo blank.
  const gradientId = `marginiq-logo-${useId().replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill={`url(#${gradientId})`} />
      <path
        d="M7 22 L11.5 10 L16 17 L21 8 L25 22"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="8" r="2.4" fill="#34d399" />
    </svg>
  );
}

function GithubGlyph({ size = 16, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56l-.01-2.2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.08.78 2.17l-.01 3.22c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

function LinkedinGlyph({ size = 16, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

function WhatsappGlyph({ size = 16, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.02 2C6.5 2 2.03 6.48 2.03 12c0 1.77.46 3.45 1.27 4.92L2 22l5.2-1.36A9.94 9.94 0 0 0 12.02 22C17.55 22 22 17.52 22 12S17.55 2 12.02 2Zm0 18.06c-1.6 0-3.13-.43-4.46-1.24l-.32-.19-3.09.81.83-3-.21-.32A8.03 8.03 0 0 1 3.98 12c0-4.43 3.6-8.02 8.04-8.02 4.44 0 8.03 3.6 8.03 8.02 0 4.43-3.6 8.06-8.03 8.06Zm4.4-6.02c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.55.12-.16.24-.63.78-.77.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42-.14 0-.3-.02-.46-.02-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { Icon: LinkedinGlyph, label: "LinkedIn", href: "https://www.linkedin.com/in/vatsalsavanicodes/" },
  { Icon: Mail, label: "Email", href: "mailto:vatsalsavanicodes@gmail.com" },
  { Icon: WhatsappGlyph, label: "WhatsApp", href: "https://wa.me/918329351893" },
  { Icon: GithubGlyph, label: "GitHub", href: "https://github.com/vatsal594" },
];

export function SocialLinks({ T, size = 15, className = "" }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {SOCIAL_LINKS.map(({ Icon, label, href }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          title={label}
          aria-label={label}
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${T.muted} ${T.hover} hover:text-indigo-500`}
        >
          <Icon size={size} />
        </a>
      ))}
    </div>
  );
}

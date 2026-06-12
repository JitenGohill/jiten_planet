"use client";

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/JitenGohill",
    icon: (
      <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          clipRule="evenodd"
          d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.95c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.59.69.49A10.19 10.19 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"
          fillRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "Gmail",
    href: "mailto:jitenhgohill@gmail.com",
    icon: (
      <svg
        aria-hidden="true"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d="M4.75 6.75h14.5v10.5H4.75z" />
        <path d="m5.25 7.25 6.75 5.5 6.75-5.5" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jitengohill",
    icon: (
      <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5.34 8.98H2.67v12.03h2.67V8.98ZM5.6 5.23C5.58 4.43 5 3.82 4.06 3.82c-.94 0-1.55.61-1.55 1.41 0 .78.59 1.41 1.51 1.41h.02c.96 0 1.56-.63 1.56-1.41ZM21.5 14.12c0-3.7-1.97-5.42-4.6-5.42-2.12 0-3.07 1.17-3.6 1.99V8.98h-2.67c.04 1.13 0 12.03 0 12.03h2.67v-6.72c0-.36.03-.72.13-.98.29-.72.94-1.46 2.03-1.46 1.43 0 2 1.1 2 2.7v6.46h2.67l-.01-6.89Z" />
      </svg>
    ),
  },
];

export function SocialLinks() {
  return (
    <nav
      aria-label="Social links"
      className="pointer-events-auto absolute bottom-5 left-4 z-10 flex gap-2 sm:bottom-7 sm:left-7"
    >
      {socialLinks.map((link) => (
        <a
          aria-label={link.label}
          className="grid size-11 place-items-center rounded-full border border-cyan-200/20 bg-slate-950/60 text-cyan-50 shadow-xl shadow-cyan-950/35 backdrop-blur-md transition hover:border-amber-200/45 hover:bg-amber-200/15 hover:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-200/70 focus:ring-offset-2 focus:ring-offset-slate-950"
          href={link.href}
          key={link.label}
          rel={link.href.startsWith("http") ? "noreferrer" : undefined}
          target={link.href.startsWith("http") ? "_blank" : undefined}
        >
          {link.icon}
        </a>
      ))}
    </nav>
  );
}

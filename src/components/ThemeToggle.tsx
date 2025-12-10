import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "auto";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("auto");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = (localStorage.getItem("theme") || "auto") as ThemeMode;
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    let isDark: boolean;

    if (mode === "auto") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      isDark = mode === "dark";
    }

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const cycleTheme = () => {
    const themes: ThemeMode[] = ["light", "dark", "auto"];
    const currentIndex = themes.indexOf(theme);
    const newTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  if (!isMounted) return null;

  return (
    <button
      onClick={cycleTheme}
      className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-ipython-slate text-theme-primary dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-ipython-slate/70 transition-all flex items-center justify-center overflow-hidden"
      aria-label="Toggle theme"
      title={`Theme: ${theme}`}
    >
      {theme === "light" ? (
        <svg
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 28 28"
        >
          <g transform="translate(14, 14) scale(0.75) translate(-14, -14)">
            <circle cx="14" cy="14" r="5" />
            <line x1="14" y1="3" x2="14" y2="5" />
            <line x1="14" y1="23" x2="14" y2="25" />
            <line x1="6.22" y1="6.22" x2="4.81" y2="4.81" />
            <line x1="21.78" y1="21.78" x2="23.19" y2="23.19" />
            <line x1="3" y1="14" x2="5" y2="14" />
            <line x1="23" y1="14" x2="25" y2="14" />
            <line x1="6.22" y1="21.78" x2="4.81" y2="23.19" />
            <line x1="21.78" y1="6.22" x2="23.19" y2="4.81" />
          </g>
        </svg>
      ) : theme === "dark" ? (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 28 28">
          <g transform="translate(14, 14) scale(0.75) translate(-14, -14)">
            <path d="M25 14.79A9 9 0 1 1 15.21 5 7 7 0 0 0 25 14.79z" />
          </g>
        </svg>
      ) : (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 28 28">
          <defs>
            <clipPath id="sunHalf">
              <polygon points="0,0 28,0 0,28" />
            </clipPath>
            <clipPath id="moonHalf">
              <polygon points="28,0 28,28 0,28" />
            </clipPath>
            <mask id="moonMask">
              <rect width="28" height="28" fill="white" />
              <g transform="translate(14, 14) scale(0.75) translate(-14, -14)">
                <path d="M25 14.79A9 9 0 1 1 15.21 5 7 7 0 0 0 25 14.79z" fill="black" />
              </g>
            </mask>
          </defs>
          <g clipPath="url(#sunHalf)">
            <g transform="translate(14, 14) scale(0.75) translate(-14, -14)">
              <circle cx="14" cy="14" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
              <line x1="14" y1="3" x2="14" y2="5" stroke="currentColor" strokeWidth="2" />
              <line x1="14" y1="23" x2="14" y2="25" stroke="currentColor" strokeWidth="2" />
              <line x1="6.22" y1="6.22" x2="4.81" y2="4.81" stroke="currentColor" strokeWidth="2" />
              <line x1="21.78" y1="21.78" x2="23.19" y2="23.19" stroke="currentColor" strokeWidth="2" />
              <line x1="3" y1="14" x2="5" y2="14" stroke="currentColor" strokeWidth="2" />
              <line x1="23" y1="14" x2="25" y2="14" stroke="currentColor" strokeWidth="2" />
              <line x1="6.22" y1="21.78" x2="4.81" y2="23.19" stroke="currentColor" strokeWidth="2" />
              <line x1="21.78" y1="6.22" x2="23.19" y2="4.81" stroke="currentColor" strokeWidth="2" />
            </g>
          </g>
          <g clipPath="url(#moonHalf)">
            <rect width="28" height="28" fill="currentColor" mask="url(#moonMask)" />
          </g>
        </svg>
      )}
    </button>
  );
}

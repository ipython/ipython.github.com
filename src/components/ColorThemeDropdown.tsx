import { useEffect, useState, useRef } from "react";
import { themes, changeTheme, subscribeToThemeChanges, initializeThemeWatcher } from "../lib/themeUtils";

export default function ColorThemeDropdown() {
  const [currentTheme, setCurrentTheme] = useState<string>("default");
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // Initialize theme watcher (only once globally, but safe to call multiple times)
    const watcherCleanup = initializeThemeWatcher();
    
    // Subscribe to theme changes
    const unsubscribe = subscribeToThemeChanges((themeId) => {
      setCurrentTheme(themeId);
    });

    return () => {
      unsubscribe();
      watcherCleanup();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);


  const handleThemeChange = (themeId: string) => {
    changeTheme(themeId);
    setIsOpen(false);
  };

  if (!isMounted) return null;

  const currentThemeData = themes.find((t) => t.id === currentTheme) || themes[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-ipython-slate text-theme-primary dark:text-theme-secondary hover:bg-gray-200 dark:hover:bg-ipython-slate/70 transition-all flex items-center justify-center overflow-hidden"
        aria-label="Select color theme"
        title={`Color theme: ${currentThemeData.name}`}
      >
        {currentThemeData.id === 'random' ? (
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-full"
            style={{ backgroundImage: currentThemeData.dotGradient }}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-ipython-slate border border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-hidden">
          <div className="p-2 max-h-96 overflow-y-auto">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                  currentTheme === theme.id
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {theme.id === 'random' ? (
                  <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                ) : (
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0"
                    style={{ backgroundImage: theme.dotGradient }}
                  />
                )}
                <span className="text-sm font-medium">{theme.name}</span>
                {currentTheme === theme.id && (
                  <svg
                    className="w-4 h-4 ml-auto text-theme-primary dark:text-theme-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

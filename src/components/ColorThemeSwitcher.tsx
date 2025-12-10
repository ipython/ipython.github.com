import { useEffect, useState } from 'react';
import { themes, changeTheme, subscribeToThemeChanges, initializeThemeWatcher } from '../lib/themeUtils';

export default function ColorThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Initialize theme watcher (only once globally)
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

  const handleThemeChange = (themeId: string) => {
    changeTheme(themeId);
  };

  if (!isMounted) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-600 dark:text-gray-400 mr-2">Color theme:</span>
      <div className="flex gap-2 flex-wrap">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className={`w-6 h-6 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-secondary flex items-center justify-center ${
              currentTheme === theme.id
                ? 'ring-2 ring-gray-900 dark:ring-white ring-offset-2 scale-110'
                : 'opacity-60 hover:opacity-100'
            } ${theme.id === 'random' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            style={theme.id !== 'random' ? { backgroundImage: theme.dotGradient } : {}}
            aria-label={`Switch to ${theme.name} theme`}
            title={theme.name}
          >
            {theme.id === 'random' ? (
              <svg
                className="w-4 h-4 text-gray-700 dark:text-gray-300"
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
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

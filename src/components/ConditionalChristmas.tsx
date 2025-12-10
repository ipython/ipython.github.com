import { useEffect, useState } from 'react';
import ChristmasSparkles from './ChristmasLights';

export default function ConditionalChristmas() {
  const [showChristmas, setShowChristmas] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-color-theme');
      setShowChristmas(theme === 'christmas');
    };

    // Check initial theme
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-color-theme'],
    });

    // Also check localStorage changes
    const handleStorageChange = () => {
      checkTheme();
    };
    window.addEventListener('storage', handleStorageChange);

    // Poll for changes (fallback)
    const interval = setInterval(checkTheme, 100);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return showChristmas ? <ChristmasSparkles /> : null;
}

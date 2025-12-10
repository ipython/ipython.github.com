import { useEffect, useState } from 'react';
import SnowEffect from './SnowEffect';

export default function ConditionalSnow() {
  const [showSnow, setShowSnow] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-color-theme');
      setShowSnow(theme === 'winter');
    };

    // Check initial theme
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-color-theme'],
    });

    // Also check localStorage changes (in case theme changes via another tab)
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

  return showSnow ? <SnowEffect /> : null;
}

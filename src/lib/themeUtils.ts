export type Theme = {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  dotGradient: string;
};

export const themes: Theme[] = [
  {
    id: "default",
    name: "IPython Default",
    colors: {
      primary: "#0D5C63", // ipython-blue
      secondary: "#008B95", // ipython-cyan
      accent: "#059669", // ipython-green
    },
    dotGradient: "linear-gradient(to bottom right, #0D5C63, #008B95, #059669)",
  },
  {
    id: "rainbow",
    name: "Rainbow Pride",
    colors: {
      primary: "#E40303", // Red
      secondary: "#FF8C00", // Orange
      accent: "#FFED00", // Yellow
    },
    dotGradient:
      "linear-gradient(to bottom right, #E40303 0%, #E40303 16.67%, #FF8C00 16.67%, #FF8C00 33.33%, #FFED00 33.33%, #FFED00 50%, #008026 50%, #008026 66.67%, #004CFF 66.67%, #004CFF 83.33%, #732982 83.33%, #732982 100%)",
  },
  {
    id: "gay",
    name: "Gay Pride",
    colors: {
      primary: "#078D70", // Green
      secondary: "#26CEAA", // Light green/teal
      accent: "#98E8C1", // Pale green/mint
    },
    dotGradient:
      "linear-gradient(to bottom right, #078D70 0%, #078D70 14.28%, #26CEAA 14.28%, #26CEAA 28.56%, #98E8C1 28.56%, #98E8C1 42.84%, #FFFFFF 42.84%, #FFFFFF 57.12%, #7BADE2 57.12%, #7BADE2 71.4%, #5049CC 71.4%, #5049CC 85.68%, #3D1A78 85.68%, #3D1A78 100%)",
  },
  {
    id: "lesbian",
    name: "Lesbian Pride",
    colors: {
      primary: "#D52D00", // Dark orange/red
      secondary: "#EF7627", // Orange
      accent: "#FF9A56", // Light orange/peach
    },
    dotGradient:
      "linear-gradient(to bottom right, #D52D00 0%, #D52D00 14.28%, #EF7627 14.28%, #EF7627 28.56%, #FF9A56 28.56%, #FF9A56 42.84%, #FFFFFF 42.84%, #FFFFFF 57.12%, #D162A4 57.12%, #D162A4 71.4%, #B55690 71.4%, #B55690 85.68%, #A30262 85.68%, #A30262 100%)",
  },
  {
    id: "trans",
    name: "Trans Pride",
    colors: {
      primary: "#5BCEFA", // Light blue
      secondary: "#F5A9B8", // Pink
      accent: "#FFFFFF", // White
    },
    dotGradient:
      "linear-gradient(to bottom right, #5BCEFA, #F5A9B8, #FFFFFF, #F5A9B8, #5BCEFA)",
  },
  {
    id: "purple",
    name: "Purple",
    colors: {
      primary: "#7C3AED", // Purple
      secondary: "#A78BFA", // Light purple
      accent: "#C4B5FD", // Lighter purple
    },
    dotGradient: "linear-gradient(to bottom right, #7C3AED, #A78BFA, #C4B5FD)",
  },
  {
    id: "pink",
    name: "Pink",
    colors: {
      primary: "#EC4899", // Pink
      secondary: "#F472B6", // Light pink
      accent: "#FBCFE8", // Lighter pink
    },
    dotGradient: "linear-gradient(to bottom right, #EC4899, #F472B6, #FBCFE8)",
  },
  {
    id: "orange",
    name: "Orange",
    colors: {
      primary: "#F97316", // Orange
      secondary: "#FB923C", // Light orange
      accent: "#FDBA74", // Lighter orange
    },
    dotGradient: "linear-gradient(to bottom right, #F97316, #FB923C, #FDBA74)",
  },
  {
    id: "indigo",
    name: "Indigo",
    colors: {
      primary: "#4F46E5", // Indigo
      secondary: "#6366F1", // Light indigo
      accent: "#818CF8", // Lighter indigo
    },
    dotGradient: "linear-gradient(to bottom right, #4F46E5, #6366F1, #818CF8)",
  },
  {
    id: "emerald",
    name: "Emerald",
    colors: {
      primary: "#10B981", // Emerald
      secondary: "#34D399", // Light emerald
      accent: "#6EE7B7", // Lighter emerald
    },
    dotGradient: "linear-gradient(to bottom right, #10B981, #34D399, #6EE7B7)",
  },
  {
    id: "winter",
    name: "Winter",
    colors: {
      primary: "#0EA5E9", // Sky blue
      secondary: "#38BDF8", // Light sky blue
      accent: "#BAE6FD", // Lighter sky blue
    },
    dotGradient: "linear-gradient(to bottom right, #0EA5E9, #38BDF8, #BAE6FD)",
  },
  {
    id: "christmas",
    name: "Christmas",
    colors: {
      primary: "#c8102e", // Deep Christmas Red
      secondary: "#006b3c", // Forest Green
      accent: "#ffffff", // White/Snow
    },
    dotGradient:
      "linear-gradient(to bottom right, #c8102e 0%, #c8102e 40%, #006b3c 40%, #006b3c 80%, #ffffff 80%, #ffffff 100%)",
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: {
      primary: "#0a2540", // Deep ocean blue
      secondary: "#006994", // Ocean blue
      accent: "#00d4ff", // Bright cyan
    },
    dotGradient:
      "linear-gradient(to bottom right, #0a2540 0%, #0a2540 40%, #006994 40%, #006994 70%, #00d4ff 70%, #00d4ff 100%)",
  },
  {
    id: "velvet",
    name: "Red Velvet",
    colors: {
      primary: "#6b0f2a", // Deep velvet red
      secondary: "#8b1538", // Rich carmine
      accent: "#a91d3d", // Warm velvet
    },
    dotGradient:
      "linear-gradient(to bottom right, #6b0f2a 0%, #6b0f2a 40%, #8b1538 40%, #8b1538 70%, #a91d3d 70%, #a91d3d 100%)",
  },
  {
    id: "sun",
    name: "Sun",
    colors: {
      primary: "#f59e0b", // Bright amber/yellow
      secondary: "#fbbf24", // Golden yellow
      accent: "#fcd34d", // Light yellow
    },
    dotGradient:
      "linear-gradient(to bottom right, #f59e0b 0%, #f59e0b 40%, #fbbf24 40%, #fbbf24 70%, #fcd34d 70%, #fcd34d 100%)",
  },
  {
    id: "random",
    name: "Random",
    colors: {
      primary: "#9333ea", // Purple
      secondary: "#ec4899", // Pink
      accent: "#f59e0b", // Amber
    },
    dotGradient:
      "linear-gradient(to bottom right, #9333ea, #ec4899, #f59e0b, #10b981, #3b82f6)",
  },
];

/**
 * Get all available theme IDs excluding 'random'
 */
export function getAvailableThemes(): string[] {
  return themes.filter((t) => t.id !== "random").map((t) => t.id);
}

/**
 * Get a random theme ID (excluding 'random')
 */
export function getRandomTheme(): string {
  const availableThemes = getAvailableThemes();
  return availableThemes[Math.floor(Math.random() * availableThemes.length)];
}

/**
 * Theme storage format
 */
interface ThemeStorage {
  themeId: string;
  date: string; // YYYY-MM-DD format
}

/**
 * Apply a theme to the document
 * If themeId is 'random', it will pick a random theme
 * @param themeId - The theme ID to apply
 * @param storePreference - Whether to store the preference in localStorage (default: true)
 */
export function applyTheme(
  themeId: string,
  storePreference: boolean = true
): void {
  let actualThemeId = themeId;

  // If random is selected, pick a random theme
  if (themeId === "random") {
    actualThemeId = getRandomTheme();
  }
  console.log("Applying them", themeId);

  const theme = themes.find((t) => t.id === actualThemeId) || themes[0];
  const root = document.documentElement;

  // Set CSS custom properties
  root.style.setProperty("--theme-primary", theme.colors.primary);
  root.style.setProperty("--theme-secondary", theme.colors.secondary);
  root.style.setProperty("--theme-accent", theme.colors.accent);

  // Update Tailwind colors via data attribute (use actual theme, not 'random')
  root.setAttribute("data-color-theme", actualThemeId);

  // Store preference with date (store 'random' if that's what was selected)
  if (storePreference) {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const storage: ThemeStorage = {
      themeId: themeId,
      date: dateString,
    };
    localStorage.setItem("colorTheme", JSON.stringify(storage));
  }
}

/**
 * Get the current theme from localStorage or data attribute
 */
export function getCurrentTheme(): string {
  if (typeof document === "undefined") return "default";
  return (
    document.documentElement.getAttribute("data-color-theme") ||
    localStorage.getItem("colorTheme") ||
    "default"
  );
}

/**
 * Check if we should auto-apply winter theme
 * Returns true if current month is December or January,
 * and the last theme change was NOT in December or January
 */
function shouldAutoApplyWinterTheme(): boolean {
  if (typeof localStorage === "undefined") {
    return true;
  }

  const now = new Date();
  const currentMonth = now.getMonth(); // 0 = January, 11 = December
  const isDecOrJan = currentMonth === 11 || currentMonth === 0;

  if (!isDecOrJan) {
    console.info("Nothing specific using default theme");
    return false;
  }

  const stored = localStorage.getItem("colorTheme");
  if (!stored) return true; // No stored theme, apply winter

  try {
    const parsed = JSON.parse(stored);
    let storedDate: Date | null = null;

    if (typeof parsed === "object" && parsed.date) {
      // Parse YYYY-MM-DD format
      storedDate = new Date(parsed.date + "T00:00:00");
    } else if (typeof parsed === "object" && parsed.timestamp) {
      // Old format with timestamp
      storedDate = new Date(parsed.timestamp);
    }

    if (storedDate) {
      const storedMonth = storedDate.getMonth();
      const storedIsDecOrJan = storedMonth === 11 || storedMonth === 0;
      // If stored date is NOT in Dec/Jan, auto-apply winter
      return !storedIsDecOrJan;
    }
  } catch {
    console.log("Something wrong in local storage");

    // If parsing fails, assume old format - apply winter
    return true;
  }

  return false;
}

/**
 * Get the stored theme preference (what user selected, not the actual applied theme)
 */
export function getStoredTheme(): string {
  if (typeof localStorage === "undefined") return "default";
  const stored = localStorage.getItem("colorTheme");
  if (!stored) return "default";

  // Handle both old format (string) and new format (object with timestamp)
  try {
    const parsed = JSON.parse(stored);
    if (typeof parsed === "object" && parsed.themeId) {
      return parsed.themeId;
    }
  } catch {
    // If parsing fails, assume it's the old string format
    return stored;
  }

  return "default";
}

/**
 * Get the stored theme preference with date
 * @returns Object with themeId and date, or null if not found
 */
export function getStoredThemeWithDate(): ThemeStorage | null {
  if (typeof localStorage === "undefined") return null;
  const stored = localStorage.getItem("colorTheme");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    if (typeof parsed === "object" && parsed.themeId) {
      // Handle both old format (with timestamp) and new format (with date)
      if (parsed.date) {
        return parsed as ThemeStorage;
      } else if (parsed.timestamp) {
        // Convert old timestamp to date string
        const date = new Date(parsed.timestamp);
        const dateString = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        return {
          themeId: parsed.themeId,
          date: dateString,
        };
      }
    }
    // Handle old format (just a string)
    if (typeof parsed === "string") {
      const today = new Date();
      const dateString = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      return {
        themeId: parsed,
        date: dateString, // Use current date as fallback
      };
    }
  } catch {
    // If parsing fails, assume it's the old string format
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return {
      themeId: stored,
      date: dateString, // Use current date as fallback
    };
  }

  return null;
}

// Theme change callbacks
type ThemeChangeCallback = (themeId: string) => void;
const themeChangeCallbacks = new Set<ThemeChangeCallback>();

/**
 * Subscribe to theme changes
 * @param callback - Function to call when theme changes
 * @returns Unsubscribe function
 */
export function subscribeToThemeChanges(
  callback: ThemeChangeCallback
): () => void {
  themeChangeCallbacks.add(callback);
  // Immediately call with current theme
  callback(getStoredTheme());

  return () => {
    themeChangeCallbacks.delete(callback);
  };
}

/**
 * Notify all subscribers of theme change
 */
function notifyThemeChange(themeId: string): void {
  themeChangeCallbacks.forEach((callback) => callback(themeId));
}

// Theme watcher state
let themeWatcherInitialized = false;
let themeWatcherCleanup: (() => void) | null = null;
let randomRotationCleanup: (() => void) | null = null;

/**
 * Initialize theme watcher - watches for changes from localStorage, data attributes, etc.
 * Should be called once when the app starts. Safe to call multiple times.
 */
export function initializeThemeWatcher(): () => void {
  if (themeWatcherInitialized || typeof document === "undefined") {
    // Return existing cleanup or no-op
    return themeWatcherCleanup || (() => {});
  }

  themeWatcherInitialized = true;

  const checkTheme = () => {
    // Check if we should auto-apply winter theme first
    if (shouldAutoApplyWinterTheme()) {
      const currentApplied = getCurrentTheme();
      // Only apply winter if it's not already applied
      if (currentApplied !== "winter") {
        applyTheme("winter", false); // Apply winter but don't store it
        notifyThemeChange(getStoredTheme()); // Notify with stored theme, not 'winter'
      }
      return; // Don't check stored theme when winter is auto-applied
    }

    const storedTheme = getStoredTheme();
    const currentApplied = getCurrentTheme();

    // If stored theme is 'random', handle rotation
    if (storedTheme === "random") {
      // Random rotation is handled separately
      return;
    }

    // If stored theme doesn't match applied theme, apply it
    if (storedTheme !== currentApplied && storedTheme !== "random") {
      applyTheme(storedTheme, false); // Don't store again, just apply
    }
  };

  // Watch for data attribute changes
  const observer = new MutationObserver(checkTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-color-theme"],
  });

  // Watch for localStorage changes (from other tabs/windows)
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "colorTheme") {
      let newTheme = "default";
      if (e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (typeof parsed === "object" && parsed.themeId) {
            newTheme = parsed.themeId;
          } else if (typeof parsed === "string") {
            newTheme = parsed;
          }
        } catch {
          // If parsing fails, assume it's the old string format
          newTheme = e.newValue;
        }
      }
      applyTheme(newTheme, false); // Don't store, it's already stored
      notifyThemeChange(newTheme);

      // Handle random theme rotation
      if (newTheme === "random") {
        startRandomThemeRotation();
      } else {
        stopRandomThemeRotation();
      }
    }
  };
  window.addEventListener("storage", handleStorageChange);

  // Poll for changes (fallback)
  const interval = setInterval(checkTheme, 10000);

  // Apply initial theme
  // Check if we should auto-apply winter theme
  if (shouldAutoApplyWinterTheme()) {
    console.log("will apply winter");
    applyTheme("winter", false); // Apply winter but don't store it
    notifyThemeChange("winter"); // Notify with the stored theme, not 'winter'
  } else {
    const initialTheme = getStoredTheme();
    applyTheme(initialTheme);
    if (initialTheme === "random") {
      startRandomThemeRotation();
    }
  }

  // Cleanup function
  themeWatcherCleanup = () => {
    observer.disconnect();
    window.removeEventListener("storage", handleStorageChange);
    clearInterval(interval);
    stopRandomThemeRotation();
    themeWatcherInitialized = false;
    themeWatcherCleanup = null;
  };

  return themeWatcherCleanup;
}

/**
 * Start random theme rotation
 */
function startRandomThemeRotation(): void {
  if (randomRotationCleanup) return; // Already running

  // Apply random theme immediately
  applyTheme("random", false);
  notifyThemeChange("random");

  // Change theme every minute (60000ms)
  const randomInterval = setInterval(() => {
    applyTheme("random", false);
    notifyThemeChange("random");
  }, 60000);

  randomRotationCleanup = () => {
    clearInterval(randomInterval);
    randomRotationCleanup = null;
  };
}

/**
 * Stop random theme rotation
 */
function stopRandomThemeRotation(): void {
  if (randomRotationCleanup) {
    randomRotationCleanup();
    randomRotationCleanup = null;
  }
}

/**
 * Change theme (public API for components)
 * This is the main way components should change themes
 */
export function changeTheme(themeId: string): void {
  applyTheme(themeId, true); // Store preference
  notifyThemeChange(themeId);

  // Handle random theme rotation
  if (themeId === "random") {
    startRandomThemeRotation();
  } else {
    stopRandomThemeRotation();
  }
}

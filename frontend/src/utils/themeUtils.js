// Theme utility functions with improved performance and stability

const THEME_KEYS = {
  DARK_MODE: "nutrifit_dark_mode",
  HIGH_CONTRAST: "nutrifit_high_contrast",
  LARGE_FONT: "nutrifit_large_font",
};

const THEME_CLASSES = {
  DARK_MODE: "dark-mode",
  HIGH_CONTRAST: "high-contrast",
  LARGE_FONT: "large-font",
};

// Initialize theme on app startup
export const initializeTheme = () => {
  try {
    const isDark = localStorage.getItem(THEME_KEYS.DARK_MODE) === "true";
    const isHighContrast =
      localStorage.getItem(THEME_KEYS.HIGH_CONTRAST) === "true";
    const isLargeFont = localStorage.getItem(THEME_KEYS.LARGE_FONT) === "true";

    // Apply themes without triggering events
    updateBodyClasses(isDark, isHighContrast, isLargeFont);
  } catch (error) {
    console.warn("Error initializing theme:", error);
  }
};

// Update body classes efficiently
const updateBodyClasses = (isDark, isHighContrast, isLargeFont) => {
  const body = document.body;

  // Dark mode
  if (isDark) {
    body.classList.add(THEME_CLASSES.DARK_MODE);
  } else {
    body.classList.remove(THEME_CLASSES.DARK_MODE);
  }

  // High contrast
  if (isHighContrast) {
    body.classList.add(THEME_CLASSES.HIGH_CONTRAST);
  } else {
    body.classList.remove(THEME_CLASSES.HIGH_CONTRAST);
  }

  // Large font
  if (isLargeFont) {
    body.classList.add(THEME_CLASSES.LARGE_FONT);
  } else {
    body.classList.remove(THEME_CLASSES.LARGE_FONT);
  }
};

// Toggle dark mode
export const toggleDarkMode = () => {
  try {
    const currentState = localStorage.getItem(THEME_KEYS.DARK_MODE) === "true";
    const newState = !currentState;

    localStorage.setItem(THEME_KEYS.DARK_MODE, newState.toString());

    if (newState) {
      document.body.classList.add(THEME_CLASSES.DARK_MODE);
    } else {
      document.body.classList.remove(THEME_CLASSES.DARK_MODE);
    }

    // Trigger a custom event for any listeners
    window.dispatchEvent(
      new CustomEvent("themeChange", {
        detail: { type: "darkMode", enabled: newState },
      })
    );

    return newState;
  } catch (error) {
    console.error("Error toggling dark mode:", error);
    return false;
  }
};

// Toggle high contrast
export const toggleHighContrast = () => {
  try {
    const currentState =
      localStorage.getItem(THEME_KEYS.HIGH_CONTRAST) === "true";
    const newState = !currentState;

    localStorage.setItem(THEME_KEYS.HIGH_CONTRAST, newState.toString());

    if (newState) {
      document.body.classList.add(THEME_CLASSES.HIGH_CONTRAST);
    } else {
      document.body.classList.remove(THEME_CLASSES.HIGH_CONTRAST);
    }

    // Trigger a custom event for any listeners
    window.dispatchEvent(
      new CustomEvent("themeChange", {
        detail: { type: "highContrast", enabled: newState },
      })
    );

    return newState;
  } catch (error) {
    console.error("Error toggling high contrast:", error);
    return false;
  }
};

// Toggle font size
export const toggleFontSize = () => {
  try {
    const currentState = localStorage.getItem(THEME_KEYS.LARGE_FONT) === "true";
    const newState = !currentState;

    localStorage.setItem(THEME_KEYS.LARGE_FONT, newState.toString());

    if (newState) {
      document.body.classList.add(THEME_CLASSES.LARGE_FONT);
    } else {
      document.body.classList.remove(THEME_CLASSES.LARGE_FONT);
    }

    // Trigger a custom event for any listeners
    window.dispatchEvent(
      new CustomEvent("themeChange", {
        detail: { type: "largeFont", enabled: newState },
      })
    );

    return newState;
  } catch (error) {
    console.error("Error toggling font size:", error);
    return false;
  }
};

// Get current theme state
export const getCurrentTheme = () => {
  try {
    return {
      isDark: localStorage.getItem(THEME_KEYS.DARK_MODE) === "true",
      isHighContrast: localStorage.getItem(THEME_KEYS.HIGH_CONTRAST) === "true",
      isLargeFont: localStorage.getItem(THEME_KEYS.LARGE_FONT) === "true",
    };
  } catch (error) {
    console.error("Error getting current theme:", error);
    return {
      isDark: false,
      isHighContrast: false,
      isLargeFont: false,
    };
  }
};

// Check if dark mode is enabled
export const isDarkModeEnabled = () => {
  try {
    return localStorage.getItem(THEME_KEYS.DARK_MODE) === "true";
  } catch (error) {
    return false;
  }
};

// Check if high contrast is enabled
export const isHighContrastEnabled = () => {
  try {
    return localStorage.getItem(THEME_KEYS.HIGH_CONTRAST) === "true";
  } catch (error) {
    return false;
  }
};

// Check if large font is enabled
export const isLargeFontEnabled = () => {
  try {
    return localStorage.getItem(THEME_KEYS.LARGE_FONT) === "true";
  } catch (error) {
    return false;
  }
};

// Reset all themes to default
export const resetThemes = () => {
  try {
    localStorage.removeItem(THEME_KEYS.DARK_MODE);
    localStorage.removeItem(THEME_KEYS.HIGH_CONTRAST);
    localStorage.removeItem(THEME_KEYS.LARGE_FONT);

    document.body.classList.remove(
      THEME_CLASSES.DARK_MODE,
      THEME_CLASSES.HIGH_CONTRAST,
      THEME_CLASSES.LARGE_FONT
    );

    // Trigger a custom event for any listeners
    window.dispatchEvent(
      new CustomEvent("themeChange", {
        detail: { type: "reset", enabled: false },
      })
    );

    return true;
  } catch (error) {
    console.error("Error resetting themes:", error);
    return false;
  }
};

// Set specific theme without toggling
export const setDarkMode = (enabled) => {
  try {
    localStorage.setItem(THEME_KEYS.DARK_MODE, enabled.toString());

    if (enabled) {
      document.body.classList.add(THEME_CLASSES.DARK_MODE);
    } else {
      document.body.classList.remove(THEME_CLASSES.DARK_MODE);
    }

    window.dispatchEvent(
      new CustomEvent("themeChange", {
        detail: { type: "darkMode", enabled },
      })
    );

    return enabled;
  } catch (error) {
    console.error("Error setting dark mode:", error);
    return false;
  }
};

// Set high contrast without toggling
export const setHighContrast = (enabled) => {
  try {
    localStorage.setItem(THEME_KEYS.HIGH_CONTRAST, enabled.toString());

    if (enabled) {
      document.body.classList.add(THEME_CLASSES.HIGH_CONTRAST);
    } else {
      document.body.classList.remove(THEME_CLASSES.HIGH_CONTRAST);
    }

    window.dispatchEvent(
      new CustomEvent("themeChange", {
        detail: { type: "highContrast", enabled },
      })
    );

    return enabled;
  } catch (error) {
    console.error("Error setting high contrast:", error);
    return false;
  }
};

// Set large font without toggling
export const setLargeFont = (enabled) => {
  try {
    localStorage.setItem(THEME_KEYS.LARGE_FONT, enabled.toString());

    if (enabled) {
      document.body.classList.add(THEME_CLASSES.LARGE_FONT);
    } else {
      document.body.classList.remove(THEME_CLASSES.LARGE_FONT);
    }

    window.dispatchEvent(
      new CustomEvent("themeChange", {
        detail: { type: "largeFont", enabled },
      })
    );

    return enabled;
  } catch (error) {
    console.error("Error setting large font:", error);
    return false;
  }
};

// Listen for theme changes
export const addThemeChangeListener = (callback) => {
  const handleThemeChange = (event) => {
    callback(event.detail);
  };

  window.addEventListener("themeChange", handleThemeChange);

  // Return cleanup function
  return () => {
    window.removeEventListener("themeChange", handleThemeChange);
  };
};

// Get theme preference from system (for initial setup)
export const getSystemThemePreference = () => {
  try {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  } catch (error) {
    return "light";
  }
};

// Auto-detect and apply system theme if no preference is set
export const applySystemThemeIfNeeded = () => {
  try {
    const hasUserPreference =
      localStorage.getItem(THEME_KEYS.DARK_MODE) !== null;

    if (!hasUserPreference) {
      const systemPreference = getSystemThemePreference();
      if (systemPreference === "dark") {
        setDarkMode(true);
      }
    }
  } catch (error) {
    console.warn("Error applying system theme:", error);
  }
};

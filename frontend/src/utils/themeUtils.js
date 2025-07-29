// Theme utility functions for managing accessibility settings

export const initializeTheme = () => {
  // Initialize theme settings from localStorage
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
  
  if (localStorage.getItem("contrast") === "high") {
    document.body.classList.add("high-contrast");
  }
  
  if (localStorage.getItem("fontSize") === "large") {
    document.body.classList.add("large-font");
  }
};

export const getCurrentTheme = () => {
  return {
    isDark: document.body.classList.contains("dark-mode"),
    isHighContrast: document.body.classList.contains("high-contrast"),
    isLargeFont: document.body.classList.contains("large-font")
  };
};

export const toggleDarkMode = () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-mode") ? "dark" : "light"
  );
};

export const toggleHighContrast = () => {
  document.body.classList.toggle("high-contrast");
  localStorage.setItem(
    "contrast",
    document.body.classList.contains("high-contrast") ? "high" : "normal"
  );
};

export const toggleFontSize = () => {
  document.body.classList.toggle("large-font");
  localStorage.setItem(
    "fontSize",
    document.body.classList.contains("large-font") ? "large" : "normal"
  );
}; 
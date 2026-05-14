import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('ygb_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('ygb_theme', 'dark');
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    
    // Set initial theme color
    const storedColor = localStorage.getItem('ygb_theme_color') || '#00D4FF';
    setThemeColor(storedColor);
  }, []);

  const setThemeColor = (color) => {
    if (!color) return;
    localStorage.setItem('ygb_theme_color', color);
    document.documentElement.style.setProperty('--theme-color', color);

    // Update favicon
    const brandDark = '#0F0F14';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="${color}" />
      <path d="M30 20 L50 50 L70 20 M50 50 L50 80" stroke="${brandDark}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    </svg>`;
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

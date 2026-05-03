import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('ygb_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('ygb_theme', 'dark');
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    
    // Set initial theme color if stored
    const storedColor = localStorage.getItem('ygb_theme_color');
    if (storedColor) {
      document.documentElement.style.setProperty('--theme-color', storedColor);
    }
  }, []);

  const setThemeColor = (color) => {
    if (!color) return;
    localStorage.setItem('ygb_theme_color', color);
    document.documentElement.style.setProperty('--theme-color', color);
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

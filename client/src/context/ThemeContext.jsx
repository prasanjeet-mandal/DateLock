import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Connection mode: 'both' | 'friendship' | 'dating'
  const [connectionMode, setConnectionMode] = useState(() => {
    return localStorage.getItem('datelock_mode') || 'both';
  });

  useEffect(() => {
    localStorage.setItem('datelock_mode', connectionMode);
  }, [connectionMode]);

  // Pink-anchored color theme variables based on active mode
  const getModeAura = () => {
    switch (connectionMode) {
      case 'friendship':
        return {
          name: 'Friendship',
          primary: '#f472b6',
          secondary: '#fb7185',
          accent: '#fda4af',
          gradient: 'from-pink-400 via-rose-400 to-pink-300',
          glowClass: 'shadow-glow-blush',
          borderHighlight: 'border-pink-400/40',
          textGradient: 'bg-gradient-to-r from-pink-300 via-rose-300 to-pink-100 bg-clip-text text-transparent',
          badgeBg: 'bg-pink-500/15 text-pink-200 border-pink-400/30'
        };
      case 'dating':
        return {
          name: 'Dating',
          primary: '#ff007f',
          secondary: '#ff2d87',
          accent: '#e11d48',
          gradient: 'from-rose-500 via-pink-500 to-red-500',
          glowClass: 'shadow-glow-rose',
          borderHighlight: 'border-rose-500/40',
          textGradient: 'bg-gradient-to-r from-rose-400 via-pink-400 to-red-400 bg-clip-text text-transparent',
          badgeBg: 'bg-rose-500/20 text-rose-200 border-rose-500/35'
        };
      default: // 'both'
        return {
          name: 'All Connections',
          primary: '#ff2d87',
          secondary: '#d946ef',
          accent: '#f43f5e',
          gradient: 'from-pink-500 via-rose-500 to-fuchsia-500',
          glowClass: 'shadow-glow-pink',
          borderHighlight: 'border-pink-500/40',
          textGradient: 'bg-gradient-to-r from-pink-400 via-rose-300 to-fuchsia-400 bg-clip-text text-transparent',
          badgeBg: 'bg-pink-500/20 text-pink-200 border-pink-500/35'
        };
    }
  };

  return (
    <ThemeContext.Provider value={{
      connectionMode,
      setConnectionMode,
      modeAura: getModeAura()
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Widget theme configurations
 */
export const themes = {
  // Dark theme (default)
  dark: {
    name: 'Dark',
    colors: {
      background: '#1e293b',       // slate-800
      text: '#f8fafc',             // slate-50
      textSecondary: '#cbd5e1',    // slate-300
      cardBackground: '#334155',   // slate-700
      border: '#475569',           // slate-600
      accent: '#3b82f6',           // blue-500
      success: '#22c55e',          // green-500
      warning: '#eab308',          // yellow-500
      danger: '#ef4444',           // red-500
      // Progress bar backgrounds
      progressBg: '#1e293b',       // slate-800
      highScore: '#22c55e',        // green-500
      mediumScore: '#3b82f6',      // blue-500
      lowScore: '#eab308',         // yellow-500
      failScore: '#ef4444'         // red-500
    },
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
  },
  
  // Light theme
  light: {
    name: 'Light',
    colors: {
      background: '#f8fafc',       // slate-50
      text: '#1e293b',             // slate-800
      textSecondary: '#475569',    // slate-600
      cardBackground: '#f1f5f9',   // slate-100
      border: '#cbd5e1',           // slate-300
      accent: '#2563eb',           // blue-600
      success: '#16a34a',          // green-600
      warning: '#ca8a04',          // yellow-600
      danger: '#dc2626',           // red-600
      // Progress bar backgrounds
      progressBg: '#e2e8f0',       // slate-200
      highScore: '#16a34a',        // green-600
      mediumScore: '#2563eb',      // blue-600
      lowScore: '#ca8a04',         // yellow-600
      failScore: '#dc2626'         // red-600
    },
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
  }
};

/**
 * Get color for skill level
 */
export function getSkillColor(value, themeName = 'dark') {
  const theme = themes[themeName] || themes.dark;
  
  if (value >= 8) return theme.colors.highScore;
  if (value >= 6) return theme.colors.mediumScore;
  if (value >= 4) return theme.colors.lowScore;
  return theme.colors.failScore;
}

export default themes;
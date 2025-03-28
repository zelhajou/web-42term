/**
 * Enhanced Terminal Skills Visualization
 * Displays student skills in a realistic terminal UI
 */

/**
 * Escape special characters for XML/SVG
 */
function escapeXml(unsafe) {
  return unsafe?.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  }) || '';
}

/**
 * Generate terminal-style visualization with raw API data
 */
export function generateTerminalSkills(studentData, themeName = 'dark', options = {}) {
  // Configure options with defaults
  const config = {
    width: options.width || 800,
    height: options.height || 0,
    maxSkills: options.maxSkills || 100, // High number to show all skills
    lineHeight: options.lineHeight || 30,
    ...options
  };
  
  // Extract skills directly from the API data without modification
  let allSkills = [];
  
  // Collect all skills from all cursus
  Object.entries(studentData.skills || {}).forEach(([cursusName, cursusSkills]) => {
    // Add cursus name to each skill for better organization
    const cursusTaggedSkills = cursusSkills.map(skill => ({
      ...skill,
      cursus: cursusName
    }));
    allSkills = [...allSkills, ...cursusTaggedSkills];
  });
  
  // If no skills found, show error
  if (allSkills.length === 0) {
    return generateErrorSVG('No skills data available', themeName);
  }
  
  // Sort skills by level
  const sortedSkills = allSkills
    .sort((a, b) => b.level - a.level)
    .slice(0, config.maxSkills);
  
  // Group skills by cursus for organization and height calculation
  const skillsByCursus = {};
  sortedSkills.forEach(skill => {
    if (!skillsByCursus[skill.cursus]) {
      skillsByCursus[skill.cursus] = [];
    }
    skillsByCursus[skill.cursus].push(skill);
  });
  
  // Calculate required height
  const headerHeight = 40; 
  const topBarHeight = 28;
  const commandHeight = 40;
  const tableHeaderHeight = 40;
  // Add extra space for cursus headers
  const cursusHeadersHeight = Object.keys(skillsByCursus).length * config.lineHeight;
  const skillsRowsHeight = sortedSkills.length * config.lineHeight;
  const bottomPadding = 40;
  
  const calculatedHeight = headerHeight + topBarHeight + commandHeight + tableHeaderHeight + cursusHeadersHeight + skillsRowsHeight + bottomPadding;
  
  // Color scheme based on theme
  const colors = {
    dark: {
      background: '#1E2127',         // Richer dark background
      windowBorder: '#14161A',       // Darker border
      headerBg: '#282C34',           // Header background
      titleText: '#E5E9F0',          // Title text
      topBarBg: '#323842',           // Top bar
      promptUser: '#8BE9FD',         // Cyan username (Dracula-inspired)
      promptHost: '#BD93F9',         // Purple host (Dracula-inspired)
      promptPath: '#50FA7B',         // Green path
      commandText: '#F8F8F2',        // Command text
      tableBorder: '#3B4048',        // Table border
      tableHeaderText: '#FF79C6',    // Pink header (Dracula-inspired)
      skillName: '#61AFEF',          // Blue skill name
      levelHigh: '#50FA7B',          // Bright green for high level
      levelMedium: '#F1FA8C',        // Yellow for medium level
      levelLow: '#BD93F9',           // Purple for low level (less alarming than red)
      skillCursus: '#6272A4',        // Muted blue-purple for cursus
      footerText: '#6272A4'          // Footer text
    },
    light: {
      background: '#F8F9FC',         // Off-white background
      windowBorder: '#E2E8F0',       // Light border
      headerBg: '#EDF2F7',           // Header background
      titleText: '#2D3748',          // Title text
      topBarBg: '#E2E8F0',           // Top bar
      promptUser: '#2B6CB0',         // Blue username
      promptHost: '#6B46C1',         // Purple host
      promptPath: '#2F855A',         // Green path
      commandText: '#1A202C',        // Command text
      tableBorder: '#CBD5E0',        // Table border
      tableHeaderText: '#805AD5',    // Purple header
      skillName: '#3182CE',          // Blue skill name
      levelHigh: '#38A169',          // Green for high level
      levelMedium: '#D69E2E',        // Yellow for medium level
      levelLow: '#6B46C1',           // Purple for low level
      skillCursus: '#718096',        // Gray-blue for cursus
      footerText: '#718096'          // Footer text
    }
  };
  
  const theme = colors[themeName] || colors.dark;
  
  // Get username and format for display
  const username = studentData.login || 'user';
  
  // Start SVG
  let svg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${config.width}" height="${calculatedHeight}" viewBox="0 0 ${config.width} ${calculatedHeight}">
    <defs>
      <!-- Define patterns -->
      <pattern id="subtlePattern" width="50" height="50" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="50" height="50" fill="${theme.background}" />
        <rect width="1" height="1" fill="${themeName === 'dark' ? '#2E3440' : '#E2E8F0'}" x="0" y="0" />
      </pattern>
      
      <!-- Glow filters -->
      <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      
      <filter id="cursusGlow" x="-10%" y="-10%" width="120%" height="140%">
        <feGaussianBlur stdDeviation="1" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    <style>
      .terminal-font { font-family: "JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", monospace; }
      .username { fill: ${theme.promptUser}; filter: url(#textGlow); }
      .cursus-header { filter: url(#cursusGlow); }
      .skill-row:hover { opacity: 0.9; }
    </style>
    
    <!-- Terminal window with enhanced shadow -->
    <filter id="window-shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.4" flood-color="${themeName === 'dark' ? '#000000' : '#A0AEC0'}" />
    </filter>
    <rect width="${config.width}" height="${calculatedHeight}" fill="${theme.windowBorder}" rx="8" ry="8" filter="url(#window-shadow)" />
    
    <!-- Terminal window background with subtle pattern -->
    <rect x="1" y="1" width="${config.width - 2}" height="${calculatedHeight - 2}" fill="url(#subtlePattern)" rx="7" ry="7" />
    
    <!-- Terminal header with solid color -->
    <rect x="1" y="1" width="${config.width - 2}" height="${headerHeight}" fill="${theme.headerBg}" rx="7" ry="7" />
    
    <!-- Traffic lights with subtle glow -->
    <circle cx="20" cy="${headerHeight/2}" r="6" fill="#FF5F56">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="40" cy="${headerHeight/2}" r="6" fill="#FFBD2E">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" begin="0.3s" />
    </circle>
    <circle cx="60" cy="${headerHeight/2}" r="6" fill="#27C93F">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" begin="0.6s" />
    </circle>
    
    <text x="${config.width / 2}" y="${headerHeight/2 + 5}" text-anchor="middle" fill="${theme.titleText}" font-size="13" class="terminal-font" font-weight="bold">
      ${escapeXml(username)}@42 — skills
    </text>
  `;
  
  // Top bar
  svg += `
    <rect x="1" y="${headerHeight + 1}" width="${config.width - 2}" height="${topBarHeight}" fill="${theme.topBarBg}" />
  `;
  
  // Command line with animated cursor
  svg += `
    <g transform="translate(12, ${headerHeight + topBarHeight + 25})">
      <text font-size="14" class="terminal-font">
        <tspan class="username">${escapeXml(username)}</tspan>
        <tspan fill="${theme.promptHost}">@42:</tspan>
        <tspan fill="${theme.promptPath}">~$</tspan>
        <tspan dx="8" fill="${theme.commandText}">ls -la skills --by-cursus</tspan>
        <tspan dx="4" fill="${theme.commandText}">
          <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" />|
        </tspan>
      </text>
    </g>
  `;
  
  // Table header with separator line
  const tableY = headerHeight + topBarHeight + commandHeight;
  svg += `
    <line x1="1" y1="${tableY}" x2="${config.width - 1}" y2="${tableY}" stroke="${theme.tableBorder}" stroke-width="1" />
  `;
  
  // Column positions - adjust based on description availability
  let hasDescriptions = false;

  // Check if any skill has a description
  for (const cursusSkills of Object.values(skillsByCursus)) {
    for (const skill of cursusSkills) {
      if (skill.description) {
        hasDescriptions = true;
        break;
      }
    }
    if (hasDescriptions) break;
  }

  const skillColX = 12;
  const levelColX = hasDescriptions ? Math.round(config.width * 0.6) - 100 : Math.round(config.width * 0.8);
  const descColX = Math.round(config.width * 0.6);
  
  // Table headers
  svg += `
    <g transform="translate(0, ${tableY + 28})">
      <text font-size="13" font-weight="bold" class="terminal-font">
        <tspan x="${skillColX}" fill="${theme.tableHeaderText}">SKILL</tspan>
        <tspan x="${levelColX}" fill="${theme.tableHeaderText}">LEVEL</tspan>
        ${hasDescriptions ? `<tspan x="${descColX}" fill="${theme.tableHeaderText}">DESCRIPTION</tspan>` : ''}
      </text>
    </g>
    <line x1="1" y1="${tableY + tableHeaderHeight - 5}" x2="${config.width - 1}" y2="${tableY + tableHeaderHeight - 5}" stroke="${theme.tableBorder}" stroke-width="1" />
  `;
  
  // Add skills grouped by cursus
  let rowY = tableY + tableHeaderHeight;
  
  // Process each cursus group
  Object.entries(skillsByCursus).forEach(([cursusName, cursusSkills]) => {
    // Add cursus header with enhanced styling
    svg += `
      <g transform="translate(0, ${rowY + config.lineHeight/2 + 5})">
        <text font-size="13" font-weight="bold" class="terminal-font cursus-header">
          <tspan x="${skillColX}" fill="${theme.skillCursus}">/* ${escapeXml(cursusName)} */</tspan>
        </text>
      </g>
    `;
    
    // Add separator line
    svg += `
      <line x1="1" y1="${rowY + config.lineHeight}" x2="${config.width - 1}" y2="${rowY + config.lineHeight}" stroke="${theme.tableBorder}" stroke-width="1" />
    `;
    
    rowY += config.lineHeight;
    
    // Add skills for this cursus
    cursusSkills.forEach(skill => {
      // Calculate level color based on value
      let levelColor = theme.levelLow;
      if (skill.level >= 8) {
        levelColor = theme.levelHigh;
      } else if (skill.level >= 5) {
        levelColor = theme.levelMedium;
      }
      
      // Add skill row with enhanced styling and gradient background for skills
      const skillRowY = rowY + config.lineHeight/2 + 5;
      const rowBgHeight = 24;
      const rowOpacity = themeName === 'dark' ? '0.1' : '0.05';
      
      // Calculate skill level percentage for progress indicator
      const levelPercent = Math.min(skill.level * 10, 100);
      const barWidth = (config.width - 24) * (levelPercent / 100);
      
      svg += `
        <g class="skill-row">
          <!-- Subtle background highlight for the row -->
          <rect x="4" y="${skillRowY - 15}" width="${config.width - 8}" height="${rowBgHeight}" 
                fill="${levelColor}" opacity="${rowOpacity}" rx="3" ry="3" />
          
          <!-- Subtle skill level indicator -->
          <rect x="4" y="${skillRowY - 15 + rowBgHeight - 2}" width="${barWidth}" height="2" 
                fill="${levelColor}" opacity="0.5" />
          
          <text transform="translate(0, ${skillRowY})" font-size="13" class="terminal-font">
            <tspan x="${skillColX}" fill="${theme.skillName}">${escapeXml(skill.name)}</tspan>
            <tspan x="${levelColX}" fill="${levelColor}" font-weight="bold">${skill.level.toFixed(2)}</tspan>
            ${skill.description ? `<tspan x="${descColX}" fill="${theme.skillCursus}">${escapeXml(skill.description)}</tspan>` : ''}
          </text>
        </g>
      `;
      
      // Add separator line after each row
      svg += `
        <line x1="1" y1="${rowY + config.lineHeight}" x2="${config.width - 1}" y2="${rowY + config.lineHeight}" stroke="${theme.tableBorder}" stroke-width="1" />
      `;
      
      rowY += config.lineHeight;
    });
  });
  
  // Footer with enhanced styling
  svg += `
    <rect x="1" y="${calculatedHeight - 40}" width="${config.width - 2}" height="39" 
          fill="${themeName === 'dark' ? '#252933' : '#EDF2F7'}" opacity="0.7" />
    <text x="${config.width/2}" y="${calculatedHeight - 15}" font-size="11" text-anchor="middle" 
          fill="${theme.footerText}" class="terminal-font">
      Generated with <tspan fill="${theme.promptUser}">42widgets</tspan> • ${new Date().toISOString().split('T')[0]}
    </text>
  `;
  
  // Close SVG
  svg += `</svg>`;
  
  return svg;
}

/**
 * Generate a terminal error message
 */
export function generateErrorSVG(message, themeName = 'dark') {
  const theme = {
    dark: {
      background: '#151718',
      windowBorder: '#000000',
      headerBg: '#1A1D1E',
      titleText: '#EEEEEE',
      promptUser: '#87D441',
      promptHost: '#87AFAF',
      promptPath: '#5F819D',
      commandText: '#FFFFFF',
      errorText: '#E06C75'
    },
    light: {
      background: '#FFFFFF',
      windowBorder: '#CCCCCC',
      headerBg: '#F0F0F0',
      titleText: '#333333',
      promptUser: '#118811',
      promptHost: '#555555',
      promptPath: '#0366D6',
      commandText: '#000000',
      errorText: '#CB2431'
    }
  }[themeName] || {
    background: '#151718',
    windowBorder: '#000000',
    headerBg: '#1A1D1E',
    titleText: '#EEEEEE',
    promptUser: '#87D441',
    promptHost: '#87AFAF',
    promptPath: '#5F819D',
    commandText: '#FFFFFF',
    errorText: '#E06C75'
  };
  
  const width = 500;
  const height = 200;
  
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <!-- Error message glow -->
      <filter id="errorGlow" x="-10%" y="-10%" width="120%" height="140%">
        <feGaussianBlur stdDeviation="1" result="blur" />
        <feFlood flood-color="#FF79C6" flood-opacity="0.3" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feComposite in="SourceGraphic" in2="glow" operator="over" />
      </filter>
      
      <!-- Subtle pattern for background -->
      <pattern id="subtlePattern" width="50" height="50" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="50" height="50" fill="${theme.background}" />
        <rect width="1" height="1" fill="${themeName === 'dark' ? '#2E3440' : '#E2E8F0'}" x="0" y="0" />
      </pattern>
    </defs>
  
    <style>
      .terminal-font { font-family: "JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", monospace; }
      .username { fill: ${theme.promptUser}; }
      @keyframes blink { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
      .cursor { animation: blink 1.2s infinite; }
    </style>
    
    <!-- Terminal window with enhanced shadow -->
    <filter id="window-shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.4" flood-color="${themeName === 'dark' ? '#000000' : '#A0AEC0'}" />
    </filter>
    <rect width="${width}" height="${height}" fill="${theme.windowBorder}" rx="8" ry="8" filter="url(#window-shadow)" />
    
    <!-- Terminal window background with subtle pattern -->
    <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="url(#subtlePattern)" rx="7" ry="7" />
    
    <!-- Terminal header with solid color -->
    <rect x="1" y="1" width="${width - 2}" height="40" fill="${theme.headerBg}" rx="7" ry="7" />
    
    <!-- Traffic lights with subtle glow -->
    <circle cx="20" cy="20" r="6" fill="#FF5F56">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="40" cy="20" r="6" fill="#FFBD2E">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" begin="0.3s" />
    </circle>
    <circle cx="60" cy="20" r="6" fill="#27C93F">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" begin="0.6s" />
    </circle>
    
    <text x="${width / 2}" y="25" text-anchor="middle" fill="${theme.titleText}" font-size="13" class="terminal-font" font-weight="bold">
      error — bash
    </text>
    
    <!-- Command prompt -->
    <text x="15" y="70" font-size="14" class="terminal-font">
      <tspan class="username">user</tspan>
      <tspan fill="${theme.promptHost}">@42:</tspan>
      <tspan fill="${theme.promptPath}">~$</tspan>
      <tspan dx="8" fill="${theme.commandText}">skills --user</tspan>
      <tspan class="cursor" dx="4">|</tspan>
    </text>
    
    <!-- Error message with styled box -->
    <rect x="10" y="85" width="${width - 20}" height="40" rx="4" ry="4" 
          fill="${themeName === 'dark' ? 'rgba(189, 147, 249, 0.1)' : 'rgba(183, 148, 244, 0.1)'}" 
          stroke="${theme.promptHost}" stroke-width="1" stroke-opacity="0.3" />
    
    <text x="20" y="110" font-size="14" fill="${theme.promptHost}" class="terminal-font" filter="url(#errorGlow)">
      <tspan>⚠ Error: ${escapeXml(message)}</tspan>
    </text>
    
    <!-- Footer -->
    <rect x="1" y="${height - 30}" width="${width - 2}" height="29" 
          fill="${themeName === 'dark' ? '#252933' : '#EDF2F7'}" opacity="0.7" />
    <text x="${width/2}" y="${height - 10}" font-size="11" text-anchor="middle" fill="${theme.footerText}" class="terminal-font">
      Please try again with a valid username
    </text>
  </svg>
  `;
}

export default {
  generateTerminalSkills,
  generateErrorSVG
};
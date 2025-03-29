/**
 * Enhanced and Optimized Terminal Skills Visualization
 * GitHub-compatible version
 */

// Helper to escape XML special characters
const escapeXml = (unsafe) => unsafe?.replace(/[<>&'"]/g, c => 
  ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;'
  }[c])) || '';

// Theme configurations - more authentic terminal colors
const THEMES = {
  dark: {
    bg: '#0D1117',
    windowBorder: '#000000',
    headerBg: '#161B22',
    titleText: '#C9D1D9',
    topBarBg: '#161B22',
    promptUser: '#39D353',
    promptHost: '#58A6FF',
    promptPath: '#58A6FF',
    commandText: '#C9D1D9',
    tableBorder: '#30363D',
    tableHeader: '#FF7B72',
    skillName: '#79C0FF',
    levelHigh: '#39D353',
    levelMedium: '#FFCA28',
    levelLow: '#8B949E',
    skillCursus: '#7D8590',
    errorText: '#FF7B72',
    gradientStart: '#0D1117',
    gradientEnd: '#0D1117'
  },
  light: {
    bg: '#F6F8FA',
    windowBorder: '#D0D7DE',
    headerBg: '#F6F8FA',
    titleText: '#24292F',
    topBarBg: '#F6F8FA',
    promptUser: '#0969DA',
    promptHost: '#8250DF',
    promptPath: '#0969DA',
    commandText: '#24292F',
    tableBorder: '#D0D7DE',
    tableHeader: '#CF222E',
    skillName: '#0969DA',
    levelHigh: '#1A7F37',
    levelMedium: '#9A6700',
    levelLow: '#57606A',
    skillCursus: '#57606A',
    errorText: '#CF222E',
    gradientStart: '#F6F8FA',
    gradientEnd: '#F6F8FA'
  }
};

/**
 * Generate terminal-style visualization for student skills
 * GitHub-compatible version
 */
export function generateTerminalSkills(studentData, themeName = 'dark', options = {}) {
  // Default configuration
  const config = {
    width: options.width || 800,
    maxSkills: options.maxSkills || 100,
    lineHeight: options.lineHeight || 26,
    padding: options.padding || 20,
    ...options
  };

  // Extract and prepare skills data
  let allSkills = [];
  Object.entries(studentData.skills || {}).forEach(([cursusName, cursusSkills]) => {
    allSkills = [...allSkills, ...cursusSkills.map(skill => ({ ...skill, cursus: cursusName }))];
  });

  // Handle empty data case
  if (allSkills.length === 0) {
    return generateErrorSVG('No skills data available', themeName);
  }

// Sort and organize skills by cursus
const sortedSkills = allSkills.sort((a, b) => b.level - a.level).slice(0, config.maxSkills);
  
// Group skills by cursus
const skillsByCursus = {};
sortedSkills.forEach(skill => {
  if (!skillsByCursus[skill.cursus]) skillsByCursus[skill.cursus] = [];
  skillsByCursus[skill.cursus].push(skill);
});

// Ensure Piscine comes first, followed by other cursus
const orderedCursusNames = Object.keys(skillsByCursus).sort((a, b) => {
  if (a.toLowerCase().includes('piscine')) return -1;
  if (b.toLowerCase().includes('piscine')) return 1;
  return a.localeCompare(b);
});

// Calculate layout
const headerHeight = 36;
const topBarHeight = 20;
const commandHeight = 32;
const tableHeaderHeight = 32;
const cursusHeadersHeight = orderedCursusNames.length * config.lineHeight;
const skillsRowsHeight = sortedSkills.length * config.lineHeight;
const footerHeight = 36;

const calculatedHeight = headerHeight + topBarHeight + commandHeight + 
                        tableHeaderHeight + cursusHeadersHeight + 
                        skillsRowsHeight + footerHeight;

// Get theme
const theme = THEMES[themeName] || THEMES.dark;

// Get username
const username = studentData.login || 'user';

// Start building SVG - GITHUB-COMPATIBLE VERSION
let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${config.width}" height="${calculatedHeight}" viewBox="0 0 ${config.width} ${calculatedHeight}">

<!-- Terminal window -->
<rect width="${config.width}" height="${calculatedHeight}" fill="${theme.windowBorder}" rx="6" ry="6" />
<rect x="1" y="1" width="${config.width - 2}" height="${calculatedHeight - 2}" fill="${theme.bg}" rx="5" ry="5" />

<!-- Terminal header -->
<rect x="1" y="1" width="${config.width - 2}" height="${headerHeight}" fill="${theme.headerBg}" rx="5" ry="5" />

<!-- Traffic lights -->
<g transform="translate(20, ${headerHeight/2})">
  <circle cx="0" cy="0" r="6" fill="#FF5F56" stroke="#E0443E" stroke-width="0.5" />
  <circle cx="20" cy="0" r="6" fill="#FFBD2E" stroke="#DEA123" stroke-width="0.5" />
  <circle cx="40" cy="0" r="6" fill="#27C93F" stroke="#1AAB29" stroke-width="0.5" />
</g>

<!-- Title -->
<text x="${config.width / 2}" y="${headerHeight/2 + 5}" text-anchor="middle" fill="${theme.titleText}" font-size="13" font-family="monospace" font-weight="bold">
  ${escapeXml(username)}@42 — skills
</text>

<!-- Command line -->
<g transform="translate(${config.padding}, ${headerHeight + topBarHeight + 20})">
  <text font-size="14" font-family="monospace">
    <tspan fill="${theme.promptUser}">${escapeXml(username)}</tspan>
    <tspan fill="${theme.promptHost}">@42:</tspan>
    <tspan fill="${theme.promptPath}">~$</tspan>
    <tspan dx="8" fill="${theme.commandText}">ls -la ./skills </tspan>
    <tspan fill="${theme.promptUser}">▋</tspan>
  </text>
</g>`;

// Table header setup
const tableY = headerHeight + topBarHeight + commandHeight;
const colPadding = config.padding;
const skillColX = colPadding;
const levelColX = config.width * 0.65;

// Add table separator - use sharp straight line for authentic terminal look
svg += `<line x1="0" y1="${tableY}" x2="${config.width}" y2="${tableY}" stroke="${theme.tableBorder}" stroke-width="1" />`;

// Table headers
svg += `
<g transform="translate(0, ${tableY + 22})">
  <text font-size="13" font-weight="bold" font-family="monospace">
    <tspan x="${skillColX}" fill="${theme.tableHeader}">SKILL</tspan>
    <tspan x="${levelColX}" fill="${theme.tableHeader}">LEVEL</tspan>
  </text>
</g>
<line x1="0" y1="${tableY + tableHeaderHeight - 5}" x2="${config.width}" y2="${tableY + tableHeaderHeight - 5}" stroke="${theme.tableBorder}" stroke-width="1" />`;

// Add skills grouped by cursus (with Piscine first)
let rowY = tableY + tableHeaderHeight;

// Process each cursus group in the ordered list
orderedCursusNames.forEach(cursusName => {
  const cursusSkills = skillsByCursus[cursusName];
  
  // Add cursus header with terminal-style comment
  svg += `
  <g transform="translate(0, ${rowY + config.lineHeight/2 + 4})">
    <text font-size="14" font-family="monospace">
      <tspan x="${skillColX}" fill="${theme.skillCursus}">/* ${escapeXml(cursusName)} */</tspan>
    </text>
  </g>
  <line x1="${colPadding}" y1="${rowY + config.lineHeight}" x2="${config.width - colPadding}" y2="${rowY + config.lineHeight}" 
        stroke="${theme.tableBorder}" stroke-width="1" stroke-dasharray="2,1" opacity="0.5" />`;
  
  rowY += config.lineHeight;
  
  // Add skills for this cursus
  cursusSkills.forEach(skill => {
    // Determine level color based on proficiency
    let levelColor = theme.levelLow;
    if (skill.level >= 10) {
      levelColor = theme.levelHigh;
    } else if (skill.level >= 6) {
      levelColor = theme.levelMedium;
    }
    
    // Add skill row
    const skillRowY = rowY + config.lineHeight/2 + 4;
    
    svg += `
    <g transform="translate(0, ${skillRowY})">
      <text font-size="13" font-family="monospace">
        <tspan x="${skillColX}" fill="${theme.skillName}">${escapeXml(skill.name)}</tspan>
        <tspan x="${levelColX}" fill="${levelColor}">${skill.level.toFixed(2)}</tspan>
      </text>
    </g>`;
    
    // Only add thin separator between skills (no rounded corners for more terminal-like appearance)
    if (cursusSkills.indexOf(skill) < cursusSkills.length - 1) {
      svg += `<line x1="0" y1="${rowY + config.lineHeight}" x2="${config.width}" y2="${rowY + config.lineHeight}" 
            stroke="${theme.tableBorder}" stroke-width="1" opacity="0.15" />`;
    }
    
    rowY += config.lineHeight;
  });
  
  // Add stronger line between cursus sections
  svg += `<line x1="0" y1="${rowY}" x2="${config.width}" y2="${rowY}" stroke="${theme.tableBorder}" stroke-width="1" />`;
});

svg += "\n</svg>";
return svg;
}

/**
* Generate terminal error message
* GitHub-compatible version
*/
export function generateErrorSVG(message, themeName = 'dark') {
const errorWidth = 500;
const errorHeight = 200;
const theme = THEMES[themeName] || THEMES.dark;

return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${errorWidth}" height="${errorHeight}" viewBox="0 0 ${errorWidth} ${errorHeight}">
<!-- Terminal window -->
<rect width="${errorWidth}" height="${errorHeight}" fill="${theme.windowBorder}" rx="6" ry="6" />
<rect x="1" y="1" width="${errorWidth - 2}" height="${errorHeight - 2}" fill="${theme.bg}" rx="5" ry="5" />

<!-- Terminal header -->
<rect x="1" y="1" width="${errorWidth - 2}" height="36" fill="${theme.headerBg}" rx="5" ry="5" />

<!-- Traffic lights -->
<circle cx="20" cy="18" r="6" fill="#FF5F56" stroke="#E0443E" stroke-width="0.5" />
<circle cx="40" cy="18" r="6" fill="#FFBD2E" stroke="#DEA123" stroke-width="0.5" />
<circle cx="60" cy="18" r="6" fill="#27C93F" stroke="#1AAB29" stroke-width="0.5" />

<text x="${errorWidth / 2}" y="22" text-anchor="middle" fill="${theme.titleText}" font-size="13" font-family="monospace" font-weight="bold">
  error — bash
</text>

<!-- Command prompt -->
<text x="15" y="60" font-size="14" font-family="monospace">
  <tspan fill="${theme.promptUser}">user</tspan>
  <tspan fill="${theme.promptHost}">@42:</tspan>
  <tspan fill="${theme.promptPath}">~$</tspan>
  <tspan dx="8" fill="${theme.commandText}">skills --user</tspan>
  <tspan dx="4">|</tspan>
</text>

<!-- Error message -->
<rect x="15" y="75" width="${errorWidth - 30}" height="50" rx="0" ry="0" 
      fill="${themeName === 'dark' ? 'rgba(255, 123, 114, 0.1)' : 'rgba(207, 34, 46, 0.1)'}" 
      stroke="${theme.errorText}" stroke-width="1" stroke-opacity="0.3" />

<text x="25" y="105" font-size="14" fill="${theme.errorText}" font-family="monospace">
  <tspan>error: ${escapeXml(message)}</tspan>
</text>

<!-- Return code -->
<text x="15" y="150" font-size="14" font-family="monospace">
  <tspan fill="${theme.promptUser}">user</tspan>
  <tspan fill="${theme.promptHost}">@42:</tspan>
  <tspan fill="${theme.promptPath}">~$</tspan>
  <tspan dx="8" fill="${theme.commandText}">echo $?</tspan>
</text>

<text x="15" y="175" font-size="14" fill="${theme.commandText}" font-family="monospace">
  <tspan>1</tspan>
</text>
</svg>`;
}

export default {
generateTerminalSkills,
generateErrorSVG
};
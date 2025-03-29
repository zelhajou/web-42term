/**
 * Fixed Terminal Projects Visualization
 * Properly displays completed projects with team info and sorts by completion date
 */

// Helper to escape XML special characters
const escapeXml = (unsafe) => unsafe?.replace(/[<>&'\"]/g, c => 
  ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "\'": '&apos;',
    '\"': '&quot;'
  }[c])) || '';

// Terminal theme colors
const THEMES = {
  dark: {
    bg: '#0D1117',
    windowBorder: '#000000',
    headerBg: '#161B22',
    titleText: '#C9D1D9',
    promptUser: '#39D353',
    promptHost: '#58A6FF',
    promptPath: '#58A6FF',
    commandText: '#C9D1D9',
    tableBorder: '#30363D',
    tableHeader: '#FF7B72',
    projectName: '#79C0FF',
    projectMark: {
      high: '#39D353',     // Green for high marks (≥ 100)
      passed: '#FFCA28',   // Yellow for passed projects (< 100)
      failed: '#F85149'    // Red for failed projects
    },
    teamBadge: '#D2A8FF',  // Purple for team projects
    soloBadge: '#79C0FF',  // Blue for solo projects
    dateText: '#8B949E',   // Subtle color for date
    skillCursus: '#8B949E',
    footerText: '#8B949E',
    errorText: '#F85149'
  },
  light: {
    bg: '#F6F8FA',
    windowBorder: '#D0D7DE',
    headerBg: '#F6F8FA',
    titleText: '#24292F',
    promptUser: '#0969DA',
    promptHost: '#8250DF',
    promptPath: '#0969DA',
    commandText: '#24292F',
    tableBorder: '#D0D7DE',
    tableHeader: '#CF222E',
    projectName: '#0969DA',
    projectMark: {
      high: '#1A7F37',      // Green for high marks (≥ 100)
      passed: '#9A6700',    // Yellow for passed projects (< 100)
      failed: '#CF222E'     // Red for failed projects
    },
    teamBadge: '#8250DF',   // Purple for team projects
    soloBadge: '#0969DA',   // Blue for solo projects
    dateText: '#57606A',    // Subtle color for date
    skillCursus: '#57606A',
    footerText: '#57606A',
    errorText: '#CF222E'
  }
};

// SVG definitions for terminal styling
const getSvgDefs = (themeName) => {
  const theme = THEMES[themeName] || THEMES.dark;
  return `
  <defs>
    <!-- Subtle scanlines for CRT effect -->
    <pattern id="scanlines" patternUnits="userSpaceOnUse" width="100%" height="2" patternTransform="rotate(0)">
      <rect width="100%" height="1" fill="#000" fill-opacity="0.04" />
    </pattern>
    
    <!-- Very subtle noise texture -->
    <filter id="noise" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" stitchTiles="stitch" result="noise"/>
      <feColorMatrix type="matrix" values="0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.05 0" result="coloredNoise"/>
      <feComposite operator="in" in2="SourceGraphic" in="coloredNoise" result="monoNoise"/>
      <feBlend in="SourceGraphic" in2="monoNoise" mode="multiply"/>
    </filter>
    
    <!-- Window shadow -->
    <filter id="window-shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.3" flood-color="#000000" />
    </filter>
    
    <!-- Cursor glow -->
    <filter id="cursor-glow">
      <feGaussianBlur stdDeviation="0.5" />
      <feComponentTransfer>
        <feFuncA type="linear" slope="5" intercept="0" />
      </feComponentTransfer>
      <feBlend in="SourceGraphic" mode="screen" />
    </filter>
  </defs>
  
  <style>
    .terminal-font { font-family: "Menlo", "Monaco", "Consolas", "Courier New", monospace; }
    .cursor-blink { animation: blink 1.2s infinite steps(1); }
    @keyframes blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
  </style>`;
};

/**
 * Get appropriate color for a project mark
 */
const getMarkColor = (mark, theme) => {
  if (mark >= 100) {
    return theme.projectMark.high;
  } else if (mark > 0) {
    return theme.projectMark.passed;
  } else {
    return theme.projectMark.failed;
  }
};

/**
 * Format a date in a readable format
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Generate terminal-style visualization for validated student projects
 */
/**
 * Generate terminal-style visualization for validated student projects
 */
export function generateTerminalProjects(studentData, themeName = 'dark', options = {}) {
  // Default configuration
  const config = {
    width: options.width || 800,
    lineHeight: options.lineHeight || 26,
    padding: options.padding || 20,
    maxProjects: options.maxProjects || 50,
    includePiscine: options.includePiscine || false
  };

  // Get username
  const username = studentData.login || 'user';

  // Get all projects that have a status of 'finished'
  let projects = [];

  // Define cursus name mapping
  const CURSUS_NAMES = {
    9: 'C Piscine',
    21: '42 Cursus',
    67: '42 Events'
  };

  // Check for projects directly in studentData or in projects_users array
  if (studentData.projects_users && Array.isArray(studentData.projects_users)) {
    console.log(`Processing ${studentData.projects_users.length} total projects`);
    
    // 1. First, extract all project data before filtering
    const allProjects = studentData.projects_users.map(p => {
      // Handle different project data structures
      const projectName = p.project ? p.project.name : (p.project_name || 'Unknown Project');
      
      // Handle team information with safety checks
      const teams = p.teams || [];
      const firstTeam = teams.length > 0 ? teams[0] : null;
      const teamUsers = firstTeam && firstTeam.users ? firstTeam.users : [];
      const isTeam = teamUsers.length > 1;
      
      // More accurate cursus name determination
      let cursusName = 'Other';
      if (p.cursus_ids && p.cursus_ids.length > 0) {
        const firstCursusId = p.cursus_ids[0];
        cursusName = CURSUS_NAMES[firstCursusId] || `Cursus ${firstCursusId}`;
      }
      
      return {
        // Original project data (preserve for filtering)
        original: p,
        // Processed properties
        name: projectName,
        finalMark: p.final_mark,
        status: p.status,
        validated: p.validated === true || p["validated?"] === true,
        completionDate: p.marked_at || p.updated_at,
        isTeam: isTeam,
        teamSize: teamUsers.length || 1,
        teamName: firstTeam ? firstTeam.name : null,
        cursusIds: p.cursus_ids || [],
        cursusName: cursusName
      };
    });
    
    console.log(`Mapped ${allProjects.length} projects`);
    
    // 2. Now apply filtering for COMPLETED projects only
    projects = allProjects.filter(p => 
      // Filter for finished status
      p.original.status === 'finished' && 
      // Check for validation
      p.validated &&
      // Include projects with a final mark (not null)
      p.original.final_mark !== null
    );
    
    console.log(`Found ${projects.length} COMPLETED projects after filtering`);
    
    // 3. Sort by completion date (newest first)
    projects.sort((a, b) => {
      if (!a.completionDate) return 1;
      if (!b.completionDate) return -1;
      return new Date(b.completionDate) - new Date(a.completionDate);
    });
    
    // 4. Filter Piscine projects if not included
    if (!config.includePiscine) {
      const beforeCount = projects.length;
      projects = projects.filter(p => p.cursusName !== 'C Piscine');
      console.log(`Filtered out ${beforeCount - projects.length} Piscine projects`);
    }
    
    // 5. Limit to max projects for display
    if (projects.length > config.maxProjects) {
      console.log(`Limiting display to ${config.maxProjects} projects (from ${projects.length})`);
      projects = projects.slice(0, config.maxProjects);
    }
  }

  // Handle no projects case
  if (projects.length === 0) {
    return generateErrorSVG('No completed projects found', themeName);
  }

  // Group projects by cursus
  const projectsByCursus = {};
  
  projects.forEach(project => {
    if (!projectsByCursus[project.cursusName]) {
      projectsByCursus[project.cursusName] = [];
    }
    projectsByCursus[project.cursusName].push(project);
  });
  
  // Sort cursus names to ensure consistent order (42 Cursus first, then others)
  const orderedCursusNames = Object.keys(projectsByCursus).sort((a, b) => {
    if (a === '42 Cursus') return -1;
    if (b === '42 Cursus') return 1;
    return a.localeCompare(b);
  });

  // Calculate layout dimensions
  const headerHeight = 36;
  const topBarHeight = 20;
  const commandHeight = 32;
  const tableHeaderHeight = 32;
  const cursusHeadersHeight = Object.keys(projectsByCursus).length * config.lineHeight;
  const projectsRowsHeight = projects.length * config.lineHeight;
  const footerHeight = 50; // Increased footer height
  
  const calculatedHeight = headerHeight + topBarHeight + commandHeight + 
                          tableHeaderHeight + cursusHeadersHeight + 
                          projectsRowsHeight + footerHeight + 20;

  // Get theme
  const theme = THEMES[themeName] || THEMES.dark;

  // Get total projects data
  const totalProjects = projects.length;
  const totalTeamProjects = projects.filter(p => p.isTeam).length;
  const totalSoloProjects = totalProjects - totalTeamProjects;
  const highestMark = Math.max(...projects.map(p => p.finalMark));
  
  // Start building SVG
  let svg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${config.width}" height="${calculatedHeight}" viewBox="0 0 ${config.width} ${calculatedHeight}">
  ${getSvgDefs(themeName)}
  
  <!-- Terminal window -->
  <rect width="${config.width}" height="${calculatedHeight}" fill="${theme.windowBorder}" rx="6" ry="6" filter="url(#window-shadow)" />
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
  <text x="${config.width / 2}" y="${headerHeight/2 + 5}" text-anchor="middle" fill="${theme.titleText}" font-size="13" class="terminal-font" font-weight="bold">
    ${escapeXml(username)}@42 — projects
  </text>
  
  <!-- Command line -->
  <g transform="translate(${config.padding}, ${headerHeight + topBarHeight + 20})">
    <text font-size="14" class="terminal-font">
      <tspan fill="${theme.promptUser}">${escapeXml(username)}</tspan>
      <tspan fill="${theme.promptHost}">@42:</tspan>
      <tspan fill="${theme.promptPath}">~$</tspan>
      <tspan dx="8" fill="${theme.commandText}">ls -la ./projects | grep "Completed" </tspan>
      <tspan class="cursor-blink" fill="${theme.promptUser}" filter="url(#cursor-glow)">▋</tspan>
    </text>
  </g>`;

  // Table header setup
  const tableY = headerHeight + topBarHeight + commandHeight;
  const colPadding = config.padding;
  const projectColX = colPadding;
  const typeColX = Math.floor(config.width * 0.45);
  const dateColX = Math.floor(config.width * 0.60);
  const markColX = Math.floor(config.width * 0.85);
  
  // Add table separator
  svg += `<line x1="0" y1="${tableY}" x2="${config.width}" y2="${tableY}" stroke="${theme.tableBorder}" stroke-width="1" />`;
  
  // Table headers
  svg += `
  <g transform="translate(0, ${tableY + 22})">
    <text font-size="13" font-weight="bold" class="terminal-font">
      <tspan x="${projectColX}" fill="${theme.tableHeader}">PROJECT</tspan>
      <tspan x="${typeColX}" fill="${theme.tableHeader}">TYPE</tspan>
      <tspan x="${dateColX}" fill="${theme.tableHeader}">DATE</tspan>
      <tspan x="${markColX}" fill="${theme.tableHeader}">MARK</tspan>
    </text>
  </g>
  <line x1="0" y1="${tableY + tableHeaderHeight - 5}" x2="${config.width}" y2="${tableY + tableHeaderHeight - 5}" stroke="${theme.tableBorder}" stroke-width="1" />`;

  // Add projects grouped by cursus
  let rowY = tableY + tableHeaderHeight;

  // Process each cursus group in order
  orderedCursusNames.forEach(cursusName => {
    const cursusProjects = projectsByCursus[cursusName];
    
    // Add cursus header with terminal-style comment
    svg += `
    <g transform="translate(0, ${rowY + config.lineHeight/2 + 4})">
      <text font-size="14" class="terminal-font">
        <tspan x="${projectColX}" fill="${theme.skillCursus}">/* ${escapeXml(cursusName)} */</tspan>
      </text>
    </g>
    <line x1="${colPadding}" y1="${rowY + config.lineHeight}" x2="${config.width - colPadding}" y2="${rowY + config.lineHeight}" 
          stroke="${theme.tableBorder}" stroke-width="1" stroke-dasharray="2,1" opacity="0.5" />`;
    
    rowY += config.lineHeight;
    
    // Add projects for this cursus
    cursusProjects.forEach(project => {
      // Get mark color based on score
      const markColor = getMarkColor(project.finalMark, theme);
      
      // Format date
      const formattedDate = formatDate(project.completionDate);
      
      // Team or solo indicator and color
      const teamTypeText = project.isTeam ? `[TEAM:${project.teamSize}]` : '[SOLO]';
      const teamColor = project.isTeam ? theme.teamBadge : theme.soloBadge;
      
      // Add project row
      const projectRowY = rowY + config.lineHeight/2 + 4;
      
      svg += `
      <g transform="translate(0, ${projectRowY})">
        <text font-size="13" class="terminal-font">
          <tspan x="${projectColX}" fill="${theme.projectName}">${escapeXml(project.name)}</tspan>
          <tspan x="${typeColX}" fill="${teamColor}">${teamTypeText}</tspan>
          <tspan x="${dateColX}" fill="${theme.dateText}">${formattedDate}</tspan>
          <tspan x="${markColX}" fill="${markColor}">${project.finalMark}/100</tspan>
        </text>
      </g>`;
      
      // Add separator between projects
      if (cursusProjects.indexOf(project) < cursusProjects.length - 1) {
        svg += `<line x1="0" y1="${rowY + config.lineHeight}" x2="${config.width}" y2="${rowY + config.lineHeight}" 
              stroke="${theme.tableBorder}" stroke-width="1" opacity="0.15" />`;
      }
      
      rowY += config.lineHeight;
    });
    
    // Add stronger line between cursus sections
    svg += `<line x1="0" y1="${rowY}" x2="${config.width}" y2="${rowY}" stroke="${theme.tableBorder}" stroke-width="1" />`;
  });

  // Footer with authentic terminal finish - enhanced version
  svg += `
  <g transform="translate(${colPadding}, ${calculatedHeight - 40})">
    <text font-size="13" class="terminal-font">
      <tspan fill="${theme.promptUser}">${username}</tspan>
      <tspan fill="${theme.promptHost}">@42:</tspan>
      <tspan fill="${theme.promptPath}">~$</tspan>
      <tspan dx="5" fill="${theme.commandText}">echo $?</tspan>
    </text>
  </g>
  
  <g transform="translate(${colPadding}, ${calculatedHeight - 15})">
    <text font-size="14" class="terminal-font">
      <tspan fill="${theme.commandText}">0</tspan>
    </text>
  </g>
`;
  return svg;
}

/**
 * Generate terminal error message with authentic terminal styling
 */
export function generateErrorSVG(message, themeName = 'dark') {
  const errorWidth = 500;
  const errorHeight = 200;
  const theme = THEMES[themeName] || THEMES.dark;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${errorWidth}" height="${errorHeight}" viewBox="0 0 ${errorWidth} ${errorHeight}">
  <defs>
    <pattern id="scanlines" patternUnits="userSpaceOnUse" width="100%" height="2" patternTransform="rotate(0)">
      <rect width="100%" height="1" fill="#000" fill-opacity="0.04" />
    </pattern>
    
    <filter id="window-shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.3" flood-color="#000000" />
    </filter>
    
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" stitchTiles="stitch" result="noise"/>
      <feColorMatrix type="matrix" values="0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.05 0" result="coloredNoise"/>
      <feComposite operator="in" in2="SourceGraphic" in="coloredNoise" result="monoNoise"/>
      <feBlend in="SourceGraphic" in2="monoNoise" mode="multiply"/>
    </filter>
  </defs>

  <style>
    .terminal-font { font-family: "Menlo", "Monaco", "Consolas", "Courier New", monospace; }
    @keyframes blink { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
    .cursor { animation: blink 1.2s infinite; }
  </style>
  
  <!-- Terminal window -->
  <rect width="${errorWidth}" height="${errorHeight}" fill="${theme.windowBorder}" rx="6" ry="6" filter="url(#window-shadow)" />
  <rect x="1" y="1" width="${errorWidth - 2}" height="${errorHeight - 2}" fill="${theme.bg}" rx="5" ry="5" />
  
  <!-- Terminal header -->
  <rect x="1" y="1" width="${errorWidth - 2}" height="36" fill="${theme.headerBg}" rx="5" ry="5" />
  
  <!-- Traffic lights -->
  <circle cx="20" cy="18" r="6" fill="#FF5F56" stroke="#E0443E" stroke-width="0.5" />
  <circle cx="40" cy="18" r="6" fill="#FFBD2E" stroke="#DEA123" stroke-width="0.5" />
  <circle cx="60" cy="18" r="6" fill="#27C93F" stroke="#1AAB29" stroke-width="0.5" />
  
  <text x="${errorWidth / 2}" y="22" text-anchor="middle" fill="${theme.titleText}" font-size="13" class="terminal-font" font-weight="bold">
    error — bash
  </text>
  
  <!-- Command prompt -->
  <text x="15" y="60" font-size="14" class="terminal-font">
    <tspan fill="${theme.promptUser}">user</tspan>
    <tspan fill="${theme.promptHost}">@42:</tspan>
    <tspan fill="${theme.promptPath}">~$</tspan>
    <tspan dx="8" fill="${theme.commandText}">projects --validated</tspan>
    <tspan class="cursor" dx="4">|</tspan>
  </text>
  
  <!-- Error message -->
  <rect x="15" y="75" width="${errorWidth - 30}" height="50" rx="0" ry="0" 
        fill="${themeName === 'dark' ? 'rgba(255, 123, 114, 0.1)' : 'rgba(207, 34, 46, 0.1)'}" 
        stroke="${theme.errorText}" stroke-width="1" stroke-opacity="0.3" />
  
  <text x="25" y="105" font-size="14" fill="${theme.errorText}" class="terminal-font">
    <tspan>error: ${escapeXml(message)}</tspan>
  </text>
  
  <!-- Return code -->
  <text x="15" y="150" font-size="14" class="terminal-font">
    <tspan fill="${theme.promptUser}">user</tspan>
    <tspan fill="${theme.promptHost}">@42:</tspan>
    <tspan fill="${theme.promptPath}">~$</tspan>
    <tspan dx="8" fill="${theme.commandText}">echo $?</tspan>
  </text>
  
  <text x="15" y="175" font-size="14" fill="${theme.commandText}" class="terminal-font">
    <tspan>1</tspan>
  </text>
  
  <!-- Terminal effects -->
  <rect x="1" y="1" width="${errorWidth - 2}" height="${errorHeight - 2}" rx="5" ry="5" fill="url(#scanlines)" fill-opacity="0.5" />
  <rect x="0" y="0" width="${errorWidth}" height="${errorHeight}" fill="transparent" filter="url(#noise)" rx="6" ry="6" opacity="0.2" />
</svg>`;
}

export default {
  generateTerminalProjects,
  generateErrorSVG
};
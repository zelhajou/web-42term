/**
 * Terminal Student Generator with Level Display
 * Modified to be compatible with GitHub READMEs
 */

// Helper to escape XML special characters
const escapeXml = (unsafe) =>
  unsafe?.replace(
    /[<>&'\"]/g,
    (c) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[
        c
      ])
  ) || "";

// Terminal theme colors
const THEMES = {
  dark: {
    bg: "#0D1117",
    windowBorder: "#000000",
    headerBg: "#161B22",
    titleText: "#C9D1D9",
    promptUser: "#39D353",
    promptHost: "#58A6FF",
    promptPath: "#58A6FF",
    commandText: "#C9D1D9",
    tableBorder: "#30363D",
    tableHeader: "#FF7B72",
    labelText: "#8B949E",
    valueText: "#79C0FF",
    valueHighlight: "#39D353",
    valueWarning: "#FFCA28",
    valueError: "#F85149",
    levelHigh: "#39D353",
    levelMedium: "#FFCA28",
    levelLow: "#8B949E",
    sectionTitle: "#7D8590",
    coalitionColor: {
      Default: "#58A6FF",
      "The Alliance": "#00BABC",
      "The Assembly": "#FF6950",
      "The Order": "#9736E8",
      "The Federation": "#FFCD42",
      Commodore: "#39D353",
      Freax: "#FFCA28",
      Bios: "#00BABC",
    },
  },
  light: {
    bg: "#F6F8FA",
    windowBorder: "#D0D7DE",
    headerBg: "#F6F8FA",
    titleText: "#24292F",
    promptUser: "#0969DA",
    promptHost: "#8250DF",
    promptPath: "#0969DA",
    commandText: "#24292F",
    tableBorder: "#D0D7DE",
    tableHeader: "#CF222E",
    labelText: "#57606A",
    valueText: "#0969DA",
    valueHighlight: "#1A7F37",
    valueWarning: "#9A6700",
    valueError: "#CF222E",
    levelHigh: "#1A7F37",
    levelMedium: "#9A6700",
    levelLow: "#57606A",
    sectionTitle: "#57606A",
    coalitionColor: {
      Default: "#0969DA",
      "The Alliance": "#1F9598",
      "The Assembly": "#CF222E",
      "The Order": "#8250DF",
      "The Federation": "#9A6700",
      Commodore: "#1A7F37",
      Freax: "#9A6700",
      Bios: "#1F9598",
    },
  },
};

/**
 * Format a date to readable format
 */
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "N/A";
  }
};

/**
 * Calculate student stats
 */
const calculateStudentStats = (studentData) => {
  // Extract basic stats
  const userData = studentData.basic_info || studentData;
  
  const stats = {
    totalProjects: 0,
    completedProjects: 0,
    failedProjects: 0,
    inProgressProjects: 0,
    averageMark: 0,
    highestMark: 0,
    correctionPoints: userData.correction_point || 0,
    wallet: userData.wallet || 0,
    totalSkills: 0,
    skillsAverage: 0,
    accountAge: 0,
    level: 0
  };
  
  // Get user level - look for 42cursus first
  if (studentData.cursus_users && Array.isArray(studentData.cursus_users)) {
    console.log("Student cursus data available:", 
      studentData.cursus_users.map(c => `${c.cursus?.name || 'Unknown'} (Level: ${c.level || 'Unknown'})`).join(', ')
    );
    
    // Look for any cursus with name 42cursus
    let mainCursus = studentData.cursus_users.find(c => 
      c.cursus?.name === '42cursus'
    );
    
    if (mainCursus && typeof mainCursus.level === 'number') {
      stats.level = mainCursus.level;
      console.log(`Found 42cursus level: ${stats.level}`);
    } else {
      // Try with ID 21 (42 main curriculum)
      const cursusById = studentData.cursus_users.find(c => 
        c.cursus?.id === 21
      );
      
      if (cursusById && typeof cursusById.level === 'number') {
        stats.level = cursusById.level;
        console.log(`Found level by ID 21: ${stats.level}`);
      } else {
        // If we still don't have a level, get the highest one
        if (studentData.cursus_users.length > 0) {
          const sortedByLevel = [...studentData.cursus_users].sort((a, b) => 
            (b.level || 0) - (a.level || 0)
          );
          
          stats.level = sortedByLevel[0].level || 0;
          console.log(`Using highest level: ${stats.level} from ${sortedByLevel[0].cursus?.name || 'Unknown'}`);
        }
      }
    }
  } else {
    console.log("No cursus_users data found for level calculation");
  }
  
  // If level is still 0, look for a 'level' property directly on the student data
  // (This is useful when the level is injected by the API route)
  if (stats.level === 0 && studentData.level && typeof studentData.level === 'number') {
    stats.level = studentData.level;
    console.log(`Using directly injected level: ${stats.level}`);
  }
  
  // Add additional logging to display final calculated stats
  console.log("Final calculated stats:", {
    level: stats.level,
    projects: `${stats.completedProjects}/${stats.totalProjects}`,
    skills: stats.totalSkills
  });
  
  return stats;
};

/**
 * Get coalition information
 */
const getCoalitionData = (studentData) => {
  // Direct coalition property
  if (studentData.coalition) {
    return studentData.coalition;
  }

  // Coalitions array
  if (
    studentData.coalitions &&
    Array.isArray(studentData.coalitions) &&
    studentData.coalitions.length > 0
  ) {
    return studentData.coalitions[0];
  }

  return null;
};

/**
 * Generate terminal-style visualization for student information
 * GitHub-compatible version
 */
export function generateTerminalStudent(
  studentData,
  themeName = "dark",
  options = {}
) {
  console.log(
    `Generating terminal student widget for: ${studentData.login || "Unknown"}`
  );

  // Default configuration
  const config = {
    width: options.width || 800,
    lineHeight: 30,
    padding: options.padding || 40,
    ...options,
  };

  // Extract user data
  const userData = studentData.basic_info || studentData;
  const username = userData.login || "user";
  const displayName =
    userData.displayname ||
    userData.displayName ||
    userData.usual_full_name ||
    username;

  // Calculate stats and get coalition
  const stats = calculateStudentStats(studentData);
  const coalition = getCoalitionData(studentData);
  const coalitionName = coalition?.name || "Default";

  // Calculate layout dimensions
  const headerHeight = 36;
  const topBarHeight = 20;
  const commandHeight = 50;
  const basicInfoHeight = 200;
  const statsHeight = 200;
  const coalitionHeight = coalition ? 90 : 0;
  const footerHeight = 20;

  const calculatedHeight =
    headerHeight +
    topBarHeight +
    commandHeight +
    basicInfoHeight +
    statsHeight +
    coalitionHeight +
    footerHeight +
    20;

  // Get theme
  const theme = THEMES[themeName] || THEMES.dark;

  // Start building SVG - GITHUB COMPATIBLE VERSION (removed XML declaration)
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${
    config.width
  }" height="${calculatedHeight}" viewBox="0 0 ${
    config.width
  } ${calculatedHeight}">
  
  <!-- Terminal window -->
  <rect width="${config.width}" height="${calculatedHeight}" fill="${
    theme.windowBorder
  }" rx="6" ry="6" />
  <rect x="1" y="1" width="${config.width - 2}" height="${
    calculatedHeight - 2
  }" fill="${theme.bg}" rx="5" ry="5" />
  
  <!-- Terminal header -->
  <rect x="1" y="1" width="${config.width - 2}" height="${headerHeight}" fill="${
    theme.headerBg
  }" rx="5" ry="5" />
  
  <!-- Traffic lights -->
  <g transform="translate(20, ${headerHeight / 2})">
    <circle cx="0" cy="0" r="6" fill="#FF5F56" stroke="#E0443E" stroke-width="0.5" />
    <circle cx="20" cy="0" r="6" fill="#FFBD2E" stroke="#DEA123" stroke-width="0.5" />
    <circle cx="40" cy="0" r="6" fill="#27C93F" stroke="#1AAB29" stroke-width="0.5" />
  </g>
  
  <!-- Title -->
  <text x="${config.width / 2}" y="${
    headerHeight / 2 + 5
  }" text-anchor="middle" fill="${
    theme.titleText
  }" font-size="13" font-family="monospace" font-weight="bold">
    ${escapeXml(displayName)} — student profile
  </text>
  
  <!-- Command line -->
  <g transform="translate(${config.padding}, ${
    headerHeight + topBarHeight + 30
  })">
    <text font-size="14" font-family="monospace">
      <tspan fill="${theme.promptUser}">${escapeXml(username)}</tspan>
      <tspan fill="${theme.promptHost}">@42:</tspan>
      <tspan fill="${theme.promptPath}">~$</tspan>
      <tspan dx="8" fill="${theme.commandText}">whoami --all</tspan>
    </text>
  </g>`;

  // Basic Info Section
  const profileY = headerHeight + topBarHeight + commandHeight;
  const colPadding = config.padding;

  // Add section title
  svg += `
  <g transform="translate(${colPadding}, ${profileY + 30})">
    <text font-size="14" font-family="monospace">
      <tspan fill="${theme.sectionTitle}">/* Basic Information */</tspan>
    </text>
  </g>
  <line x1="${colPadding}" y1="${profileY + 40}" x2="${
    config.width - colPadding
  }" y2="${profileY + 40}" 
        stroke="${
          theme.tableBorder
        }" stroke-width="1" stroke-dasharray="2,1" opacity="0.5" />`;

  // Add basic info fields
  const leftColX = colPadding;
  const rightColX = Math.floor(config.width / 2) + 20;

  // Left Column Labels - unchanged
  const leftColLabels = [
    { label: "Login", value: username },
    { label: "Display Name", value: displayName },
    { label: "Email", value: userData.email || "N/A" },
    {
      label: "Created At",
      value: formatDate(userData.created_at || userData.createdAt),
    },
  ];

  // Right Column Labels - MODIFIED: Replaced "Active Status" with "Level"
  const rightColLabels = [
    {
      label: "Level",
      value: stats.level.toFixed(2),
      isHighlight: stats.level >= 10,
    },
    {
      label: "Correction Points",
      value: stats.correctionPoints.toString(),
      isHighlight: stats.correctionPoints > 10,
    },
    { label: "Wallet", value: stats.wallet.toString() },
    { label: "Account Age", value: `${stats.accountAge} days` },
  ];

  // Column widths for alignment
  const leftLabelWidth = 130;
  const rightLabelWidth = 170;

  // Render left column
  leftColLabels.forEach((item, index) => {
    const y = profileY + 80 + index * config.lineHeight;
    svg += `
    <g transform="translate(0, ${y})">
      <text font-size="13" font-family="monospace">
        <tspan x="${leftColX}" fill="${theme.labelText}">${item.label}:</tspan>
        <tspan x="${leftColX + leftLabelWidth}" fill="${
      item.isHighlight ? theme.valueHighlight : theme.valueText
    }">${escapeXml(item.value)}</tspan>
      </text>
    </g>`;
  });

  // Render right column
  rightColLabels.forEach((item, index) => {
    const y = profileY + 80 + index * config.lineHeight;
    svg += `
    <g transform="translate(0, ${y})">
      <text font-size="13" font-family="monospace">
        <tspan x="${rightColX}" fill="${theme.labelText}">${item.label}:</tspan>
        <tspan x="${rightColX + rightLabelWidth}" fill="${
      item.isHighlight ? theme.valueHighlight : theme.valueText
    }">${escapeXml(item.value)}</tspan>
      </text>
    </g>`;
  });

  // Stats Section
  const statsY = profileY + basicInfoHeight + 10;

  // Add section title
  svg += `
<g transform="translate(${colPadding}, ${statsY})">
  <text font-size="14" font-family="monospace">
    <tspan fill="${theme.sectionTitle}">/* Student Statistics */</tspan>
  </text>
</g>
<line x1="${colPadding}" y1="${statsY + 10}" x2="${
    config.width - colPadding
  }" y2="${statsY + 10}" 
      stroke="${
        theme.tableBorder
      }" stroke-width="1" stroke-dasharray="2,1" opacity="0.5" />`;

  // Projects stats (left column) - unchanged
  const projectsStats = [
    { label: "Total Projects", value: stats.totalProjects.toString() },
    {
      label: "Completed Projects",
      value: stats.completedProjects.toString(),
      isHighlight: true,
    },
    {
      label: "Failed Projects",
      value: stats.failedProjects.toString(),
      isWarning: true,
    },
    {
      label: "In Progress Projects",
      value: stats.inProgressProjects.toString(),
    },
  ];

  // Performance stats (right column)
  const performanceStats = [
    {
      label: "Average Project Mark",
      value: `${stats.averageMark}/100`,
      isHighlight: stats.averageMark >= 90,
    },
    {
      label: "Highest Project Mark",
      value: `${stats.highestMark}/100`,
      isHighlight: stats.highestMark >= 100,
    },
    { label: "Total Skills", value: stats.totalSkills.toString() },
    {
      label: "Average Skill Score",
      value: stats.skillsAverage.toFixed(2),
      isHighlight: stats.skillsAverage >= 7,
    },
  ];

  // Label widths for alignment
  const statsLabelWidth = 180;
  const rightStatsLabelWidth = 180;

  // Render project stats
  projectsStats.forEach((item, index) => {
    const y = statsY + 45 + index * config.lineHeight;
    const valueColor = item.isWarning
      ? theme.valueWarning
      : item.isHighlight
      ? theme.valueHighlight
      : theme.valueText;

    svg += `
  <g transform="translate(0, ${y})">
    <text font-size="13" font-family="monospace">
      <tspan x="${leftColX}" fill="${theme.labelText}">${item.label}:</tspan>
      <tspan x="${leftColX + statsLabelWidth}" fill="${valueColor}">${escapeXml(
      item.value
    )}</tspan>
    </text>
  </g>`;
  });

  // Render performance stats
  performanceStats.forEach((item, index) => {
    const y = statsY + 45 + index * config.lineHeight;
    const valueColor = item.isHighlight
      ? theme.valueHighlight
      : theme.valueText;

    svg += `
  <g transform="translate(0, ${y})">
    <text font-size="13" font-family="monospace">
      <tspan x="${rightColX}" fill="${theme.labelText}">${item.label}:</tspan>
      <tspan x="${
        rightColX + rightStatsLabelWidth
      }" fill="${valueColor}">${escapeXml(item.value)}</tspan>
    </text>
  </g>`;
  });

  // Coalition Section - unchanged
  if (coalition) {
    const coalitionY = statsY + statsHeight + 10;

    // Add section title
    svg += `
  <g transform="translate(${colPadding}, ${coalitionY})">
    <text font-size="14" font-family="monospace">
      <tspan fill="${theme.sectionTitle}">/* Coalition Information */</tspan>
    </text>
  </g>
  <line x1="${colPadding}" y1="${coalitionY + 10}" x2="${
      config.width - colPadding
    }" y2="${coalitionY + 10}" 
        stroke="${
          theme.tableBorder
        }" stroke-width="1" stroke-dasharray="2,1" opacity="0.5" />`;

    // Get coalition color
    let coalitionColor = coalition.color;
    if (!coalitionColor) {
      coalitionColor =
        theme.coalitionColor[coalitionName] || theme.coalitionColor["Default"];
    }

    // Display coalition info
    svg += `
  <g transform="translate(0, ${coalitionY + 45})">
    <text font-size="13" font-family="monospace">
      <tspan x="${leftColX}" fill="${theme.labelText}">Coalition:</tspan>
      <tspan x="${
        leftColX + statsLabelWidth
      }" fill="${coalitionColor}" font-weight="bold">${escapeXml(
      coalition.name || "None"
    )}</tspan>
    </text>
  </g>
  <g transform="translate(0, ${coalitionY + 45 + config.lineHeight})">
    <text font-size="13" font-family="monospace">
      <tspan x="${leftColX}" fill="${theme.labelText}">Coalition Score:</tspan>
      <tspan x="${leftColX + statsLabelWidth}" fill="${coalitionColor}">${
      coalition.score || 0
    }</tspan>
    </text>
  </g>`;
  }

  // Close the SVG tag properly
  svg += "\n</svg>";
  return svg;
}

/**
 * Generate terminal error message
 * GitHub-compatible version
 */
export function generateErrorSVG(message, themeName = "dark") {
  const errorWidth = 500;
  const errorHeight = 200;
  const theme = THEMES[themeName] || THEMES.dark;

  // GitHub-compatible SVG (removed XML declaration)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${errorWidth}" height="${errorHeight}" viewBox="0 0 ${errorWidth} ${errorHeight}">
<!-- Terminal window -->
<rect width="${errorWidth}" height="${errorHeight}" fill="${
    theme.windowBorder
  }" rx="6" ry="6" />
<rect x="1" y="1" width="${errorWidth - 2}" height="${
    errorHeight - 2
  }" fill="${theme.bg}" rx="5" ry="5" />

<!-- Terminal header -->
<rect x="1" y="1" width="${errorWidth - 2}" height="36" fill="${
    theme.headerBg
  }" rx="5" ry="5" />

<!-- Traffic lights -->
<circle cx="20" cy="18" r="6" fill="#FF5F56" stroke="#E0443E" stroke-width="0.5" />
<circle cx="40" cy="18" r="6" fill="#FFBD2E" stroke="#DEA123" stroke-width="0.5" />
<circle cx="60" cy="18" r="6" fill="#27C93F" stroke="#1AAB29" stroke-width="0.5" />

<text x="${errorWidth / 2}" y="22" text-anchor="middle" fill="${
    theme.titleText
  }" font-size="13" font-family="monospace" font-weight="bold">
  error — bash
</text>

<!-- Command prompt -->
<text x="15" y="60" font-size="14" font-family="monospace">
  <tspan fill="${theme.promptUser}">user</tspan>
  <tspan fill="${theme.promptHost}">@42:</tspan>
  <tspan fill="${theme.promptPath}">~$</tspan>
  <tspan dx="8" fill="${theme.commandText}">whoami --all</tspan>
</text>

<!-- Error message -->
<rect x="15" y="75" width="${errorWidth - 30}" height="50" rx="0" ry="0" 
      fill="${
        themeName === "dark"
          ? "rgba(255, 123, 114, 0.1)"
          : "rgba(207, 34, 46, 0.1)"
      }" 
      stroke="${theme.valueError}" stroke-width="1" stroke-opacity="0.3" />

<text x="25" y="105" font-size="14" fill="${
    theme.valueError
  }" font-family="monospace">
  <tspan>error: ${escapeXml(message)}</tspan>
</text>

<!-- Return code -->
<text x="15" y="150" font-size="14" font-family="monospace">
  <tspan fill="${theme.promptUser}">user</tspan>
  <tspan fill="${theme.promptHost}">@42:</tspan>
  <tspan fill="${theme.promptPath}">~$</tspan>
  <tspan dx="8" fill="${theme.commandText}">echo $?</tspan>
</text>

<text x="15" y="175" font-size="14" fill="${
    theme.commandText
  }" font-family="monospace">
  <tspan>1</tspan>
</text>
</svg>`;
}

export default {
  generateTerminalStudent,
  generateErrorSVG,
};
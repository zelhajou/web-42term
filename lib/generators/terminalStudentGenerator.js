/**
 * Terminal Student Generator with Level Display
 * Modified to correctly display the user's 42 level
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

// SVG definitions for terminal styling
const getSvgDefs = (themeName) => {
  const theme = THEMES[themeName] || THEMES.dark;
  return `
  <defs>
    <pattern id="scanlines" patternUnits="userSpaceOnUse" width="100%" height="2" patternTransform="rotate(0)">
      <rect width="100%" height="1" fill="#000" fill-opacity="0.04" />
    </pattern>
    <filter id="noise" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" stitchTiles="stitch" result="noise"/>
      <feColorMatrix type="matrix" values="0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.05 0" result="coloredNoise"/>
      <feComposite operator="in" in2="SourceGraphic" in="coloredNoise" result="monoNoise"/>
      <feBlend in="SourceGraphic" in2="monoNoise" mode="multiply"/>
    </filter>
    <filter id="window-shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.3" flood-color="#000000" />
    </filter>
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
    level: 0,
  };

  // PRIORITY 1: Check for directly injected level value first (most reliable)
  if (
    studentData.directLevelValue &&
    typeof studentData.directLevelValue === "number"
  ) {
    stats.level = studentData.directLevelValue;
    console.log(`Using directLevelValue: ${stats.level}`);
  }
  // PRIORITY 2: Check cursus_users data
  else if (
    studentData.cursus_users &&
    Array.isArray(studentData.cursus_users)
  ) {
    // Log all cursus data for debugging
    console.log(
      `${studentData.login} - Available cursus:`,
      studentData.cursus_users.map(
        (c) =>
          `${c.cursus?.name || "Unknown"} (${c.cursus?.id || "Unknown"}): ${
            c.level
          }`
      )
    );

    // Try to find 42cursus (exact match)
    const mainCursus = studentData.cursus_users.find(
      (c) => c.cursus?.name === "42cursus"
    );

    if (mainCursus && typeof mainCursus.level === "number") {
      stats.level = mainCursus.level;
      console.log(`Using 42cursus level: ${stats.level}`);
    }
    // Try with variant spelling
    else {
      const altCursus = studentData.cursus_users.find(
        (c) =>
          c.cursus?.name === "42 Cursus" ||
          c.cursus?.name === "42 cursus" ||
          c.cursus?.name?.toLowerCase().includes("42")
      );

      if (altCursus && typeof altCursus.level === "number") {
        stats.level = altCursus.level;
        console.log(`Using alt cursus level: ${stats.level}`);
      }
      // Try by ID (21 = main curriculum)
      else {
        const cursusById = studentData.cursus_users.find(
          (c) => c.cursus?.id === 21
        );

        if (cursusById && typeof cursusById.level === "number") {
          stats.level = cursusById.level;
          console.log(`Using cursus ID 21 level: ${stats.level}`);
        }
        // Fallback: highest level from any cursus
        else if (studentData.cursus_users.length > 0) {
          // Sort by level descending
          const sortedByLevel = [...studentData.cursus_users].sort(
            (a, b) => (b.level || 0) - (a.level || 0)
          );

          stats.level = sortedByLevel[0].level || 0;
          console.log(
            `Using highest level: ${stats.level} from ${
              sortedByLevel[0].cursus?.name || "Unknown"
            }`
          );
        }
      }
    }
  }

  // Process projects
  if (studentData.projects_users && Array.isArray(studentData.projects_users)) {
    // Get non-piscine projects
    const nonPiscineProjects = studentData.projects_users.filter((p) => {
      if (!p.cursus_ids || !Array.isArray(p.cursus_ids)) return true;
      return !p.cursus_ids.includes(9);
    });

    // Count projects by status
    const completedProjects = nonPiscineProjects.filter(
      (p) =>
        p.status === "finished" &&
        (p.validated === true || p["validated?"] === true) &&
        p.final_mark !== null
    );

    const failedProjects = nonPiscineProjects.filter(
      (p) =>
        p.status === "finished" &&
        (p.validated === false || p["validated?"] === false)
    );

    const inProgressProjects = nonPiscineProjects.filter(
      (p) => p.status === "in_progress"
    );

    // Set project counts
    stats.completedProjects = completedProjects.length;
    stats.failedProjects = failedProjects.length;
    stats.inProgressProjects = inProgressProjects.length;
    stats.totalProjects = nonPiscineProjects.length;

    // Calculate marks for completed projects
    if (completedProjects.length > 0) {
      const marks = completedProjects
        .map((p) => p.final_mark || 0)
        .filter((m) => m > 0);

      stats.highestMark = Math.max(...marks, 0);
      stats.averageMark =
        marks.length > 0
          ? Math.round((marks.reduce((a, b) => a + b, 0) / marks.length) * 10) /
            10
          : 0;
    }
  }

  // Process skills
  let allSkills = [];

  // From nested skills structure
  if (studentData.skills && typeof studentData.skills === "object") {
    Object.values(studentData.skills).forEach((skillsArray) => {
      if (Array.isArray(skillsArray)) {
        allSkills.push(...skillsArray);
      }
    });
  }

  // From cursus_users
  if (studentData.cursus_users && Array.isArray(studentData.cursus_users)) {
    for (const cursus of studentData.cursus_users) {
      if (cursus.skills && Array.isArray(cursus.skills)) {
        allSkills.push(...cursus.skills);
      }
    }
  }

  // Count unique skills
  const uniqueSkillIds = new Set();
  allSkills.forEach((skill) => {
    if (skill.id) uniqueSkillIds.add(skill.id);
    else if (skill.name) uniqueSkillIds.add(skill.name);
  });

  stats.totalSkills = uniqueSkillIds.size;

  if (allSkills.length > 0) {
    stats.skillsAverage =
      Math.round(
        (allSkills.reduce((sum, skill) => sum + (skill.level || 0), 0) /
          allSkills.length) *
          100
      ) / 100;
  }

  // Calculate account age
  const createdAt = userData.created_at || userData.createdAt;
  if (createdAt) {
    const createdDate = new Date(createdAt);
    const now = new Date();
    stats.accountAge = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
  }

  // Final check - if level is still 0, try to extract from studentData.level
  if (stats.level === 0 && typeof studentData.level === "number") {
    stats.level = studentData.level;
  }

  console.log(`Final level for ${userData.login}: ${stats.level}`);
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

  // Calculate layout dimensions - preserving original dimensions
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

  // Start building SVG
  let svg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${
    config.width
  }" height="${calculatedHeight}" viewBox="0 0 ${
    config.width
  } ${calculatedHeight}">
  ${getSvgDefs(themeName)}
  
  <!-- Terminal window -->
  <rect width="${config.width}" height="${calculatedHeight}" fill="${
    theme.windowBorder
  }" rx="6" ry="6" filter="url(#window-shadow)" />
  <rect x="1" y="1" width="${config.width - 2}" height="${
    calculatedHeight - 2
  }" fill="${theme.bg}" rx="5" ry="5" />
  
  <!-- Terminal header -->
  <rect x="1" y="1" width="${
    config.width - 2
  }" height="${headerHeight}" fill="${theme.headerBg}" rx="5" ry="5" />
  
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
  }" font-size="13" class="terminal-font" font-weight="bold">
    ${escapeXml(displayName)} — student profile
  </text>
  
  <!-- Command line -->
  <g transform="translate(${config.padding}, ${
    headerHeight + topBarHeight + 30
  })">
    <text font-size="14" class="terminal-font">
      <tspan fill="${theme.promptUser}">${escapeXml(username)}</tspan>
      <tspan fill="${theme.promptHost}">@42:</tspan>
      <tspan fill="${theme.promptPath}">~$</tspan>
      <tspan dx="8" fill="${theme.commandText}">whoami --all</tspan>
      <tspan class="cursor-blink" fill="${
        theme.promptUser
      }" filter="url(#cursor-glow)">▋</tspan>
    </text>
  </g>`;

  // Basic Info Section
  const profileY = headerHeight + topBarHeight + commandHeight;
  const colPadding = config.padding;

  // Add section title
  svg += `
  <g transform="translate(${colPadding}, ${profileY + 30})">
    <text font-size="14" class="terminal-font">
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
      <text font-size="13" class="terminal-font">
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
      <text font-size="13" class="terminal-font">
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
  <text font-size="14" class="terminal-font">
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
    <text font-size="13" class="terminal-font">
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
    <text font-size="13" class="terminal-font">
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
    <text font-size="14" class="terminal-font">
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
    <text font-size="13" class="terminal-font">
      <tspan x="${leftColX}" fill="${theme.labelText}">Coalition:</tspan>
      <tspan x="${
        leftColX + statsLabelWidth
      }" fill="${coalitionColor}" font-weight="bold">${escapeXml(
      coalition.name || "None"
    )}</tspan>
    </text>
  </g>
  <g transform="translate(0, ${coalitionY + 45 + config.lineHeight})">
    <text font-size="13" class="terminal-font">
      <tspan x="${leftColX}" fill="${theme.labelText}">Coalition Score:</tspan>
      <tspan x="${leftColX + statsLabelWidth}" fill="${coalitionColor}">${
      coalition.score || 0
    }</tspan>
    </text>
  </g>`;
  }


  return svg;
}

/**
 * Generate terminal error message
 */
export function generateErrorSVG(message, themeName = "dark") {
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
<rect width="${errorWidth}" height="${errorHeight}" fill="${
    theme.windowBorder
  }" rx="6" ry="6" filter="url(#window-shadow)" />
<rect x="1" y="1" width="${errorWidth - 2}" height="${errorHeight - 2}" fill="${
    theme.bg
  }" rx="5" ry="5" />

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
  }" font-size="13" class="terminal-font" font-weight="bold">
  error — bash
</text>

<!-- Command prompt -->
<text x="15" y="60" font-size="14" class="terminal-font">
  <tspan fill="${theme.promptUser}">user</tspan>
  <tspan fill="${theme.promptHost}">@42:</tspan>
  <tspan fill="${theme.promptPath}">~$</tspan>
  <tspan dx="8" fill="${theme.commandText}">whoami --all</tspan>
  <tspan class="cursor" dx="4">|</tspan>
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
  }" class="terminal-font">
  <tspan>error: ${escapeXml(message)}</tspan>
</text>

<!-- Return code -->
<text x="15" y="150" font-size="14" class="terminal-font">
  <tspan fill="${theme.promptUser}">user</tspan>
  <tspan fill="${theme.promptHost}">@42:</tspan>
  <tspan fill="${theme.promptPath}">~$</tspan>
  <tspan dx="8" fill="${theme.commandText}">echo $?</tspan>
</text>

<text x="15" y="175" font-size="14" fill="${
    theme.commandText
  }" class="terminal-font">
  <tspan>1</tspan>
</text>

<!-- Terminal effects -->
<rect x="1" y="1" width="${errorWidth - 2}" height="${
    errorHeight - 2
  }" rx="5" ry="5" fill="url(#scanlines)" fill-opacity="0.5" />
<rect x="0" y="0" width="${errorWidth}" height="${errorHeight}" fill="transparent" filter="url(#noise)" rx="6" ry="6" opacity="0.2" />
</svg>`;
}

export default {
  generateTerminalStudent,
  generateErrorSVG,
};

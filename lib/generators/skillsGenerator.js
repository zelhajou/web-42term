import themes, { getSkillColor } from '../themes';

/**
 * Generate an SVG bars widget for student skills
 */
export function generateSkillsBars(studentData, themeName = 'dark') {
  const theme = themes[themeName] || themes.dark;
  
  // Calculate SVG dimensions
  const cursusCount = Object.keys(studentData.skills || {}).length;
  if (cursusCount === 0) {
    return generateErrorSVG('No skills data available', themeName);
  }
  
  const maxSkillsPerCursus = Math.max(
    ...Object.values(studentData.skills).map(skills => skills.length || 0),
    1
  );
  
  const width = 800;
  const skillHeight = 30;
  const cursusHeight = 50 + (skillHeight * maxSkillsPerCursus) + 20;
  let height = 100 + (cursusHeight * cursusCount);
  
  // Min height
  height = Math.max(height, 300);
  
  let svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <style>
      text {
        font-family: ${theme.fontFamily};
      }
    </style>
    <rect width="${width}" height="${height}" fill="${theme.colors.background}" rx="10" ry="10" />
    <text x="40" y="50" font-size="24" font-weight="bold" fill="${theme.colors.text}">
      ${studentData.displayName || studentData.login}'s 42 Skills
    </text>
    <text x="40" y="75" font-size="14" fill="${theme.colors.textSecondary}" opacity="0.8">
      42 School Programming Skills Visualization
    </text>
  `;
  
  let yOffset = 100;
  
  // Generate cursus sections
  Object.entries(studentData.skills || {}).forEach(([cursusName, skills]) => {
    // Cursus container
    svg += `
      <rect x="40" y="${yOffset}" width="${width - 80}" height="${50 + (skillHeight * skills.length)}" 
        fill="${theme.colors.cardBackground}" rx="5" ry="5" />
      <text x="60" y="${yOffset + 30}" font-size="18" font-weight="bold" fill="${theme.colors.text}">
        ${cursusName}
      </text>
    `;
    
    // Skills bars
    yOffset += 50;
    skills.forEach((skill) => {
      const barWidth = (width - 160) * (skill.level / 10);
      
      svg += `
        <text x="60" y="${yOffset + 15}" font-size="14" fill="${theme.colors.text}">
          ${skill.name}
        </text>
        <text x="${width - 80}" y="${yOffset + 15}" font-size="14" text-anchor="end" fill="${theme.colors.text}">
          ${skill.level.toFixed(2)}/10.00
        </text>
        <rect x="60" y="${yOffset + 20}" width="${width - 160}" height="8" fill="${theme.colors.progressBg}" rx="4" ry="4" />
        <rect x="60" y="${yOffset + 20}" width="${barWidth}" height="8" fill="${getSkillColor(skill.level, themeName)}" rx="4" ry="4" />
      `;
      
      yOffset += skillHeight;
    });
    
    yOffset += 20;
  });
  
  // Add footer
  svg += `
    <text x="${width / 2}" y="${height - 20}" font-size="12" text-anchor="middle" fill="${theme.colors.textSecondary}">
      42widgets
    </text>
  `;
  
  svg += `</svg>`;
  
  return svg;
}

/**
 * Generate an error SVG
 */
export function generateErrorSVG(message, themeName = 'dark') {
  const theme = themes[themeName] || themes.dark;
  const width = 800;
  const height = 400;
  
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <style>
      text {
        font-family: ${theme.fontFamily};
      }
    </style>
    <rect width="${width}" height="${height}" fill="${theme.colors.background}" rx="10" ry="10" />
    <text x="${width/2}" y="${height/2 - 20}" font-size="24" font-weight="bold" fill="${theme.colors.danger}" text-anchor="middle">
      Error
    </text>
    <text x="${width/2}" y="${height/2 + 20}" font-size="18" fill="${theme.colors.text}" text-anchor="middle">
      ${message}
    </text>
    <text x="${width/2}" y="${height - 40}" font-size="14" fill="${theme.colors.textSecondary}" text-anchor="middle">
      Please check the username and try again.
    </text>
  </svg>
  `;
}

export default {
  generateSkillsBars,
  generateErrorSVG
};
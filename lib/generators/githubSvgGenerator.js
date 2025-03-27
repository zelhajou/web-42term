import themes, { getSkillColor } from '../themes';

/**
 * Escape special characters for XML/SVG
 */
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function(c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

/**
 * Generate a GitHub-compatible SVG widget
 * This creates a simpler SVG that should work better with GitHub's Camo proxy
 */
export function generateGithubCompatibleSvg(studentData, themeName = 'dark') {
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
  
  // XML declaration and DOCTYPE
  let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${theme.colors.background}" rx="10" ry="10" />
  <text x="40" y="50" font-size="24" font-weight="bold" fill="${theme.colors.text}" style="font-family: Arial, sans-serif;">
    ${escapeXml(studentData.displayName || studentData.login)}'s 42 Skills
  </text>
  <text x="40" y="75" font-size="14" fill="${theme.colors.textSecondary}" style="font-family: Arial, sans-serif;">
    42 School Programming Skills Visualization
  </text>
`;
  
  let yOffset = 100;
  
  // Generate cursus sections
  Object.entries(studentData.skills || {}).forEach(([cursusName, skills]) => {
    // Cursus container
    svg += `<rect x="40" y="${yOffset}" width="${width - 80}" height="${50 + (skillHeight * skills.length)}" 
      fill="${theme.colors.cardBackground}" rx="5" ry="5" />
    <text x="60" y="${yOffset + 30}" font-size="18" font-weight="bold" fill="${theme.colors.text}" style="font-family: Arial, sans-serif;">
      ${escapeXml(cursusName)}
    </text>
`;
    
    // Skills bars
    yOffset += 50;
    skills.forEach((skill) => {
      const barWidth = (width - 160) * (skill.level / 10);
      
      svg += `<text x="60" y="${yOffset + 15}" font-size="14" fill="${theme.colors.text}" style="font-family: Arial, sans-serif;">
      ${escapeXml(skill.name)}
    </text>
    <text x="${width - 80}" y="${yOffset + 15}" font-size="14" text-anchor="end" fill="${theme.colors.text}" style="font-family: Arial, sans-serif;">
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
  svg += `<text x="${width / 2}" y="${height - 20}" font-size="12" text-anchor="middle" fill="${theme.colors.textSecondary}" style="font-family: Arial, sans-serif;">
    42widgets
  </text>
</svg>`;
  
  return svg;
}

/**
 * Generate an error SVG
 */
export function generateErrorSVG(message, themeName = 'dark') {
  const theme = themes[themeName] || themes.dark;
  const width = 800;
  const height = 400;
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${theme.colors.background}" rx="10" ry="10" />
  <text x="${width/2}" y="${height/2 - 20}" font-size="24" font-weight="bold" fill="${theme.colors.danger}" text-anchor="middle" style="font-family: Arial, sans-serif;">
    Error
  </text>
  <text x="${width/2}" y="${height/2 + 20}" font-size="18" fill="${theme.colors.text}" text-anchor="middle" style="font-family: Arial, sans-serif;">
    ${escapeXml(message)}
  </text>
  <text x="${width/2}" y="${height - 40}" font-size="14" fill="${theme.colors.textSecondary}" text-anchor="middle" style="font-family: Arial, sans-serif;">
    Please check the username and try again.
  </text>
</svg>`;
}

export default {
  generateGithubCompatibleSvg,
  generateErrorSVG
};
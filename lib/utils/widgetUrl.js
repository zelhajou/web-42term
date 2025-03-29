// lib/utils/widgetUrl.js

/**
 * Build a widget URL with specified parameters
 * @param {Object} options - Configuration options for the widget URL
 * @param {string} options.username - 42 username
 * @param {string} options.widgetType - Widget type (skills, projects, etc.)
 * @param {string} options.theme - Widget theme (dark, light)
 * @param {number} options.width - Widget width in pixels
 * @param {number} options.maxSkills - Maximum number of skills to display
 * @param {string} options.baseUrl - Base URL for the widget (defaults to current origin)
 * @returns {string} The complete widget URL
 */
export function buildWidgetUrl({
    username,
    widgetType = 'skills',
    theme = 'dark',
    width,
    maxSkills,
    baseUrl
  }) {
    if (!username) {
      throw new Error('Username is required to build a widget URL');
    }
    
    // Get base URL (current origin or provided baseUrl)
    const base = baseUrl || (typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://42term.vercel.app');
    
    // Build the URL - only theme is required parameter
    let url = `${base}/api/widget/${widgetType}/${encodeURIComponent(username)}?theme=${theme}`;
    
    // Only add optional parameters if explicitly provided and valid
    if (width && !isNaN(width) && width > 0) {
      url += `&width=${width}`;
    }
    
    // Only add maxSkills if explicitly provided and valid
    // This is crucial - we don't want to accidentally limit skills
    if (maxSkills && !isNaN(maxSkills) && maxSkills > 0) {
      url += `&maxSkills=${maxSkills}`;
    }
    
    return url;
  }
  
  /**
   * Generate sharing formats for a widget
   * @param {Object} options - Same options as buildWidgetUrl
   * @returns {Object} Different sharing formats
   */
  export function generateSharingFormats(options) {
    const widgetUrl = buildWidgetUrl(options);
    const { username, widgetType = 'skills' } = options;
    
    return {
      markdown: `![${username}'s 42 ${widgetType}](${widgetUrl})`,
      html: `<img src="${widgetUrl}" alt="${username}'s 42 ${widgetType}" />`,
      url: widgetUrl,
      bbcode: `[img]${widgetUrl}[/img]`,
      html_linked: `<a href="https://profile.intra.42.fr/users/${username}" target="_blank"><img src="${widgetUrl}" alt="${username}'s 42 ${widgetType}" /></a>`,
      markdown_linked: `[![${username}'s 42 ${widgetType}](${widgetUrl})](https://profile.intra.42.fr/users/${username})`,
    };
  }
  
  export default {
    buildWidgetUrl,
    generateSharingFormats
  };
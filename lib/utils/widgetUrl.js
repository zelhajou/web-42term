/**
 * Utility functions to build widget URLs with various parameters
 * This can be used throughout the application for consistent URL generation
 */

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
      : 'https://42widgets.vercel.app');
    
    // Build the URL
    let url = `${base}/api/widget/${widgetType}/${encodeURIComponent(username)}?theme=${theme}`;
    
    // Add optional parameters
    if (width && !isNaN(width)) {
      url += `&width=${width}`;
    }
    
    if (maxSkills && !isNaN(maxSkills)) {
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
  
  /**
   * Build a documentation URL with preset examples
   * @param {Object} options - Configuration options similar to buildWidgetUrl
   * @returns {string} Documentation URL with examples
   */
  export function buildWidgetDocsUrl(options) {
    const { username } = options;
    const baseWidgetUrl = buildWidgetUrl(options);
    
    // Default example options to showcase in docs
    const exampleOptions = [
      { name: 'Dark Theme', params: '' },
      { name: 'Light Theme', params: 'theme=light' },
      { name: 'Custom Width (600px)', params: 'width=600' },
      { name: 'Top 5 Skills', params: 'maxSkills=5' },
      { name: 'Smaller Size', params: 'width=500&lineHeight=24' },
    ];
    
    // Build documentation URL
    let docsUrl = `/docs/widget?username=${encodeURIComponent(username)}`;
    docsUrl += `&baseUrl=${encodeURIComponent(baseWidgetUrl)}`;
    docsUrl += `&examples=${encodeURIComponent(JSON.stringify(exampleOptions))}`;
    
    return docsUrl;
  }
  
  export default {
    buildWidgetUrl,
    generateSharingFormats,
    buildWidgetDocsUrl
  };
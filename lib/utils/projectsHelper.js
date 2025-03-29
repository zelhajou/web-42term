// lib/utils/projectUtils.js

/**
 * Utilities for working with 42 project data
 */

/**
 * Map of cursus IDs to readable names
 */
export const CURSUS_NAMES = {
    9: 'C Piscine',
    21: 'Common Core',
    67: '42 Events'
  };
  
  /**
   * Get a human-readable name for a cursus ID
   * @param {number} cursusId - The cursus ID
   * @returns {string} The cursus name
   */
  export function getCursusName(cursusId) {
    return CURSUS_NAMES[cursusId] || `Cursus ${cursusId}`;
  }
  
  /**
   * Filter projects to get only valid completed ones
   * @param {Array} projects - Array of project objects from API
   * @param {Object} options - Filter options
   * @returns {Array} Filtered projects
   */
  export function getValidatedProjects(projects, options = {}) {
    const { includePiscine = false } = options;
    
    return projects.filter(project => {
      // Check if project is completed
      const isCompleted = 
        (project.status === 'finished') && 
        (project.validated === true || project['validated?'] === true) &&
        (project.final_mark !== null && project.final_mark > 0);
      
      // Check if it's a Piscine project
      const isPiscine = project.cursus_ids && project.cursus_ids.includes(9);
      
      // Include only completed projects, and filter Piscine projects if requested
      return isCompleted && (includePiscine || !isPiscine);
    });
  }
  
  /**
   * Sort projects by completion date (newest first)
   * @param {Array} projects - Array of project objects
   * @returns {Array} Sorted projects
   */
  export function sortProjectsByDate(projects) {
    return [...projects].sort((a, b) => {
      // Primary sort by marked_at date
      if (a.marked_at && b.marked_at) {
        return new Date(b.marked_at) - new Date(a.marked_at);
      }
      
      // Secondary sort by updated_at if marked_at not available
      if (a.updated_at && b.updated_at) {
        return new Date(b.updated_at) - new Date(a.updated_at);
      }
      
      // Tertiary sort by mark (highest first)
      return (b.final_mark || 0) - (a.final_mark || 0);
    });
  }
  
  /**
   * Prepare project data for display
   * @param {Object} project - Raw project object from API
   * @returns {Object} Processed project object
   */
  export function processProjectForDisplay(project) {
    // Get project name
    const name = project.project ? project.project.name : 'Unknown Project';
    
    // Get completion date
    const completionDate = project.marked_at || project.updated_at;
    
    // Get mark
    const mark = project.final_mark || 0;
    
    // Get team information
    const isTeam = project.teams && 
                  project.teams[0] && 
                  project.teams[0].users && 
                  project.teams[0].users.length > 1;
    
    const teamSize = isTeam ? project.teams[0].users.length : 1;
    
    // Get cursus information
    const cursusIds = project.cursus_ids || [];
    const cursusNames = cursusIds.map(id => getCursusName(id));
    
    // Return processed data
    return {
      id: project.id,
      name,
      mark,
      completionDate,
      isTeam,
      teamSize,
      cursusIds,
      cursusNames,
      status: project.status
    };
  }
  
  /**
   * Format date in a readable way
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  export function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  }
  
  export default {
    getCursusName,
    getValidatedProjects,
    sortProjectsByDate,
    processProjectForDisplay,
    formatDate
  };
  
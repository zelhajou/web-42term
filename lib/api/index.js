import axios from 'axios';

// Base API URLs
const API_URL = process.env.NEXT_PUBLIC_42_API_URL || "https://api.intra.42.fr/v2";
const TOKEN_URL = "https://api.intra.42.fr/oauth/token";
const CLIENT_ID = process.env.FT_CLIENT_ID;
const CLIENT_SECRET = process.env.FT_CLIENT_SECRET;

// Cache the token to avoid unnecessary requests
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get an authentication token from the 42 API
 */
export async function getToken() {
  // Check if we have a valid cached token
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing 42 API credentials:', { 
      clientIdExists: !!CLIENT_ID, 
      clientSecretExists: !!CLIENT_SECRET 
    });
    throw new Error('Missing 42 API credentials. Make sure FT_CLIENT_ID and FT_CLIENT_SECRET are set.');
  }
  
  try {
    console.log('Requesting token from 42 API...');
    const response = await axios.post(TOKEN_URL, {
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    // Cache the token and set expiry (subtract 5 minutes as safety margin)
    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 300000;
    console.log('Token obtained successfully');

    return cachedToken;
  } catch (error) {
    console.error('Error getting 42 API token:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error(`Failed to get 42 API token: ${error.message}`);
  }
}

/**
 * Make an authenticated request to the 42 API with retry logic
 */
export async function api42Request(endpoint, options = {}, retryCount = 0) {
  try {
    const token = await getToken();
    
    const response = await axios({
      url: `${API_URL}${endpoint}`,
      headers: { 
        Authorization: `Bearer ${token}`,
        ...options.headers
      },
      ...options
    });
    
    return response.data;
  } catch (error) {
    // Handle rate limiting with exponential backoff
    if (error.response && error.response.status === 429 && retryCount < 3) {
      console.warn(`Rate limited on ${endpoint}, retry attempt ${retryCount + 1}...`);
      
      // Calculate backoff time: 2^retry * 1000ms + random jitter
      const backoffTime = (Math.pow(2, retryCount) * 1000) + (Math.random() * 1000);
      
      // Wait for backoff time
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      
      // Retry the request
      return api42Request(endpoint, options, retryCount + 1);
    }
    
    // Enhanced error handling with clearer messages
    if (error.response) {
      if (error.response.status === 404) {
        const usernamePart = endpoint.includes('/users/') ? 
          endpoint.split('/users/')[1].split('/')[0] : 'User';
        throw new Error(`${usernamePart} not found. Please check the spelling.`);
      } else if (error.response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a minute.');
      } else if (error.response.status >= 500) {
        throw new Error('42 API service is currently unavailable. Please try again later.');
      }
    }
    
    console.error(`Error in API request ${endpoint}:`, error);
    throw new Error(`Failed API request: ${error.response?.status || ''} ${error.message}`);
  }
}

/**
 * Make a paginated request to the 42 API with automatic handling of multiple pages
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @param {number} perPage - Items per page
 * @returns {Promise<Array>} Combined results from all pages
 */
export async function api42PaginatedRequest(endpoint, options = {}, perPage = 100) {
  const allResults = [];
  let page = 1;
  let hasMoreData = true;
  
  while (hasMoreData) {
    console.log(`Fetching ${endpoint} page ${page}...`);
    
    // Add pagination parameters to the request
    const paginatedOptions = {
      ...options,
      params: {
        ...(options.params || {}),
        page,
        per_page: perPage
      }
    };
    
    try {
      // Make the API request for the current page
      const data = await api42Request(endpoint, paginatedOptions);
      
      if (Array.isArray(data) && data.length > 0) {
        // Add data from this page to the combined results
        allResults.push(...data);
        
        // Check if there might be more pages
        if (data.length < perPage) {
          hasMoreData = false;
        } else {
          page++;
        }
      } else {
        // No more data or empty response
        hasMoreData = false;
      }
    } catch (error) {
      console.error(`Error fetching page ${page} of ${endpoint}:`, error);
      // Stop pagination on error
      hasMoreData = false;
      
      // If we already have some results, return them instead of failing
      if (allResults.length > 0) {
        console.warn(`Returning ${allResults.length} items fetched before error occurred`);
        return allResults;
      }
      
      // If no results yet, rethrow the error
      throw error;
    }
  }
  
  console.log(`Completed pagination for ${endpoint}: ${allResults.length} total items`);
  return allResults;
}

/**
 * Fetch comprehensive student data in one call
 */
export async function fetchStudentData(username) {
  try {
    // Fetch student basic profile
    const userData = await api42Request(`/users/${username}`);
    const userId = userData.id;
    
    // Debug info - log environment variables availability
    console.log('Environment check:', {
      apiUrlExists: !!process.env.NEXT_PUBLIC_42_API_URL,
      clientIdExists: !!process.env.FT_CLIENT_ID,
      clientSecretExists: !!process.env.FT_CLIENT_SECRET
    });
    
    // Use paginated request for projects data to get ALL projects
    console.log(`Fetching all projects for user ${username} (ID: ${userId})...`);
    const projectsData = await api42PaginatedRequest(`/users/${userId}/projects_users`);
    console.log(`Successfully fetched ${projectsData.length} total projects`);
    
    // Make parallel request for coalition data (typically small, no pagination needed)
    const coalitionsData = await api42Request(`/users/${userId}/coalitions`).catch(() => []);
    
    // Process skills data
    const cursusData = userData.cursus_users || [];
    const skillsByCursus = {};
    
    for (const cursus of cursusData) {
      const cursusName = cursus.cursus?.name || 'Unknown Cursus';
      const skills = cursus.skills || [];
      skillsByCursus[cursusName] = skills;
    }
    
    // Process projects data
    const projects = {
      completed: [],
      inProgress: [],
      failed: []
    };
    
    for (const project of projectsData) {
      const projectInfo = {
        id: project.id,
        name: project.project?.name || 'Unknown Project',
        status: project.status,
        finalMark: project.final_mark,
        validatedAt: project.validated_at,
        markedAt: project["marked_at"],
        cursusName: project.cursus_ids?.length > 0 ? 
          project.cursus_ids[0] : 'Unknown Cursus'
      };
      
      if (project.status === 'finished' && (project.validated === true || project["validated?"] === true)) {
        projects.completed.push(projectInfo);
      } else if (project.status === 'in_progress') {
        projects.inProgress.push(projectInfo);
      } else {
        projects.failed.push(projectInfo);
      }
    }
    
    // Process coalition data
    let coalition = null;
    if (coalitionsData && coalitionsData.length > 0) {
      coalition = {
        id: coalitionsData[0].id,
        name: coalitionsData[0].name,
        slug: coalitionsData[0].slug,
        color: coalitionsData[0].color,
        score: coalitionsData[0].score,
        imageUrl: coalitionsData[0].image_url,
        coverUrl: coalitionsData[0].cover_url
      };
    }
    
    // Return compiled student data with ALL projects included in projects_users
    return {
      id: userData.id,
      login: userData.login,
      displayName: userData.displayname || userData.login,
      email: userData.email,
      image: userData.image?.link,
      location: userData.location,
      correctionPoints: userData.correction_point,
      wallet: userData.wallet,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
      skills: skillsByCursus,
      projects,
      projects_users: projectsData, // Now includes ALL projects from all pages
      coalition
    };
  } catch (error) {
    console.error('Error fetching student data:', error);
    
    // Enhanced error handling with clearer messages
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error(`Username '${username}' not found. Please check the spelling.`);
      } else if (error.response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a minute.');
      } else if (error.response.status >= 500) {
        throw new Error('42 API service is currently unavailable. Please try again later.');
      }
    }
    
    // Generic error with original message
    throw new Error(`Failed to fetch student data: ${error.message}`);
  }
}
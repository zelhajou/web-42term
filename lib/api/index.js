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
    
    console.error(`Error in API request ${endpoint}:`, error);
    throw new Error(`Failed API request: ${error.response?.status || ''} ${error.message}`);
  }
}

/**
 * Fetch comprehensive student data in one call
 */
export async function fetchStudentData(username) {
  try {
    // Fetch student basic profile
    const userData = await api42Request(`/users/${username}`);
    const userId = userData.id;
    
    // Make parallel requests for different data types
    const [projectsData, coalitionsData] = await Promise.all([
      api42Request(`/users/${userId}/projects_users`),
      api42Request(`/users/${userId}/coalitions`).catch(() => [])
    ]);
    
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
          project.cursus_ids[0].name : 'Unknown Cursus'
      };
      
      if (project.status === 'finished' && project.validated) {
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
    
    // Return compiled student data
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
      coalition
    };
  } catch (error) {
    console.error('Error fetching student data:', error);
    throw new Error(`Failed to fetch student data: ${error.message}`);
  }
}
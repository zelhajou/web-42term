const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const FT_CLIENT_ID = process.env.FT_CLIENT_ID || 'u-s4t2ud-3ea24e9ed293f8655a8d8da5a1baec9b372b9dd1c795a79e246436c7335c5dfe';
const FT_CLIENT_SECRET = process.env.FT_CLIENT_SECRET || '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';
const API_URL = process.env.NEXT_PUBLIC_42_API_URL || "https://api.intra.42.fr/v2";

// Function to get an OAuth token
async function getToken() {
  try {
    console.log('Requesting token...');
    
    const response = await axios.post('https://api.intra.42.fr/oauth/token', {
      grant_type: 'client_credentials',
      client_id: FT_CLIENT_ID,
      client_secret: FT_CLIENT_SECRET
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting token:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Function to make authenticated requests to the 42 API
async function apiRequest(endpoint, token, params = {}) {
  try {
    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: { 
        Authorization: `Bearer ${token}`
      },
      params
    });
    
    return response.data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Function to handle rate limiting with exponential backoff
async function rateHandledRequest(endpoint, token, params = {}, retryCount = 0) {
  try {
    return await apiRequest(endpoint, token, params);
  } catch (error) {
    if (error.response && error.response.status === 429 && retryCount < 5) {
      console.warn(`Rate limited on ${endpoint}, retry attempt ${retryCount + 1}...`);
      
      // Calculate backoff time: 2^retry * 1000ms + random jitter
      const backoffTime = (Math.pow(2, retryCount) * 1000) + (Math.random() * 1000);
      
      console.log(`Waiting for ${Math.round(backoffTime/1000)} seconds before retrying...`);
      // Wait for backoff time
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      
      // Retry the request
      return rateHandledRequest(endpoint, token, params, retryCount + 1);
    }
    
    throw error;
  }
}

// Function to fetch paginated data
async function fetchAllPages(endpoint, token, params = {}) {
  const allData = [];
  let page = 1;
  let hasMoreData = true;
  
  // Set a high per_page value to reduce number of requests
  const perPage = 100;
  
  while (hasMoreData) {
    console.log(`Fetching ${endpoint} - page ${page}...`);
    
    const pageParams = {
      ...params,
      page: page,
      per_page: perPage
    };
    
    const data = await rateHandledRequest(endpoint, token, pageParams);
    
    if (Array.isArray(data)) {
      allData.push(...data);
      
      // Check if we've reached the last page
      if (data.length < perPage) {
        hasMoreData = false;
      } else {
        page++;
      }
    } else {
      // If data is not an array, just return it
      return data;
    }
  }
  
  return allData;
}

// Main function to fetch student data and save it to a file
async function fetchAndSaveStudentData(username) {
  try {
    console.log(`Fetching comprehensive data for user: ${username}`);
    
    // Get API token
    const token = await getToken();
    console.log('Token obtained successfully');
    
    // Fetch basic user data
    console.log('Fetching user data...');
    const userData = await rateHandledRequest(`/users/${username}`, token);
    const userId = userData.id;
    
    // Create an object to store all the data
    const studentData = {
      basic_info: userData,
      projects: null,
      cursus: null,
      coalitions: null,
      achievements: null,
      campus: null,
      events: null,
      expertises: null,
      partnerships: null,
      patronages: null,
      scale_teams: null,
      titles: null,
      teams: null
    };
    
    // List of endpoints to fetch
    const endpoints = [
      { name: 'projects', path: `/users/${userId}/projects_users` },
      { name: 'cursus', path: `/users/${userId}/cursus_users` },
      { name: 'coalitions', path: `/users/${userId}/coalitions` },
      { name: 'achievements', path: `/users/${userId}/achievements` },
      { name: 'campus', path: `/users/${userId}/campus` },
      { name: 'events', path: `/users/${userId}/events` },
      { name: 'expertises', path: `/users/${userId}/expertises` },
      { name: 'partnerships', path: `/users/${userId}/partnerships` },
      { name: 'patronages', path: `/users/${userId}/patronages` },
      { name: 'scale_teams', path: `/users/${userId}/scale_teams` },
      { name: 'titles', path: `/users/${userId}/titles` },
      { name: 'teams', path: `/users/${userId}/teams` }
    ];
    
    // Fetch all endpoints with pagination support
    for (const endpoint of endpoints) {
      console.log(`Fetching ${endpoint.name} data...`);
      try {
        const data = await fetchAllPages(endpoint.path, token);
        studentData[endpoint.name] = data;
        console.log(`Successfully fetched ${data.length} ${endpoint.name} items`);
      } catch (error) {
        console.log(`Error fetching ${endpoint.name}: ${error.message}`);
        studentData[endpoint.name] = [];
      }
    }
    
    // Fetch additional data that might be useful
    try {
      console.log('Fetching skills data...');
      studentData.skills = await rateHandledRequest(`/users/${userId}/quests`, token);
    } catch (error) {
      console.log('Skills data not available or error fetching it');
      studentData.skills = [];
    }
    
    try {
      console.log('Fetching locations data...');
      studentData.locations = await fetchAllPages(`/users/${userId}/locations`, token);
    } catch (error) {
      console.log('Locations data not available or error fetching it');
      studentData.locations = [];
    }
    
    // Get project details for each project
    if (studentData.projects && studentData.projects.length > 0) {
      console.log('Fetching detailed project information...');
      
      const projectDetails = [];
      for (const userProject of studentData.projects) {
        if (userProject.project && userProject.project.id) {
          try {
            console.log(`Fetching details for project: ${userProject.project.name || userProject.project.id}`);
            const details = await rateHandledRequest(`/projects/${userProject.project.id}`, token);
            projectDetails.push(details);
          } catch (error) {
            console.log(`Error fetching details for project ${userProject.project.id}: ${error.message}`);
          }
        }
      }
      
      studentData.project_details = projectDetails;
    }
    
    // Add timestamps and save to JSON file
    studentData.metadata = {
      fetched_at: new Date().toISOString(),
      api_version: 'v2'
    };
    
    // Save to JSON file
    const filename = `${username}_comprehensive_data.json`;
    fs.writeFileSync(filename, JSON.stringify(studentData, null, 2));
    console.log(`\nComprehensive data saved to ${filename}`);
    
    // Print summary
    console.log('\nData Summary:');
    for (const key in studentData) {
      if (Array.isArray(studentData[key])) {
        console.log(`- ${key}: ${studentData[key].length} items`);
      } else if (key === 'basic_info') {
        console.log(`- User ID: ${studentData.basic_info.id}`);
        console.log(`- Login: ${studentData.basic_info.login}`);
        console.log(`- Display Name: ${studentData.basic_info.displayname}`);
      } else if (key === 'metadata') {
        console.log(`- Fetched at: ${studentData.metadata.fetched_at}`);
      }
    }
    
    return studentData;
  } catch (error) {
    console.error('Fatal Error:', error.message);
    process.exit(1);
  }
}

// Check if dotenv is installed, if not suggest installing it
try {
  require.resolve('dotenv');
} catch (e) {
  console.warn('Warning: dotenv package is not installed. You might need to install it:');
  console.warn('npm install dotenv');
  console.warn('------');
}

// Run the function with command-line arguments
const username = process.argv[2];
if (!username) {
  console.error('Please provide a username as a command-line argument');
  console.log('Example: node fetch-student-data.js zelhajou');
  process.exit(1);
}

// Log credentials being used (but mask part of the secret)
console.log('Using API configuration:');
console.log(`API URL: ${API_URL}`);
console.log(`Client ID: ${FT_CLIENT_ID}`);
const maskedSecret = FT_CLIENT_SECRET ? 
  `${FT_CLIENT_SECRET.substring(0, 5)}...${FT_CLIENT_SECRET.substring(FT_CLIENT_SECRET.length - 5)}` : 
  'Not provided';
console.log(`Client Secret: ${maskedSecret}`);

fetchAndSaveStudentData(username).catch(error => {
  console.error('Fatal error in main execution:', error);
  process.exit(1);
});
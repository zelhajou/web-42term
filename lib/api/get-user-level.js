#!/usr/bin/env node
const axios = require('axios');

// Configuration - hardcoded credentials
const API_URL = "https://api.intra.42.fr/v2";
const TOKEN_URL = "https://api.intra.42.fr/oauth/token";
const CLIENT_ID = "x";
const CLIENT_SECRET = "x";

/**
 * Get an authentication token from the 42 API
 */
async function getToken() {
  
  try {
    console.log('Requesting token from 42 API...');
    const response = await axios.post(TOKEN_URL, {
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    console.log('Token obtained successfully');
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting 42 API token:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error(`Failed to get 42 API token: ${error.message}`);
  }
}

/**
 * Make an authenticated request to the 42 API
 */
async function api42Request(endpoint, options = {}) {
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
    console.error(`Error in API request ${endpoint}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error(`Failed API request: ${error.response?.status || ''} ${error.message}`);
  }
}

/**
 * Get user level from 42 API
 * @param {string} username - 42 intra username
 * @returns {Promise<Object>} User level information for all cursus
 */
async function getUserLevel(username) {
  try {
    // Get user data
    const userData = await api42Request(`/users/${username}`);
    
    // Get cursus and level information
    const cursusData = userData.cursus_users || [];
    const levelInfo = {};
    
    // Process each cursus
    for (const cursus of cursusData) {
      const cursusName = cursus.cursus?.name || 'Unknown Cursus';
      const level = cursus.level;
      levelInfo[cursusName] = level;
    }
    
    return {
      username: userData.login,
      displayName: userData.displayname || userData.login,
      image: userData.image?.versions?.small,
      levels: levelInfo
    };
  } catch (error) {
    console.error(`Error getting level for user ${username}:`, error.message);
    throw error;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    // Get username from command line arguments
    const username = process.argv[2];
    if (!username) {
      console.error('Please provide a username as an argument');
      console.log('Usage: node get-user-level.js <username>');
      console.log('Example: node get-user-level.js jdoe');
      process.exit(1);
    }
    
    // Get and display user level
    const userInfo = await getUserLevel(username);
    
    console.log('\n=============================================');
    console.log(`User: ${userInfo.displayName} (${userInfo.username})`);
    console.log('=============================================');
    
    if (Object.keys(userInfo.levels).length === 0) {
      console.log('No cursus information found for this user');
    } else {
      console.log('LEVELS BY CURSUS:');
      console.log('---------------------------------------------');
      
      for (const [cursus, level] of Object.entries(userInfo.levels)) {
        console.log(`${cursus}: ${level.toFixed(2)}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script if directly executed
if (require.main === module) {
  main();
}

// Export for use as a module
module.exports = {
  getUserLevel
};
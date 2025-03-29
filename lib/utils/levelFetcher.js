// lib/utils/levelFetcher.js

import axios from 'axios';

// API configuration
const API_URL = process.env.NEXT_PUBLIC_42_API_URL || "https://api.intra.42.fr/v2";
const TOKEN_URL = "https://api.intra.42.fr/oauth/token";
const CLIENT_ID = process.env.FT_CLIENT_ID;
const CLIENT_SECRET = process.env.FT_CLIENT_SECRET;

// Keep the token in memory to avoid unnecessary requests
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get an authentication token from the 42 API
 */
async function getToken() {
  // Check if we have a valid cached token
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    console.log('LevelFetcher: Requesting token from 42 API...');
    const response = await axios.post(TOKEN_URL, {
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    // Cache the token and set expiry (subtract 5 minutes as safety margin)
    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 300000;
    console.log('LevelFetcher: Token obtained successfully');

    return cachedToken;
  } catch (error) {
    console.error('LevelFetcher: Error getting 42 API token:', error);
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
    console.error(`LevelFetcher: Error in API request ${endpoint}:`, error);
    throw new Error(`Failed API request: ${error.message}`);
  }
}

/**
 * Get user's 42cursus level from the API
 * @param {string} username - 42 username
 * @returns {Promise<number>} - User's level or 0 if not found
 */
export async function getUserLevel(username) {
  try {
    console.log(`LevelFetcher: Fetching level data for ${username}...`);
    
    // Direct endpoint to get only cursus_users data, which is more efficient
    const endpoint = `/users/${username}/cursus_users`;
    const cursusData = await api42Request(endpoint);
    
    if (!cursusData || !Array.isArray(cursusData)) {
      console.warn(`LevelFetcher: Invalid data format for ${username}`);
      return 0;
    }
    
    console.log(`LevelFetcher: Found ${cursusData.length} cursus entries for ${username}`);
    
    // Look specifically for 42cursus
    const mainCursus = cursusData.find(c => c.cursus?.name === '42cursus');
    if (mainCursus && typeof mainCursus.level === 'number') {
      console.log(`LevelFetcher: 42cursus level found: ${mainCursus.level}`);
      return mainCursus.level;
    }
    
    // Try with cursus ID 21 (42 cursus)
    const cursusById = cursusData.find(c => c.cursus?.id === 21);
    if (cursusById && typeof cursusById.level === 'number') {
      console.log(`LevelFetcher: Level found via cursus ID 21: ${cursusById.level}`);
      return cursusById.level;
    }
    
    // If no 42cursus found, use the highest level as fallback
    if (cursusData.length > 0) {
      const highestLevel = Math.max(...cursusData.map(c => c.level || 0));
      console.log(`LevelFetcher: Using highest level: ${highestLevel}`);
      return highestLevel;
    }
    
    console.warn(`LevelFetcher: No level data found for ${username}`);
    return 0;
  } catch (error) {
    console.error(`LevelFetcher: Error fetching level for ${username}:`, error);
    return 0; // Return 0 as default in case of error
  }
}

export default {
  getUserLevel
};